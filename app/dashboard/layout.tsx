import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LayoutTransition } from "./layout-transition";

export default function DashboardLayout({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div
        className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300"
        key={pathname}
      >
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
          <LayoutTransition>{children}</LayoutTransition>
        </main>
      </div>
    </div>
  );
}
