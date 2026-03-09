import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
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
  };

  // Persistent state
  let users = Map.empty<Principal, User>();
  let tickets = Map.empty<Nat, Ticket>();
  var nextTicketId : Nat = 1;
  var nextCommentId : Nat = 1;
  var firstUserRegistered : Bool = false;

  // Authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to check if user is ITAgent, Manager, or MasterAdmin
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

  // Helper function to check if user is MasterAdmin
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

  // User Management
  public shared ({ caller }) func registerUser(name : Text, department : Text) : async () {
    // Check if user already registered
    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case (null) {};
    };

    let role : UserRole = if (not firstUserRegistered) {
      // First user becomes MasterAdmin
      firstUserRegistered := true;
      #MasterAdmin;
    } else {
      // Subsequent users default to EndUser
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

  // Ticket Management
  public shared ({ caller }) func createTicket(ticketType : TicketType, title : Text, description : Text, category : Text, priority : TicketPriority) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create tickets");
    };

    // Verify user is registered
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

    // Verify user is registered
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
    };
  };
};
