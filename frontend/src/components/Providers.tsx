'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/lib/api';
import TenantProvider from '@/components/TenantProvider';
import type { User } from '@/types';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Hydrate from localStorage first for instant UI
    const hasUser = (() => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) { setUser(JSON.parse(raw)); return true; }
      } catch { /* ignore */ }
      return false;
    })();

    // Validate with API (tokens are in httpOnly cookies, not localStorage)
    if (hasUser) {
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
          <TenantProvider>
            <AuthInitializer>{children}</AuthInitializer>
          </TenantProvider>
        </ThemeInitializer>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}
