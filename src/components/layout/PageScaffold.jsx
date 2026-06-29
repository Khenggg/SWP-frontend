import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageShell({ children, className }) {
  return (
    <div className={cn("app-page", className)}>
      {children}
    </div>
  );
}

export function NarrowPageShell({ children, className }) {
  return (
    <div className={cn("app-page-narrow", className)}>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, icon: Icon, actions, meta, className }) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border/80 pb-5 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="app-kicker mb-2">{eyebrow}</p>}
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-primary shadow-sm">
              <Icon aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="app-title truncate">{title}</h1>
            {meta && <div className="mt-2">{meta}</div>}
          </div>
        </div>
        {description && <p className="app-copy mt-3">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function MetricCard({ label, value, sub, icon: Icon, tone = "default" }) {
  const toneClass = {
    default: "text-primary",
    success: "text-emerald-700",
    warning: "text-amber-700",
    info: "text-sky-700",
    danger: "text-destructive",
  }[tone];

  return (
    <Card className="app-card" size="sm">
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between gap-3">
          <CardDescription className="font-bold">{label}</CardDescription>
          {Icon && (
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-muted", toneClass)}>
              <Icon aria-hidden="true" />
            </div>
          )}
        </div>
        <CardTitle className="app-stat-value">{value}</CardTitle>
      </CardHeader>
      {sub && (
        <CardContent>
          <Badge variant="secondary" className="rounded-md">
            {sub}
          </Badge>
        </CardContent>
      )}
    </Card>
  );
}

export function DetailTile({ label, value, mono = false, className }) {
  return (
    <div className={cn("rounded-lg border bg-background/80 p-3", className)}>
      <p className="app-field-label">{label}</p>
      <p className={cn("mt-1 truncate font-bold", mono && "font-mono text-lg font-black")}>{value || "--"}</p>
    </div>
  );
}
