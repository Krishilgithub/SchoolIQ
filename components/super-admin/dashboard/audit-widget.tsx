import Link from "next/link";
import { ArrowRight, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditLog {
  id: string;
  operation: string;
  table_name: string;
  created_at: string;
  school?: { name: string } | null;
  changed_by?: { email: string } | null;
}

export function AuditWidget({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground font-heading">
          Recent Activity
        </h3>
        <Link href="/super-admin/audit">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
          >
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4 flex-1 overflow-auto pr-2">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity found.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  <span className="capitalize">{log.operation}</span> on{" "}
                  <span className="font-mono text-xs">{log.table_name}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                  {log.school && (
                    <>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {log.school.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          Download Report (PDF)
        </Button>
      </div>
    </div>
  );
}
