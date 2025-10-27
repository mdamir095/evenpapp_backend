import React from 'react';

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Radio: React.FC<RadioProps> = ({ size = 'md', className, ...props }) => (
  <input
    type="radio"
    className={`rounded-full border border-gray-300 focus:ring-0 focus:ring-blue-300 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${sizeMap[size]} ${className ?? ''}`}
    {...props}
  />
);
