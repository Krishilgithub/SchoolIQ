# Registration Wizard - Gap Analysis

## Executive Summary

Comparing current 5-step wizard against required 4-step structure (Account → School Details → Usage & Intent → Review & Create).

---

## Current Implementation Overview

### Current Steps (5 steps):

1. **School Information**: schoolName, schoolType, website, studentCountRange
2. **Location Details**: addressLine1/2, city, state, postalCode, country, phone
3. **Admin Account**: adminFullName, adminEmail, adminPhone, password, confirmPassword
4. **Preferences**: academicYearStartMonth, primaryLanguage, timezone
5. **Review & Submit**: Terms acceptance, summary display

### Existing Components:

✅ **PasswordInput** - Already exists with strength meter (`showStrength` prop)
✅ **Form validation** - React Hook Form + Zod
✅ **Progress indicator** - Basic step counter
✅ **Responsive design** - Mobile/desktop layouts
✅ **Animations** - Framer Motion transitions

---

## Gap Analysis by Required Step

### ❌ STEP 1: Account Creation (WHO) - Missing Structure

#### Required Fields:

- Full Name ✅ (exists as `adminFullName` in step 3)
- Email Address ✅ (exists as `adminEmail` in step 3)
- Password ✅ (exists with strength meter in step 3)

#### Current State:

- ❌ These fields are in step 3, not step 1
- ✅ Password strength meter already implemented
- ❌ No disposable email validation
- ❌ Password strength requirements not explicitly shown

#### Action Items:

1. Move admin account fields to Step 1
2. Add disposable email blocking
3. Display password requirements list (8+ chars, uppercase, lowercase, number)

---

### ⚠️ STEP 2: School Details (WHAT) - Partially Complete

#### Required Fields:

- School Name ✅ (exists in step 1)
- Board/Curriculum ❌ **MISSING**
- Country ✅ (exists in step 2)
- State/City ✅ (exists in step 2)
- Student Count Range ✅ (exists in step 1)
- Phone Number ✅ (exists in step 2)

#### Current State:

- ✅ Most fields exist but scattered across steps 1 & 2
- ❌ **Critical Missing Field**: Board/Curriculum selection
- ✅ Phone with country code support

#### Action Items:

1. **Add curriculum/board field** with options:
   - CBSE
   - ICSE
   - State Board
   - IB (International Baccalaureate)
   - Cambridge/IGCSE
   - Other
2. Consolidate all school details into single step
3. Add school type (Primary/Secondary/Higher Secondary)

---

### ❌ STEP 3: Usage & Intent (HOW) - Completely Missing

#### Required Fields:

- Your Role ❌ **MISSING**
- Primary Goals ❌ **MISSING**
- Expected Start Date ❌ **MISSING**
- Invite Staff (optional) ❌ **MISSING**

#### Current State:

- ❌ No role selection component
- ❌ No goals/intent capture
- ❌ No start date picker
- ❌ No staff invitation feature

#### Action Items:

1. **Create RoleSelector component**:
   - Options: Principal, Vice Principal, Admin, Owner/Director, Teacher
   - Toggle group or radio buttons
   - Store in `adminRole` field

2. **Create PrimaryGoalsSelector component**:
   - Multi-select checkboxes:
     - Academic Management
     - Attendance Tracking
     - Fee Management
     - Performance Analytics
     - Parent Communication
   - Store as array: `primaryGoals`

3. **Add DatePicker for expected start date**:
   - Default to next month
   - Store as `expectedStartDate`

4. **Create InviteStaffInput component**:
   - Multi-email chip input
   - Validate each email (no duplicates, proper format)
   - Optional field
   - Store as `inviteStaffEmails: string[]`

---

### ⚠️ STEP 4: Review & Create - Partially Complete

#### Required Features:

- Summary Card ✅ (basic implementation exists)
- Terms & Conditions ✅ (checkbox exists)
- Privacy Policy link ✅ (can add)
- Create Account button ✅ (exists)

#### Current State:

