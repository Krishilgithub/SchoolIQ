import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 -z-10 blur-2xl bg-brand-500/20 rounded-full" />
        <h1 className="text-9xl font-bold tracking-tighter text-foreground">
          404
        </h1>
      </div>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Page Not Found
      </h2>
      <p className="mb-8 max-w-[500px] text-muted-foreground">
        Sorry, we could&apos;n&apos;t find the page you&apos;re looking for. It might have been
        removed, deleted, or possibly never existed.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default" size="lg">
          <Link href="/dashboard">Return Home</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          {/* Fallback to login if dashboard isn't appropriate, but usually dashboard is safe or redirects */}
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
