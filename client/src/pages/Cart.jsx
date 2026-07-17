import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Minus, Plus, Sparkles, TicketPercent, Trash2, Image as ImageIcon, ShoppingBag, ArrowLeft, Truck, Lock } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "../redux/slices/cartSlice";
import { getUserOrders } from "../services/orderService";
import { applyCoupon as applyCouponRedux, removeCoupon as removeCouponRedux } from "../redux/slices/couponSlice";
import { resolveAssetUrl } from "../utils/assetUrl";
import EmptyState from "../components/ui/EmptyState";

const CartImage = memo(function CartImage({ item }) {
  const [error, setError] = useState(false);
  if (error || !item.image) {
    return (
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-surface-tertiary rounded-lg text-slate-400">
        <ImageIcon size={28} />
      </div>
    );
  }
  return (
    <img
      src={resolveAssetUrl(item.image)}
      alt={item.name}
      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
});

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const CartItemRow = memo(function CartItemRow({ item, dispatch }) {
  const productId = item._id || item.id;
  const isOutOfStock = Number(item.stock) <= 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, transition: { duration: 0.25 } }}
      className={`bg-surface border rounded-xl p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-shadow ${isOutOfStock ? "border-rose-300 bg-rose-50/30" : "border-slate-200"}`}
    >
      {isOutOfStock && (
        <div className="mb-3 inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
          Out of Stock — please remove this item
        </div>
      )}
      <div className="flex items-center gap-4">
        <CartImage item={item} />
        <div className="flex-1 min-w-0">
          <h2 className={`font-semibold text-lg truncate ${isOutOfStock ? "text-slate-400" : "text-slate-900"}`}>{item.name}</h2>
          <p className="font-extrabold mt-0.5">{formatMoney(item.price)}</p>
          {!isOutOfStock && (
            <div className="mt-3 inline-flex items-center gap-3 bg-surface-secondary border border-slate-200 rounded-full px-2 py-1">
              <button
                type="button"
                aria-label={`Decrease ${item.name} quantity`}
                onClick={() => dispatch(decreaseQuantity(productId))}
                className="w-8 h-8 rounded-full bg-surface border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${item.name} quantity`}
                onClick={() => dispatch(increaseQuantity(productId))}
                className="w-8 h-8 rounded-full bg-surface border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className={`font-extrabold text-lg ${isOutOfStock ? "text-slate-400" : "text-slate-900"}`}>{formatMoney(item.price * item.quantity)}</p>
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
});

const CouponSection = memo(function CouponSection({ subtotal, discount, appliedCoupon, coupon, setCoupon, applyCoupon, removeCoupon, applyCouponCode, couponDeals, isFirstOrder }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-brand-200/60 bg-gradient-to-br from-brand-50 via-surface to-amber-50 p-5 shadow-card">
      <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-brand-200/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
            <Sparkles size={12} />
            Exclusive Offers
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">Apply a coupon and save more</h3>
          <p className="mt-1 text-xs text-slate-600">Tap a coupon card to apply instantly.</p>
        </div>
      </div>

      <div className="relative mt-4">
        {appliedCoupon ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-300 bg-brand-50 px-3 py-2.5">
            <span className="inline-flex items-center gap-2 text-brand-800 text-sm font-semibold">
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
              <TicketPercent size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-600" />
              <input
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="border border-brand-200 bg-white/90 pl-9 pr-3 py-2.5 rounded-xl w-full text-sm font-semibold tracking-wide uppercase placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              />
            </div>
            <button
              type="button"
              onClick={applyCoupon}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-card"
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
                ? "border-brand-400 bg-brand-100/80"
                : "border-slate-200 bg-white/85 hover:border-brand-300 hover:bg-brand-50/70"
            }`}
          >
            <p className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
              <TicketPercent size={14} className="text-brand-600" />
              {deal.code}
            </p>
            <p className="mt-1 text-xs text-slate-600">{deal.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
});

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
    { code: "SAVE10", description: "10% off above ₹500" },
    { code: "SAVE20", description: "20% off above ₹1000" },
    { code: "FLAT50", description: "₹50 off above ₹1500" },
    { code: "WELCOME", description: "15% off for first order" },
    { code: "MEGA30", description: "30% off above ₹2500" },
    { code: "PICK50", description: "₹50 off above ₹800" },
    { code: "SNACK15", description: "15% off above ₹600" },
    { code: "FRESH20", description: "₹20 off above ₹400" },
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
      const messages = {
        SAVE10: "Minimum order ₹500 required for SAVE10",
        SAVE20: "Minimum order ₹1000 required for SAVE20",
        FLAT50: "Minimum order ₹1500 required for FLAT50",
        WELCOME: "WELCOME coupon only valid for first order",
        MEGA30: "Minimum order ₹2500 required for MEGA30",
        PICK50: "Minimum order ₹800 required for PICK50",
        SNACK15: "Minimum order ₹600 required for SNACK15",
        FRESH20: "Minimum order ₹400 required for FRESH20",
      };
      alert(messages[code] || "Invalid Coupon Code");
      return;
    }
    dispatch(applyCouponRedux({ code, subtotal, isFirstOrder }));
  };

  const applyCoupon = () => applyCouponCode(coupon);
  const removeCoupon = () => { setCoupon(""); dispatch(removeCouponRedux()); };
  const total = subtotal - discount + deliveryCharges;
  const hasOutOfStockItems = (cart || []).some((item) => Number(item.stock) <= 0);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Secure Cart</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Shopping Cart</h1>
            <p className="text-slate-500 mt-1">{cart.length} item{cart.length !== 1 ? "s" : ""} in your bag</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock size={12} />
            Prices and delivery may vary
          </div>
        </div>

        {(cart || []).length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet. Explore our fresh collection and find something you love."
            action={
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold shadow-card transition-all hover:scale-105"
              >
                <ArrowLeft size={18} />
                Continue Shopping
              </button>
            }
          />
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <CartItemRow key={item._id || item.id} item={item} dispatch={dispatch} />
                ))}
              </AnimatePresence>

              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 text-brand-700 font-semibold text-sm hover:text-brand-800 transition-colors"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-card h-fit lg:sticky lg:top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="flex justify-between mb-2 text-slate-700">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-brand-600">
                    <span>Discount</span>
                    <span>-{formatMoney(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} className="text-slate-400" />
                    Shipping
                  </span>
                  <span className={deliveryCharges === 0 ? "text-brand-600 font-semibold" : "text-slate-700"}>
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

                {hasOutOfStockItems && (
                  <div className="mt-4 bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 font-medium">
                    Remove out-of-stock items to proceed to checkout.
                  </div>
                )}
                <button
                  onClick={() => navigate("/checkout")}
                  disabled={hasOutOfStockItems}
                  className="w-full mt-4 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold shadow-card transition-all hover:scale-[1.02] active:scale-[0.98]"
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
