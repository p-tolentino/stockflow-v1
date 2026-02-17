"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema
const movementSchema = z.object({
  item_id: z.string().min(1, "Item is required"),
  quantity_change: z.number().refine((val) => val !== 0, {
    message: "Change cannot be zero",
  }),
  movement_type: z.enum(["in", "out", "adjustment"]),
  notes: z.string().optional(),
});

export type MovementFormData = z.infer<typeof movementSchema>;

// Server action to fetch items
export async function getItems() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, current_quantity, unit")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

// Server action to get single item details
export async function getItemDetails(itemId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .select("name, current_quantity, unit")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

// Server action to record movement
export async function recordMovement(formData: MovementFormData) {
  try {
    const supabase = await createClient();

    // Get current user
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
    const validatedData = movementSchema.parse(formData);

    // Get item details to check stock for out movements
    const { data: item } = await supabase
      .from("inventory_items")
      .select("current_quantity, name, unit")
      .eq("id", validatedData.item_id)
      .eq("user_id", user.id)
      .single();

    if (!item) {
      return {
        success: false,
        error: "Item not found",
      };
    }

    // Adjust sign for "out" movements
    let quantityChange = validatedData.quantity_change;
    if (validatedData.movement_type === "out") {
      quantityChange = -Math.abs(quantityChange);

      // Check if enough stock for out movements
      const requestedQty = Math.abs(validatedData.quantity_change);
      if (requestedQty > item.current_quantity) {
        return {
          success: false,
          error: `Insufficient stock. Only ${item.current_quantity} ${item.unit} available`,
        };
      }
    } else if (validatedData.movement_type === "in") {
      quantityChange = Math.abs(quantityChange);
    }

    // Start a transaction using RPC
    // Insert movement and update quantity in a single operation
    const { error: movementError } = await supabase
      .from("stock_movements")
      .insert([
        {
          item_id: validatedData.item_id,
          quantity_change: quantityChange,
          movement_type: validatedData.movement_type,
          notes: validatedData.notes || null,
          user_id: user.id,
        },
      ]);

    if (movementError) {
      return {
        success: false,
        error: movementError.message,
      };
    }

    // Update item quantity using RPC
    const { error: updateError } = await supabase.rpc("update_item_quantity", {
      item_id: validatedData.item_id,
      change: quantityChange,
    });

    if (updateError) {
      // Note: In a production environment, you might want to implement a rollback here
      return {
        success: false,
        error: updateError.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/movements");
    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard/items");

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

    console.error("Movement recording error:", error);
    return {
      success: false,
      error: "Failed to record movement",
    };
  }
}

export async function getMovements(limit: number = 50) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("stock_movements")
    .select(
      `
      *,
      inventory_items (
        name,
        unit_price
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}
