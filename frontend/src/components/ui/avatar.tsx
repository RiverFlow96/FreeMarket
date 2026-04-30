import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "circle" | "square";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "default", variant = "circle", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-size={size}
    data-variant={variant}
    className={cn(
      "relative flex shrink-0 overflow-hidden",
      size === "sm" && "h-8 w-8 text-xs",
      size === "default" && "h-10 w-10 text-sm",
      size === "lg" && "h-12 w-12 text-base",
      size === "xl" && "h-16 w-16 text-lg",
      variant === "circle" && "rounded-full",
      variant === "square" && "rounded-md",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
    loading?: boolean;
  }
>(({ className, loading = false, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-loading={loading}
    className={cn(
      "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
      loading && "animate-pulse bg-muted/50",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
