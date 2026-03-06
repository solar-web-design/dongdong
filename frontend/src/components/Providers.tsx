'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/lib/api';
import type { User } from '@/types';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Hydrate from localStorage first for instant UI
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }

    // Then validate with API
    const token = localStorage.getItem('accessToken');
    if (token) {
      api<User>('/users/me')
        .then(setUser)
        .catch(() => setUser(null));
    }
  }, [setUser]);

  return <>{children}</>;
}

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      {mounted ? (
        <ThemeInitializer>
          <AuthInitializer>{children}</AuthInitializer>
        </ThemeInitializer>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}
