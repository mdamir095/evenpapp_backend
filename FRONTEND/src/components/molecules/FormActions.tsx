import React from 'react';

export type FormActionsProps = {
  children: React.ReactNode;
  className?: string;
};

export const FormActions: React.FC<FormActionsProps> = ({ children, className }) => (
  <div className={`flex gap-4 justify-end mt-6 ${className ?? ''}`}>{children}</div>
);
