"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CategoriesTable } from "./categories-table";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategoriesSearchProps {
  categories: Category[];
}

export function CategoriesSearch({ categories }: CategoriesSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const term = searchTerm.toLowerCase().trim();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        (category.description?.toLowerCase().includes(term) ?? false),
    );
  }, [categories, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-amber-400" />
        <Input
          placeholder="Search categories by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Showing {filteredCategories.length} of {categories.length} categories
      </p>

      {/* Table */}
      <CategoriesTable categories={filteredCategories} />
    </div>
  );
}
