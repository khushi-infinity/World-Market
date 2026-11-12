package io.emberhall.guild.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User patron;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 6000)
    private String description;

    @Column(nullable = false)
    private String region;

    @Column(length = 1000)
    private String skills;

    private BigDecimal budgetMin = BigDecimal.ZERO;

    private BigDecimal budgetMax = BigDecimal.ZERO;

    @Column(nullable = false)
    private String budgetType = "FIXED";

    private String duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.JobStatus status = Enums.JobStatus.OPEN;

    private boolean featured = false;

    private int proposalsCount = 0;

    private Instant createdAt = Instant.now();

    private Instant deadline;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getPatron() {
        return patron;
    }

    public void setPatron(User patron) {
        this.patron = patron;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public BigDecimal getBudgetMin() {
        return budgetMin;
    }

    public void setBudgetMin(BigDecimal budgetMin) {
        this.budgetMin = budgetMin;
    }

    public BigDecimal getBudgetMax() {
        return budgetMax;
    }

    public void setBudgetMax(BigDecimal budgetMax) {
        this.budgetMax = budgetMax;
    }

    public String getBudgetType() {
        return budgetType;
    }

    public void setBudgetType(String budgetType) {
        this.budgetType = budgetType;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public Enums.JobStatus getStatus() {
        return status;
    }

    public void setStatus(Enums.JobStatus status) {
        this.status = status;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public int getProposalsCount() {
        return proposalsCount;
    }

    public void setProposalsCount(int proposalsCount) {
        this.proposalsCount = proposalsCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getDeadline() {
        return deadline;
    }

    public void setDeadline(Instant deadline) {
        this.deadline = deadline;
    }
}
