import { X } from "lucide-react";

interface TagProps {
  tag: string;
  onDelete?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function Tag({ tag, onDelete, onClick, isSelected }: TagProps) {
  return (
    <div
      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
        onClick ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "bg-blue-500 text-white"
          : "bg-neutral-200 dark:bg-neutral-700"
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
          className="ml-1"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
