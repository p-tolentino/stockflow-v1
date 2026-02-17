import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfMonth } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { ReportExportButtons } from "../report-export";

// Define proper types
interface InventoryItem {
  id: string;
  name: string;
  unit_price: number | null;
}

interface StockMovement {
  id: string;
  created_at: string;
  quantity_change: number;
  movement_type: "in" | "out" | "adjustment";
  notes: string | null;
  item_id: string;
  inventory_items?: {
    name: string;
    unit_price: number;
  } | null;
}

interface DailySummary {
  ins: number;
  outs: number;
  value: number;
}

interface ItemMovement {
  name: string;
  ins: number;
  outs: number;
  total: number;
  value: number;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const period = params.period || "7days";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let startDate = new Date();
  let periodLabel = "";

  // Calculate date range based on period
  switch (period) {
    case "7days":
      startDate = subDays(new Date(), 7);
      periodLabel = "Last 7 Days";
      break;
    case "30days":
      startDate = subDays(new Date(), 30);
      periodLabel = "Last 30 Days";
      break;
    case "90days":
      startDate = subDays(new Date(), 90);
      periodLabel = "Last 90 Days";
      break;
    case "month":
      startDate = startOfMonth(new Date());
      periodLabel = "Month to Date";
      break;
    default:
      startDate = subDays(new Date(), 30);
      periodLabel = "Last 30 Days";
  }

  // Fetch all items for calculations
  const { data: items } = await supabase
    .from("inventory_items")
    .select("id, name, unit_price")
    .eq("user_id", user.id);

  const typedItems = (items as InventoryItem[]) || [];

  const itemMap = new Map<string, string>(
    typedItems.map((item) => [item.id, item.name]),
  );
  const itemPriceMap = new Map<string, number>(
    typedItems.map((item) => [item.id, item.unit_price || 0]),
  );

