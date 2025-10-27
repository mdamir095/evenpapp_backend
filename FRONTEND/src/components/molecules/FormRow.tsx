import React from 'react';

export type FormRowProps = {
  children: React.ReactNode;
  className?: string;
};

export const FormRow: React.FC<FormRowProps> = ({ children, className }) => (
  <div className={`flex flex-col sm:flex-row gap-4 mb-4 ${className ?? ''}`}>{children}</div>
);
