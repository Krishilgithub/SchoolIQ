import { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SchoolRegistrationWizard } from "@/components/auth/school-registration-wizard";

export const metadata: Metadata = {
  title: "Register Your School | SchoolIQ",
  description:
    "Join SchoolIQ and modernize your school's operations with our comprehensive management platform.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <SchoolRegistrationWizard />
    </AuthLayout>
  );
}
