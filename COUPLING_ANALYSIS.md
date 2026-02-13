# Coupling Analysis - SchoolIQ Project

**Analysis Date:** February 12, 2026  
**Project Type:** Coupled Monolith (60% coupled, 40% decoupled)

## Executive Summary

This document identifies all coupling issues in the SchoolIQ codebase where components, pages, and modules bypass architectural layers and create tight dependencies. The main issues are:

1. **Direct Database Access from UI Layer** - Pages and components directly importing Supabase
2. **Layer Skipping** - Bypassing service/action layers
3. **Duplicate Service Layers** - `/lib/services` vs `/services` confusion
4. **Mixed Architectural Patterns** - API Routes + Server Actions + Direct Service Calls
5. **Inconsistent Access Patterns** - No single source of truth for data access

---

## 🔴 Category 1: Direct Supabase Access from Pages/Components

### High Severity - Pages with Direct Database Access

These files bypass all service layers and directly access Supabase, creating tight coupling:

#### `/app/dashboard/`

- **File:** `app/dashboard/page.tsx` (Line 1)
  - **Issue:** `import { createClient } from "@/lib/supabase/server"`
  - **Coupling:** Direct database access from page component
  - **Impact:** Cannot switch databases without modifying UI layer
  - **Should Use:** Server Action or Service Layer

- **File:** `app/dashboard/layout.tsx` (Line 7)
  - **Issue:** Direct Supabase client import
  - **Coupling:** Layout component accessing database
  - **Impact:** Tight coupling between auth and UI
  - **Should Use:** Auth context or server action

- **File:** `app/dashboard/teachers/leaves/page.tsx`
  - **Issue:** Client-side component making direct API calls
  - **Coupling:** UI logic mixed with data fetching
  - **Impact:** Cannot reuse logic, hard to test
  - **Should Use:** Custom hook with server action

#### `/app/school-admin/`

- **File:** `app/school-admin/layout.tsx` (Line 3)
  - **Issue:** `import { createClient } from "@/lib/supabase/server"`
  - **Coupling:** Layout accessing database for auth
  - **Impact:** Every route under school-admin tightly coupled
  - **Should Use:** Middleware or auth service

- **File:** `app/school-admin/settings/page.tsx` (Line 1)
  - **Issue:** Direct Supabase import
  - **Coupling:** Settings page accessing database directly
  - **Impact:** Business logic in UI layer
  - **Should Use:** Server action from `lib/actions/`

- **File:** `app/school-admin/profile/page.tsx` (Line 1)
  - **Issue:** Direct Supabase import
  - **Coupling:** Profile CRUD in page component
  - **Impact:** Cannot reuse profile logic elsewhere
  - **Should Use:** Profile service or action

- **File:** `app/school-admin/teachers/page.tsx` (Line 2)
  - **Issue:** Direct service import with no abstraction
  - **Coupling:** Page knows about data source
  - **Should Use:** React Query with server action wrapper

- **File:** `app/school-admin/teachers/[id]/page.tsx` (Line 1)
  - **Issue:** `import { createClient } from "@/lib/supabase/server"`
  - **Coupling:** Detail page with direct DB access
  - **Impact:** Teacher detail logic not reusable
  - **Should Use:** Server action

- **File:** `app/school-admin/attendance/page.tsx` (Line 1)
  - **Issue:** Direct database access
  - **Coupling:** Attendance logic in UI
  - **Should Use:** Attendance service through action layer

- **File:** `app/school-admin/attendance/mark/page.tsx` (Line 1)
  - **Issue:** Direct Supabase client
  - **Coupling:** Critical business logic in UI
  - **Should Use:** Attendance action from `lib/actions/attendance-actions.ts`

- **File:** `app/school-admin/attendance/mark/[id]/page.tsx` (Line 1-3)
  - **Issue:** Direct Supabase import
  - **Coupling:** Dynamic route with DB access
  - **Should Use:** Server action wrapper

- **File:** `app/school-admin/academics/classes/page.tsx` (Line 3)
  - **Issue:** Imports `getCurrentSchoolId` from service layer
  - **Coupling:** Page component calling service directly
  - **Should Use:** Server component prop or action

- **File:** `app/school-admin/academics/classes/[id]/_components/student-list.tsx` (Line 13)
  - **Issue:** `import { createClient } from "@/lib/supabase/client"`
  - **Coupling:** **CLIENT-SIDE** component with DB access
  - **Impact:** Exposes database logic to browser
  - **Should Use:** API route or server action with client hook

