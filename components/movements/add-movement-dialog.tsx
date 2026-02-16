"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  item_id: z.string().min(1, "Item is required"),
  quantity_change: z
    .number()
    .refine((val) => val !== 0, { message: "Change cannot be zero" }),
  movement_type: z.enum(["in", "out", "adjustment"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddMovementDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_id: "",
      quantity_change: 0,
      movement_type: "in",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchItems = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("inventory_items")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");
      setItems(data || []);
    };
    if (open) fetchItems();
  }, [open, supabase]);

  const onSubmit = async (values: FormValues) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Error", { description: "Not authenticated" });
      return;
    }

    // Adjust sign for "out" movements
    let quantityChange = values.quantity_change;
    if (values.movement_type === "out") {
      quantityChange = -Math.abs(quantityChange); // ensure negative
    } else if (values.movement_type === "in") {
      quantityChange = Math.abs(quantityChange); // ensure positive
    }
    // For adjustment, keep as entered (could be positive or negative)

    // Insert movement
    const { error } = await supabase.from("stock_movements").insert([
      {
        item_id: values.item_id,
        quantity_change: quantityChange,
        movement_type: values.movement_type,
        notes: values.notes,
        user_id: user.id,
      },
    ]);

    if (error) {
      toast.error("Error", {
        description: error.message,
      });
    } else {
      // Update item quantity using RPC (or direct update if RPC not available)
      const { error: updateError } = await supabase.rpc(
        "update_item_quantity",
        {
          item_id: values.item_id,
          change: quantityChange,
        },
      );

      if (updateError) {
        toast.error("Error", {
          description: updateError.message,
        });
      } else {
        toast("Success", { description: "Movement recorded" });
        setOpen(false);
        form.reset();
        router.refresh();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Record Stock Movement</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="movement_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in">In</SelectItem>
                      <SelectItem value="out">Out</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity_change"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Change</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        form.setValue("quantity_change", Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Record</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
