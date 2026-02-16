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
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CategoryCombobox } from "../categories/category-combobox";
import { SupplierCombobox } from "../suppliers/supplier-combobox";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category_id: z.string().nullable(),
  supplier_id: z.string().nullable(),
  unit: z.string().min(1, "Unit is required"),
  current_quantity: z.number().min(0),
  reorder_level: z.number().min(0),
  unit_price: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface AddInventoryDialogProps {
  children: React.ReactNode;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function AddInventoryDialog({
  children,
  categories,
  suppliers,
}: AddInventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: null,
      supplier_id: null,
      unit: "",
      current_quantity: 0,
      reorder_level: 0,
      unit_price: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Error", { description: "Not authenticated" });
      return;
    }

    const { error } = await supabase
      .from("inventory_items")
      .insert([{ ...values, user_id: user.id }]);

    if (error) {
      toast.error("Error", { description: error.message });
    } else {
      toast.success("Success", { description: "Item created" });
      setOpen(false);
      form.reset();
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto border-amber-200 dark:border-amber-800">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100">
            Add Inventory Item
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
                      placeholder="Tomatoes"
                      {...field}
                      className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-900 dark:text-amber-100">
                      Category
                    </FormLabel>
                    <FormControl>
                      <CategoryCombobox
                        value={field.value}
                        onChange={field.onChange}
                        categories={categories}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-900 dark:text-amber-100">
                      Supplier
                    </FormLabel>
                    <FormControl>
                      <SupplierCombobox
                        value={field.value}
                        onChange={field.onChange}
                        suppliers={suppliers}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-900 dark:text-amber-100">
                      Unit
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="kg"
                        {...field}
                        className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-900 dark:text-amber-100">
                      Current Qty
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          form.setValue(
                            "current_quantity",
                            Number(e.target.value),
                          )
                        }
                        className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-900 dark:text-amber-100">
                      Reorder Level
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          form.setValue("reorder_level", Number(e.target.value))
                        }
                        className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="unit_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-900 dark:text-amber-100">
                    Unit Price ($)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        form.setValue("unit_price", Number(e.target.value))
                      }
                      className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30"
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
