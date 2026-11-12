package io.emberhall.guild.service;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.Job;
import io.emberhall.guild.domain.Proposal;
import io.emberhall.guild.domain.User;
import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.repo.JobRepository;
import io.emberhall.guild.repo.ProposalRepository;
import io.emberhall.guild.repo.UserRepository;
import io.emberhall.guild.security.CurrentUser;
import io.emberhall.guild.web.ApiException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class JobService {

    private final JobRepository jobs;
    private final ProposalRepository proposals;
    private final UserRepository users;
    private final CurrentUser currentUser;
    private final Mapper mapper;

    public JobService(JobRepository jobs, ProposalRepository proposals, UserRepository users,
                      CurrentUser currentUser, Mapper mapper) {
        this.jobs = jobs;
        this.proposals = proposals;
        this.users = users;
        this.currentUser = currentUser;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> search(String q, String region, String type, BigDecimal min,
                                            String sort, int page, int size) {
        Long uid = currentUser.idOrNull();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 48), sortOf(sort));
        Page<Job> result = jobs.search(blankToNull(q), blankToNull(region), blankToNull(type), min,
                Enums.JobStatus.OPEN, pageable);
        List<JobResponse> content = result.getContent().stream().map(j -> {
            boolean has = uid != null && proposals.findByJobIdAndArtisanId(j.getId(), uid).isPresent();
            return mapper.job(j, uid, has);
        }).toList();
        return new PageResponse<>(content, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public JobResponse get(Long id) {
        Job job = require(id);
        Long uid = currentUser.idOrNull();
        boolean has = uid != null && proposals.findByJobIdAndArtisanId(job.getId(), uid).isPresent();
        return mapper.job(job, uid, has);
    }

    @Transactional(readOnly = true)
    public List<ProposalResponse> proposalsForJob(Long id) {
        User me = currentUser.require();
        Job job = require(id);
        List<Proposal> list;
        if (job.getPatron().getId().equals(me.getId())) {
            list = proposals.findByJobIdOrderByCreatedAtDesc(id);
        } else {
            list = proposals.findByJobIdAndArtisanId(id, me.getId()).stream().toList();
        }
        return list.stream().map(mapper::proposal).toList();
    }

    @Transactional
    public JobResponse create(JobRequest req) {
        User me = currentUser.require();
        if (me.getRole() == Enums.Role.ARTISAN) {
            throw ApiException.forbidden("Artisans swear oaths, they do not post decrees. Switch to a patron account.");
        }
        if (req.budgetMin().compareTo(req.budgetMax()) > 0) {
            throw ApiException.badRequest("The lower purse cannot exceed the upper purse.");
        }
        Job job = new Job();
        job.setPatron(me);
        job.setTitle(req.title().trim());
        job.setDescription(req.description().trim());
        job.setRegion(req.region());
        job.setSkills(normalizeSkills(req.skills()));
        job.setBudgetMin(req.budgetMin());
        job.setBudgetMax(req.budgetMax());
        job.setBudgetType("HOURLY".equalsIgnoreCase(req.budgetType()) ? "HOURLY" : "FIXED");
        job.setDuration(req.duration() == null || req.duration().isBlank() ? "30 days" : req.duration());
        job.setStatus(Enums.JobStatus.OPEN);
        job.setFeatured(false);
        job.setCreatedAt(Instant.now());
        job.setDeadline(Instant.now().plusSeconds(60L * 60 * 24 * 30));
        jobs.save(job);
        return mapper.job(job, me.getId(), false);
    }

    @Transactional
    public JobResponse update(Long id, JobRequest req) {
        User me = currentUser.require();
        Job job = require(id);
        if (!job.getPatron().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the patron who posted this decree may amend it.");
        }
        job.setTitle(req.title().trim());
        job.setDescription(req.description().trim());
        job.setRegion(req.region());
        job.setSkills(normalizeSkills(req.skills()));
        job.setBudgetMin(req.budgetMin());
        job.setBudgetMax(req.budgetMax());
        job.setBudgetType("HOURLY".equalsIgnoreCase(req.budgetType()) ? "HOURLY" : "FIXED");
        job.setDuration(req.duration());
        jobs.save(job);
        return mapper.job(job, me.getId(), false);
    }

    @Transactional
    public void close(Long id) {
        User me = currentUser.require();
        Job job = require(id);
        if (!job.getPatron().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the patron may close this decree.");
        }
        job.setStatus(Enums.JobStatus.CLOSED);
        jobs.save(job);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> myJobs() {
        User me = currentUser.require();
        return jobs.findByPatronIdOrderByCreatedAtDesc(me.getId()).stream()
                .map(j -> mapper.job(j, me.getId(), false)).toList();
    }

    @Transactional(readOnly = true)
    public List<ProposalResponse> myProposals() {
        User me = currentUser.require();
        return proposals.findByArtisanIdOrderByCreatedAtDesc(me.getId()).stream().map(mapper::proposal).toList();
    }

    @Transactional(readOnly = true)
    public List<JobResponse> featured() {
        Long uid = currentUser.idOrNull();
        return jobs.findTop4ByFeaturedTrueOrderByCreatedAtDesc().stream()
                .map(j -> mapper.job(j, uid, false)).toList();
    }

    public Job require(Long id) {
        return jobs.findById(id).orElseThrow(() -> ApiException.notFound("No such decree is posted in the hall."));
    }

    public User user(Long id) {
        return users.findById(id).orElseThrow(() -> ApiException.notFound("No such member of the guild."));
    }

    private Sort sortOf(String sort) {
        if (sort == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sort.toLowerCase(Locale.ROOT)) {
            case "budget_high" -> Sort.by(Sort.Direction.DESC, "budgetMax");
            case "budget_low" -> Sort.by(Sort.Direction.ASC, "budgetMin");
            case "proposals_low" -> Sort.by(Sort.Direction.ASC, "proposalsCount");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private String normalizeSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return "";
        }
        return String.join(", ", Mapper.splitSkills(skills));
    }
}
