-- Fix school_events table permissions and policies
-- Ensure profiles table has the necessary data for event creation

-- First, let's ensure all school admin users have proper role in profiles table
UPDATE profiles 
SET role = 'school_admin' 
WHERE id IN (
  SELECT user_id FROM school_admins
) AND (role IS NULL OR role != 'school_admin');

-- Also ensure school_id is set in profiles for admin users
UPDATE profiles 
SET school_id = sa.school_id
FROM school_admins sa 
WHERE profiles.id = sa.user_id 
AND profiles.school_id IS NULL;

-- Drop existing school_events policies to recreate them with better logic
DROP POLICY IF EXISTS "Users can view their school events" ON public.school_events;
DROP POLICY IF EXISTS "School admins can insert events" ON public.school_events;
DROP POLICY IF EXISTS "School admins can update events" ON public.school_events;
DROP POLICY IF EXISTS "School admins can delete events" ON public.school_events;

-- Create new policies with better error handling
-- Users can view events for their school
CREATE POLICY "Users can view their school events" 
    ON public.school_events FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.school_id = school_events.school_id
            AND profiles.school_id IS NOT NULL
        )
    );

-- School admins can insert events for their school
CREATE POLICY "School admins can create events" 
    ON public.school_events FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.school_id = school_events.school_id
            AND profiles.role = 'school_admin'
            AND profiles.school_id IS NOT NULL
        )
    );

-- School admins can update events for their school
CREATE POLICY "School admins can update events" 
    ON public.school_events FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.school_id = school_events.school_id
            AND profiles.role = 'school_admin'
            AND profiles.school_id IS NOT NULL
        )
    );

-- School admins can delete events for their school
CREATE POLICY "School admins can delete events" 
    ON public.school_events FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.school_id = school_events.school_id
            AND profiles.role = 'school_admin'
            AND profiles.school_id IS NOT NULL
        )
    );

-- Add an index to improve policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_school_role 
    ON public.profiles(id, school_id, role) 
    WHERE school_id IS NOT NULL AND role IS NOT NULL;