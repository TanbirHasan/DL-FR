"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUpdateItemPrice } from "@/hooks/use-shopping-lists";
import { extractErrorMessage } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils";
import type { ShoppingListItem } from "@/lib/types";

export function PriceControl({ item }: { item: ShoppingListItem }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(item.price ?? "");
  const updatePrice = useUpdateItemPrice();

  const handleSave = async () => {
    const parsed = value === "" ? null : parseFloat(value);
    if (parsed !== null && (Number.isNaN(parsed) || parsed <= 0)) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      await updatePrice.mutateAsync({ itemId: item.id, payload: { price: parsed } });
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update price"));
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setValue(item.price ?? "");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {item.price ? <span>{formatCurrency(item.price)}</span> : <Pencil className="size-3" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-2">
          <Label htmlFor={`price-${item.id}`}>Price</Label>
          <div className="flex gap-2">
            <Input
              id={`price-${item.id}`}
              type="number"
              step="0.01"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            <Button size="sm" onClick={handleSave} disabled={updatePrice.isPending}>
              Save
            </Button>
          </div>
          {item.isChecked && (
            <p className="text-xs text-muted-foreground">
              This item is checked off — editing updates its logged expense too.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
