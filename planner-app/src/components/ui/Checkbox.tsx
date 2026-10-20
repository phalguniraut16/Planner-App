import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return (
    <span className="relative flex items-center justify-center">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-input bg-background text-primary shadow ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        {...props}
      />
      {props.checked && (
        <span className="absolute text-[10px] text-primary-foreground">
          <Check />
        </span>
      )}
    </span>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
