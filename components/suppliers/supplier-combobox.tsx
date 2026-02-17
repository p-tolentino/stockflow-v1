"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createSupplierInstant } from "@/actions/suppliers";
import { toast } from "sonner";

interface SupplierComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  suppliers: { id: string; name: string }[];
  includeNone?: boolean;
  disabled?: boolean;
}

export function SupplierCombobox({
  value,
  onChange,
  suppliers,
  includeNone = true,
  disabled = false,
}: SupplierComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(disabled);

  const selectedSupplier = suppliers.find((sup) => sup.id === value);

  const handleCreateSupplier = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const newSupplier = await createSupplierInstant(search.trim());
      toast.success("Success", { description: "Supplier created" });
      onChange(newSupplier.id);
      setOpen(false);
      setSearch("");
    } catch (error: unknown) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayItems = [
    ...(includeNone ? [{ id: "none", name: "None" }] : []),
    ...suppliers,
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-amber-500/20"
        >
          {value === null
            ? "None"
            : selectedSupplier
              ? selectedSupplier.name
              : "Select supplier..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-amber-900 dark:text-amber-100" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0">
        <Command>
          <CommandInput
            placeholder="Search supplier..."
            value={search}
            onValueChange={setSearch}
            className="text-amber-900 dark:text-amber-100"
          />
          <CommandEmpty>
            {search.trim() ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-amber-900 dark:text-amber-100"
                onClick={handleCreateSupplier}
                disabled={loading}
              >
                <PlusCircle className="mr-2 h-4 w-4 text-amber-900 dark:text-amber-100" />
                Create &quot;{search}&quot;
              </Button>
            ) : (
              "No supplier found"
            )}
          </CommandEmpty>
          <CommandGroup>
            {displayItems.map((item) => (
              <CommandItem
                key={item.id}
                value={item.name}
                onSelect={() => {
                  onChange(item.id === "none" ? null : item.id);
                  setOpen(false);
                }}
                className="text-amber-900 dark:text-amber-100"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-amber-900 dark:text-amber-100",
                    (item.id === "none" && value === null) || value === item.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
