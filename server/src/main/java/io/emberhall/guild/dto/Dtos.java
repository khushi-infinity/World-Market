package io.emberhall.guild.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class Dtos {

    private Dtos() {
    }

    public record UserSummary(
            Long id,
            String handle,
            String name,
            String role,
            String title,
            String region,
            List<String> skills,
            BigDecimal hourlyRate,
            double rating,
            int reviewsCount,
            int completedContracts,
            boolean verified,
            String avatarColor,
            String location,
            Instant joinedAt,
            BigDecimal balance
    ) {
    }

    public record AuthResponse(String token, UserSummary user) {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 80) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            String role,
            String title,
            String region,
            String handle
    ) {
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record UpdateProfileRequest(
            @Size(max = 80) String name,
            @Size(max = 120) String title,
            @Size(max = 3000) String bio,
            String region,
            @Size(max = 1000) String skills,
            BigDecimal hourlyRate,
            @Size(max = 120) String location
    ) {
    }

    public record JobRequest(
            @NotBlank @Size(max = 160) String title,
            @NotBlank @Size(min = 40, max = 6000) String description,
            @NotBlank String region,
            String skills,
            @NotNull BigDecimal budgetMin,
            @NotNull BigDecimal budgetMax,
            String budgetType,
            String duration
    ) {
    }

    public record JobResponse(
            Long id,
            String title,
            String description,
            String region,
            List<String> skills,
            BigDecimal budgetMin,
            BigDecimal budgetMax,
            String budgetType,
            String duration,
            String status,
            boolean featured,
            int proposalsCount,
            Instant createdAt,
            Instant deadline,
            UserSummary patron,
            boolean mine,
            boolean hasProposal
    ) {
    }

    public record ProposalRequest(
            @NotBlank @Size(min = 40, max = 5000) String coverLetter,
            @NotNull BigDecimal bidAmount,
            int days,
            boolean aiDrafted
    ) {
    }

    public record ProposalResponse(
            Long id,
            Long jobId,
            String jobTitle,
            UserSummary artisan,
            String coverLetter,
            BigDecimal bidAmount,
            int days,
            String status,
            boolean aiDrafted,
            Instant createdAt
    ) {
    }

    public record ContractResponse(
            Long id,
            String reference,
            Long jobId,
            String jobTitle,
            String jobDescription,
            List<String> jobSkills,
            UserSummary patron,
            UserSummary artisan,
            BigDecimal amount,
            BigDecimal fee,
            BigDecimal total,
            String status,
            String gateway,
            String paypalOrderId,
            String deliverableNote,
            String deliverableUrl,
            String disputeReason,
            Instant createdAt,
            Instant fundedAt,
            Instant deliveredAt,
            Instant releasedAt,
            Instant dueAt,
            Long conversationId,
            boolean reviewed,
            boolean patronSide
    ) {
    }

    public record MessageResponse(
            Long id,
            Long conversationId,
            UserSummary sender,
            String body,
            boolean system,
            Instant createdAt
    ) {
    }

    public record ConversationResponse(
            Long id,
            Long contractId,
            String contractReference,
            String contractStatus,
            String subject,
            UserSummary patron,
            UserSummary artisan,
            UserSummary other,
            String lastMessage,
            Instant lastMessageAt,
            long messageCount
    ) {
    }

    public record MessageRequest(@NotBlank @Size(max = 4000) String body) {
    }

    public record StartConversationRequest(@NotNull Long userId, String subject) {
    }

    public record NotificationResponse(
            Long id,
            String title,
            String body,
            String type,
            String link,
            boolean read,
            Instant createdAt
    ) {
    }

    public record ReviewResponse(
            Long id,
            int rating,
            String comment,
            UserSummary patron,
            Instant createdAt,
            String contractReference
    ) {
    }

    public record ReviewRequest(int rating, @Size(max = 2000) String comment) {
    }

    public record LedgerResponse(
            Long id,
            String type,
            BigDecimal amount,
            String description,
            String contractReference,
            Instant createdAt
    ) {
    }

    public record WalletResponse(
            BigDecimal balance,
            BigDecimal heldInVault,
            BigDecimal lifetimeEarned,
            List<LedgerResponse> entries
    ) {
    }

    public record StatsResponse(
            long artisans,
            long openJobs,
            BigDecimal goldInVault,
            long contractsSealed,
            double avgRating,
            long regions
    ) {
    }

    public record PublicConfig(
            String paypalClientId,
            String paypalMode,
            boolean paypalConfigured,
            String currency,
            int feePercent,
            boolean aiConfigured,
            String aiModel
    ) {
    }

    public record AiRequest(String prompt, String context, String mode) {
    }

    public record AiResponse(String text, boolean live, String model) {
    }

    public record ProposalAiRequest(Long jobId, String tone, String highlights) {
    }

    public record BriefAiRequest(String title, String notes, String region) {
    }

    public record CaptureRequest(@NotBlank String paypalOrderId) {
    }

    public record DeliverRequest(@NotBlank @Size(max = 4000) String note, String url) {
    }

    public record DisputeRequest(@NotBlank @Size(max = 1000) String reason) {
    }

    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
    }

    public record SimpleResponse(boolean ok, String message) {
    }

    public record ArtisanProfile(
            UserSummary artisan,
            String bio,
            List<ReviewResponse> reviews,
            List<JobResponse> activeJobs,
            long proposalsSent
    ) {
    }

    public record DashboardResponse(
            UserSummary user,
            long activeContracts,
            long openProposals,
            BigDecimal vaultHeld,
            BigDecimal walletBalance,
            List<ContractResponse> contracts,
            List<NotificationResponse> notifications,
            List<JobResponse> recommendedJobs
    ) {
    }
}
