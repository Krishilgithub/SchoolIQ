import { Building2, Shield, Users, Zap } from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import Link from "next/link";

export function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

      <div className="flex flex-col justify-between p-12 relative z-10 w-full">
        {/* Logo */}
        <div>
          <Link href="/">
            <Logo textClassName="text-white" />
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Streamline Your School Management
            </h2>
            <p className="text-xl text-brand-100">
              All-in-one platform for modern educational institutions
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Student Management</h3>
              <p className="text-sm text-brand-100">
                Track attendance, grades, and student progress
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Multi-Campus</h3>
              <p className="text-sm text-brand-100">
                Manage multiple locations from one dashboard
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Real-time Analytics</h3>
              <p className="text-sm text-brand-100">
                Insights into performance and trends
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Secure & Compliant</h3>
              <p className="text-sm text-brand-100">
                Enterprise-grade security for your data
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 text-brand-100 text-sm">
          <span>© 2024 SchoolIQ</span>
          <span>•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
