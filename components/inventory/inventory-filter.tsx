// components/inventory/inventory-filter.tsx
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
import { Search, Filter, X, ChevronDown } from "lucide-react";
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
import { getStockStatus } from "@/lib/stock-utils";

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

interface InventoryFilterProps {
  items: InventoryItem[];
  onFilterChange: (filteredItems: InventoryItem[]) => void;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function InventoryFilter({
  items,
  onFilterChange,
  categories,
  suppliers,
}: InventoryFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");

  // Apply filters using useMemo
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Apply search filter (name and description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.description?.toLowerCase().includes(term) ?? false),
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category_id === categoryFilter);
    }

    // Apply supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter((item) => item.supplier_id === supplierFilter);
    }

    // Apply stock status filter
    if (stockStatusFilter !== "all") {
      filtered = filtered.filter((item) => {
        const status = getStockStatus(
          item.current_quantity,
          item.reorder_level,
        );
        return status === stockStatusFilter;
      });
    }

    return filtered;
  }, [items, searchTerm, categoryFilter, supplierFilter, stockStatusFilter]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filteredItems);
  }, [filteredItems, onFilterChange]);

  // Get active filters count
  const activeFilters = useMemo(() => {
    const active: string[] = [];
    if (searchTerm) active.push("search");
    if (categoryFilter !== "all") active.push("category");
    if (supplierFilter !== "all") active.push("supplier");
    if (stockStatusFilter !== "all") active.push("stock");
    return active;
  }, [searchTerm, categoryFilter, supplierFilter, stockStatusFilter]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setSupplierFilter("all");
    setStockStatusFilter("all");
  };

  const clearFilter = (filter: string) => {
    switch (filter) {
      case "search":
        setSearchTerm("");
        break;
      case "category":
        setCategoryFilter("all");
        break;
      case "supplier":
        setSupplierFilter("all");
        break;
      case "stock":
        setStockStatusFilter("all");
        break;
    }
  };

  // Stock status options
  const stockStatusOptions = [
    { value: "all", label: "All Status" },
    { value: "normal", label: "Normal" },
    { value: "low", label: "Low Stock" },
    { value: "critical", label: "Critical" },
    { value: "out", label: "Out of Stock" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-amber-400" />
            <Input
              placeholder="Search by item name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500"
            />
          </div>
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
          <DropdownMenuContent className="w-64 border-amber-200 dark:border-amber-800">
            <DropdownMenuLabel className="text-amber-900 dark:text-amber-100">
              Filter By
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-amber-100 dark:bg-amber-900" />

            <DropdownMenuGroup className="p-2 space-y-3">
              {/* Category Filter */}
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                  Category
                </p>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="h-8 border-amber-200 dark:border-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Supplier Filter */}
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                  Supplier
                </p>
                <Select
                  value={supplierFilter}
                  onValueChange={setSupplierFilter}
                >
                  <SelectTrigger className="h-8 border-amber-200 dark:border-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Status Filter */}
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                  Stock Status
                </p>
                <Select
                  value={stockStatusFilter}
                  onValueChange={setStockStatusFilter}
                >
                  <SelectTrigger className="h-8 border-amber-200 dark:border-amber-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stockStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
          {activeFilters.includes("category") && (
            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Category:{" "}
              {categories.find((c) => c.id === categoryFilter)?.name ||
                categoryFilter}
              <button
                onClick={() => clearFilter("category")}
                className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.includes("supplier") && (
            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Supplier:{" "}
              {suppliers.find((s) => s.id === supplierFilter)?.name ||
                supplierFilter}
              <button
                onClick={() => clearFilter("supplier")}
                className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.includes("stock") && (
            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Stock:{" "}
              {
                stockStatusOptions.find((s) => s.value === stockStatusFilter)
                  ?.label
              }
              <button
                onClick={() => clearFilter("stock")}
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
