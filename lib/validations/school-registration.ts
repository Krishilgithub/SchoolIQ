import * as z from "zod";

// Step 1: School Information
export const schoolInfoSchema = z.object({
  schoolName: z
    .string()
    .min(3, "School name must be at least 3 characters")
    .max(100, "School name is too long"),
  schoolType: z.enum(["k12", "higher_ed", "vocational"]),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  studentCountRange: z.enum(["1-100", "101-500", "501-1000", "1000+"]),
});

export type SchoolInfoInput = z.infer<typeof schoolInfoSchema>;

// Step 2: Location Details
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

// Step 3: Primary Admin Account
export const adminAccountSchema = z
  .object({
    adminFullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(100, "Name is too long"),
    adminEmail: z.string().email("Please enter a valid email address"),
    adminPhone: z
      .string()
      .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format")
      .optional()
      .or(z.literal("")),
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

export type AdminAccountInput = z.infer<typeof adminAccountSchema>;

// Step 4: Preferences (Optional)
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

// Step 5: Review & Submit (combines all)
export const reviewSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// Complete registration data type
export type CompleteRegistrationData = SchoolInfoInput &
  LocationInput &
  AdminAccountInput &
  PreferencesInput &
  ReviewInput;
