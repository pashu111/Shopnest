import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserOrders } from "../services/orderService";
import { Package, ChevronRight, Clock, Truck, CheckCircle, ShoppingBag } from "lucide-react";
import PageTransition from "../components/ui/PageTransition";
import { OrderCardSkeleton } from "../components/ui/Skeleton";

export default function OrderHistory() {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = user?.token;
        if (!token) return;
        const data = await getUserOrders(token);
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.token]);

  const getDisplayStatus = (status) => {
    if (status === "Placed") return "Processing";
    return status || "Processing";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-brand-50 text-brand-700 border-brand-200";
      case "Out for Delivery": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Packed": return "bg-accent-50 text-accent-700 border-accent-200";
      case "Cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered": return <CheckCircle className="w-4 h-4" />;
      case "Out for Delivery": return <Truck className="w-4 h-4" />;
      case "Cancelled": return <Clock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Orders</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">My Orders</h1>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-surface border border-slate-200 px-3 py-1.5 rounded-lg shadow-card">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <OrderCardSkeleton key={i} />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-surface border border-slate-200 rounded-2xl shadow-card">
              <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
                <Package size={40} className="text-brand-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1.5">No orders yet</h3>
              <p className="text-slate-500 mb-8 text-center max-w-sm">Start shopping and your orders will appear here.</p>
              <Link to="/home" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-card transition-all hover:scale-105">
                <ShoppingBag size={18} />
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                if (!order) return null;
                return (
                  <motion.div
                    key={order._id || order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link to={`/orders/${order.orderId || order._id}`} className="block bg-surface border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:border-brand-200 transition-all group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2.5">
                            <span className="text-xs font-mono text-slate-400 font-medium">
                              #{(order.orderId || order._id)?.toString().padStart(8, "0")}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {getDisplayStatus(order.status)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                            <span className="text-slate-500">
                              <span className="text-slate-400">Date:</span>{" "}
                              <span className="font-medium text-slate-700">{formatDate(order.createdAt)}</span>
                            </span>
                            <span className="text-slate-500">
                              <span className="text-slate-400">Total:</span>{" "}
                              <span className="font-semibold text-slate-900">₹{order.totalAmount}</span>
                            </span>
                            <span className="text-slate-400">{order.products?.length || 0} item{(order.products?.length || 0) !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-surface-secondary border border-slate-200 flex items-center justify-center group-hover:border-brand-200 group-hover:bg-brand-50 transition-all">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
