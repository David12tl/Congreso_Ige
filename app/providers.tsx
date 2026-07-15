'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/theme-provider';

const AnimatedBackground = dynamic(
  () => import('@/components/ui/AnimatedBackground'),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
      <ThemeProvider defaultTheme="light">
      <AnimatedBackground />
      {children}
    </ThemeProvider>
  );
}
