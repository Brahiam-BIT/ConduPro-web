import { useEffect, type ReactNode } from 'react';
import { usePageActionsContext } from '@/providers/PageActionsContext';

export interface PageHeaderProps {
  /** @deprecated Los títulos viven en AppTopBar. */
  title?: string;
  /** @deprecated Los subtítulos viven en AppTopBar. */
  subtitle?: string;
  /** Botones que aparecen a la derecha en la barra superior. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Registra acciones de página en AppTopBar. No renderiza título ni acciones duplicadas.
 */
export function PageHeader({ actions }: PageHeaderProps) {
  const { setActions } = usePageActionsContext();

  useEffect(() => {
    setActions(actions ?? null);
    return () => setActions(null);
  }, [actions, setActions]);

  return null;
}
