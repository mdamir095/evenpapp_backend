import React, { useState } from 'react';

// Tailwind size maps
// const sizeOptions = ['sm', 'md', 'lg'] as const;
// const widthMap = {
//   sm: 'w-32',
//   md: 'w-48',
//   lg: 'w-64',
// };

// const heightMap = {
//   sm: 'h-32',
//   md: 'h-48',
//   lg: 'h-64',
// };
// src/components/SizeControlledBox.tsx


const sizeOptions = ['sm', 'md', 'lg'] as const;

const widthMap = {
  sm: 'w-32',
  md: 'w-48',
  lg: 'w-64',
};

const heightMap = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64',
};

const SizeControlledBox = () => {
  const [widthSize, setWidthSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [heightSize, setHeightSize] = useState<'sm' | 'md' | 'lg'>('md');

  return (
    <div className="p-6 space-y-6 max-w-lg mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block mb-2 font-semibold text-gray-800 text-sm ">Width</label>
          <select
            value={widthSize}
            onChange={(e) => setWidthSize(e.target.value as 'sm' | 'md' | 'lg')}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
           <label className="block mb-2 font-semibold text-gray-800 text-sm ">Height</label>
          <select
            value={heightSize}
            onChange={(e) => setHeightSize(e.target.value as 'sm' | 'md' | 'lg')}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`bg-indigo-500 rounded shadow-md ${widthMap[widthSize]} ${heightMap[heightSize]}`}
      ></div>
    </div>
  );
};

export default SizeControlledBox;
