export type StockStatus = "normal" | "low" | "critical";

export function getStockStatus(
  currentQuantity: number,
  reorderLevel: number,
): StockStatus {
  if (currentQuantity <= 0) return "critical";
  if (currentQuantity <= reorderLevel * 0.5) return "critical";
  if (currentQuantity <= reorderLevel) return "low";
  return "normal";
}

export function getStockStatusColor(status: StockStatus): string {
  switch (status) {
    case "critical":
      return "text-red-600 dark:text-red-400 font-bold";
    case "low":
      return "text-yellow-600 dark:text-yellow-400 font-semibold";
    default:
      return "text-green-600 dark:text-green-400";
  }
}
