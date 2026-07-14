import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import { CheckCircle2, Package } from "lucide-react";

export default function OrderSuccess() {
  const dispatch = useDispatch();
  const location = useLocation();
  const orderId = location.state?.orderId;

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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Order Successful!</h1>
        <p className="text-slate-500 mt-2 text-sm">Thank you for your purchase.</p>

        {orderId && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5">
            <Package size={16} className="text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">Order ID: #{orderId}</span>
          </div>
        )}

        <Link
          to="/home"
          className="mt-6 inline-flex rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-200/50"
        >
          Continue Shopping
        </Link>
      </motion.div>
    </div>
  );
}