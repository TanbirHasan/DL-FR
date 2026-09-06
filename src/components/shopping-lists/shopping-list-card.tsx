"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckoffControl } from "./checkoff-control";
import { CompleteListDialog } from "./complete-list-dialog";
import { ItemCombobox } from "./item-combobox";
import { PriceControl } from "./price-control";
import { QuantityControl } from "./quantity-control";
import { useItems } from "@/hooks/use-items";
import { useAddShoppingListItem, useDeleteShoppingList, useDeleteShoppingListItem } from "@/hooks/use-shopping-lists";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatCurrency } from "@/lib/utils";
import type { ShoppingList } from "@/lib/types";

export function ShoppingListCard({ list }: { list: ShoppingList }) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const { data: catalogItems } = useItems();
  const addItem = useAddShoppingListItem();
  const deleteItem = useDeleteShoppingListItem();
  const deleteList = useDeleteShoppingList();

  const checkedCount = list.items.filter((item) => item.isChecked).length;
  const spent = list.items
    .filter((item) => item.isChecked && item.price)
    .reduce((sum, item) => sum + Number(item.price), 0);
  const progress = list.items.length > 0 ? (checkedCount / list.items.length) * 100 : 0;

  // Hide a catalog item only while it has an unchecked line on this list. Once it
  // has been bought (checked off), it becomes available again so the same item
  // can be purchased on a later trip without disturbing the earlier expense.
  const pendingItemIds = new Set(
    list.items.filter((li) => !li.isChecked).map((li) => li.itemId)
  );
  const availableItems = catalogItems?.filter(
    (catalogItem) => !pendingItemIds.has(catalogItem.id)
  );

  const selectedCatalogItem = catalogItems?.find((i) => i.id === selectedItemId);

  const parsedQty = newItemQuantity ? parseFloat(newItemQuantity) : NaN;
  const derivedPrice =
    selectedCatalogItem?.price && !Number.isNaN(parsedQty) && parsedQty > 0
      ? Math.round(Number(selectedCatalogItem.price) * parsedQty * 100) / 100
      : null;

  const handleAddItem = async () => {
    if (!selectedItemId) return;
    const quantity = newItemQuantity ? parseFloat(newItemQuantity) : undefined;
    const price = newItemPrice ? parseFloat(newItemPrice) : undefined;
    try {
      await addItem.mutateAsync({
        listId: list.id,
        payload: { itemId: selectedItemId, quantity, price },
      });
      setSelectedItemId("");
      setNewItemQuantity("");
      setNewItemPrice("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not add item"));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync(itemId);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not remove item"));
    }
  };

  const handleDeleteList = async () => {
    try {
      await deleteList.mutateAsync(list.id);
      toast.success("Shopping list deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete list"));
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-lg font-bold">{list.title}</CardTitle>
          <p className="text-xs font-medium text-muted-foreground">
            {checkedCount}/{list.items.length} bought
            {spent > 0 && ` - ${formatCurrency(spent)} spent`}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{list.title}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the list and all its items. Any expenses already logged from it
                will be kept. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteList}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="space-y-1.5">
          {list.items.length === 0 && (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          )}
          {list.items.map((item) => (
            <div key={item.id} className="group flex items-center gap-2 rounded-lg bg-muted/45 px-2 py-1.5">
              <CheckoffControl item={item} />
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.isChecked && "text-muted-foreground line-through"
                )}
              >
                {item.name}
              </span>
              <QuantityControl item={item} />
              <PriceControl item={item} />
              <Button
                variant="ghost"
                size="icon"
                className="size-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteItem(item.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <ItemCombobox
            items={availableItems ?? []}
            value={selectedItemId}
            onSelect={setSelectedItemId}
          />
          {selectedItemId && (
            <>
              <Input
                type="number"
                step="0.01"
                placeholder={selectedCatalogItem?.unit ? `Qty (${selectedCatalogItem.unit})` : "Qty"}
                className="h-8 w-20"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                placeholder={derivedPrice != null ? `= ${formatCurrency(derivedPrice)}` : "Price"}
                className="h-8 w-24"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
            </>
          )}
          <Button size="icon" className="size-8 shrink-0" onClick={handleAddItem} disabled={!selectedItemId}>
            <Plus className="size-4" />
          </Button>
        </div>
        <CompleteListDialog list={list} />
      </CardContent>
    </Card>
  );
}
