'use client';
// 'use client' marks this as a Client Component — it can use hooks, browser
// APIs, and interactivity. Without this directive, Next.js treats components
// as Server Components by default: they render on the server, can't use
// useState/useEffect, and ship less JS to the browser. Anything with state,
// event handlers, or effects needs 'use client' at the very top of the file.

import Link from 'next/link'; // Next.js's own Link — not react-router-dom's

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b">
      <Link href="/" className="text-xl font-bold">RentEasy</Link>
      <div className="flex gap-4">
        <Link href="/listings">Browse</Link>
        <Link href="/login">Log in</Link>
        <Link href="/signup">Sign up</Link>
      </div>
    </nav>
  );
}
