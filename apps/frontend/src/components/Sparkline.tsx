"use client";

import { useId } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
}

/**
 * Minimal SVG sparkline chart for volume trends.
 * Renders a smooth polyline with optional gradient fill.
 */
export default function Sparkline({ data, width = 120, height = 32, color = "#38bdf8", fillColor, strokeWidth = 1.5 }: SparklineProps) {
  const gradientId = useId();

  if (data.length < 2) {
    return (
      <div style={{ width, height }} className="flex items-start justify-start">
        <span className="font-mono text-[9px] text-slate-300">Add 1 more session to see trend</span>
      </div>
    );
  }

  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((v - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const fillPath = `M ${points[0]} ${points.join(" L ")} L ${padding + chartWidth},${padding + chartHeight} L ${padding},${padding + chartHeight} Z`;
  const gradientUrlId = `sparkline-gradient-${gradientId}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {fillColor && (
        <>
          <defs>
            <linearGradient id={gradientUrlId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={fillPath} fill={`url(#${gradientUrlId})`} />
        </>
      )}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {/* Endpoint dot */}
      {data.length > 0 && <circle cx={padding + chartWidth} cy={padding + chartHeight - ((data[data.length - 1] - min) / range) * chartHeight} r={2.5} fill={color} />}
    </svg>
  );
}