- **File:** `app/school-admin/academics/exams/create/page.tsx` (Line 1, 8)
  - **Issue:** Multiple imports: service + direct Supabase
  - **Coupling:** Mixed patterns in single file
  - **Should Use:** Consolidate to one approach

- **File:** `app/school-admin/assignments/page.tsx` (Line 1)
  - **Issue:** Direct service call
  - **Coupling:** Assignment logic in UI
  - **Should Use:** Assignment action

- **File:** `app/school-admin/assignments/create/page.tsx` (Line 1)
  - **Issue:** Direct service import
  - **Coupling:** Create logic in UI layer
  - **Should Use:** Server action

- **File:** `app/school-admin/communication/page.tsx` (Line 1)
  - **Issue:** Service layer direct access
  - **Coupling:** Communication logic not abstracted
  - **Should Use:** Action layer

- **File:** `app/school-admin/reports/page.tsx` (Line 1)
  - **Issue:** Direct service call
  - **Coupling:** Report generation in UI
  - **Should Use:** Background job or action

- **File:** `app/school-admin/calendar/_components/calendar-view.tsx` (Line 19)
  - **Issue:** `import { eventsService } from "@/lib/services/events"`
  - **Coupling:** Component importing service directly
  - **Impact:** Component logic coupled to service implementation
  - **Should Use:** Props from parent with server action

- **File:** `app/school-admin/calendar/_components/create-event-modal.tsx` (Line 48)
  - **Issue:** Modal component with service import
  - **Coupling:** UI component with business logic
  - **Should Use:** Callback prop with action

- **File:** `app/school-admin/calendar/_components/edit-event-modal.tsx` (Line 48)
  - **Issue:** Direct service import in modal
  - **Coupling:** Edit logic in presentation component
  - **Should Use:** Parent container with action

- **File:** `app/school-admin/dashboard/page.tsx` (Line 6)
  - **Issue:** Dashboard calling service directly
  - **Coupling:** Dashboard knows about service implementation
  - **Should Use:** Server component with action

- **File:** `app/school-admin/dashboard/_components/recent-activity.tsx` (Line 6)
  - **Issue:** `import { getRecentActivities } from "@/lib/services/dashboard"`
  - **Coupling:** Dashboard component with service
  - **Should Use:** Props from parent server component

- **File:** `app/school-admin/dashboard/_components/upcoming-events.tsx` (Line 5)
  - **Issue:** `import { getUpcomingEvents } from "@/lib/services/dashboard"`
  - **Coupling:** Component fetching its own data
  - **Should Use:** Props from parent

- **File:** `app/school-admin/students/page.tsx`
  - **Issue:** Makes direct API fetch calls to `/api/students`
  - **Coupling:** Client-side fetching instead of server component
  - **Should Use:** Server component with direct service call or server action

#### `/app/super-admin/`

- **File:** `app/super-admin/layout.tsx` (Line 3)
  - **Issue:** `import { createClient } from "@/lib/supabase/server"`
  - **Coupling:** Layout with direct DB access
  - **Impact:** All super-admin routes coupled
  - **Should Use:** Auth middleware

- **File:** `app/super-admin/page.tsx` (Line 1)
  - **Issue:** `import { superAdminService } from "@/lib/services/super-admin"`
  - **Coupling:** Direct service import
  - **Should Use:** Server action wrapper

- **File:** `app/super-admin/dashboard/page.tsx` (Line 1)
  - **Issue:** Service layer import
  - **Coupling:** Dashboard logic in page
  - **Should Use:** Action layer

- **File:** `app/super-admin/schools/page.tsx` (Line 1)
  - **Issue:** Direct superAdminService import
  - **Coupling:** School management in UI
  - **Should Use:** School management action

- **File:** `app/super-admin/schools/[id]/page.tsx` (Line 1)
  - **Issue:** Service direct import
  - **Coupling:** Detail page with service knowledge
  - **Should Use:** Action wrapper

- **File:** `app/super-admin/users/page.tsx` (Line 1)
  - **Issue:** `import { superAdminService } from "@/lib/services/super-admin"`
  - **Coupling:** User management in UI layer
  - **Should Use:** User action

- **File:** `app/super-admin/audit/page.tsx` (Line 3)
  - **Issue:** `import { SuperAdminService } from "@/services/super-admin"`
  - **Coupling:** Uses OLD service location `/services`
  - **Should Use:** Consistent service from `/lib/services`

- **File:** `app/super-admin/billing/page.tsx` (Line 7)
  - **Issue:** `import { SuperAdminService } from "@/services/super-admin"`
  - **Coupling:** Uses `/services` instead of `/lib/services`
  - **Should Use:** Standardized location

