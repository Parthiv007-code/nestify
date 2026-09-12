'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  // Re-check login status every time the route changes (e.g. right after login/logout navigates)
  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('token'));
  }, [pathname]);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b">
      <Link href="/" className="text-xl font-bold">RentEasy</Link>
      <div className="flex gap-4">
        <Link href="/listings">Browse</Link>
        {loggedIn ? (
          <Link href="/settings">Settings</Link>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}