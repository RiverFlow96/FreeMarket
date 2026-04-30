"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      className={cn(
        "peer flex shrink-0 cursor-pointer items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        size === "default" && "h-5 w-5 border-input",
        size === "sm" && "h-4 w-4 border-input",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("text-current")}>
        {props.checked === "indeterminate" ? (
          <Minus className={cn(size === "default" ? "h-3.5 w-3.5" : "h-3 w-3")} />
        ) : (
          <Check className={cn(size === "default" ? "h-3.5 w-3.5" : "h-3 w-3")} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

function CheckboxWithLabel({
  label,
  className,
  labelClassName,
  labelRef,
  ...props
}: React.ComponentProps<typeof Checkbox> & {
  label: string;
  labelClassName?: string;
  labelRef?: React.RefObject<HTMLLabelElement>;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox {...props} />
      {label && (
        <label
          ref={labelRef}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            labelClassName,
          )}
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export { Checkbox, CheckboxWithLabel };
