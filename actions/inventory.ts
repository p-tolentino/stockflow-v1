"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema
const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  category_id: z.string().nullable(),
  supplier_id: z.string().nullable(),
  unit: z.string().min(1, "Unit is required"),
  current_quantity: z.number().min(0, "Quantity must be 0 or greater"),
  reorder_level: z.number().min(0, "Reorder level must be 0 or greater"),
  unit_price: z.number().min(0, "Price must be 0 or greater"),
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

// Server action to get all inventory items
export async function getInventoryItems() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `
      *,
      categories:category_id (
        id,
        name
      ),
      suppliers:supplier_id (
        id,
        name
      )
    `,
    )
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

// Server action to get a single inventory item
export async function getInventoryItem(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `
      *,
      categories:category_id (
        id,
        name
      ),
      suppliers:supplier_id (
        id,
        name
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

// Server action to create an inventory item
export async function createInventoryItem(formData: InventoryItemFormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate the form data
    const validatedData = inventoryItemSchema.parse(formData);

    const { error } = await supabase.from("inventory_items").insert([
      {
        ...validatedData,
        user_id: user.id,
      },
    ]);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/reports");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Inventory item creation error:", error);
    return {
      success: false,
      error: "Failed to create inventory item",
    };
  }
}

// Server action to update an inventory item
export async function updateInventoryItem(
  id: string,
  formData: InventoryItemFormData,
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate the form data
    const validatedData = inventoryItemSchema.parse(formData);

    const { error } = await supabase
      .from("inventory_items")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/reports");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Inventory item update error:", error);
    return {
      success: false,
      error: "Failed to update inventory item",
    };
  }
}

// Server action to delete an inventory item
export async function deleteInventoryItem(id: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // First check if item has any movements
    const { data: movements, error: checkError } = await supabase
      .from("stock_movements")
      .select("id")
      .eq("item_id", id)
      .limit(1);

    if (checkError) {
      return {
        success: false,
        error: checkError.message,
      };
    }

    if (movements && movements.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete item that has stock movements. Please delete the movements first.",
      };
    }

    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/reports");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Inventory item deletion error:", error);
    return {
      success: false,
      error: "Failed to delete inventory item",
    };
  }
}
