import { Link, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Navbar() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useDarkMode();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <Link to="/" className="font-heading text-xl font-extrabold tracking-tight">
        RentEasy
      </Link>
      <div className="flex gap-6 items-center text-sm font-medium">
        <Link to="/listings" className="hover:text-accent transition-colors">Search</Link>
        <button
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle dark mode"
          className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 hover:border-accent transition-colors"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        {isLoggedIn ? (
          <>
            <Link to="/settings" className="hover:text-accent transition-colors">Settings</Link>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-accent transition-colors">Log in</Link>
            <Link to="/signup" className="bg-accent text-white rounded-md px-4 py-2 hover:bg-accent-dark transition-colors">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}