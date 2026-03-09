import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // Old types (from existing backend)
  type OldTicketType = {
    #Incident;
    #ServiceRequest;
  };

  type OldTicketStatus = {
    #Open;
    #InProgress;
    #Resolved;
    #Closed;
  };

  type OldTicketPriority = {
    #Low;
    #Medium;
    #High;
    #Critical;
  };

  type OldComment = {
    id : Nat;
    authorId : Principal;
    text : Text;
    createdAt : Time.Time;
  };

  type OldTicket = {
    id : Nat;
    ticketType : OldTicketType;
    title : Text;
    description : Text;
    category : Text;
    priority : OldTicketPriority;
    status : OldTicketStatus;
    assigneeId : ?Principal;
    reporterId : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [OldComment];
  };

  type OldProblemStatus = {
    #Identified;
    #InAnalysis;
    #RootCauseFound;
    #Resolved;
    #Closed;
  };

  type OldProblemRecord = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    priority : OldTicketPriority;
    status : OldProblemStatus;
    linkedIncidentIds : [Nat];
    rootCause : ?Text;
    workaround : ?Text;
    assigneeId : ?Principal;
    reporterId : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [OldComment];
  };

  type OldChangeType = {
    #Standard;
    #Normal;
    #Emergency;
  };

  type OldChangeStatus = {
    #Draft;
    #SubmittedForApproval;
    #Approved;
    #Rejected;
    #InProgress;
    #Completed;
    #Cancelled;
  };

  type OldApprovalRecord = {
    approverId : Principal;
    decision : {
      #Approved;
      #Rejected;
    };
    comment : ?Text;
    decidedAt : Time.Time;
  };

  type OldChangeRequest = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    changeType : OldChangeType;
    status : OldChangeStatus;
    priority : OldTicketPriority;
    impact : {
      #Low;
      #Medium;
      #High;
    };
    risk : {
      #Low;
      #Medium;
      #High;
    };
    approverIds : [Principal];
    approvals : [OldApprovalRecord];
    assigneeId : ?Principal;
    requesterId : Principal;
    plannedStart : Time.Time;
    plannedEnd : ?Time.Time;
    actualStart : ?Time.Time;
    actualEnd : ?Time.Time;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [OldComment];
  };

  type OldAsset = {
    id : Nat;
    name : Text;
    assetType : {
      #Hardware;
      #Software;
      #Network;
      #Service;
      #Other;
    };
    status : {
      #Active;
      #Inactive;
      #Maintenance;
      #Retired;
      #Disposed;
    };
    manufacturer : ?Text;
    model : ?Text;
    serialNumber : ?Text;
    assetTag : Text;
    location : ?Text;
    assignedTo : ?Principal;
    purchaseDate : ?Time.Time;
    warrantyExpiry : ?Time.Time;
    cost : ?Nat;
    description : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Old actor state
  type OldActor = {
    tickets : Map.Map<Nat, OldTicket>;
    problems : Map.Map<Nat, OldProblemRecord>;
    changes : Map.Map<Nat, OldChangeRequest>;
    assets : Map.Map<Nat, OldAsset>;
    // Add other existing state variables if needed
  };

  // New types for phase 3 modules
  type ServiceCatalogItem = {
    id : Nat;
    name : Text;
    category : Text;
    description : Text;
    slaInfo : Text;
    isAvailable : Bool;
    createdBy : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type KnowledgeArticle = {
    id : Nat;
    title : Text;
    category : Text;
    content : Text;
    tags : [Text];
    isPublished : Bool;
    viewCount : Nat;
    authorId : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type SOPStatus = {
    #Draft;
    #Active;
    #Archived;
  };

  type SOP = {
    id : Nat;
    title : Text;
    category : Text;
    content : Text;
    version : Text;
    status : SOPStatus;
    authorId : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // New actor state with phase 3 additions
  type NewActor = OldActor and {
    serviceCatalog : Map.Map<Nat, ServiceCatalogItem>;
    knowledgeBase : Map.Map<Nat, KnowledgeArticle>;
    sops : Map.Map<Nat, SOP>;
    nextServiceId : Nat;
    nextArticleId : Nat;
    nextSopId : Nat;
  };

  // Migration function: preserve existing state, initialize new variables
  public func run(old : OldActor) : NewActor {
    {
      old with
      serviceCatalog = Map.empty<Nat, ServiceCatalogItem>();
      knowledgeBase = Map.empty<Nat, KnowledgeArticle>();
      sops = Map.empty<Nat, SOP>();
      nextServiceId = 1;
      nextArticleId = 1;
      nextSopId = 1;
    };
  };
};
