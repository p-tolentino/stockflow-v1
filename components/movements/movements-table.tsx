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

interface Movement {
  id: string;
  quantity_change: number;
  movement_type: "in" | "out" | "adjustment";
  notes: string | null;
  created_at: string;
  inventory_items: { name: string } | null;
}

export function MovementsTable({ movements }: { movements: Movement[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity Change</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                {format(new Date(movement.created_at), "PPp")}
              </TableCell>
              <TableCell className="font-medium">
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
                >
                  {movement.movement_type}
                </Badge>
              </TableCell>
              <TableCell
                className={
                  movement.quantity_change > 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {movement.quantity_change > 0
                  ? `+${movement.quantity_change}`
                  : movement.quantity_change}
              </TableCell>
              <TableCell>{movement.notes || "-"}</TableCell>
            </TableRow>
          ))}
          {movements.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No movements recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
