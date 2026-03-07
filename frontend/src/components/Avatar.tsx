'use client';

import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <div className={cn('relative shrink-0', sizeMap[size])}>
        <Image src={src} alt={name} fill className={cn('rounded-full object-cover', className)} sizes="80px" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-gray-600 dark:text-gray-300',
        sizeMap[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
