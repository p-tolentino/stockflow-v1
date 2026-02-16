import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoriesTable } from "@/components/categories/categories-table";
import { CategoryDialog } from "@/components/categories/category-form";

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
          Categories
        </h1>
        <CategoryDialog>
          <Button className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </CategoryDialog>
      </div>

      <CategoriesTable categories={categories || []} />
    </div>
  );
}
