import { QueryCache, QueryClient } from '@tanstack/react-query';
import { handleGlobalQueryError } from '@/lib/queryErrorHandler';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipGlobalErrorHandler) return;
      handleGlobalQueryError(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && [401, 403, 404].includes(status)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
