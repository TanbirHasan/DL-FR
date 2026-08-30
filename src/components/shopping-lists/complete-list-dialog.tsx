"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompleteShoppingList } from "@/hooks/use-shopping-lists";
import { extractErrorMessage } from "@/lib/api/client";
import type { ShoppingList } from "@/lib/types";

export function CompleteListDialog({ list }: { list: ShoppingList }) {
  const [open, setOpen] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const completeList = useCompleteShoppingList();

  const uncheckedItems = list.items.filter((item) => !item.isChecked);

  const openDialog = (next: boolean) => {
    setOpen(next);
    if (next) {
      // Pre-fill with any price already saved on the item, so items added
      // with a price don't need to be re-typed here.
      setPrices(
        Object.fromEntries(uncheckedItems.map((item) => [item.id, item.price ?? ""]))
      );
    }
  };

  const handleSubmit = async () => {
    const entries = Object.entries(prices)
      .map(([itemId, value]) => ({ itemId, price: parseFloat(value) }))
      .filter((entry) => entry.price > 0);

    if (entries.length === 0) {
      toast.error("Enter a price for at least one item");
      return;
    }

    try {
      await completeList.mutateAsync({ listId: list.id, payload: { items: entries } });
      toast.success(`Logged ${entries.length} expense${entries.length > 1 ? "s" : ""}`);
      setPrices({});
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not complete list"));
    }
  };

  if (uncheckedItems.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckCheck className="size-4" />
          Complete list
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete &quot;{list.title}&quot;</DialogTitle>
          <DialogDescription>
            Enter what you paid for each item you bought. Leave blank to skip an item.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {uncheckedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <Label htmlFor={`complete-${item.id}`} className="flex-1 font-normal">
                {item.name}
              </Label>
              <Input
                id={`complete-${item.id}`}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-28"
                value={prices[item.id] ?? ""}
                onChange={(e) => setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={completeList.isPending}>
            {completeList.isPending ? "Saving..." : "Log expenses"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
