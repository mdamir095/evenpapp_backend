import React from 'react';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'ghost';
  error?: string | boolean; // Add error to props
};

const sizeMap = {
  sm: 'text-sm px-2 py-1',
  md: 'text-base px-3 py-2',
  lg: 'text-lg px-4 py-3',
};

const variantMap = {
  outlined: 'border border-neutral-600 bg-white',
  filled: 'bg-gray-100 border border-transparent',
  ghost: 'bg-transparent border-b border-gray-300',
};

export const Select: React.FC<SelectProps> = ({
  size = 'md',
  variant = 'outlined',
  className = '',
  error,
  children,
  ...props
}) => {
  const isError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : null;

  return (
    <>
      <select
        className={`rounded-md focus:outline-none transition text-neutral-700 focus:ring-0 focus:border-blue-500
          ${sizeMap[size]} 
          ${variantMap[variant]} 
          ${isError ? 'border-red-500 focus:ring-0 focus:border-red-500 focus:ring-red-500' : 'focus:ring-0 focus:ring-blue-500'} 
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </>
  );
};
