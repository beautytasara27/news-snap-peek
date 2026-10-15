import React from "react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, id, className, ...props }, ref) => {
    const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="space-y-1.5">
        <label htmlFor={fieldId} className="block text-xs font-medium uppercase tracking-wide text-news-subtle">
          {label}
        </label>
        <input
          id={fieldId}
          ref={ref}
          className={cn(
            "focus-ring h-11 w-full rounded-xl border border-border/70 bg-foreground/[0.04] px-3.5 text-sm text-foreground",
            "placeholder:text-news-subtle/70 transition-colors hover:bg-foreground/[0.06] focus-visible:border-primary/50",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
AuthField.displayName = "AuthField";

export const AuthSubmit = ({
  pending,
  children,
  pendingLabel,
}: {
  pending: boolean;
  children: React.ReactNode;
  pendingLabel: string;
}) => (
  <button
    type="submit"
    disabled={pending}
    className="focus-ring mt-1 h-11 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {pending ? pendingLabel : children}
  </button>
);
