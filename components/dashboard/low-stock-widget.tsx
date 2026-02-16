import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStockStatus, getStockStatusColor } from "@/lib/stock-utils";
import { Progress } from "../ui/progress";

interface LowStockItem {
  name: string;
  current_quantity: number;
  reorder_level: number;
  unit: string;
}

export function LowStockWidget({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">All items are well stocked.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const status = getStockStatus(
            item.current_quantity,
            item.reorder_level,
          );
          const percentage = Math.min(
            (item.current_quantity / item.reorder_level) * 100,
            100,
          );
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className={getStockStatusColor(status)}>
                  {item.current_quantity} / {item.reorder_level} {item.unit}
                </span>
              </div>
              <Progress
                value={percentage}
                className={
                  status === "critical" ? "bg-red-200" : "bg-yellow-200"
                }
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
