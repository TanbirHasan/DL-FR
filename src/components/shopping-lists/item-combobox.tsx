"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useUpdateItem } from "@/hooks/use-items";
import { extractErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Item } from "@/lib/types";

export function ItemCombobox({
  items,
  value,
  onSelect,
}: {
  items: Item[];
  value: string;
  onSelect: (itemId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const updateItem = useUpdateItem();

  const selected = items.find((i) => i.id === value);

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditUnit(item.unit ?? "");
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      toast.error("Name can't be empty");
      return;
    }
    try {
      await updateItem.mutateAsync({
        id: editingId as string,
        payload: { name: editName.trim(), unit: editUnit || null },
      });
      toast.success("Item updated");
      setEditingId(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update item"));
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setEditingId(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 flex-1 justify-between font-normal"
        >
          <span className="truncate text-left">
            {selected ? `${selected.name}${selected.unit ? ` (${selected.unit})` : ""}` : "Add an item"}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.name} ${item.unit ?? ""} ${item.category?.name ?? ""}`}
                  onSelect={() => {
                    if (editingId === item.id) return;
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  className={cn("flex items-center gap-1.5", editingId === item.id && "flex-col items-stretch")}
                >
                  {editingId === item.id ? (
                    <div
                      className="flex w-full items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 flex-1"
                        placeholder="Name"
                        autoFocus
                      />
                      <Input
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="h-7 w-16"
                        placeholder="Unit"
                      />
                      <Button
                        type="button"
                        size="icon"
                        className="size-7 shrink-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={saveEdit}
                        disabled={updateItem.isPending}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7 shrink-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setEditingId(null)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">
                        {item.name}
                        {item.unit ? ` (${item.unit})` : ""}
                      </span>
                      {item.category && (
                        <Badge variant="secondary" className="shrink-0">
                          {item.category.name}
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(item);
                        }}
                      >
                        <Pencil className="size-3" />
                      </Button>
                    </>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
