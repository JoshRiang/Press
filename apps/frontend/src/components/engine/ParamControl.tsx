import React from "react";

// Atomic

export function ParamControl({
  label,
  sublabel,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="font-mono text-[10px] text-slate-600">{sublabel}</p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-bold text-sky-400">{value}</span>
          <span className="font-mono text-[10px] text-slate-500">{unit}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-slate-800 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-400 
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(56,189,248,0.4)]
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-sky-400 [&::-moz-range-thumb]:border-0"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-[8px] text-slate-700">{min}{unit}</span>
          <span className="font-mono text-[8px] text-slate-700">{max}{unit}</span>
        </div>
      </div>
    </div>
  );
}
