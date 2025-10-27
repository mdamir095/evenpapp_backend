import React, { useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  onFocus,
  onBlur,
}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
    tabIndex={0}
    className={`flex items-center max-w-80 min-w-70 border border-gray-300 bg-white rounded-md px-3 py-2 transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    onFocus={onFocus}
    onBlur={onBlur}
  >
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="border-0 px-0 py-0 w-full outline-none bg-transparent placeholder-gray-500 text-gray-900 text-sm"
    />
     <Search
      className="size-4 text-gray-600 hover:text-blue-500 cursor-pointer transition-colors duration-200"
      onClick={focusInput}
    />
  </div>
  
  );
}
