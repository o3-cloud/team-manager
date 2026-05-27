import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', disabled, onClick, ...props }: ButtonProps) {
  const variantClass = `btn-${variant}`;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    onClick?.(e);
  }

  return (
    <button
      {...props}
      className={`btn ${variantClass} ${className}`}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
