import React from "react";

export function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800/60 bg-slate-900/40 px-4 py-3">
      <Icon size={14} className="shrink-0 text-slate-600" />
      <div className="flex-1">
        <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase">
          {label}
        </p>
        <p className="text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}
