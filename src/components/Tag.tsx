import { X } from "lucide-react";
import { memo, useCallback } from "react";

interface TagProps {
  tag: string;
  onDelete?: () => void;
  onClick?: (ctrlKey: boolean) => void;
  isSelected?: boolean;
}

const Tag = memo(function Tag({ tag, onDelete, onClick, isSelected }: TagProps) {
  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (onClick) {
      onClick(e.ctrlKey);
    }
  }, [onClick]);

  return (
    <div
      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
        onClick ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "bg-blue-500 text-white"
          : "bg-neutral-200 dark:bg-neutral-700"
      }`}
      onClick={handleClick}
    >
      {tag}
      {onDelete && (
        <button
          onClick={handleDeleteClick}
          className="ml-1"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
});

export { Tag };
