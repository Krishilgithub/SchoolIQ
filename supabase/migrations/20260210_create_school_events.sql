-- Create user_school_events table to store calendar events
-- We use a comprehensive structure to support various event types

-- Create the function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.school_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    event_type TEXT NOT NULL CHECK (event_type IN ('holiday', 'event', 'deadline', 'meeting', 'other')),
    location TEXT,
    is_all_day BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- School admins can view all events for their school
CREATE POLICY "School admins can view their school events" 
    ON public.school_events FOR SELECT 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

-- School admins can insert events for their school
CREATE POLICY "School admins can insert events" 
    ON public.school_events FOR INSERT 
    WITH CHECK (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

-- School admins can update events for their school
CREATE POLICY "School admins can update events" 
    ON public.school_events FOR UPDATE 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

-- School admins can delete events for their school
CREATE POLICY "School admins can delete events" 
    ON public.school_events FOR DELETE 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_school_events_school_id ON public.school_events(school_id);
CREATE INDEX IF NOT EXISTS idx_school_events_date_range ON public.school_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_school_events_type ON public.school_events(event_type);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_school_events_updated_at ON public.school_events;
CREATE TRIGGER update_school_events_updated_at
    BEFORE UPDATE ON public.school_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
