# Rommy ITSM System

## Current State
Phases 1-3 are complete and deployed:
- Phase 1: Authentication (Internet Identity), 4 user roles (EndUser, ITAgent, Manager, MasterAdmin), Incident Management, Service Request Management, Dashboard (basic stats), User Management, Profile
- Phase 2: Problem Management, Change Management (with approval workflow), Asset/CMDB Management
- Phase 3: Service Catalog, Knowledge Base, SOPs & Process

The backend (`backend.d.ts`) exposes all CRUD APIs for the above. No SLA, Settings, or advanced reporting APIs exist in the backend yet -- these will be built as frontend-only features using existing data.

## Requested Changes (Diff)

### Add
- **SLA Management page** (`/sla`): Display ITIL default SLA targets per priority (Critical, High, Medium, Low) with response and resolution time targets. Show SLA compliance metrics by calculating ticket age vs. SLA thresholds from existing ticket data. Allow MasterAdmin to view and configure SLA targets (stored in frontend local state for now, as backend doesn't have SLA config APIs).
- **Settings page** (`/settings`): MasterAdmin-only page with tabbed configuration sections:
  - General: system name, timezone display
  - SLA Configuration: edit response/resolution time targets per priority level
  - Priority Levels: view/manage standard priority labels and colors
  - Assignment Rules: UI to describe auto-assignment rules (informational, configurable display)
  - Approval Workflows: configure who can approve Change Requests (role-based rules display)
  - Notification Preferences: toggle preferences for notifications
- **Enhanced Dashboard/Reporting** (`/reports`): A dedicated reports page with:
  - Ticket volume by type (Incidents vs Service Requests)
  - Ticket status breakdown charts (using recharts or similar built-in)
  - Priority distribution across tickets
  - SLA compliance summary
  - Asset type distribution
  - Change request status summary
  - Problem status summary
  - Top categories by ticket volume
  - Date-range awareness for display

### Modify
- **App.tsx**: Add routes for `/sla`, `/settings`, `/reports`
- **AppLayout sidebar**: Add navigation links for SLA Management, Reports, and Settings
- **DashboardPage**: Add quick-link cards/buttons to Reports and SLA pages

### Remove
- Nothing removed

## Implementation Plan
1. Write `SLAPage.tsx` -- SLA targets table with compliance overview, MasterAdmin editable targets stored in localStorage
2. Write `SettingsPage.tsx` -- Tabbed settings with 6 sections (General, SLA Config, Priority Levels, Assignment Rules, Approval Workflows, Notifications); MasterAdmin-only access
3. Write `ReportsPage.tsx` -- Visual reporting using recharts (already available in the project) with 8 chart/metric sections built from existing backend query data
4. Update `App.tsx` to add 3 new routes
5. Update `AppLayout.tsx` sidebar to add SLA, Reports, Settings nav links
6. Validate and deploy
