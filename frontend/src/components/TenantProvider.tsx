'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useTenantStore, getTenantSlug } from '@/hooks/useTenant';
import type { Tenant } from '@/types';

export default function TenantProvider({ children }: { children: React.ReactNode }) {
  const { setTenant, setLoading } = useTenantStore();

  useEffect(() => {
    const slug = getTenantSlug();
    if (!slug) {
      setTenant(null);
      return;
    }

    setLoading(true);
    api<Tenant>(`/tenants/by-slug/${slug}`)
      .then((tenant) => {
        setTenant(tenant);
        // CSS 변수로 테넌트 색상 적용
        if (tenant.primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary', tenant.primaryColor);
        }
      })
      .catch(() => {
        setTenant(null);
      });
  }, [setTenant, setLoading]);

  return <>{children}</>;
}
