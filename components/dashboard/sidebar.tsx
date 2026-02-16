"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  TrendingUp,
  BarChart3,
  LogOut,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export const routes = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Categories", href: "/dashboard/categories", icon: Tags },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
  { name: "Stock Movements", href: "/dashboard/movements", icon: TrendingUp },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    routes.forEach((route) => {
      router.prefetch(route.href);
    });
  }, [router]);

  return (
    <div className="hidden md:flex md:w-64 w-full flex-col bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-r border-amber-200 dark:border-amber-800 h-full">
      {/* Logo/Brand - hidden on mobile (shown in header instead) */}
      <div className="hidden md:block p-6 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
            <Utensils className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">
            StockFlow
          </h1>
        </div>
      </div>

      {/* Mobile header (only visible in sheet) */}
      <div className="md:hidden p-6 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
            <Utensils className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">
            StockFlow
          </h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-linear-to-r from-amber-500 to-orange-600 text-white shadow-md"
                  : "text-amber-900/70 dark:text-amber-100/70 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-900 dark:hover:text-amber-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-amber-200 dark:border-amber-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-amber-900/70 dark:text-amber-100/70 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-900 dark:hover:text-amber-100 font-medium"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
