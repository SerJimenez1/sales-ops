// src/QueryProvider.tsx (o src/providers/QueryProvider.tsx)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';  // type-only import para evitar errores TS

const queryClient = new QueryClient();

export default function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}