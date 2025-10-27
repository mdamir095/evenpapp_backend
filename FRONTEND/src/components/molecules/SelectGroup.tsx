import React, { useRef, useLayoutEffect, useState } from 'react';
import Select, { components } from 'react-select';
import { ChevronDown } from "lucide-react";

export type OptionType = { label: string; value: string };

export type SelectGroupProps = {
  label: string;
  options: OptionType[];
  value: OptionType[];
  onChange: (value: OptionType[]) => void;
  isMulti?: boolean;
  error?: string;
  className?: string;
  heightClass?: string;
};

export const SelectGroup: React.FC<SelectGroupProps> = ({
  label,
  options,
  value,
  onChange,
  isMulti = false,
  error,
  heightClass = "min-h-[36px]"
}) => {
  const controlRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  // Measure width after render
  useLayoutEffect(() => {
    if (controlRef.current) {
      setWidth(controlRef.current.offsetWidth);
    }
  }, []);

  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown
          className={`h-4 w-4 text-gray-800 transition-transform duration-200 ${
            props.selectProps.menuIsOpen ? "rotate-180" : ""
          }`}
        />
      </components.DropdownIndicator>
    );
  };

  return (
    <div className="w-auto" ref={controlRef}>
      <label className="block mb-2 font-semibold text-gray-800 text-sm">{label}</label>
      <Select
        options={options}
        value={value}
        onChange={(val) =>
          onChange(Array.isArray(val) ? val : val ? [val] : [])
        }
        isMulti={isMulti}
        components={{ DropdownIndicator }}
        menuPosition="fixed"
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          menu: (base) => ({
            ...base,
            width: width,
            minWidth: width,
          }),
          option: (base, state) => ({
            ...base,
            cursor: "pointer", // make options clickable
            color: state.isSelected ? "#ffffff" : "#1F2937", // white if selected, gray-800 otherwise
            backgroundColor: state.isSelected
              ? "#155dfc" // blue background when selected
              : state.isFocused
              ? "#F3F4F6" // light gray on hover
              : "white", // default
            fontSize: "13px",
          }),
          
          singleValue: (base) => ({
            ...base,
            color: "#1F2937", // ✅ selected value text color
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#1F2937", // ✅ multi-value pill text color
          }),
        }}
        classNames={{
          control: () =>
            `rounded-md border border-gray-300  shadow-none w-full bg-white px-2 text-sm focus:ring-0 focus:ring-offset-0 ${heightClass}`,
          placeholder: () => "text-neutral-700 p-0",
        }}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};
