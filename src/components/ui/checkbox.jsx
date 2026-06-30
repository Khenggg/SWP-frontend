import React from "react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, checked, onChange, ...props }, ref) => {
  return (
    <div className={cn("relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 bg-white group-hover:border-blue-500 transition-colors shrink-0", className)}>
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 cursor-pointer w-full h-full z-10"
        {...props}
      />
      {checked && <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>}
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
