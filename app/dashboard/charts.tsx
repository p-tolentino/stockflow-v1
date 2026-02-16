/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Area, AreaChart, CartesianGrid, XAxis, Pie, PieChart } from "recharts";
import * as RechartsPrimitive from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

// Area Chart Component
interface AreaChartProps {
  data: Array<{ date: string; value: number }>;
  title: string;
  interval: string;
}

// Custom tooltip with better formatting
const CustomTooltip = ({ active, payload, label, interval }: any) => {
  if (active && payload && payload.length) {
    const date = parseISO(label);
    let formattedDate = "";

    switch (interval) {
      case "daily":
        formattedDate = format(date, "EEEE, MMMM d, yyyy");
        break;
      case "weekly":
        formattedDate = `Week of ${format(date, "MMMM d, yyyy")}`;
        break;
      case "monthly":
        formattedDate = format(date, "MMMM yyyy");
        break;
      default:
        formattedDate = format(date, "MMMM d, yyyy");
    }

    return (
      <div className="bg-white dark:bg-slate-900 p-2 sm:p-3 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg max-w-50 sm:max-w-xs">
        <p className="text-amber-900 dark:text-amber-100 font-medium text-xs sm:text-sm mb-1">
          {formattedDate}
        </p>
        <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
          <span className="font-semibold">Inventory Value: </span>
          <span className="text-green-600 dark:text-green-400 font-bold">
            ${payload[0].value.toFixed(2)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function InventoryValueChart({ data, title, interval }: AreaChartProps) {
  const chartConfig = {
    value: {
      label: "Inventory Value",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    switch (interval) {
      case "daily":
        return format(date, "MMM d");
      case "weekly":
        return `Week of ${format(date, "MMM d")}`;
      case "monthly":
        return format(date, "MMM yyyy");
      default:
        return format(date, "MMM d");
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-50 text-amber-600 dark:text-amber-400">
            No data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-10 max-h-50 w-full"
        >
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatDate}
              interval="preserveStartEnd"
              className="sm:text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <RechartsPrimitive.Tooltip
              content={<CustomTooltip interval={interval} />}
            />
            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.4}
              strokeWidth={1.5}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Pie Chart Component
interface PieChartProps {
  data: Array<{ type: string; count: number; fill: string }>;
  title: string;
}

export function MovementBreakdownChart({ data, title }: PieChartProps) {
  const chartConfig = {
    count: {
      label: "Movements",
    },
    "Stock In": {
      label: "Stock In",
      color: "hsl(142.1 76.2% 36.3%)",
    },
    "Stock Out": {
      label: "Stock Out",
      color: "hsl(0 72.2% 50.6%)",
    },
    Adjustment: {
      label: "Adjustment",
      color: "hsl(47.9 95.8% 53.1%)",
    },
  } satisfies ChartConfig;

  const hasData = data.some((item) => item.count > 0);

  if (!hasData) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-50 text-amber-600 dark:text-amber-400">
            No movement data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-10 max-h-50 w-full"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              label={({ type, percent }) =>
                `${type}: ${(percent * 100).toFixed(0)}%`
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
