import { useState, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ShieldCheck, ShoppingBag, Truck, Lock, CreditCard,
  ChevronRight, CheckCircle2, AlertCircle, Loader2,
  MapPin, User, IndianRupee, ChevronLeft
} from "lucide-react";
import Swal from "sweetalert2";
import { addOrder } from "../redux/slices/orderSlice";
import { clearCart, mergeCartAsync } from "../redux/slices/cartSlice";
import { loginUser } from "../redux/slices/authSlice";
import { createOrder, createGuestOrder } from "../services/orderService";
import { resolveAssetUrl } from "../utils/assetUrl";
import { registerAPI, checkEmailExists } from "../services/authService";
import {
  createRazorpayOrder,
  verifyRazorpayPaymentAndCreateOrder,
} from "../services/paymentService";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    if (typeof navigator !== "undefined" && navigator.onLine === false) return resolve(false);
    const src = "https://checkout.razorpay.com/v1/checkout.js";
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const VALIDATORS = {
  name: (v) => {
    const val = (v || "").trim();
    if (!val) return "Full name is required";
    if (!/^[A-Za-z\s]{2,50}$/.test(val)) return "Please enter a valid name using letters only.";
    return "";
  },
  email: (v) => {
    const val = (v || "").trim();
    if (!val) return "Email is required";
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return "Please enter a valid email address.";
    return "";
  },
  phone: (v) => {
    const val = (v || "").trim();
    if (!val) return "Phone number is required";
    if (!/^\d{10}$/.test(val)) return "Please enter a valid 10-digit phone number.";
    return "";
  },
  address: (v) => {
    if (!v || !v.trim()) return "Shipping address is required";
    if (v.trim().length < 10) return "Please enter a complete address";
    return "";
  },
};

const initialFormData = { name: "", email: "", phone: "", address: "" };
const initialTouched = {};

const FormField = memo(function FormField({ label, error, touched, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
      {touched && error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1"
        >
          <AlertCircle size={11} />
          {error}
        </motion.p>
      )}
    </div>
  );
});

