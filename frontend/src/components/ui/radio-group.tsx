"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-slot="radio-group"
      className={cn(
        "flex gap-4",
        className,
      )}
      {...props}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      data-slot="radio-item"
      className={cn(
        "peer flex shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary",
        "h-5 w-5",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        className={cn(
          "flex h-2.5 w-2.5 rounded-full bg-primary",
        )}
      />
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

const RadioGroupLabel = ({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
};

const RadioGroupItemWithLabel = ({
  value,
  label,
  className,
  labelClassName,
  disabled,
  ...props
}: React.ComponentProps<typeof RadioGroupItem> & {
  label: string;
  labelClassName?: string;
}) => {
  const id = React.useId();
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        {...props}
      />
      <RadioGroupLabel htmlFor={id} className={labelClassName}>
        {label}
      </RadioGroupLabel>
    </div>
  );
};

export { RadioGroup, RadioGroupItem, RadioGroupLabel, RadioGroupItemWithLabel };
