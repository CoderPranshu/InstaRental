import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { FiHeart, FiMapPin, FiStar, FiCalendar } from 'react-icons/fi';
import { addDays } from 'date-fns';
import { toast } from 'react-toastify';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items: wishlist } = useSelector((s) => s.wishlist);
  const isWishlisted = wishlist?.some((i) => i._id === product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    if (user) dispatch(toggleWishlist(product._id));
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!product.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }
    const startDate = addDays(new Date(), 1);
    const endDate = addDays(startDate, 1);
    const res = await dispatch(addToCart({
      productId: product._id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays: 1,
      totalAmount: product.pricePerDay,
    }));
    if (addToCart.fulfilled.match(res)) {
      toast.success('Added to cart');
    }
  };

  const categoryColors = {
    Furniture: 'bg-amber-500/20 text-amber-300',
    Electronics: 'bg-blue-500/20 text-blue-300',
    Vehicles: 'bg-green-500/20 text-green-300',
    Garments: 'bg-pink-500/20 text-pink-300',
    Tools: 'bg-orange-500/20 text-orange-300',
    Sports: 'bg-purple-500/20 text-purple-300',
    Books: 'bg-cyan-500/20 text-cyan-300',
    Others: 'bg-slate-500/20 text-slate-300',
  };

  return (
    <Link to={`/products/${product._id}`} className="card card-hover group block">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.images?.[0] || PLACEHOLDER}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.target.src = PLACEHOLDER)}
        />
        {/* Wishlist Button */}
        {user && (
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-red-500'
              }`}
          >
            <FiHeart size={14} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        )}
        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm ${categoryColors[product.category] || 'bg-slate-500/20 text-slate-300'}`}>
          {product.category}
        </span>
        {/* Availability */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-500/80 px-3 py-1 rounded-full">Not Available</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-white font-semibold text-base truncate group-hover:text-blue-400 transition-colors">{product.title}</h3>

        <div className="flex items-center gap-3 text-sm">
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <FiStar size={13} className="fill-current" />
              <span className="text-slate-300">{product.averageRating.toFixed(1)}</span>
              <span className="text-slate-500">({product.numReviews})</span>
            </div>
          )}
          {product.city && (
            <div className="flex items-center gap-1 text-slate-400">
              <FiMapPin size={12} /> <span>{product.city}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-blue-400 font-bold text-lg">₹{product.pricePerDay}</span>
            <span className="text-slate-500 text-xs">/day</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <FiCalendar size={11} /> {product.totalRentals || 0} rentals
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full btn-primary text-sm py-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
