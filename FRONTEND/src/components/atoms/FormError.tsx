import React from 'react';

export type FormErrorProps = {
  message?: string;
  className?: string;
};

export const FormError: React.FC<FormErrorProps> = ({ message, className }) => (
  message ? <div className={`text-sm text-red-600 mt-1 ${className ?? ''}`}>{message}</div> : null
);
