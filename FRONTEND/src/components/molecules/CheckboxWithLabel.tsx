import React from 'react';

interface CheckboxWithLabelProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  name: string;
  disabled?: boolean;
}

export const CheckboxWithLabel: React.FC<CheckboxWithLabelProps> = ({
  label,
  checked,
  onChange,
  id,
  name,
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      aria-disabled={disabled}
      className={`
        inline-flex items-center gap-2  font-semibold text-gray-800 text-sm 
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      `}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="form-checkbox h-4 w-4 text-blue-600 disabled:cursor-not-allowed"
      />
      {label && <span>{label}</span>}
    </label>
  );
};
