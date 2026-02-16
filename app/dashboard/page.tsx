import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
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
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all inventory items
  const { data: items } = await supabase
    .from("inventory_items")
    .select("current_quantity, reorder_level, unit_price")
    .eq("user_id", user.id);

  const totalItems = items?.length || 0;
  const lowStockItems =
    items?.filter((item) => item.current_quantity <= item.reorder_level) || [];
  const lowStockCount = lowStockItems.length;

  // Check if any low stock item is critical (<= half of reorder level or <= 0)
  const hasCriticalLow = lowStockItems.some(
    (item) =>
      item.current_quantity <= item.reorder_level * 0.5 ||
      item.current_quantity <= 0,
  );
  const lowStockStatus = hasCriticalLow
    ? "critical"
    : lowStockCount > 0
      ? "low"
      : "normal";

  // Calculate total inventory value
  const totalValue =
    items?.reduce(
      (sum, item) => sum + item.current_quantity * (item.unit_price || 0),
      0,
    ) || 0;

  // Fetch total movements count
  const { count: movementsCount } = await supabase
    .from("stock_movements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch recent movements (last 5)
  const { data: recentMovements } = await supabase
    .from("stock_movements")
    .select(
      `
      created_at,
      quantity_change,
      movement_type,
      inventory_items (name)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items Card */}
        <Card className="border-gray-200 bg-linear-to-br from-gray-50 to-white animate-slide-up transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-3xl font-bold mt-2">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items Card */}
        <Card className="border-red-200 bg-linear-to-br from-red-50 to-white animate-slide-up transition-all hover:shadow-lg hover:scale-[1.01]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    lowStockStatus === "critical"
                      ? "text-red-600"
                      : lowStockStatus === "low"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {lowStockCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Stock Movements Card */}
        <Card className="border-gray-200 bg-linear-to-br from-gray-50 to-white animate-slide-up transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Movements</p>
                <p className="text-3xl font-bold mt-2">{movementsCount ?? 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Value Card */}
        <Card className="border-green-200 bg-linear-to-br from-green-50 to-white animate-slide-up transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Value</p>
                <p className="text-3xl font-bold text-secondary mt-2">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stock Movements Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Stock Movements</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/movements">View all</Link>
            </Button>
          </div>
          {recentMovements && recentMovements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map((movement, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {format(new Date(movement.created_at), "PPp")}
                    </TableCell>
                    <TableCell>{movement.inventory_items?.name}</TableCell>
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
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {movement.quantity_change > 0
                        ? `+${movement.quantity_change}`
                        : movement.quantity_change}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No recent movements.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
