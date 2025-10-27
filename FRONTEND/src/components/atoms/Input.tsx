import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

// export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
//   size?: 'sm' | 'md' | 'lg';
//   variant?: 'outlined' | 'filled' | 'ghost';
//   error?: string | boolean;
// };

const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-sm px-2 py-1 text-gray-700',
  md: 'text-base px-3 py-2 text-gray-700',
  lg: 'text-lg px-4 py-3 text-gray-700',
};

const variantMap: Record<'outlined' | 'filled' | 'ghost', string> = {
  outlined: 'border border-gray-300 bg-white',
  filled: 'bg-gray-100 border border-transparent',
  ghost: 'bg-transparent border-b border-gray-300',
};

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> & {
  size?: keyof typeof sizeMap;
  variant?: keyof typeof variantMap;
  error?: string | boolean;
};


export const Input: React.FC<InputProps> = ({
  size = 'md',
  variant = 'outlined',
  className = '',
  disabled = false,
  error,
  type = 'text',
  ...props
}) => {
  const isError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : null;
  
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <>
      <input
        {...props}
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        disabled={disabled}
        aria-invalid={isError}
        className={`light:disabled:bg-gray-800/20 rounded-md w-full transition focus:outline-none focus:ring-0 focus:border-blue-500 text-sm
          ${sizeMap[size]} 
          ${variantMap[variant]} 
          ${isError ? 'border-red-500 focus:border-red-500' : 'focus:ring-blue-500'} 
          ${isPassword ? 'pr-10' : ''} 
          ${className}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-[42px] -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}

      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </>
  );
};

export default Input;