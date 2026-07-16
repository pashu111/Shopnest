import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import ScratchCard from "../components/ScratchCard";
import { clearCart } from "../redux/slices/cartSlice";
import { Package, ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import PageTransition from "../components/ui/PageTransition";

export default function Confirmation() {
  const { width, height } = useWindowSize();
  const location = useLocation();
  const { name, phone, address, deliveryLocation, paymentMethod, rewardEligible, orderId, orderDbId } = location.state || {};
  const fullAddress = deliveryLocation?.fullAddress || address || "";
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const token = user?.token || null;
  const isLoggedIn = typeof token === "string" && token.split(".").length === 3;

  useEffect(() => {
    if (!orderId && !orderDbId) return;
    dispatch(clearCart());
    try {
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cart");
      sessionStorage.removeItem("cartItems");
      sessionStorage.removeItem("cart");
    } catch {}
  }, [dispatch, orderDbId, orderId]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-teal-50 relative overflow-hidden">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={280} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-surface border border-slate-200 rounded-2xl p-7 sm:p-9 shadow-card"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Order Confirmed</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1.5 tracking-tight">Thank you for your purchase!</h1>
                <p className="text-slate-500 mt-2">Your order is now being processed. We'll notify you when it ships.</p>
              </div>
              <div className="shrink-0 bg-brand-50 border border-brand-200 rounded-xl px-5 py-3.5 text-center">
                <p className="text-xs text-brand-600 font-semibold">Order ID</p>
                <p className="font-bold text-brand-900 mt-0.5">{orderId || "\u2014"}</p>
              </div>
            </div>

            <div className="mt-7 grid sm:grid-cols-3 gap-4">
              <div className="bg-surface-secondary border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Delivery To</p>
                <p className="font-semibold text-slate-900 mt-1.5">{name}</p>
                <p className="text-sm text-slate-500 mt-0.5">{phone}</p>
              </div>
              <div className="bg-surface-secondary border border-slate-200 rounded-xl p-4 sm:col-span-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Address</p>
                <p className="text-sm text-slate-700 mt-1.5">{fullAddress}</p>
                {deliveryLocation?.latitude && deliveryLocation?.longitude && (
                  <p className="mt-2 text-xs text-slate-400 font-mono">{Number(deliveryLocation.latitude).toFixed(5)}, {Number(deliveryLocation.longitude).toFixed(5)}</p>
                )}
              </div>
            </div>

            <div className="mt-4 sm:w-1/2">
              <div className="bg-surface-secondary border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Payment Method</p>
                <p className="font-semibold text-slate-900 mt-1.5">{paymentMethod || "N/A"}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={`/orders/${orderId || orderDbId}`} className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-card">
                <Package size={16} />
                Track Order
              </Link>
              <Link to="/home" className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-card">
                <ShoppingBag size={16} />
                Continue Shopping <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {rewardEligible && isLoggedIn && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-8">
              <div className="bg-gradient-to-br from-accent-50 via-surface to-orange-50 border border-accent-200 rounded-2xl p-7 sm:p-9 shadow-card">
                <div className="text-center mb-1">
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-100 px-3 py-1 rounded-lg">Bonus Reward</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 text-center mt-4">Scratch to Reveal Your Reward</h2>
                <p className="text-sm text-slate-500 text-center mt-1">You earned a scratch card for this order!</p>
                <div className="mt-6 flex justify-center">
                  <ScratchCard orderId={orderDbId || orderId} />
                </div>
              </div>
            </motion.div>
          )}

          {rewardEligible && !isLoggedIn && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-8">
              <div className="bg-accent-50 border border-accent-200 rounded-2xl p-7 shadow-card">
                <h2 className="text-xl font-bold text-accent-800 mb-2">Log in to claim your reward</h2>
                <p className="text-slate-600 mb-5">Rewards are saved to your account after you scratch.</p>
                <Link to="/login" className="inline-block bg-accent-600 hover:bg-accent-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-card">Go to Login</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
