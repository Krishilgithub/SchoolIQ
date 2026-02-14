# SchoolIQ - Decoupled Monolith Architecture

**Version:** 2.0  
**Date:** February 14, 2026  
**Author:** Architecture Team  
**Status:** Design Document

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architectural Principles](#architectural-principles)
3. [Bounded Contexts (Domains)](#bounded-contexts-domains)
4. [Module Structure](#module-structure)
5. [Data Ownership & Boundaries](#data-ownership--boundaries)
6. [Communication Patterns](#communication-patterns)
7. [Implementation Examples](#implementation-examples)
8. [Migration Strategy](#migration-strategy)
9. [Enforcement Mechanisms](#enforcement-mechanisms)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## 📊 Executive Summary

SchoolIQ is being refactored from a **coupled monolith** to a **decoupled monolith** to achieve:

- **Modularity**: Independent, self-contained business domains
- **Scalability**: Easy to add features without affecting existing code
- **Maintainability**: Changes isolated to single modules
- **Testability**: Mock dependencies at clear boundaries
- **Team Autonomy**: Different teams can work on different modules
- **Future-Proof**: Smooth migration path to microservices if needed

### Current vs Target Architecture

| Aspect | Before (Coupled) | After (Decoupled) |
|--------|-----------------|-------------------|
| Organization | Technical layers (services/, components/) | Business domains (modules/) |
| Dependencies | Direct cross-domain imports | Events + contracts |
| Data Access | 3 patterns (API, Actions, Direct DB) | 1 pattern (Actions only) |
| Service Layer | 2 locations (confusing) | 1 per module (clear) |
| Testing | Hard (tight coupling) | Easy (isolated modules) |
| Module Count | N/A (monolithic) | 11 bounded contexts |

---

## 🎯 Architectural Principles

### 1. **Single Responsibility Principle (Module Level)**
Each module handles ONE business capability and owns its data completely.

### 2. **Dependency Inversion**
Modules depend on abstractions (interfaces), not concrete implementations.

### 3. **No Direct Cross-Module Imports**
Modules communicate through:
- **Domain Events** (async, decoupled)
- **Public APIs** (synchronous, via module's index.ts)
- **Shared Kernel** (infrastructure only)

### 4. **Data Encapsulation**
Only the owning module can directly query/mutate its tables.

### 5. **Unidirectional Data Flow**
```
UI → Server Action → Service → Repository → Database
     ↑______________|___________|___________|
          Never skip layers
```

### 6. **Event-Driven for Cross-Domain Business Logic**
When Module A needs to react to changes in Module B, use domain events.

---

## 🏗️ Bounded Contexts (Domains)

Based on SchoolIQ's database schema and business requirements, we identify **11 core bounded contexts**:

### 1. 🏫 **School Management Context**
**Purpose**: Multi-tenancy, school setup, campuses, academic years  
**Owner**: Platform administrators (super admin)  
**Tables Owned**: `schools`, `campuses`, `academic_years`

**Key Responsibilities**:
- School registration & onboarding
- Campus management
- Academic year lifecycle
- School-level configuration
- Subscription & billing (future)

**Events Emitted**:
- `SchoolCreated`
- `AcademicYearStarted`
- `AcademicYearEnded`

---

### 2. 🔐 **Authentication & Authorization Context**
**Purpose**: User identity, roles, permissions, sessions  
**Owner**: Security team  
**Tables Owned**: `profiles`, `roles`, `role_permissions`, `user_sessions`

**Key Responsibilities**:
- User authentication (login/logout)
- Password management
- Session management
- Role-based access control (RBAC)
- Permission checks
- Profile management

**Events Emitted**:
- `UserRegistered`
- `UserLoggedIn`
- `UserLoggedOut`
- `RoleAssigned`
- `PasswordChanged`

**Integration Points**:
- Validates permissions for all modules
- Provides user context to every operation

---

### 3. 📚 **Academic Structure Context**
**Purpose**: Classes, subjects, sections, curriculum  
**Owner**: Academic administrators  
**Tables Owned**: `classes`, `sections`, `subjects`, `class_subjects`, `section_subjects`

**Key Responsibilities**:
- Class creation & management
- Subject catalog management
- Section allocation
- Subject-teacher assignments
- Curriculum structure

**Events Emitted**:
- `ClassCreated`
- `SectionCreated`
- `SubjectAssignedToClass`
- `TeacherAssignedToSubject`

**Dependencies**:
- Needs `SchoolContext` for school_id validation
- Needs `TeacherContext` for teacher assignments

---

### 4. 👨‍🎓 **Student Management Context**
**Purpose**: Student lifecycle, enrollment, records  
**Owner**: Admissions & student affairs  
**Tables Owned**: `students`, `guardians`, `student_guardians`, `enrollments`, `student_documents`

**Key Responsibilities**:
- Student admission & registration
- Guardian/parent management
- Enrollment in classes/sections
- Student profile management
- Document management
- Student search & filters

**Events Emitted**:
- `StudentAdmitted`
- `StudentEnrolled`
- `StudentWithdrawn`
- `StudentPromoted`
- `GuardianAdded`

**Dependencies**:
- Listens to `AcademicYearStarted` for enrollment
- Listens to `SectionCreated` for allocation

---

### 5. 👨‍🏫 **Teacher Management Context**
**Purpose**: Teacher lifecycle, qualifications, performance  
**Owner**: HR & administration  
**Tables Owned**: `teachers`, `teacher_qualifications`, `teacher_leaves`, `performance_reviews`

**Key Responsibilities**:
- Teacher hiring & onboarding
- Leave management
- Performance reviews
- Workload management
- Qualification tracking

**Events Emitted**:
- `TeacherHired`
- `TeacherResigned`
- `LeaveRequested`
- `LeaveApproved`
- `PerformanceReviewCompleted`

**Dependencies**:
- Needs `AuthContext` for teacher accounts
- Notifies `AcademicContext` when teacher unavailable

---

### 6. ✅ **Attendance Context**
**Purpose**: Daily attendance marking, tracking, analytics  
**Owner**: Class teachers & attendance coordinators  
**Tables Owned**: `attendance_sessions`, `attendance_records`, `attendance_summary_cache`

**Key Responsibilities**:
- Attendance session management
- Bulk/individual marking
- Attendance reports & analytics
- Absence notifications
- Attendance percentage calculation

**Events Emitted**:
- `AttendanceMarkedForClass`
- `StudentMarkedAbsent`
- `AttendanceSessionLocked`
- `LowAttendanceDetected`

**Dependencies**:
- Needs `StudentContext` for student list
- Needs `AcademicContext` for class/section info
- Listens to `StudentEnrolled` to add to tracking

---

### 7. 📝 **Assignments Context**
**Purpose**: Homework, assignments, submissions, grading  
**Owner**: Teachers  
**Tables Owned**: `assignments`, `submissions`, `assignment_grades`, `rubrics`

**Key Responsibilities**:
- Assignment creation & publishing
- Submission management
- Grading & feedback
- Late submission handling
- Assignment analytics

**Events Emitted**:
- `AssignmentPublished`
- `SubmissionReceived`
- `AssignmentGraded`
- `DeadlineMissed`

**Dependencies**:
- Needs `AcademicContext` for class/subject info
- Needs `StudentContext` for student list
- Emits events to `NotificationContext`

---

### 8. 📊 **Examination & Assessment Context**
**Purpose**: Exams, tests, marks entry, results  
**Owner**: Examination board & teachers  
**Tables Owned**: `exams`, `assessments`, `marks`, `grading_schemes`, `exam_categories`

**Key Responsibilities**:
- Exam scheduling
- Marks entry (bulk & individual)
- Grade calculation
- Result publication
- Mark moderation

**Events Emitted**:
- `ExamScheduled`
- `MarksEntered`
- `ResultPublished`
- `GradeCalculated`

**Dependencies**:
- Needs `AcademicContext` for subjects/classes
- Needs `StudentContext` for mark entry
- Publishes results to `ReportContext`

---

### 9. 📄 **Report Cards Context**
**Purpose**: Report generation, templates, distribution  
**Owner**: Academic administrators  
**Tables Owned**: `report_cards`, `report_templates`, `report_comments`

**Key Responsibilities**:
- Report card generation
- Template management
- Teacher comments
- PDF generation
- Report distribution

**Events Emitted**:
- `ReportCardGenerated`
- `ReportCardPublished`

**Dependencies**:
- Aggregates data from `ExamContext`
- Aggregates data from `AttendanceContext`
- Uses `StudentContext` for student info

---

### 10. 🗓️ **Timetable & Scheduling Context**
**Purpose**: Class schedules, periods, room allocation  
**Owner**: Timetable coordinator  
**Tables Owned**: `timetables`, `timetable_periods`, `periods`, `rooms`, `substitutions`

**Key Responsibilities**:
- Timetable creation
- Period management
- Room allocation
- Teacher substitutions
- Conflict resolution

**Events Emitted**:
- `TimetablePublished`
- `SubstitutionScheduled`
- `RoomAllocated`

**Dependencies**:
- Needs `AcademicContext` for class/subject info
- Needs `TeacherContext` for assignments
- Listens to `LeaveApproved` for substitutions

---

### 11. 📢 **Communication Context**
**Purpose**: Announcements, notifications, messaging  
**Owner**: Communication team  
**Tables Owned**: `announcements`, `messages`, `notifications`, `notification_preferences`

**Key Responsibilities**:
- Announcement publishing
- Push notifications
- Email delivery
- SMS/WhatsApp integration
- Notification preferences

**Events Emitted**:
- `AnnouncementPublished`
- `MessageSent`
- `NotificationDelivered`

**Dependencies**:
- **Listens to ALL modules** for events to notify
- Critical integration point for system-wide alerts

---

### 12. 📈 **Analytics & Insights Context**
**Purpose**: Dashboards, reports, KPIs, predictions  
**Owner**: Data analytics team  
**Tables Owned**: `analytics_cache`, `dashboard_widgets`, `kpi_metrics`

**Key Responsibilities**:
- Dashboard data aggregation
- Performance metrics calculation
- Trend analysis
- Predictive analytics (future)
- Data warehouse integration (future)

**Events Emitted**:
- `DashboardRefreshed`
- `AlertThresholdExceeded`

**Dependencies**:
- **Read-only access** to all module data
- Subscribes to events for real-time updates
- Pre-computes expensive aggregations

---

## 🏛️ Module Structure

Each module follows this **exact** structure for consistency:

```
modules/[domain-name]/
├── domain/                              # Domain entities (business objects)
│   ├── [entity].entity.ts               # Pure TypeScript classes
│   └── [value-object].vo.ts             # Value objects (immutable)
│
├── services/                            # Business logic layer
│   ├── [domain].service.ts              # Core domain service
│   ├── [feature].service.ts             # Feature-specific services
│   └── [calculation].service.ts         # Complex calculations
│
├── actions/                             # Server Actions (Next.js)
│   ├── [domain].actions.ts              # CRUD actions for UI
│   └── [feature].actions.ts             # Feature-specific actions
│
├── repository/                          # Data access layer
│   ├── [domain].repository.ts           # Database queries only
│   └── [cache].repository.ts            # Cache operations
│
├── types/                               # Module-specific TypeScript types
│   ├── [domain].types.ts                # DTOs, interfaces
│   └── [api].types.ts                   # Request/response types
│
├── validations/                         # Input validation schemas
│   ├── [domain].schema.ts               # Zod schemas
│   └── [rules].validator.ts             # Custom validators
│
├── events/                              # Domain events
│   ├── [event-name].event.ts            # Event definitions
│   └── [handler-name].handler.ts        # Event handlers
│
├── utils/                               # Module-specific utilities
│   └── [helper].util.ts                 # Pure functions
│
└── index.ts                             # Public API (ONLY export point)
```

### Layer Responsibilities

#### **Domain Layer** (`domain/`)
- Pure business entities (no framework dependencies)
- Domain logic that doesn't require external services
- Value objects (immutable data structures)

```typescript
// Example: modules/students/domain/student.entity.ts
export class Student {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dateOfBirth: Date,
    public readonly status: 'active' | 'withdrawn' | 'graduated'
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    const age = today.getFullYear() - this.dateOfBirth.getFullYear();
    return age;
  }

  canEnroll(): boolean {
    return this.status === 'active' && this.age >= 5;
  }
}
```

#### **Service Layer** (`services/`)
- Orchestrates business logic
- Calls repositories for data
- Emits domain events
- NO direct database access
- NO Next.js dependencies

```typescript
// Example: modules/students/services/student.service.ts
import { StudentRepository } from '../repository/student.repository';
import { EventBus } from '@/shared/events/event-bus';
import { StudentEnrolledEvent } from '../events/student-enrolled.event';

export class StudentService {
  static async enrollStudent(
    studentId: string,
    sectionId: string,
    academicYearId: string
  ) {
    // 1. Validate business rules
    const student = await StudentRepository.findById(studentId);
    if (!student.canEnroll()) {
      throw new Error('Student cannot be enrolled');
    }

    // 2. Perform enrollment
    const enrollment = await StudentRepository.createEnrollment({
      studentId,
      sectionId,
      academicYearId,
      status: 'active'
    });

    // 3. Emit domain event
    EventBus.emit(new StudentEnrolledEvent({
      studentId,
      sectionId,
      academicYearId,
      enrollmentId: enrollment.id
    }));

    return enrollment;
  }
}
```

#### **Actions Layer** (`actions/`)
- Next.js Server Actions ONLY
- Entry point for UI components
- Handles authentication/authorization
- Calls service layer
- Returns data to UI

```typescript
// Example: modules/students/actions/student.actions.ts
'use server';

import { StudentService } from '../services/student.service';
import { getCurrentUser } from '@/modules/auth';
import { hasPermission } from '@/shared/permissions/permission.guard';

export async function enrollStudentAction(
  studentId: string,
  sectionId: string,
  academicYearId: string
) {
  // 1. Authentication
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // 2. Authorization
  if (!hasPermission(user, 'students:enroll')) {
    throw new Error('Forbidden');
  }

  // 3. Call service
  const enrollment = await StudentService.enrollStudent(
    studentId,
    sectionId,
    academicYearId
  );

  return { success: true, data: enrollment };
}
```

#### **Repository Layer** (`repository/`)
- Database queries ONLY
- CRUD operations
- Query builders
- NO business logic

```typescript
// Example: modules/students/repository/student.repository.ts
import { createClient } from '@/shared/infrastructure/database/supabase-server';

export class StudentRepository {
  static async findById(id: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createEnrollment(params: {
    studentId: string;
    sectionId: string;
    academicYearId: string;
    status: string;
  }) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('enrollments')
      .insert(params)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

#### **Events Layer** (`events/`)
- Domain event definitions
- Event handlers (subscribers)
- Enables decoupled inter-module communication

```typescript
// Example: modules/students/events/student-enrolled.event.ts
import { DomainEvent } from '@/shared/events/domain-event';

export class StudentEnrolledEvent extends DomainEvent {
  constructor(
    public readonly payload: {
      studentId: string;
      sectionId: string;
      academicYearId: string;
      enrollmentId: string;
    }
  ) {
    super('student.enrolled', payload);
  }
}

// Example handler in Attendance module
// modules/attendance/events/student-enrolled.handler.ts
import { EventHandler } from '@/shared/events/event-handler';
import { StudentEnrolledEvent } from '@/modules/students';
import { AttendanceService } from '../services/attendance.service';

export class StudentEnrolledHandler implements EventHandler<StudentEnrolledEvent> {
  async handle(event: StudentEnrolledEvent) {
    // When student enrolls, initialize attendance tracking
    await AttendanceService.initializeTracking(
      event.payload.studentId,
      event.payload.sectionId
    );
  }
}
```

---

## 🗂️ Data Ownership & Boundaries

### Data Ownership Matrix

| Module | Owned Tables | Read-Only Access | Access Via Events |
|--------|--------------|------------------|-------------------|
| **Schools** | schools, campuses, academic_years | - | All modules validate school_id |
| **Auth** | profiles, roles, role_permissions | - | All modules use for authorization |
| **Academic** | classes, sections, subjects, class_subjects | - | Referenced by Students, Attendance |
| **Students** | students, guardians, enrollments | Academic (class_id) | Attendance, Assignments, Exams |
| **Teachers** | teachers, teacher_qualifications, teacher_leaves | Academic (teacher assignments) | Timetable, Assignments |
| **Attendance** | attendance_sessions, attendance_records | - | Analytics (read-only) |
| **Assignments** | assignments, submissions, assignment_grades | - | Analytics (read-only) |
| **Exams** | exams, assessments, marks | - | Reports, Analytics |
| **Reports** | report_cards, report_templates | - | - |
| **Timetable** | timetables, timetable_periods, rooms, substitutions | - | Communication (for notifications) |
| **Communication** | announcements, messages, notifications | - | All modules trigger notifications |
| **Analytics** | analytics_cache, dashboard_widgets | ALL (read-only) | Subscribes to all events |

### Foreign Key Rules

**Rule 1**: Foreign keys can **only reference** tables owned by:
- The same module
- The `Schools` module (school_id everywhere)
- The `Auth` module (user references)
- The `Academic` module (class_id, subject_id - structural dependencies)

**Rule 2**: Cross-module relationships use **value objects** (IDs only), not direct foreign keys.

**Example**:
```sql
-- ✅ GOOD: Students module references Academic module
CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),  -- Own module
  section_id UUID REFERENCES sections(id),  -- Academic module (allowed)
  academic_year_id UUID REFERENCES academic_years(id),  -- Allowed
  school_id UUID REFERENCES schools(id)     -- Always allowed
);

-- ❌ BAD: Attendance module directly querying students table
-- This should be done through service layer communication
SELECT * FROM students WHERE id = ?  -- FORBIDDEN from Attendance module
```

---

## 🔄 Communication Patterns

### Pattern 1: **Synchronous - Direct Service Call** (Same Module Only)

```typescript
// ✅ ALLOWED: Service calls repository within same module
// modules/students/services/student.service.ts
import { StudentRepository } from '../repository/student.repository';

const student = await StudentRepository.findById(studentId);
```

### Pattern 2: **Synchronous - Public API Call** (Cross-Module Read)

```typescript
// ✅ ALLOWED: Use exported public API from module's index.ts
// modules/attendance/services/attendance.service.ts
import { getStudentsBySection } from '@/modules/students';  // From index.ts

const students = await getStudentsBySection(sectionId);
```

**Rule**: Only call **read operations** from other modules. Never call **write operations**.

### Pattern 3: **Asynchronous - Domain Events** (Cross-Module Reactions)

```typescript
// ✅ PREFERRED: Use events for cross-module business logic
// modules/students/services/student.service.ts
EventBus.emit(new StudentEnrolledEvent({ studentId, sectionId }));

// modules/attendance/events/student-enrolled.handler.ts
EventBus.on(StudentEnrolledEvent, async (event) => {
  await AttendanceService.initializeTracking(event.payload.studentId);
});

// modules/communication/events/student-enrolled.handler.ts
EventBus.on(StudentEnrolledEvent, async (event) => {
  await NotificationService.sendWelcomeNotification(event.payload.studentId);
});
```

### Pattern 4: **Query Pattern** (Analytics & Reporting)

```typescript
// ✅ ALLOWED: Analytics module reads from all tables (read-only)
// modules/analytics/services/dashboard.service.ts
const data = await AnalyticsRepository.getAggregatedData({
  attendanceTable: 'attendance_records',
  studentsTable: 'students',
  examsTable: 'marks'
});
```

**Rule**: Analytics module has **read-only** access to all tables for reporting purposes.

---

## 💻 Implementation Examples

### Example 1: Student Admission Flow

**Scenario**: Admin admits a new student and assigns to a class.

**Flow**:
1. UI calls `admitStudentAction`
2. Action validates permissions
3. Service creates student record
4. Service emits `StudentAdmittedEvent`
5. Attendance module listens and initializes tracking
6. Communication module listens and sends welcome email
7. Analytics module updates student count cache

**Code**:

```typescript
// ===== Step 1: UI Component =====
// app/school-admin/students/admissions/page.tsx
import { admitStudentAction } from '@/modules/students';

function AdmissionForm() {
  async function handleSubmit(data) {
    const result = await admitStudentAction(data);
    if (result.success) {
      toast.success('Student admitted successfully');
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// ===== Step 2: Server Action =====
// modules/students/actions/student.actions.ts
'use server';

export async function admitStudentAction(data) {
  const user = await getCurrentUser();
  if (!hasPermission(user, 'students:create')) {
    throw new Error('Unauthorized');
  }

  return await StudentService.admitStudent(data);
}

// ===== Step 3: Service =====
// modules/students/services/student.service.ts
export class StudentService {
  static async admitStudent(data) {
    // Validate business rules
    await this.validateAdmission(data);

    // Create student
    const student = await StudentRepository.create({
      ...data,
      status: 'active',
      admission_date: new Date()
    });

    // Create guardian
    if (data.guardian) {
      await StudentRepository.createGuardian(student.id, data.guardian);
    }

    // Emit event
    EventBus.emit(new StudentAdmittedEvent({
      studentId: student.id,
      schoolId: data.school_id,
      admissionDate: student.admission_date
    }));

    return { success: true, data: student };
  }
}

// ===== Step 4: Event Handlers =====
// modules/attendance/events/handlers.ts
EventBus.on(StudentAdmittedEvent, async (event) => {
  await AttendanceService.initializeStudentTracking(event.payload.studentId);
});

// modules/communication/events/handlers.ts
EventBus.on(StudentAdmittedEvent, async (event) => {
  await NotificationService.sendWelcomeEmail(event.payload.studentId);
});

// modules/analytics/events/handlers.ts
EventBus.on(StudentAdmittedEvent, async (event) => {
  await AnalyticsService.incrementStudentCount(event.payload.schoolId);
});
```

---

### Example 2: Attendance Marking Flow

**Scenario**: Teacher marks attendance for a class.

**Flow**:
1. UI calls `markAttendanceAction`
2. Action validates teacher has permission for that class
3. Service creates/updates attendance session
4. Service creates attendance records
5. Service emits `AttendanceMarkedEvent`
6. Analytics module updates attendance percentage cache
7. Communication module checks for absent students and notifies guardians

**Code**:

```typescript
// ===== Step 1: Server Action =====
// modules/attendance/actions/attendance.actions.ts
'use server';

export async function markAttendanceAction(sessionId, records) {
  const user = await getCurrentUser();
  
  // Verify teacher is assigned to this class
  const hasAccess = await verifyClassAccess(user.id, sessionId);
  if (!hasAccess) throw new Error('Unauthorized');

  return await AttendanceService.markAttendance(sessionId, records, user.id);
}

// ===== Step 2: Service =====
// modules/attendance/services/attendance.service.ts
export class AttendanceService {
  static async markAttendance(sessionId, records, markedBy) {
    // Lock session
    const session = await AttendanceRepository.getSession(sessionId);
    if (session.is_locked) {
      throw new Error('Session is locked');
    }

    // Create records
    const created = await AttendanceRepository.bulkCreateRecords(
      sessionId,
      records
    );

    // Update session stats
    const stats = this.calculateStats(records);
    await AttendanceRepository.updateSession(sessionId, {
      ...stats,
      marked_by: markedBy,
      marked_at: new Date()
    });

    // Emit event
    EventBus.emit(new AttendanceMarkedEvent({
      sessionId,
      classId: session.class_id,
      date: session.session_date,
      absentStudents: records.filter(r => r.status === 'absent').map(r => r.student_id),
      totalRecords: records.length
    }));

    return { success: true, data: created };
  }
}

// ===== Step 3: Event Handlers =====
// modules/analytics/events/handlers.ts
EventBus.on(AttendanceMarkedEvent, async (event) => {
  await AnalyticsService.updateAttendanceTrends(event.payload);
});

// modules/communication/events/handlers.ts
EventBus.on(AttendanceMarkedEvent, async (event) => {
  // Send SMS to guardians of absent students
  for (const studentId of event.payload.absentStudents) {
    await NotificationService.notifyAbsence(studentId, event.payload.date);
  }
});
```

---

## 🚀 Migration Strategy

### Phase 1: Foundation (Week 1-2)

**Goal**: Set up shared infrastructure and event bus.

1. **Create shared infrastructure**
   ```bash
   mkdir -p shared/infrastructure/{database,events,errors,permissions}
   mkdir -p shared/types shared/utils shared/config
   ```

2. **Implement event bus**
   ```typescript
   // shared/events/event-bus.ts
   export class EventBus {
     private static handlers = new Map();
     
     static on(eventType, handler) {
       if (!this.handlers.has(eventType)) {
         this.handlers.set(eventType, []);
       }
       this.handlers.get(eventType).push(handler);
     }
     
     static async emit(event) {
       const handlers = this.handlers.get(event.constructor) || [];
       await Promise.all(handlers.map(h => h.handle(event)));
     }
   }
   ```

3. **Move Supabase clients to shared**
   ```bash
   mv lib/supabase/* shared/infrastructure/database/
   ```

### Phase 2: First Module Migration (Week 3-4)

**Goal**: Migrate ONE module completely as a proof of concept.

**Recommended**: Start with **Students** module (most independent).

1. **Create module structure**
   ```bash
   mkdir -p modules/students/{domain,services,actions,repository,types,validations,events,utils}
   ```

2. **Move existing code**
   ```bash
   # Move service
   mv lib/services/student-management.ts modules/students/services/student.service.ts
   
   # Move types
   mv lib/types/student.ts modules/students/types/student.types.ts
   
   # Move actions
   mv lib/actions/student-actions.ts modules/students/actions/student.actions.ts
   ```

3. **Extract repository layer**
   ```typescript
   // modules/students/repository/student.repository.ts
   // Extract all Supabase queries from student.service.ts
   ```

4. **Create module index.ts**
   ```typescript
   // modules/students/index.ts
   export * from './actions/student.actions';
   export * from './types/student.types';
   export * from './events/student-enrolled.event';
   // DO NOT export services or repositories
   ```

5. **Update imports across codebase**
   ```typescript
   // Before
   import { getStudents } from '@/lib/services/student-management';
   
   // After
   import { getStudents } from '@/modules/students';
   ```

### Phase 3: Complete Core Modules (Week 5-8)

Migrate in this order (dependency-aware):

1. **Schools** (no dependencies)
2. **Auth** (no dependencies)
3. **Academic** (depends on Schools)
4. **Teachers** (depends on Auth, Academic)
5. **Attendance** (depends on Students, Academic)
6. **Assignments** (depends on Students, Academic, Teachers)
7. **Exams** (depends on Students, Academic)

### Phase 4: Secondary Modules (Week 9-10)

8. **Reports** (aggregates Exams, Attendance)
9. **Timetable** (depends on Academic, Teachers)
10. **Communication** (integrates with all)
11. **Analytics** (reads from all)

### Phase 5: Cleanup (Week 11-12)

1. **Delete old folders**
   ```bash
   rm -rf lib/services
   rm -rf lib/actions
   rm -rf services/ (legacy)
   rm -rf app/api/ (replace with actions)
   ```

2. **Add import linting rules**
   ```javascript
   // eslint.config.js
   rules: {
     'no-restricted-imports': ['error', {
       patterns: [{
         group: ['@/modules/*/services/*', '@/modules/*/repository/*'],
         message: 'Import from module index.ts only'
       }]
     }]
   }
   ```

3. **Add TypeScript path restrictions**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/modules/students": ["./modules/students/index.ts"],
         "@/modules/students/*": ["./modules/students/*"]
       }
     }
   }
   ```

---

## 🛡️ Enforcement Mechanisms

### 1. **ESLint Rules**

```javascript
// eslint.config.js
module.exports = {
  rules: {
    // Prevent direct cross-module imports
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/modules/*/services/*'],
            message: 'Services are internal. Import from module index.ts'
          },
          {
            group: ['@/modules/*/repository/*'],
            message: 'Repositories are internal. Import from module index.ts'
          },
          {
            group: ['@/modules/*/domain/*'],
            message: 'Domain entities are internal. Import from module index.ts'
          }
        ]
      }
    ]
  }
};
```

### 2. **TypeScript Project References**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/modules/students": ["./modules/students/index.ts"],
      "@/modules/attendance": ["./modules/attendance/index.ts"],
      "@/modules/*": ["./modules/*/index.ts"],
      "@/shared/*": ["./shared/*"]
    }
  }
}
```

### 3. **Git Pre-commit Hooks**

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for forbidden imports
if git diff --cached --name-only | grep -q "modules/"; then
  npm run lint:architecture
fi

# Architecture linting script
# package.json
{
  "scripts": {
    "lint:architecture": "node scripts/lint-architecture.js"
  }
}
```

```javascript
// scripts/lint-architecture.js
const fs = require('fs');
const path = require('path');

const FORBIDDEN_PATTERNS = [
  /from ['"]@\/modules\/\w+\/services/,
  /from ['"]@\/modules\/\w+\/repository/,
  /from ['"]@\/modules\/\w+\/domain/
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`❌ Forbidden import in ${filePath}`);
      console.error(`   Import from module's index.ts instead`);
      process.exit(1);
    }
  }
}

// Scan all files in modules/
const modulesDir = path.join(__dirname, '../modules');
// ... implementation
```

### 4. **Architecture Decision Records (ADRs)**

Create docs for each architectural decision:

```markdown
// docs/adr/001-module-boundaries.md
# ADR 001: Module Boundaries and Communication

## Status
Accepted

## Context
Need clear rules for how modules interact.

## Decision
- Modules communicate via events for writes
- Modules can call public APIs for reads
- No direct service-to-service calls across modules

## Consequences
- Increased decoupling
- Easier testing
- Slight performance overhead from event bus
```

---

## ⚠️ Anti-Patterns to Avoid

### Anti-Pattern 1: **Direct Cross-Module Service Call**

```typescript
// ❌ BAD
// modules/attendance/services/attendance.service.ts
import { StudentService } from '@/modules/students/services/student.service';

const student = await StudentService.getById(studentId);  // FORBIDDEN
```

**Why**: Creates tight coupling, makes modules interdependent.

**Fix**: Use public API from module index or events.

```typescript
// ✅ GOOD
import { getStudentById } from '@/modules/students';  // From index.ts

const student = await getStudentById(studentId);
```

---

### Anti-Pattern 2: **Bypassing Repository Layer**

```typescript
// ❌ BAD
// modules/students/services/student.service.ts
import { createClient } from '@/shared/infrastructure/database/supabase-server';

const supabase = await createClient();
const { data } = await supabase.from('students').select('*');  // Bypass repository
```

**Why**: Couples service to database implementation, hard to test.

**Fix**: Always use repository.

```typescript
// ✅ GOOD
import { StudentRepository } from '../repository/student.repository';

const students = await StudentRepository.findAll();
```

---

### Anti-Pattern 3: **UI Component Calling Service Directly**

```typescript
// ❌ BAD
// components/students/student-list.tsx
'use client';
import { StudentService } from '@/modules/students/services/student.service';

const students = await StudentService.getAll();  // Client component calling service
```

**Why**: Server-side code in client component, violates Next.js architecture.

**Fix**: Use Server Actions.

```typescript
// ✅ GOOD
'use client';
import { getStudentsAction } from '@/modules/students';

const students = await getStudentsAction();  // Calls server action
```

---

### Anti-Pattern 4: **Business Logic in Repository**

```typescript
// ❌ BAD
// modules/students/repository/student.repository.ts
export class StudentRepository {
  static async enrollStudent(studentId, sectionId) {
    // Validate enrollment rules
    if (await this.isAlreadyEnrolled(studentId)) {  // Business logic in repo
      throw new Error('Already enrolled');
    }
    
    // Create enrollment
    return await supabase.from('enrollments').insert(...);
  }
}
```

**Why**: Repository should be pure data access, no business rules.

**Fix**: Move business logic to service.

```typescript
// ✅ GOOD
// modules/students/services/student.service.ts
export class StudentService {
  static async enrollStudent(studentId, sectionId) {
    // Business logic here
    const existing = await StudentRepository.findEnrollment(studentId);
    if (existing) {
      throw new Error('Already enrolled');
    }
    
    return await StudentRepository.createEnrollment({ studentId, sectionId });
  }
}

// modules/students/repository/student.repository.ts
export class StudentRepository {
  static async createEnrollment(data) {
    // Pure data access only
    return await supabase.from('enrollments').insert(data);
  }
}
```

---

### Anti-Pattern 5: **Synchronous Event Handling for Critical Path**

```typescript
// ❌ BAD
EventBus.on(StudentAdmittedEvent, async (event) => {
  // Blocking operation on critical path
  await sendEmail(event.studentId);  // If email fails, admission fails
});
```

**Why**: Critical business operations shouldn't depend on side effects.

**Fix**: Use async event handling with retry logic.

```typescript
// ✅ GOOD
EventBus.on(StudentAdmittedEvent, async (event) => {
  try {
    await sendEmail(event.studentId);
  } catch (error) {
    // Queue for retry
    await NotificationQueue.enqueue(event);
  }
});
```

---

### Anti-Pattern 6: **God Module** (Module Doing Too Much)

```typescript
// ❌ BAD
modules/students/
├── services/
│   ├── student.service.ts
│   ├── enrollment.service.ts
│   ├── guardian.service.ts
│   ├── attendance.service.ts          // Wrong module
│   ├── marks.service.ts                // Wrong module
│   └── report-card.service.ts          // Wrong module
```

**Why**: Student module owns too many concerns, violates single responsibility.

**Fix**: Create separate modules for each bounded context.

```typescript
// ✅ GOOD
modules/students/           // Only student & enrollment
modules/attendance/         // Attendance logic
modules/exams/             // Marks & assessments
modules/reports/           // Report cards
```

---

## 📚 References & Resources

### Internal Documentation
- [Coupling Analysis](./COUPLING_ANALYSIS.md)
- [Database Schema](./database.md)
- [Authorization Guide](./docs/AUTHORIZATION.md)

### External Resources
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Modular Monoliths by Kamil Grzybek](https://www.kamilgrzybek.com/design/modular-monolith-primer/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

---

## ✅ Success Criteria

The decoupled architecture is successfully implemented when:

- [ ] All modules follow the standard structure
- [ ] No direct cross-module service imports exist
- [ ] All UI → Service calls go through Server Actions
- [ ] All cross-module communication uses events
- [ ] Each module has 90%+ test coverage
- [ ] ESLint passes with architecture rules
- [ ] TypeScript compilation with strict paths succeeds
- [ ] New features can be added without touching existing modules
- [ ] Build time remains under 2 minutes
- [ ] Hot reload time remains under 3 seconds

---

**Document Owner**: Architecture Team  
**Last Updated**: February 14, 2026  
**Next Review**: March 14, 2026

---

**Questions or Suggestions?**  
Open a discussion in the `#architecture` channel or create an issue.
