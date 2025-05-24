import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 rounded-xl border border-energy-purple/30 bg-dark/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-energy-green/50 focus:border-transparent ${
          error ? 'border-energy-pink' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-energy-pink">{error}</p>
      )}
    </div>
  );
} 