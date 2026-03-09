# Rommy ITSM - Phase 3

## Current State
Phase 1 (Auth, Incidents, Service Requests, Dashboard, User Management) and Phase 2 (Problem Management, Change Management, Asset Management) are complete and deployed. The backend has ~1440 lines of Motoko. The frontend has pages for all Phase 1/2 modules plus a shared AppLayout sidebar.

## Requested Changes (Diff)

### Add
- **Service Catalog**: Catalog of IT services that users can browse and request. Each entry has name, category, description, SLA info, and availability status. Staff/Admin can create/edit/delete. All users can browse and submit a request (which creates a ServiceRequest ticket).
- **Knowledge Base**: Articles with title, category, content (rich text as plain text), tags, and published/draft status. Staff/Admin can create/edit. All users can search and read. Articles have view count tracking.
- **SOPs (Standard Operating Procedures)**: Documents with title, category, content, version, and status (Draft/Active/Archived). Staff/Admin can create/edit/archive. All users can view active SOPs. Version field is a text string.

### Modify
- AppLayout sidebar: Add 3 new nav links (Service Catalog, Knowledge Base, SOPs)
- App.tsx: Add 3 new routes + pages

### Remove
- Nothing removed

## Implementation Plan
1. Add 3 new data types + CRUD functions to main.mo: ServiceCatalogItem, KnowledgeArticle, SOP
2. Regenerate backend.d.ts bindings
3. Create frontend pages: ServiceCatalogPage, KnowledgeBasePage, SOPsPage
4. Update AppLayout to add nav links
5. Update App.tsx to add routes
