import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/categories/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Category</h1>
      <CategoryForm initialData={category} />
    </div>
  );
}
