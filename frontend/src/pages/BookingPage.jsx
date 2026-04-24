import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/products/productSlice';
import { createBooking } from '../features/bookings/bookingSlice';
import Loader from '../components/Loader';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { FiCalendar, FiDollarSign, FiCheckCircle, FiCreditCard, FiInfo } from 'react-icons/fi';
import { differenceInDays, addDays } from 'date-fns';
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

// ---------- Inner payment form ----------
function PaymentForm({ booking, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        throw new Error('Razorpay SDK failed to load');
      }

      const { data } = await axios.post('/bookings/payment-order', { bookingId: booking._id });
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'InstaRental',
        description: `Booking payment for #${booking._id.slice(-6)}`,
        order_id: data.orderId,
        theme: { color: '#2563eb' },
        handler: async (response) => {
          await axios.put(`/bookings/${booking._id}/pay`, response);
          toast.success('Payment successful! 🎉');
          onSuccess();
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
          },
        },
        prefill: {
          name: 'InstaRental User',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (failure) => {
        toast.error(failure?.error?.description || 'Payment failed');
      });
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="bg-slate-800/60 rounded-xl p-4 text-sm text-slate-300">
        You will be redirected to Razorpay's secure checkout to complete this payment.
      </div>
      <button type="submit" disabled={processing} className="btn-primary w-full flex items-center justify-center gap-2">
        {processing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : `Pay ₹${booking.totalAmount}`}
      </button>
      <p className="text-slate-500 text-xs text-center">Secured by Razorpay</p>
    </form>
  );
}