const steps = [
  { num: 1, icon: User, title: "Contact information" },
  { num: 2, icon: MapPin, title: "Shipping address" },
  { num: 3, icon: CreditCard, title: "Payment method" },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="hidden sm:flex items-center gap-0 bg-surface border border-slate-200 rounded-xl p-1 shadow-card">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            currentStep === s.num
              ? "bg-brand-600 text-white shadow-sm"
              : currentStep > s.num
              ? "text-brand-600"
              : "text-slate-400"
          }`}>
            <s.icon size={16} />
            <span>{s.title}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={16} className="text-slate-300 mx-1 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, subtitle, step }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      {step && (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold shrink-0 mt-0.5">
          {step}
        </span>
      )}
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-brand-600" />}
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);
  const handledPaymentIdsRef = useRef(new Set());
  const processingRef = useRef(false);

  const [formData, setFormData] = useState(() => ({
    ...initialFormData,
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone?.toString() || "",
  }));
  const [touched, setTouched] = useState(initialTouched);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);

  const DELIVERY_CHARGES = 30;
  const FREE_DELIVERY_THRESHOLD = 99;

  const subtotal = (cart || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharges = subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_CHARGES : 0;
  const total = subtotal + deliveryCharges;

  const errors = {};
  for (const field of Object.keys(VALIDATORS)) {
    const err = VALIDATORS[field](formData[field]);
    if (err) errors[field] = err;
  }
  const isValid = Object.keys(errors).length === 0;

  const updateField = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "email" && accountStatus) setAccountStatus(null);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleFocus = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const inputClass = (field) => {
    const show = touched[field];
    const hasError = errors[field];
    return `w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
      show && hasError
        ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
        : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
    }`;
  };

  const clearPersistedCart = () => {
    try {
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cart");
      sessionStorage.removeItem("cartItems");
      sessionStorage.removeItem("cart");
    } catch {}
  };

  const buildOrderPayload = useCallback(
    (paymentMethod) => {
      const items = (cart || []).map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image,
      }));
      const fullAddress = formData.address;
      return {
        products: items,
        totalAmount: total,
        deliveryCharges,
        paymentMethod,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        deliveryAddress: fullAddress,
        address: fullAddress,
        deliveryLocation: { latitude: 0, longitude: 0, fullAddress },
      };
    },
    [cart, total, deliveryCharges, formData]
  );

  const saveLocalOrderAndNavigate = async (createdOrder, paymentMethod) => {
    const orderDbId = createdOrder?._id || "";
    const orderId = createdOrder?.orderId || orderDbId || Date.now().toString();
    dispatch(
      addOrder({
        id: orderId,
        items: (cart || []).map((i) => `${i.name} x${i.quantity}`),
        total,
        paymentMethod: createdOrder?.paymentMethod || paymentMethod,
        date: new Date(createdOrder?.createdAt || Date.now()).toLocaleString(),
        status: createdOrder?.status || "Placed",
      })
    );
    dispatch(clearCart());
    clearPersistedCart();
    navigate("/order-success", { state: { orderId, orderDbId } });
  };

  const proceedToPayment = useCallback(
    async (paymentMethod, isAuthenticated) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setIsProcessing(true);
      const orderPayload = buildOrderPayload(paymentMethod);
      try {
        if (paymentMethod === "Razorpay") {
          const ok = await loadRazorpayScript();
          if (!ok) throw new Error("Razorpay checkout failed to load.");
          const razorpay = await createRazorpayOrder(Math.round(total * 100), {
            app: "shopnest",
            guest: isAuthenticated ? "false" : "true",
          });
          const keyFromApi = String(razorpay?.keyId || "").trim();
          if (!keyFromApi) throw new Error("Razorpay key not returned.");
          const razorpayOrderId = String(razorpay?.orderId || "").trim();
          if (!razorpayOrderId) throw new Error("Razorpay orderId not returned.");
          const options = {
            key: keyFromApi,
            amount: razorpay.amount,
            currency: razorpay.currency,
            name: "ShopNest",
            description: "Order Payment",
            order_id: razorpayOrderId,
            prefill: { name: formData.name, email: formData.email, contact: formData.phone },
            theme: { color: "#059669" },
            handler: async (response) => {
              try {
                const paymentId = response?.razorpay_payment_id;
                if (paymentId && handledPaymentIdsRef.current.has(paymentId)) {
                  processingRef.current = false;
                  setIsProcessing(false);
                  return;
                }
                if (paymentId) handledPaymentIdsRef.current.add(paymentId);
                const created = await verifyRazorpayPaymentAndCreateOrder(
                  {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  },
                  { ...orderPayload, customerEmail: formData.email }
                );
                await saveLocalOrderAndNavigate(created, paymentMethod);
              } catch (err) {
                const backendErrors = err?.response?.data?.errors;
                const message = Array.isArray(backendErrors) && backendErrors.length > 0
                  ? backendErrors.join(". ")
                  : err?.response?.data?.message || err?.message || "Payment could not be processed.";
                Swal.fire({ title: "Payment Failed", text: message, icon: "error", confirmButtonColor: "#059669" });
              }
              processingRef.current = false;
              setIsProcessing(false);
            },
            modal: {
              ondismiss: () => {
                processingRef.current = false;
                setIsProcessing(false);
                Swal.fire({ title: "Payment Cancelled", text: "You closed the payment window.", icon: "info", confirmButtonColor: "#059669" });
              },
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", (response) => {
            processingRef.current = false;
            setIsProcessing(false);
            Swal.fire({ title: "Payment Failed", text: response?.error?.description || "Payment could not be completed.", icon: "error", confirmButtonColor: "#059669" });
          });
          rzp.open();
          return;
        }
        if (isAuthenticated) {
          const token = localStorage.getItem("token");
          const created = await createOrder(orderPayload, token);
          await saveLocalOrderAndNavigate(created, paymentMethod);
        } else {
          const created = await createGuestOrder(orderPayload);
          await saveLocalOrderAndNavigate(created, paymentMethod);
        }
      } catch (err) {
        const backendErrors = err?.response?.data?.errors;
        const specificMessage = Array.isArray(backendErrors) && backendErrors.length > 0
          ? backendErrors.join(". ")
          : null;
        const message = err?.code === "OFFLINE"
          ? "You are offline. Please connect to the internet."
          : specificMessage || err?.response?.data?.message || err?.message || "Could not place your order.";
        Swal.fire({ title: paymentMethod === "Razorpay" ? "Payment Failed" : "Order Failed", text: message, icon: "error", confirmButtonColor: "#059669" });
        processingRef.current = false;
        setIsProcessing(false);
      }
    },
    [buildOrderPayload, cart, total, dispatch, formData, navigate]
  );

  const handlePlaceOrder = async () => {
    setTouched({ name: true, email: true, phone: true, address: true });
    if (!isValid) return;
    if (!selectedPaymentMethod) {
      await Swal.fire({ title: "Select Payment Method", text: "Please select a payment method to continue.", icon: "warning", confirmButtonColor: "#059669" });
      return;
    }
    if (!cart || cart.length === 0) {
      await Swal.fire({ title: "Cart is Empty", text: "Your cart is empty. Add items before checking out.", icon: "warning", confirmButtonColor: "#059669" });
      navigate("/cart");
      return;
    }

    if (user) {
      await proceedToPayment(selectedPaymentMethod, true);
      return;
    }

    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    const password = Math.random().toString(36).slice(2, 10) + "A1!";

    try {
      await registerAPI({ name: formData.name, email: formData.email, password, phone: formData.phone });
      const loginResult = await dispatch(loginUser({ email: formData.email, password }));
      if (!loginUser.fulfilled.match(loginResult)) {
        processingRef.current = false;
        throw new Error(loginResult.payload || "Login failed after registration");
      }
      const localItems = (() => {
        try {
          const raw = localStorage.getItem("cartItems");
          return raw ? JSON.parse(raw) : [];
        } catch { return []; }
      })();
      if (localItems.length > 0) {
        await dispatch(mergeCartAsync(localItems));
        localStorage.removeItem("cartItems");
        localStorage.removeItem("cart");
      }
      setIsProcessing(false);
      await proceedToPayment(selectedPaymentMethod, true);
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      const isDuplicate = msg.toLowerCase().includes("already exists");
      if (isDuplicate) {
        processingRef.current = false;
        setIsProcessing(false);
        await proceedToPayment(selectedPaymentMethod, false);
        return;
      }
      processingRef.current = false;
      setIsProcessing(false);
      Swal.fire({ title: "Something went wrong", text: "Please try again.", icon: "error", confirmButtonColor: "#059669" });
    }
  };

  const currentStep = !formData.name || !formData.email || !formData.phone ? 1 : !formData.address ? 2 : selectedPaymentMethod ? 3 : 3;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              Secure Checkout
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Complete your order
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-surface/80 backdrop-blur-sm border border-slate-200 px-4 py-2.5 shadow-card">
            <Lock size={15} className="text-brand-600" />
            <span className="text-xs font-semibold text-slate-600">Encrypted & Secure</span>
          </div>
        </motion.div>

        <StepIndicator currentStep={currentStep} />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] mt-6">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200 bg-surface p-5 sm:p-7 shadow-card"
            >
              <SectionHeading step={1} icon={User} title="Contact information" subtitle="We'll use this to send your order confirmation" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name *" error={errors.name} touched={touched.name}>
                  <input type="text" value={formData.name} onChange={updateField("name")} onBlur={() => handleBlur("name")} onFocus={() => handleFocus("name")} placeholder="John Doe" className={inputClass("name")} />
                </FormField>
                <FormField label="Phone Number *" error={errors.phone} touched={touched.phone}>
                  <input type="tel" value={formData.phone} onChange={updateField("phone")} onBlur={() => handleBlur("phone")} onFocus={() => handleFocus("phone")} placeholder="9876543210" inputMode="numeric" maxLength={10} className={inputClass("phone")} />
                </FormField>
                <FormField label="Email Address *" error={errors.email} touched={touched.email}>
                  <input type="email" value={formData.email} onChange={updateField("email")} onBlur={() => handleBlur("email")} onFocus={() => handleFocus("email")} placeholder="john@example.com" className={inputClass("email")} autoComplete="email" />
                </FormField>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-slate-200 bg-surface p-5 sm:p-7 shadow-card"
            >
              <SectionHeading step={2} icon={MapPin} title="Shipping address" subtitle="Where should we deliver your order?" />
              <FormField label="Address *" error={errors.address} touched={touched.address}>
                <textarea rows={3} value={formData.address} onChange={updateField("address")} onBlur={() => handleBlur("address")} onFocus={() => handleFocus("address")} placeholder="Flat / House no, Street, Area, Landmark" className={`${inputClass("address")} resize-none min-h-[88px]`} />
              </FormField>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-slate-200 bg-surface p-5 sm:p-7 shadow-card"
            >
              <SectionHeading step={3} icon={CreditCard} title="Payment method" subtitle="Choose how you'd like to pay" />
              <div className="grid gap-3 sm:grid-cols-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button" onClick={() => setSelectedPaymentMethod("Razorpay")} className={`relative rounded-xl border-2 p-4 text-left transition-all ${selectedPaymentMethod === "Razorpay" ? "border-brand-500 bg-brand-50/50 shadow-sm" : "border-slate-200 bg-surface hover:border-slate-300"}`}>
                  {selectedPaymentMethod === "Razorpay" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle2 size={18} className="text-brand-600" />
                    </motion.div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${selectedPaymentMethod === "Razorpay" ? "bg-brand-100" : "bg-surface-tertiary"}`}>
                      <CreditCard size={20} className={selectedPaymentMethod === "Razorpay" ? "text-brand-700" : "text-slate-500"} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">Razorpay</p>
                      <p className="text-xs text-slate-500 mt-0.5">Cards, UPI, Net Banking</p>
                    </div>
                  </div>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button" onClick={() => setSelectedPaymentMethod("COD")} className={`relative rounded-xl border-2 p-4 text-left transition-all ${selectedPaymentMethod === "COD" ? "border-brand-500 bg-brand-50/50 shadow-sm" : "border-slate-200 bg-surface hover:border-slate-300"}`}>
                  {selectedPaymentMethod === "COD" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle2 size={18} className="text-brand-600" />
                    </motion.div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${selectedPaymentMethod === "COD" ? "bg-brand-100" : "bg-surface-tertiary"}`}>
                      <IndianRupee size={20} className={selectedPaymentMethod === "COD" ? "text-brand-700" : "text-slate-500"} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">Cash on Delivery</p>
                      <p className="text-xs text-slate-500 mt-0.5">Pay when you receive</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-slate-200 bg-brand-50/50 p-5 sm:p-6 shadow-card"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-slate-800">Secure checkout</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Your personal data and payment information are encrypted and secure.
                    {!user && " An account will be created automatically with your email for faster future checkouts."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:sticky lg:top-8 h-fit space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-slate-200 bg-surface p-5 sm:p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Order Summary</p>
                <ShoppingBag size={18} className="text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-5">{formatMoney(total)}</h2>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                {(cart || []).slice(0, 4).map((item) => {
                  const itemTotal = item.price * (item.quantity || 1);
                  const imgSrc = resolveAssetUrl(item.image) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect fill='%23f1f5f9' width='56' height='56'/%3E%3C/svg%3E";
                  return (
                    <div key={item._id || item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-surface-tertiary overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect fill='%23f1f5f9' width='56' height='56'/%3E%3C/svg%3E"; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.quantity}x · {formatMoney(item.price)} each</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 shrink-0">{formatMoney(itemTotal)}</p>
                    </div>
                  );
                })}
                {(cart || []).length > 4 && (
                  <p className="text-xs text-slate-500 text-center pt-1 border-t border-slate-100">
                    + {cart.length - 4} more item{(cart.length - 4) !== 1 ? "s" : ""}
                  </p>
                )}
                {(cart || []).length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">Your cart is empty</p>
                )}
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Truck size={14} />
                    Delivery
                  </span>
                  <span className={`font-semibold ${deliveryCharges === 0 ? "text-brand-600" : "text-slate-800"}`}>
                    {deliveryCharges === 0 ? "Free" : formatMoney(deliveryCharges)}
                  </span>
                </div>
                {subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                    <Truck size={12} />
                    Add {formatMoney(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery
                  </p>
                )}
                <div className="border-t border-slate-100 pt-2.5 mt-2.5">
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-extrabold text-slate-900">{formatMoney(total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing || !isValid}
                className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 py-4 text-sm font-bold text-white shadow-card transition-all hover:shadow-dropdown disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {user ? "Continue to Payment" : "Continue to Payment"}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5">
                <Lock size={12} />
                Secure checkout powered by {selectedPaymentMethod === "Razorpay" ? "Razorpay" : "ShopNest"}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
