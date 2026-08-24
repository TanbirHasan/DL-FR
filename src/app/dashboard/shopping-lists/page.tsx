"use client";

import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateListDialog } from "@/components/shopping-lists/create-list-dialog";
import { ItemCatalogDialog } from "@/components/shopping-lists/item-catalog-dialog";
import { ShoppingListCard } from "@/components/shopping-lists/shopping-list-card";
import { useShoppingLists } from "@/hooks/use-shopping-lists";

export default function ShoppingListsPage() {
  const { data: lists, isLoading } = useShoppingLists();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Shopping Lists</h1>
          <p className="text-muted-foreground">Keep track of what you need to buy.</p>
        </div>
        <div className="flex items-center gap-2">
          <ItemCatalogDialog
            trigger={
              <Button variant="outline" size="sm">
                <Package className="size-4" />
                Manage items
              </Button>
            }
          />
          <CreateListDialog
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                New list
              </Button>
            }
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {!isLoading && lists?.length === 0 && (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          No shopping lists yet. Create one to get started.
        </div>
      )}

      {!isLoading && lists && lists.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ShoppingListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}
