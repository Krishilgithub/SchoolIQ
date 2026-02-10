import * as z from "zod";

// Helper: List of disposable email providers to block
const disposableEmailDomains = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwaway.email",
  "temp-mail.org",
  "mailinator.com",
  "sharklasers.com",
  "maildrop.cc",
];

const isDisposableEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableEmailDomains.some((disposable) => domain === disposable);
};

// ============================================================================
// STEP 1: ACCOUNT CREATION (WHO)
// ============================================================================
export const accountCreationSchema = z
  .object({
    adminFullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Name is too long")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    adminEmail: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => !isDisposableEmail(email), {
        message: "Disposable email addresses are not allowed",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type AccountCreationInput = z.infer<typeof accountCreationSchema>;

// ============================================================================
// STEP 2: SCHOOL DETAILS (WHAT)
// ============================================================================
export const schoolDetailsSchema = z.object({
  schoolName: z
    .string()
    .min(3, "School name must be at least 3 characters")
    .max(100, "School name is too long"),
  curriculum: z.enum(
    ["CBSE", "ICSE", "State Board", "IB", "Cambridge/IGCSE", "Other"],
    {
      message: "Please select a curriculum",
    },
  ),
  schoolType: z.enum(["k12", "higher_ed", "vocational"], {
    message: "Please select a school type",
  }),
  country: z.string().min(2, "Country is required").default("India"),
  state: z.string().min(2, "State/Province is required"),
  city: z.string().min(2, "City is required"),
  studentCountRange: z.enum(["1-100", "101-500", "501-1000", "1000+"], {
    message: "Please select student count range",
  }),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type SchoolDetailsInput = z.infer<typeof schoolDetailsSchema>;

// ============================================================================
// STEP 3: USAGE & INTENT (HOW)
// ============================================================================
export const usageIntentSchema = z.object({
  adminRole: z.enum(
    ["Principal", "Vice Principal", "Owner", "Admin", "Teacher"],
    {
      message: "Please select your role",
    },
  ),
  primaryGoals: z
    .array(
      z.enum(["Academic", "Attendance", "Fee", "Analytics", "Communication"]),
    )
    .min(1, "Please select at least one primary goal"),
  expectedStartDate: z
    .date({
      message: "Please select a valid role",
    })
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Start date must be today or in the future",
    ),
  inviteStaffEmails: z
    .array(z.string().email("Invalid email address"))
    .max(10, "Maximum 10 staff members can be invited")
    .optional()
    .default([]),
  academicYearStartMonth: z
    .enum([
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
    ])
    .default("April"),
  primaryLanguage: z
    .enum(["English", "Hindi", "Spanish", "French", "Other"])
    .default("English"),
  timezone: z.string().default("Asia/Kolkata"),
});

export type UsageIntentInput = z.infer<typeof usageIntentSchema>;

// ============================================================================
// STEP 4: REVIEW & CREATE
// ============================================================================
export const reviewSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// ============================================================================
// COMPLETE REGISTRATION DATA (ALL STEPS COMBINED)
// ============================================================================
export type CompleteRegistrationData = AccountCreationInput &
  SchoolDetailsInput &
  UsageIntentInput &
  ReviewInput & {
    // Additional fields from location (removed separate step)
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    adminPhone?: string;
  };

// ============================================================================
// LEGACY SCHEMAS (For backward compatibility - can be removed later)
// ============================================================================
export const schoolInfoSchema = schoolDetailsSchema;
export type SchoolInfoInput = SchoolDetailsInput;

export const locationSchema = z.object({
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  postalCode: z
    .string()
    .min(4, "Postal code is required")
    .max(10, "Invalid postal code"),
  country: z.string().min(2, "Country is required").default("India"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
});
export type LocationInput = z.infer<typeof locationSchema>;

export const adminAccountSchema = accountCreationSchema;
export type AdminAccountInput = AccountCreationInput;

export const preferencesSchema = z.object({
  academicYearStartMonth: z
    .enum([
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
    ])
    .optional(),
  primaryLanguage: z
    .enum(["English", "Hindi", "Spanish", "French", "Other"])
    .default("English"),
  timezone: z.string().default("Asia/Kolkata"),
});
export type PreferencesInput = z.infer<typeof preferencesSchema>;
