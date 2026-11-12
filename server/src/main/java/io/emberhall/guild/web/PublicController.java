package io.emberhall.guild.web;

import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.service.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PublicController {

    private final StatsService stats;
    private final PayPalService paypal;
    private final AiService ai;

    public PublicController(StatsService stats, PayPalService paypal, AiService ai) {
        this.stats = stats;
        this.paypal = paypal;
        this.ai = ai;
    }

    @GetMapping("/public/stats")
    public StatsResponse stats() {
        return stats.stats();
    }

    @GetMapping("/public/featured-jobs")
    public List<JobResponse> featuredJobs() {
        return stats.featuredJobs();
    }

    @GetMapping("/config")
    public PublicConfig config() {
        return new PublicConfig(
                paypal.isConfigured() ? paypal.clientId() : "",
                paypal.mode(),
                paypal.isConfigured(),
                paypal.currency(),
                paypal.feePercent(),
                ai.isLive(),
                ai.isLive() ? "groq" : "emberhall-oracle");
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "hall", "Emberhall");
    }
}
