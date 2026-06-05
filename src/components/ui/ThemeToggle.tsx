'use client';

import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    const nuevoTema = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nuevoTema);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      style={{ backgroundColor: 'var(--bg-tarjetas)', borderColor: 'var(--border-componentes)' }}
      suppressHydrationWarning
    >
      {isDark ? (
        <FiSun className="w-5 h-5 text-yellow-300" />
      ) : (
        <FiMoon className="w-5 h-5 text-indigo-300" />
      )}
    </button>
  );
}