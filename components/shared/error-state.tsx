import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Error",
  message,
  retry,
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        {retry && (
          <Button onClick={retry} variant="outline">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
