"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MonthPicker({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) {
  const goToPrevious = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const goToNext = () => {
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPrevious} aria-label="Previous month">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="w-36 text-center text-sm font-medium">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <Button variant="outline" size="icon" onClick={goToNext} aria-label="Next month">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
