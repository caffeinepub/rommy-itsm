import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Comment {
    id: bigint;
    authorId: Principal;
    createdAt: Time;
    text: string;
}
export interface User {
    principal: Principal;
    name: string;
    createdAt: Time;
    role: UserRole;
    department: string;
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
export interface TicketFilter {
    status?: TicketStatus;
    assigneeId?: Principal;
    ticketType?: TicketType;
    priority?: TicketPriority;
}
export interface DashboardStats {
    incidentInProgress: bigint;
    serviceRequestInProgress: bigint;
    serviceRequestResolved: bigint;
    incidentClosed: bigint;
    incidentResolved: bigint;
    totalResolved: bigint;
    totalOpen: bigint;
    totalInProgress: bigint;
    serviceRequestClosed: bigint;
    totalClosed: bigint;
    serviceRequestOpen: bigint;
    incidentOpen: bigint;
}
export interface UserProfile {
    name: string;
    createdAt: Time;
    role: UserRole;
    department: string;
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
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignTicket(id: bigint, assigneeId: Principal): Promise<void>;
    createTicket(ticketType: TicketType, title: string, description: string, category: string, priority: TicketPriority): Promise<bigint>;
    getAllUsers(): Promise<Array<User>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getDashboardStats(): Promise<DashboardStats>;
    getMyProfile(): Promise<User | null>;
    getTicket(id: bigint): Promise<Ticket>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listTickets(filter: TicketFilter): Promise<Array<Ticket>>;
    registerUser(name: string, department: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTicketStatus(id: bigint, status: TicketStatus): Promise<void>;
    updateUserRole(userPrincipal: Principal, newRole: UserRole): Promise<void>;
}
