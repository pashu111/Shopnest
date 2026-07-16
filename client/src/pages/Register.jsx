import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

const NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

function validateName(val) {
  const v = val.trim();
  if (!v || v.length < 2 || v.length > 50 || !NAME_REGEX.test(v))
    return "Full Name can contain only letters and spaces.";
  return "";
}

function validatePhone(val) {
  if (!val || !PHONE_REGEX.test(val))
    return "Phone Number must be exactly 10 digits.";
  return "";
}

function validateEmail(val) {
  if (!val || !EMAIL_REGEX.test(val))
    return "Only Gmail addresses are allowed.";
  return "";
}

function validatePassword(val) {
  if (!val || val.length < 8)
    return "Password must be at least 8 characters long.";
  return "";
}

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const errors = useMemo(() => {
    const e = {};
    const ne = validateName(name);
    if (ne) e.name = ne;
    const pe = validatePhone(phone);
    if (pe) e.phone = pe;
    const ee = validateEmail(email);
    if (ee) e.email = ee;
    const pwe = validatePassword(password);
    if (pwe) e.password = pwe;
    return e;
  }, [name, phone, email, password]);

  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const inputClass = (field) => {
    const show = touched[field] || submitted;
    const hasErr = show && errors[field];
    return `w-full border py-2.5 rounded-xl focus:ring-2 outline-none transition pl-10 ${
      hasErr ? "border-rose-400 focus:ring-rose-400/30" : "border-slate-200 focus:ring-brand-500/30"
    }`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    dispatch(registerUser({ name: name.trim(), phone, email, password })).then(
      (res) => {
        if (res.meta.requestStatus === "fulfilled") {
          navigate("/login");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/50 to-brand-900/65" />
          <div className="relative z-10 p-14 h-full flex flex-col justify-between text-white">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold uppercase tracking-[0.2em]"
            >
              <span className="text-brand-400">ShopNest</span> Select
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-lg"
            >
              <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
                Create your account.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-teal-300 mt-2">
                  Start saving today.
                </span>
              </h1>
              <p className="mt-4 text-white/70 max-w-md leading-relaxed text-base">
                Fast checkout, exclusive offers, and delivery tracking in one
                place.
              </p>
              <div className="mt-10 flex gap-5">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-2xl font-bold text-brand-300">Secure</p>
                  <p className="text-xs text-white/60 mt-0.5">Payments</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-2xl font-bold text-brand-300">Fresh</p>
                  <p className="text-xs text-white/60 mt-0.5">Picks</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-2xl font-bold text-brand-300">4.8★</p>
                  <p className="text-xs text-white/60 mt-0.5">Rating</p>
                </div>
              </div>
            </motion.div>
            <div className="text-sm text-white/40">
              Secure payments &bull; Fresh picks &bull; 4.8★ rating
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 sm:px-8 py-10 bg-surface-secondary">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-card">
              <div className="relative h-44 bg-gradient-to-br from-brand-700 to-teal-600">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-brand-900/40" />
                <div className="relative z-10 p-6 text-white h-full flex flex-col justify-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
                    ShopNest Select
                  </p>
                  <h1 className="text-2xl font-extrabold mt-1">
                    Create your account
                  </h1>
                  <p className="text-sm text-white/70 mt-0.5">Start shopping premium groceries today</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-slate-200 rounded-2xl p-7 sm:p-9 shadow-card">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Join ShopNest today
              </h2>
              <p className="text-slate-500 mt-1.5 text-sm">
                Start shopping premium groceries today.
              </p>

              {error && (
                <p className="text-rose-600 text-xs mt-4 text-center font-semibold bg-rose-50 p-3 rounded-xl flex items-center justify-center gap-2">
                  <AlertCircle size={14} /> {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={inputClass("name")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur("name")}
                    />
                  </div>
                  {(touched.name || submitted) && errors.name && (
                    <p className="text-rose-500 text-xs mt-1.5">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className={inputClass("phone")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      maxLength={10}
                    />
                  </div>
                  {(touched.phone || submitted) && errors.phone && (
                    <p className="text-rose-500 text-xs mt-1.5">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className={inputClass("email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                    />
                  </div>
                  {(touched.email || submitted) && errors.email && (
                    <p className="text-rose-500 text-xs mt-1.5">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={inputClass("password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {(touched.password || submitted) && errors.password && (
                    <p className="text-rose-500 text-xs mt-1.5">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-card active:scale-[0.98]"
                  disabled={!isValid || loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="text-sm mt-7 text-center text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
