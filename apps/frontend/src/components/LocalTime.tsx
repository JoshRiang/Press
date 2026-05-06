"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
  value: string | number | Date;
  options: Intl.DateTimeFormatOptions;
  className?: string;
}

function formatTime(value: string | number | Date, options: Intl.DateTimeFormatOptions, timeZone?: string) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(value));
}

export default function LocalTime({ value, options, className }: LocalTimeProps) {
  const [text, setText] = useState(() => formatTime(value, options, "UTC"));

  useEffect(() => {
    setText(formatTime(value, options));
  }, [value, options]);

  return <span className={className}>{text}</span>;
}
