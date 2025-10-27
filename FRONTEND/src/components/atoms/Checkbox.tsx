import React from "react";

export type CheckboxProps  = {
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const Checkbox: React.FC<CheckboxProps> = ({
  isChecked,
  onChange,
  name,
  id,
  disabled,
  className = "",
  size = "md",
}) => {
  const sizeClass = sizeMap[size];

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        className="peer hidden"
      />

      <span
        className={`flex items-center justify-center border-2 border-neutral-800 bg-white rounded-sm peer-disabled:opacity-50 ${sizeClass}`}
      >
        <svg
            className="w-3 h-2 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.3657 0.234315C11.6781 0.546734 11.6781 1.05327 11.3657 1.36569L4.96571 7.76569C4.65329 8.0781 4.14676 8.0781 3.83434 7.76569L0.634339 4.56569C0.32192 4.25327 0.32192 3.74673 0.634339 3.43431C0.946758 3.1219 1.45329 3.1219 1.76571 3.43431L4.40002 6.06863L10.2343 0.234315C10.5468 -0.0781049 11.0533 -0.0781049 11.3657 0.234315Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </label>
  );
};

export default Checkbox;
