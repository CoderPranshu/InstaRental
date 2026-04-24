import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { fetchCart } from '../features/cart/cartSlice';
import { FiMenu, FiX, FiShoppingBag, FiHeart, FiLogOut, FiHome, FiGrid, FiPackage, FiShield, FiShoppingCart } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) => s.cart?.items?.length || 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-700/60 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FiPackage className="text-white text-lg" />
            </div>
              <span className="text-xl font-extrabold tracking-tight">
              <span className="text-slate-900 dark:text-slate-100">INSTA</span>
              <span className="text-teal-500">RENTAL</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900 rounded-xl p-1">
            <NavLink to="/" icon={<FiHome />} label="Home" />
            <NavLink to="/products" icon={<FiGrid />} label="Browse" />
            {user && <CartNavLink count={cartCount} />}
            {user && <NavLink to="/wishlist" icon={<FiHeart />} label="Wishlist" />}
            {user?.role === 'vendor' || user?.role === 'admin' ? (
              <NavLink to="/vendor" icon={<FiShoppingBag />} label="Vendor" />
            ) : null}
            {user?.role === 'admin' && <NavLink to="/admin" icon={<FiShield />} label="Admin" />}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400/60 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-200">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-red-500 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-500/10 transition-colors">
                  <FiLogOut /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-accent text-sm py-2 px-4">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button className="text-slate-700 dark:text-slate-200 text-2xl p-1" onClick={() => setOpen(!open)}>
            {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 px-4 py-4 space-y-3 animate-fadeIn">
          <MobileLink to="/" label="Home" onClick={() => setOpen(false)} />
          <MobileLink to="/products" label="Browse Products" onClick={() => setOpen(false)} />
          {user && <MobileLink to="/cart" label={`Cart (${cartCount})`} onClick={() => setOpen(false)} />}
          {user && <MobileLink to="/wishlist" label="Wishlist" onClick={() => setOpen(false)} />}
          {(user?.role === 'vendor' || user?.role === 'admin') && <MobileLink to="/vendor" label="Vendor Dashboard" onClick={() => setOpen(false)} />}
          {user?.role === 'admin' && <MobileLink to="/admin" label="Admin Panel" onClick={() => setOpen(false)} />}
          {user ? (
            <>
              <MobileLink to="/profile" label="My Profile" onClick={() => setOpen(false)} />
              <button onClick={() => { handleLogout(); setOpen(false); }} className="w-full text-left text-red-500 py-2">Logout</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center text-sm" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn-accent flex-1 text-center text-sm" onClick={() => setOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 text-sm font-semibold transition-colors px-3 py-2 rounded-lg">
      {icon} {label}
    </Link>
  );
}

function CartNavLink({ count }) {
  return (
    <Link to="/cart" className="relative flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 text-sm font-semibold transition-colors px-3 py-2 rounded-lg">
      <FiShoppingCart />
      Cart
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}

function MobileLink({ to, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="block text-slate-700 dark:text-slate-200 hover:text-indigo-600 py-2 border-b border-slate-200/50 dark:border-slate-700/50 transition-colors">
      {label}
    </Link>
  );
}
