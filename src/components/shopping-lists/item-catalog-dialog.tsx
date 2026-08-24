"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Package, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { useCreateItem, useDeleteItem, useItems } from "@/hooks/use-items";
import { extractErrorMessage } from "@/lib/api/client";

export function ItemCatalogDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  const { data: categories } = useCategories();
  const { data: items, isLoading } = useItems();
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed || !categoryId) return;
    try {
      await createItem.mutateAsync({ name: trimmed, categoryId });
      setName("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create item"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete item"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Item catalog</DialogTitle>
          <DialogDescription>
            Assign items to a category once, then reuse them on any shopping list.
          </DialogDescription>
        </DialogHeader>

        {categories?.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Create a category first from the Expenses page, then come back to add items.
          </p>
        ) : (
          <div className="flex gap-2">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="New item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button size="icon" onClick={handleAdd} disabled={createItem.isPending || !categoryId}>
              <Plus className="size-4" />
            </Button>
          </div>
        )}

        <div className="max-h-72 space-y-1 overflow-y-auto">
          {isLoading && (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          )}
          {!isLoading && items?.length === 0 && (
            <p className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
              <Package className="size-6" />
              No items in your catalog yet.
            </p>
          )}
          {items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <span>{item.name}</span>
                <Badge variant="secondary">{item.category?.name}</Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
