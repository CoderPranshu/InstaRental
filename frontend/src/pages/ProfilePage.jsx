import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyBookings, cancelBooking } from '../features/bookings/bookingSlice';
import { updateProfile } from '../features/auth/authSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave, FiX, FiPackage, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  confirmed: 'bg-blue-500/20 text-blue-300',
  active: 'bg-green-500/20 text-green-300',
  completed: 'bg-slate-500/20 text-slate-300',
  cancelled: 'bg-red-500/20 text-red-300',
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const { myBookings } = useSelector((s) => s.bookings);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '' });

  useEffect(() => {
    if (activeTab === 'bookings') dispatch(fetchMyBookings());
  }, [activeTab, dispatch]);

  const handleSave = async () => {
    const res = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(res)) {
      toast.success('Profile updated!');
      setEditing(false);
    } else {
      toast.error('Update failed');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    const res = await dispatch(cancelBooking(id));
    if (cancelBooking.fulfilled.match(res)) toast.success('Booking cancelled');
    else toast.error('Could not cancel');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fadeIn">
      <h1 className="text-3xl font-black text-white mb-8">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 glass rounded-2xl p-1 w-fit">
        {['profile', 'bookings'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass rounded-3xl p-8 space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white text-3xl font-black shadow-xl">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-red-500/20 text-red-300' : user?.role === 'vendor' ? 'bg-orange-500/20 text-orange-300' : ''}`}>
                {user?.role}
              </span>
            </div>
            <button onClick={() => setEditing(!editing)} className="ml-auto btn-secondary text-sm flex items-center gap-2">
              {editing ? <><FiX /> Cancel</> : <><FiEdit3 /> Edit</>}
            </button>
          </div>

          {/* Info Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField icon={<FiMail />} label="Email" value={user?.email} />
            <InfoField icon={<FiUser />} label="Name" value={form.name} editable={editing}
              onChange={(v) => setForm({ ...form, name: v })} />
            <InfoField icon={<FiPhone />} label="Phone" value={form.phone} editable={editing}
              onChange={(v) => setForm({ ...form, phone: v })} />
            <InfoField icon={<FiMapPin />} label="City" value={form.city} editable={editing}
              onChange={(v) => setForm({ ...form, city: v })} />
          </div>

          {editing && (
            <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
              <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-slate-400">No bookings yet. Start renting!</p>
            </div>
          ) : (
            myBookings.map((b) => (
              <div key={b._id} className="glass rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
                <img src={b.product?.images?.[0] || ''} alt={b.product?.title} className="w-24 h-24 rounded-xl object-cover bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h3 className="text-white font-semibold">{b.product?.title}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <FiCalendar size={13} />
                    {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    <span className="text-slate-500">({b.totalDays} days)</span>
                  </div>
                  <p className="text-blue-400 font-bold">₹{b.totalAmount}</p>
                </div>
                <div className="flex flex-col gap-2 items-start flex-shrink-0">
                  {(b.status === 'pending' || b.status === 'confirmed' || b.status === 'active') && (
                    <Link to={`/chat/${b._id}`} className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all">
                      <FiMessageSquare size={12} /> Chat
                    </Link>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button onClick={() => handleCancel(b._id)} className="btn-secondary text-xs py-1.5 px-3 text-red-400 border-red-500/30 hover:bg-red-500/10">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function InfoField({ icon, label, value, editable, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-500 flex items-center gap-1.5">{icon} {label}</label>
      {editable && onChange ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="input-field text-sm py-2" />
      ) : (
        <p className="text-slate-200 text-sm bg-slate-800/40 rounded-xl px-3 py-2">{value || '—'}</p>
      )}
    </div>
  );
}
