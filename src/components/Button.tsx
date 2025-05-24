import { LucideIcon } from 'lucide-react';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
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
  const baseStyles = 'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-300';
  
  const variantStyles = {
    primary: 'bg-gradient-energy text-white hover:shadow-neon-green',
    secondary: 'bg-dark/50 text-white/90 border border-energy-purple/30 hover:bg-dark/70 hover:text-energy-green hover:border-energy-purple/50 transition-colors',
    ghost: 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white transition-colors',
  };

  const activeStyles = 'text-energy-green shadow-[0_0_8px_rgba(168,85,247,0.6)]';

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