// ---------- Main Booking Page ----------
export default function BookingPage() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, loading } = useSelector((s) => s.products);
  const { loading: bookingLoading } = useSelector((s) => s.bookings);

  const [startDate, setStartDate] = useState(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState(addDays(new Date(), 3));
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1); // 1=dates, 2=payment, 3=done
  const [booking, setBooking] = useState(null);

  useEffect(() => { dispatch(fetchProductById(productId)); }, [productId, dispatch]);

  const totalDays = Math.max(differenceInDays(endDate, startDate), 0);
  const totalAmount = totalDays * (product?.pricePerDay || 0);

  const excludedRanges = product?.bookedDates?.map((d) => ({
    start: new Date(d.startDate), end: new Date(d.endDate),
  })) || [];

  const handleBook = async () => {
    if (totalDays < 1) return toast.error('End date must be after start date');
    const res = await dispatch(createBooking({ productId, startDate: startDate.toISOString(), endDate: endDate.toISOString(), notes }));
    if (createBooking.fulfilled.match(res)) {
      setBooking(res.payload);
      setStep(2);
    } else {
      toast.error(res.payload || 'Booking failed');
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-slate-400">Product not found</div>;

  // --- Step 3: Success Screen ---
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-3xl p-10 text-center max-w-md space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="text-green-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-white">Booking Confirmed! 🎉</h2>
          <p className="text-slate-400">Your booking for <strong className="text-white">{product.title}</strong> is placed. The owner will confirm shortly.</p>
          <div className="bg-slate-800/60 rounded-xl p-4 text-sm text-left space-y-2">
            <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-white">{totalDays} days</span></div>
            <div className="flex justify-between"><span className="text-slate-400">From</span><span className="text-white">{startDate.toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">To</span><span className="text-white">{endDate.toLocaleDateString()}</span></div>
            <div className="flex justify-between border-t border-slate-700 pt-2"><span className="text-slate-400">Total</span><span className="text-blue-400 font-bold">₹{totalAmount}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/profile')} className="btn-primary flex-1">My Bookings</button>
            <button onClick={() => navigate('/')} className="btn-secondary flex-1">Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fadeIn">
      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-8">
        <StepBadge num={1} label="Select Dates" active={step === 1} done={step > 1} />
        <div className="flex-1 h-px bg-slate-700" />
        <StepBadge num={2} label="Payment" active={step === 2} done={step > 2} />
        <div className="flex-1 h-px bg-slate-700" />
        <StepBadge num={3} label="Confirm" active={step === 3} done={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Product summary */}
        <div className="space-y-4">
          <div className="glass rounded-2xl overflow-hidden">
            <img src={product.images?.[0] || ''} alt={product.title} className="w-full h-52 object-cover" onError={(e) => e.target.style.display='none'} />
            <div className="p-5 space-y-2">
              <h2 className="text-white font-bold text-lg">{product.title}</h2>
              <span className="badge">{product.category}</span>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-2xl font-black text-blue-400">₹{product.pricePerDay}</span>
                <span className="text-slate-400 text-sm">/day</span>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-semibold">Additional Notes</h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests..." className="input-field resize-none h-24 text-sm" />
            </div>
          )}

          {step === 2 && booking && (
            <div className="glass rounded-2xl p-5 space-y-2">
              <p className="text-white font-semibold">Booking Summary</p>
              <div className="text-sm space-y-1.5 text-slate-400">
                <div className="flex justify-between"><span>Duration</span><span className="text-white">{booking.totalDays} days</span></div>
                <div className="flex justify-between"><span>Rate</span><span className="text-white">₹{product.pricePerDay}/day</span></div>
                <div className="flex justify-between border-t border-slate-700 pt-2 font-bold"><span className="text-white">Total</span><span className="text-blue-400 text-base">₹{booking.totalAmount}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Date picker or Payment */}
        <div className="space-y-4">
          {step === 1 && (
            <div className="glass rounded-2xl p-6 space-y-5">
              <h3 className="text-white font-semibold flex items-center gap-2"><FiCalendar /> Select Dates</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(d) => { setStartDate(d); if (d >= endDate) setEndDate(addDays(d, 1)); }}
                    minDate={addDays(new Date(), 1)}
                    excludeDateIntervals={excludedRanges}
                    className="input-field text-sm w-full"
                    dateFormat="dd MMM yyyy"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(d) => setEndDate(d)}
                    minDate={addDays(startDate, 1)}
                    excludeDateIntervals={excludedRanges}
                    className="input-field text-sm w-full"
                    dateFormat="dd MMM yyyy"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-800/60 rounded-xl p-4 space-y-2">
                <h4 className="text-slate-300 font-medium text-sm flex items-center gap-1"><FiDollarSign size={14} /> Price Breakdown</h4>
                <div className="space-y-1.5 text-sm text-slate-400">
                  <div className="flex justify-between"><span>₹{product.pricePerDay} × {totalDays} days</span><span>₹{totalAmount}</span></div>
                  <div className="flex justify-between"><span>Service fee</span><span>₹0</span></div>
                  <div className="border-t border-slate-600 pt-2 flex justify-between font-bold">
                    <span className="text-white">Total</span><span className="text-blue-400 text-lg">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <button onClick={handleBook} disabled={bookingLoading || totalDays < 1} className="btn-primary w-full flex items-center justify-center gap-2">
                {bookingLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</> : `Continue to Payment →`}
              </button>
              <div className="flex items-start gap-2 text-slate-500 text-xs">
                <FiInfo className="flex-shrink-0 mt-0.5" />
                <p>You will complete payment securely on Razorpay in the next step.</p>
              </div>
            </div>
          )}

          {step === 2 && booking && (
            <div className="glass rounded-2xl p-6 space-y-5">
              <h3 className="text-white font-semibold flex items-center gap-2"><FiCreditCard /> Secure Payment</h3>
              <PaymentForm booking={booking} onSuccess={() => setStep(3)} />
              <button onClick={() => setStep(1)} className="text-slate-400 text-sm hover:text-white transition-colors w-full text-center">← Back to dates</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBadge({ num, label, active, done }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
        {done ? '✓' : num}
      </div>
      <span className={`text-sm hidden sm:block ${active ? 'text-white font-semibold' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}
