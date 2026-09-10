import { useState, useEffect } from 'react';

export function useDarkMode() {
  // Initialize from localStorage so the choice survives a page refresh
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement; // the <html> tag
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]); // re-run whenever isDark changes

  return [isDark, setIsDark];
}