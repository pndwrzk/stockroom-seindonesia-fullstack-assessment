import { X } from "lucide-react";

type ToastProps = {
  title: string;
  description?: string;
  variant: "default" | "destructive";
  onDismiss: () => void;
};

export function Toast({ title, description, variant, onDismiss }: ToastProps) {
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      className={`relative rounded-xs border border-border bg-white p-4 pr-10 text-sm shadow-lg ${
        variant === "destructive"
          ? "text-destructive"
          : "text-foreground"
      }`}
    >
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      <button
        type="button"
        aria-label="Close notification"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        onClick={onDismiss}
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
