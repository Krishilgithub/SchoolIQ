"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  User,
  Globe,
  MapPin,
  Target,
  FileCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  accountCreationSchema,
  schoolDetailsSchema,
  usageIntentSchema,
  reviewSchema,
  AccountCreationInput,
  SchoolDetailsInput,
  UsageIntentInput,
  ReviewInput,
  CompleteRegistrationData,
} from "@/lib/validations/school-registration";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { RoleSelector } from "@/components/auth/role-selector";
import { PrimaryGoalsSelector } from "@/components/auth/primary-goals-selector";
import { InviteStaffInput } from "@/components/auth/invite-staff-input";

const steps = [
  {
    id: 1,
    label: "Account",
    subtitle: "WHO",
    description: "Create your admin account",
    icon: User,
  },
  {
    id: 2,
    label: "School Details",
    subtitle: "WHAT",
    description: "Tell us about your school",
    icon: Building2,
  },
  {
    id: 3,
    label: "Usage & Intent",
    subtitle: "HOW",
    description: "How you'll use SchoolIQ",
    icon: Target,
  },
  {
    id: 4,
    label: "Review & Create",
    subtitle: "DONE",
    description: "Confirm and create account",
    icon: FileCheck,
  },
];

export function SchoolRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form states for each step
  const step1Form = useForm<AccountCreationInput>({
    resolver: zodResolver(accountCreationSchema) as any,
    defaultValues: {
      adminFullName: "",
      adminEmail: "",
      password: "",
      confirmPassword: "",
    },
  });

  const step2Form = useForm<SchoolDetailsInput>({
    resolver: zodResolver(schoolDetailsSchema) as any,
    defaultValues: {
      schoolName: "",
      curriculum: undefined as any,
      schoolType: undefined as any,
      country: "India",
      state: "",
      city: "",
      studentCountRange: undefined as any,
      phone: "",
      website: "",
    },
  });

  const step3Form = useForm<UsageIntentInput>({
    resolver: zodResolver(usageIntentSchema) as any,
    defaultValues: {
      adminRole: undefined as any,
      primaryGoals: [],
      expectedStartDate: undefined as any,
      inviteStaffEmails: [],
      academicYearStartMonth: "April",
      primaryLanguage: "English",
      timezone: "Asia/Kolkata",
    },
  });

  const step4Form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  // Navigation
  const nextStep = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Step handlers
  const onStep1Submit = async () => nextStep();
  const onStep2Submit = async () => nextStep();
  const onStep3Submit = async () => nextStep();

  const onFinalSubmit = async (data: ReviewInput) => {
    setIsLoading(true);
    try {
      const completeData: CompleteRegistrationData = {
        ...step1Form.getValues(),
        ...step2Form.getValues(),
        ...step3Form.getValues(),
        ...data,
      };

      const response = await fetch("/api/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Registration failed");
        return;
      }

      toast.success("🎉 School registered successfully!");
      router.push("/auth/login?registered=true");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  const password = step1Form.watch("password");

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex mb-6"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
            <Building2 className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-2"
        >
          {steps[currentStep - 1].label}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-neutral-600 dark:text-neutral-400"
        >
          {steps[currentStep - 1].description}
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="mb-16 max-w-3xl mx-auto px-4">
        <div className="relative flex justify-between">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 rounded-full" />

          {/* Progress Line */}
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 -translate-y-1/2 rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Step Indicators */}
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <div key={stepNum} className="relative z-10">
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all",
                      isActive || isCompleted
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md"
                        : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-400",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      stepNum
                    )}
                  </div>
                </motion.div>

                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap text-center">
                  <span
                    className={cn(
                      "text-xs font-medium block",
                      isActive ? "text-orange-600" : "text-neutral-500",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {step.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 md:p-12">
          <div className="min-h-125 relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {/* STEP 1: Account Creation (WHO) */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-y-auto"
                >
                  <form
                    onSubmit={step1Form.handleSubmit(onStep1Submit)}
                    className="space-y-6"
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="adminFullName">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="adminFullName"
                          placeholder="John Doe"
                          className="pl-9"
                          {...step1Form.register("adminFullName")}
                        />
                      </div>
                      {step1Form.formState.errors.adminFullName && (
                        <p className="text-xs text-red-500">
                          {step1Form.formState.errors.adminFullName.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="adminEmail"
                          type="email"
                          placeholder="john@school.com"
                          className="pl-9"
                          {...step1Form.register("adminEmail")}
                        />
                      </div>
                      {step1Form.formState.errors.adminEmail && (
                        <p className="text-xs text-red-500">
                          {step1Form.formState.errors.adminEmail.message}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <PasswordInput
                        id="password"
                        placeholder="Create a strong password"
                        showStrength
                        {...step1Form.register("password")}
                        value={password}
                      />
                      {step1Form.formState.errors.password && (
                        <p className="text-xs text-red-500">
                          {step1Form.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Password Requirements */}
                    <PasswordRequirements password={password || ""} />

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <PasswordInput
                        id="confirmPassword"
                        placeholder="Re-enter your password"
                        {...step1Form.register("confirmPassword")}
                      />
                      {step1Form.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500">
                          {step1Form.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-end pt-6">
                      <Button type="submit" className="min-w-32">
                        Next <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: School Details (WHAT) */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-y-auto"
                >
                  <form
                    onSubmit={step2Form.handleSubmit(onStep2Submit)}
                    className="space-y-6"
                  >
                    {/* School Name */}
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">
                        School Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="schoolName"
                          placeholder="Springfield High School"
                          className="pl-9"
                          {...step2Form.register("schoolName")}
                        />
                      </div>
                      {step2Form.formState.errors.schoolName && (
                        <p className="text-xs text-red-500">
                          {step2Form.formState.errors.schoolName.message}
                        </p>
                      )}
                    </div>

                    {/* Curriculum & School Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Curriculum */}
                      <div className="space-y-2">
                        <Label htmlFor="curriculum">
                          Board/Curriculum{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(val) =>
                            step2Form.setValue("curriculum", val as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select curriculum" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CBSE">CBSE</SelectItem>
                            <SelectItem value="ICSE">ICSE</SelectItem>
                            <SelectItem value="State Board">
                              State Board
                            </SelectItem>
                            <SelectItem value="IB">
                              IB (International Baccalaureate)
                            </SelectItem>
                            <SelectItem value="Cambridge/IGCSE">
                              Cambridge/IGCSE
                            </SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {step2Form.formState.errors.curriculum && (
                          <p className="text-xs text-red-500">
                            {step2Form.formState.errors.curriculum.message}
                          </p>
                        )}
                      </div>

                      {/* School Type */}
                      <div className="space-y-2">
                        <Label htmlFor="schoolType">
                          School Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(val) =>
                            step2Form.setValue("schoolType", val as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="k12">K-12 School</SelectItem>
                            <SelectItem value="higher_ed">
                              Higher Education
                            </SelectItem>
                            <SelectItem value="vocational">
                              Vocational/Technical
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {step2Form.formState.errors.schoolType && (
                          <p className="text-xs text-red-500">
                            {step2Form.formState.errors.schoolType.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="country"
                          {...step2Form.register("country")}
                        />
                        {step2Form.formState.errors.country && (
                          <p className="text-xs text-red-500">
                            {step2Form.formState.errors.country.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">
                          State/Province <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="state"
                          placeholder="Maharashtra"
                          {...step2Form.register("state")}
                        />
                        {step2Form.formState.errors.state && (
                          <p className="text-xs text-red-500">
                            {step2Form.formState.errors.state.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          {...step2Form.register("city")}
                        />
                        {step2Form.formState.errors.city && (
                          <p className="text-xs text-red-500">
                            {step2Form.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Student Count & Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentCountRange">
                          Number of Students{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(val) =>
                            step2Form.setValue("studentCountRange", val as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-100">1-100</SelectItem>
                            <SelectItem value="101-500">101-500</SelectItem>
                            <SelectItem value="501-1000">501-1000</SelectItem>
                            <SelectItem value="1000+">1000+</SelectItem>
                          </SelectContent>
                        </Select>
                        {step2Form.formState.errors.studentCountRange && (
                          <p className="text-xs text-red-500">
                            {
                              step2Form.formState.errors.studentCountRange
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <Input
                            id="phone"
                            placeholder="+91 98765 43210"
                            className="pl-9"
                            {...step2Form.register("phone")}
                          />
                        </div>
                        {step2Form.formState.errors.phone && (
                          <p className="text-xs text-red-500">
                            {step2Form.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Website (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="website">
                        Website{" "}
                        <span className="text-neutral-400">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="website"
                          placeholder="https://www.yourschool.com"
                          className="pl-9"
                          {...step2Form.register("website")}
                        />
                      </div>
                      {step2Form.formState.errors.website && (
                        <p className="text-xs text-red-500">
                          {step2Form.formState.errors.website.message}
                        </p>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                      >
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                      </Button>
                      <Button type="submit" className="min-w-32">
                        Next <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: Usage & Intent (HOW) */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-y-auto"
                >
                  <form
                    onSubmit={step3Form.handleSubmit(onStep3Submit)}
                    className="space-y-6"
                  >
                    {/* Role Selector */}
                    <RoleSelector
                      value={step3Form.watch("adminRole") || ""}
                      onChange={(val) =>
                        step3Form.setValue("adminRole", val as any)
                      }
                      error={step3Form.formState.errors.adminRole?.message}
                    />

                    {/* Primary Goals Selector */}
                    <PrimaryGoalsSelector
                      value={step3Form.watch("primaryGoals") || []}
                      onChange={(val) =>
                        step3Form.setValue("primaryGoals", val as any)
                      }
                      error={step3Form.formState.errors.primaryGoals?.message}
                    />

                    {/* Expected Start Date */}
                    <div className="space-y-2">
                      <Label>
                        Expected Start Date{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !step3Form.watch("expectedStartDate") &&
                                "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {step3Form.watch("expectedStartDate") ? (
                              format(
                                step3Form.watch("expectedStartDate"),
                                "PPP",
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={step3Form.watch("expectedStartDate")}
                            onSelect={(date) =>
                              step3Form.setValue(
                                "expectedStartDate",
                                date as any,
                              )
                            }
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {step3Form.formState.errors.expectedStartDate && (
                        <p className="text-xs text-red-500">
                          {step3Form.formState.errors.expectedStartDate.message}
                        </p>
                      )}
                    </div>

                    {/* Invite Staff */}
                    <InviteStaffInput
                      value={step3Form.watch("inviteStaffEmails") || []}
                      onChange={(val) =>
                        step3Form.setValue("inviteStaffEmails", val)
                      }
                      error={
                        step3Form.formState.errors.inviteStaffEmails?.message
                      }
                    />

                    {/* Navigation */}
                    <div className="flex justify-between pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                      >
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                      </Button>
                      <Button type="submit" className="min-w-32">
                        Next <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 4: Review & Create */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-y-auto"
                >
                  <form
                    onSubmit={step4Form.handleSubmit(onFinalSubmit)}
                    className="space-y-6"
                  >
                    {/* Summary */}
                    <div className="space-y-6">
                      {/* Account Section */}
                      <div className="space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User className="w-5 h-5 text-orange-600" />
                          Your Account
                        </h3>
                        <dl className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Name</dt>
                            <dd className="font-medium">
                              {step1Form.getValues("adminFullName")}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Email</dt>
                            <dd className="font-medium">
                              {step1Form.getValues("adminEmail")}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Role</dt>
                            <dd className="font-medium">
                              {step3Form.getValues("adminRole")}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {/* School Information Section */}
                      <div className="space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-orange-600" />
                          School Information
                        </h3>
                        <dl className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Name</dt>
                            <dd className="font-medium">
                              {step2Form.getValues("schoolName")}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">
                              Board/Curriculum
                            </dt>
                            <dd className="font-medium">
                              {step2Form.getValues("curriculum")}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Location</dt>
                            <dd className="font-medium">
                              {step2Form.getValues("city")},{" "}
                              {step2Form.getValues("state")},{" "}
                              {step2Form.getValues("country")}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Students</dt>
                            <dd className="font-medium">
                              {step2Form.getValues("studentCountRange")}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Phone</dt>
                            <dd className="font-medium">
                              {step2Form.getValues("phone")}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {/* Usage Intent Section */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-600" />
                          Usage Intent
                        </h3>
                        <dl className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Primary Goals</dt>
                            <dd className="font-medium">
                              {step3Form.getValues("primaryGoals")?.join(", ")}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-500">Start Date</dt>
                            <dd className="font-medium">
                              {step3Form.getValues("expectedStartDate")
                                ? format(
                                    step3Form.getValues("expectedStartDate"),
                                    "PPP",
                                  )
                                : "Not set"}
                            </dd>
                          </div>
                          {step3Form.getValues("inviteStaffEmails")?.length >
                            0 && (
                            <div className="flex justify-between">
                              <dt className="text-neutral-500">
                                Staff to Invite
                              </dt>
                              <dd className="font-medium">
                                {
                                  step3Form.getValues("inviteStaffEmails")
                                    ?.length
                                }{" "}
                                members
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="acceptTerms"
                          checked={step4Form.watch("acceptTerms")}
                          onCheckedChange={(checked) =>
                            step4Form.setValue(
                              "acceptTerms",
                              checked as boolean,
                            )
                          }
                        />
                        <label
                          htmlFor="acceptTerms"
                          className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                        >
                          I accept the{" "}
                          <a
                            href="/terms"
                            target="_blank"
                            className="text-orange-600 hover:underline"
                          >
                            Terms and Conditions
                          </a>
                        </label>
                      </div>
                      {step4Form.formState.errors.acceptTerms && (
                        <p className="text-xs text-red-500 ml-7">
                          {step4Form.formState.errors.acceptTerms.message}
                        </p>
                      )}

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="acceptPrivacy"
                          checked={step4Form.watch("acceptPrivacy")}
                          onCheckedChange={(checked) =>
                            step4Form.setValue(
                              "acceptPrivacy",
                              checked as boolean,
                            )
                          }
                        />
                        <label
                          htmlFor="acceptPrivacy"
                          className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                        >
                          I accept the{" "}
                          <a
                            href="/privacy"
                            target="_blank"
                            className="text-orange-600 hover:underline"
                          >
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                      {step4Form.formState.errors.acceptPrivacy && (
                        <p className="text-xs text-red-500 ml-7">
                          {step4Form.formState.errors.acceptPrivacy.message}
                        </p>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="min-w-40"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 w-4 h-4" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
