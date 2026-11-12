package io.emberhall.guild.service;

import io.emberhall.guild.domain.*;
import io.emberhall.guild.dto.Dtos.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class Mapper {

    public static List<String> splitSkills(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public UserSummary user(User u) {
        if (u == null) {
            return null;
        }
        return new UserSummary(
                u.getId(), u.getHandle(), u.getName(), u.getRole().name(), u.getTitle(), u.getRegion(),
                splitSkills(u.getSkills()), u.getHourlyRate(), u.getRating(), u.getReviewsCount(),
                u.getCompletedContracts(), u.isVerified(), u.getAvatarColor(), u.getLocation(),
                u.getJoinedAt(), u.getBalance());
    }

    public JobResponse job(Job j, Long currentUserId, boolean hasProposal) {
        boolean mine = currentUserId != null && j.getPatron().getId().equals(currentUserId);
        return new JobResponse(
                j.getId(), j.getTitle(), j.getDescription(), j.getRegion(), splitSkills(j.getSkills()),
                j.getBudgetMin(), j.getBudgetMax(), j.getBudgetType(), j.getDuration(),
                j.getStatus().name(), j.isFeatured(), j.getProposalsCount(), j.getCreatedAt(),
                j.getDeadline(), user(j.getPatron()), mine, hasProposal);
    }

    public ProposalResponse proposal(Proposal p) {
        return new ProposalResponse(
                p.getId(), p.getJob().getId(), p.getJob().getTitle(), user(p.getArtisan()),
                p.getCoverLetter(), p.getBidAmount(), p.getDays(), p.getStatus().name(),
                p.isAiDrafted(), p.getCreatedAt());
    }

    public ContractResponse contract(Contract c, Long currentUserId, Long conversationId, boolean reviewed) {
        boolean patronSide = currentUserId != null && c.getPatron().getId().equals(currentUserId);
        return new ContractResponse(
                c.getId(), c.getReference(), c.getJob().getId(), c.getJob().getTitle(),
                c.getJob().getDescription(), splitSkills(c.getJob().getSkills()),
                user(c.getPatron()), user(c.getArtisan()), c.getAmount(), c.getFee(), c.getTotal(),
                c.getStatus().name(), c.getGateway() == null ? null : c.getGateway().name(),
                c.getPaypalOrderId(), c.getDeliverableNote(), c.getDeliverableUrl(), c.getDisputeReason(),
                c.getCreatedAt(), c.getFundedAt(), c.getDeliveredAt(), c.getReleasedAt(), c.getDueAt(),
                conversationId, reviewed, patronSide);
    }

    public MessageResponse message(Message m) {
        return new MessageResponse(
                m.getId(), m.getConversation().getId(), user(m.getSender()), m.getBody(),
                m.isSystem(), m.getCreatedAt());
    }

    public ConversationResponse conversation(Conversation c, Long currentUserId, String lastMessage,
                                             long messageCount) {
        User other = c.getPatron().getId().equals(currentUserId) ? c.getArtisan() : c.getPatron();
        return new ConversationResponse(
                c.getId(), c.getContract() == null ? null : c.getContract().getId(),
                c.getContract() == null ? null : c.getContract().getReference(),
                c.getContract() == null ? null : c.getContract().getStatus().name(),
                c.getSubject(), user(c.getPatron()), user(c.getArtisan()), user(other),
                lastMessage, c.getLastMessageAt(), messageCount);
    }

    public NotificationResponse notification(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getTitle(), n.getBody(), n.getType().name(), n.getLink(),
                n.isRead(), n.getCreatedAt());
    }

    public ReviewResponse review(Review r) {
        return new ReviewResponse(
                r.getId(), r.getRating(), r.getComment(), user(r.getPatron()), r.getCreatedAt(),
                r.getContract().getReference());
    }

    public LedgerResponse ledger(LedgerEntry e) {
        return new LedgerResponse(
                e.getId(), e.getType().name(), e.getAmount(), e.getDescription(),
                e.getContract() == null ? null : e.getContract().getReference(), e.getCreatedAt());
    }
}
