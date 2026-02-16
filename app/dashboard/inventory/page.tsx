import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryTableSkeleton } from "@/components/inventory/inventory-table-skeleton";
import { InventoryDialog } from "@/components/inventory/inventory-form";

export default async function InventoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch categories and suppliers for the dialog (small data)
  const [categoriesRes, suppliersRes] = await Promise.all([
    supabase.from("categories").select("id, name").eq("user_id", user.id),
    supabase.from("suppliers").select("id, name").eq("user_id", user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            Inventory Items
          </h1>
          <p className="text-sm text-amber-700/60 dark:text-amber-300/60 mt-1">
            Manage your restaurant inventory
          </p>
        </div>
        <InventoryDialog
          categories={categoriesRes.data || []}
          suppliers={suppliersRes.data || []}
        >
          <Button className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </InventoryDialog>
      </div>

      <Suspense fallback={<InventoryTableSkeleton />}>
        <InventoryTableWrapper userId={user.id} />
      </Suspense>
    </div>
  );
}

async function InventoryTableWrapper({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("inventory_items")
    .select(
      `
      *,
      categories ( name ),
      suppliers ( name )
    `,
    )
    .eq("user_id", userId)
    .order("name");

  return <InventoryTable items={items || []} />;
}