- ✅ Review step with summary exists
- ✅ Terms acceptance checkbox
- ⚠️ Summary shows all fields but needs better organization
- ❌ Not grouped by sections (Account/School/Intent)

#### Action Items:

1. Reorganize summary into sections:
   - **Your Account**: Name, Email, Role
   - **School Information**: Name, Board, Location, Size, Phone
   - **Usage Intent**: Goals, Start Date, Invited Staff
2. Add "Edit" buttons for each section linking back to specific step
3. Add Privacy Policy link next to Terms

---

## Database Schema Changes Required

### 1. Schools Table - Add Curriculum Field

```sql
ALTER TABLE schools
ADD COLUMN curriculum TEXT CHECK (curriculum IN ('CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge/IGCSE', 'Other'));
```

### 2. Profiles/School Members - Store Role

Current: Role stored in `school_members.role` as enum `user_role`

- ✅ Already supports 'school_admin', 'teacher', etc.
- May need to add specific admin roles (Principal, Vice Principal)

**Option A**: Add admin_role field to profiles

```sql
ALTER TABLE profiles
ADD COLUMN admin_role TEXT;
```

**Option B**: Add metadata to school_admins table

```sql
ALTER TABLE school_admins
ADD COLUMN specific_role TEXT CHECK (specific_role IN ('Principal', 'Vice Principal', 'Owner', 'Admin'));
```

### 3. Schools Table - Store Registration Intent

```sql
ALTER TABLE schools
ADD COLUMN primary_goals TEXT[], -- Array of selected goals
ADD COLUMN expected_start_date DATE;
```

### 4. Staff Invitations Table - New Table

```sql
CREATE TABLE staff_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES profiles(id),
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    UNIQUE(school_id, email)
);
```

---

## Components to Create

### 1. InviteStaffInput Component

**File**: `components/auth/invite-staff-input.tsx`

```tsx
// Multi-email chip input
// Features:
// - Add email on Enter/comma/space
// - Validate each email
// - Show chips with remove button
// - Error states for invalid emails
// - Max limit (e.g., 10 emails)
```

### 2. RoleSelector Component

**File**: `components/auth/role-selector.tsx`

```tsx
// Role selection toggle group
// Options: Principal, Vice Principal, Admin, Owner, Teacher
// Use RadioGroup or ToggleGroup from shadcn/ui
```

### 3. PrimaryGoalsSelector Component

**File**: `components/auth/primary-goals-selector.tsx`

```tsx
// Multi-select checkbox group
// Goals: Academic, Attendance, Fee, Analytics, Communication
// At least 1 goal required
```

### 4. PasswordRequirements Component

**File**: `components/auth/password-requirements.tsx`

```tsx
// Visual checklist showing:
// ✓ At least 8 characters
// ✓ One uppercase letter
// ✓ One lowercase letter
// ✓ One number
// Live validation as user types
```

---

## Validation Schema Updates

### New Fields to Add:

```typescript
// Step 1 - Account (WHO)
accountCreation: z.object({
  fullName: z.string().min(2),
  email: z.string().email().refine(notDisposableEmail),
  password: z.string().min(8).regex(passwordRegex),
  confirmPassword: z.string(),
}).refine(passwordsMatch);

// Step 2 - School Details (WHAT)
schoolDetails: z.object({
  schoolName: z.string().min(3),
  curriculum: z.enum([
    "CBSE",
    "ICSE",
    "State Board",
    "IB",
    "Cambridge/IGCSE",
    "Other",
  ]),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  studentCountRange: z.enum(["1-100", "101-500", "501-1000", "1000+"]),
  phone: z.string().regex(phoneRegex),
});

// Step 3 - Usage & Intent (HOW)
usageIntent: z.object({
  adminRole: z.enum([
    "Principal",
    "Vice Principal",
    "Admin",
    "Owner",
    "Teacher",
  ]),
  primaryGoals: z
    .array(
      z.enum(["Academic", "Attendance", "Fee", "Analytics", "Communication"]),
    )
    .min(1),
  expectedStartDate: z.date().min(new Date()),
  inviteStaffEmails: z.array(z.string().email()).max(10).optional(),
});

// Step 4 - Review
review: z.object({
  acceptTerms: z.boolean().refine((val) => val === true),
  acceptPrivacy: z.boolean().refine((val) => val === true),
});
```

