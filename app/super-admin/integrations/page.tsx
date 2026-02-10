export default function SuperAdminIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <p className="text-muted-foreground">
          Platform integrations configuration coming soon.
        </p>
        {/* TODO: Add Payment, Email, Storage, Webhooks, OAuth configuration */}
      </div>
    </div>
  );
}
