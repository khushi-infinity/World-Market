export type Role = "PATRON" | "ARTISAN" | "WARDEN";

export interface UserSummary {
  id: number;
  handle: string;
  name: string;
  role: Role;
  title: string;
  region: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  completedContracts: number;
  verified: boolean;
  avatarColor: string;
  location: string;
  joinedAt: string;
  balance: number;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  region: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
  budgetType: "FIXED" | "HOURLY";
  duration: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  featured: boolean;
  proposalsCount: number;
  createdAt: string;
  deadline: string | null;
  patron: UserSummary;
  mine: boolean;
  hasProposal: boolean;
}

export interface Proposal {
  id: number;
  jobId: number;
  jobTitle: string;
  artisan: UserSummary;
  coverLetter: string;
  bidAmount: number;
  days: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";
  aiDrafted: boolean;
  createdAt: string;
}

export type ContractStatus =
  | "AWAITING_FUNDING"
  | "FUNDED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "RELEASED"
  | "DISPUTED"
  | "CANCELLED";

export interface Contract {
  id: number;
  reference: string;
  jobId: number;
  jobTitle: string;
  jobDescription: string;
  jobSkills: string[];
  patron: UserSummary;
  artisan: UserSummary;
  amount: number;
  fee: number;
  total: number;
  status: ContractStatus;
  gateway: "PAYPAL" | "CROWN" | null;
  paypalOrderId: string | null;
  deliverableNote: string | null;
  deliverableUrl: string | null;
  disputeReason: string | null;
  createdAt: string;
  fundedAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  dueAt: string | null;
  conversationId: number | null;
  reviewed: boolean;
  patronSide: boolean;
}

export interface Message {
  id: number;
  conversationId: number;
  sender: UserSummary;
  body: string;
  system: boolean;
  createdAt: string;
}

export interface Conversation {
  id: number;
  contractId: number | null;
  contractReference: string | null;
  contractStatus: ContractStatus | null;
  subject: string;
  patron: UserSummary;
  artisan: UserSummary;
  other: UserSummary;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: "PROPOSAL" | "CONTRACT" | "PAYMENT" | "MESSAGE" | "REVIEW" | "SYSTEM";
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  patron: UserSummary;
  createdAt: string;
  contractReference: string;
}

export interface LedgerEntry {
  id: number;
  type: "ESCROW_HOLD" | "ESCROW_RELEASE" | "PLATFORM_FEE" | "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  description: string;
  contractReference: string | null;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  heldInVault: number;
  lifetimeEarned: number;
  entries: LedgerEntry[];
}

export interface Stats {
  artisans: number;
  openJobs: number;
  goldInVault: number;
  contractsSealed: number;
  avgRating: number;
  regions: number;
}

export interface PublicConfig {
  paypalClientId: string;
  paypalMode: string;
  paypalConfigured: boolean;
  currency: string;
  feePercent: number;
  aiConfigured: boolean;
  aiModel: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ArtisanProfile {
  artisan: UserSummary;
  bio: string;
  reviews: Review[];
  activeJobs: Job[];
  proposalsSent: number;
}

export interface Dashboard {
  user: UserSummary;
  activeContracts: number;
  openProposals: number;
  vaultHeld: number;
  walletBalance: number;
  contracts: Contract[];
  notifications: Notification[];
  recommendedJobs: Job[];
}

export interface AiResponse {
  text: string;
  live: boolean;
  model: string;
}

export interface PayPalFunding {
  paypalOrderId: string;
  approvalUrl: string;
  simulated: boolean;
  amount: number;
  currency: string;
}

export interface SimpleResponse {
  ok: boolean;
  message: string;
}

export interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
