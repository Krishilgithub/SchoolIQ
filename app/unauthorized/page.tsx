import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground animate-in fade-in zoom-in duration-500">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
          Access Denied
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          You do not have permission to view this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
          <Link href="/auth/login">
            <Button>Sign in with different account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
