import { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import Loader from '../components/Loader';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiUserX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users'),
        axios.get('/admin/bookings'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(`/admin/users/${userId}`, { role });
      toast.success('Role updated');
      loadAll();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await axios.put(`/admin/users/${userId}`, { isActive: !isActive });
      toast.success(isActive ? 'User deactivated' : 'User activated');
      loadAll();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <Loader message="Loading admin panel..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">🛡️</div>
        <h1 className="text-3xl font-black text-white">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 glass rounded-2xl p-1 w-fit">
        {['overview', 'users', 'bookings'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <AdminStat icon={<FiUsers />} label="Renters" value={stats.totalUsers} color="blue" />
            <AdminStat icon={<FiUsers />} label="Vendors" value={stats.totalVendors} color="orange" />
            <AdminStat icon={<FiPackage />} label="Listings" value={stats.totalProducts} color="purple" />
            <AdminStat icon={<FiShoppingBag />} label="Bookings" value={stats.totalBookings} color="green" />
            <AdminStat icon={<FiDollarSign />} label="Revenue" value={`₹${stats.totalRevenue}`} color="yellow" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Recent Bookings</h2>
            <div className="space-y-3">
              {stats.recentBookings.map((b) => (
                <div key={b._id} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{b.product?.title}</p>
                    <p className="text-slate-400 text-xs">{b.user?.name} — {new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${b.status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Management */}
      {tab === 'users' && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm mb-4">{users.length} total users</p>
          {users.map((u) => (
            <div key={u._id} className="glass rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                {u.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{u.name}</p>
                <p className="text-slate-400 text-xs truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  className="bg-slate-700/80 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none">
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => handleToggleActive(u._id, u.isActive)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                  {u.isActive ? <><FiUserX size={12} /> Deactivate</> : <><FiCheckCircle size={12} /> Activate</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm mb-4">{bookings.length} total bookings</p>
          {bookings.map((b) => (
            <div key={b._id} className="glass rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-white font-medium text-sm">{b.product?.title}</p>
                <p className="text-slate-400 text-xs">Renter: {b.user?.name} | Owner: {b.owner?.name}</p>
                <p className="text-blue-400 text-sm font-bold">₹{b.totalAmount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300' : b.status === 'completed' ? 'bg-green-500/20 text-green-300' : b.status === 'cancelled' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {b.status}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${b.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {b.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminStat({ icon, label, value, color }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10', orange: 'text-orange-400 bg-orange-500/10',
    green: 'text-green-400 bg-green-500/10', purple: 'text-purple-400 bg-purple-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
  };
  return (
    <div className="glass rounded-2xl p-5 space-y-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-slate-400 text-xs">{label}</p>
    </div>
  );
}
