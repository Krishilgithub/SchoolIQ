"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users } from "lucide-react";

export function NextClassCard() {
  // Mock "Next" class (usually derived from schedule)
  const nextClass = {
    subject: "Physics",
    class: "10-A",
    room: "Lab 2",
    time: "10:30 AM",
    startsIn: "15 min",
  };

  return (
    <Card className="col-span-full lg:col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-orange-100 text-xs font-medium uppercase tracking-wider mb-1">
              Up Next • {nextClass.startsIn}
            </p>
            <h3 className="text-2xl font-bold">{nextClass.subject}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <MapPin className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm mb-6">
          <div className="flex items-center gap-1.5 opacity-90">
            <Users className="h-4 w-4" />
            <span>{nextClass.class}</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-90">
            <MapPin className="h-4 w-4" />
            <span>{nextClass.room}</span>
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-sm border-0"
        >
          Start Class
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
