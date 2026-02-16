// components/movements/movements-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Repeat } from "lucide-react";

interface Movement {
  id: string;
  quantity_change: number;
  movement_type: "in" | "out" | "adjustment";
  notes: string | null;
  created_at: string;
  inventory_items: { name: string } | null;
}

export function MovementsTable({ movements }: { movements: Movement[] }) {
  // No useEffect here - this is a pure presentation component

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-50/70 dark:hover:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800">
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Date
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Item
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Type
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Quantity Change
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Notes
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow
              key={movement.id}
              className="hover:bg-amber-50/30 dark:hover:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/50"
            >
              <TableCell className="font-medium text-amber-800 dark:text-amber-300">
                {format(new Date(movement.created_at), "PPp")}
              </TableCell>
              <TableCell className="font-medium text-amber-900 dark:text-amber-100">
                {movement.inventory_items?.name || "Unknown"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    movement.movement_type === "in"
                      ? "default"
                      : movement.movement_type === "out"
                        ? "destructive"
                        : "secondary"
                  }
                  className={`${
                    movement.movement_type === "in"
                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900"
                      : movement.movement_type === "out"
                        ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900"
                  } uppercase text-xs font-medium`}
                >
                  {movement.movement_type}
                </Badge>
              </TableCell>
              <TableCell
                className={`font-bold ${
                  movement.quantity_change > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {movement.quantity_change > 0
                  ? `+${movement.quantity_change}`
                  : movement.quantity_change}
              </TableCell>
              <TableCell className="text-amber-800 dark:text-amber-300">
                {movement.notes || "-"}
              </TableCell>
            </TableRow>
          ))}
          {movements.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Repeat className="h-12 w-12 text-amber-300 dark:text-amber-700" />
                  <p className="text-amber-700/70 dark:text-amber-300/70 font-medium">
                    No movements recorded yet.
                  </p>
                  <p className="text-sm text-amber-600/60 dark:text-amber-400/60">
                    Stock movements will appear here as you add or remove items
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
