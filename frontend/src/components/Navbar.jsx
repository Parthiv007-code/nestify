import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token'); // !! converts "truthy string or null" into true/false

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload(); // forces the navbar (and any page state) to re-check login status
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
      <Link to="/" className="text-xl font-bold">RentEasy</Link>
      <div className="flex gap-4 items-center">
        <Link to="/listings">Search</Link>
        {isLoggedIn ? (
          <>
            <Link to="/settings">Settings</Link>
            <button onClick={handleLogout} className="text-red-600">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}