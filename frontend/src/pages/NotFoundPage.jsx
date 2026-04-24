import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
      <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400 mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-slate-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/" className="btn-primary flex items-center gap-2">
          <FiHome /> Go Home
        </Link>
        <Link to="/products" className="btn-secondary flex items-center gap-2">
          <FiSearch /> Browse Products
        </Link>
      </div>
    </div>
  );
}
