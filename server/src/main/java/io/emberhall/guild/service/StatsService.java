package io.emberhall.guild.service;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.Job;
import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.repo.ContractRepository;
import io.emberhall.guild.repo.JobRepository;
import io.emberhall.guild.repo.ProposalRepository;
import io.emberhall.guild.repo.UserRepository;
import io.emberhall.guild.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StatsService {

    private final UserRepository users;
    private final JobRepository jobs;
    private final ContractRepository contracts;
    private final ProposalRepository proposals;
    private final CurrentUser currentUser;
    private final Mapper mapper;
    private final NotificationService notifications;

    public StatsService(UserRepository users, JobRepository jobs, ContractRepository contracts,
                        ProposalRepository proposals, CurrentUser currentUser, Mapper mapper,
                        NotificationService notifications) {
        this.users = users;
        this.jobs = jobs;
        this.contracts = contracts;
        this.proposals = proposals;
        this.currentUser = currentUser;
        this.mapper = mapper;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public StatsResponse stats() {
        BigDecimal vault = contracts.sumHeldInVault();
        double rating = users.averageRatingForRole(Enums.Role.ARTISAN);
        return new StatsResponse(
                users.countByRole(Enums.Role.ARTISAN),
                jobs.countByStatus(Enums.JobStatus.OPEN),
                vault == null ? BigDecimal.ZERO : vault,
                contracts.countByStatus(Enums.ContractStatus.RELEASED),
                Math.round(rating * 10.0) / 10.0,
                6);
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        var me = currentUser.require();
        List<ContractResponse> mine = contracts.findForUser(me.getId()).stream()
                .map(c -> mapper.contract(c, me.getId(), null, false))
                .toList();
        long active = mine.stream()
                .filter(c -> !"RELEASED".equals(c.status()) && !"CANCELLED".equals(c.status()))
                .count();
        BigDecimal held = mine.stream()
                .filter(c -> "FUNDED".equals(c.status()) || "IN_PROGRESS".equals(c.status())
                        || "DELIVERED".equals(c.status()) || "DISPUTED".equals(c.status()))
                .map(ContractResponse::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long openProposals = me.getRole() == Enums.Role.ARTISAN
                ? proposals.countByArtisanIdAndStatus(me.getId(), Enums.ProposalStatus.PENDING)
                : 0;

        List<JobResponse> recommended = jobs.findTop6ByStatusOrderByCreatedAtDesc(Enums.JobStatus.OPEN)
                .stream()
                .filter(j -> !j.getPatron().getId().equals(me.getId()))
                .limit(4)
                .map(j -> mapper.job(j, me.getId(), false))
                .toList();

        return new DashboardResponse(
                mapper.user(me), active, openProposals, held, me.getBalance(),
                mine.stream().limit(6).toList(),
                notifications.list(me.getId()).stream().limit(6).toList(),
                recommended);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> featuredJobs() {
        Long uid = currentUser.idOrNull();
        return jobs.findTop4ByFeaturedTrueOrderByCreatedAtDesc().stream()
                .map(j -> mapper.job(j, uid, false)).toList();
    }
}
