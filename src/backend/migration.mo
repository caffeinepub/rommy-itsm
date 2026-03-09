import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type UserRole = {
    #EndUser;
    #ITAgent;
    #Manager;
    #MasterAdmin;
  };

  type User = {
    principal : Principal.Principal;
    name : Text;
    role : UserRole;
    department : Text;
    createdAt : Time.Time;
  };

  type TicketType = {
    #Incident;
    #ServiceRequest;
  };

  type TicketStatus = {
    #Open;
    #InProgress;
    #Resolved;
    #Closed;
  };

  type TicketPriority = {
    #Low;
    #Medium;
    #High;
    #Critical;
  };

  type Ticket = {
    id : Nat;
    ticketType : TicketType;
    title : Text;
    description : Text;
    category : Text;
    priority : TicketPriority;
    status : TicketStatus;
    assigneeId : ?Principal.Principal;
    reporterId : Principal.Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [Comment];
  };

  type Comment = {
    id : Nat;
    authorId : Principal.Principal;
    text : Text;
    createdAt : Time.Time;
  };

  // New Phase 2 Types for Migration

  type ProblemStatus = {
    #Identified;
    #InAnalysis;
    #RootCauseFound;
    #Resolved;
    #Closed;
  };

  type ProblemRecord = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    priority : TicketPriority;
    status : ProblemStatus;
    linkedIncidentIds : [Nat];
    rootCause : ?Text;
    workaround : ?Text;
    assigneeId : ?Principal.Principal;
    reporterId : Principal.Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [Comment];
  };

  type ChangeType = {
    #Standard;
    #Normal;
    #Emergency;
  };

  type ChangeStatus = {
    #Draft;
    #SubmittedForApproval;
    #Approved;
    #Rejected;
    #InProgress;
    #Completed;
    #Cancelled;
  };

  type ImpactLevel = {
    #Low;
    #Medium;
    #High;
  };

  type RiskLevel = {
    #Low;
    #Medium;
    #High;
  };

  type ApprovalDecision = {
    #Approved;
    #Rejected;
  };

  type ApprovalRecord = {
    approverId : Principal.Principal;
    decision : ApprovalDecision;
    comment : ?Text;
    decidedAt : Time.Time;
  };

  type ChangeRequest = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    changeType : ChangeType;
    status : ChangeStatus;
    priority : TicketPriority;
    impact : ImpactLevel;
    risk : RiskLevel;
    approverIds : [Principal.Principal];
    approvals : [ApprovalRecord];
    assigneeId : ?Principal.Principal;
    requesterId : Principal.Principal;
    plannedStart : Time.Time;
    plannedEnd : ?Time.Time;
    actualStart : ?Time.Time;
    actualEnd : ?Time.Time;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [Comment];
  };

  type AssetType = {
    #Hardware;
    #Software;
    #Network;
    #Service;
    #Other;
  };

  type AssetStatus = {
    #Active;
    #Inactive;
    #Maintenance;
    #Retired;
    #Disposed;
  };

  type Asset = {
    id : Nat;
    name : Text;
    assetType : AssetType;
    status : AssetStatus;
    manufacturer : ?Text;
    model : ?Text;
    serialNumber : ?Text;
    assetTag : Text;
    location : ?Text;
    assignedTo : ?Principal.Principal;
    purchaseDate : ?Time.Time;
    warrantyExpiry : ?Time.Time;
    cost : ?Nat;
    description : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type OldActor = {
    users : Map.Map<Principal.Principal, User>;
    tickets : Map.Map<Nat, Ticket>;
    nextTicketId : Nat;
    nextCommentId : Nat;
    firstUserRegistered : Bool;
  };

  type NewActor = {
    users : Map.Map<Principal.Principal, User>;
    tickets : Map.Map<Nat, Ticket>;
    problems : Map.Map<Nat, ProblemRecord>;
    changes : Map.Map<Nat, ChangeRequest>;
    assets : Map.Map<Nat, Asset>;
    nextTicketId : Nat;
    nextCommentId : Nat;
    nextProblemId : Nat;
    nextChangeId : Nat;
    nextAssetId : Nat;
    firstUserRegistered : Bool;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      problems = Map.empty<Nat, ProblemRecord>();
      changes = Map.empty<Nat, ChangeRequest>();
      assets = Map.empty<Nat, Asset>();
      nextProblemId = 1;
      nextChangeId = 1;
      nextAssetId = 1;
    };
  };
};
