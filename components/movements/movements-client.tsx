"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MovementsTable } from "@/components/movements/movements-table";
import { AddMovementDialog } from "@/components/movements/add-movement-dialog";
import { MovementsFilter } from "@/components/movements/movements-filter";

interface Movement {
  id: string;
  quantity_change: number;
  movement_type: "in" | "out" | "adjustment";
  notes: string | null;
  created_at: string;
  inventory_items: { name: string } | null;
}

interface MovementsClientProps {
  initialMovements: Movement[];
}

export default function MovementsClient({
  initialMovements,
}: MovementsClientProps) {
  const [movements] = useState(initialMovements);
  const [filteredMovements, setFilteredMovements] = useState(initialMovements);

  const handleFilterChange = (filtered: Movement[]) => {
    setFilteredMovements(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            Stock Movements
          </h1>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            Track all inventory changes and adjustments
          </p>
        </div>
        <AddMovementDialog>
          <Button className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Record Movement
          </Button>
        </AddMovementDialog>
      </div>

      <MovementsFilter
        movements={movements}
        onFilterChange={handleFilterChange}
      />

      {/* Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
        <p className="text-amber-600 dark:text-amber-400">
          Showing {filteredMovements.length} of {movements.length} movements
        </p>
        {filteredMovements.length > 0 && (
          <div className="flex gap-4">
            <p className="text-amber-600 dark:text-amber-400">
              Total In:{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                +
                {filteredMovements
                  .filter((m) => m.movement_type === "in")
                  .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0)
                  .toFixed(2)}
              </span>
            </p>
            <p className="text-amber-600 dark:text-amber-400">
              Total Out:{" "}
              <span className="font-semibold text-red-600 dark:text-red-400">
                -
                {filteredMovements
                  .filter((m) => m.movement_type === "out")
                  .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0)
                  .toFixed(2)}
              </span>
            </p>
          </div>
        )}
      </div>

      <MovementsTable movements={filteredMovements} />
    </div>
  );
}
