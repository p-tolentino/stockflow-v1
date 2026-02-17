"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createCategory, updateCategory } from "@/actions/categories";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryDialogProps {
  children: React.ReactNode;
  initialData?: Partial<FormValues> & { id?: string };
}

export function CategoryDialog({ children, initialData }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refetch } = useCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    let result;
    if (initialData?.id) {
      // Update
      result = await updateCategory(initialData.id, values);
    } else {
      // Create
      result = await createCategory(values);
    }

    if (result.success) {
      toast.success("Success", {
        description: initialData?.id ? "Category updated" : "Category created",
      });
      setOpen(false);
      form.reset();

      // Refresh SWR cache
      await refetch();

      // Refresh Next.js router cache
      router.refresh();
    } else {
      toast.error("Error", {
        description: result.error,
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        key={initialData?.id || "new"}
        className="sm:max-w-md border-amber-200 dark:border-amber-800"
      >
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100">
            {initialData?.id ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-900 dark:text-amber-100">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Produce"
                      {...field}
                      className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
                      disabled={loading}
                    />
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
                  <FormLabel className="text-amber-900 dark:text-amber-100">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      {...field}
                      value={field.value || ""}
                      className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30"
                disabled={loading}
              >
                {initialData?.id ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
