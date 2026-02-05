# SchoolOS — Pending Dashboards, Pages & Modules

This document tracks all remaining dashboards, pages, and shared components required to complete the MVP and scale SchoolOS into a full enterprise-grade school management platform.

It serves as the official development roadmap for frontend, backend, and system architecture.

---

## 1. Global Foundation (System-Level)

### 1.1 Authentication & Access
Status: ⏳ Pending

Pages:
- /login
- /forgot-password
- /reset-password
- /verify-email
- /select-school

Features:
- JWT/session authentication
- OTP verification
- Password strength validation
- Multi-school access
- Session management

Components:
- Auth forms
- OTP input
- Password meter
- Session timeout modal

---

### 1.2 Global App Layout
Status: ⏳ Pending

Features:
- Collapsible sidebar
- Top navigation bar
- Notification drawer
- Command palette (Ctrl+K)
- Profile menu
- Theme switcher

Components:
- Role-aware navigation
- Breadcrumbs
- Global search
- User dropdown

---

## 2. Role-Based Dashboards

---

### 2.1 Admin / Principal Dashboard
Status: ⏳ Pending  
URL: /admin/dashboard

Features:
- School KPIs
- Academic overview
- Teacher activity
- Risk alerts
- System notifications

Components:
- KPI cards
- Heatmaps
- Trend charts
- Alert widgets

---

### 2.2 Teacher Dashboard
Status: ⏳ Pending  
URL: /teacher/dashboard

Features:
- Class schedule
- Pending evaluations
- Student alerts
- Quick actions

Components:
- Task list
- Class cards
- Progress widgets

---

### 2.3 Parent Dashboard
Status: ⏳ Pending  
URL: /parent/dashboard

Features:
- Child performance
- Attendance
- Results
- Announcements
- Messages

Components:
- Student selector
- Summary panels
- Timeline feed

---

### 2.4 Student Dashboard
Status: ⏳ Optional (Post-MVP)  
URL: /student/dashboard

Features:
- Academic progress
- Assignments
- Portfolio
- Messages

---

## 3. Student Management

---

### 3.1 Student Directory
Status: ⏳ Pending  
URL: /students

Features:
- Search & filters
- Bulk upload
- Export
- Pagination

Components:
- Advanced data table
- Filter drawer
- Upload modal

---

### 3.2 Student Profile (Core Page)
Status: ⏳ Pending  
URL: /students/:id

Tabs:
- Overview
- Academics
- Attendance
- Portfolio
- Interventions
- Notes
- History

Components:
- Profile header
- Trend charts
- Timeline
- Notes editor

---

## 4. Academics & Assessment

---

### 4.1 Academics Dashboard
Status: ⏳ Pending  
URL: /academics

Features:
- Subject statistics
- Class averages
- Grade trends

---

### 4.2 Exam Management
Status: ⏳ Pending  
URL: /academics/exams

Features:
- Exam creation
- Weightage setup
- Validation rules

Components:
- Exam builder
- Sliders
- Config panels

---

### 4.3 Marks Entry System
Status: ⏳ Pending (High Priority)  
URL: /academics/marks-entry

Features:
- Spreadsheet grid
- CSV import
- Draft/publish
- Audit trail

Components:
- Editable table
- Error panel
- Publish modal

---

### 4.4 Report Cards
Status: ⏳ Pending  
URL: /academics/report-cards

Features:
- Preview
- PDF export
- Archive

---

## 5. Analytics & Student Support

---

### 5.1 Analytics Dashboard
Status: ⏳ Pending  
URL: /analytics

Features:
- Cohort analysis
- Filters
- Comparisons

Components:
- Chart panels
- Filter bars

---

### 5.2 Risk & Early Warning System
Status: ⏳ Pending  
URL: /analytics/risk

Features:
- Rule engine
- Risk flags
- Alerts

---

### 5.3 Intervention Management
Status: ⏳ Pending  
URL: /interventions

Features:
- Plan creation
- Mentor assignment
- Outcome tracking

---

### 5.4 Student Portfolio
Status: ⏳ Pending  
URL: /portfolio

Features:
- Project uploads
- Certificates
- Badges
- Reviews

---

## 6. Communication & Community

---

### 6.1 Announcements System
Status: ⏳ Pending  
URL: /communication/announcements

Features:
- Targeting
- Scheduling
- Attachments
- Read receipts

---

### 6.2 Messaging System
Status: ⏳ Pending  
URL: /communication/messages

Features:
- Threaded chats
- Search
- Moderation

---

### 6.3 PTM Scheduling
Status: ⏳ Pending  
URL: /communication/ptm

Features:
- Slot creation
- Booking
- Reminders

---

### 6.4 Notifications Center
Status: ⏳ Pending  
URL: /notifications

---

## 7. Attendance Management

---

### 7.1 Attendance Dashboard
Status: ⏳ Pending  
URL: /attendance

Features:
- Daily view
- Monthly view
- Student-wise view

---

### 7.2 Attendance Entry
Status: ⏳ Pending  
URL: /attendance/mark

Features:
- Bulk marking
- Validation
- Summary

---

## 8. System Configuration & Administration

---

### 8.1 School Settings
Status: ⏳ Pending  
URL: /settings/school

Sections:
- Profile
- Branding
- Academic year
- Holidays

---

### 8.2 Role & Permission Management
Status: ⏳ Pending  
URL: /settings/roles

Features:
- Role creation
- Permission mapping
- Access preview

---

### 8.3 Academic Configuration
Status: ⏳ Pending  
URL: /settings/academics

Features:
- Subject management
- Grading systems
- Term setup

---

### 8.4 Integration Settings
Status: ⏳ Pending  
URL: /settings/integrations

Features:
- Email
- SMS/WhatsApp
- Calendar
- Payment gateways

---

## 9. Support & Operations

---

### 9.1 Help Center
Status: ⏳ Pending  
URL: /help

---

### 9.2 Support Ticket System
Status: ⏳ Pending  
URL: /support/tickets

---

### 9.3 Audit Logs
Status: ⏳ Pending  
URL: /system/audit

Features:
- Action tracking
- Filters
- Export

---

## 10. Shared Component Library

Status: ⏳ Pending

### UI Primitives
- Buttons
- Inputs
- Selects
- Modals
- Tooltips
- Toasts

### Data Components
- Advanced tables
- Virtualized lists
- Filter builders
- Export tools

### Feedback Components
- Skeleton loaders
- Error boundaries
- Empty states

### Productivity Components
- Bulk actions
- Inline editing
- Undo/redo
- Batch imports

---

## 11. MVP Completion Criteria

The MVP is considered complete when the following are implemented:

- Authentication & RBAC
- Admin Dashboard
- Student Directory
- Student Profile
- Marks Entry
- Parent Dashboard
- Announcements
- Attendance
- Report Cards
- Core Settings

---

## 12. Development Phases

### Phase 1 — Core
- Auth & Layout
- Student Management
- Marks Entry

### Phase 2 — Value
- Parent Portal
- Analytics v1
- Messaging

### Phase 3 — Authority
- Report Cards
- Interventions
- PTM

### Phase 4 — Scale
- Settings
- Integrations
- Support

---

## 13. Governance & Quality Standards

All new modules must include:

- Database migrations
- API documentation
- Role permission checks
- Audit logging
- Unit & E2E tests
- Accessibility compliance
- Performance benchmarks

---

## 14. Maintenance & Review

This document must be reviewed and updated after every major release to reflect current implementation status and future priorities.

---

Last Updated: [YYYY-MM-DD]
Owner: Core Platform Team
