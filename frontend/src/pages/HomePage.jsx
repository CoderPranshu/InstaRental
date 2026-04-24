import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFeaturedProducts } from '../features/products/productSlice';
import Loader from '../components/Loader';
import { FiArrowRight, FiSearch, FiShield, FiStar, FiDollarSign, FiChevronLeft, FiChevronRight, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';

const CATEGORIES = [
  { name: 'Furniture', emoji: '🛋️' },
  { name: 'Electronics', emoji: '💻' },
  { name: 'Vehicles', emoji: '🚗' },
  { name: 'Garments', emoji: '👗' },
  { name: 'Tools', emoji: '🔧' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Books', emoji: '📚' },
  { name: 'Others', emoji: '📦' },
];

const STATS = [
  { label: 'Happy Customers', value: '10,000+' },
  { label: 'Products Listed', value: '5,000+' },
  { label: 'Cities Covered', value: '500+' },
];

const FEATURES = [
  { icon: <FiSearch size={18} />, title: '1. Search', desc: 'Find items quickly with smart filters and city search.' },
  { icon: <FiShield size={18} />, title: '2. Book', desc: 'Confirm instantly with transparent pricing and terms.' },
  { icon: <FiDollarSign size={18} />, title: '3. Enjoy', desc: 'Pay securely and use what you need, when you need it.' },
];

const TESTIMONIALS = [
  {
    name: 'Aarav Mehta',
    role: 'Frequent Renter',
    quote: 'I rented a DSLR for a weekend shoot at half the market cost. The process was quick, transparent, and very reliable.',
    rating: 5,
  },
  {
    name: 'Neha Sharma',
    role: 'Vendor Partner',
    quote: 'Listing on InstaRental helped me monetize idle inventory. I now get consistent bookings and timely payments.',
    rating: 5,
  },
  {
    name: 'Rohan Verma',
    role: 'Startup Founder',
    quote: 'For temporary office setup, renting furniture here saved both budget and time. Support and communication were excellent.',
    rating: 4,
  },
];

const WHY_CHOOSE = [
  {
    icon: <FiShield size={18} />,
    title: 'Trusted & Verified',
    desc: 'Verified users, transparent ratings, and secure payment confirmation for every booking.',
  },
  {
    icon: <FiClock size={18} />,
    title: 'Fast Booking Flow',
    desc: 'Find, book, and pay in minutes with streamlined product discovery and instant checkout.',
  },
  {
    icon: <FiUsers size={18} />,
    title: 'Multi-Vendor Marketplace',
    desc: 'Choose from listings across categories, cities, and vendors at competitive rental prices.',
  },
];

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
];

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, loading } = useSelector((s) => s.products);
  const [searchVal, setSearchVal] = useState('');
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => { dispatch(fetchFeaturedProducts()); }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?keyword=${searchVal}`);
  };

  return (
    <div className="animate-fadeIn bg-slate-50 dark:bg-slate-950 tracking-[0.01em]">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center border-b border-slate-200/70 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(99,102,241,0.22),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(20,184,166,0.2),transparent_38%)]" />
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 relative z-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">rent from people around you</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-900 dark:text-white">
                Rent <span className="text-indigo-600 dark:text-indigo-400">Anything</span>, Anytime
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-xl">
                Access products on demand across categories. From furniture and gadgets to tools and vehicles, rent
                smarter at flexible prices.
              </p>
              <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/95 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2 shadow-lg shadow-slate-200/50 dark:shadow-none">
                <FiSearch className="text-slate-400 ml-2 flex-shrink-0" size={18} />
                <input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search products"
                  className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none text-sm py-1"
                />
                <button type="submit" className="btn-primary text-sm py-2 px-5">Search</button>
              </form>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary flex items-center gap-2">
                  Browse Products <FiArrowRight />
                </Link>
                <Link to="/register" className="btn-secondary flex items-center gap-2">
                  List Your Item
                </Link>
              </div>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-teal-500/20 to-indigo-500/30 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 p-5 min-h-[380px] lg:min-h-[460px] relative overflow-hidden shadow-xl shadow-indigo-200/40 dark:shadow-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.2),transparent_45%)]" />
              <div className="relative z-10 h-full grid grid-cols-2 gap-3">
                <img
                  src={featured?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'}
                  alt="Hero item"
                  className="col-span-2 h-48 w-full object-cover rounded-2xl border border-white/40"
                />
                <img
                  src={featured?.[1]?.images?.[0] || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80'}
                  alt="Secondary item"
                  className="h-28 w-full object-cover rounded-xl border border-white/40"
                />
                <img
                  src={featured?.[2]?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                  alt="Secondary item"
                  className="h-28 w-full object-cover rounded-xl border border-white/40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Promo Section (below hero) */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-[#1c2336] border border-slate-700/60 min-h-[330px]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_15%_20%,#ef4444,transparent_35%),radial-gradient(circle_at_85%_75%,#0ea5e9,transparent_35%)]" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 lg:p-10 items-center">
            <div className="space-y-4">
              <p className="text-amber-400 font-semibold text-sm uppercase tracking-wide">No Equipment?</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">No Problem</h2>
              <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
                From home projects to business events, InstaRental helps you access the right tools, electronics,
                furniture, and vehicles without the heavy cost of ownership.
              </p>
              <Link to="/products" className="inline-flex items-center gap-2 rounded-lg bg-amber-400 text-slate-900 font-semibold px-5 py-2.5 hover:bg-amber-300 transition-colors">
                Explore Rentals <FiArrowRight />
              </Link>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-5 text-white shadow-xl">
                <p className="text-xs uppercase opacity-80 mb-2">InstaRental Highlights</p>
                <h3 className="text-2xl font-bold leading-tight mb-2">Rent Premium Items Across 8 Categories</h3>
                <p className="text-sm text-red-100 mb-4">Flexible plans for daily and weekly rentals with verified vendors.</p>
                <button className="rounded-md bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2">Contact</button>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 shadow-xl">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Specs</h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between border-b border-slate-200 pb-1"><span>Categories</span><span>8+</span></div>
                  <div className="flex justify-between border-b border-slate-200 pb-1"><span>Vendors</span><span>4+</span></div>
                  <div className="flex justify-between border-b border-slate-200 pb-1"><span>Products</span><span>24+</span></div>
                  <div className="flex justify-between border-b border-slate-200 pb-1"><span>Cities</span><span>500+</span></div>
                  <div className="flex justify-between"><span>Support</span><span>24/7</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Why Choose InstaRental</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">A professional rental experience built for trust, speed, and value.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {WHY_CHOOSE.map((item) => (
            <div key={item.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Image carousel */}
      <section className="w-full pb-16">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Explore Rental Moments</h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">A quick look at what you can rent on InstaRental</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCarouselIdx((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center bg-white/90 dark:bg-slate-900/80"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => setCarouselIdx((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center bg-white/90 dark:bg-slate-900/80"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden border-y border-slate-200 dark:border-slate-700">
          <img src={CAROUSEL_IMAGES[carouselIdx]} alt="InstaRental showcase" className="h-[58vh] sm:h-[68vh] lg:h-[76vh] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-black/40" />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white text-base md:text-lg font-semibold">Rent smarter. Save more. Access everything when you need it.</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-5">
          {CAROUSEL_IMAGES.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              onClick={() => setCarouselIdx(idx)}
              className={`h-2.5 rounded-full transition-all ${idx === carouselIdx ? 'w-6 bg-indigo-600' : 'w-2.5 bg-slate-300 dark:bg-slate-700'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-7">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Explore by Category</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Find exactly what you need in seconds</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-400/60 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 mx-auto rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-lg mb-2">
                {cat.emoji}
              </div>
              <p className="text-slate-700 dark:text-slate-200 text-xs font-semibold">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trending Rentals</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Most popular items this week</p>
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500"><FiChevronLeft size={14} /></button>
            <button className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500"><FiChevronRight size={14} /></button>
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {featured.slice(0, 5).map((p) => (
              <Link
                to={`/products/${p._id}`}
                key={p._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-all"
              >
                <img src={p.images?.[0]} alt={p.title} className="h-40 w-full object-cover" />
                <div className="p-3 space-y-1">
                  <p className="text-xs text-slate-500">{p.category}</p>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold">₹{p.pricePerDay}/day</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Stats strip */}
      <section className="bg-slate-950 py-7">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-cyan-300">{s.value}</p>
              <p className="text-xs text-slate-300">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Simple. Fast. Secure.</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">Get what you need in three simple steps</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-3">
              <div className="mx-auto w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{f.desc}</p>
              <div className="flex items-center justify-center pt-1 text-emerald-600 dark:text-emerald-400">
                <FiCheckCircle size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-100 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Trusted by thousands of professionals</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What our users say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <article key={item.name} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <div className="flex items-center gap-1 text-emerald-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <FiStar key={`${item.name}-${idx}`} size={15} className={idx < item.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'} />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{item.quote}</p>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 p-10 text-center space-y-5 mt-12">
          <h2 className="text-3xl md:text-4xl font-black text-white">Have items sitting idle?</h2>
          <p className="text-indigo-100 text-lg">List them on InstaRental and start earning from day one.</p>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-6 py-3 transition-colors">
            Become a Vendor <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}


