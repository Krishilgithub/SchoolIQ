"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export interface Integration {
  id: string;
  integration_name: string;
  integration_type: "payment" | "email" | "storage" | "auth" | "webhook";
  is_enabled: boolean;
  test_mode: boolean;
  last_tested_at: string | null;
  test_status: "success" | "failed" | null;
  description: string;
  icon?: string;
}

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (integrationId: string, enabled: boolean) => void;
  onConfigure: (integrationId: string) => void;
  onTest: (integrationId: string) => void;
}

const typeColors = {
  payment: "bg-green-100 text-green-800",
  email: "bg-blue-100 text-blue-800",
  storage: "bg-purple-100 text-purple-800",
  auth: "bg-orange-100 text-orange-800",
  webhook: "bg-pink-100 text-pink-800",
};

export function IntegrationCard({
  integration,
  onToggle,
  onConfigure,
  onTest,
}: IntegrationCardProps) {
  const handleToggle = async (enabled: boolean) => {
    try {
      await onToggle(integration.id, enabled);
      toast.success(enabled ? "Integration enabled" : "Integration disabled");
    } catch (error) {
      toast.error("Failed to update integration");
    }
  };

  const handleTest = async () => {
    try {
      await onTest(integration.id);
    } catch (error) {
      toast.error("Test failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">
              {integration.integration_name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={typeColors[integration.integration_type]}
              >
                {integration.integration_type.toUpperCase()}
              </Badge>
              {integration.test_mode && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800"
                >
                  Test Mode
                </Badge>
              )}
              {integration.is_enabled && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
          </div>
          <Switch
            checked={integration.is_enabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {integration.description}
        </p>

        {integration.last_tested_at && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last tested:</span>
            <div className="flex items-center gap-2">
              {integration.test_status === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>
                {new Date(integration.last_tested_at).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(integration.id)}
            className="flex-1"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={!integration.is_enabled}
          >
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
