import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
      <Card className="bg-zinc-800 border-zinc-700 text-white">
        <CardHeader>
          <CardTitle>Feature Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">
            This module has been architected in the database schema but the UI
            is currently under construction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
