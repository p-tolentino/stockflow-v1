import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryTableSkeleton } from "@/components/inventory/inventory-table-skeleton";
import { AddInventoryDialog } from "@/components/inventory/add-inventory-dialog";

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
        <h1 className="text-3xl font-bold">Inventory Items</h1>
        <AddInventoryDialog
          categories={categoriesRes.data || []}
          suppliers={suppliersRes.data || []}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </AddInventoryDialog>
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
