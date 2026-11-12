package io.emberhall.guild.web;

import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.security.CurrentUser;
import io.emberhall.guild.service.AiService;
import io.emberhall.guild.service.NotificationService;
import io.emberhall.guild.service.StatsService;
import io.emberhall.guild.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MemberController {

    private final UserService users;
    private final StatsService stats;
    private final NotificationService notifications;
    private final CurrentUser currentUser;
    private final AiService ai;
    private final io.emberhall.guild.service.AuthService auth;

    public MemberController(UserService users, StatsService stats, NotificationService notifications,
                            CurrentUser currentUser, AiService ai,
                            io.emberhall.guild.service.AuthService auth) {
        this.users = users;
        this.stats = stats;
        this.notifications = notifications;
        this.currentUser = currentUser;
        this.ai = ai;
        this.auth = auth;
    }

    @GetMapping("/artisans")
    public PageResponse<UserSummary> artisans(@RequestParam(required = false) String q,
                                              @RequestParam(required = false) String region,
                                              @RequestParam(required = false) String sort,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "12") int size) {
        return users.search(q, region, sort, page, size);
    }

    @GetMapping("/artisans/{handle}")
    public ArtisanProfile artisan(@PathVariable String handle) {
        return users.profile(handle);
    }

    @GetMapping("/artisans/{handle}/reviews")
    public List<ReviewResponse> reviews(@PathVariable String handle) {
        return users.reviewsFor(handle);
    }

    @PatchMapping("/users/me")
    public UserSummary update(@Valid @RequestBody UpdateProfileRequest req) {
        return auth.updateProfile(req);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return stats.dashboard();
    }

    @GetMapping("/notifications")
    public List<NotificationResponse> notifications() {
        return notifications.list(currentUser.require().getId());
    }

    @GetMapping("/notifications/unread-count")
    public Map<String, Long> unread() {
        return Map.of("count", notifications.unread(currentUser.require().getId()));
    }

    @PostMapping("/notifications/read-all")
    public SimpleResponse readAll() {
        notifications.markAllRead(currentUser.require().getId());
        return new SimpleResponse(true, "All ravens are read.");
    }

    @PostMapping("/ai/counsel")
    public AiResponse counsel(@RequestBody AiRequest req) {
        return ai.counsel(req);
    }

    @PostMapping("/ai/proposal")
    public AiResponse proposal(@RequestBody ProposalAiRequest req) {
        return ai.draftProposal(req);
    }

    @PostMapping("/ai/brief")
    public AiResponse brief(@RequestBody BriefAiRequest req) {
        return ai.draftBrief(req);
    }
}
