// components/movements/movements-filter.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X, ChevronDown } from "lucide-react";
import { format, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface Movement {
  id: string;
  quantity_change: number;
  movement_type: "in" | "out" | "adjustment";
  notes: string | null;
  created_at: string;
  inventory_items: { name: string } | null;
}

interface MovementsFilterProps {
  movements: Movement[];
  onFilterChange: (filteredMovements: Movement[]) => void;
}

export function MovementsFilter({
  movements,
  onFilterChange,
}: MovementsFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [quantityRange, setQuantityRange] = useState<{
    min: number | undefined;
    max: number | undefined;
  }>({ min: undefined, max: undefined });
  const [selectedItem, setSelectedItem] = useState<string>("all");

  // Get unique items for filtering
  const uniqueItems = useMemo(
    () =>
      Array.from(
        new Set(
          movements
            .map((m) => m.inventory_items?.name)
            .filter((name): name is string => !!name),
        ),
      ).sort(),
    [movements],
  );

  // Apply filters using useMemo
  const filteredMovements = useMemo(() => {
    let filtered = [...movements];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.inventory_items?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          m.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((m) => m.movement_type === typeFilter);
    }

    // Apply item filter
    if (selectedItem !== "all") {
      filtered = filtered.filter(
        (m) => m.inventory_items?.name === selectedItem,
      );
    }

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(
        (m) => new Date(m.created_at) >= dateRange.from!,
      );
    }
    if (dateRange?.to) {
      filtered = filtered.filter(
        (m) => new Date(m.created_at) <= addDays(dateRange.to!, 1), // Include the end date
      );
    }

    // Apply quantity range filter
    if (quantityRange.min !== undefined) {
      filtered = filtered.filter(
        (m) => Math.abs(m.quantity_change) >= quantityRange.min!,
      );
    }
    if (quantityRange.max !== undefined) {
      filtered = filtered.filter(
        (m) => Math.abs(m.quantity_change) <= quantityRange.max!,
      );
    }

    return filtered;
  }, [
    movements,
    searchTerm,
    typeFilter,
    selectedItem,
    dateRange,
    quantityRange,
  ]);

  // Call onFilterChange when filteredMovements changes
  useEffect(() => {
    onFilterChange(filteredMovements);
  }, [filteredMovements, onFilterChange]);

  // Get active filters count
  const activeFilters = useMemo(() => {
    const active: string[] = [];
    if (searchTerm) active.push("search");
    if (typeFilter !== "all") active.push("type");
    if (selectedItem !== "all") active.push("item");
    if (dateRange?.from || dateRange?.to) active.push("date");
    if (quantityRange.min !== undefined || quantityRange.max !== undefined)
      active.push("quantity");
    return active;
  }, [searchTerm, typeFilter, selectedItem, dateRange, quantityRange]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setSelectedItem("all");
    setDateRange(undefined);
    setQuantityRange({ min: undefined, max: undefined });
  };

  const clearFilter = (filter: string) => {
    switch (filter) {
      case "search":
        setSearchTerm("");
        break;
      case "type":
        setTypeFilter("all");
        break;
      case "item":
        setSelectedItem("all");
        break;
      case "date":
        setDateRange(undefined);
        break;
      case "quantity":
        setQuantityRange({ min: undefined, max: undefined });
        break;
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from) return "Date Range";
    if (!dateRange.to) return format(dateRange.from, "MMM d, yyyy");
    return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            placeholder="Search by item or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500"
          />
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge className="ml-2 bg-amber-600 text-white">
                  {activeFilters.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-amber-200 dark:border-amber-800">
            <DropdownMenuLabel className="text-amber-900 dark:text-amber-100">
              Filter By
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-amber-100 dark:bg-amber-900" />

            <DropdownMenuGroup>
              {/* Type Filter */}
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="w-full">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                    Movement Type
                  </p>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-8 border-amber-200 dark:border-amber-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="in">Stock In</SelectItem>
                      <SelectItem value="out">Stock Out</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuItem>

              {/* Item Filter */}
              {uniqueItems.length > 0 && (
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div className="w-full">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                      Item
                    </p>
                    <Select
                      value={selectedItem}
                      onValueChange={setSelectedItem}
                    >
                      <SelectTrigger className="h-8 border-amber-200 dark:border-amber-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        {uniqueItems.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "border-amber-200 dark:border-amber-800 justify-start text-left font-normal",
                !dateRange?.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-amber-200 dark:border-amber-800"
            align="start"
          >
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>

        {/* Quantity Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "border-amber-200 dark:border-amber-800",
                (quantityRange.min !== undefined ||
                  quantityRange.max !== undefined) &&
                  "text-amber-700 dark:text-amber-300",
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Quantity Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 border-amber-200 dark:border-amber-800">
            <div className="space-y-4">
              <h4 className="font-medium text-amber-900 dark:text-amber-100">
                Filter by Quantity
              </h4>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={quantityRange.min || ""}
                    onChange={(e) =>
                      setQuantityRange({
                        ...quantityRange,
                        min: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    min={0}
                    className="border-amber-200 dark:border-amber-800"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max"
                    value={quantityRange.max || ""}
                    onChange={(e) =>
                      setQuantityRange({
                        ...quantityRange,
                        max: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    min={0}
                    className="border-amber-200 dark:border-amber-800"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-amber-600 dark:text-amber-400">
            Active filters:
          </span>
          {activeFilters.includes("search") && (
            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Search: &quot;{searchTerm}&quot;
              <button
                onClick={() => clearFilter("search")}
                className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.includes("type") && (
            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Type: {typeFilter}
              <button
                onClick={() => clearFilter("type")}
                className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.includes("item") && (
            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Item: {selectedItem}
              <button
                onClick={() => clearFilter("item")}
                className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.includes("date") && dateRange && (
            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Date: {dateRange.from ? format(dateRange.from, "MMM d") : ""}
              {dateRange.to ? ` - ${format(dateRange.to, "MMM d, yyyy")}` : ""}
              <button
                onClick={() => clearFilter("date")}
                className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.includes("quantity") && (
            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Quantity: {quantityRange.min || "0"} - {quantityRange.max || "∞"}
              <button
                onClick={() => clearFilter("quantity")}
                className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
