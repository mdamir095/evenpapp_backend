import React from 'react';
import {
  useForm,
  FormProvider,
  useFormContext,
  type SubmitHandler,
  type UseFormProps,
  type FieldValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

export type FormProps<T extends FieldValues> = {
  children: React.ReactNode;
  onSubmit: SubmitHandler<T>;
  schema: ZodType<T, any, any>;
  defaultValues?: UseFormProps<T>['defaultValues'];
  className?: string;
  mode?: UseFormProps<T>['mode'];
};

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  schema,
  defaultValues,
  className,
  mode = 'onSubmit',
}: FormProps<T>) {
  let methods: ReturnType<typeof useForm<T>> | null = null;

  // Try to get the context if it exists
  try {
    methods = useFormContext<T>();
  } catch {
    // useFormContext throws in strict mode, so fall back to null
    methods = null;
  }

  const isInsideProvider = methods && typeof methods.handleSubmit === 'function';

  if (!isInsideProvider) {
    methods = useForm<T>({
      resolver: zodResolver(schema),
      defaultValues,
      mode,
    });

    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
          {children}
        </form>
      </FormProvider>
    );
  }

  // Already inside a FormProvider
  return (
    <form onSubmit={methods?.handleSubmit(onSubmit)} className={className}>
      {children}
    </form>
  );
}
