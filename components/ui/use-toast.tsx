import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

export const useToast = () => {
  return {
    toast: ({ title, description, variant }: ToastProps) => {
      if (variant === "destructive") {
        sonnerToast.error(title, { description });
      } else if (variant === "success") {
        sonnerToast.success(title, { description });
      } else {
        sonnerToast.message(title, { description });
      }
    },
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  };
};
