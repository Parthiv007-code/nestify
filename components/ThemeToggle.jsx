'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:border-gray-500 dark:hover:border-gray-400 transition-colors"
    >
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}