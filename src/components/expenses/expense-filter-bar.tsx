"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";

export interface ExpenseFilters {
  search: string;
  categoryId: string;
  minAmount: string;
  maxAmount: string;
}

export const EMPTY_EXPENSE_FILTERS: ExpenseFilters = {
  search: "",
  categoryId: "all",
  minAmount: "",
  maxAmount: "",
};

export function hasActiveFilters(filters: ExpenseFilters) {
  return (
    filters.search.trim() !== "" ||
    filters.categoryId !== "all" ||
    filters.minAmount.trim() !== "" ||
    filters.maxAmount.trim() !== ""
  );
}

export function ExpenseFilterBar({
  filters,
  onChange,
}: {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}) {
  const { data: categories } = useCategories();
  const active = hasActiveFilters(filters);

  const set = (patch: Partial<ExpenseFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card/60 p-3">
      <div className="relative min-w-[12rem] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search notes…"
          className="pl-8"
        />
      </div>

      <Select value={filters.categoryId} onValueChange={(value) => set({ categoryId: value })}>
        <SelectTrigger className="h-8 w-40">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={filters.minAmount}
          onChange={(e) => set({ minAmount: e.target.value })}
          placeholder="Min ৳"
          className="w-24"
          aria-label="Minimum amount"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={filters.maxAmount}
          onChange={(e) => set({ maxAmount: e.target.value })}
          placeholder="Max ৳"
          className="w-24"
          aria-label="Maximum amount"
        />
      </div>

      {active && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_EXPENSE_FILTERS)}
          className="text-muted-foreground"
        >
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
