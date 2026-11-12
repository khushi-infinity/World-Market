package io.emberhall.guild.service;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.Job;
import io.emberhall.guild.domain.Proposal;
import io.emberhall.guild.domain.User;
import io.emberhall.guild.dto.Dtos.ProposalRequest;
import io.emberhall.guild.dto.Dtos.ProposalResponse;
import io.emberhall.guild.repo.JobRepository;
import io.emberhall.guild.repo.ProposalRepository;
import io.emberhall.guild.security.CurrentUser;
import io.emberhall.guild.web.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class ProposalService {

    private final ProposalRepository proposals;
    private final JobRepository jobs;
    private final CurrentUser currentUser;
    private final Mapper mapper;
    private final NotificationService notifications;

    public ProposalService(ProposalRepository proposals, JobRepository jobs, CurrentUser currentUser,
                           Mapper mapper, NotificationService notifications) {
        this.proposals = proposals;
        this.jobs = jobs;
        this.currentUser = currentUser;
        this.mapper = mapper;
        this.notifications = notifications;
    }

    @Transactional
    public ProposalResponse submit(Long jobId, ProposalRequest req) {
        User me = currentUser.require();
        if (me.getRole() != Enums.Role.ARTISAN) {
            throw ApiException.forbidden("Only artisans may swear a proposal. Join as an artisan to bid.");
        }
        Job job = jobs.findById(jobId).orElseThrow(() -> ApiException.notFound("No such decree is posted."));
        if (job.getPatron().getId().equals(me.getId())) {
            throw ApiException.badRequest("You cannot bid upon your own decree.");
        }
        if (job.getStatus() != Enums.JobStatus.OPEN) {
            throw ApiException.conflict("This decree is no longer open for proposals.");
        }
        if (proposals.findByJobIdAndArtisanId(jobId, me.getId()).isPresent()) {
            throw ApiException.conflict("Your proposal is already before this patron.");
        }
        if (req.bidAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw ApiException.badRequest("A bid must carry a sum greater than zero.");
        }

        Proposal p = new Proposal();
        p.setJob(job);
        p.setArtisan(me);
        p.setCoverLetter(req.coverLetter().trim());
        p.setBidAmount(req.bidAmount());
        p.setDays(req.days() <= 0 ? 7 : req.days());
        p.setAiDrafted(req.aiDrafted());
        p.setStatus(Enums.ProposalStatus.PENDING);
        p.setCreatedAt(Instant.now());
        proposals.save(p);

        job.setProposalsCount(job.getProposalsCount() + 1);
        jobs.save(job);

        notifications.notify(job.getPatron(), "A new proposal arrives",
                me.getName() + " has sworn a proposal for " + job.getTitle() + ".",
                Enums.NotificationType.PROPOSAL, "/jobs/" + job.getId());
        return mapper.proposal(p);
    }

    @Transactional
    public void withdraw(Long proposalId) {
        User me = currentUser.require();
        Proposal p = proposals.findById(proposalId)
                .orElseThrow(() -> ApiException.notFound("No such proposal exists."));
        if (!p.getArtisan().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the artisan who swore this proposal may withdraw it.");
        }
        if (p.getStatus() != Enums.ProposalStatus.PENDING) {
            throw ApiException.conflict("Only a pending proposal may be withdrawn.");
        }
        p.setStatus(Enums.ProposalStatus.WITHDRAWN);
        proposals.save(p);
        Job job = p.getJob();
        job.setProposalsCount(Math.max(0, job.getProposalsCount() - 1));
        jobs.save(job);
    }
}
