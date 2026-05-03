import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-3.5 w-3.5 text-[10px] py-0 px-1",
  md: "h-4 w-4 text-xs py-0.5 px-1.5",
  lg: "h-5 w-5 text-sm py-1 px-2",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function VerifiedBadge({ className, showLabel = false, size = "sm" }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full font-medium",
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        "border border-emerald-500/20",
        sizes[size],
        className
      )}
    >
      <CheckCircle className={iconSizes[size]} />
      {showLabel && <span>Verificado</span>}
    </span>
  );
}