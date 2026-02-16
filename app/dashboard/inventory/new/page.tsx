import { InventoryForm } from "@/components/inventory/inventory-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewInventoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch categories and suppliers for dropdowns
  const [categories, suppliers] = await Promise.all([
    supabase.from("categories").select("id, name").eq("user_id", user.id),
    supabase.from("suppliers").select("id, name").eq("user_id", user.id),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Inventory Item</h1>
      <InventoryForm
        categories={categories.data || []}
        suppliers={suppliers.data || []}
      />
    </div>
  );
}
