import { SortOption, SortOrder } from '@/types/bookmark';
import { ArrowUpDown, Clock, TrendingUp, TypeOutline  } from 'lucide-react';
import { Button } from './Button';

interface SortControlsProps {
  currentSort: SortOption;
  currentOrder: SortOrder;
  onSortChange: (option: SortOption) => void;
  onOrderChange: (order: SortOrder) => void;
}

export function SortControls({
  currentSort,
  currentOrder,
  onSortChange,
  onOrderChange,
}: SortControlsProps) {
  const sortOptions = [
    { value: 'accessCount' as SortOption, label: 'Access Count', icon: TrendingUp },
    { value: 'title' as SortOption, label: 'Title', icon: TypeOutline  },
    { value: 'createdAt' as SortOption, label: 'Created Date', icon: Clock },
  ];

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 backdrop-blur-sm p-2 rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-sm">
      <span className="text-sm">Sort by:</span>
      <div className="flex items-center gap-1">
        {sortOptions.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            onClick={() => onSortChange(value)}
            variant={currentSort === value ? 'primary' : 'secondary'}
            size="sm"
            icon={Icon}
            className="text-sm"
          >
            {label}
          </Button>
        ))}
      </div>
      <Button
        onClick={() => onOrderChange(currentOrder === 'asc' ? 'desc' : 'asc')}
        variant="secondary"
        size="sm"
        icon={ArrowUpDown}
        className="text-sm"
      >
        {currentOrder === 'asc' ? 'Ascending' : 'Descending'}
      </Button>
    </div>
  );
} 