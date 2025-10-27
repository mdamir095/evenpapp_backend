import React from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'default' | 'secondary' | 'accent' | 'muted' | 'danger' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
};

const variantMap: Record<
  'primary' | 'default' | 'secondary' | 'accent' | 'muted' | 'danger' | 'disabled',
  string
> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  default: 'bg-white text-blue-600 hover:bg-gray-100 border border-blue-600',
  secondary: 'bg-blue-200 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  accent: 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white',
  muted: 'bg-white text-neutral-700 hover:bg-gray-100 border border-neutral-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
  disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
};

const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-sm px-3 py-2 gap-1',
  md: 'text-base px-4 py-3 gap-2',
  lg: 'text-lg px-6 py-4 gap-3',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'sm',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  children,
  ...props
}) => {
  const appliedVariant = disabled || loading ? 'disabled' : variant;

  const mergedClasses = twMerge(
    'inline-flex items-center justify-center rounded-md transition font-semibold focus:outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer',
    sizeMap[size],
    variantMap[appliedVariant],
    loading && 'cursor-wait',
    className
  );

  return (
    <button
      className={mergedClasses}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="inline-flex items-center gap-2">{icon}</span>}
          <span className="inline-flex items-center gap-2">{children}</span>
          {icon && iconPosition === 'right' && <span className="inline-flex items-center gap-2">{icon}</span>}
        </>
      )}
    </button>
  );
};

// 🌀 Simple Spinner Component
const Spinner: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const spinnerSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size];

  return (
    <svg
      className={`animate-spin ${spinnerSize} text-current`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
};
