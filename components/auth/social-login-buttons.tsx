import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface SocialLoginButtonsProps {
  isLoading: boolean;
}

export function SocialLoginButtons({ isLoading }: SocialLoginButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        className="w-full h-11 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Image
            src="/google.svg"
            alt="Google"
            width={20}
            height={20}
            className="mr-2"
          />
        )}
        <span className="text-neutral-700 dark:text-neutral-300 font-medium">
          Google
        </span>
      </Button>
      <Button
        variant="outline"
        className="w-full h-11 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Image
            src="/microsoft.svg"
            alt="Microsoft"
            width={20}
            height={20}
            className="mr-2"
          />
        )}
        <span className="text-neutral-700 dark:text-neutral-300 font-medium">
          Microsoft
        </span>
      </Button>
    </div>
  );
}
