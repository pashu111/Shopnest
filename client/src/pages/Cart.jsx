import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Minus, Plus, Sparkles, TicketPercent, Trash2, Image as ImageIcon, ShoppingBag, ArrowLeft, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "../redux/slices/cartSlice";
import { getUserOrders } from "../services/orderService";
import { applyCoupon as applyCouponRedux, removeCoupon as removeCouponRedux } from "../redux/slices/couponSlice";
import { resolveAssetUrl } from "../utils/assetUrl";

function CartImage({ item }) {
  const [error, setError] = useState(false);
  if (error || !item.image) {
    return (
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
        <ImageIcon size={28} />
      </div>
    );
  }
  return (
    <img
      src={resolveAssetUrl(item.image)}
      alt={item.name}
      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
      onError={() => setError(true)}
    />
  );
}

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

function EmptyCart() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <ShoppingBag size={48} className="text-emerald-300" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
      <p className="text-slate-500 mb-8 text-center max-w-sm">
        Looks like you haven&apos;t added anything yet. Explore our fresh collection and find something you love.
      </p>
      <button
        type="button"
        onClick={() => navigate("/home")}
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200/60 transition-all hover:scale-105"
      >
        <ArrowLeft size={18} />
        Continue Shopping
      </button>
    </motion.div>
  );
}

