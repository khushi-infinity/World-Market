package io.emberhall.guild.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "proposals")
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User artisan;

    @Column(nullable = false, length = 5000)
    private String coverLetter;

    @Column(nullable = false)
    private BigDecimal bidAmount = BigDecimal.ZERO;

    private int days = 7;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.ProposalStatus status = Enums.ProposalStatus.PENDING;

    private boolean aiDrafted = false;

    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public User getArtisan() {
        return artisan;
    }

    public void setArtisan(User artisan) {
        this.artisan = artisan;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public BigDecimal getBidAmount() {
        return bidAmount;
    }

    public void setBidAmount(BigDecimal bidAmount) {
        this.bidAmount = bidAmount;
    }

    public int getDays() {
        return days;
    }

    public void setDays(int days) {
        this.days = days;
    }

    public Enums.ProposalStatus getStatus() {
        return status;
    }

    public void setStatus(Enums.ProposalStatus status) {
        this.status = status;
    }

    public boolean isAiDrafted() {
        return aiDrafted;
    }

    public void setAiDrafted(boolean aiDrafted) {
        this.aiDrafted = aiDrafted;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