#### `/app/dashboard/`

- **File:** `app/dashboard/teacher/page.tsx` (Line 5)
  - **Issue:** `import { TEACHER_METRICS } from "@/services/mocks/teacher-data"`
  - **Coupling:** Imports from `/services` folder (old location)
  - **Should Use:** Mock data from `/lib/` or consolidated location

- **File:** `app/dashboard/student/page.tsx` (Line 5)
  - **Issue:** `import { STUDENT_METRICS } from "@/services/mocks/student-parent-data"`
  - **Coupling:** Old service folder reference
  - **Should Use:** Consistent mock location

---

## 🟠 Category 2: Duplicate Service Layer Confusion

### Service Layer Duplication Issue

The project has TWO service layers causing confusion and inconsistent imports:

#### Primary Service Layer: `/lib/services/`

Contains 30+ domain services (SHOULD BE THE STANDARD):

```
lib/services/
├── assignment-grading.ts
├── assignment-management.ts
├── assignment-submission.ts
├── attendance-analytics.ts
├── attendance-record.ts
├── attendance-session.ts
├── audit.ts
├── auth.ts
├── class.ts
├── dashboard.ts
├── email.ts
├── enrollment.ts
├── events.ts
├── exam.ts
├── grading-management.ts
├── index.ts
├── marks.ts
├── moderation.ts
├── notification.ts
├── period.ts
├── report-card.ts
├── result.ts
├── room.ts
├── student-management.ts
├── student-records.ts
├── subject.ts
├── submission-management.ts
├── substitution.ts
├── super-admin.ts
├── teacher-leave.ts
├── teacher-management.ts
├── teacher-performance.ts
├── teacher.ts
└── timetable.ts
```

**Status:** ✅ Well-organized, domain-driven design

#### Secondary Service Layer: `/services/`

Contains legacy/duplicate services (SHOULD BE REMOVED OR MERGED):

```
services/
├── api.ts (Mock API - legacy)
├── auth.ts (Duplicates lib/services/auth.ts)
├── database.ts (Generic DB service)
├── database-server.ts (Server-specific)
├── notifications.ts (Duplicates lib/services/notification.ts)
├── super-admin.ts (Duplicates lib/services/super-admin.ts)
├── analytics/ (Folder)
└── mocks/ (Mock data)
```

**Status:** ⚠️ Causes confusion, some files import from here instead

### Files Using `/services/` (Old Location)

- `app/super-admin/audit/page.tsx` - Uses `/services/super-admin`
- `app/super-admin/billing/page.tsx` - Uses `/services/super-admin`
- `app/dashboard/teacher/page.tsx` - Uses `/services/mocks`
- `app/dashboard/student/page.tsx` - Uses `/services/mocks`

**Impact:** Developers don't know which service location to use

**Solution:**

1. Consolidate everything into `/lib/services/`
2. Remove `/services/` folder
3. Update all imports to use `/lib/services/`

---

## 🟡 Category 3: Mixed Architectural Patterns

### Multiple Data Access Patterns

The project uses THREE different patterns inconsistently:

#### Pattern 1: API Routes (`/app/api/`)

```
app/api/
├── analytics/
├── assignments/
├── attendance/
├── auth/
├── enrollments/
├── exams/
├── grading/
├── leaves/
├── marks/
├── moderation/
├── performance-reviews/
├── periods/
├── register-school/
├── report-cards/
├── results/
├── rooms/
├── school-admin/
├── students/
├── submissions/
├── substitutions/
├── super-admin/
├── teachers/
└── timetable/
```

**Usage Example:** `app/school-admin/students/page.tsx` makes `fetch('/api/students')`

#### Pattern 2: Server Actions (`/lib/actions/`)

```
lib/actions/
├── announcement-actions.ts
├── assignment-actions.ts
├── attendance-actions.ts
├── class-actions.ts
├── exam-actions.ts
├── report-actions.ts
├── student-actions.ts
├── subject-actions.ts
└── teacher-actions.ts
```

**Usage Example:** Some forms call server actions directly

#### Pattern 3: Direct Service Calls

**Usage Example:** Pages importing from `/lib/services/` directly

### Coupling Issue: No Clear Pattern

- **API Routes** are RESTful endpoints (overhead for internal calls)
- **Server Actions** are Next.js 14+ preferred approach
- **Direct Services** skip action layer entirely

**Files Exhibiting Pattern Confusion:**

1. **`app/api/students/route.ts`**
   - Creates API route
   - But also has `lib/actions/student-actions.ts`
   - Both do same thing differently

