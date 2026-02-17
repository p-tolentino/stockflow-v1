// app/dashboard/interval-selector.tsx
"use client";

import { CalendarDays, CalendarRange, Clock } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface IntervalSelectorProps {
  interval: string;
}

export function IntervalSelector({ interval }: IntervalSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const intervals = [
    { value: "daily", label: "Daily", icon: Clock },
    { value: "weekly", label: "Weekly", icon: CalendarDays },
    { value: "monthly", label: "Monthly", icon: CalendarRange },
  ];

  const handleIntervalChange = (newInterval: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("interval", newInterval);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-1 bg-amber-50 dark:bg-amber-950/50 rounded-lg p-1 border border-amber-200 dark:border-amber-800">
      {intervals.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => handleIntervalChange(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            interval === value
              ? "bg-amber-600 text-white"
              : "text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
