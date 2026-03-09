import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Apply migration on upgrade via actor's with clause

actor {
  // ====================
  // Types
  // ====================

  public type UserRole = {
    #EndUser;
    #ITAgent;
    #Manager;
    #MasterAdmin;
  };

  public type User = {
    principal : Principal;
    name : Text;
    role : UserRole;
    department : Text;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    role : UserRole;
    department : Text;
    createdAt : Time.Time;
  };

  public type TicketType = {
    #Incident;
    #ServiceRequest;
  };

  public type TicketStatus = {
    #Open;
    #InProgress;
    #Resolved;
    #Closed;
  };

  public type TicketPriority = {
    #Low;
    #Medium;
    #High;
    #Critical;
  };

  public type Ticket = {
    id : Nat;
    ticketType : TicketType;
    title : Text;
    description : Text;
    category : Text;
    priority : TicketPriority;
    status : TicketStatus;
    assigneeId : ?Principal;
    reporterId : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [Comment];
  };

  public type Comment = {
    id : Nat;
    authorId : Principal;
    text : Text;
    createdAt : Time.Time;
  };

  public type TicketFilter = {
    ticketType : ?TicketType;
    status : ?TicketStatus;
    priority : ?TicketPriority;
    assigneeId : ?Principal;
  };

  public type DashboardStats = {
    totalOpen : Nat;
    totalInProgress : Nat;
    totalResolved : Nat;
    totalClosed : Nat;
    incidentOpen : Nat;
    incidentInProgress : Nat;
    incidentResolved : Nat;
    incidentClosed : Nat;
    serviceRequestOpen : Nat;
    serviceRequestInProgress : Nat;
    serviceRequestResolved : Nat;
    serviceRequestClosed : Nat;
    // Phase 2 additions
    problemOpen : Nat;
    problemInAnalysis : Nat;
    problemResolved : Nat;
    changeInProgress : Nat;
    changePendingApproval : Nat;
    changeCompleted : Nat;
    assetActive : Nat;
    assetInactive : Nat;
    assetMaintenance : Nat;
  };

  // Phase 2 Types

  // Problem Management
  public type ProblemStatus = {
    #Identified;
    #InAnalysis;
    #RootCauseFound;
    #Resolved;
    #Closed;
  };

  public type ProblemRecord = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    priority : TicketPriority;
    status : ProblemStatus;
    linkedIncidentIds : [Nat];
    rootCause : ?Text;
    workaround : ?Text;
    assigneeId : ?Principal;
    reporterId : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [Comment];
  };

  public type ProblemFilter = {
    status : ?ProblemStatus;
    priority : ?TicketPriority;
    category : ?Text;
  };

  // Change Management
  public type ChangeType = {
    #Standard;
    #Normal;
    #Emergency;
  };

  public type ChangeStatus = {
    #Draft;
    #SubmittedForApproval;
    #Approved;
    #Rejected;
    #InProgress;
    #Completed;
    #Cancelled;
  };

  public type ImpactLevel = {
    #Low;
    #Medium;
    #High;
  };

  public type RiskLevel = {
    #Low;
    #Medium;
    #High;
  };

  public type ApprovalDecision = {
    #Approved;
    #Rejected;
  };

  public type ApprovalRecord = {
    approverId : Principal;
    decision : ApprovalDecision;
    comment : ?Text;
    decidedAt : Time.Time;
  };

  public type ChangeRequest = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    changeType : ChangeType;
    status : ChangeStatus;
    priority : TicketPriority;
    impact : ImpactLevel;
    risk : RiskLevel;
    approverIds : [Principal];
    approvals : [ApprovalRecord];
    assigneeId : ?Principal;
    requesterId : Principal;
    plannedStart : Time.Time;
    plannedEnd : ?Time.Time;
    actualStart : ?Time.Time;
    actualEnd : ?Time.Time;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    comments : [Comment];
  };

  public type ChangeFilter = {
    status : ?ChangeStatus;
    changeType : ?ChangeType;
    priority : ?TicketPriority;
  };

  // Asset Management (CMDB)
  public type AssetType = {
    #Hardware;
    #Software;
    #Network;
    #Service;
    #Other;
  };

  public type AssetStatus = {
    #Active;
    #Inactive;
    #Maintenance;
    #Retired;
    #Disposed;
  };

  public type Asset = {
    id : Nat;
    name : Text;
    assetType : AssetType;
    status : AssetStatus;
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

  public type AssetFilter = {
    assetType : ?AssetType;
    status : ?AssetStatus;
    assignedTo : ?Principal;
  };

  // PHASE 3 (NEW TYPES)

  public type ServiceCatalogItem = {
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

  public type ServiceCatalogFilter = {
    category : ?Text;
    isAvailable : ?Bool;
  };

  public type KnowledgeArticle = {
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

  public type KnowledgeArticleFilter = {
    category : ?Text;
    isPublished : ?Bool;
  };

  public type SOP = {
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

  public type SOPStatus = {
    #Draft;
    #Active;
    #Archived;
  };

  public type SOPFilter = {
    category : ?Text;
    status : ?SOPStatus;
  };

  // ====================
  // Persistent State
  // ====================

  let users = Map.empty<Principal, User>();
  let tickets = Map.empty<Nat, Ticket>();
  let problems = Map.empty<Nat, ProblemRecord>();
  let changes = Map.empty<Nat, ChangeRequest>();
  let assets = Map.empty<Nat, Asset>();

  // PHASE 3 (NEW STATE)
  let serviceCatalog = Map.empty<Nat, ServiceCatalogItem>();
  let knowledgeBase = Map.empty<Nat, KnowledgeArticle>();
  let sops = Map.empty<Nat, SOP>();

  var nextTicketId : Nat = 1;
  var nextCommentId : Nat = 1;
  var nextProblemId : Nat = 1;
  var nextChangeId : Nat = 1;
  var nextAssetId : Nat = 1;
  var nextServiceId : Nat = 1; // Phase 3
  var nextArticleId : Nat = 1; // Phase 3
  var nextSopId : Nat = 1; // Phase 3

  var firstUserRegistered : Bool = false;

  // ====================
  // Authorization System State
  // ====================

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ====================
  // Helper Functions
  // ====================

  func isStaffOrAdmin(caller : Principal) : Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?user) {
        switch (user.role) {
          case (#ITAgent) { true };
          case (#Manager) { true };
          case (#MasterAdmin) { true };
          case (#EndUser) { false };
        };
      };
    };
  };

  func isMasterAdmin(caller : Principal) : Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?user) {
        switch (user.role) {
          case (#MasterAdmin) { true };
          case (_) { false };
        };
      };
    };
  };

  // ====================
  // User Management
  // ====================

  public shared ({ caller }) func registerUser(name : Text, department : Text) : async () {
    // Check if user already registered
    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case (null) {};
    };

    let role : UserRole = if (not firstUserRegistered) {
      firstUserRegistered := true;
      #MasterAdmin;
    } else {
      #EndUser;
    };

    let user : User = {
      principal = caller;
      name;
      role;
      department;
      createdAt = Time.now();
    };

    users.add(caller, user);
  };

  public query ({ caller }) func getMyProfile() : async ?User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    users.get(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?user) {
        ?{
          name = user.name;
          role = user.role;
          department = user.department;
          createdAt = user.createdAt;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?existingUser) {
        let updatedUser : User = {
          principal = caller;
          name = profile.name;
          role = existingUser.role; // Role cannot be changed via profile update
          department = profile.department;
          createdAt = existingUser.createdAt;
        };
        users.add(caller, updatedUser);
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?u) {
        ?{
          name = u.name;
          role = u.role;
          department = u.department;
          createdAt = u.createdAt;
        };
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view all users");
    };
    users.values().toArray();
  };

  public shared ({ caller }) func updateUserRole(userPrincipal : Principal, newRole : UserRole) : async () {
    if (not isMasterAdmin(caller)) {
      Runtime.trap("Unauthorized: Only MasterAdmin can update user roles");
    };

    switch (users.get(userPrincipal)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser : User = {
          principal = user.principal;
          name = user.name;
          role = newRole;
          department = user.department;
          createdAt = user.createdAt;
        };
        users.add(userPrincipal, updatedUser);

        // Update access control role mapping
        switch (newRole) {
          case (#MasterAdmin) {
            AccessControl.assignRole(accessControlState, caller, userPrincipal, #admin);
          };
          case (#Manager) {
            AccessControl.assignRole(accessControlState, caller, userPrincipal, #user);
          };
          case (#ITAgent) {
            AccessControl.assignRole(accessControlState, caller, userPrincipal, #user);
          };
          case (#EndUser) {
            AccessControl.assignRole(accessControlState, caller, userPrincipal, #user);
          };
        };
      };
    };
  };

  // ====================
  // Ticket Management
  // ====================

  public shared ({ caller }) func createTicket(ticketType : TicketType, title : Text, description : Text, category : Text, priority : TicketPriority) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create tickets");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?_) {};
    };

    let ticket : Ticket = {
      id = nextTicketId;
      ticketType;
      title;
      description;
      category;
      priority;
      status = #Open;
      assigneeId = null;
      reporterId = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
      comments = [];
    };

    tickets.add(nextTicketId, ticket);
    nextTicketId += 1;
    ticket.id;
  };

  public query ({ caller }) func getTicket(id : Nat) : async Ticket {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tickets");
    };

    switch (tickets.get(id)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) { ticket };
    };
  };

  module TicketModule {
    public func compareByPriority(ticket1 : Ticket, ticket2 : Ticket) : Order.Order {
      switch ((ticket1.priority, ticket2.priority)) {
        case (#Low, #Medium) { #less };
        case (#Low, #High) { #less };
        case (#Low, #Critical) { #less };
        case (#Medium, #Low) { #greater };
        case (#Medium, #High) { #less };
        case (#Medium, #Critical) { #less };
        case (#High, #Low) { #greater };
        case (#High, #Medium) { #greater };
        case (#High, #Critical) { #less };
        case (#Critical, #Low) { #greater };
        case (#Critical, #Medium) { #greater };
        case (#Critical, #High) { #greater };
        case (_) { #equal };
      };
    };
  };

  public query ({ caller }) func listTickets(filter : TicketFilter) : async [Ticket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list tickets");
    };

    let filtered = tickets.values().toArray().filter(
      func(ticket : Ticket) : Bool {
        let ticketTypeMatch = switch (filter.ticketType) {
          case (null) { true };
          case (?type_) { ticket.ticketType == type_ };
        };

        let statusMatch = switch (filter.status) {
          case (null) { true };
          case (?status) { ticket.status == status };
        };

        let priorityMatch = switch (filter.priority) {
          case (null) { true };
          case (?priority) { ticket.priority == priority };
        };

        let assigneeMatch = switch (filter.assigneeId) {
          case (null) { true };
          case (?assigneeId) {
            switch (ticket.assigneeId) {
              case (null) { false };
              case (?id) { id == assigneeId };
            };
          };
        };

        ticketTypeMatch and statusMatch and priorityMatch and assigneeMatch;
      }
    );
    filtered.sort(TicketModule.compareByPriority);
  };

  public shared ({ caller }) func updateTicketStatus(id : Nat, status : TicketStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update ticket status");
    };

    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update ticket status");
    };

    switch (tickets.get(id)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let updatedTicket : Ticket = {
          id = ticket.id;
          ticketType = ticket.ticketType;
          title = ticket.title;
          description = ticket.description;
          category = ticket.category;
          priority = ticket.priority;
          status;
          assigneeId = ticket.assigneeId;
          reporterId = ticket.reporterId;
          createdAt = ticket.createdAt;
          updatedAt = Time.now();
          comments = ticket.comments;
        };
        tickets.add(id, updatedTicket);
      };
    };
  };

  public shared ({ caller }) func assignTicket(id : Nat, assigneeId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can assign tickets");
    };

    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can assign tickets");
    };

    switch (tickets.get(id)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let updatedTicket : Ticket = {
          id = ticket.id;
          ticketType = ticket.ticketType;
          title = ticket.title;
          description = ticket.description;
          category = ticket.category;
          priority = ticket.priority;
          status = ticket.status;
          assigneeId = ?assigneeId;
          reporterId = ticket.reporterId;
          createdAt = ticket.createdAt;
          updatedAt = Time.now();
          comments = ticket.comments;
        };
        tickets.add(id, updatedTicket);
      };
    };
  };

  public shared ({ caller }) func addComment(ticketId : Nat, text : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add comments");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?_) {};
    };

    let comment : Comment = {
      id = nextCommentId;
      authorId = caller;
      text;
      createdAt = Time.now();
    };

    nextCommentId += 1;

    switch (tickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let updatedComments = ticket.comments.concat([comment]);
        let updatedTicket : Ticket = {
          id = ticket.id;
          ticketType = ticket.ticketType;
          title = ticket.title;
          description = ticket.description;
          category = ticket.category;
          priority = ticket.priority;
          status = ticket.status;
          assigneeId = ticket.assigneeId;
          reporterId = ticket.reporterId;
          createdAt = ticket.createdAt;
          updatedAt = Time.now();
          comments = updatedComments;
        };
        tickets.add(ticketId, updatedTicket);
      };
    };
    comment.id;
  };

  // ====================
  // Problem Management
  // ====================

  public shared ({ caller }) func createProblem(title : Text, description : Text, category : Text, priority : TicketPriority) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create problem records");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?_) {};
    };

    let problem : ProblemRecord = {
      id = nextProblemId;
      title;
      description;
      category;
      priority;
      status = #Identified;
      linkedIncidentIds = [];
      rootCause = null;
      workaround = null;
      assigneeId = null;
      reporterId = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
      comments = [];
    };

    problems.add(nextProblemId, problem);
    nextProblemId += 1;
    problem.id;
  };

  public query ({ caller }) func getProblem(id : Nat) : async ProblemRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view problem records");
    };

    switch (problems.get(id)) {
      case (null) { Runtime.trap("Problem record not found") };
      case (?problem) { problem };
    };
  };

  public query ({ caller }) func listProblems(filter : ProblemFilter) : async [ProblemRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list problem records");
    };

    problems.values().toArray().filter(
      func(problem : ProblemRecord) : Bool {
        let statusMatch = switch (filter.status) {
          case (null) { true };
          case (?status) { problem.status == status };
        };

        let priorityMatch = switch (filter.priority) {
          case (null) { true };
          case (?priority) { problem.priority == priority };
        };

        let categoryMatch = switch (filter.category) {
          case (null) { true };
          case (?category) { problem.category == category };
        };

        statusMatch and priorityMatch and categoryMatch;
      }
    );
  };

  public shared ({ caller }) func updateProblemStatus(id : Nat, status : ProblemStatus) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update problem record status");
    };

    switch (problems.get(id)) {
      case (null) { Runtime.trap("Problem record not found") };
      case (?problem) {
        let updatedProblem : ProblemRecord = {
          id = problem.id;
          title = problem.title;
          description = problem.description;
          category = problem.category;
          priority = problem.priority;
          status;
          linkedIncidentIds = problem.linkedIncidentIds;
          rootCause = problem.rootCause;
          workaround = problem.workaround;
          assigneeId = problem.assigneeId;
          reporterId = problem.reporterId;
          createdAt = problem.createdAt;
          updatedAt = Time.now();
          comments = problem.comments;
        };
        problems.add(id, updatedProblem);
      };
    };
  };

  public shared ({ caller }) func updateProblemDetails(
    id : Nat,
    title : Text,
    description : Text,
    rootCause : ?Text,
    workaround : ?Text,
    assigneeId : ?Principal,
    linkedIncidentIds : [Nat],
  ) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update problem record details");
    };

    switch (problems.get(id)) {
      case (null) { Runtime.trap("Problem record not found") };
      case (?problem) {
        let updatedProblem : ProblemRecord = {
          id = problem.id;
          title;
          description;
          category = problem.category;
          priority = problem.priority;
          status = problem.status;
          linkedIncidentIds;
          rootCause;
          workaround;
          assigneeId;
          reporterId = problem.reporterId;
          createdAt = problem.createdAt;
          updatedAt = Time.now();
          comments = problem.comments;
        };
        problems.add(id, updatedProblem);
      };
    };
  };

  public shared ({ caller }) func addCommentToProblem(problemId : Nat, text : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add comments to problem records");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?_) {};
    };

    let comment : Comment = {
      id = nextCommentId;
      authorId = caller;
      text;
      createdAt = Time.now();
    };

    nextCommentId += 1;

    switch (problems.get(problemId)) {
      case (null) { Runtime.trap("Problem record not found") };
      case (?problem) {
        let updatedComments = problem.comments.concat([comment]);
        let updatedProblem : ProblemRecord = {
          id = problem.id;
          title = problem.title;
          description = problem.description;
          category = problem.category;
          priority = problem.priority;
          status = problem.status;
          linkedIncidentIds = problem.linkedIncidentIds;
          rootCause = problem.rootCause;
          workaround = problem.workaround;
          assigneeId = problem.assigneeId;
          reporterId = problem.reporterId;
          createdAt = problem.createdAt;
          updatedAt = Time.now();
          comments = updatedComments;
        };
        problems.add(problemId, updatedProblem);
      };
    };
    comment.id;
  };

  // ====================
  // Change Management
  // ====================

  public shared ({ caller }) func createChangeRequest(
    title : Text,
    description : Text,
    category : Text,
    changeType : ChangeType,
    priority : TicketPriority,
    impact : ImpactLevel,
    risk : RiskLevel,
    approverIds : [Principal],
    plannedStart : Time.Time,
    plannedEnd : ?Time.Time,
  ) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can create change requests");
    };

    let changeRequest : ChangeRequest = {
      id = nextChangeId;
      title;
      description;
      category;
      changeType;
      status = #Draft;
      priority;
      impact;
      risk;
      approverIds;
      approvals = [];
      assigneeId = null;
      requesterId = caller;
      plannedStart;
      plannedEnd;
      actualStart = null;
      actualEnd = null;
      createdAt = Time.now();
      updatedAt = Time.now();
      comments = [];
    };

    changes.add(nextChangeId, changeRequest);
    nextChangeId += 1;
    changeRequest.id;
  };

  public query ({ caller }) func getChangeRequest(id : Nat) : async ChangeRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view change requests");
    };

    switch (changes.get(id)) {
      case (null) { Runtime.trap("Change request not found") };
      case (?change) { change };
    };
  };

  public query ({ caller }) func listChangeRequests(filter : ChangeFilter) : async [ChangeRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list change requests");
    };

    changes.values().toArray().filter(
      func(change : ChangeRequest) : Bool {
        let statusMatch = switch (filter.status) {
          case (null) { true };
          case (?status) { change.status == status };
        };

        let changeTypeMatch = switch (filter.changeType) {
          case (null) { true };
          case (?type_) { change.changeType == type_ };
        };

        let priorityMatch = switch (filter.priority) {
          case (null) { true };
          case (?priority) { change.priority == priority };
        };

        statusMatch and changeTypeMatch and priorityMatch;
      }
    );
  };

  public shared ({ caller }) func updateChangeStatus(id : Nat, status : ChangeStatus) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update change request status");
    };

    switch (changes.get(id)) {
      case (null) { Runtime.trap("Change request not found") };
      case (?change) {
        let updatedChange : ChangeRequest = {
          id = change.id;
          title = change.title;
          description = change.description;
          category = change.category;
          changeType = change.changeType;
          status;
          priority = change.priority;
          impact = change.impact;
          risk = change.risk;
          approverIds = change.approverIds;
          approvals = change.approvals;
          assigneeId = change.assigneeId;
          requesterId = change.requesterId;
          plannedStart = change.plannedStart;
          plannedEnd = change.plannedEnd;
          actualStart = change.actualStart;
          actualEnd = change.actualEnd;
          createdAt = change.createdAt;
          updatedAt = Time.now();
          comments = change.comments;
        };
        changes.add(id, updatedChange);
      };
    };
  };

  public shared ({ caller }) func submitChangeForApproval(id : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can submit change requests for approval");
    };

    switch (changes.get(id)) {
      case (null) { Runtime.trap("Change request not found") };
      case (?change) {
        let updatedChange : ChangeRequest = {
          id = change.id;
          title = change.title;
          description = change.description;
          category = change.category;
          changeType = change.changeType;
          status = #SubmittedForApproval;
          priority = change.priority;
          impact = change.impact;
          risk = change.risk;
          approverIds = change.approverIds;
          approvals = change.approvals;
          assigneeId = change.assigneeId;
          requesterId = change.requesterId;
          plannedStart = change.plannedStart;
          plannedEnd = change.plannedEnd;
          actualStart = change.actualStart;
          actualEnd = change.actualEnd;
          createdAt = change.createdAt;
          updatedAt = Time.now();
          comments = change.comments;
        };
        changes.add(id, updatedChange);
      };
    };
  };

  public shared ({ caller }) func approveChange(id : Nat, comment : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can approve change requests");
    };

    switch (changes.get(id)) {
      case (null) { Runtime.trap("Change request not found") };
      case (?change) {
        let isApprover = change.approverIds.find(func(p) { p == caller }) != null;
        if (not isApprover) {
          Runtime.trap("Unauthorized: Only listed approvers can approve change requests");
        };

        let approval : ApprovalRecord = {
          approverId = caller;
          decision = #Approved;
          comment;
          decidedAt = Time.now();
        };

        let updatedApprovals = change.approvals.concat([approval]);
        let updatedChange : ChangeRequest = {
          id = change.id;
          title = change.title;
          description = change.description;
          category = change.category;
          changeType = change.changeType;
          status = change.status;
          priority = change.priority;
          impact = change.impact;
          risk = change.risk;
          approverIds = change.approverIds;
          approvals = updatedApprovals;
          assigneeId = change.assigneeId;
          requesterId = change.requesterId;
          plannedStart = change.plannedStart;
          plannedEnd = change.plannedEnd;
          actualStart = change.actualStart;
          actualEnd = change.actualEnd;
          createdAt = change.createdAt;
          updatedAt = Time.now();
          comments = change.comments;
        };
        changes.add(id, updatedChange);
      };
    };
  };

  public shared ({ caller }) func rejectChange(id : Nat, comment : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can reject change requests");
    };

    switch (changes.get(id)) {
      case (null) { Runtime.trap("Change request not found") };
      case (?change) {
        let isApprover = change.approverIds.find(func(p) { p == caller }) != null;
        if (not isApprover) {
          Runtime.trap("Unauthorized: Only listed approvers can reject change requests");
        };

        let approval : ApprovalRecord = {
          approverId = caller;
          decision = #Rejected;
          comment;
          decidedAt = Time.now();
        };

        let updatedApprovals = change.approvals.concat([approval]);
        let updatedChange : ChangeRequest = {
          id = change.id;
          title = change.title;
          description = change.description;
          category = change.category;
          changeType = change.changeType;
          status = change.status;
          priority = change.priority;
          impact = change.impact;
          risk = change.risk;
          approverIds = change.approverIds;
          approvals = updatedApprovals;
          assigneeId = change.assigneeId;
          requesterId = change.requesterId;
          plannedStart = change.plannedStart;
          plannedEnd = change.plannedEnd;
          actualStart = change.actualStart;
          actualEnd = change.actualEnd;
          createdAt = change.createdAt;
          updatedAt = Time.now();
          comments = change.comments;
        };
        changes.add(id, updatedChange);
      };
    };
  };

  public shared ({ caller }) func addCommentToChange(changeId : Nat, text : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add comments to change requests");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?_) {};
    };

    let comment : Comment = {
      id = nextCommentId;
      authorId = caller;
      text;
      createdAt = Time.now();
    };

    nextCommentId += 1;

    switch (changes.get(changeId)) {
      case (null) { Runtime.trap("Change request not found") };
      case (?change) {
        let updatedComments = change.comments.concat([comment]);
        let updatedChange : ChangeRequest = {
          id = change.id;
          title = change.title;
          description = change.description;
          category = change.category;
          changeType = change.changeType;
          status = change.status;
          priority = change.priority;
          impact = change.impact;
          risk = change.risk;
          approverIds = change.approverIds;
          approvals = change.approvals;
          assigneeId = change.assigneeId;
          requesterId = change.requesterId;
          plannedStart = change.plannedStart;
          plannedEnd = change.plannedEnd;
          actualStart = change.actualStart;
          actualEnd = change.actualEnd;
          createdAt = change.createdAt;
          updatedAt = Time.now();
          comments = updatedComments;
        };
        changes.add(changeId, updatedChange);
      };
    };
    comment.id;
  };

  // ====================
  // Asset Management (CMDB)
  // ====================

  public shared ({ caller }) func createAsset(
    name : Text,
    assetType : AssetType,
    status : AssetStatus,
    manufacturer : ?Text,
    model : ?Text,
    serialNumber : ?Text,
    assetTag : Text,
    location : ?Text,
    purchaseDate : ?Time.Time,
    warrantyExpiry : ?Time.Time,
    cost : ?Nat,
    description : ?Text,
  ) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can create assets");
    };

    let asset : Asset = {
      id = nextAssetId;
      name;
      assetType;
      status;
      manufacturer;
      model;
      serialNumber;
      assetTag;
      location;
      assignedTo = null;
      purchaseDate;
      warrantyExpiry;
      cost;
      description;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    assets.add(nextAssetId, asset);
    nextAssetId += 1;
    asset.id;
  };

  public query ({ caller }) func getAsset(id : Nat) : async Asset {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view assets");
    };

    switch (assets.get(id)) {
      case (null) { Runtime.trap("Asset not found") };
      case (?asset) { asset };
    };
  };

  public query ({ caller }) func listAssets(filter : AssetFilter) : async [Asset] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list assets");
    };

    assets.values().toArray().filter(
      func(asset : Asset) : Bool {
        let assetTypeMatch = switch (filter.assetType) {
          case (null) { true };
          case (?type_) { asset.assetType == type_ };
        };

        let statusMatch = switch (filter.status) {
          case (null) { true };
          case (?status) { asset.status == status };
        };

        let assignedToMatch = switch (filter.assignedTo) {
          case (null) { true };
          case (?userId) {
            switch (asset.assignedTo) {
              case (null) { false };
              case (?id) { id == userId };
            };
          };
        };

        assetTypeMatch and statusMatch and assignedToMatch;
      }
    );
  };

  public shared ({ caller }) func updateAsset(
    id : Nat,
    name : Text,
    assetType : AssetType,
    status : AssetStatus,
    manufacturer : ?Text,
    model : ?Text,
    serialNumber : ?Text,
    assetTag : Text,
    location : ?Text,
    assignedTo : ?Principal,
    purchaseDate : ?Time.Time,
    warrantyExpiry : ?Time.Time,
    cost : ?Nat,
    description : ?Text,
  ) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update assets");
    };

    switch (assets.get(id)) {
      case (null) { Runtime.trap("Asset not found") };
      case (?asset) {
        let updatedAsset : Asset = {
          id = asset.id;
          name;
          assetType;
          status;
          manufacturer;
          model;
          serialNumber;
          assetTag;
          location;
          assignedTo;
          purchaseDate;
          warrantyExpiry;
          cost;
          description;
          createdAt = asset.createdAt;
          updatedAt = Time.now();
        };
        assets.add(id, updatedAsset);
      };
    };
  };

  public shared ({ caller }) func updateAssetStatus(id : Nat, status : AssetStatus) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update asset status");
    };

    switch (assets.get(id)) {
      case (null) { Runtime.trap("Asset not found") };
      case (?asset) {
        let updatedAsset : Asset = {
          id = asset.id;
          name = asset.name;
          assetType = asset.assetType;
          status;
          manufacturer = asset.manufacturer;
          model = asset.model;
          serialNumber = asset.serialNumber;
          assetTag = asset.assetTag;
          location = asset.location;
          assignedTo = asset.assignedTo;
          purchaseDate = asset.purchaseDate;
          warrantyExpiry = asset.warrantyExpiry;
          cost = asset.cost;
          description = asset.description;
          createdAt = asset.createdAt;
          updatedAt = Time.now();
        };
        assets.add(id, updatedAsset);
      };
    };
  };

  public shared ({ caller }) func deleteAsset(id : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can delete assets");
    };

    switch (assets.get(id)) {
      case (null) { Runtime.trap("Asset not found") };
      case (?_) {
        assets.remove(id);
      };
    };
  };

  // ====================
  // Expanded Dashboard Stats
  // ====================

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view dashboard stats");
    };

    var totalOpen : Nat = 0;
    var totalInProgress : Nat = 0;
    var totalResolved : Nat = 0;
    var totalClosed : Nat = 0;
    var incidentOpen : Nat = 0;
    var incidentInProgress : Nat = 0;
    var incidentResolved : Nat = 0;
    var incidentClosed : Nat = 0;
    var serviceRequestOpen : Nat = 0;
    var serviceRequestInProgress : Nat = 0;
    var serviceRequestResolved : Nat = 0;
    var serviceRequestClosed : Nat = 0;

    // Phase 2 Stats
    var problemOpen : Nat = 0;
    var problemInAnalysis : Nat = 0;
    var problemResolved : Nat = 0;
    var changeInProgress : Nat = 0;
    var changePendingApproval : Nat = 0;
    var changeCompleted : Nat = 0;
    var assetActive : Nat = 0;
    var assetInactive : Nat = 0;
    var assetMaintenance : Nat = 0;

    // Ticket Stats
    for (ticket in tickets.values()) {
      let isIncident = switch (ticket.ticketType) {
        case (#Incident) { true };
        case (#ServiceRequest) { false };
      };

      switch (ticket.status) {
        case (#Open) {
          totalOpen += 1;
          if (isIncident) { incidentOpen += 1 } else { serviceRequestOpen += 1 };
        };
        case (#InProgress) {
          totalInProgress += 1;
          if (isIncident) { incidentInProgress += 1 } else { serviceRequestInProgress += 1 };
        };
        case (#Resolved) {
          totalResolved += 1;
          if (isIncident) { incidentResolved += 1 } else { serviceRequestResolved += 1 };
        };
        case (#Closed) {
          totalClosed += 1;
          if (isIncident) { incidentClosed += 1 } else { serviceRequestClosed += 1 };
        };
      };
    };

    // Problem Stats
    for (problem in problems.values()) {
      switch (problem.status) {
        case (#Identified) { problemOpen += 1 };
        case (#InAnalysis) { problemInAnalysis += 1 };
        case (#RootCauseFound) { problemInAnalysis += 1 };
        case (#Resolved) { problemResolved += 1 };
        case (#Closed) {};
      };
    };

    // Change Stats
    for (change in changes.values()) {
      switch (change.status) {
        case (#InProgress) { changeInProgress += 1 };
        case (#SubmittedForApproval) { changePendingApproval += 1 };
        case (#Completed) { changeCompleted += 1 };
        case (_) {};
      };
    };

    // Asset Stats
    for (asset in assets.values()) {
      switch (asset.status) {
        case (#Active) { assetActive += 1 };
        case (#Inactive) { assetInactive += 1 };
        case (#Maintenance) { assetMaintenance += 1 };
        case (_) {};
      };
    };

    {
      totalOpen;
      totalInProgress;
      totalResolved;
      totalClosed;
      incidentOpen;
      incidentInProgress;
      incidentResolved;
      incidentClosed;
      serviceRequestOpen;
      serviceRequestInProgress;
      serviceRequestResolved;
      serviceRequestClosed;
      problemOpen;
      problemInAnalysis;
      problemResolved;
      changeInProgress;
      changePendingApproval;
      changeCompleted;
      assetActive;
      assetInactive;
      assetMaintenance;
    };
  };

  // ====================
  // PHASE 3: SERVICE CATALOG
  // ====================

  public shared ({ caller }) func createServiceCatalogItem(name : Text, category : Text, description : Text, slaInfo : Text, isAvailable : Bool) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can create service catalog items");
    };

    let item : ServiceCatalogItem = {
      id = nextServiceId;
      name;
      category;
      description;
      slaInfo;
      isAvailable;
      createdBy = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    serviceCatalog.add(nextServiceId, item);
    nextServiceId += 1;
    item.id;
  };

  public shared ({ caller }) func updateServiceCatalogItem(id : Nat, name : Text, category : Text, description : Text, slaInfo : Text, isAvailable : Bool) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update service catalog items");
    };

    switch (serviceCatalog.get(id)) {
      case (null) { Runtime.trap("Service catalog item not found") };
      case (?item) {
        let updatedItem : ServiceCatalogItem = {
          id = item.id;
          name;
          category;
          description;
          slaInfo;
          isAvailable;
          createdBy = item.createdBy;
          createdAt = item.createdAt;
          updatedAt = Time.now();
        };
        serviceCatalog.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteServiceCatalogItem(id : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can delete service catalog items");
    };

    switch (serviceCatalog.get(id)) {
      case (null) { Runtime.trap("Service catalog item not found") };
      case (?_) {
        serviceCatalog.remove(id);
      };
    };
  };

  public query ({ caller }) func getServiceCatalogItem(id : Nat) : async ServiceCatalogItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view service catalog items");
    };

    switch (serviceCatalog.get(id)) {
      case (null) { Runtime.trap("Service catalog item not found") };
      case (?item) { item };
    };
  };

  public query ({ caller }) func listServiceCatalogItems(filter : ServiceCatalogFilter) : async [ServiceCatalogItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list service catalog items");
    };

    serviceCatalog.values().toArray().filter(
      func(item : ServiceCatalogItem) : Bool {
        let categoryMatch = switch (filter.category) {
          case (null) { true };
          case (?category) { item.category == category };
        };

        let availabilityMatch = switch (filter.isAvailable) {
          case (null) { true };
          case (?isAvailable) { item.isAvailable == isAvailable };
        };

        categoryMatch and availabilityMatch;
      }
    );
  };

  public shared ({ caller }) func requestFromCatalog(itemId : Nat, details : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can request from service catalog");
    };

    switch (serviceCatalog.get(itemId)) {
      case (null) { Runtime.trap("Service catalog item not found") };
      case (?item) {
        if (not item.isAvailable) {
          Runtime.trap("Service catalog item is not available");
        };

        let ticket : Ticket = {
          id = nextTicketId;
          ticketType = #ServiceRequest;
          title = item.name;
          description = details # "\n\nService Catalog Request:\n" # item.description;
          category = item.category;
          priority = #Medium;
          status = #Open;
          assigneeId = null;
          reporterId = caller;
          createdAt = Time.now();
          updatedAt = Time.now();
          comments = [];
        };

        tickets.add(nextTicketId, ticket);
        nextTicketId += 1;
        ticket.id;
      };
    };
  };

  // ====================
  // PHASE 3: KNOWLEDGE BASE
  // ====================

  public shared ({ caller }) func createKnowledgeArticle(
    title : Text,
    category : Text,
    content : Text,
    tags : [Text],
    isPublished : Bool,
  ) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can create knowledge articles");
    };

    let article : KnowledgeArticle = {
      id = nextArticleId;
      title;
      category;
      content;
      tags;
      isPublished;
      viewCount = 0;
      authorId = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    knowledgeBase.add(nextArticleId, article);
    nextArticleId += 1;
    article.id;
  };

  public shared ({ caller }) func updateKnowledgeArticle(
    id : Nat,
    title : Text,
    category : Text,
    content : Text,
    tags : [Text],
    isPublished : Bool,
  ) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update knowledge articles");
    };

    switch (knowledgeBase.get(id)) {
      case (null) { Runtime.trap("Knowledge article not found") };
      case (?article) {
        let updatedArticle : KnowledgeArticle = {
          id = article.id;
          title;
          category;
          content;
          tags;
          isPublished;
          viewCount = article.viewCount;
          authorId = article.authorId;
          createdAt = article.createdAt;
          updatedAt = Time.now();
        };
        knowledgeBase.add(id, updatedArticle);
      };
    };
  };

  public shared ({ caller }) func deleteKnowledgeArticle(id : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can delete knowledge articles");
    };

    switch (knowledgeBase.get(id)) {
      case (null) { Runtime.trap("Knowledge article not found") };
      case (?_) {
        knowledgeBase.remove(id);
      };
    };
  };

  public shared ({ caller }) func getKnowledgeArticle(id : Nat) : async KnowledgeArticle {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view knowledge articles");
    };

    switch (knowledgeBase.get(id)) {
      case (null) { Runtime.trap("Knowledge article not found") };
      case (?article) {
        // Increment view count only for non-authors
        if (article.authorId != caller) {
          let updatedArticle : KnowledgeArticle = {
            id = article.id;
            title = article.title;
            category = article.category;
            content = article.content;
            tags = article.tags;
            isPublished = article.isPublished;
            viewCount = article.viewCount + 1;
            authorId = article.authorId;
            createdAt = article.createdAt;
            updatedAt = Time.now();
          };
          knowledgeBase.add(id, updatedArticle);
        };
        article;
      };
    };
  };

  public query ({ caller }) func listKnowledgeArticles(filter : KnowledgeArticleFilter) : async [KnowledgeArticle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list knowledge articles");
    };

    knowledgeBase.values().toArray().filter(
      func(article : KnowledgeArticle) : Bool {
        let categoryMatch = switch (filter.category) {
          case (null) { true };
          case (?category) { article.category == category };
        };

        let publishedMatch = switch (filter.isPublished) {
          case (null) { true };
          case (?isPublished) { article.isPublished == isPublished };
        };

        categoryMatch and publishedMatch;
      }
    );
  };

  // ====================
  // PHASE 3: SOPS (Standard Operating Procedures)
  // ====================

  public shared ({ caller }) func createSOP(
    title : Text,
    category : Text,
    content : Text,
    version : Text,
    status : SOPStatus,
  ) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can create SOPs");
    };

    let sop : SOP = {
      id = nextSopId;
      title;
      category;
      content;
      version;
      status;
      authorId = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    sops.add(nextSopId, sop);
    nextSopId += 1;
    sop.id;
  };

  public shared ({ caller }) func updateSOP(
    id : Nat,
    title : Text,
    category : Text,
    content : Text,
    version : Text,
  ) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update SOPs");
    };

    switch (sops.get(id)) {
      case (null) { Runtime.trap("SOP not found") };
      case (?sop) {
        let updatedSOP : SOP = {
          id = sop.id;
          title;
          category;
          content;
          version;
          status = sop.status;
          authorId = sop.authorId;
          createdAt = sop.createdAt;
          updatedAt = Time.now();
        };
        sops.add(id, updatedSOP);
      };
    };
  };

  public shared ({ caller }) func updateSOPStatus(id : Nat, status : SOPStatus) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only ITAgent, Manager, or MasterAdmin can update SOP status");
    };

    switch (sops.get(id)) {
      case (null) { Runtime.trap("SOP not found") };
      case (?sop) {
        let updatedSOP : SOP = {
          id = sop.id;
          title = sop.title;
          category = sop.category;
          content = sop.content;
          version = sop.version;
          status;
          authorId = sop.authorId;
          createdAt = sop.createdAt;
          updatedAt = Time.now();
        };
        sops.add(id, updatedSOP);
      };
    };
  };

  public shared ({ caller }) func deleteSOP(id : Nat) : async () {
    if (not isMasterAdmin(caller)) {
      Runtime.trap("Unauthorized: Only MasterAdmin can delete SOPs");
    };

    switch (sops.get(id)) {
      case (null) { Runtime.trap("SOP not found") };
      case (?_) {
        sops.remove(id);
      };
    };
  };

  public query ({ caller }) func getSOP(id : Nat) : async SOP {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view SOPs");
    };

    switch (sops.get(id)) {
      case (null) { Runtime.trap("SOP not found") };
      case (?sop) { sop };
    };
  };

  public query ({ caller }) func listSOPs(filter : SOPFilter) : async [SOP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list SOPs");
    };

    sops.values().toArray().filter(
      func(sop : SOP) : Bool {
        let categoryMatch = switch (filter.category) {
          case (null) { true };
          case (?category) { sop.category == category };
        };

        let statusMatch = switch (filter.status) {
          case (null) { true };
          case (?status) { sop.status == status };
        };

        categoryMatch and statusMatch;
      }
    );
  };
};
