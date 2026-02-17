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
import { toast } from "sonner";
import {
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from "lucide-react";
import {
  getItems,
  getItemDetails,
  recordMovement,
  type MovementFormData,
} from "@/actions/movements";

const formSchema = z.object({
  item_id: z.string().min(1, "Item is required"),
  quantity_change: z
    .number()
    .refine((val) => val !== 0, { message: "Change cannot be zero" }),
  movement_type: z.enum(["in", "out", "adjustment"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MovementDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function MovementDialog({ children, onSuccess }: MovementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<
    { id: string; name: string; current_quantity: number; unit: string }[]
  >([]);
  const [selectedItem, setSelectedItem] = useState<{
    name: string;
    current_quantity: number;
    unit: string;
  } | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_id: "",
      quantity_change: 0,
      movement_type: "in",
      notes: "",
    },
  });

  // Watch for item selection to show current stock
  const watchItemId = form.watch("item_id");
  const watchMovementType = form.watch("movement_type");

  // Fetch items when dialog opens
  useEffect(() => {
    const fetchItems = async () => {
      const result = await getItems();
      if (result.error) {
        toast.error("Error", { description: result.error });
      } else if (result.data) {
        setItems(result.data);
      }
    };

    if (open) {
      fetchItems();
    }
  }, [open]);

  // Fetch item details when item selection changes
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (watchItemId) {
        const result = await getItemDetails(watchItemId);
        if (result.error) {
          toast.error("Error", { description: result.error });
        } else {
          setSelectedItem(result.data);
        }
      } else {
        setSelectedItem(null);
      }
    };

    if (watchItemId) {
      fetchItemDetails();
    }
  }, [watchItemId]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    const result = await recordMovement(values);

    if (result.success) {
      toast.success("Success", {
        description: "Movement recorded successfully",
      });
      router.refresh();
      setOpen(false);
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } else {
      toast.error("Error", {
        description: result.error,
      });
    }

    setLoading(false);
  };

  // Get icon based on movement type
  const getMovementIcon = () => {
    switch (watchMovementType) {
      case "in":
        return (
          <ArrowDownCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case "out":
        return (
          <ArrowUpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        );
      case "adjustment":
        return (
          <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        key="add-movement"
        className="sm:max-w-md border-amber-200 dark:border-amber-800"
      >
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Record Stock Movement
          </DialogTitle>
        </DialogHeader>

        {/* Current Stock Indicator */}
        {selectedItem && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-700 dark:text-amber-300">
                Current Stock:{" "}
                <span className="font-bold">{selectedItem.name}</span>
              </span>
              <span className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {selectedItem.current_quantity} {selectedItem.unit}
              </span>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-900 dark:text-amber-100">
                    Item <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
                        disabled={loading}
                      >
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-amber-200 dark:border-amber-800">
                      {items.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          className="focus:bg-amber-50 dark:focus:bg-amber-950/50"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{item.name}</span>
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              {item.current_quantity} {item.unit}
                            </span>
                          </div>
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
                  <FormLabel className="text-amber-900 dark:text-amber-100">
                    Movement Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
                        disabled={loading}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-amber-200 dark:border-amber-800">
                      <SelectItem
                        value="in"
                        className="focus:bg-amber-50 dark:focus:bg-amber-950/50"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowDownCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span>Stock In (Add)</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="out"
                        className="focus:bg-amber-50 dark:focus:bg-amber-950/50"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span>Stock Out (Remove)</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="adjustment"
                        className="focus:bg-amber-50 dark:focus:bg-amber-950/50"
                      >
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span>Adjustment (Correct)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="relative">
              <FormField
                control={form.control}
                name="quantity_change"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      {getMovementIcon()}
                      <span>
                        Quantity Change <span className="text-red-500">*</span>
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={
                            watchMovementType === "in"
                              ? "Enter amount to add"
                              : watchMovementType === "out"
                                ? "Enter amount to remove"
                                : "Enter adjustment amount"
                          }
                          {...field}
                          onChange={(e) =>
                            form.setValue(
                              "quantity_change",
                              Number(e.target.value),
                            )
                          }
                          className={`border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20 ${
                            watchMovementType === "in"
                              ? "border-green-300 dark:border-green-700"
                              : watchMovementType === "out"
                                ? "border-red-300 dark:border-red-700"
                                : ""
                          }`}
                          disabled={loading}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400">
                          {selectedItem?.unit || "unit(s)"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-900 dark:text-amber-100">
                    Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this movement..."
                      {...field}
                      value={field.value || ""}
                      className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20 min-h-20"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-amber-100 dark:border-amber-900/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-300"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30"
                disabled={loading}
              >
                Record Movement
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
