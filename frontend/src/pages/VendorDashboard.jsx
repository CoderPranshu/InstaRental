import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProducts, deleteProduct } from '../features/products/productSlice';
import { fetchVendorBookings, updateBookingStatus } from '../features/bookings/bookingSlice';
import axios from '../api/axiosConfig';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiTrash2,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiX,
  FiCamera,
  FiBell,
  FiGrid,
  FiHome,
  FiSettings,
  FiLogOut,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiArrowUpRight,
} from 'react-icons/fi';

const CATEGORIES = ['Furniture', 'Electronics', 'Vehicles', 'Garments', 'Tools', 'Sports', 'Books', 'Others'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const emptyForm = { title: '', description: '', category: 'Furniture', pricePerDay: '', pricePerWeek: '', city: '', condition: 'Good', features: '', isAvailable: true };

export default function VendorDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myProducts, loading } = useSelector((s) => s.products);
  const { vendorBookings } = useSelector((s) => s.bookings);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMyProducts());
    dispatch(fetchVendorBookings());
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    for (let img of images) fd.append('images', img);
    try {
      await axios.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product listed! 🎉');
      setShowForm(false);
      setForm(emptyForm);
      setImages([]);
      dispatch(fetchMyProducts());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    const res = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(res)) toast.success('Listing deleted');
    else toast.error('Delete failed');
  };

  const handleStatusUpdate = async (id, status) => {
    const res = await dispatch(updateBookingStatus({ id, status }));
    if (updateBookingStatus.fulfilled.match(res)) toast.success(`Booking ${status}`);
  };

  const totalRevenue = vendorBookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0);
  const activeBookings = vendorBookings.filter((b) => b.status === 'confirmed' || b.status === 'active').length;
  const avgRating = myProducts.length
    ? (myProducts.reduce((sum, p) => sum + (p.averageRating || 0), 0) / myProducts.length).toFixed(1)
    : '0.0';
  const pendingRequests = vendorBookings.filter((b) => b.status === 'pending');
  const recentBookings = vendorBookings.slice(0, 4);
  const recentProducts = myProducts.slice(0, 4);
  const activityLog = [
    { label: 'Payment Received', detail: `₹${totalRevenue || 0} total paid bookings`, tone: 'emerald' },
    { label: 'Active Booking', detail: `${activeBookings} bookings currently active/confirmed`, tone: 'indigo' },
    { label: 'Listing Health', detail: `${myProducts.length} listings with avg rating ${avgRating}`, tone: 'orange' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="grid grid-cols-1 xl:grid-cols-[250px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-fit xl:sticky xl:top-24">
          <p className="text-indigo-600 font-black text-lg mb-4">INSTARENTAL</p>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'V'}
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.name || 'Vendor'}</p>
            <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mt-1">Top Vendor</p>
          </div>
          <div className="space-y-1.5 text-sm">
            <SideItem icon={<FiGrid />} label="Dashboard" active />
            <SideItem icon={<FiPackage />} label="My Listings" />
            <SideItem icon={<FiPlus />} label="Add New Item" onClick={() => setShowForm(true)} />
            <SideItem icon={<FiShoppingBag />} label="Booking Requests" />
            <SideItem icon={<FiDollarSign />} label="Earnings" />
            <SideItem icon={<FiSettings />} label="Settings" />
          </div>
          <button className="mt-6 w-full flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-2.5 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <FiLogOut /> Logout
          </button>
        </aside>

        {/* Main */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Vendor Workspace</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Good Morning, {user?.name?.split(' ')[0] || 'Vendor'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <FiBell size={15} /> Notifications
              </button>
              <button onClick={() => setShowForm(true)} className="h-11 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2">
                <FiPlus size={16} /> Add New Listing
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TopCard icon={<FiPackage />} title="Total Listings" value={myProducts.length} badge="+12%" />
            <TopCard icon={<FiCheckCircle />} title="Active Bookings" value={activeBookings} badge="Active" />
            <TopCard icon={<FiDollarSign />} title="Total Earnings" value={`₹${totalRevenue.toLocaleString()}`} badge="+₹4.2K" />
            <TopCard icon={<FiStar />} title="Average Rating" value={avgRating} badge="Top Rated" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr,280px] gap-6">
            {/* Listings + Requests */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Listings</h2>
                  <button className="text-sm text-indigo-600 dark:text-indigo-300 font-semibold">View All</button>
                </div>
                {recentProducts.length === 0 ? (
                  <div className="py-10 text-center text-slate-500">No listings yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <th className="pb-3 font-semibold">Product</th>
                          <th className="pb-3 font-semibold">Category</th>
                          <th className="pb-3 font-semibold">Price/Day</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProducts.map((p) => (
                          <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800/70">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <img src={p.images?.[0] || ''} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-slate-200 dark:bg-slate-700" />
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{p.title}</p>
                              </div>
                            </td>
                            <td className="py-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                            <td className="py-3 font-semibold text-slate-900 dark:text-white">₹{p.pricePerDay}</td>
                            <td className="py-3">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${p.isAvailable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                {p.isAvailable ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button onClick={() => handleDelete(p._id)} className="w-8 h-8 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 inline-flex items-center justify-center">
                                <FiTrash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Booking Requests</h2>
                {pendingRequests.length === 0 ? (
                  <div className="py-8 text-slate-500 text-sm">No pending booking requests.</div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 3).map((b) => (
                      <div key={b._id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                          {b.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{b.user?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{b.product?.title} • {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</p>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">₹{b.totalAmount}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusUpdate(b._id, 'confirmed')} className="px-3 py-1.5 rounded-full text-[11px] bg-teal-600 text-white font-semibold">Accept</button>
                          <button onClick={() => handleStatusUpdate(b._id, 'cancelled')} className="px-3 py-1.5 rounded-full text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right widgets */}
            <div className="space-y-5">
              <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-700 to-violet-700 text-white">
                <p className="font-semibold mb-3">Revenue Growth</p>
                <div className="h-32 flex items-end gap-2 mb-3">
                  {[35, 55, 82, 48, 60, 33].map((h, idx) => (
                    <div key={idx} className={`flex-1 rounded-md ${idx === 2 ? 'bg-teal-400' : 'bg-white/20'}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/80">
                  <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <p className="font-bold text-slate-900 dark:text-white mb-3">Activity Log</p>
                <div className="space-y-3">
                  {activityLog.map((a) => (
                    <div key={a.label} className="flex gap-2.5">
                      <span className={`mt-1.5 w-2 h-2 rounded-full ${a.tone === 'emerald' ? 'bg-emerald-500' : a.tone === 'indigo' ? 'bg-indigo-500' : 'bg-orange-500'}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-500/10 p-5 text-center">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3">
                  <FiArrowUpRight />
                </div>
                <p className="font-bold text-slate-900 dark:text-white">Grow Your Business</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Promote listings to appear higher in search results.</p>
                <button className="mt-4 w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">Upgrade to Pro</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Listing</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="title" placeholder="Product Title *" required value={form.title} onChange={handleChange} className="input-field" />
              <textarea name="description" placeholder="Description *" required value={form.description} onChange={handleChange} className="input-field resize-none h-24" />
              <div className="grid grid-cols-2 gap-4">
                <select name="category" value={form.category} onChange={handleChange} className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select name="condition" value={form.condition} onChange={handleChange} className="input-field">
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="pricePerDay" type="number" placeholder="Price/Day (₹) *" required value={form.pricePerDay} onChange={handleChange} className="input-field" />
                <input name="pricePerWeek" type="number" placeholder="Price/Week (₹)" value={form.pricePerWeek} onChange={handleChange} className="input-field" />
              </div>
              <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="input-field" />
              <input name="features" placeholder="Features (comma-separated, e.g. WiFi, AC...)" value={form.features} onChange={handleChange} className="input-field" />

              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-2"><FiCamera /> Upload Images (max 5)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
                  className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs" />
                {images.length > 0 && <p className="text-xs text-green-400 mt-1">{images.length} image(s) selected</p>}
              </div>

              <button type="submit" disabled={submitting} className="btn-accent w-full flex items-center justify-center gap-2">
                {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Listing...</> : 'Create Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TopCard({ icon, title, value, badge }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 font-semibold">
          {badge}
        </span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function SideItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
