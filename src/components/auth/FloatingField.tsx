import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export interface FloatingFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: string;
  errorMessage?: string;
  iconLeft?: ReactNode;
  /** Si true, el wrapper aplica una sacudida horizontal (anim. shake). */
  shake?: boolean;
}

const BASE_INPUT =
  'peer block w-full appearance-none rounded-xl border bg-brand-surface/40 px-4 pt-5 pb-2 ' +
  'text-base text-brand-light placeholder-transparent transition-all duration-300 ease-brand ' +
  'outline-none focus:bg-brand-surface/70';

/**
 * FloatingField — input con label flotante, ícono izquierdo opcional y glow
 * cyan al hacer focus. Estilo coherente con el tema dinámico.
 *
 * Diseñado para ser usado con React Hook Form: hace `forwardRef`.
 */
export const FloatingField = forwardRef<HTMLInputElement, FloatingFieldProps>(function FloatingField(
  { label, errorMessage, iconLeft, shake = false, id, className, ...inputProps },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasError = Boolean(errorMessage);

  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -6, 6, -3, 0] } : { x: 0 }}
      transition={{ duration: shake ? 0.45 : 0.2, ease: [0.36, 1.0, 0.4, 1.0] }}
      className="relative"
    >
      <div className="relative">
        {iconLeft ? (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-brand-light/50 transition-colors peer-focus:text-brand-primary">
            {iconLeft}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          placeholder={label}
          {...inputProps}
          className={[
            BASE_INPUT,
            iconLeft ? 'pl-11' : 'pl-4',
            hasError
              ? 'border-rose-500/70 focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.18)]'
              : 'border-brand-mid/70 focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(10,255,224,0.18)]',
            className ?? '',
          ].join(' ')}
        />
        <label
          htmlFor={inputId}
          className={[
            'pointer-events-none absolute top-1/2 origin-left -translate-y-1/2 select-none',
            'font-body text-sm text-brand-light/55 transition-all duration-300 ease-brand',
            iconLeft ? 'left-11' : 'left-4',
            // Estado flotado cuando hay valor o el input está enfocado.
            'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:scale-[0.82] peer-focus:text-brand-primary',
            'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-[0.82]',
            'peer-[:not(:placeholder-shown)]:text-brand-light/70',
          ].join(' ')}
        >
          {label}
        </label>
      </div>

      <AnimatePresence initial={false}>
        {hasError ? (
          <motion.p
            id={`${inputId}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 font-mono-brand text-xs text-rose-400"
          >
            {errorMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
});

export interface FloatingPasswordFieldProps extends FloatingFieldProps {
  /** Permite ocultar el toggle ojo (por ejemplo si la confirmación lo controla aparte). */
  showToggle?: boolean;
}

/**
 * FloatingPasswordField — variante con toggle show/hide ojo.
 */
export const FloatingPasswordField = forwardRef<HTMLInputElement, FloatingPasswordFieldProps>(
  function FloatingPasswordField({ showToggle = true, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <FloatingField
          ref={ref}
          {...props}
          type={visible ? 'text' : 'password'}
          // Reservar espacio para el botón ojo.
          className={['pr-12', props.className ?? ''].join(' ')}
        />
        {showToggle ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-4 top-[1.05rem] text-brand-light/55 transition-colors hover:text-brand-primary"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    );
  },
);

export default FloatingField;
