import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../redux/slices/authSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { mergeGuestDataAPI } from "../services/authService";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

function validateIdentifier(val) {
  if (!val) return "";
  if (GMAIL_REGEX.test(val) || MOBILE_REGEX.test(val)) return "";
  return "Enter a valid Gmail address or 10-digit mobile number.";
}

function validatePassword(val) {
  if (!val) return "Password cannot be empty.";
  return "";
}

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error: serverError } = useSelector((state) => state.auth);

  const errors = useMemo(() => {
    const e = {};
    const ie = validateIdentifier(identifier);
    if (ie) e.identifier = ie;
    const pe = validatePassword(password);
    if (pe) e.password = pe;
    return e;
  }, [identifier, password]);

  const isClientValid = Object.keys(errors).length === 0;
  const canSubmit = identifier.trim() !== "" && password !== "";

  useEffect(() => {
    if (location.state?.email) setIdentifier(location.state.email);
  }, [location.state]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    if (serverError) dispatch(clearError());
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (serverError) dispatch(clearError());
  };

  const inputClass = (field, hasError) => {
    const showErr = (touched[field] || submitted) && hasError;
    return `w-full border py-2.5 rounded-xl focus:ring-2 outline-none transition pl-10 ${
      showErr ? "border-rose-400 focus:ring-rose-400/30" : "border-slate-200 focus:ring-brand-500/30"
    }`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isClientValid) return;
    dispatch(loginUser({ identifier, password, isAdmin: false })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        const userEmail = res.payload?.email;
        if (userEmail) {
          mergeGuestDataAPI(userEmail).catch(() => {});
        }
        navigate("/home");
      }
    });
  };

  const isAccountNotFound = serverError === "Account not found. Please register first.";
  const isPasswordWrong = serverError === "Invalid password. Please try again.";
  const isGeneralServerError = serverError && !isAccountNotFound && !isPasswordWrong;

  return (
    <div className="min-h-screen bg-surface">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
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
                Fresh groceries,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-teal-300 mt-2">
                  delivered with care.
                </span>
              </h1>
              <p className="mt-4 text-white/70 max-w-md leading-relaxed text-base">
                Access exclusive deals, manage orders, and track deliveries from
                one premium dashboard.
              </p>
              <div className="mt-10 flex gap-5">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-2xl font-bold">5K+</p>
                  <p className="text-xs text-white/60 mt-0.5">Products</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-2xl font-bold">30 min</p>
                  <p className="text-xs text-white/60 mt-0.5">Delivery</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-2xl font-bold">4.8★</p>
                  <p className="text-xs text-white/60 mt-0.5">Rating</p>
                </div>
              </div>
            </motion.div>
            <div className="text-sm text-white/40">
              Secure checkout &bull; Fresh picks &bull; Eco-friendly
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
                    Welcome back
                  </h1>
                  <p className="text-sm text-white/70 mt-0.5">Sign in to continue shopping</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-slate-200 rounded-2xl p-7 sm:p-9 shadow-card">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 mt-1.5 text-sm">Sign in to continue shopping</p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email or Mobile
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Email or Mobile Number"
                      className={inputClass("identifier", errors.identifier)}
                      value={identifier}
                      onChange={handleIdentifierChange}
                      onBlur={() => handleBlur("identifier")}
                    />
                  </div>
                  {(touched.identifier || submitted) && errors.identifier && (
                    <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.identifier}
                    </p>
                  )}
                  {isAccountNotFound && (
                    <p className="text-rose-500 text-xs mt-1.5">
                      {serverError}{" "}
                      <Link to="/register" className="font-semibold underline hover:text-rose-700">
                        Register Now
                      </Link>
                    </p>
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
                      className={inputClass("password", errors.password)}
                      value={password}
                      onChange={handlePasswordChange}
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
                    <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.password}
                    </p>
                  )}
                  {isPasswordWrong && (
                    <p className="text-rose-500 text-xs mt-1.5">{serverError}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    state={identifier ? { identifier } : undefined}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 shadow-card bg-brand-600 hover:bg-brand-700 active:scale-[0.98]"
                  disabled={!canSubmit || loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {isGeneralServerError && (
                  <p className="text-rose-600 text-xs mt-4 text-center font-semibold bg-rose-50 p-3 rounded-xl flex items-center justify-center gap-2">
                    <AlertCircle size={14} /> {serverError}
                  </p>
                )}
              </form>

              <p className="text-sm mt-7 text-center text-slate-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
