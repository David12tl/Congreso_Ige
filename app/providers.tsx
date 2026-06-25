'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';

const AnimatedBackground = dynamic(
  () => import('@/components/ui/AnimatedBackground'),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      disableTransitionOnChange
    >
      <AnimatedBackground />
      {children}
    </ThemeProvider>
  );
}
