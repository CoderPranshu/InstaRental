import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../features/wishlist/wishlistSlice';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import StarRating from '../components/StarRating';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <FiHeart className="text-red-400" size={28} />
        <h1 className="text-3xl font-black text-black dark:text-white">My Wishlist</h1>
        <span className="badge">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <div className="text-6xl">💔</div>
          <p className="text-xl text-slate-400">Your wishlist is empty</p>
          <p className="text-slate-500 text-sm">Browse items and click the heart ❤️ to save them here</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 mt-2">
            Browse Products <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id} className="card group">
              <div className="relative h-44 overflow-hidden">
                <img src={item.images?.[0] || PLACEHOLDER} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button onClick={() => dispatch(toggleWishlist(item._id))}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-600 transition-all">
                  <FiTrash2 size={13} />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <span className="badge text-xs">{item.category}</span>
                <h3 className="text-white font-semibold truncate">{item.title}</h3>
                {item.averageRating > 0 && <StarRating rating={item.averageRating} size={13} />}
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-bold">₹{item.pricePerDay}<span className="text-slate-500 text-xs">/day</span></span>
                </div>
                <Link to={`/products/${item._id}`} className="btn-primary text-sm py-2 flex items-center justify-center gap-2">
                  View & Book <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
