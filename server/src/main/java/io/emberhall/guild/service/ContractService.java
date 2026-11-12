package io.emberhall.guild.service;

import io.emberhall.guild.domain.*;
import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.repo.*;
import io.emberhall.guild.security.CurrentUser;
import io.emberhall.guild.web.ApiException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ContractService {

    private final ContractRepository contracts;
    private final ProposalRepository proposals;
    private final JobRepository jobs;
    private final UserRepository users;
    private final ConversationRepository conversations;
    private final ReviewRepository reviews;
    private final LedgerEntryRepository ledger;
    private final CurrentUser currentUser;
    private final Mapper mapper;
    private final PayPalService paypal;
    private final ChatService chat;
    private final NotificationService notifications;
    private final SimpMessagingTemplate messaging;

    public ContractService(ContractRepository contracts, ProposalRepository proposals, JobRepository jobs,
                           UserRepository users, ConversationRepository conversations, ReviewRepository reviews,
                           LedgerEntryRepository ledger, CurrentUser currentUser, Mapper mapper,
                           PayPalService paypal, ChatService chat, NotificationService notifications,
                           SimpMessagingTemplate messaging) {
        this.contracts = contracts;
        this.proposals = proposals;
        this.jobs = jobs;
        this.users = users;
        this.conversations = conversations;
        this.reviews = reviews;
        this.ledger = ledger;
        this.currentUser = currentUser;
        this.mapper = mapper;
        this.paypal = paypal;
        this.chat = chat;
        this.notifications = notifications;
        this.messaging = messaging;
    }

    @Transactional
    public ContractResponse acceptProposal(Long proposalId) {
        User me = currentUser.require();
        Proposal p = proposals.findById(proposalId)
                .orElseThrow(() -> ApiException.notFound("No such proposal exists."));
        Job job = p.getJob();
        if (!job.getPatron().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the patron of this decree may accept a proposal.");
        }
        if (p.getStatus() != Enums.ProposalStatus.PENDING) {
            throw ApiException.conflict("This proposal has already been answered.");
        }
        if (job.getStatus() != Enums.JobStatus.OPEN) {
            throw ApiException.conflict("This decree is no longer open for oaths.");
        }

        p.setStatus(Enums.ProposalStatus.ACCEPTED);
        proposals.save(p);
        proposals.findByJobIdOrderByCreatedAtDesc(job.getId()).stream()
                .filter(other -> !other.getId().equals(p.getId()) && other.getStatus() == Enums.ProposalStatus.PENDING)
                .forEach(other -> other.setStatus(Enums.ProposalStatus.DECLINED));
        job.setStatus(Enums.JobStatus.IN_PROGRESS);
        jobs.save(job);

        BigDecimal amount = p.getBidAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal fee = amount.multiply(BigDecimal.valueOf(paypal.feePercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        Contract c = new Contract();
        c.setReference(reference());
        c.setJob(job);
        c.setPatron(me);
        c.setArtisan(p.getArtisan());
        c.setAmount(amount);
        c.setFee(fee);
        c.setTotal(amount.add(fee));
        c.setStatus(Enums.ContractStatus.AWAITING_FUNDING);
        c.setCreatedAt(Instant.now());
        c.setDueAt(Instant.now().plus(Math.max(p.getDays(), 1), ChronoUnit.DAYS));
        contracts.save(c);

        Conversation conv = new Conversation();
        conv.setContract(c);
        conv.setPatron(me);
        conv.setArtisan(p.getArtisan());
        conv.setSubject(job.getTitle());
        conv.setCreatedAt(Instant.now());
        conv.setLastMessageAt(Instant.now());
        conversations.save(conv);
        chat.systemMessage(conv, "The oath is sworn between " + me.getName() + " and " + p.getArtisan().getName()
                + ". The vault must be sealed before the work begins.");

        notifications.notify(p.getArtisan(), "Your oath is accepted",
                me.getName() + " accepted your proposal for " + job.getTitle() + ". The vault awaits its seal.",
                Enums.NotificationType.CONTRACT, "/contracts/" + c.getId());

        return toDto(c, me.getId());
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> list() {
        User me = currentUser.require();
        return contracts.findForUser(me.getId()).stream().map(c -> toDto(c, me.getId())).toList();
    }

    @Transactional(readOnly = true)
    public ContractResponse get(Long id) {
        User me = currentUser.require();
        return toDto(requireParticipant(id, me), me.getId());
    }

    @Transactional
    public Map<String, Object> createPayPalFunding(Long id) {
        User me = currentUser.require();
        Contract c = requireParticipant(id, me);
        if (!c.getPatron().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the patron may seal the vault.");
        }
        if (c.getStatus() != Enums.ContractStatus.AWAITING_FUNDING) {
            throw ApiException.conflict("This vault is already sealed or the contract has moved on.");
        }
        PayPalService.PayPalOrder order = paypal.createOrder(c.getTotal(), c.getReference(),
                "Emberhall escrow for " + c.getJob().getTitle());
        if (!order.simulated()) {
            c.setPaypalOrderId(order.id());
            contracts.save(c);
        }
        return Map.of(
                "paypalOrderId", order.id(),
                "approvalUrl", order.approvalUrl() == null ? "" : order.approvalUrl(),
                "simulated", order.simulated(),
                "amount", c.getTotal(),
                "currency", paypal.currency());
    }

    @Transactional
    public ContractResponse capturePayPalFunding(Long id, String paypalOrderId) {
        User me = currentUser.require();
        Contract c = requireParticipant(id, me);
        if (!c.getPatron().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the patron may seal the vault.");
        }
        if (c.getStatus() != Enums.ContractStatus.AWAITING_FUNDING) {
            return toDto(c, me.getId());
        }
        if (c.getPaypalOrderId() != null && !c.getPaypalOrderId().equals(paypalOrderId)) {
            throw ApiException.badRequest("This PayPal order does not match the vault on record.");
        }
        PayPalService.PayPalCapture capture = paypal.captureOrder(paypalOrderId);
        if (!"COMPLETED".equalsIgnoreCase(capture.status())) {
            throw ApiException.badRequest("PayPal did not complete this capture. The vault remains unsealed.");
        }
        c.setStatus(Enums.ContractStatus.FUNDED);
        c.setGateway(Enums.Gateway.PAYPAL);
        c.setPaypalOrderId(paypalOrderId);
        c.setPaypalCaptureId(capture.captureId());
        c.setFundedAt(Instant.now());
        contracts.save(c);

        recordHold(c);
        afterFunding(c);
        return toDto(c, me.getId());
    }

    @Transactional
    public ContractResponse fundWithCrown(Long id) {
        User me = currentUser.require();
        Contract c = requireParticipant(id, me);
        if (!c.getPatron().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the patron may seal the vault.");
        }
        if (c.getStatus() != Enums.ContractStatus.AWAITING_FUNDING) {
            throw ApiException.conflict("This vault is already sealed or the contract has moved on.");
        }
        c.setStatus(Enums.ContractStatus.FUNDED);
        c.setGateway(Enums.Gateway.CROWN);
        c.setPaypalCaptureId("CROWN-" + c.getReference());
        c.setFundedAt(Instant.now());
        contracts.save(c);
        recordHold(c);
        afterFunding(c);
        return toDto(c, me.getId());
    }

    @Transactional
    public ContractResponse deliver(Long id, String note, String url) {
        User me = currentUser.require();
        Contract c = requireParticipant(id, me);
        if (!c.getArtisan().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the artisan may deliver the work.");
        }
        if (c.getStatus() != Enums.ContractStatus.FUNDED && c.getStatus() != Enums.ContractStatus.IN_PROGRESS) {
            throw ApiException.conflict("The vault is not yet sealed, or the work is already delivered.");
        }
        c.setDeliverableNote(note.trim());
        c.setDeliverableUrl(url == null ? null : url.trim());
        c.setDeliveredAt(Instant.now());
        c.setStatus(Enums.ContractStatus.DELIVERED);
        contracts.save(c);

        notifications.notify(c.getPatron(), "Work is delivered",
                c.getArtisan().getName() + " has delivered " + c.getJob().getTitle() + ". Inspect it and break the seal.",
                Enums.NotificationType.CONTRACT, "/contracts/" + c.getId());
        Conversation conv = conversations.findByContractId(c.getId()).orElse(null);
        if (conv != null) {
            chat.systemMessage(conv, "The artisan has delivered the work. The patron now holds the seal.");
        }
        broadcast(c);
        return toDto(c, me.getId());
    }

    @Transactional
    public ContractResponse release(Long id) {
        User me = currentUser.require();
        Contract c = requireParticipant(id, me);
        if (!c.getPatron().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the patron may break the seal.");
        }
        if (c.getStatus() != Enums.ContractStatus.DELIVERED) {
            throw ApiException.conflict("The work must be delivered before the vault can be opened.");
        }
        c.setStatus(Enums.ContractStatus.RELEASED);
        c.setReleasedAt(Instant.now());
        contracts.save(c);

        User artisan = c.getArtisan();
        artisan.setBalance(artisan.getBalance().add(c.getAmount()));
        artisan.setCompletedContracts(artisan.getCompletedContracts() + 1);
        users.save(artisan);

        User patron = c.getPatron();
        patron.setCompletedContracts(patron.getCompletedContracts() + 1);
        users.save(patron);

        LedgerEntry pay = new LedgerEntry();
        pay.setUser(artisan);
        pay.setContract(c);
        pay.setType(Enums.LedgerType.ESCROW_RELEASE);
        pay.setAmount(c.getAmount());
        pay.setDescription("Escrow released for " + c.getReference());
        ledger.save(pay);

        LedgerEntry tithe = new LedgerEntry();
        tithe.setUser(patron);
        tithe.setContract(c);
        tithe.setType(Enums.LedgerType.PLATFORM_FEE);
        tithe.setAmount(c.getFee());
        tithe.setDescription("Guild tithe for " + c.getReference());
        ledger.save(tithe);

        Job job = c.getJob();
        job.setStatus(Enums.JobStatus.COMPLETED);
        jobs.save(job);

        notifications.notify(artisan, "The vault is opened",
                c.getAmount().toPlainString() + " " + paypal.currency() + " has been released to your purse.",
                Enums.NotificationType.PAYMENT, "/treasury");
        notifications.notify(patron, "The oath is fulfilled",
                "Your contract with " + artisan.getName() + " is sealed and complete. Leave a chronicle of the work.",
                Enums.NotificationType.CONTRACT, "/contracts/" + c.getId());

        Conversation conv = conversations.findByContractId(c.getId()).orElse(null);
        if (conv != null) {
            chat.systemMessage(conv, "The vault is opened. The oath is fulfilled, and the chronicle is complete.");
        }
        broadcast(c);
        return toDto(c, me.getId());
    }

    @Transactional
    public ContractResponse dispute(Long id, String reason) {
        User me = currentUser.require();
        Contract c = requireParticipant(id, me);
        if (c.getStatus() != Enums.ContractStatus.FUNDED && c.getStatus() != Enums.ContractStatus.IN_PROGRESS
                && c.getStatus() != Enums.ContractStatus.DELIVERED) {
            throw ApiException.conflict("This contract cannot be disputed in its current state.");
        }
        c.setStatus(Enums.ContractStatus.DISPUTED);
        c.setDisputeReason(reason.trim());
        contracts.save(c);

        User other = c.getPatron().getId().equals(me.getId()) ? c.getArtisan() : c.getPatron();
        notifications.notify(other, "A dispute is raised",
                me.getName() + " has raised a dispute on " + c.getReference() + ". A warden will review the matter.",
                Enums.NotificationType.CONTRACT, "/contracts/" + c.getId());
        Conversation conv = conversations.findByContractId(c.getId()).orElse(null);
        if (conv != null) {
            chat.systemMessage(conv, "A dispute is raised. The vault is frozen until a warden rules.");
        }
        broadcast(c);
        return toDto(c, me.getId());
    }

    @Transactional
    public ReviewResponse review(Long id, int rating, String comment) {
        User me = currentUser.require();
        Contract c = requireParticipant(id, me);
        if (!c.getPatron().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the patron may write a chronicle.");
        }
        if (c.getStatus() != Enums.ContractStatus.RELEASED) {
            throw ApiException.conflict("The oath must be fulfilled before a chronicle is written.");
        }
        if (reviews.existsByContractId(c.getId())) {
            throw ApiException.conflict("A chronicle already exists for this contract.");
        }
        if (rating < 1 || rating > 5) {
            throw ApiException.badRequest("A rating must fall between one and five stars.");
        }
        Review r = new Review();
        r.setContract(c);
        r.setPatron(me);
        r.setArtisan(c.getArtisan());
        r.setRating(rating);
        r.setComment(comment == null ? "" : comment.trim());
        r.setCreatedAt(Instant.now());
        reviews.save(r);

        User artisan = c.getArtisan();
        double total = artisan.getRating() * artisan.getReviewsCount() + rating;
        artisan.setReviewsCount(artisan.getReviewsCount() + 1);
        artisan.setRating(Math.round((total / artisan.getReviewsCount()) * 10.0) / 10.0);
        users.save(artisan);

        notifications.notify(artisan, "A chronicle is written",
                me.getName() + " left " + rating + " stars for " + c.getReference() + ".",
                Enums.NotificationType.REVIEW, "/artisans/" + artisan.getHandle());
        return mapper.review(r);
    }

    @Transactional(readOnly = true)
    public WalletResponse wallet() {
        User me = currentUser.require();
        List<Contract> mine = contracts.findForUser(me.getId());
        BigDecimal held = mine.stream()
                .filter(c -> c.getStatus() == Enums.ContractStatus.FUNDED
                        || c.getStatus() == Enums.ContractStatus.IN_PROGRESS
                        || c.getStatus() == Enums.ContractStatus.DELIVERED
                        || c.getStatus() == Enums.ContractStatus.DISPUTED)
                .map(Contract::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<LedgerEntry> entries = ledger.findTop50ByUserIdOrderByCreatedAtDesc(me.getId());
        BigDecimal earned = entries.stream()
                .filter(e -> e.getType() == Enums.LedgerType.ESCROW_RELEASE)
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new WalletResponse(me.getBalance(), held, earned,
                entries.stream().map(mapper::ledger).toList());
    }

    @Transactional
    public WalletResponse withdraw(BigDecimal amount) {
        User me = currentUser.require();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw ApiException.badRequest("The withdrawal sum must be greater than zero.");
        }
        if (amount.compareTo(me.getBalance()) > 0) {
            throw ApiException.badRequest("Your purse does not hold that much gold.");
        }
        me.setBalance(me.getBalance().subtract(amount));
        users.save(me);
        LedgerEntry e = new LedgerEntry();
        e.setUser(me);
        e.setType(Enums.LedgerType.WITHDRAWAL);
        e.setAmount(amount);
        e.setDescription("Withdrawal to the Iron Bank");
        ledger.save(e);
        return wallet();
    }

    private void recordHold(Contract c) {
        LedgerEntry hold = new LedgerEntry();
        hold.setUser(c.getPatron());
        hold.setContract(c);
        hold.setType(Enums.LedgerType.ESCROW_HOLD);
        hold.setAmount(c.getTotal());
        hold.setDescription("Vault sealed for " + c.getReference());
        ledger.save(hold);
    }

    private void afterFunding(Contract c) {
        notifications.notify(c.getArtisan(), "The vault is sealed",
                c.getPatron().getName() + " has sealed " + c.getTotal().toPlainString() + " "
                        + paypal.currency() + " in escrow. Begin the work.",
                Enums.NotificationType.PAYMENT, "/contracts/" + c.getId());
        Conversation conv = conversations.findByContractId(c.getId()).orElse(null);
        if (conv != null) {
            chat.systemMessage(conv, "The vault is sealed. The coin now waits for the work to be delivered.");
        }
        broadcast(c);
    }

    private void broadcast(Contract c) {
        messaging.convertAndSend("/topic/contracts/" + c.getId(), toDto(c, null));
    }

    private ContractResponse toDto(Contract c, Long uid) {
        Conversation conv = conversations.findByContractId(c.getId()).orElse(null);
        boolean reviewed = reviews.existsByContractId(c.getId());
        return mapper.contract(c, uid, conv == null ? null : conv.getId(), reviewed);
    }

    public Contract requireParticipant(Long id, User me) {
        Contract c = contracts.findById(id)
                .orElseThrow(() -> ApiException.notFound("No such contract is recorded in the vault."));
        if (!c.getPatron().getId().equals(me.getId()) && !c.getArtisan().getId().equals(me.getId())) {
            throw ApiException.forbidden("This contract belongs to another oath.");
        }
        return c;
    }

    private String reference() {
        for (int i = 0; i < 20; i++) {
            String candidate = "EH-" + Year.now().getValue() + "-"
                    + String.format("%04d", ThreadLocalRandom.current().nextInt(1, 9999));
            if (!contracts.existsByReference(candidate)) {
                return candidate;
            }
        }
        return "EH-" + System.currentTimeMillis();
    }
}
