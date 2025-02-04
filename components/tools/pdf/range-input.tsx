"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface RangeInputProps {
  index: number;
  range: { start: number | null; end: number | null };
  maxPages: number;
  onUpdate: (index: number, field: 'start' | 'end', value: number | null) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export default function RangeInput({
  index,
  range,
  maxPages,
  onUpdate,
  onRemove,
  showRemove,
}: RangeInputProps) {
  const handleInputChange = (field: 'start' | 'end', value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    onUpdate(index, field, numValue);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 grid grid-cols-[auto,1fr,auto,1fr] gap-2 items-center">
        <span className="text-sm text-muted-foreground">from page</span>
        <Input
          type="number"
          value={range.start !== null ? range.start : ''}
          onChange={(e) => handleInputChange('start', e.target.value)}
          className="w-20"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="number"
          value={range.end !== null ? range.end : ''}
          onChange={(e) => handleInputChange('end', e.target.value)}
          className="w-20"
        />
      </div>
      {showRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}