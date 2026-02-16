// app/dashboard/categories/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "@/components/categories/category-form";
import { CategoriesSearch } from "@/components/categories/categories-search";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            Categories
          </h1>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            Organize your inventory items by category
          </p>
        </div>
        <CategoryDialog>
          <Button className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </CategoryDialog>
      </div>

      <CategoriesSearch categories={categories || []} />
    </div>
  );
}
