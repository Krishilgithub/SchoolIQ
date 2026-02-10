-- Cross-Cutting Infrastructure Tables
-- These tables support common functionalities across all modules

-- ============================================================================
-- Audit Logs Table
-- Tracks all user actions for compliance and debugging
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Action details
  action TEXT NOT NULL, -- e.g., 'student.create', 'exam.publish'
  resource_type TEXT NOT NULL, -- e.g., 'student', 'exam'
  resource_id TEXT, -- ID of the affected resource
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'pending')),
  
  -- Additional context
  metadata JSONB, -- Flexible metadata about the action
  changes JSONB, -- Before/after values for updates
  error_message TEXT, -- Error details if status='failure'
  
  -- Request context
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view logs from their school
CREATE POLICY select_audit_logs ON audit_logs
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- Policy: Only admins can insert logs (system inserts)
CREATE POLICY insert_audit_logs ON audit_logs
  FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Notifications Table
-- System and user notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement')),
  category TEXT NOT NULL CHECK (category IN ('system', 'academic', 'attendance', 'exam', 'assignment', 'communication')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Optional action
  action JSONB, -- { label: string, url: string }
  
  -- Reference to related resource
  resource_type TEXT,
  resource_id TEXT,
  
  -- Read status
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_school ON notifications(school_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY select_notifications ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can update their own notifications
CREATE POLICY update_notifications ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own notifications
CREATE POLICY delete_notifications ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- Version History Table (for tracking changes to important records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Resource being versioned
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  
  -- Version details
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL, -- Full snapshot of the resource at this version
  
  -- Change tracking
  changed_by UUID NOT NULL REFERENCES profiles(id),
  change_summary TEXT, -- Brief description of changes
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Ensure version numbers are unique per resource
  UNIQUE (resource_type, resource_id, version_number)
);

-- Create indexes for version_history
CREATE INDEX IF NOT EXISTS idx_version_history_resource ON version_history(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_version_history_school ON version_history(school_id);
CREATE INDEX IF NOT EXISTS idx_version_history_created ON version_history(created_at DESC);

-- Enable RLS
ALTER TABLE version_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view version history for their school
CREATE POLICY select_version_history ON version_history
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE audit_logs IS 'Tracks all user actions across the system for compliance and debugging';
COMMENT ON TABLE notifications IS 'User notifications for system events, academic updates, and announcements';
COMMENT ON TABLE version_history IS 'Version history for tracking changes to important records';
