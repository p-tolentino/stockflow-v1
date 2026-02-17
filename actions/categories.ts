"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Server action to get all categories
export async function getCategories() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

// Server action to get a single category
export async function getCategory(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function createCategoryInstant(name: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, user_id: user.id }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inventory");
  return data;
}

// Server action to create a category
export async function createCategory(formData: CategoryFormData) {
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
    const validatedData = categorySchema.parse(formData);

    const { error } = await supabase.from("categories").insert([
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
    revalidatePath("/dashboard/categories");

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

    console.error("Category creation error:", error);
    return {
      success: false,
      error: "Failed to create category",
    };
  }
}

// Server action to update a category
export async function updateCategory(id: string, formData: CategoryFormData) {
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
    const validatedData = categorySchema.parse(formData);

    const { error } = await supabase
      .from("categories")
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
    revalidatePath("/dashboard/categories");

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

    console.error("Category update error:", error);
    return {
      success: false,
      error: "Failed to update category",
    };
  }
}

// Server action to delete a category
export async function deleteCategory(id: string) {
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

    // First check if category has any items
    const { data: items, error: checkError } = await supabase
      .from("inventory_items")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (checkError) {
      return {
        success: false,
        error: checkError.message,
      };
    }

    if (items && items.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete category that has items. Please reassign or delete the items first.",
      };
    }

    const { error } = await supabase
      .from("categories")
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
    revalidatePath("/dashboard/categories");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Category deletion error:", error);
    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}
