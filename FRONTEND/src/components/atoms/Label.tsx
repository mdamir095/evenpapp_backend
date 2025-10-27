import React from 'react';
export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label: React.FC<LabelProps> = ({ children, required, ...props }) => (
  <label className="block mb-2 font-semibold text-gray-800 text-sm " {...props}>
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);
