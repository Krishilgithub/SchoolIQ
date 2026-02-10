-- Super Admin Dashboard Features Migration
-- Created: February 10, 2026
-- Description: Adds tables for support, system monitoring, security, feature flags, jobs, backups, and integrations

-- ============================================================
-- SUPPORT TICKETS SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')) DEFAULT 'open',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  closed_at timestamptz
);

CREATE INDEX idx_support_tickets_school ON support_tickets(school_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  severity text CHECK (severity IN ('minor', 'major', 'critical')),
  status text CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')) DEFAULT 'investigating',
  started_at timestamptz NOT NULL,
  resolved_at timestamptz,
  root_cause text,
  affected_services text[],
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);

-- ============================================================
-- SYSTEM MONITORING
-- ============================================================

CREATE TABLE IF NOT EXISTS system_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  recorded_at timestamptz DEFAULT now(),
  metadata jsonb
);

CREATE INDEX idx_system_metrics_name_time ON system_metrics(metric_name, recorded_at DESC);

CREATE TABLE IF NOT EXISTS system_alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type text NOT NULL,
  severity text CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  message text NOT NULL,
  metric_name text,
  threshold_value numeric,
  current_value numeric,
  status text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by uuid REFERENCES profiles(id),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_system_alerts_status ON system_alerts(status);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);

-- ============================================================
-- SECURITY
-- ============================================================

CREATE TABLE IF NOT EXISTS security_policies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_type text NOT NULL,
  policy_config jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ip_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address inet NOT NULL,
  rule_type text CHECK (rule_type IN ('whitelist', 'blacklist')),
  reason text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX idx_ip_rules_ip ON ip_rules(ip_address);
CREATE INDEX idx_ip_rules_type ON ip_rules(rule_type);

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  ip_address inet,
  user_agent text,
  success boolean NOT NULL,
  failure_reason text,
  location jsonb,
  attempted_at timestamptz DEFAULT now()
);

CREATE INDEX idx_login_attempts_email_time ON login_attempts(email, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, attempted_at DESC);

CREATE TABLE IF NOT EXISTS active_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token);

-- ============================================================
-- FEATURE FLAGS
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key text UNIQUE NOT NULL,
  flag_name text NOT NULL,
  description text,
  is_enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_schools uuid[],
  target_users uuid[],
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

CREATE TABLE IF NOT EXISTS feature_flag_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_id uuid REFERENCES feature_flags(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES profiles(id),
  old_value boolean,
  new_value boolean,
  rollout_change jsonb,
  changed_at timestamptz DEFAULT now()
);

CREATE INDEX idx_feature_flag_history_flag ON feature_flag_history(flag_id);

-- ============================================================
-- BACKGROUND JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS background_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type text NOT NULL,
  job_name text NOT NULL,
  payload jsonb,
  status text CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  priority integer DEFAULT 0,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  error_message text,
  stack_trace text,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_jobs_status_scheduled ON background_jobs(status, scheduled_at);
CREATE INDEX idx_jobs_type ON background_jobs(job_type);

CREATE TABLE IF NOT EXISTS job_schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type text NOT NULL,
  schedule_cron text NOT NULL,
  is_active boolean DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_job_schedules_active ON job_schedules(is_active, next_run_at);

-- ============================================================
-- BACKUPS & EXPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS database_backups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_type text CHECK (backup_type IN ('manual', 'scheduled', 'pre_migration')),
  backup_size_bytes bigint,
  backup_location text NOT NULL,
  backup_status text CHECK (backup_status IN ('in_progress', 'completed', 'failed')) DEFAULT 'in_progress',
  error_message text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  retention_days integer DEFAULT 30
);

CREATE INDEX idx_database_backups_status ON database_backups(backup_status);
CREATE INDEX idx_database_backups_type ON database_backups(backup_type);

CREATE TABLE IF NOT EXISTS data_exports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  export_type text NOT NULL,
  export_format text CHECK (export_format IN ('csv', 'json', 'xlsx')),
  filters jsonb,
  file_path text,
  file_size_bytes bigint,
  status text CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  requested_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz
);

CREATE INDEX idx_data_exports_status ON data_exports(status);
CREATE INDEX idx_data_exports_type ON data_exports(export_type);

-- ============================================================
-- INTEGRATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS integration_configs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_name text NOT NULL,
  integration_type text CHECK (integration_type IN ('payment', 'email', 'storage', 'auth', 'webhook')),
  is_enabled boolean DEFAULT false,
  config_data jsonb NOT NULL, -- encrypted sensitive data
  test_mode boolean DEFAULT true,
  last_tested_at timestamptz,
  test_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_integration_configs_type ON integration_configs(integration_type);
CREATE INDEX idx_integration_configs_enabled ON integration_configs(is_enabled);

CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  url text NOT NULL,
  events text[] NOT NULL,
  secret_key text NOT NULL,
  is_active boolean DEFAULT true,
  retry_config jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id uuid REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  delivered_at timestamptz DEFAULT now(),
  retry_count integer DEFAULT 0
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_event ON webhook_deliveries(event_type);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_policies_updated_at BEFORE UPDATE ON security_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies for super admins only
CREATE POLICY "Super admins can manage support tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage ticket messages" ON ticket_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage incidents" ON incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can view system metrics" ON system_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage system alerts" ON system_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage security policies" ON security_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage IP rules" ON ip_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can view login attempts" ON login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can view active sessions" ON active_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can view flag history" ON feature_flag_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage background jobs" ON background_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage job schedules" ON job_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage backups" ON database_backups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage exports" ON data_exports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage integrations" ON integration_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can manage webhooks" ON webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can view webhook deliveries" ON webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to log feature flag changes
CREATE OR REPLACE FUNCTION log_feature_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_enabled != NEW.is_enabled THEN
    INSERT INTO feature_flag_history (flag_id, changed_by, old_value, new_value, changed_at)
    VALUES (NEW.id, auth.uid(), OLD.is_enabled, NEW.is_enabled, now());
  END IF;
  
  IF OLD.rollout_percentage != NEW.rollout_percentage THEN
    INSERT INTO feature_flag_history (flag_id, changed_by, rollout_change, changed_at)
    VALUES (
      NEW.id,
      auth.uid(),
      jsonb_build_object('old_percentage', OLD.rollout_percentage, 'new_percentage', NEW.rollout_percentage),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_feature_flag_changes
  AFTER UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION log_feature_flag_change();

-- Migration complete
