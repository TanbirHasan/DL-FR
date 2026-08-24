"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUpdateItemQuantity } from "@/hooks/use-shopping-lists";
import { extractErrorMessage } from "@/lib/api/client";
import type { ShoppingListItem } from "@/lib/types";

export function QuantityControl({ item }: { item: ShoppingListItem }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(item.quantity ?? "");
  const updateQuantity = useUpdateItemQuantity();

  const handleSave = async () => {
    const parsed = value === "" ? null : parseFloat(value);
    if (parsed !== null && (Number.isNaN(parsed) || parsed <= 0)) {
      toast.error("Enter a valid quantity");
      return;
    }
    try {
      await updateQuantity.mutateAsync({ itemId: item.id, payload: { quantity: parsed } });
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update quantity"));
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setValue(item.quantity ?? "");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {item.quantity ? (
            <span>
              {item.quantity}
              {item.unit ? ` ${item.unit}` : ""}
            </span>
          ) : (
            <Pencil className="size-3" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-2">
          <Label htmlFor={`qty-${item.id}`}>
            Quantity{item.unit ? ` (${item.unit})` : ""}
          </Label>
          <div className="flex gap-2">
            <Input
              id={`qty-${item.id}`}
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
            <Button size="sm" onClick={handleSave} disabled={updateQuantity.isPending}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
