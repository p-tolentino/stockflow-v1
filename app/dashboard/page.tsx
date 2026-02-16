// app/dashboard/page.tsx
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
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InventoryValueChart, MovementBreakdownChart } from "./charts";
import { IntervalSelector } from "./interval-selector";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ interval?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const interval = params.interval || "daily";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Calculate date range based on interval
  let startDate = new Date();
  let periodText = "";

  switch (interval) {
    case "weekly":
      startDate = subWeeks(new Date(), 1);
      periodText = "Last 7 Days";
      break;
    case "monthly":
      startDate = subMonths(new Date(), 1);
      periodText = "Last 30 Days";
      break;
    default: // daily
      startDate = subDays(new Date(), 1);
      periodText = "Today";
  }

  // Fetch all inventory items (current state)
  const { data: items } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("user_id", user.id);

  // Fetch items that existed during the period (for historical context)
  const { data: historicalItems } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("user_id", user.id)
    .lte("created_at", new Date().toISOString());

  const totalItems = items?.length || 0;

  // Calculate low stock items (current state - always relevant)
  const lowStockItems =
    items?.filter((item) => item.current_quantity <= item.reorder_level) || [];
  const lowStockCount = lowStockItems.length;

  // Check if any low stock item is critical
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

  // Calculate total inventory value (current state)
  const totalValue =
    items?.reduce(
      (sum, item) => sum + item.current_quantity * (item.unit_price || 0),
      0,
    ) || 0;

  // Fetch movements within the selected interval
  const { data: intervalMovements } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", startDate.toISOString());

  const intervalMovementsCount = intervalMovements?.length || 0;

  // Calculate value of goods moved during the interval
  const intervalValueMoved =
    intervalMovements?.reduce((sum, m) => {
      const item = items?.find((i) => i.id === m.item_id);
      const price = item?.unit_price || 0;
      return sum + Math.abs(m.quantity_change) * price;
    }, 0) || 0;

  // Fetch total movements count (all time)
  const { count: totalMovementsCount } = await supabase
    .from("stock_movements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch recent movements (last 5) for the table
  const { data: recentMovements } = await supabase
    .from("stock_movements")
    .select(
      `
      created_at,
      quantity_change,
      movement_type,
      item_id,
      inventory_items (
        name
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Create a lookup map for item names
  const itemMap = new Map(items?.map((item) => [item.id, item.name]));

  // --- Prepare Chart Data ---

  // 1. Movement breakdown data for pie chart (all time)
  const { data: allMovements } = await supabase
    .from("stock_movements")
    .select("movement_type")
    .eq("user_id", user.id);

  const movementBreakdownData = [
    {
      type: "Stock In",
      count: allMovements?.filter((m) => m.movement_type === "in").length || 0,
      fill: "hsl(142.1 76.2% 36.3%)",
    },
    {
      type: "Stock Out",
      count: allMovements?.filter((m) => m.movement_type === "out").length || 0,
      fill: "hsl(0 72.2% 50.6%)",
    },
    {
      type: "Adjustment",
      count:
        allMovements?.filter((m) => m.movement_type === "adjustment").length ||
        0,
      fill: "hsl(47.9 95.8% 53.1%)",
    },
  ];

  // 2. Inventory value trend data with interval support
  let trendStartDate = new Date();
  let groupFormat = "yyyy-MM-dd";
  let numberOfPoints = 30;

  switch (interval) {
    case "weekly":
      trendStartDate = subWeeks(new Date(), 12); // 12 weeks
      groupFormat = "yyyy-'W'ww";
      numberOfPoints = 12;
      break;
    case "monthly":
      trendStartDate = subMonths(new Date(), 12); // 12 months
      groupFormat = "yyyy-MM";
      numberOfPoints = 12;
      break;
    default: // daily
      trendStartDate = subDays(new Date(), 30); // 30 days
      groupFormat = "yyyy-MM-dd";
      numberOfPoints = 30;
  }

  const { data: valueHistory } = await supabase
    .from("stock_movements")
    .select(
      `
      created_at,
      quantity_change,
      item_id
    `,
    )
    .eq("user_id", user.id)
    .gte("created_at", trendStartDate.toISOString())
    .order("created_at", { ascending: true });

  // Create a map of item prices for quick lookup
  const itemPriceMap = new Map(
    items?.map((item) => [item.id, item.unit_price || 0]) || [],
  );

  // Group movements by interval and calculate net change
  const intervalChanges = new Map();

  valueHistory?.forEach((m) => {
    const date = new Date(m.created_at);
    let key: string;

    switch (interval) {
      case "weekly":
        key = format(startOfWeek(date), "yyyy-'W'ww");
        break;
      case "monthly":
        key = format(startOfMonth(date), "yyyy-MM");
        break;
      default:
        key = format(date, "yyyy-MM-dd");
    }

    const price = itemPriceMap.get(m.item_id) || 0;
    const valueChange = m.quantity_change * price;

    const current = intervalChanges.get(key) || 0;
    intervalChanges.set(key, current + valueChange);
  });

  // Build chart data with running total
  const sortedIntervals = Array.from(intervalChanges.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  // Start with current total value and work backwards
  let runningTotal = totalValue;
  const chartData = [];

  // Process from oldest to newest to build running total correctly
  for (let i = 0; i < sortedIntervals.length; i++) {
    const [interval_key, change] = sortedIntervals[i];

    if (i === 0) {
      // First interval: value = totalValue - sum of all changes after this interval
      const laterChanges = sortedIntervals
        .slice(i + 1)
        .reduce((sum, [_, ch]) => sum + ch, 0);
      runningTotal = totalValue - laterChanges;
    } else {
      // Subsequent intervals: add the change from previous interval
      runningTotal = runningTotal + sortedIntervals[i - 1][1] * -1;
    }

    chartData.push({
      date: interval_key,
      value: Math.max(0, Math.round(runningTotal * 100) / 100),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
          Dashboard
        </h1>
        <IntervalSelector interval={interval} />
      </div>

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
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Current inventory
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
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Need attention
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
                  {intervalMovementsCount}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {periodText} • Total: {totalMovementsCount ?? 0} all time
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
            intervalValueMoved > 0
              ? "border-green-200 dark:border-green-800 bg-linear-to-br from-green-50 dark:from-green-950/50"
              : intervalValueMoved < 0
                ? "border-red-200 dark:border-red-800 bg-linear-to-br from-red-50 dark:from-red-950/50"
                : "border-amber-200 dark:border-amber-800 bg-linear-to-br from-amber-50 dark:from-amber-950/50"
          } to-white dark:to-slate-900 transition-all hover:shadow-lg hover:scale-[1.02]`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Value Moved
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    intervalValueMoved > 0
                      ? "text-green-700 dark:text-green-400"
                      : intervalValueMoved < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-amber-900 dark:text-amber-100"
                  }`}
                >
                  ${intervalValueMoved.toFixed(2)}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {periodText} • Current: ${totalValue.toFixed(2)}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg shadow-lg ${
                  intervalValueMoved > 0
                    ? "bg-linear-to-br from-green-500 to-green-600 shadow-green-500/30"
                    : intervalValueMoved < 0
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryValueChart
          data={chartData}
          title={`Inventory Value Trend (${interval.charAt(0).toUpperCase() + interval.slice(1)})`}
          interval={interval}
        />
        <MovementBreakdownChart
          data={movementBreakdownData}
          title="Movement Breakdown (All Time)"
        />
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
