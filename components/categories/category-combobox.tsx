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
import { createCategory } from "@/actions/categories";
import { toast } from "sonner";

interface CategoryComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  categories: { id: string; name: string }[];
  includeNone?: boolean;
}

export function CategoryCombobox({
  value,
  onChange,
  categories,
  includeNone = true,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const selectedCategory = categories.find((cat) => cat.id === value);

  const handleCreateCategory = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const newCategory = await createCategory(search.trim());
      toast.success("Success", { description: "Category created" });
      onChange(newCategory.id);
      setOpen(false);
      setSearch("");
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Build list with optional "None" item
  const displayItems = [
    ...(includeNone ? [{ id: "none", name: "None" }] : []),
    ...categories,
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value === null
            ? "None"
            : selectedCategory
              ? selectedCategory.name
              : "Select category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0">
        <Command>
          <CommandInput
            placeholder="Search category..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {search.trim() ? (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleCreateCategory}
                disabled={loading}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create &quot;{search}&quot;
              </Button>
            ) : (
              "No category found"
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
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
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
