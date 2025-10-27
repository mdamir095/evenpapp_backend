import React, { useState, useRef, useLayoutEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type Option = {
  label: string;
  value: string;
};

export type DropDownProps = {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'ghost';
  error?: string | boolean;
  className?: string;
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

export const DropDown: React.FC<DropDownProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'outlined',
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : null;

  const selectedLabel = options.find((opt) => opt.value === value)?.label || 'Select';

  // Measure button position when dropdown opens
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  return (
    <div className={`relative inline-block min-w-[240px] headerDropdown max-w-60 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full cursor-pointer text-left rounded-lg transition appearance-none text-neutral-700 text-sm focus:border-blue-500 ${sizeMap[size]} ${variantMap[variant]} ${
          isError
            ? 'border-red-500 focus:ring-0 focus:ring-red-500'
            : 'focus:ring-0 focus:ring-red-500'
        }`}
      >
        <p className="truncate block w-60">{selectedLabel}</p>
        <span className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none text-gray-500">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {isOpen && (
        <ul
          className="fixed z-50 bg-white text-sm border border-gray-300 rounded-md shadow-lg max-h-65 overflow-auto ring-opacity-5"
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
          }}
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 hover:bg-blue-100 truncate text-gray-800 ${
                option.value === value ? 'bg-blue-100 text-blue-600' : ''
              }`}
            >
              <span className="truncate block w-full">{option.label}</span>
            </li>
          ))}
        </ul>
      )}

      {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
};
