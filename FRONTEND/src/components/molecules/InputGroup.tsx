import React from 'react';
import { Label } from '../atoms/Label';
import { Input, type InputProps } from '../atoms/Input';
import { FormError } from '../atoms/FormError';
import { FormHelperText } from '../atoms/FormHelperText';
import { useFormContext } from 'react-hook-form';

export type InputGroupProps = InputProps & {
  label?: string;
  helperText?: string;
  name: string; // required for form registration
  errors?: any
  register?: any;
  validation?: any;
  required?:any
};

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  helperText,
  error,
  id,
  name,
  required,
  ...props
}) => {
  // Safe form context - handle cases where component is used outside FormProvider
  let register: any = null;
  try {
    const formContext = useFormContext();
    register = formContext?.register;
  } catch (error) {
    // Component is being used outside FormProvider, use as regular input
    register = null;
  }


  return (
    <div className="relative">
      {label && <Label htmlFor={id ?? name}>{label}</Label>}
      <Input
        id={id ?? name}
        error={error} // ✅ Pass error as prop
        {...(register ? register(name) : { name })}
        {...props}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </div>
  );
};