'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Users, MessageCircle, Mail, Wallet, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/feed', label: '피드', icon: FileText },
  { href: '/meetings', label: '모임', icon: Users },
  { href: '/chat', label: '채팅', icon: MessageCircle },
  { href: '/dm', label: '편지함', icon: Mail },
  { href: '/more', label: '더보기', icon: Menu },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-t border-gray-200/40 dark:border-gray-700/40 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors',
                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
