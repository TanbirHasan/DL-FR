"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useItems } from "@/hooks/use-items";
import { useAddShoppingListItem, useDeleteShoppingList, useDeleteShoppingListItem } from "@/hooks/use-shopping-lists";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatCurrency } from "@/lib/utils";
import type { ShoppingList } from "@/lib/types";

export function ShoppingListCard({ list }: { list: ShoppingList }) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const { data: catalogItems } = useItems();
  const addItem = useAddShoppingListItem();
  const deleteItem = useDeleteShoppingListItem();
  const deleteList = useDeleteShoppingList();

  const checkedCount = list.items.filter((item) => item.isChecked).length;
  const spent = list.items
    .filter((item) => item.isChecked && item.price)
    .reduce((sum, item) => sum + Number(item.price), 0);

  const availableItems = catalogItems?.filter(
    (catalogItem) => !list.items.some((li) => li.itemId === catalogItem.id)
  );

  const handleAddItem = async () => {
    if (!selectedItemId) return;
    try {
      await addItem.mutateAsync({ listId: list.id, itemId: selectedItemId });
      setSelectedItemId("");
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
          <CardTitle className="text-base">{list.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {checkedCount}/{list.items.length} bought
            {spent > 0 && ` · ${formatCurrency(spent)} spent`}
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
        <div className="space-y-1.5">
          {list.items.length === 0 && (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          )}
          {list.items.map((item) => (
            <div key={item.id} className="group flex items-center gap-2">
              <CheckoffControl item={item} />
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.isChecked && "text-muted-foreground line-through"
                )}
              >
                {item.name}
              </span>
              {item.isChecked && item.price && (
                <span className="text-xs text-muted-foreground">{formatCurrency(item.price)}</span>
              )}
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
          <Select value={selectedItemId} onValueChange={setSelectedItemId}>
            <SelectTrigger className="h-8 flex-1">
              <SelectValue placeholder="Add an item" />
            </SelectTrigger>
            <SelectContent>
              {availableItems?.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No more catalog items to add
                </div>
              )}
              {availableItems?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" className="size-8 shrink-0" onClick={handleAddItem} disabled={!selectedItemId}>
            <Plus className="size-4" />
          </Button>
        </div>
        <CompleteListDialog list={list} />
      </CardContent>
    </Card>
  );
}
