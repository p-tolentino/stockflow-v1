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
import { Edit, Trash, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
import { SupplierDialog } from "./supplier-form";
import { deleteSupplier } from "@/actions/suppliers";

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export function SuppliersTable({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await deleteSupplier(id);
    if (error) {
      toast.error("Error", {
        description: error,
      });
    } else {
      toast.success("Success", { description: "Supplier deleted" });
      router.refresh();
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
              Contact Person
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Email
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Phone
            </TableHead>
            <TableHead className="text-right font-semibold text-amber-900 dark:text-amber-100">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow
              key={supplier.id}
              className="hover:bg-amber-50/30 dark:hover:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/50"
            >
              <TableCell className="font-medium text-amber-900 dark:text-amber-100">
                {supplier.name}
              </TableCell>
              <TableCell className="text-amber-800 dark:text-amber-300">
                {supplier.contact_person || "-"}
              </TableCell>
              <TableCell className="text-amber-800 dark:text-amber-300">
                {supplier.email || "-"}
              </TableCell>
              <TableCell className="text-amber-800 dark:text-amber-300">
                {supplier.phone || "-"}
              </TableCell>
              <TableCell className="text-right">
                <SupplierDialog
                  initialData={{
                    id: supplier.id,
                    name: supplier.name,
                    contact_person: supplier.contact_person,
                    email: supplier.email,
                    phone: supplier.phone,
                    address: supplier.address,
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </SupplierDialog>
                <AlertDialog
                  open={deleteId === supplier.id}
                  onOpenChange={(open) => !open && setDeleteId(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(supplier.id)}
                      className="hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-amber-200 dark:border-amber-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-amber-900 dark:text-amber-100">
                        Delete Supplier?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-amber-700 dark:text-amber-300">
                        This action cannot be undone. Items from this supplier
                        will not be deleted but will have no supplier assigned.
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
                        onClick={() => handleDelete(supplier.id)}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {suppliers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Truck className="h-12 w-12 text-amber-300 dark:text-amber-700" />
                  <p className="text-amber-700/70 dark:text-amber-300/70 font-medium">
                    No suppliers found.
                  </p>
                  <p className="text-sm text-amber-600/60 dark:text-amber-400/60">
                    Add your first supplier to start tracking inventory sources
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
