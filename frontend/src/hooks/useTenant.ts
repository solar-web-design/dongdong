'use client';

import { create } from 'zustand';
import type { Tenant } from '@/types';

interface TenantState {
  tenant: Tenant | null;
  isLoading: boolean;
  setTenant: (tenant: Tenant | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  isLoading: true,
  setTenant: (tenant) => set({ tenant, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  const parts = host.split('.');

  // xxx.dongdong.kr → slug = xxx
  // localhost, IP → null
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub !== 'www' && sub !== 'api') {
      return sub;
    }
  }

  return null;
}
