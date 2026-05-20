import { useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useUserSearch } from '@/hooks/useAdmin';
import { cn } from '@/utils/cn';
import type { Role } from '@/constants/roles';

interface UserAsyncSelectProps {
  label: string;
  role: Extract<Role, 'STUDENT' | 'INSTRUCTOR'>;
  value: string;
  onChange: (userId: string, displayName: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function UserAsyncSelect({
  label,
  role,
  value,
  onChange,
  onClear,
  placeholder = 'Buscar…',
}: UserAsyncSelectProps) {
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const { data, isFetching } = useUserSearch(search, role);

  useEffect(() => {
    if (!value) setDisplayName('');
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const options = data?.data ?? [];

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-label text-surface-700 dark:text-surface-200">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
          aria-hidden
        />
        <input
          id={inputId}
          type="text"
          value={value ? displayName : search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            if (value) onClear?.();
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Permite clic en una opción antes de cerrar (mousedown en el botón)
            window.setTimeout(() => {
              if (!containerRef.current?.contains(document.activeElement)) {
                setOpen(false);
              }
            }, 0);
          }}
          placeholder={value ? displayName : placeholder}
          className={cn(
            'h-11 w-full rounded-lg border border-surface-300 bg-surface-50 py-2 pl-9 pr-9 text-body-md',
            'focus:border-primary-500 focus:outline-none focus:shadow-glow',
            'dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100',
          )}
        />
        {(value || search) && (
          <button
            type="button"
            aria-label="Limpiar"
            onClick={() => {
              setSearch('');
              setDisplayName('');
              setOpen(false);
              onClear?.();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-800"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {open && !value ? (
          <ul
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-lg border border-surface-200 bg-surface-50 shadow-lg dark:border-surface-800 dark:bg-surface-900"
            role="listbox"
          >
          {isFetching ? (
            <li className="px-3 py-2 text-body-sm text-surface-500">Buscando…</li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2 text-body-sm text-surface-500">Sin resultados</li>
          ) : (
            options.map((u) => {
              const name = `${u.firstName} ${u.lastName}`;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    role="option"
                    className="w-full px-3 py-2 text-left text-body-sm hover:bg-primary-50 dark:hover:bg-primary-500/15"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(u.id, name);
                      setDisplayName(name);
                      setSearch('');
                      setOpen(false);
                    }}
                  >
                    <span className="font-medium text-surface-800 dark:text-surface-100">{name}</span>
                    <span className="ml-2 text-caption text-surface-500">{u.email}</span>
                  </button>
                </li>
              );
            })
          )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
