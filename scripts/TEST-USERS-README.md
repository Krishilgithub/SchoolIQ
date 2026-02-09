# Test User Creation Scripts

Quick SQL scripts to create test accounts for SchoolIQ development and testing.

## 📋 Available Scripts

### 1. Create All Test Users (Recommended)

**File:** `create-all-test-users.sql`

Creates all test accounts at once:

- School Admin
- Teacher
- Student
- Parent/Guardian

**Usage:**

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `create-all-test-users.sql`
3. Click "Run"

### 2. Create Individual Users

#### Parent Only

**File:** `create-parent-quick.sql`

- Creates a parent/guardian account

#### Individual Scripts

Use `create-all-test-users.sql` and modify the JSON array to create specific users.

### 3. Cleanup Test Users

**File:** `cleanup-test-users.sql`

Removes all test accounts when you're done testing.

## 🔑 Default Credentials

After running the scripts, use these credentials to login:

### School Admin

```
Email: admin@test.com
Password: admin123
```

### Teacher

```
Email: teacher@test.com
Password: teacher123
```

### Student

```
Email: student@test.com
Password: student123
```

### Parent/Guardian

```
Email: parent@test.com
Password: parent123
```

## 🏫 School Assignment

All test users are automatically assigned to the first school in your database.

If you don't have a school yet, the script will fail with an error. Create a school first through your application or add this SQL:

```sql
INSERT INTO schools (name, slug, contact_email, school_type)
VALUES ('Test School', 'test-school', 'contact@testschool.com', 'k12');
```

## ✅ Features

- **Idempotent:** Safe to run multiple times - updates existing users instead of creating duplicates
- **Auto-assignment:** Automatically assigns users to the first available school
- **Role-based:** Creates proper role assignments for each user type
- **Verified:** Email confirmation is automatically set to true

## 🔄 Re-running Scripts

You can safely re-run any script. It will:

- Skip if auth user already exists
- Update the profile if it exists
- Create new records only when needed

## 🧹 Cleanup

To remove all test users:

```sql
-- Run cleanup-test-users.sql in Supabase SQL Editor
```

## 🚨 Important Notes

1. **Production Warning:** These scripts create users with simple passwords. Only use for testing/development.
2. **School Requirement:** A school must exist before running these scripts.
3. **Supabase Access:** You need admin access to your Supabase project to run these scripts.

## 📝 Troubleshooting

### Error: "No school found"

Create a school first using the application or SQL.

### Error: "duplicate key value violates unique constraint"

The user already exists. The updated script handles this, but if you see this error, update to the latest version of the script.

### Email not confirmed

The scripts set `email_confirmed_at` to now, so all test users have confirmed emails.

## 🎯 Quick Start

**Fastest way to get all test accounts:**

1. Copy `create-all-test-users.sql`
2. Open Supabase SQL Editor
3. Paste and run
4. Login with any of the credentials above
5. Test different dashboards!

---

**Need help?** Check the main SchoolIQ documentation or create an issue.
