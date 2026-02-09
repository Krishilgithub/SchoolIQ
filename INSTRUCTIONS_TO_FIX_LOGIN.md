# Fix Super Admin Login Issue

I have added the missing `is_super_admin` column to the `profiles` table.

However, your user profile is missing from the database, and security policies prevent creating it automatically from the login screen.

**Please run the following SQL command in your Supabase Dashboard (SQL Editor) to resolve this:**

```sql
INSERT INTO public.profiles (id, email, first_name, last_name, role, is_super_admin)
VALUES
  ('a36fd657-fcb0-42bd-b836-56d94bb31a6e', 'admin@schooliq.com', 'Super', 'Admin', 'super_admin', true)
ON CONFLICT (id) DO UPDATE
SET is_super_admin = true;
```

> **Note:** You can replace `'admin@schooliq.com'` with your actual email if you prefer, though it is mainly for display purposes in the app.

**Important:**

- **Password:** The password is **unchanged**. Use the same password you used to log in previously (when you saw the error).
- **Email:** The email `admin@schooliq.com` above is just for your profile display. It does **not** change your login email. You continue to log in with your original email.
- **Why?** This SQL manually links a "Super Admin" profile to your existing user ID (`a36fd657...`) to fix the missing profile error.

After running this command, try logging in again. You should be redirected dynamically to `/super-admin`.
