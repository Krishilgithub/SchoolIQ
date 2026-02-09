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
  MapPin,
  UserCircle,
  Settings as SettingsIcon,
  FileCheck,
  Sparkles,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  User,
  Lock,
  GraduationCap,
  Users,
  Hash,
  Calendar,
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
import {
  schoolInfoSchema,
  locationSchema,
  adminAccountSchema,
  preferencesSchema,
  reviewSchema,
  SchoolInfoInput,
  LocationInput,
  AdminAccountInput,
  PreferencesInput,
  ReviewInput,
  CompleteRegistrationData,
} from "@/lib/validations/school-registration";
import { PasswordInput } from "@/components/auth/password-input";

const steps = [
  {
    label: "School Info",
    description: "Basic details",
    icon: Building2,
  },
  {
    label: "Location",
    description: "Address & contact",
    icon: MapPin,
  },
  {
    label: "Admin Account",
    description: "Your credentials",
    icon: UserCircle,
  },
  {
    label: "Preferences",
    description: "Optional settings",
    icon: SettingsIcon,
  },
  {
    label: "Review",
    description: "Confirm & submit",
    icon: FileCheck,
  },
];

export function SchoolRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form states for each step
  const step1Form = useForm<SchoolInfoInput>({
    resolver: zodResolver(schoolInfoSchema),
    defaultValues: {
      schoolName: "",
      website: "",
      schoolType: undefined,
      studentCountRange: undefined,
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  const step2Form = useForm<LocationInput>({
    resolver: zodResolver(locationSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phone: "",
    },
  });

  const step3Form = useForm<AdminAccountInput>({
    resolver: zodResolver(adminAccountSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      adminFullName: "",
      adminEmail: "",
      adminPhone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const step4Form = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      academicYearStartMonth: undefined,
      primaryLanguage: "English",
      timezone: "Asia/Kolkata",
    },
  });

  const step5Form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: { acceptTerms: false },
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
  const onStep1Submit = async () => {
    nextStep();
  };

  const onStep2Submit = async () => {
    nextStep();
  };

  const onStep3Submit = async () => {
    nextStep();
  };

  const onStep4Submit = async () => {
    nextStep();
  };

  const onFinalSubmit = async (data: ReviewInput) => {
    setIsLoading(true);
    try {
      // Combine all form data
      const completeData: CompleteRegistrationData = {
        ...step1Form.getValues(),
        ...step2Form.getValues(),
        ...step3Form.getValues(),
        ...step4Form.getValues(),
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
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  // Progress percentage
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto py-8">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center p-3 mb-4 rounded-xl bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 ring-1 ring-brand-100 dark:ring-brand-800"
        >
          <Building2 className="w-6 h-6" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold font-heading text-neutral-900 dark:text-white mb-2 tracking-tight"
        >
          {steps[currentStep - 1].label}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-neutral-500 dark:text-neutral-400 text-base max-w-sm mx-auto"
        >
          {steps[currentStep - 1].description}
        </motion.p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="relative flex justify-between px-2">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 dark:bg-neutral-800 -z-0 -translate-y-1/2 rounded-full" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -z-0 -translate-y-1/2 rounded-full origin-left"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <div key={stepNum} className="relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor:
                      isActive || isCompleted
                        ? "var(--brand-600)"
                        : "var(--neutral-100)",
                    borderColor: isActive ? "var(--brand-200)" : "transparent",
                    color: isActive || isCompleted ? "#ffffff" : "#a3a3a3",
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ${
                    isActive
                      ? "ring-brand-50 dark:ring-brand-900/20"
                      : "ring-transparent shadow-sm"
                  } ${!isActive && !isCompleted ? "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" : ""}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{stepNum}</span>
                  )}
                </motion.div>

                {isActive && (
                  <motion.div
                    layoutId="active-step-label"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
                  >
                    <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                      Step {stepNum}
                    </span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Area */}
      <div className="w-full">
        {/* Card Wrapper */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl shadow-neutral-100/50 dark:shadow-neutral-950/50 border border-neutral-100 dark:border-neutral-800 p-8 md:p-10">
          <div className="relative min-h-[420px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {/* Step 1: School Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0"
                >
                  <form
                    onSubmit={step1Form.handleSubmit(onStep1Submit)}
                    className="space-y-6"
                  >
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="schoolName"
                          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                        >
                          School Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="schoolName"
                            className="pl-9"
                            placeholder="e.g., Springfield High School"
                            {...step1Form.register("schoolName")}
                          />
                        </div>
                        {step1Form.formState.errors.schoolName && (
                          <p className="text-xs text-red-500 mt-1">
                            {step1Form.formState.errors.schoolName.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label
                            htmlFor="schoolType"
                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            School Type <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none z-10" />
                            <Select
                              onValueChange={(val) =>
                                step1Form.setValue("schoolType", val as any)
                              }
                              defaultValue={step1Form.getValues("schoolType")}
                            >
                              <SelectTrigger className="h-12 pl-10">
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
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {step1Form.formState.errors.schoolType && (
                            <p className="text-xs text-red-500 mt-1">
                              {step1Form.formState.errors.schoolType.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="studentCountRange"
                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            Student Count{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none z-10" />
                            <Select
                              onValueChange={(val) =>
                                step1Form.setValue(
                                  "studentCountRange",
                                  val as
                                    | "1-100"
                                    | "101-500"
                                    | "501-1000"
                                    | "1000+",
                                )
                              }
                              defaultValue={step1Form.getValues(
                                "studentCountRange",
                              )}
                            >
                              <SelectTrigger className="h-12 pl-10">
                                <SelectValue placeholder="Approx. students" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-100">1-100</SelectItem>
                                <SelectItem value="101-500">101-500</SelectItem>
                                <SelectItem value="501-1000">
                                  501-1000
                                </SelectItem>
                                <SelectItem value="1000+">1000+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {step1Form.formState.errors.studentCountRange && (
                            <p className="text-xs text-red-500 mt-1">
                              {
                                step1Form.formState.errors.studentCountRange
                                  .message
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="website"
                          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                        >
                          Website{" "}
                          <span className="text-neutral-400 text-xs font-normal">
                            (Optional)
                          </span>
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="website"
                            className="pl-9"
                            type="url"
                            placeholder="https://yourschool.edu"
                            {...step1Form.register("website")}
                          />
                        </div>
                        {step1Form.formState.errors.website && (
                          <p className="text-xs text-red-500 mt-1">
                            {step1Form.formState.errors.website.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition-all"
                      >
                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0"
                >
                  <form
                    onSubmit={step2Form.handleSubmit(onStep2Submit)}
                    className="space-y-6"
                  >
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="addressLine1"
                          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                        >
                          Address Line 1 <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="addressLine1"
                            className="pl-9"
                            placeholder="Street address"
                            {...step2Form.register("addressLine1")}
                          />
                        </div>
                        {step2Form.formState.errors.addressLine1 && (
                          <p className="text-xs text-red-500 mt-1">
                            {step2Form.formState.errors.addressLine1.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="addressLine2"
                          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                        >
                          Address Line 2{" "}
                          <span className="text-neutral-400 text-xs font-normal">
                            (Optional)
                          </span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="addressLine2"
                            className="pl-9"
                            placeholder="Apartment, suite, etc."
                            {...step2Form.register("addressLine2")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-neutral-700 dark:text-neutral-300"
                          >
                            City <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="city"
                            placeholder="City"
                            {...step2Form.register("city")}
                            className={`h-11 ${
                              step2Form.formState.errors.city
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }`}
                          />
                          {step2Form.formState.errors.city && (
                            <p className="text-xs text-red-500">
                              {step2Form.formState.errors.city.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="state"
                            className="text-neutral-700 dark:text-neutral-300"
                          >
                            State/Province{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="state"
                            placeholder="State or Province"
                            {...step2Form.register("state")}
                            className={`h-11 ${
                              step2Form.formState.errors.state
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }`}
                          />
                          {step2Form.formState.errors.state && (
                            <p className="text-xs text-red-500">
                              {step2Form.formState.errors.state.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="postalCode"
                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            Postal Code <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="postalCode"
                              className="pl-9"
                              placeholder="e.g., 12345"
                              {...step2Form.register("postalCode")}
                            />
                          </div>
                          {step2Form.formState.errors.postalCode && (
                            <p className="text-xs text-red-500 mt-1">
                              {step2Form.formState.errors.postalCode.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="country"
                            className="text-neutral-700 dark:text-neutral-300"
                          >
                            Country <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="country"
                            placeholder="Country"
                            {...step2Form.register("country")}
                            className={`h-11 ${
                              step2Form.formState.errors.country
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }`}
                          />
                          {step2Form.formState.errors.country && (
                            <p className="text-xs text-red-500">
                              {step2Form.formState.errors.country.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-neutral-700 dark:text-neutral-300"
                        >
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...step2Form.register("phone")}
                          className={`h-11 ${
                            step2Form.formState.errors.phone
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        {step2Form.formState.errors.phone && (
                          <p className="text-xs text-red-500">
                            {step2Form.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 flex justify-between gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={prevStep}
                        className="w-1/2"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-1/2 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20"
                      >
                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Admin Account */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0"
                >
                  <form
                    onSubmit={step3Form.handleSubmit(onStep3Submit)}
                    className="space-y-6"
                  >
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="adminFullName"
                          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="adminFullName"
                            className="pl-9"
                            placeholder="John Doe"
                            {...step3Form.register("adminFullName")}
                          />
                        </div>
                        {step3Form.formState.errors.adminFullName && (
                          <p className="text-xs text-red-500 mt-1">
                            {step3Form.formState.errors.adminFullName.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label
                            htmlFor="adminEmail"
                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="adminEmail"
                              className="pl-9"
                              type="email"
                              placeholder="admin@school.edu"
                              {...step3Form.register("adminEmail")}
                            />
                          </div>
                          {step3Form.formState.errors.adminEmail && (
                            <p className="text-xs text-red-500 mt-1">
                              {step3Form.formState.errors.adminEmail.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="adminPhone"
                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            Phone{" "}
                            <span className="text-neutral-400 text-xs font-normal">
                              (Optional)
                            </span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="adminPhone"
                              className="pl-9"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              {...step3Form.register("adminPhone")}
                            />
                          </div>
                          {step3Form.formState.errors.adminPhone && (
                            <p className="text-xs text-red-500 mt-1">
                              {step3Form.formState.errors.adminPhone.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-neutral-700 dark:text-neutral-300"
                        >
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <PasswordInput
                          id="password"
                          placeholder="••••••••"
                          showStrength
                          {...step3Form.register("password")}
                          className={`h-11 ${
                            step3Form.formState.errors.password
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        {step3Form.formState.errors.password && (
                          <p className="text-xs text-red-500">
                            {step3Form.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-neutral-700 dark:text-neutral-300"
                        >
                          Confirm Password{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <PasswordInput
                          id="confirmPassword"
                          placeholder="••••••••"
                          {...step3Form.register("confirmPassword")}
                          className={`h-11 ${
                            step3Form.formState.errors.confirmPassword
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        {step3Form.formState.errors.confirmPassword && (
                          <p className="text-xs text-red-500">
                            {step3Form.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 flex justify-between gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={prevStep}
                        className="w-1/2"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-1/2 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20"
                      >
                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 4: Preferences */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0"
                >
                  <form
                    onSubmit={step4Form.handleSubmit(onStep4Submit)}
                    className="space-y-6"
                  >
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                      <SettingsIcon className="w-4 h-4 inline mr-2 text-neutral-500" />
                      These settings are optional and can be changed later.
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="academicYearStartMonth"
                          className="text-neutral-700 dark:text-neutral-300"
                        >
                          Academic Year Start Month
                        </Label>
                        <Select
                          onValueChange={(val) =>
                            step4Form.setValue(
                              "academicYearStartMonth",
                              val as any,
                            )
                          }
                          defaultValue={step4Form.getValues(
                            "academicYearStartMonth",
                          )}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "January",
                              "February",
                              "March",
                              "April",
                              "May",
                              "June",
                              "July",
                              "August",
                              "September",
                              "October",
                              "November",
                              "December",
                            ].map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="primaryLanguage"
                            className="text-neutral-700 dark:text-neutral-300"
                          >
                            Primary Language
                          </Label>
                          <Select
                            onValueChange={(val) =>
                              step4Form.setValue("primaryLanguage", val as any)
                            }
                            defaultValue={step4Form.getValues(
                              "primaryLanguage",
                            )}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Hindi">Hindi</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="timezone"
                            className="text-neutral-700 dark:text-neutral-300"
                          >
                            Timezone
                          </Label>
                          <Select
                            onValueChange={(val) =>
                              step4Form.setValue("timezone", val)
                            }
                            defaultValue={step4Form.getValues("timezone")}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Asia/Kolkata">
                                Asia/Kolkata (IST)
                              </SelectItem>
                              <SelectItem value="America/New_York">
                                America/New York (EST)
                              </SelectItem>
                              <SelectItem value="America/Los_Angeles">
                                America/Los Angeles (PST)
                              </SelectItem>
                              <SelectItem value="Europe/London">
                                Europe/London (GMT)
                              </SelectItem>
                              <SelectItem value="Australia/Sydney">
                                Australia/Sydney (AEDT)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex justify-between gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={prevStep}
                        className="w-1/2"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-1/2 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20"
                      >
                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0"
                >
                  <form
                    onSubmit={step5Form.handleSubmit(onFinalSubmit)}
                    className="space-y-6"
                  >
                    {/* Review Summary */}
                    <div className="space-y-4 p-5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-500" />{" "}
                          School Information
                        </h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm pl-6">
                          <span className="text-neutral-500">Name:</span>{" "}
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {step1Form.getValues("schoolName")}
                          </span>
                          <span className="text-neutral-500">Type:</span>{" "}
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {step1Form.getValues("schoolType")}
                          </span>
                          <span className="text-neutral-500">Students:</span>{" "}
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {step1Form.getValues("studentCountRange")}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
                        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-500" /> Location
                        </h3>
                        <div className="space-y-1 text-sm pl-6">
                          <p className="text-neutral-900 dark:text-white">
                            {step2Form.getValues("addressLine1")}
                          </p>
                          <p className="text-neutral-900 dark:text-white">
                            {step2Form.getValues("city")},{" "}
                            {step2Form.getValues("state")}{" "}
                            {step2Form.getValues("postalCode")}
                          </p>
                          <p className="text-neutral-900 dark:text-white">
                            {step2Form.getValues("country")}
                          </p>
                          <p className="mt-2">
                            <span className="text-neutral-500">Phone:</span>{" "}
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {step2Form.getValues("phone")}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
                        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                          <UserCircle className="w-4 h-4 text-brand-500" />{" "}
                          Administrator
                        </h3>
                        <div className="space-y-1 text-sm pl-6">
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {step3Form.getValues("adminFullName")}
                          </p>
                          <p className="text-neutral-500">
                            {step3Form.getValues("adminEmail")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start space-x-3 bg-white dark:bg-neutral-950 p-4 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <Checkbox
                        id="acceptTerms"
                        checked={step5Form.watch("acceptTerms")}
                        onCheckedChange={(checked) =>
                          step5Form.setValue("acceptTerms", checked as boolean)
                        }
                        className="mt-1"
                      />
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed cursor-pointer"
                      >
                        I agree to the{" "}
                        <a
                          href="/terms"
                          className="text-brand-600 hover:underline font-medium"
                          target="_blank"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          className="text-brand-600 hover:underline font-medium"
                          target="_blank"
                        >
                          Privacy Policy
                        </a>
                        . I confirm that I am an authorized administrator for
                        this school.
                      </label>
                    </div>
                    {step5Form.formState.errors.acceptTerms && (
                      <p className="text-xs text-red-500 pl-4">
                        {step5Form.formState.errors.acceptTerms.message}
                      </p>
                    )}

                    <div className="pt-6 flex justify-between gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={prevStep}
                        className="w-1/2"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        size="lg"
                        className="w-1/2 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            Complete Registration{" "}
                            <CheckCircle2 className="w-4 h-4 ml-2" />
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
