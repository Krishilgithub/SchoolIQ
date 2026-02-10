"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Percent, Users, Building2 } from "lucide-react";
import { toast } from "sonner";

interface RolloutControlsProps {
  flagId: string;
  flagName: string;
  currentPercentage: number;
  targetSchools: string[];
  targetUsers: string[];
  onUpdateRollout: (percentage: number) => void;
  onManageTargets: () => void;
}

export function RolloutControls({
  flagId,
  flagName,
  currentPercentage,
  targetSchools,
  targetUsers,
  onUpdateRollout,
  onManageTargets,
}: RolloutControlsProps) {
  const handleUpdateRollout = (percentage: number) => {
    onUpdateRollout(percentage);
    toast.success(`Rollout updated to ${percentage}%`);
  };

  const getRolloutStatus = (percentage: number) => {
    if (percentage === 0)
      return { label: "Not Started", color: "bg-gray-100 text-gray-800" };
    if (percentage < 25)
      return { label: "Limited", color: "bg-yellow-100 text-yellow-800" };
    if (percentage < 50)
      return { label: "Partial", color: "bg-blue-100 text-blue-800" };
    if (percentage < 100)
      return { label: "Majority", color: "bg-purple-100 text-purple-800" };
    return { label: "Full Rollout", color: "bg-green-100 text-green-800" };
  };

  const status = getRolloutStatus(currentPercentage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Rollout Controls
          </span>
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Global Rollout</label>
            <span className="text-2xl font-bold">{currentPercentage}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[currentPercentage]}
            onValueChange={(vals: number[]) => handleUpdateRollout(vals[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Target Schools</p>
                <p className="text-xs text-muted-foreground">
                  Override for specific schools
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {targetSchools.length} schools
              </Badge>
              <Button variant="outline" size="sm" onClick={onManageTargets}>
                Manage
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Target Users</p>
                <p className="text-xs text-muted-foreground">
                  Override for specific users
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800"
              >
                {targetUsers.length} users
              </Badge>
              <Button variant="outline" size="sm" onClick={onManageTargets}>
                Manage
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Rollout Strategy:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Users are selected randomly based on percentage</li>
              <li>Target schools/users always see the feature</li>
              <li>Changes apply immediately to new sessions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
