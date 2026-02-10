export default function SuperAdminSecurityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <p className="text-muted-foreground">
          Security controls, MFA policies and audit logs coming soon.
        </p>
        {/* TODO: Add MFA Policies, IP Rules, Login History, Alerts */}
      </div>
    </div>
  );
}
