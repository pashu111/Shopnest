import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react";
import PageTransition from "../components/ui/PageTransition";

export default function OrderSuccess() {
  const dispatch = useDispatch();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const orderDbId = location.state?.orderDbId;

  useEffect(() => {
    dispatch(clearCart());
    try {
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cart");
      sessionStorage.removeItem("cartItems");
      sessionStorage.removeItem("cart");
    } catch {}
  }, [dispatch]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-teal-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="bg-surface p-9 sm:p-12 rounded-2xl shadow-modal border border-slate-200 text-center max-w-md w-full"
        >
          <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center mb-7 shadow-inner">
            <CheckCircle2 size={52} className="text-brand-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Order Successful!</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">Thank you for your purchase. Your order is being processed.</p>

          {orderId && (
            <div className="mt-7 inline-flex items-center gap-2.5 rounded-xl bg-surface-secondary border border-slate-200 px-5 py-3 shadow-card">
              <Package size={16} className="text-brand-600" />
              <span className="text-sm font-semibold text-slate-700">Order ID: #{orderId}</span>
            </div>
          )}

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/orders/${orderDbId || orderId}`}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-card"
            >
              <Package size={16} />
              Track Order
            </Link>
            <Link
              to="/home"
              className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-card"
            >
              <ShoppingBag size={16} />
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
