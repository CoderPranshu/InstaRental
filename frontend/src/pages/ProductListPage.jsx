import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { FiSearch, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';

const CATEGORIES = ['All', 'Furniture', 'Electronics', 'Vehicles', 'Garments', 'Tools', 'Sports', 'Books', 'Others'];
const SORT_OPTIONS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'pricePerDay' },
  { label: 'Price: High to Low', value: '-pricePerDay' },
  { label: 'Top Rated', value: '-averageRating' },
];

export default function ProductListPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, pages, total } = useSelector((s) => s.products);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    city: '', minPrice: '', maxPrice: '',
    sort: '-createdAt', page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadProducts = useCallback(() => {
    const params = {};
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.category) params.category = filters.category;
    if (filters.city) params.city = filters.city;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    params.sort = filters.sort;
    params.page = filters.page;
    dispatch(fetchProducts(params));
  }, [dispatch, filters]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="page-shell py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white">Browse Rentals</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{total} items available</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 btn-secondary text-sm">
          <FiFilter /> Filters
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          placeholder="Search products..."
          value={filters.keyword}
          onChange={(e) => setFilter('keyword', e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter('category', cat === 'All' ? '' : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              (cat === 'All' && !filters.category) || filters.category === cat
                ? 'bg-blue-600 text-white'
                : 'glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">City</label>
            <input placeholder="e.g. Mumbai" value={filters.city} onChange={(e) => setFilter('city', e.target.value)} className="input-field text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Min Price (₹/day)</label>
            <input type="number" placeholder="0" value={filters.minPrice} onChange={(e) => setFilter('minPrice', e.target.value)} className="input-field text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Max Price (₹/day)</label>
            <input type="number" placeholder="10000" value={filters.maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)} className="input-field text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Sort By</label>
            <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} className="input-field text-sm py-2">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button onClick={() => setFilters({ keyword: '', category: '', city: '', minPrice: '', maxPrice: '', sort: '-createdAt', page: 1 })}
            className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors">
            <FiX /> Clear All
          </button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl">No products found</p>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setFilters((f) => ({ ...f, page: p }))}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${filters.page === p ? 'bg-blue-600 text-white' : 'glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
