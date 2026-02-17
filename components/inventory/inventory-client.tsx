// app/dashboard/inventory/inventory-client.tsx
"use client";

import { useEffect, useState } from "react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryFilter } from "@/components/inventory/inventory-filter";
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

interface InventoryClientProps {
  initialItems: InventoryItem[];
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function InventoryClient({
  initialItems,
  categories,
  suppliers,
}: InventoryClientProps) {
  const [filteredItems, setFilteredItems] = useState(initialItems);

  const { items: swrItems, refetch } = useInventoryItems();

  // Use SWR data when available, fallback to initialItems
  const items = swrItems.length > 0 ? swrItems : initialItems;

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  // Handle filter changes with immediate update
  const handleFilterChange = (filtered: InventoryItem[]) => {
    setFilteredItems(filtered);
  };

  // Calculate summary stats
  const totalValue = filteredItems.reduce(
    (sum, item) => sum + item.current_quantity * item.unit_price,
    0,
  );

  const lowStockCount = filteredItems.filter(
    (item) => item.current_quantity <= item.reorder_level,
  ).length;

  return (
    <div className="space-y-6">
      <InventoryFilter
        items={items}
        onFilterChange={handleFilterChange}
        categories={categories}
        suppliers={suppliers}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Total Items
          </p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {filteredItems.length}
          </p>
        </div>
        <div className="bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Total Value
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${totalValue.toFixed(2)}
          </p>
        </div>
        <div className="bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Low Stock Items
          </p>
          <p
            className={`text-2xl font-bold ${
              lowStockCount > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Results count and refresh indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Showing {filteredItems.length} of {items.length} items
        </p>
      </div>

      <InventoryTable
        items={filteredItems}
        onItemChange={refetch}
        categories={categories}
        suppliers={suppliers}
      />
    </div>
  );
}
