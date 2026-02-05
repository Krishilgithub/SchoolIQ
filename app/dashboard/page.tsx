import { redirect } from "next/navigation";

export default function DashboardPage() {
  // For now, we redirect to the admin dashboard as it's the only one implemented
  // In the future, this page will dispatch based on the user's role
  redirect("/dashboard/admin");
}
