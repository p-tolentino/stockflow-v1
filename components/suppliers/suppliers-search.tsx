"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SuppliersTable } from "./suppliers-table";

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface SuppliersSearchProps {
  suppliers: Supplier[];
}

export function SuppliersSearch({ suppliers }: SuppliersSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;

    const term = searchTerm.toLowerCase().trim();
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) ||
        (supplier.contact_person?.toLowerCase().includes(term) ?? false) ||
        (supplier.email?.toLowerCase().includes(term) ?? false) ||
        (supplier.phone?.toLowerCase().includes(term) ?? false) ||
        (supplier.address?.toLowerCase().includes(term) ?? false),
    );
  }, [suppliers, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-amber-400" />
        <Input
          placeholder="Search suppliers by name, contact, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Showing {filteredSuppliers.length} of {suppliers.length} suppliers
      </p>

      {/* Table */}
      <SuppliersTable suppliers={filteredSuppliers} />
    </div>
  );
}
