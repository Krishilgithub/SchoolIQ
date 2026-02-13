"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, LogOut, Home, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleGoToDashboard = () => {
    // Redirect to appropriate dashboard based on role
    if (profile?.is_super_admin) {
      router.push("/super-admin");
    } else if (profile?.role === "school_admin") {
      router.push("/dashboard/admin");
    } else if (profile?.role === "teacher") {
      router.push("/dashboard/teacher");
    } else if (profile?.role === "student") {
      router.push("/dashboard/student");
    } else if (profile?.role === "guardian") {
      router.push("/dashboard/parent");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      setIsSigningOut(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    // Open email client or redirect to support page
    window.location.href = "mailto:support@schooliq.com?subject=Access Request";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-foreground relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-grid-slate/[0.02] bg-size-[40px_40px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />

      <motion.div
        className="container flex max-w-4xl flex-col items-center gap-6 text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.div
          className="rounded-full bg-red-100 dark:bg-red-950/50 p-6 border-4 border-red-200 dark:border-red-800"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Heading */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Access Denied
          </h1>
          <div className="inline-block px-4 py-1.5 bg-red-100 dark:bg-red-950/50 rounded-full border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Error 403 • Insufficient Permissions
            </p>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="max-w-2xl leading-relaxed text-muted-foreground text-lg">
            You don&apos;t have permission to access this page. This area is
            restricted to users with specific roles.
          </p>

          {user && profile && (
            <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-2">
                Current account:
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="text-base font-semibold">
                  {profile.first_name} {profile.last_name}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-medium">
                  {profile.role || "User"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleGoToDashboard}
            size="lg"
            className="bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to My Dashboard
          </Button>

          <Button
            onClick={handleGoBack}
            variant="outline"
            size="lg"
            className="border-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="lg"
            disabled={isSigningOut}
            className="border-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Switch Account"}
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-8 p-6 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-2">Need Access?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you believe you should have access to this page, please contact
            your school administrator or our support team.
          </p>
          <Button
            onClick={handleContactSupport}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          className="text-xs text-muted-foreground mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          For security reasons, this attempt has been logged.
        </motion.p>
      </motion.div>
    </div>
  );
}
