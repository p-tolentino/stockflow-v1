// app/dashboard/inventory/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InventoryDialog } from "@/components/inventory/inventory-form";
import { InventoryClient } from "@/components/inventory/inventory-client";

export default async function InventoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch inventory items with category and supplier names
  const { data: items } = await supabase
    .from("inventory_items")
    .select(
      `
      *,
      categories ( name ),
      suppliers ( name )
    `,
    )
    .eq("user_id", user.id)
    .order("name");

  // Fetch categories for filter dropdown and dialog
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name");

  // Fetch suppliers for filter dropdown and dialog
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            Inventory Items
          </h1>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            Manage your stock and track inventory levels
          </p>
        </div>
        <InventoryDialog
          categories={categories || []}
          suppliers={suppliers || []}
        >
          <Button className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </InventoryDialog>
      </div>

      <InventoryClient
        initialItems={items || []}
        categories={categories || []}
        suppliers={suppliers || []}
      />
    </div>
  );
}
