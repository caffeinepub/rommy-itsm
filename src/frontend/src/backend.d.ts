import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProblemFilter {
    status?: ProblemStatus;
    category?: string;
    priority?: TicketPriority;
}
export type Time = bigint;
export interface User {
    principal: Principal;
    name: string;
    createdAt: Time;
    role: UserRole;
    department: string;
}
export interface Comment {
    id: bigint;
    authorId: Principal;
    createdAt: Time;
    text: string;
}
export interface TicketFilter {
    status?: TicketStatus;
    assigneeId?: Principal;
    ticketType?: TicketType;
    priority?: TicketPriority;
}
export interface DashboardStats {
    incidentInProgress: bigint;
    serviceRequestInProgress: bigint;
    changeCompleted: bigint;
    serviceRequestResolved: bigint;
    incidentClosed: bigint;
    problemResolved: bigint;
    incidentResolved: bigint;
    totalResolved: bigint;
    problemOpen: bigint;
    totalOpen: bigint;
    changeInProgress: bigint;
    problemInAnalysis: bigint;
    assetInactive: bigint;
    totalInProgress: bigint;
    assetActive: bigint;
    changePendingApproval: bigint;
    assetMaintenance: bigint;
    serviceRequestClosed: bigint;
    totalClosed: bigint;
    serviceRequestOpen: bigint;
    incidentOpen: bigint;
}
export interface ChangeRequest {
    id: bigint;
    status: ChangeStatus;
    impact: ImpactLevel;
    plannedEnd?: Time;
    title: string;
    assigneeId?: Principal;
    changeType: ChangeType;
    createdAt: Time;
    risk: RiskLevel;
    description: string;
    approverIds: Array<Principal>;
    updatedAt: Time;
    category: string;
    plannedStart: Time;
    priority: TicketPriority;
    comments: Array<Comment>;
    actualEnd?: Time;
    approvals: Array<ApprovalRecord>;
    requesterId: Principal;
    actualStart?: Time;
}
export interface ApprovalRecord {
    decision: ApprovalDecision;
    approverId: Principal;
    comment?: string;
    decidedAt: Time;
}
export interface ChangeFilter {
    status?: ChangeStatus;
    changeType?: ChangeType;
    priority?: TicketPriority;
}
export interface AssetFilter {
    status?: AssetStatus;
    assignedTo?: Principal;
    assetType?: AssetType;
}
export interface Asset {
    id: bigint;
    status: AssetStatus;
    model?: string;
    manufacturer?: string;
    assignedTo?: Principal;
    purchaseDate?: Time;
    cost?: bigint;
    name: string;
    createdAt: Time;
    description?: string;
    updatedAt: Time;
    serialNumber?: string;
    warrantyExpiry?: Time;
    assetType: AssetType;
    assetTag: string;
    location?: string;
}
export interface Ticket {
    id: bigint;
    status: TicketStatus;
    title: string;
    assigneeId?: Principal;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    reporterId: Principal;
    ticketType: TicketType;
    category: string;
    priority: TicketPriority;
    comments: Array<Comment>;
}
export interface ProblemRecord {
    id: bigint;
    status: ProblemStatus;
    title: string;
    assigneeId?: Principal;
    linkedIncidentIds: Array<bigint>;
    createdAt: Time;
    description: string;
    workaround?: string;
    updatedAt: Time;
    reporterId: Principal;
    category: string;
    priority: TicketPriority;
    comments: Array<Comment>;
    rootCause?: string;
}
export interface UserProfile {
    name: string;
    createdAt: Time;
    role: UserRole;
    department: string;
}
export enum ApprovalDecision {
    Approved = "Approved",
    Rejected = "Rejected"
}
export enum AssetStatus {
    Disposed = "Disposed",
    Inactive = "Inactive",
    Active = "Active",
    Maintenance = "Maintenance",
    Retired = "Retired"
}
export enum AssetType {
    Network = "Network",
    Hardware = "Hardware",
    Software = "Software",
    Other = "Other",
    Service = "Service"
}
export enum ChangeStatus {
    Approved = "Approved",
    Draft = "Draft",
    Rejected = "Rejected",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
    SubmittedForApproval = "SubmittedForApproval",
    Completed = "Completed"
}
export enum ChangeType {
    Normal = "Normal",
    Emergency = "Emergency",
    Standard = "Standard"
}
export enum ImpactLevel {
    Low = "Low",
    High = "High",
    Medium = "Medium"
}
export enum ProblemStatus {
    InAnalysis = "InAnalysis",
    Closed = "Closed",
    RootCauseFound = "RootCauseFound",
    Identified = "Identified",
    Resolved = "Resolved"
}
export enum TicketPriority {
    Low = "Low",
    High = "High",
    Medium = "Medium",
    Critical = "Critical"
}
export enum TicketStatus {
    Open = "Open",
    Closed = "Closed",
    InProgress = "InProgress",
    Resolved = "Resolved"
}
export enum TicketType {
    ServiceRequest = "ServiceRequest",
    Incident = "Incident"
}
export enum UserRole {
    ITAgent = "ITAgent",
    Manager = "Manager",
    MasterAdmin = "MasterAdmin",
    EndUser = "EndUser"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(ticketId: bigint, text: string): Promise<bigint>;
    addCommentToChange(changeId: bigint, text: string): Promise<bigint>;
    addCommentToProblem(problemId: bigint, text: string): Promise<bigint>;
    approveChange(id: bigint, comment: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignTicket(id: bigint, assigneeId: Principal): Promise<void>;
    createAsset(name: string, assetType: AssetType, status: AssetStatus, manufacturer: string | null, model: string | null, serialNumber: string | null, assetTag: string, location: string | null, purchaseDate: Time | null, warrantyExpiry: Time | null, cost: bigint | null, description: string | null): Promise<bigint>;
    createChangeRequest(title: string, description: string, category: string, changeType: ChangeType, priority: TicketPriority, impact: ImpactLevel, risk: RiskLevel, approverIds: Array<Principal>, plannedStart: Time, plannedEnd: Time | null): Promise<bigint>;
    createProblem(title: string, description: string, category: string, priority: TicketPriority): Promise<bigint>;
    createTicket(ticketType: TicketType, title: string, description: string, category: string, priority: TicketPriority): Promise<bigint>;
    deleteAsset(id: bigint): Promise<void>;
    getAllUsers(): Promise<Array<User>>;
    getAsset(id: bigint): Promise<Asset>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getChangeRequest(id: bigint): Promise<ChangeRequest>;
    getDashboardStats(): Promise<DashboardStats>;
    getMyProfile(): Promise<User | null>;
    getProblem(id: bigint): Promise<ProblemRecord>;
    getTicket(id: bigint): Promise<Ticket>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAssets(filter: AssetFilter): Promise<Array<Asset>>;
    listChangeRequests(filter: ChangeFilter): Promise<Array<ChangeRequest>>;
    listProblems(filter: ProblemFilter): Promise<Array<ProblemRecord>>;
    listTickets(filter: TicketFilter): Promise<Array<Ticket>>;
    registerUser(name: string, department: string): Promise<void>;
    rejectChange(id: bigint, comment: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitChangeForApproval(id: bigint): Promise<void>;
    updateAsset(id: bigint, name: string, assetType: AssetType, status: AssetStatus, manufacturer: string | null, model: string | null, serialNumber: string | null, assetTag: string, location: string | null, assignedTo: Principal | null, purchaseDate: Time | null, warrantyExpiry: Time | null, cost: bigint | null, description: string | null): Promise<void>;
    updateAssetStatus(id: bigint, status: AssetStatus): Promise<void>;
    updateChangeStatus(id: bigint, status: ChangeStatus): Promise<void>;
    updateProblemDetails(id: bigint, title: string, description: string, rootCause: string | null, workaround: string | null, assigneeId: Principal | null, linkedIncidentIds: Array<bigint>): Promise<void>;
    updateProblemStatus(id: bigint, status: ProblemStatus): Promise<void>;
    updateTicketStatus(id: bigint, status: TicketStatus): Promise<void>;
    updateUserRole(userPrincipal: Principal, newRole: UserRole): Promise<void>;
}
