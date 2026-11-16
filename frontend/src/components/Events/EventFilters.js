import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CATEGORIES, CATEGORY_KEYS } from '@/lib/categories';

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

const DATE_PRESETS = [
  { id: 'all', label: 'Any date' },
  { id: 'today', label: 'Today' },
  { id: 'weekend', label: 'This weekend' },
  { id: 'week', label: 'This week' },
];

const getDateRange = (preset) => {
  const today = new Date();
  if (preset === 'today') return { startDate: startOfDay(today).toISOString(), endDate: endOfDay(today).toISOString() };
  if (preset === 'weekend') {
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    return { startDate: startOfDay(saturday).toISOString(), endDate: endOfDay(sunday).toISOString() };
  }
  if (preset === 'week') {
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return { startDate: startOfDay(today).toISOString(), endDate: endOfDay(end).toISOString() };
  }
  return { startDate: '', endDate: '' };
};

const PRICE_OPTIONS = [
  { id: 'all', label: 'Any price' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
];

const Chip = ({ active, children, ...props }) => (
  <button
    type="button"
    aria-pressed={active}
    className={cn(
      'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active
        ? 'border-primary bg-primary text-primary-foreground shadow-glow'
        : 'bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
    )}
    {...props}
  >
    {children}
  </button>
);

const EventFilters = ({ filters, onFilterChange, price = 'all', onPriceChange = () => {}, className }) => {
  const [datePreset, setDatePreset] = useState(filters.startDate || filters.endDate ? 'custom' : 'all');

  const handleDate = (id) => {
    setDatePreset(id);
    onFilterChange(getDateRange(id));
  };

  const reset = () => {
    setDatePreset('all');
    onPriceChange('all');
    onFilterChange({ category: '', startDate: '', endDate: '', sort: '-createdAt', page: 1 });
  };

  return (
    <div className={cn('space-y-7', className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <SlidersHorizontal className="h-5 w-5 text-primary" /> Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw /> Reset
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.category} onClick={() => onFilterChange({ category: '' })}>All</Chip>
          {CATEGORY_KEYS.map((key) => (
            <Chip key={key} active={filters.category === key} onClick={() => onFilterChange({ category: key })}>
              {CATEGORIES[key].label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Date</Label>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((p) => (
            <Chip key={p.id} active={datePreset === p.id} onClick={() => handleDate(p.id)}>{p.label}</Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Price</Label>
        <div className="flex flex-wrap gap-2">
          {PRICE_OPTIONS.map((p) => (
            <Chip key={p.id} active={price === p.id} onClick={() => onPriceChange(p.id)}>{p.label}</Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="sort">Sort by</Label>
        <Select value={filters.sort} onValueChange={(v) => onFilterChange({ sort: v })}>
          <SelectTrigger id="sort"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Newest first</SelectItem>
            <SelectItem value="createdAt">Oldest first</SelectItem>
            <SelectItem value="startDate">Date (soonest)</SelectItem>
            <SelectItem value="-startDate">Date (latest)</SelectItem>
            <SelectItem value="-rating.average">Highest rated</SelectItem>
            <SelectItem value="price">Price (low to high)</SelectItem>
            <SelectItem value="-price">Price (high to low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EventFilters;
