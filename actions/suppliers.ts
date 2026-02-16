"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSupplier(name: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("suppliers")
    .insert([{ name, user_id: user.id }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inventory");
  return data;
}
