"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, Settings } from "lucide-react";
import { toast } from "sonner";

interface MFAPolicy {
  id: string;
  policy_name: string;
  is_active: boolean;
  applies_to: "all" | "admins" | "schools";
  config: {
    required: boolean;
    grace_period_days: number;
    allowed_methods: string[];
  };
}

interface MFAPoliciesProps {
  policies: MFAPolicy[];
  onTogglePolicy: (policyId: string, enabled: boolean) => void;
  onEditPolicy: (policyId: string) => void;
}

export function MFAPolicies({
  policies,
  onTogglePolicy,
  onEditPolicy,
}: MFAPoliciesProps) {
  const handleToggle = async (policyId: string, enabled: boolean) => {
    try {
      await onTogglePolicy(policyId, enabled);
      toast.success(enabled ? "Policy enabled" : "Policy disabled");
    } catch (error) {
      toast.error("Failed to update policy");
    }
  };

  const getAppliesToBadge = (appliesTo: MFAPolicy["applies_to"]) => {
    const config = {
      all: { label: "All Users", color: "bg-blue-100 text-blue-800" },
      admins: { label: "Admins Only", color: "bg-purple-100 text-purple-800" },
      schools: { label: "School Users", color: "bg-green-100 text-green-800" },
    };
    return config[appliesTo];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          MFA Policies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {policies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No MFA policies configured
            </p>
          ) : (
            policies.map((policy) => {
              const badgeConfig = getAppliesToBadge(policy.applies_to);
              return (
                <div
                  key={policy.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{policy.policy_name}</h4>
                      <Badge variant="outline" className={badgeConfig.color}>
                        {badgeConfig.label}
                      </Badge>
                      {policy.is_active && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        Required: {policy.config.required ? "Yes" : "No"} •
                        Grace Period: {policy.config.grace_period_days} days
                      </p>
                      <p>Methods: {policy.config.allowed_methods.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={policy.is_active}
                      onCheckedChange={(checked: boolean) =>
                        handleToggle(policy.id, checked)
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditPolicy(policy.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
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
