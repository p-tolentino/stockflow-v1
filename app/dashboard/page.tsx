import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  Repeat,
  DollarSign,
  CircleCheckBig,
} from "lucide-react";
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
    .select("*")
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
    item_id
  `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Create a lookup map
  const itemMap = new Map(items?.map((item) => [item.id, item.name]));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items Card */}
        <Card className="border-amber-200 dark:border-amber-800 bg-linear-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-900 transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Total Items
                </p>
                <p className="text-3xl font-bold mt-2 text-amber-900 dark:text-amber-100">
                  {totalItems}
                </p>
              </div>
              <div className="p-3 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/30">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items Card */}
        <Card
          className={`${
            lowStockStatus === "critical"
              ? "border-red-200 dark:border-red-800 bg-linear-to-br from-red-50 dark:from-red-950/50"
              : lowStockStatus === "low"
                ? "border-amber-200 dark:border-amber-800 bg-linear-to-br from-amber-50 dark:from-amber-950/50"
                : "border-green-200 dark:border-green-800 bg-linear-to-br from-green-50 dark:from-green-950/50"
          } to-white dark:to-slate-900 transition-all hover:shadow-lg hover:scale-[1.02]`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Low Stock Items
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    lowStockStatus === "critical"
                      ? "text-red-700 dark:text-red-400"
                      : lowStockStatus === "low"
                        ? "text-amber-800 dark:text-amber-300"
                        : "text-green-700 dark:text-green-400"
                  }`}
                >
                  {lowStockCount}
                </p>
              </div>
              {lowStockCount === 0 ? (
                <div className="p-3 bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-lg shadow-green-500/30">
                  <CircleCheckBig className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div
                  className={`p-3 rounded-lg shadow-lg ${
                    lowStockStatus === "critical"
                      ? "bg-linear-to-br from-red-500 to-red-600 shadow-red-500/30"
                      : "bg-linear-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
                  }`}
                >
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Movements Card */}
        <Card className="border-amber-200 dark:border-amber-800 bg-linear-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-900 transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Stock Movements
                </p>
                <p className="text-3xl font-bold mt-2 text-amber-900 dark:text-amber-100">
                  {movementsCount ?? 0}
                </p>
              </div>
              <div className="p-3 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/30">
                <Repeat className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Value Card */}
        <Card
          className={`${
            totalValue > 0
              ? "border-green-200 dark:border-green-800 bg-linear-to-br from-green-50 dark:from-green-950/50"
              : totalValue < 0
                ? "border-red-200 dark:border-red-800 bg-linear-to-br from-red-50 dark:from-red-950/50"
                : "border-amber-200 dark:border-amber-800 bg-linear-to-br from-amber-50 dark:from-amber-950/50"
          } to-white dark:to-slate-900 transition-all hover:shadow-lg hover:scale-[1.02]`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Inventory Value
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    totalValue > 0
                      ? "text-green-700 dark:text-green-400"
                      : totalValue < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-amber-900 dark:text-amber-100"
                  }`}
                >
                  ${totalValue.toFixed(2)}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg shadow-lg ${
                  totalValue > 0
                    ? "bg-linear-to-br from-green-500 to-green-600 shadow-green-500/30"
                    : totalValue < 0
                      ? "bg-linear-to-br from-red-500 to-red-600 shadow-red-500/30"
                      : "bg-linear-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
                }`}
              >
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stock Movements Table */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              Recent Stock Movements
            </h2>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-900 dark:hover:text-amber-100"
            >
              <Link href="/dashboard/movements">View all</Link>
            </Button>
          </div>
          {recentMovements && recentMovements.length > 0 ? (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-50/70 dark:hover:bg-amber-950/50">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement, idx) => (
                    <TableRow
                      key={idx}
                      className="hover:bg-amber-50/30 dark:hover:bg-amber-950/20"
                    >
                      <TableCell className="font-medium text-amber-800 dark:text-amber-300">
                        {format(new Date(movement.created_at), "PPp")}
                      </TableCell>
                      <TableCell className="font-medium text-amber-900 dark:text-amber-100">
                        {itemMap.get(movement.item_id)}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-amber-50/30 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
              <Repeat className="h-12 w-12 text-amber-300 dark:text-amber-700 mx-auto mb-3" />
              <p className="text-amber-700/70 dark:text-amber-300/70 font-medium">
                No recent movements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
