import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
          error ? 'border-blue-400' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm">{error}</p>
      )}
    </div>
  );
} 