-- Fix school_events table to add 'exam' event type and update RLS policies
-- This migration updates the event_type constraint and RLS policies to work with profiles table

-- Drop existing constraint
ALTER TABLE public.school_events DROP CONSTRAINT IF EXISTS school_events_event_type_check;

-- Add updated constraint with 'exam' included
ALTER TABLE public.school_events 
ADD CONSTRAINT school_events_event_type_check 
CHECK (event_type IN ('holiday', 'event', 'deadline', 'meeting', 'exam', 'other'));

-- Drop old RLS policies
DROP POLICY IF EXISTS "School admins can view their school events" ON public.school_events;
DROP POLICY IF EXISTS "School admins can insert events" ON public.school_events;
DROP POLICY IF EXISTS "School admins can update events" ON public.school_events;
DROP POLICY IF EXISTS "School admins can delete events" ON public.school_events;

-- Create new policies that work with profiles table
-- School admins and staff can view events for their school
CREATE POLICY "Users can view their school events" 
    ON public.school_events FOR SELECT 
    USING (
        school_id IN (
            SELECT school_id FROM public.profiles 
            WHERE id = auth.uid() AND school_id IS NOT NULL
        )
    );

-- School admins can insert events for their school
CREATE POLICY "School admins can insert events" 
    ON public.school_events FOR INSERT 
    WITH CHECK (
        school_id IN (
            SELECT school_id FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'school_admin'
        )
    );

-- School admins can update events for their school
CREATE POLICY "School admins can update events" 
    ON public.school_events FOR UPDATE 
    USING (
        school_id IN (
            SELECT school_id FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'school_admin'
        )
    );

-- School admins can delete events for their school
CREATE POLICY "School admins can delete events" 
    ON public.school_events FOR DELETE 
    USING (
        school_id IN (
            SELECT school_id FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'school_admin'
        )
    );
