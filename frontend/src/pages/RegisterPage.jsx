import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiPackage, FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user', phone: '', city: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const res = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(res)) {
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } else {
      toast.error(res.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
            <FiPackage className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-black text-black dark:text-white">Create Account</h1>
          <p className="text-slate-400 mt-2">Join INSTARENT today — it's free!</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-600">
              {['user', 'vendor'].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${form.role === r ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  {r === 'user' ? '👤 Renter' : '🏪 Vendor'}
                </button>
              ))}
            </div>

            <Field icon={<FiUser />} name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
            <Field icon={<FiMail />} name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
            <Field icon={<FiPhone />} name="phone" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} />
            <Field icon={<FiMapPin />} name="city" type="text" placeholder="City (optional)" value={form.city} onChange={handleChange} />

            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="password" type={showPass ? 'text' : 'password'} placeholder="Password (min 6 chars)"
                value={form.password} onChange={handleChange} required className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <Field icon={<FiLock />} name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, name, type, placeholder, value, onChange, required }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} className="input-field pl-10" />
    </div>
  );
}