2. **Student Management:**
   - API Route: `app/api/students/route.ts`
   - Server Action: `lib/actions/student-actions.ts`
   - Direct Service: Pages importing `StudentManagementService`
   - **Result:** 3 ways to get student data!

3. **Attendance:**
   - `app/api/attendance/` - API route
   - `lib/actions/attendance-actions.ts` - Server action
   - Pages call services directly
   - **Result:** Inconsistent pattern

**Impact:**

- Developers confused about which to use
- Code duplication
- Harder to maintain
- Inconsistent error handling

**Solution:** Pick ONE pattern (recommend Server Actions for Next.js 14+)

---

## 🔵 Category 4: Component-Level Coupling

### Components with Business Logic

These components should be presentational but contain business logic:

#### `/components/school-admin/`

- **Folder:** `components/school-admin/`
  - **Issue:** Very sparse (only profile, settings, sidebar, timetable)
  - **Coupling:** Most school-admin logic is in pages, not components
  - **Impact:** No reusability, hard to test
  - **Should Have:** More shared components extracting logic from pages

#### `/components/providers/`

- **File:** `components/providers/auth-provider.tsx` (Line 10)
  - **Issue:** `import { createClient } from "@/lib/supabase/client"`
  - **Coupling:** Auth provider directly accessing database
  - **Impact:** Auth logic coupled to Supabase
  - **Should Use:** Auth service abstraction

#### Calendar Components

- `components/../calendar-view.tsx`
- `components/../create-event-modal.tsx`
- `components/../edit-event-modal.tsx`
  - **Issue:** All import `eventsService` directly
  - **Coupling:** Presentation components with data access
  - **Should Use:** Container/Presenter pattern

#### Dashboard Components

- `components/../recent-activity.tsx`
- `components/../upcoming-events.tsx`
  - **Issue:** Components fetch their own data
  - **Coupling:** Smart components instead of dumb components
  - **Should Use:** Props from parent server component

---

## 🟣 Category 5: Cross-Cutting Concerns

### Authentication Coupling

**Files Coupled to Supabase Auth:**

1. `lib/supabase/auth-middleware.ts`
   - Tightly coupled to Supabase auth
   - Cannot switch auth providers

2. `lib/auth/` folder
   - All auth logic assumes Supabase
   - No abstraction layer

3. Multiple layouts import `createClient` for auth checks
   - `app/dashboard/layout.tsx`
   - `app/school-admin/layout.tsx`
   - `app/super-admin/layout.tsx`

**Impact:** Cannot switch from Supabase without massive refactor

**Solution:** Create auth service abstraction

### Database Coupling

**Global Database Dependency:**

- **File:** `lib/supabase/client.ts` & `lib/supabase/server.ts`
  - **Issue:** Imported EVERYWHERE
  - **Coupling:** Entire app coupled to Supabase
  - **Impact:** Cannot switch databases

**Services Directly Using Supabase:**

ALL services in `/lib/services/` start with:

```typescript
import { createClient } from "@/lib/supabase/server";
```

**Examples:**

- `lib/services/student-management.ts` (Line 1)
- `lib/services/attendance-session.ts` (Line 9)
- `lib/services/assignment-management.ts` (Line 10)
- (30+ more files)

**Impact:** Changing database requires editing 30+ service files

**Solution:** Repository pattern with database abstraction

---

## 📊 Coupling Statistics

### By Severity

| Severity    | Count | Files                        |
| ----------- | ----- | ---------------------------- |
| 🔴 Critical | 25    | Pages with direct DB access  |
| 🟠 High     | 8     | Duplicate service imports    |
| 🟡 Medium   | 15    | Mixed patterns               |
| 🟢 Low      | 30+   | Services coupled to Supabase |

### By Category

| Category           | Issues      | Impact                             |
| ------------------ | ----------- | ---------------------------------- |
| Layer Skipping     | 25 files    | High - Cannot enforce architecture |
| Duplicate Services | 2 locations | Medium - Confusion                 |
| Mixed Patterns     | 3 patterns  | High - No consistency              |
| DB Coupling        | 40+ files   | Critical - Cannot swap DB          |
| Auth Coupling      | 10+ files   | High - Cannot swap auth            |

### Architectural Debt Score: **7.5/10** (Higher = More Debt)

---

## 🎯 Decoupling Roadmap

### Phase 1: Consolidation (Week 1-2)

**Priority: HIGH**

1. **Merge Service Layers**
   - [ ] Move all `/services/` into `/lib/services/`
   - [ ] Update all imports
   - [ ] Remove `/services/` folder
   - Files affected: 8

