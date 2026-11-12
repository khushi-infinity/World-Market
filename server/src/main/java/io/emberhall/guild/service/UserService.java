package io.emberhall.guild.service;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.Job;
import io.emberhall.guild.domain.User;
import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.repo.JobRepository;
import io.emberhall.guild.repo.ProposalRepository;
import io.emberhall.guild.repo.ReviewRepository;
import io.emberhall.guild.repo.UserRepository;
import io.emberhall.guild.security.CurrentUser;
import io.emberhall.guild.web.ApiException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository users;
    private final ReviewRepository reviews;
    private final JobRepository jobs;
    private final ProposalRepository proposals;
    private final CurrentUser currentUser;
    private final Mapper mapper;

    public UserService(UserRepository users, ReviewRepository reviews, JobRepository jobs,
                       ProposalRepository proposals, CurrentUser currentUser, Mapper mapper) {
        this.users = users;
        this.reviews = reviews;
        this.jobs = jobs;
        this.proposals = proposals;
        this.currentUser = currentUser;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserSummary> search(String q, String region, String sort, int page, int size) {
        Sort order = switch (sort == null ? "rating" : sort) {
            case "rate_low" -> Sort.by(Sort.Direction.ASC, "hourlyRate");
            case "rate_high" -> Sort.by(Sort.Direction.DESC, "hourlyRate");
            case "newest" -> Sort.by(Sort.Direction.DESC, "joinedAt");
            default -> Sort.by(Sort.Direction.DESC, "rating");
        };
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 48), order);
        Page<User> result = users.searchArtisans(Enums.Role.ARTISAN, blank(q), blank(region), pageable);
        return new PageResponse<>(result.getContent().stream().map(mapper::user).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public ArtisanProfile profile(String handle) {
        User artisan = users.findByHandleIgnoreCase(handle)
                .orElseThrow(() -> ApiException.notFound("No artisan by that name is recorded in the guild."));
        Long uid = currentUser.idOrNull();
        List<ReviewResponse> chronicles = reviews.findByArtisanIdOrderByCreatedAtDesc(artisan.getId())
                .stream().map(mapper::review).toList();
        List<Job> open = jobs.search(null, artisan.getRegion(), null, null, Enums.JobStatus.OPEN,
                PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        List<JobResponse> active = open.stream().map(j -> mapper.job(j, uid, false)).toList();
        return new ArtisanProfile(mapper.user(artisan), artisan.getBio(), chronicles, active,
                proposals.countByArtisanId(artisan.getId()));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> reviewsFor(String handle) {
        User artisan = users.findByHandleIgnoreCase(handle)
                .orElseThrow(() -> ApiException.notFound("No artisan by that name is recorded."));
        return reviews.findByArtisanIdOrderByCreatedAtDesc(artisan.getId()).stream().map(mapper::review).toList();
    }

    private String blank(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
