'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('token'));
  }, [pathname]);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <Link href="/" className="text-xl font-bold">RentEasy</Link>
      <div className="flex items-center gap-4">
        <Link href="/listings" className="hover:underline">Browse</Link>
        {loggedIn ? (
          <Link href="/settings" className="hover:underline">Settings</Link>
        ) : (
          <>
            <Link href="/login" className="hover:underline">Log in</Link>
            <Link href="/signup" className="hover:underline">Sign up</Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}