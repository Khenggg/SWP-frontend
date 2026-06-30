import React from "react";
import { cn } from "@/lib/utils";
import { ShieldAlert, Info } from "lucide-react";

const Alert = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "border-blue-200 bg-blue-50 text-blue-800",
    destructive: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "mb-6 flex items-start gap-2.5 rounded-xl border p-3 text-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === "destructive" && <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />}
      {variant === "default" && <Info className="h-5 w-5 shrink-0 text-blue-600" />}
      <div>{children}</div>
    </div>
  );
});
Alert.displayName = "Alert";

export { Alert };
