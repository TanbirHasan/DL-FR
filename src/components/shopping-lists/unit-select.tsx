"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESET_UNITS = ["kg", "g", "liter", "ml", "pcs", "dozen", "pack", "box", "bottle"];
const OTHER = "__other__";
const NONE = "__none__";

export function UnitSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (unit: string) => void;
}) {
  const isPreset = PRESET_UNITS.includes(value);
  const mode = value ? (isPreset ? value : OTHER) : NONE;

  const handleModeChange = (next: string) => {
    if (next === NONE) onChange("");
    else if (next === OTHER) onChange("");
    else onChange(next);
  };

  const handleCustomChange = (text: string) => {
    onChange(text);
  };

  return (
    <div className="space-y-2">
      <Select value={mode} onValueChange={handleModeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="No unit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>No unit</SelectItem>
          {PRESET_UNITS.map((unit) => (
            <SelectItem key={unit} value={unit}>
              {unit}
            </SelectItem>
          ))}
          <SelectItem value={OTHER}>Other...</SelectItem>
        </SelectContent>
      </Select>
      {mode === OTHER && (
        <Input
          placeholder="e.g. bunch, sack"
          value={value}
          onChange={(e) => handleCustomChange(e.target.value)}
        />
      )}
    </div>
  );
}
