"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUpdateItem } from "@/hooks/use-items";
import { extractErrorMessage } from "@/lib/api/client";
import type { Item } from "@/lib/types";

/**
 * Inline editor for a catalog item's unit price. Saving an empty value clears it.
 */
export function ItemPriceEditor({ item, children }: { item: Item; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(item.price ?? "");
  const updateItem = useUpdateItem();

  const handleSave = async () => {
    const parsed = value === "" ? null : parseFloat(value);
    if (parsed !== null && (Number.isNaN(parsed) || parsed <= 0)) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      await updateItem.mutateAsync({ id: item.id, payload: { price: parsed } });
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
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-52" align="end">
        <div className="space-y-2">
          <Label htmlFor={`item-price-${item.id}`}>
            Unit price{item.unit ? ` (per ${item.unit})` : ""}
          </Label>
          <div className="flex gap-2">
            <Input
              id={`item-price-${item.id}`}
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
            <Button size="sm" onClick={handleSave} disabled={updateItem.isPending}>
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Used to auto-fill a list item&apos;s price from its quantity.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
