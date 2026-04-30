"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitives.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        size === "default" && "h-5 w-9",
        size === "sm" && "h-4 w-8",
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
          size === "default" && "h-4 w-4 data-[state=checked]:translate-x-4",
          size === "sm" &&
            "h-3 w-3 data-[state=checked]:translate-x-3.5",
        )}
      />
    </SwitchPrimitives.Root>
  );
}

function SwitchWithLabel({
  label,
  className,
  labelClassName,
  ...props
}: React.ComponentProps<typeof Switch> & {
  label: string;
  labelClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch {...props} />
      {label && (
        <label
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export { Switch, SwitchWithLabel };
