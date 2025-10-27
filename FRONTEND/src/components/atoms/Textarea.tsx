import React from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'ghost';
};

const sizeMap = {
  sm: 'text-sm px-2 py-1',
  md: 'text-base px-3 py-2',
  lg: 'text-lg px-4 py-3',
};

const variantMap = {
  outlined: 'border border-gray-300 bg-white',
  filled: 'bg-gray-100 border border-transparent',
  ghost: 'bg-transparent border-b border-gray-300',
};

export const Textarea: React.FC<TextareaProps> = ({ size = 'md', variant = 'outlined', className, ...props }) => (
  <textarea
    className={`rounded-md focus:outline-none focus:ring-0 focus:border-blue-500 transition ${sizeMap[size]} ${variantMap[variant]} ${className ?? ''}`}
    {...props}
  />
);
