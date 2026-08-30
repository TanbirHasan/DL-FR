"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCheckShoppingListItem, useUncheckShoppingListItem } from "@/hooks/use-shopping-lists";
import { extractErrorMessage } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils";
import type { ShoppingListItem } from "@/lib/types";

export function CheckoffControl({ item }: { item: ShoppingListItem }) {
  const [priceOpen, setPriceOpen] = useState(false);
  const [confirmUncheckOpen, setConfirmUncheckOpen] = useState(false);
  const [price, setPrice] = useState("");
  const checkItem = useCheckShoppingListItem();
  const uncheckItem = useUncheckShoppingListItem();

  // A price was already set (at add-time or edited later) — check it off
  // directly, no need to ask again.
  const handleCheckDirectly = async () => {
    try {
      await checkItem.mutateAsync({ itemId: item.id });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not check off item"));
    }
  };

  const handleConfirmCheck = async () => {
    const value = parseFloat(price);
    if (!value || value <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      await checkItem.mutateAsync({ itemId: item.id, price: value });
      setPriceOpen(false);
      setPrice("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not check off item"));
    }
  };

  const handleConfirmUncheck = async () => {
    try {
      await uncheckItem.mutateAsync(item.id);
      toast.success("Item unchecked, expense removed");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not uncheck item"));
    }
  };

  if (item.isChecked) {
    return (
      <>
        <Checkbox checked onCheckedChange={() => setConfirmUncheckOpen(true)} />
        <AlertDialog open={confirmUncheckOpen} onOpenChange={setConfirmUncheckOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Uncheck &quot;{item.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the {item.price ? formatCurrency(item.price) : ""} expense entry
                created for it. The price stays saved, so re-checking it won&apos;t ask again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmUncheck}>Uncheck</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // A price is already saved on this item — check it off with one click.
  if (item.price) {
    return <Checkbox checked={false} onCheckedChange={handleCheckDirectly} />;
  }

  // No price saved yet — ask for one before checking it off.
  return (
    <Popover open={priceOpen} onOpenChange={setPriceOpen}>
      <PopoverTrigger asChild>
        <Checkbox checked={false} onCheckedChange={() => setPriceOpen(true)} />
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <div className="space-y-3">
          <Label htmlFor={`price-${item.id}`}>How much did you pay?</Label>
          <div className="flex gap-2">
            <Input
              id={`price-${item.id}`}
              type="number"
              step="0.01"
              autoFocus
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmCheck();
                }
              }}
            />
            <Button size="sm" onClick={handleConfirmCheck} disabled={checkItem.isPending}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
