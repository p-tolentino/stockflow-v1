import { createClient } from "@/lib/supabase/server";
import MovementsClient from "../../../components/movements/movements-client";

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

  return <MovementsClient initialMovements={movements || []} />;
}