  // Fetch movements within date range with item details
  const { data: movements } = await supabase
    .from("stock_movements")
    .select(
      `
      *,
      inventory_items (
        name,
        unit_price
      )
    `,
    )
    .eq("user_id", user.id)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });

  const typedMovements = (movements as StockMovement[]) || [];

  // Calculate period statistics
  const totalMovements = typedMovements.length;
  const totalIns = typedMovements
    .filter((m) => m.movement_type === "in")
    .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);
  const totalOuts = typedMovements
    .filter((m) => m.movement_type === "out")
    .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

  // Calculate value moved
  const valueMoved = typedMovements.reduce((sum, m) => {
    const price = itemPriceMap.get(m.item_id) || 0;
    return sum + Math.abs(m.quantity_change) * price;
  }, 0);

  // Group movements by day for trend
  const movementsByDay = new Map<string, DailySummary>();
  typedMovements.forEach((m) => {
    const day = format(new Date(m.created_at), "yyyy-MM-dd");
    const current = movementsByDay.get(day) || { ins: 0, outs: 0, value: 0 };
    const price = itemPriceMap.get(m.item_id) || 0;

    if (m.movement_type === "in") {
      current.ins += Math.abs(m.quantity_change);
      current.value += Math.abs(m.quantity_change) * price;
    } else if (m.movement_type === "out") {
      current.outs += Math.abs(m.quantity_change);
      current.value += Math.abs(m.quantity_change) * price;
    }
    movementsByDay.set(day, current);
  });

  // Top moving items this period
  const itemMovements = new Map<string, ItemMovement>();
  typedMovements.forEach((m) => {
    const current = itemMovements.get(m.item_id) || {
      name: itemMap.get(m.item_id) || "Unknown",
      ins: 0,
      outs: 0,
      total: 0,
      value: 0,
    };
    const price = itemPriceMap.get(m.item_id) || 0;

    if (m.movement_type === "in") {
      current.ins += Math.abs(m.quantity_change);
      current.value += Math.abs(m.quantity_change) * price;
    } else if (m.movement_type === "out") {
      current.outs += Math.abs(m.quantity_change);
      current.value += Math.abs(m.quantity_change) * price;
    }
    current.total = current.ins + current.outs;
    itemMovements.set(m.item_id, current);
  });

  const topMovingItems = Array.from(itemMovements.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            Reports
          </h1>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            {periodLabel} • {format(startDate, "MMM d, yyyy")} -{" "}
            {format(new Date(), "MMM d, yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 rounded-lg p-1 border border-amber-200 dark:border-amber-800">
            {[
              { value: "7days", label: "7D" },
              { value: "30days", label: "30D" },
              { value: "90days", label: "90D" },
              { value: "month", label: "MTD" },
            ].map((option) => (
              <Link
                key={option.value}
                href={`/dashboard/reports?period=${option.value}`}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === option.value
                    ? "bg-amber-600 text-white"
                    : "text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>

          {/* Export Buttons */}
          <ReportExportButtons
            data={{
              movements: typedMovements,
              movementsByDay,
              topMovingItems,
              periodLabel,
              startDate,
              endDate: new Date(),
            }}
          />
        </div>
      </div>

      {/* Summary Cards - 2x2 grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 sm:px-6 sm:py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Movements
                </p>
                <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2 text-amber-900 dark:text-amber-100">
                  {totalMovements}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/30">
                <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4 sm:px-6 sm:py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                  Stock In
                </p>
                <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2 text-green-700 dark:text-green-400">
                  {totalIns}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-lg shadow-green-500/30">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 sm:px-6 sm:py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                  Stock Out
                </p>
                <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2 text-red-700 dark:text-red-400">
                  {totalOuts}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-linear-to-br from-red-500 to-red-600 rounded-lg shadow-lg shadow-red-500/30">
                <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 sm:px-6 sm:py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Value Moved
                </p>
                <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2 text-amber-900 dark:text-amber-100">
                  ${valueMoved.toFixed(2)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/30">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout for Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Table */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="border-b border-amber-100 dark:border-amber-900/50 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
              Daily Movement Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {movementsByDay.size > 0 ? (
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden max-h-75 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-amber-50 dark:bg-amber-950/30">
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Date
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100 text-right">
                        In
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100 text-right">
                        Out
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100 text-right">
                        Net
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(movementsByDay.entries())
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .slice(0, 10)
                      .map(([day, data]) => {
                        const netChange = data.ins - data.outs;
                        return (
                          <TableRow key={day}>
                            <TableCell className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-100">
                              {format(new Date(day), "MMM d")}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-right font-medium text-green-600 dark:text-green-400">
                              +{data.ins}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-right font-medium text-red-600 dark:text-red-400">
                              -{data.outs}
                            </TableCell>
                            <TableCell
                              className={`text-xs sm:text-sm text-right font-bold ${
                                netChange > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : netChange < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-amber-800 dark:text-amber-300"
                              }`}
                            >
                              {netChange > 0 ? `+${netChange}` : netChange}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 bg-amber-50/30 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                <BarChart3 className="h-8 w-8 text-amber-300 dark:text-amber-700 mx-auto mb-2" />
                <p className="text-amber-700/70 dark:text-amber-300/70 text-sm">
                  No movement data
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Moving Items */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="border-b border-amber-100 dark:border-amber-900/50 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
              Top Moving Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {topMovingItems.length > 0 ? (
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden max-h-75 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-amber-50 dark:bg-amber-950/30">
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Item
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100 text-center">
                        In
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100 text-center">
                        Out
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100 text-center">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topMovingItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-100 truncate max-w-30 sm:max-w-none">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs">
                            +{item.ins}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">
                            -{item.outs}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
                          {item.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 bg-amber-50/30 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                <PieChart className="h-8 w-8 text-amber-300 dark:text-amber-700 mx-auto mb-2" />
                <p className="text-amber-700/70 dark:text-amber-300/70 text-sm">
                  No movement data
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
