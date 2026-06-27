import * as React from "react";

import { cn } from "@/lib/utils";

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  label?: string;
  description?: string;
}

const LoadingOverlay = ({
  open = true,
  label = "Loading…",
  description,
  className,
  ...props
}: LoadingOverlayProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm px-4 py-6",
        "pointer-events-auto",
        className,
      )}
      {...props}
    >
      <div className="flex min-h-[160px] w-full max-w-[360px] flex-col items-center justify-center gap-4 rounded-3xl border border-border/70 bg-background/95 p-6 shadow-2xl shadow-black/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-muted/60 bg-background/90">
          <span className="block h-6 w-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin motion-reduce:animate-none" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.12em] text-foreground uppercase">
            {label}
          </p>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
