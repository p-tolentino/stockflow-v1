"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  initialData?: Partial<FormValues> & { id?: string };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (initialData?.id) {
      // Update
      const { error } = await supabase
        .from("categories")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", initialData.id);
      if (error) {
        toast.error("Error", {
          description: error.message,
        });
      } else {
        toast.success("Success", { description: "Category updated" });
        router.push("/dashboard/categories");
        router.refresh();
      }
    } else {
      // Insert
      const { error } = await supabase
        .from("categories")
        .insert([{ ...values, user_id: user.id }]);
      if (error) {
        toast.error("Error", {
          description: error.message,
        });
      } else {
        toast.success("Success", { description: "Category created" });
        router.push("/dashboard/categories");
        router.refresh();
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Produce" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional description"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit">{initialData?.id ? "Update" : "Create"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
