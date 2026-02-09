# Quick Guide: Create Test Users in Supabase

## Step-by-Step Instructions

### 1. Fix the Database First

Before creating users, make sure you've run the fix:

1. Open **SQL Editor** in Supabase Dashboard
2. Run the contents of `supabase/fix_auth_database.sql`
3. Verify all users show "OK" status

### 2. Create Test Users in Supabase Auth

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create new user**
3. Create these test users:

**Teacher Account:**

- Email: `teacher@demo.com`
- Password: `Teacher123!`
- Auto Confirm: ✓ (check this box)
- User Metadata (click "Add Metadata"):
  ```json
  {
    "first_name": "John",
    "last_name": "Teacher",
    "full_name": "John Teacher"
  }
  ```

**Admin Account:**

- Email: `admin@demo.com`
- Password: `Admin123!`
- Auto Confirm: ✓
- User Metadata:
  ```json
  {
    "first_name": "Sarah",
    "last_name": "Admin",
    "full_name": "Sarah Admin"
  }
  ```

**Student Account:**

- Email: `student@demo.com`
- Password: `Student123!`
- Auto Confirm: ✓
- User Metadata:
  ```json
  {
    "first_name": "Alice",
    "last_name": "Smith",
    "full_name": "Alice Smith"
  }
  ```

### 3. Link Users to School

After creating users, run this in SQL Editor:

```sql
-- Get the school ID (or create a school)
INSERT INTO schools (name, slug, school_type, contact_email, subscription_status)
VALUES ('Demo High School', 'demo-high', 'k12', 'admin@demo.com', 'active')
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Get all user IDs
SELECT id, email FROM auth.users WHERE email LIKE '%demo.com';

-- For each user, create school_member record
-- Replace USER_ID_HERE with actual UUID from the query above
INSERT INTO school_members (user_id, school_id, role, status)
VALUES
  ('TEACHER_USER_ID_HERE', (SELECT id FROM schools WHERE slug = 'demo-high'), 'teacher', 'active'),
  ('ADMIN_USER_ID_HERE', (SELECT id FROM schools WHERE slug = 'demo-high'), 'school_admin', 'active'),
  ('STUDENT_USER_ID_HERE', (SELECT id FROM schools WHERE slug = 'demo-high'), 'student', 'active');
```

### 4. Verify Setup

Run this query to verify everything:

```sql
SELECT
  u.email,
  p.first_name || ' ' || p.last_name as full_name,
  sm.role,
  s.name as school
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN school_members sm ON u.id = sm.user_id
LEFT JOIN schools s ON sm.school_id = s.id
WHERE u.email LIKE '%demo.com'
ORDER BY u.email;
```

You should see all three users with their roles and school assigned.

### 5. Test Login

Now try logging in with:

- **Teacher**: teacher@demo.com / Teacher123!
- **Admin**: admin@demo.com / Admin123!
- **Student**: student@demo.com / Student123!

## Troubleshooting

### Error: "User not found"

- Make sure you clicked "Auto Confirm" when creating the user
- Or manually confirm: Authentication → Users → click user → Confirm User

### Error: "database error querying schema"

- Run `fix_auth_database.sql` first
- Check that profiles table exists and has the trigger

### Can't see dashboard content

- Make sure the user has a school_members record
- Verify the role is set correctly
- Check that the school exists and is active

## Alternative: Use the Seed Script

Instead of manual creation, you can:

1. Create users manually (just email + password)
2. Run `supabase/seed_test_users.sql` to set up profiles and school memberships
