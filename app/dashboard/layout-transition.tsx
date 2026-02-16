"use client";

import { usePathname } from "next/navigation";

export function LayoutTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="transition-opacity duration-300 opacity-100">
      {children}
    </div>
  );
}
