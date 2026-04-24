import { Link } from 'react-router-dom';
import { FiPackage, FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiArrowUp } from 'react-icons/fi';

const categories = ['Furniture', 'Electronics', 'Vehicles', 'Garments', 'Tools', 'Sports', 'Books', 'Others'];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand & Mission */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <FiPackage className="text-white text-xl" />
              </div>
              <span className="text-2xl font-black tracking-tighter">
                <span className="text-white">INSTA</span>
                <span className="text-indigo-500">RENTAL</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs font-medium">
              Revolutionizing the way you access products. Rent anything, anywhere, anytime with trust and ease.
            </p>
            <div className="flex gap-4">
              {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Direct Navigation */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Marketplace</h3>
            <ul className="grid grid-cols-1 gap-4">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`} className="hover:text-indigo-400 transition-colors text-sm font-bold">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Company</h3>
            <ul className="space-y-4">
              {[['/', 'Home'], ['/products', 'Browse'], ['/register', 'Register'], ['/login', 'Login']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-indigo-400 transition-colors text-sm font-bold">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Support</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-500 shrink-0">
                  <FiMail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">Email us</p>
                  <a href="mailto:support@instarental.com" className="text-white font-bold hover:text-indigo-400 transition-colors">support@instarental.com</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-500 shrink-0">
                  <FiPhone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">Call us</p>
                  <a href="tel:+917985544672" className="text-white font-bold hover:text-indigo-400 transition-colors">+91 7985544672</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-slate-600">
            © {new Date().getFullYear()} INSTARENTAL PLATFORM. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8">
            <Link to="#" className="text-xs font-black hover:text-white transition-colors">PRIVACY POLICY</Link>
            <Link to="#" className="text-xs font-black hover:text-white transition-colors">TERMS OF SERVICE</Link>
            <button 
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20"
            >
              <FiArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

