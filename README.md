# SchoolIQ — Intelligent School Management Platform

SchoolIQ is a **modular, scalable school management platform** designed to reduce manual effort, improve academic insights, and enable data-driven decision-making for schools.

The system focuses on **Academics & Assessment**, **Student Support & Analytics**, and **Communication & Community** as its core value drivers, while being architected to expand into full school operations (administration, finance, logistics, compliance).

---

## Problem Statement

Schools today rely on:

- Manual data entry (marks, attendance, reports)
- Disconnected tools (Excel, WhatsApp, PDFs)
- Reactive decision-making instead of early intervention
- Poor visibility for parents and administrators

These lead to:

- High teacher workload
- Delayed academic insights
- Missed intervention opportunities
- Parent dissatisfaction
- Data inconsistency and disputes

---

## Solution Overview

SchoolOS provides a **single, unified platform** that:

- Automates academic workflows (exams, marks, report cards)
- Builds longitudinal student profiles with analytics
- Identifies at-risk students early
- Enables structured, auditable communication
- Scales from small schools to multi-school organizations

The platform is built with **enterprise-grade backend principles** while remaining practical for real school environments.

---

## Core Modules (Current Focus)

### Module B: Academics & Assessment

- Exam & test management
- Bulk and manual marks entry
- Configurable grading schemes
- Automated report cards
- Audit logs for all academic changes

### Module C: Student Support & Analytics

- Unified student profile (academic, attendance, behavior)
- Performance trend analysis
- Early warning & risk detection
- Intervention planning and tracking
- Student portfolios (projects, achievements, skills)

### Module D: Communication & Community

- Announcements & notices (targeted)
- Teacher–parent messaging
- Parent portal (read-only insights)
- Parent-Teacher Meeting (PTM) scheduling
- Notification engine (in-app, email; SMS/WhatsApp later)

---

## Planned Future Modules

- Core Administration (SIS, attendance, timetable)
- Fees & Finance
- Transport & Hostel Management
- Library & Inventory
- AI-powered OCR for marks entry
- Predictive analytics & personalization
- Government compliance reporting

The architecture is designed so these can be added **without refactoring core systems**.

---

## User Roles

- Super Admin (Platform Owner)
- School Admin / Principal
- Teacher
- Student
- Parent / Guardian
- Counsellor / Academic Coordinator

Each role has **school-scoped access** with fine-grained permissions.

---

## System Architecture

### MVP Architecture

- **Backend**: Modular Monolith (Domain-Driven)
- **Frontend**: Next.js (App Router)
- **Database**: PostgreSQL (Neon + Prisma) (single instance)
- **Cache & Jobs**: Redis
- **Auth**: JWT / session-based RBAC

Reason:

- Fast development
- Lower cost
- Easier debugging
- Clean migration path to microservices

### Production Architecture (Planned)

- Domain-oriented microservices
- Event-driven communication
- API Gateway
- Database per service
- Dedicated analytics pipeline

---

## Tech Stack

### Frontend

- Next.js (React, App Router)
- Tailwind CSS
- React Hook Form + Zod
- Recharts / ECharts
- Server Components + Edge Rendering

### Backend

- RESTful APIs
- Domain-based module structure
- Internal event abstraction
- Background job processing

### Database

- PostgreSQL
- Schema-per-domain (logical separation)
- Strong constraints & migrations

### Infrastructure

- Redis (cache + queues)
- Docker
- CI/CD (planned)
- Cloud-agnostic design

---

## Backend Domain Structure

```text
src/
├── modules/
│   ├── auth
│   ├── academics
│   ├── analytics
│   ├── students
│   ├── communication
│
├── shared/
│   ├── database
│   ├── cache
│   ├── events
│   ├── utils
│
├── api/
│   ├── routes
│   ├── middlewares
│
└── jobs/
```

Each module owns:

- Its business logic
- Its database schema
- Its validation rules

---

## Database Design Principles

- Every record is scoped by `school_id`
- Strong referential integrity
- Append-only logs for critical data
- Derived analytics stored separately
- Soft deletes where legally required

---

## Security & Compliance

- Role-Based Access Control (RBAC)
- Permission matrix per role
- School-scoped data isolation
- Encryption in transit and at rest
- Immutable audit logs for:
  - Marks changes
  - Attendance updates
  - Communication records

---

## Audit & Observability

- Centralized audit log
- User action tracking
- Error logging
- Performance metrics (planned)
- Alerting & monitoring (production phase)

---

## Performance Considerations

- Pagination on all list APIs
- Cached dashboards
- Background processing for heavy tasks
- Precomputed analytics snapshots
- Edge-cached read-only views

---

## Setup (Development)

### Prerequisites

- Node.js
- Neon
- Redis
- Docker (recommended)
### Email Configuration

SchoolIQ sends automated emails for various events (registration, password resets, notifications, etc.). To enable email functionality:

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure SMTP settings in `.env.local`:**
   
   **Option 1: Gmail (Easiest for testing)**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=noreply@yourschool.com
   ```
   
   To get an App Password for Gmail:
   - Enable 2-Factor Authentication on your Google account
   - Visit https://myaccount.google.com/apppasswords
   - Generate an App Password for "Mail"
   - Use that password as `SMTP_PASSWORD`

   **Option 2: SendGrid**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your_sendgrid_api_key
   SMTP_FROM=noreply@yourschool.com
   ```

   **Option 3: Mailgun**
   ```env
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your_mailgun_smtp_username
   SMTP_PASSWORD=your_mailgun_smtp_password
   SMTP_FROM=noreply@yourschool.com
   ```

3. **Email Features Include:**
   - Welcome emails after school registration
   - Admin credential emails
   - Password reset emails
   - Staff invitation emails
   - Notification emails

> **Note:** Email functionality is optional for development. The application will log email errors but continue to function if SMTP is not configured.