import { LucideIcon } from 'lucide-react';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'ghost' ;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
  isActive?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  type = 'button',
  disabled = false,
  isActive = false,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-1.5 font-medium';
  
  const variantStyles = {
    primary: 'bg-black hover:bg-neutral-700 dark:bg-white dark:hover:bg-neutral-300 text-white dark:text-black',
    secondary: 'border-2 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900',
    ghost: 'hover:text-neutral-700 dark:hover:text-neutral-300',
  };

  const activeStyles = 'text-blue-500';

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs rounded-lg',
    md: 'px-3 py-1.5 text-sm rounded-xl',
    lg: 'px-4 py-2 text-base rounded-xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${isActive ? activeStyles : variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />}
      {children}
    </button>
  );
} 