function CartItemRow({ item, dispatch }) {
  const productId = item._id || item.id;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <CartImage item={item} />

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg text-slate-900 truncate">{item.name}</h2>
          <p className="text-slate-500 text-sm">{formatMoney(item.price)} per item</p>

          <div className="mt-3 inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-2 py-1">
            <button
              type="button"
              aria-label={`Decrease ${item.name} quantity`}
              onClick={() => dispatch(decreaseQuantity(productId))}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
            <button
              type="button"
              aria-label={`Increase ${item.name} quantity`}
              onClick={() => dispatch(increaseQuantity(productId))}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-bold text-lg text-slate-900">{formatMoney(item.price * item.quantity)}</p>
          <button
            type="button"
            onClick={() => dispatch(removeFromCart(productId))}
            className="mt-2 inline-flex items-center gap-1.5 text-rose-500 text-sm font-semibold hover:text-rose-700 transition-colors"
          >
            <Trash2 size={15} />
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CouponSection({ subtotal, discount, appliedCoupon, coupon, setCoupon, applyCoupon, removeCoupon, applyCouponCode, couponDeals, isFirstOrder }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-sm">
      <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-emerald-200/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            <Sparkles size={12} />
            Exclusive Offers
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">Apply a coupon and save more</h3>
          <p className="mt-1 text-xs text-slate-600">Tap a coupon card to apply instantly.</p>
        </div>
      </div>

      <div className="relative mt-4">
        {appliedCoupon ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5">
            <span className="inline-flex items-center gap-2 text-emerald-800 text-sm font-semibold">
              <CheckCircle2 size={16} />
              Coupon Applied: {appliedCoupon}
            </span>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-rose-600 text-sm font-semibold hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full">
              <TicketPercent size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
              <input
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="border border-emerald-200 bg-white/90 pl-9 pr-3 py-2.5 rounded-xl w-full text-sm font-semibold tracking-wide uppercase placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>
            <button
              type="button"
              onClick={applyCoupon}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-slate-900/15"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {couponDeals.map((deal) => (
          <button
            key={deal.code}
            type="button"
            onClick={() => applyCouponCode(deal.code)}
            className={`group rounded-xl border px-3 py-2.5 text-left transition ${
              appliedCoupon === deal.code
                ? "border-emerald-400 bg-emerald-100/80"
                : "border-slate-200 bg-white/85 hover:border-emerald-300 hover:bg-emerald-50/70"
            }`}
          >
            <p className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
              <TicketPercent size={14} className="text-emerald-600" />
              {deal.code}
            </p>
            <p className="mt-1 text-xs text-slate-600">{deal.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Cart() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const orders = useSelector((state) => state.orders.list);
  const { user } = useSelector((state) => state.auth);
  const { code: appliedCoupon, discount } = useSelector(
    (state) => state.coupon || { code: null, discount: 0 }
  );
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [hasExistingOrders, setHasExistingOrders] = useState(false);

  const DELIVERY_CHARGES = 30;
  const FREE_DELIVERY_THRESHOLD = 99;

  const subtotal = (cart || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharges = subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_CHARGES : 0;
  const isFirstOrder = (orders || []).length === 0 && !hasExistingOrders;

  useEffect(() => {
    const token = user?.token;
    if (token) {
      const fetchOrders = async () => {
        try {
          const data = await getUserOrders(token);
          if (Array.isArray(data) && data.length > 0) setHasExistingOrders(true);
        } catch {}
      };
      fetchOrders();
    }
  }, [user?.token]);

  const couponDeals = [
    { code: "SAVE10", description: "10% off above \u20b9500" },
    { code: "SAVE20", description: "20% off above \u20b91000" },
    { code: "FLAT50", description: "\u20b950 off above \u20b91500" },
    { code: "WELCOME", description: "15% off for first order" },
    { code: "MEGA30", description: "30% off above \u20b92500" },
    { code: "PICK50", description: "\u20b950 off above \u20b9800" },
    { code: "SNACK15", description: "15% off above \u20b9600" },
    { code: "FRESH20", description: "\u20b920 off above \u20b9400" },
  ];

  const getCouponDiscount = (code, amount) => {
    const normalizedCode = (code || "").trim().toUpperCase();
    if (normalizedCode === "SAVE10") return amount >= 500 ? amount * 0.1 : 0;
    if (normalizedCode === "SAVE20") return amount >= 1000 ? amount * 0.2 : 0;
    if (normalizedCode === "FLAT50") return amount >= 1500 ? 50 : 0;
    if (normalizedCode === "WELCOME") return isFirstOrder ? amount * 0.15 : 0;
    if (normalizedCode === "MEGA30") return amount >= 2500 ? amount * 0.3 : 0;
    if (normalizedCode === "PICK50") return amount >= 800 ? 50 : 0;
    if (normalizedCode === "SNACK15") return amount >= 600 ? amount * 0.15 : 0;
    if (normalizedCode === "FRESH20") return amount >= 400 ? 20 : 0;
    return 0;
  };

  const applyCouponCode = (rawCode) => {
    const code = (rawCode || "").trim().toUpperCase();
    if (!code) return;
    const computedDiscount = getCouponDiscount(code, subtotal);
    if (computedDiscount <= 0) {
      if (code === "SAVE10") alert("Minimum order \u20b9500 required for SAVE10");
      else if (code === "SAVE20") alert("Minimum order \u20b91000 required for SAVE20");
      else if (code === "FLAT50") alert("Minimum order \u20b91500 required for FLAT50");
      else if (code === "WELCOME") alert("WELCOME coupon only valid for first order");
      else if (code === "MEGA30") alert("Minimum order \u20b92500 required for MEGA30");
      else if (code === "PICK50") alert("Minimum order \u20b9800 required for PICK50");
      else if (code === "SNACK15") alert("Minimum order \u20b9600 required for SNACK15");
      else if (code === "FRESH20") alert("Minimum order \u20b9400 required for FRESH20");
      else alert("Invalid Coupon Code");
      return;
    }
    dispatch(applyCouponRedux({ code, subtotal, isFirstOrder }));
  };

  const applyCoupon = () => applyCouponCode(coupon);
  const removeCoupon = () => { setCoupon(""); dispatch(removeCouponRedux()); };
  const total = subtotal - discount + deliveryCharges;

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Secure Cart</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Shopping Cart</h1>
            <p className="text-slate-500 mt-1">{cart.length} item{cart.length !== 1 ? "s" : ""} in your bag</p>
          </div>
        </div>

        {(cart || []).length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <CartItemRow key={item._id || item.id} item={item} dispatch={dispatch} />
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 text-emerald-700 font-semibold text-sm hover:text-emerald-800 transition-colors"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit sticky top-20">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="flex justify-between mb-2 text-slate-700">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatMoney(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} className="text-slate-400" />
                    Shipping
                  </span>
                  <span className={deliveryCharges === 0 ? "text-emerald-600 font-semibold" : "text-slate-700"}>
                    {deliveryCharges === 0 ? "Free" : formatMoney(deliveryCharges)}
                  </span>
                </div>

                {subtotal < FREE_DELIVERY_THRESHOLD && cart.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                    <p className="text-xs text-amber-800">
                      Add <strong>{formatMoney(FREE_DELIVERY_THRESHOLD - subtotal)}</strong> more for FREE delivery!
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200 my-4" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200/60 transition-all hover:scale-[1.02]"
                >
                  Proceed to Checkout
                </button>
              </div>

              <CouponSection
                subtotal={subtotal}
                discount={discount}
                appliedCoupon={appliedCoupon}
                coupon={coupon}
                setCoupon={setCoupon}
                applyCoupon={applyCoupon}
                removeCoupon={removeCoupon}
                applyCouponCode={applyCouponCode}
                couponDeals={couponDeals}
                isFirstOrder={isFirstOrder}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}