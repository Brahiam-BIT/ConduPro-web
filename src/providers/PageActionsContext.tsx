import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface PageActionsContextValue {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

const PageActionsContext = createContext<PageActionsContextValue | null>(null);

export function PageActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActionsState] = useState<ReactNode>(null);

  const setActions = useCallback((node: ReactNode) => {
    setActionsState(node);
  }, []);

  const value = useMemo(() => ({ actions, setActions }), [actions, setActions]);

  return (
    <PageActionsContext.Provider value={value}>{children}</PageActionsContext.Provider>
  );
}

export function usePageActionsContext(): PageActionsContextValue {
  const ctx = useContext(PageActionsContext);
  if (!ctx) {
    throw new Error('usePageActionsContext debe usarse dentro de PageActionsProvider');
  }
  return ctx;
}
