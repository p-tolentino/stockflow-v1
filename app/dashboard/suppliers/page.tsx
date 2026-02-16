import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";
import { SupplierDialog } from "@/components/suppliers/supplier-form";

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
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
          Suppliers
        </h1>
        <SupplierDialog>
          <Button className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        </SupplierDialog>
      </div>

      <SuppliersTable suppliers={suppliers || []} />
    </div>
  );
}
