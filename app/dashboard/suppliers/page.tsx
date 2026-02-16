import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";

export default async function SuppliersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Button asChild>
          <Link href="/dashboard/suppliers/new">
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Link>
        </Button>
      </div>

      <SuppliersTable suppliers={suppliers || []} />
    </div>
  );
}