---

## API Endpoint Updates

### `/api/register-school/route.ts` Changes:

1. **Add new fields to registration payload**:
   - `curriculum`
   - `adminRole`
   - `primaryGoals`
   - `expectedStartDate`
   - `inviteStaffEmails`

2. **Store curriculum in schools table**:

```typescript
await supabase.from("schools").insert({
  // ... existing fields
  curriculum: data.curriculum,
  settings: {
    ...existingSettings,
    primary_goals: data.primaryGoals,
    expected_start_date: data.expectedStartDate,
  },
});
```

3. **Store admin role in school_admins**:

```typescript
await supabase.from("school_admins").insert({
  school_id: school.id,
  user_id: authUser.user.id,
  role: "primary_admin",
  specific_role: data.adminRole, // New field
});
```

4. **Create staff invitations**:

```typescript
if (data.inviteStaffEmails?.length > 0) {
  const invitations = data.inviteStaffEmails.map((email) => ({
    school_id: school.id,
    invited_by: authUser.user.id,
    email,
  }));
  await supabase.from("staff_invitations").insert(invitations);
  // TODO: Send invitation emails
}
```

---

## Priority Order for Implementation

### 🔴 Critical (Must Have):

1. ✅ Password strength meter - **Already implemented**
2. ❌ Add curriculum/board field to Step 2
3. ❌ Move admin account to Step 1
4. ❌ Add role selection to Step 3
5. ❌ Database schema updates (curriculum, roles)

### 🟡 Important (Should Have):

6. ❌ Primary goals selector
7. ❌ Expected start date picker
8. ❌ Disposable email blocking
9. ❌ Password requirements visual checklist
10. ❌ Reorganize review summary by sections

### 🟢 Nice to Have (Enhancement):

11. ❌ Staff invitation (multi-email input)
12. ❌ Progress tracker with step names
13. ❌ Edit buttons in review step
14. ❌ Email confirmation/verification flow

---

## Testing Checklist

After implementation, test:

- [ ] Complete registration with all new fields
- [ ] Password strength meter displays correctly
- [ ] Curriculum selection saves to database
- [ ] Role selection saves correctly
- [ ] Goals array stores properly
- [ ] Start date validation (future dates only)
- [ ] Staff invitations create records
- [ ] Review summary shows all sections
- [ ] Form validation on all steps
- [ ] Navigation between steps works
- [ ] Mobile responsive layout
- [ ] Error handling for API failures

---

## Estimated Implementation Timeline

- **Database Schema Updates**: 30 mins
- **Create New Components** (RoleSelector, GoalsSelector, InviteStaff): 2-3 hours
- **Refactor Wizard Steps** (consolidate to 4 steps): 2 hours
- **Update Validation Schemas**: 1 hour
- **Update API Endpoint**: 1 hour
- **Testing & Bug Fixes**: 2 hours

**Total**: ~8-9 hours

---

## Questions/Decisions Needed

1. **Curriculum Field**: Should we allow custom "Other" curriculum name input?
2. **Role Field**: Store in profiles, school_members, or school_admins table?
3. **Staff Invitations**: Implement full email sending flow now or placeholder?
4. **Start Date**: Should it be required or optional?
5. **Goals**: Minimum 1 goal required or allow 0?

---

## Conclusion

**Current State**: 60% complete

- ✅ Core registration flow works
- ✅ Password strength meter exists
- ✅ Basic validation in place
- ❌ Missing critical fields (curriculum, role, goals)
- ❌ Step structure doesn't match requirements

**Recommended Action**:
Proceed with phased implementation starting with critical items (curriculum field, restructure to 4 steps, add role selection), then add nice-to-have features.
