'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const BottomNav = dynamic(() => import('@/components/BottomNav'), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto pb-20 md:pb-4">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
