import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`card bg-base-100 shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}
