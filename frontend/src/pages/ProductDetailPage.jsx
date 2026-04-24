import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/products/productSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import axios from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FiHeart, FiMapPin, FiStar, FiCalendar, FiUser, FiCheck, FiArrowRight, FiShare2, FiShoppingCart } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import { differenceInDays, addDays } from 'date-fns';
import { addToCart } from '../features/cart/cartSlice';
import 'react-datepicker/dist/react-datepicker.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const { items: wishlist } = useSelector((s) => s.wishlist);
  const isWishlisted = wishlist?.some((i) => i._id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState(addDays(new Date(), 2));
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch {}
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    setSubmitting(true);
    try {
      await axios.post('/reviews', { productId: id, ...reviewForm });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
      dispatch(fetchProductById(id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-slate-400">Product not found</div>;

  const images = product.images?.length ? product.images : [PLACEHOLDER];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden h-96 relative">
            <img src={images[activeImg]} alt={product.title} className="w-full h-full object-cover" onError={(e) => (e.target.src = PLACEHOLDER)} />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="badge">{product.category}</span>
              <span className={`badge ${product.isAvailable ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {product.isAvailable ? '✓ Available' : '× Unavailable'}
              </span>
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-black dark:text-white">{product.title}</h1>
            <div className="flex items-center gap-4 mt-3">
              {product.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={product.averageRating} />
                  <span className="text-slate-300 text-sm">({product.numReviews} reviews)</span>
                </div>
              )}
              {product.city && (
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <FiMapPin size={14} /> {product.city}
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="glass rounded-2xl p-5 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-blue-400">₹{product.pricePerDay}</span>
              <span className="text-slate-400">/day</span>
            </div>
            {product.pricePerWeek > 0 && (
              <div className="text-slate-300 text-sm">Weekly: <span className="text-green-400 font-semibold">₹{product.pricePerWeek}</span>/week</div>
            )}
            <div className="text-slate-500 text-xs flex items-center gap-1">
              <FiCalendar size={12} /> {product.totalRentals} times rented
            </div>
          </div>

          {/* Features */}
          {product.features?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                    <FiCheck className="text-green-400 flex-shrink-0" size={14} /> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-black dark:text-white font-semibold">Description</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Condition */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">Condition:</span>
            <span className="badge">{product.condition}</span>
          </div>

          {/* Owner */}
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white font-bold">
              {product.owner?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{product.owner?.name}</p>
              <p className="text-slate-400 text-xs">{product.owner?.city || 'Vendor'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(d) => { setStartDate(d); if (d >= endDate) setEndDate(addDays(d, 1)); }}
                  minDate={addDays(new Date(), 1)}
                  className="input-field text-sm w-full"
                  dateFormat="dd MMM yyyy"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(d) => setEndDate(d)}
                  minDate={addDays(startDate, 1)}
                  className="input-field text-sm w-full"
                  dateFormat="dd MMM yyyy"
                />
              </div>
            </div>

            <div className="flex gap-3">
              {product.isAvailable ? (
                <>
                  <button onClick={() => {
                    if (!user) { toast.error('Please login to book'); navigate('/login'); return; }
                    navigate(`/booking/${product._id}`);
                  }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    Book Now <FiArrowRight />
                  </button>
                  <button onClick={async () => {
                    if (!user) { toast.error('Please login'); navigate('/login'); return; }
                    setAddingToCart(true);
                    const totalDays = differenceInDays(endDate, startDate);
                    const totalAmount = totalDays * product.pricePerDay;
                    const res = await dispatch(addToCart({
                      productId: id,
                      startDate: startDate.toISOString(),
                      endDate: endDate.toISOString(),
                      totalDays,
                      totalAmount
                    }));
                    setAddingToCart(false);
                    if (addToCart.fulfilled.match(res)) {
                      toast.success('Added to cart!');
                    }
                  }} disabled={addingToCart} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                    <FiShoppingCart /> {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </>
              ) : (
                <button disabled className="btn-primary flex-1 opacity-50 cursor-not-allowed">Not Available</button>
              )}
              <button onClick={() => { if (user) dispatch(toggleWishlist(product._id)); else toast.error('Please login'); }}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${isWishlisted ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-slate-600 text-slate-400 hover:border-red-400 hover:text-red-400'}`}>
                <FiHeart size={18} className={isWishlisted ? 'fill-current' : ''} />
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="w-12 h-12 rounded-xl border border-slate-600 text-slate-400 hover:border-blue-400 hover:text-blue-400 flex items-center justify-center transition-all">
                <FiShare2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-8">
        <h2 className="section-title">Reviews & Ratings</h2>

        {/* Add Review Form */}
        {user && (
          <form onSubmit={submitReview} className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold">Write a Review</h3>
            <div className="flex items-center gap-3">
              <StarRating rating={reviewForm.rating} editable onRate={(r) => setReviewForm((f) => ({ ...f, rating: r }))} size={24} />
              <span className="text-slate-400 text-sm">{reviewForm.rating}/5</span>
            </div>
            <textarea
              value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience..."
              className="input-field resize-none h-24" required
            />
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="glass rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white text-sm font-bold">
                    {r.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{r.user?.name}</p>
                    <p className="text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="ml-auto"><StarRating rating={r.rating} size={14} /></div>
                </div>
                <p className="text-slate-300 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
