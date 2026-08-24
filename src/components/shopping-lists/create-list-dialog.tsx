"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useItems } from "@/hooks/use-items";
import { useCreateShoppingList } from "@/hooks/use-shopping-lists";
import { extractErrorMessage } from "@/lib/api/client";

const createListSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
});

type CreateListForm = z.infer<typeof createListSchema>;

export function CreateListDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const { data: items } = useItems();
  const createList = useCreateShoppingList();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateListForm>({ resolver: zodResolver(createListSchema) });

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const onSubmit = async (values: CreateListForm) => {
    try {
      await createList.mutateAsync({ title: values.title, itemIds: selectedItemIds });
      toast.success("Shopping list created");
      reset();
      setSelectedItemIds([]);
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create list"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New shopping list</DialogTitle>
          <DialogDescription>Create a list and optionally pick starting items.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Weekend groceries" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Items (optional)</Label>
            {items?.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No catalog items yet — add some from &quot;Manage items&quot; first, or add items
                to this list afterward.
              </p>
            )}
            {items && items.length > 0 && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
                  >
                    <Checkbox
                      checked={selectedItemIds.includes(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <span>{item.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {item.category?.name}
                    </Badge>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createList.isPending}>
              {createList.isPending ? "Creating..." : "Create list"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
