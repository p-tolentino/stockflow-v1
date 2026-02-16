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
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { EditInventoryDialog } from "./edit-inventory-dialog";
import { toast } from "sonner";
import { getStockStatus, getStockStatusColor } from "@/lib/stock-utils";

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

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Error", { description: error.message });
    } else {
      toast.success("Success", { description: "Item deleted" });
      router.refresh();
    }
    setDeleteId(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.categories?.name || "-"}</TableCell>
              <TableCell>{item.suppliers?.name || "-"}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>
                <span
                  className={getStockStatusColor(
                    getStockStatus(item.current_quantity, item.reorder_level),
                  )}
                >
                  {item.current_quantity}
                </span>
              </TableCell>
              <TableCell>{item.reorder_level}</TableCell>
              <TableCell className="text-right">
                <EditInventoryDialog
                  item={item}
                  categories={items
                    .map((i) => ({
                      id: i.category_id!,
                      name: i.categories?.name || "",
                    }))
                    .filter((c) => c.id)} // simplified; better to pass categories list from parent
                  suppliers={items
                    .map((i) => ({
                      id: i.supplier_id!,
                      name: i.suppliers?.name || "",
                    }))
                    .filter((s) => s.id)}
                >
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </EditInventoryDialog>

                <AlertDialog
                  open={deleteId === item.id}
                  onOpenChange={(open) => !open && setDeleteId(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteId(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
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
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
