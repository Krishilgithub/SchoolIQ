"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import { 
  BasicInfoStep,
  TimetableEntriesStep,
  ReviewStep
} from "@/components/school-admin/timetable/create";

export interface TimetableFormData {
  name: string;
  academic_year_id: string;
  description: string;
  effective_from: string;
  effective_until: string;
  status: "draft" | "published";
  entries: TimetableEntryData[];
}

export interface TimetableEntryData {
  day_of_week: number;
  period_id: string;
  class_id: string;
  section_id?: string;
  subject_id: string;
  teacher_id: string;
  room_id?: string;
  notes?: string;
}

const steps = [
  { id: 1, name: "Basic Information", description: "Set up timetable details" },
  { id: 2, name: "Schedule Entries", description: "Add class periods" },
  { id: 3, name: "Review & Publish", description: "Verify and publish" },
];

export default function CreateTimetablePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TimetableFormData>({
    name: "",
    academic_year_id: "",
    description: "",
    effective_from: "",
    effective_until: "",
    status: "draft",
    entries: [],
  });

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!formData.name || !formData.academic_year_id || !formData.effective_from) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.push("/school-admin/academics/timetable");
  };

  const handleSubmit = async (status: "draft" | "published" = "draft") => {
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        status,
      };

      const response = await fetch("/api/school-admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("Failed to create timetable");
      }

      const data = await response.json();
      
      toast.success(
        status === "published" 
          ? "Timetable published successfully!" 
          : "Timetable saved as draft"
      );
      
      router.push("/school-admin/academics/timetable");
    } catch (error) {
      console.error("Error creating timetable:", error);
      toast.error("Failed to create timetable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create Timetable
            </h2>
            <p className="text-muted-foreground">
              Set up a new timetable for your school
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step.id
                        ? "bg-orange-600 text-white"
                        : currentStep > step.id
                        ? "bg-green-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                    initial={false}
                    animate={{ scale: currentStep === step.id ? 1.1 : 1 }}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 rounded ${
                      currentStep > step.id ? "bg-green-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 1 && (
          <BasicInfoStep
            formData={formData}
            setFormData={setFormData}
          />
        )}
        
        {currentStep === 2 && (
          <TimetableEntriesStep
            formData={formData}
            setFormData={setFormData}
          />
        )}
        
        {currentStep === 3 && (
          <ReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </motion.div>

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleCancel : handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          
          <Button
            onClick={handleNext}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {currentStep === 2 ? "Review" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
