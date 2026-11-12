package io.emberhall.guild.domain;

public final class Enums {

    private Enums() {
    }

    public enum Role {
        PATRON,
        ARTISAN,
        WARDEN
    }

    public enum JobStatus {
        OPEN,
        IN_PROGRESS,
        COMPLETED,
        CLOSED
    }

    public enum ProposalStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        WITHDRAWN
    }

    public enum ContractStatus {
        AWAITING_FUNDING,
        FUNDED,
        IN_PROGRESS,
        DELIVERED,
        RELEASED,
        DISPUTED,
        CANCELLED
    }

    public enum Gateway {
        PAYPAL,
        CROWN
    }

    public enum LedgerType {
        ESCROW_HOLD,
        ESCROW_RELEASE,
        PLATFORM_FEE,
        DEPOSIT,
        WITHDRAWAL
    }

    public enum NotificationType {
        PROPOSAL,
        CONTRACT,
        PAYMENT,
        MESSAGE,
        REVIEW,
        SYSTEM
    }
}
