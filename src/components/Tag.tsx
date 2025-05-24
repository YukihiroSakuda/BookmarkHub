import { X } from 'lucide-react';

interface TagProps {
  tag: string;
  onDelete?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function Tag({ tag, onDelete, onClick, isSelected }: TagProps) {
  return (
    <div
      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'bg-gradient-energy text-white shadow-[0_0_8px_rgba(255,255,255,0.2)]'
          : 'bg-dark/50 text-white/60 border border-energy-purple/20 hover:border-energy-purple/50 hover:text-white/90'
      }`}
      onClick={onClick}
    >
      {tag}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-1 hover:text-energy-pink transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
} 