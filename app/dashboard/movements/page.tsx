import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MovementsTable } from "@/components/movements/movements-table";
import { AddMovementDialog } from "@/components/movements/add-movement-dialog";

export default async function MovementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: movements } = await supabase
    .from("stock_movements")
    .select(
      `
      *,
      inventory_items ( name )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Movements</h1>
        <AddMovementDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Record Movement
          </Button>
        </AddMovementDialog>
      </div>

      <MovementsTable movements={movements || []} />
    </div>
  );
}
