import { Loader2 } from "lucide-react";

interface SavingOrderOverlayProps {
  isVisible: boolean;
}

export function SavingOrderOverlay({ isVisible }: SavingOrderOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-2xl max-w-md mx-4 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
            <div className="absolute inset-0 rounded-full blur-md opacity-30 bg-black dark:bg-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              Saving YourOrder
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Please wait while we save your custom bookmark order...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
