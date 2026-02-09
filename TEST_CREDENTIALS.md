# Test User Credentials for SchoolIQ

## Setup Instructions

1. Run `fix_missing_profile_and_setup.sql` in Supabase SQL Editor
2. This will fix the missing profile and link all users to the demo school

## Available Test Accounts

### Teacher Accounts

- **Email:** teacher@test.com  
  **Password:** Use the password you set in Supabase Auth
  **Role:** Teacher
  **Dashboard:** Teacher Dashboard

- **Email:** teacher@schooliq.com  
  **Password:** Use the password you set in Supabase Auth
  **Role:** Teacher
  **Dashboard:** Teacher Dashboard

### Student Accounts

- **Email:** student@test.com  
  **Password:** Use the password you set in Supabase Auth
  **Role:** Student
  **Dashboard:** Student Dashboard

- **Email:** student@schooliq.com  
  **Password:** Use the password you set in Supabase Auth
  **Role:** Student
  **Dashboard:** Student Dashboard

### Parent/Guardian Accounts

- **Email:** parent@test.com  
  **Password:** Use the password you set in Supabase Auth
  **Role:** Guardian
  **Dashboard:** Parent Dashboard

- **Email:** parent@schooliq.com  
  **Password:** Use the password you set in Supabase Auth
  **Role:** Guardian
  **Dashboard:** Parent Dashboard

### Admin Accounts

- **Email:** admin@test.com  
  **Password:** Use the password you set in Supabase Auth
  **Role:** School Admin
  **Dashboard:** Admin Dashboard

- **Email:** admin@schooliq.com  
  **Password:** Use the password you set in Supabase Auth
  **Role:** School Admin
  **Dashboard:** Admin Dashboard

- **Email:** admin@springfield.edu  
  **Password:** Use the password you set in Supabase Auth
  **Role:** School Admin
  **Dashboard:** Admin Dashboard

### Super Admin Accounts

- **Email:** krishilagrawal024@gmail.com  
  **Password:** Use your password
  **Role:** Super Admin
  **Dashboard:** Super Admin Dashboard

- **Email:** krishilagrawal0264@gmail.com  
  **Password:** Use your password
  **Role:** Super Admin
  **Dashboard:** Super Admin Dashboard

## After Running the Setup Script

All accounts will be:

- ✅ Linked to "Demo School"
- ✅ Assigned appropriate roles
- ✅ Active and ready to use
- ✅ Able to sign in without errors

## How to Test

1. Go to your app: http://localhost:3000/auth/login
2. Try logging in with any of the accounts above
3. You should be redirected to the appropriate dashboard based on role

## Troubleshooting

### If login still doesn't work:

1. Check that the user's email is confirmed in Supabase
   - Go to Authentication → Users
   - Click on the user
   - Check "Email Confirmed" status
   - If not confirmed, click "Confirm User"

2. Verify the user has a profile:

   ```sql
   SELECT * FROM profiles WHERE email = 'your-email@here.com';
   ```

3. Verify the user has school membership:
   ```sql
   SELECT * FROM school_members sm
   JOIN profiles p ON sm.user_id = p.id
   WHERE p.email = 'your-email@here.com';
   ```

## Next Steps

After successful login, you can test:

- Navigation between different sections
- Role-based access control
- Data viewing and management
- Logout functionality
