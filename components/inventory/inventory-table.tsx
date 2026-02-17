// components/inventory/inventory-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { getStockStatus, getStockStatusColor } from "@/lib/stock-utils";
import { InventoryDialog } from "./inventory-form";
import { deleteInventoryItem } from "@/actions/inventory";
import { useInventoryItems } from "@/hooks/useInventory";

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  current_quantity: number;
  reorder_level: number;
  unit_price: number;
  category_id: string | null;
  supplier_id: string | null;
  categories: { name: string } | null;
  suppliers: { name: string } | null;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onItemChange?: () => void;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function InventoryTable({
  items,
  onItemChange,
  categories,
  suppliers,
}: InventoryTableProps) {
  const { refetch } = useInventoryItems();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const result = await deleteInventoryItem(id);

    if (result.error) {
      toast.error("Error", { description: result.error });
    } else {
      toast.success("Success", { description: "Item deleted" });
      // Refresh SWR cache
      await refetch();
      // Call the refresh callback if provided
      if (onItemChange) {
        onItemChange();
      }
    }
    setDeleteId(null);
  };

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-50/70 dark:hover:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800">
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Name
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Category
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Supplier
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Unit
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Quantity
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Reorder Level
            </TableHead>
            <TableHead className="text-right font-semibold text-amber-900 dark:text-amber-100">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-amber-50/30 dark:hover:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/50"
            >
              <TableCell className="font-medium text-amber-900 dark:text-amber-100">
                {item.name}
              </TableCell>
              <TableCell className="text-amber-800 dark:text-amber-300">
                {item.categories?.name || "-"}
              </TableCell>
              <TableCell className="text-amber-800 dark:text-amber-300">
                {item.suppliers?.name || "-"}
              </TableCell>
              <TableCell className="text-amber-800 dark:text-amber-300">
                {item.unit}
              </TableCell>
              <TableCell>
                <span
                  className={getStockStatusColor(
                    getStockStatus(item.current_quantity, item.reorder_level),
                  )}
                >
                  {item.current_quantity}
                </span>
              </TableCell>
              <TableCell className="text-amber-800 dark:text-amber-300">
                {item.reorder_level}
              </TableCell>
              <TableCell className="text-right">
                <InventoryDialog
                  initialData={{
                    id: item.id,
                    name: item.name,
                    description: item.description || "",
                    category_id: item.category_id,
                    supplier_id: item.supplier_id,
                    unit: item.unit,
                    current_quantity: item.current_quantity,
                    reorder_level: item.reorder_level,
                    unit_price: item.unit_price,
                  }}
                  categories={categories}
                  suppliers={suppliers}
                  onSuccess={onItemChange}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </InventoryDialog>

                <AlertDialog
                  open={deleteId === item.id}
                  onOpenChange={(open) => !open && setDeleteId(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(item.id)}
                      className="hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-amber-200 dark:border-amber-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-amber-900 dark:text-amber-100">
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-amber-700 dark:text-amber-300">
                        This action cannot be undone. This will permanently
                        delete &quot;{item.name}&quot; from your inventory.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setDeleteId(null)}
                        className="border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Package className="h-12 w-12 text-amber-300 dark:text-amber-700" />
                  <p className="text-amber-700/70 dark:text-amber-300/70 font-medium">
                    No items found.
                  </p>
                  <p className="text-sm text-amber-600/60 dark:text-amber-400/60">
                    Add your first inventory item to get started
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
