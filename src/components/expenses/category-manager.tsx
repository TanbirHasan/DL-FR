"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Settings2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { extractErrorMessage } from "@/lib/api/client";

export function CategoryManager() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createCategory.mutateAsync({ name: trimmed });
      setName("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create category"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete category"));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="size-4" />
          Categories
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <p className="text-sm font-medium">Manage categories</p>
          <div className="flex gap-2">
            <Input
              placeholder="New category"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button size="icon" onClick={handleAdd} disabled={createCategory.isPending}>
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {isLoading && (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            )}
            {!isLoading && categories?.length === 0 && (
              <p className="py-2 text-center text-sm text-muted-foreground">No categories yet.</p>
            )}
            {categories?.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <span>{category.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
