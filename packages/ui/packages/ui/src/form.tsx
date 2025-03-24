import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from './lib/utils';

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

export { FormLabel };
