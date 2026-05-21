import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export interface FloatingFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: string;
  errorMessage?: string;
  /** Compat: la versión Apple ignora íconos dentro del input (minimalismo). */
  iconLeft?: ReactNode;
  /** Aplica una sacudida horizontal cuando hay error y se intenta enviar. */
  shake?: boolean;
  /** Texto opcional debajo del label (hint). */
  hint?: string;
}

/**
 * FloatingField — input estilo Apple (no flotante).
 *
 *  - Label encima del input (`text-sm font-medium text-text-primary mb-1`).
 *  - Input `bg-bg-secondary border border-border rounded-xl px-4 py-3`.
 *  - Focus: `border-accent ring-0` (sin glow saturado).
 *  - Error: borde `error-500` y mensaje pequeño debajo.
 *  - Sin íconos dentro del input (`iconLeft` se ignora visualmente para
 *    mantener compatibilidad con call sites que aún lo pasan).
 *
 * El nombre `FloatingField` se conserva por compatibilidad con call sites
 * existentes (`Login`, `Register`).
 */
export const FloatingField = forwardRef<HTMLInputElement, FloatingFieldProps>(
  function FloatingField(
    // `iconLeft` se acepta para compat pero se ignora visualmente (estilo Apple sin íconos dentro).
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { label, errorMessage, shake = false, hint, id, className, iconLeft, ...inputProps },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const hasError = Boolean(errorMessage);

    return (
      <motion.div
        animate={shake ? { x: [0, -6, 6, -4, 4, -2, 0] } : { x: 0 }}
        transition={{ duration: shake ? 0.4 : 0.2, ease: [0.36, 1, 0.4, 1] }}
        className="space-y-1.5"
      >
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
        {hint ? <p className="text-xs text-text-secondary">{hint}</p> : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          {...inputProps}
          className={[
            'block w-full appearance-none rounded-xl border bg-bg-secondary px-4 py-3 text-base text-text-primary',
            'placeholder:text-text-tertiary outline-none transition-colors duration-150',
            hasError
              ? 'border-error-500 focus:border-error-500'
              : 'border-border focus:border-accent',
            className ?? '',
          ].join(' ')}
        />

        <AnimatePresence initial={false}>
          {hasError ? (
            <motion.p
              id={`${inputId}-error`}
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-error-600"
            >
              {errorMessage}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.div>
    );
  },
);

export interface FloatingPasswordFieldProps extends FloatingFieldProps {
  showToggle?: boolean;
}

/**
 * FloatingPasswordField — variante password con toggle ojo.
 * El ojo se ubica dentro del input absoluto, alineado al borde derecho.
 */
export const FloatingPasswordField = forwardRef<HTMLInputElement, FloatingPasswordFieldProps>(
  function FloatingPasswordField({ showToggle = true, className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <FloatingField
          ref={ref}
          {...props}
          type={visible ? 'text' : 'password'}
          className={['pr-11', className ?? ''].join(' ')}
        />
        {showToggle ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute bottom-[14px] right-4 text-text-secondary transition-colors hover:text-text-primary"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    );
  },
);

export default FloatingField;
