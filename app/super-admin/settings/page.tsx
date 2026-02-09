import { PageHeader } from "@/components/super-admin/common/page-header";
import { SettingsForm } from "@/components/super-admin/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pt-2 pb-12 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your account settings and platform configurations."
      />

      <div className="flex justify-center md:justify-start">
        <SettingsForm />
      </div>
    </div>
  );
}
