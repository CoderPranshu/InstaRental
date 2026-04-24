import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCart, removeFromCart, clearCart } from '../features/cart/cartSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FiTrash2, FiShoppingCart, FiArrowRight, FiCalendar, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import axios from '../api/axiosConfig';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    try {
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) throw new Error('Razorpay SDK failed to load');

      console.log('Creating order on server...');
      const { data } = await axios.post('/orders');
      console.log('Server order created:', data);
      
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'InstaRental',
        description: `Order Payment - ${items.length} items`,
        order_id: data.razorpayOrderId,
        theme: { color: '#2563eb' },
        handler: async (response) => {
          console.log('Razorpay response received:', response);
          try {
            await axios.put('/orders/verify', { ...response, orderId: data.orderId });
            toast.success('Payment successful! Your bookings are confirmed. 🎉');
            navigate('/profile');
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Razorpay modal dismissed');
            toast.info('Payment cancelled');
            navigate('/profile'); 
          },
        },
        prefill: {
          name: user?.name || 'InstaRental User',
          email: user?.email || '',
        },
      };

      console.log('Opening Razorpay checkout with options:', options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading && items.length === 0) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <FiShoppingCart size={24} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Your Cart</h1>
        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-sm font-bold ml-2">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center space-y-6 border border-slate-200/70 dark:border-slate-800/80">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <FiShoppingCart size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your cart is empty</h2>
            <p className="text-slate-400">Looks like you haven't added any rentals yet.</p>
          </div>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Start Browsing <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4 group border border-slate-200/70 dark:border-slate-800/80">
                <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.product?.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product?.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-blue-500 transition-colors">
                        <Link to={`/products/${item.product?._id}`}>{item.product?.title}</Link>
                      </h3>
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        <FiCalendar size={12} /> {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="badge">{item.product?.category}</span>
                    <span className="text-slate-500">{item.totalDays} days</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">₹{item.product?.pricePerDay} × {item.totalDays} days</span>
                    <span className="text-xl font-black text-blue-400">₹{item.totalAmount}</span>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => { if(window.confirm('Clear all items?')) dispatch(clearCart()) }}
              className="text-slate-500 text-sm hover:text-red-400 transition-colors px-4"
            >
              Clear Cart
            </button>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="glass rounded-3xl p-6 space-y-6 sticky top-24 border border-slate-200/70 dark:border-slate-800/80">
              <h3 className="text-slate-900 dark:text-white font-bold text-xl">Order Summary</h3>
              
              <div className="space-y-3 text-sm border-b border-slate-700/50 pb-5">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-slate-900 dark:text-white">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Service Fee</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Taxes</span>
                  <span className="text-slate-900 dark:text-white">₹0</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-900 dark:text-white font-bold">Total Amount</span>
                <span className="text-3xl font-black text-blue-400">₹{totalAmount}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={processing || items.length === 0}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
              >
                {processing ? (
                  <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <>Checkout Securely <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex flex-col items-center">
                  <FiCreditCard className="text-slate-500 mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Secure</span>
                </div>
                <div className="w-px h-8 bg-slate-300 dark:bg-slate-800" />
                <div className="text-[10px] text-slate-500">Payments powered by <strong className="text-slate-400">Razorpay</strong></div>
              </div>

              <div className="bg-blue-500/5 rounded-2xl p-4 flex gap-3 text-xs text-slate-400 border border-blue-500/10">
                <FiAlertCircle className="text-blue-500 flex-shrink-0" size={16} />
                <p>Items in cart are not reserved until checkout is completed. Availability may change.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
