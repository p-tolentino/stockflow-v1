"use client";

import { LogOut, Menu, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { routes } from "./sidebar";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "../theme-toggle";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-50 shadow-sm">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-900 dark:text-amber-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-full p-0 border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-950 overflow-auto"
        >
          <div className="w-full flex-col bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-r border-amber-200 dark:border-amber-800 h-full">
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

            <div className="flex-1 space-y-1 p-4">
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
            </div>

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
        </SheetContent>
      </Sheet>

      {/* Logo/Brand - visible on mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
          <span className="text-lg text-background">
            <Utensils />
          </span>
        </div>
        <h1 className="text-lg font-bold text-amber-900 dark:text-amber-100">
          StockFlow
        </h1>
      </div>

      <div className="flex-1" />

      <ThemeToggle />
      <UserNav />
    </header>
  );
}
