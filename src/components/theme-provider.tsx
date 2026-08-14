'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
});

function getStorageTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('theme') as Theme | null;
}

function subscribe() {
  // No-op for our simple use case
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return true;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  attribute = 'class',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  attribute?: string;
}) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return getStorageTheme() || defaultTheme;
  });

  useEffect(() => {
    if (!isMounted) return;
    
    const root = document.documentElement;
    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme, attribute, isMounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}