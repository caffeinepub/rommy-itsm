# Rommy ITSM System — Phase 1

## Current State
Empty project scaffold. No backend or frontend code exists beyond the base template.

## Requested Changes (Diff)

### Add
- **Authentication & User Roles**: Internet Identity login with role-based access (EndUser, ITAgent, Manager, MasterAdmin). First user auto-becomes MasterAdmin.
- **User Profile**: Name, role, department fields. Setup flow on first login.
- **Incident Management Module**: Create, list, view, update incidents. Fields: title, description, category, priority (Low/Medium/High/Critical), status (Open/InProgress/Resolved/Closed), assignee, reporter, timestamps, comments.
- **Service Request Management Module**: Create, list, view, update service requests. Fields: title, description, service type, priority, status, assignee, requester, timestamps, comments.
- **Dashboard**: Stats cards (Open, In Progress, Resolved, Closed counts), recent tickets table, basic charts by category and priority.
- **User Management Page** (MasterAdmin only): List all users, change their roles.
- **Navigation**: Sidebar with links to Dashboard, Incidents, Service Requests, User Management (role-gated), Profile.

### Modify
- Nothing (new project).

### Remove
- Nothing.

## Implementation Plan
1. Backend (Motoko):
   - User store: principal → {name, role, department, createdAt}
   - Roles enum: EndUser, ITAgent, Manager, MasterAdmin
   - Ticket store (shared for Incidents and Service Requests, typed by ticketType field)
   - Ticket fields: id, ticketType, title, description, category, priority, status, assigneeId, reporterId, createdAt, updatedAt, comments[]
   - Comment fields: id, authorId, text, createdAt
   - CRUD operations: createTicket, getTicket, listTickets, updateTicket, addComment
   - User ops: registerUser, getUser, getAllUsers, updateUserRole
   - Helper: getMyRole, isFirstUser
2. Frontend:
   - Login page with Internet Identity button
   - First-login profile setup modal
   - Sidebar layout with role-gated navigation
   - Dashboard page: stats cards + recent tickets table
   - Incident list page: filter by status/priority, create button
   - Incident detail page: view fields, update status, add comment, assign (ITAgent+ only)
   - Service Request list page: same structure
   - Service Request detail page: same structure
   - Create Ticket modal/page (shared component, type passed as prop)
   - User Management page (MasterAdmin only)
   - Profile page
