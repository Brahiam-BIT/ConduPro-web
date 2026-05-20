import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

export const PasswordField = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(function PasswordField(
  { className, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      autoComplete={rest.autoComplete ?? 'current-password'}
      iconLeft={<Lock className="h-4 w-4" aria-hidden />}
      iconRight={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md text-surface-500 transition-colors',
            'hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200',
          )}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      className={className}
      {...rest}
    />
  );
});
