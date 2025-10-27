import { ListCollapse } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ToggleButtonProps {
  isOn: boolean;
  onToggle: () => void;
}

export default function ToggleButton({ isOn, onToggle }: ToggleButtonProps) {
  return (
   <button className="bg-white border border-gray-300 px-4 py-2 rounded hover:bg-inherit hover:border-inherit"
      onClick={onToggle}
    //   className={`flex bg-white items-center bg-white border border-gray-300 px-4 py-2 rounded hover:bg-white  focus:ring-gray-300 hover:border-gray-300 rounded-none  hover:bg-white transition-colors duration-300 ${
    //     isOn ? 'bg-vendor' : 'bg-gray-300'
    //   }`}
    >
      <ListCollapse className="w-5 h-5 text-gray-500" />
    </button>
  );
}
import React from 'react';