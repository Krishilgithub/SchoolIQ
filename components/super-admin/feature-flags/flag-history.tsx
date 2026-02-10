"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ToggleLeft, ToggleRight, Percent } from "lucide-react";

interface FlagHistoryEntry {
  id: string;
  changed_by_name: string;
  old_value: boolean;
  new_value: boolean;
  rollout_change: {
    old_percentage?: number;
    new_percentage?: number;
  } | null;
  changed_at: string;
}

interface FlagHistoryProps {
  flagName: string;
  history: FlagHistoryEntry[];
}

export function FlagHistory({ flagName, history }: FlagHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Change History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-100 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No changes recorded yet
            </p>
          ) : (
            history.map((entry, index) => {
              const isToggleChange = entry.old_value !== entry.new_value;
              const isRolloutChange = entry.rollout_change;

              return (
                <div key={entry.id} className="relative pl-6 pb-4">
                  {index < history.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-border" />
                  )}
                  <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {entry.changed_by_name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.changed_at).toLocaleString()}
                      </span>
                    </div>

                    {isToggleChange && (
                      <div className="flex items-center gap-2 text-sm">
                        {entry.old_value ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800"
                          >
                            <ToggleRight className="mr-1 h-3 w-3" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-800"
                          >
                            <ToggleLeft className="mr-1 h-3 w-3" />
                            Disabled
                          </Badge>
                        )}
                        <span className="text-muted-foreground">→</span>
                        {entry.new_value ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800"
                          >
                            <ToggleRight className="mr-1 h-3 w-3" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-800"
                          >
                            <ToggleLeft className="mr-1 h-3 w-3" />
                            Disabled
                          </Badge>
                        )}
                      </div>
                    )}

                    {isRolloutChange && (
                      <div className="flex items-center gap-2 text-sm">
                        <Percent className="h-3 w-3 text-muted-foreground" />
                        <span>Rollout changed from</span>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800"
                        >
                          {isRolloutChange.old_percentage}%
                        </Badge>
                        <span className="text-muted-foreground">to</span>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800"
                        >
                          {isRolloutChange.new_percentage}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
