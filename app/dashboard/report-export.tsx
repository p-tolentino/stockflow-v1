// app/dashboard/report-export.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

// Define proper types
interface Movement {
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

interface TopMovingItem {
  id: string;
  name: string;
  ins: number;
  outs: number;
  total: number;
  value: number;
}

interface ExportData {
  movements: Movement[];
  movementsByDay: Map<string, DailySummary>;
  topMovingItems: TopMovingItem[];
  periodLabel: string;
  startDate: Date;
  endDate: Date;
}

interface ReportExportButtonsProps {
  data: ExportData;
}

export function ReportExportButtons({ data }: ReportExportButtonsProps) {
  const exportToCSV = () => {
    // Prepare movements data for CSV with proper typing
    type CSVRow = {
      Date: string;
      Item: string;
      Type: string;
      Quantity: number;
      Notes: string;
    };

    const movementsData: CSVRow[] = data.movements.map((m) => ({
      Date: format(new Date(m.created_at), "yyyy-MM-dd HH:mm"),
      Item: m.inventory_items?.name || "Unknown",
      Type: m.movement_type,
      Quantity: m.quantity_change,
      Notes: m.notes || "",
    }));

    // Convert to CSV
    const headers: (keyof CSVRow)[] = [
      "Date",
      "Item",
      "Type",
      "Quantity",
      "Notes",
    ];
    const csvContent = [
      headers.join(","),
      ...movementsData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle commas in strings by wrapping in quotes
            if (typeof value === "string" && value.includes(",")) {
              return `"${value}"`;
            }
            return value;
          })
          .join(","),
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventory-report-${data.periodLabel.toLowerCase().replace(/\s+/g, "-")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // For PDF, we'll create a printable version
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    interface DailySummaryRow {
      date: string;
      ins: number;
      outs: number;
      net: number;
    }

    const dailySummary: DailySummaryRow[] = Array.from(
      data.movementsByDay.entries(),
    )
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([day, data]) => ({
        date: format(new Date(day), "MMM d, yyyy"),
        ins: data.ins,
        outs: data.outs,
        net: data.ins - data.outs,
      }));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventory Report - ${data.periodLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          .header { margin-bottom: 30px; }
          .period { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f5f5f5; text-align: left; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px 10px; border: 1px solid #ddd; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .green { color: #10b981; }
          .red { color: #ef4444; }
          .mt-4 { margin-top: 20px; }
          .mb-2 { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Inventory Movement Report</h1>
          <div class="period">${data.periodLabel} (${format(data.startDate, "MMM d, yyyy")} - ${format(data.endDate, "MMM d, yyyy")})</div>
        </div>

        <h2 class="mb-2">Daily Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th class="text-right">Stock In</th>
              <th class="text-right">Stock Out</th>
              <th class="text-right">Net Change</th>
            </tr>
          </thead>
          <tbody>
            ${dailySummary
              .map(
                (row) => `
              <tr>
                <td>${row.date}</td>
                <td class="text-right green">+${row.ins}</td>
                <td class="text-right red">-${row.outs}</td>
                <td class="text-right ${row.net > 0 ? "green" : row.net < 0 ? "red" : ""}">
                  ${row.net > 0 ? "+" : ""}${row.net}
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <h2 class="mt-4 mb-2">Top Moving Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-center">Stock In</th>
              <th class="text-center">Stock Out</th>
              <th class="text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.topMovingItems
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td class="text-center green">+${item.ins}</td>
                <td class="text-center red">-${item.outs}</td>
                <td class="text-center">${item.total}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 h-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-amber-200 dark:border-amber-800"
      >
        <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
