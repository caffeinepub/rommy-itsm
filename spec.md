# Rommy ITSM System

## Current State

Phase 1 is complete and deployed. The system has:

- **Backend (main.mo)**: User management (4 roles: EndUser, ITAgent, Manager, MasterAdmin), Ticket management (Incident + ServiceRequest types), Comments, Dashboard stats
- **Frontend**: Dashboard, Incident Management, Service Request Management, Ticket Detail, Users Management, Profile, Login pages
- **Auth**: Internet Identity with role-based access control

## Requested Changes (Diff)

### Add

**Backend:**
- `ProblemRecord` type with fields: id, title, description, category, priority, status (Identified/InAnalysis/RootCauseFound/Resolved/Closed), linkedIncidentIds (array of ticket IDs), rootCause (optional text), workaround (optional text), assigneeId (optional), reporterId, createdAt, updatedAt, comments
- `ChangeRequest` type with fields: id, title, description, category, changeType (Standard/Normal/Emergency), status (Draft/SubmittedForApproval/Approved/Rejected/InProgress/Completed/Cancelled), priority, impact (Low/Medium/High), risk (Low/Medium/High), approvers (array of principals), approvals (array of approval records), assigneeId (optional), requesterId, plannedStart, plannedEnd (optional Time), actualStart (optional Time), actualEnd (optional Time), createdAt, updatedAt, comments
- `ApprovalRecord` type: approverId, decision (Approved/Rejected), comment (optional text), decidedAt (Time)
- `Asset` type with fields: id, name, assetType (Hardware/Software/Network/Service/Other), status (Active/Inactive/Maintenance/Retired/Disposed), manufacturer (optional), model (optional), serialNumber (optional), assetTag, location (optional), assignedTo (optional Principal), purchaseDate (optional Time), warrantyExpiry (optional Time), cost (optional Nat), description (optional text), createdAt, updatedAt
- CRUD operations for Problem records: createProblem, getProblem, listProblems, updateProblemStatus, updateProblemDetails, addCommentToProblem
- CRUD operations for Change requests: createChangeRequest, getChangeRequest, listChangeRequests, updateChangeStatus, submitChangeForApproval, approveChange, rejectChange, addCommentToChange
- CRUD operations for Assets: createAsset, getAsset, listAssets, updateAsset, updateAssetStatus, deleteAsset
- Dashboard stats expansion: add problem counts (open/in-analysis/resolved) and change request counts (draft/pending-approval/in-progress/completed) and asset counts (active/inactive/maintenance)

**Frontend:**
- Problem Management page: list all problems with filters (status, priority, category), create new problem form, problem detail view with linked incidents, root cause analysis section, comments
- Change Management page: list change requests with filters (status, changeType, priority), create new change form, change detail view with approval workflow, approval/rejection actions for authorized users, comments
- Asset Management (CMDB) page: list assets with filters (type, status, location), create/edit asset form, asset detail view, bulk search
- Navigation: add Problem Management, Change Management, Asset Management links in sidebar

### Modify

- `DashboardStats` type: extend to include problem and change request metrics
- `getDashboardStats()`: compute and return problem/change request/asset counts
- App.tsx: add routes for `/problems`, `/problems/$id`, `/changes`, `/changes/$id`, `/assets`, `/assets/$id`
- Sidebar/navigation component: add new module links

### Remove

Nothing removed.

## Implementation Plan

1. Extend `main.mo` to add Problem, ChangeRequest, Asset types and all CRUD/workflow functions
2. Regenerate `backend.d.ts` with new type bindings
3. Create `ProblemPage.tsx` and `ProblemDetailPage.tsx` frontend pages
4. Create `ChangePage.tsx` and `ChangeDetailPage.tsx` frontend pages
5. Create `AssetPage.tsx` and `AssetDetailPage.tsx` frontend pages
6. Update `App.tsx` with new routes
7. Update sidebar/navigation to include new module links
8. Update Dashboard to show expanded stats including problems, changes, and assets
