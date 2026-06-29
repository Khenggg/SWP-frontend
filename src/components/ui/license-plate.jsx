import React from "react";

/**
 * LicensePlate Component - Hiển thị biển số xe chuẩn hóa
 * sizes: "sm" | "md" | "lg"
 */
export default function LicensePlate({ plate, size = "md", className = "" }) {
  if (!plate) {
    return (
      <span className={`text-slate-400 italic font-medium ${className}`}>
        N/A
      </span>
    );
  }

  const sizeClasses = {
    sm: "font-mono font-black text-slate-800 border border-slate-800 bg-white px-1.5 py-0.5 rounded shadow-sm inline-block tracking-wide text-[10px]",
    md: "font-mono font-black text-slate-800 border border-slate-800 bg-white px-2 py-0.5 rounded shadow-sm inline-block tracking-wide text-xs",
    lg: "font-black text-slate-800 text-sm md:text-base font-mono tracking-wider border-2 border-slate-800 bg-white px-2.5 py-0.5 rounded shadow-sm inline-block min-w-[120px] text-center mt-1",
  };

  return (
    <span className={`${sizeClasses[size] || sizeClasses.md} ${className}`}>
      {plate}
    </span>
  );
}
