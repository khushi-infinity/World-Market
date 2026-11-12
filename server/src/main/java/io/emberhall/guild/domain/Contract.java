package io.emberhall.guild.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User patron;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User artisan;

    @Column(nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal fee = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.ContractStatus status = Enums.ContractStatus.AWAITING_FUNDING;

    @Enumerated(EnumType.STRING)
    private Enums.Gateway gateway;

    private String paypalOrderId;

    private String paypalCaptureId;

    @Column(length = 4000)
    private String deliverableNote;

    private String deliverableUrl;

    private String disputeReason;

    private Instant createdAt = Instant.now();

    private Instant fundedAt;

    private Instant deliveredAt;

    private Instant releasedAt;

    private Instant dueAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public User getPatron() {
        return patron;
    }

    public void setPatron(User patron) {
        this.patron = patron;
    }

    public User getArtisan() {
        return artisan;
    }

    public void setArtisan(User artisan) {
        this.artisan = artisan;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public void setFee(BigDecimal fee) {
        this.fee = fee;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Enums.ContractStatus getStatus() {
        return status;
    }

    public void setStatus(Enums.ContractStatus status) {
        this.status = status;
    }

    public Enums.Gateway getGateway() {
        return gateway;
    }

    public void setGateway(Enums.Gateway gateway) {
        this.gateway = gateway;
    }

    public String getPaypalOrderId() {
        return paypalOrderId;
    }

    public void setPaypalOrderId(String paypalOrderId) {
        this.paypalOrderId = paypalOrderId;
    }

    public String getPaypalCaptureId() {
        return paypalCaptureId;
    }

    public void setPaypalCaptureId(String paypalCaptureId) {
        this.paypalCaptureId = paypalCaptureId;
    }

    public String getDeliverableNote() {
        return deliverableNote;
    }

    public void setDeliverableNote(String deliverableNote) {
        this.deliverableNote = deliverableNote;
    }

    public String getDeliverableUrl() {
        return deliverableUrl;
    }

    public void setDeliverableUrl(String deliverableUrl) {
        this.deliverableUrl = deliverableUrl;
    }

    public String getDisputeReason() {
        return disputeReason;
    }

    public void setDisputeReason(String disputeReason) {
        this.disputeReason = disputeReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getFundedAt() {
        return fundedAt;
    }

    public void setFundedAt(Instant fundedAt) {
        this.fundedAt = fundedAt;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public Instant getReleasedAt() {
        return releasedAt;
    }

    public void setReleasedAt(Instant releasedAt) {
        this.releasedAt = releasedAt;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public void setDueAt(Instant dueAt) {
        this.dueAt = dueAt;
    }
}