2. **Standardize Access Pattern**
   - [ ] Choose: Server Actions (recommended)
   - [ ] Remove API routes or convert to Server Actions
   - [ ] Update all pages to use actions
   - Files affected: 25+

### Phase 2: Layer Enforcement (Week 3-4)

**Priority: HIGH**

3. **Remove Direct DB Access**
   - [ ] Remove `createClient` imports from pages
   - [ ] All pages use server actions only
   - [ ] All components receive data via props
   - Files affected: 25

4. **Component Refactoring**
   - [ ] Extract business logic from components
   - [ ] Create container/presenter pattern
   - [ ] Move data fetching to server components
   - Files affected: 15

### Phase 3: Abstraction (Week 5-6)

**Priority: MEDIUM**

5. **Database Abstraction**
   - [ ] Create repository interfaces
   - [ ] Implement Supabase repositories
   - [ ] Update services to use repositories
   - [ ] Services no longer know about Supabase
   - Files affected: 40+

6. **Auth Abstraction**
   - [ ] Create auth service interface
   - [ ] Implement Supabase auth adapter
   - [ ] Update all auth calls
   - Files affected: 10+

### Phase 4: Domain Isolation (Week 7-8)

**Priority: LOW**

7. **Module Boundaries**
   - [ ] Create domain modules
   - [ ] Enforce import rules
   - [ ] Use TypeScript project references
   - [ ] Prevent cross-domain imports

8. **Event-Driven Communication**
   - [ ] Implement domain events
   - [ ] Use events for cross-domain communication
   - [ ] Reduce direct dependencies

---

## 🛠️ Quick Wins (Can Do Today)

### 1. Consolidate Service Folders

**Effort:** 2 hours  
**Impact:** High  
**Action:** Move `/services/` into `/lib/services/`

### 2. Remove Direct Supabase from One Page

**Effort:** 30 minutes  
**Impact:** Medium  
**File:** `app/school-admin/students/page.tsx`  
**Action:** Convert to use server action

### 3. Standardize One Domain

**Effort:** 4 hours  
**Impact:** High  
**Domain:** Student Management  
**Action:** Single access pattern for all student operations

---

## 📝 Architectural Principles to Enforce

Going forward, enforce these rules:

### Rule 1: No DB Access in UI Layer

```typescript
// ❌ WRONG
import { createClient } from "@/lib/supabase/server";

// ✅ RIGHT
import { getStudents } from "@/lib/actions/student-actions";
```

### Rule 2: One Service Location

```typescript
// ❌ WRONG
import { SuperAdminService } from "@/services/super-admin";

// ✅ RIGHT
import { superAdminService } from "@/lib/services/super-admin";
```

### Rule 3: Server Actions Only

```typescript
// ❌ WRONG (API Route)
fetch("/api/students");

// ✅ RIGHT (Server Action)
import { getStudentsAction } from "@/lib/actions/student-actions";
await getStudentsAction(schoolId);
```

### Rule 4: Components Are Dumb

```typescript
// ❌ WRONG
function Component() {
  const data = await fetchData(); // Smart component
}

// ✅ RIGHT
function Component({ data }: Props) {
  // Receives data via props
}
```

### Rule 5: Services Use Repositories

```typescript
// ❌ WRONG (Current)
const supabase = await createClient();
const { data } = await supabase.from("students").select();

// ✅ RIGHT (Future)
const students = await studentRepository.findAll();
```

---

## 🔍 Monitoring Coupling

### ESLint Rules to Add

Add these rules to prevent coupling:

```javascript
// eslint.config.mjs
{
  rules: {
    // Prevent direct Supabase imports in app/
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@/lib/supabase/client', '@/lib/supabase/server'],
        message: 'Do not import Supabase directly. Use server actions.',
        allowImportNames: [],
      }]
    }]
  }
}
```

### TypeScript Project References

Use project references to enforce boundaries:

```json
// tsconfig.app.json (UI layer)
{
  "compilerOptions": {
    "paths": {
      "@/lib/services/*": ["FORBIDDEN"],
      "@/lib/supabase/*": ["FORBIDDEN"]
    }
  }
}
```

---

## 📚 Related Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration strategies
- [database.md](./database.md) - Database schema
- [docs/AUTHORIZATION.md](./docs/AUTHORIZATION.md) - Auth patterns
- [docs/IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md) - Implementation details

---

## 📞 Questions & Discussion

For questions about this analysis:

1. Review specific file mentioned above
2. Check the "Should Use" recommendation
3. Follow the Decoupling Roadmap
4. Enforce Architectural Principles

**Last Updated:** February 12, 2026  
**Next Review:** After Phase 1 completion
