import React from "react";
import { Card, CardDescription } from "./card";

/**
 * EmptyState Component - Trạng thái trống cho các danh sách/bảng biểu
 */
export default function EmptyState({ icon, title, description, className = "" }) {
  return (
    <Card className={`bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm ${className}`}>
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl select-none">
        {icon}
      </div>
      <p className="text-slate-800 font-bold">{title}</p>
      {description && (
        <CardDescription className="text-xs text-slate-500 mt-1 font-semibold">
          {description}
        </CardDescription>
      )}
    </Card>
  );
}
