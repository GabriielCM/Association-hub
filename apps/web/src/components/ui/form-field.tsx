import * as React from 'react';

import { cn } from '@/lib/utils/cn';
import { Label } from './label';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  helperText,
  required,
  className,
  children,
}: FormFieldProps) {
  const id = React.useId();

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </Label>
      )}
      <div id={id}>{children}</div>
      {(error || helperText) && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-error-dark' : 'text-muted-foreground'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
