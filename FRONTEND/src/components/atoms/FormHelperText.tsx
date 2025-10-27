import React from 'react';

export type FormHelperTextProps = {
  children?: React.ReactNode;
  className?: string;
};

export const FormHelperText: React.FC<FormHelperTextProps> = ({ children, className }) => (
  children ? <div className={`text-xs text-gray-500 mt-1 ${className ?? ''}`}>{children}</div> : null
);
