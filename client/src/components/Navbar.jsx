import { useState, useEffect, memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Coins, Heart, Search, LogOut, Package, ChevronDown } from "lucide-react";
import logo from "../assets/ShopNest.png";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const navCategories = [];

const NavIconLink = memo(function NavIconLink({ to, icon: Icon, count, countClass = "bg-brand-600", label }) {
  return (
    <Link
      to={to}
      className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors group"
      title={label}
    >
      <Icon size={19} className="text-slate-600 group-hover:text-brand-600 transition-colors" />
      {count > 0 && (
        <span className={`absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full ring-2 ring-white ${countClass}`}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
});

export default memo(function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const rewardCoins = useSelector((state) => state.reward.coins);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    if (rewardCoins > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [rewardCoins]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenuOpen]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/home");
    setMobileOpen(false);
  }, [dispatch, navigate]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]"
          : "bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/home" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-md group-hover:bg-brand-500/30 transition-all" />
              <img src={logo} alt="ShopNest" className="relative h-8 w-auto" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-extrabold text-brand-700 leading-none block tracking-tight">ShopNest</span>
              <span className="text-[10px] font-semibold text-brand-500 tracking-widest uppercase">Fresh & Fast</span>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className={`relative w-full transition-all duration-200 ${searchFocused ? "scale-[1.01]" : ""}`}>
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-brand-700 transition-colors px-3 py-2 rounded-xl hover:bg-brand-50"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden lg:inline max-w-24 truncate">{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-dropdown border border-slate-200 py-1.5 z-50"
                    >
                      <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <User size={15} /> Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Package size={15} /> My Orders
                      </Link>
                      <hr className="my-1 border-slate-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors px-5 py-2 rounded-xl shadow-sm"
              >
                <User size={16} />
                <span>Sign In</span>
              </Link>
            )}
            <NavIconLink to="/wishlist" icon={Heart} count={wishlistCount} label="Wishlist" />
            <Link
              to="/rewards"
              className={`flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200 hover:bg-amber-100 transition-all ${
                animate ? "animate-pulse ring-2 ring-amber-400" : ""
              }`}
            >
              <Coins size={15} className="text-amber-600" />
              <span>{rewardCoins}</span>
            </Link>
            <NavIconLink to="/cart" icon={ShoppingCart} count={cartCount} countClass="bg-brand-600" label="Cart" />
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>


      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden shadow-xl"
          >
            <div className="px-4 py-4 space-y-1">
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {user ? (
                <>
                  <MobileNavLink to="/profile" icon={User} label={user.name || "Profile"} onClick={() => setMobileOpen(false)} />
                  <MobileNavLink to="/orders" icon={Package} label="My Orders" onClick={() => setMobileOpen(false)} />
                  <button onClick={handleLogout} className="w-full text-left py-2.5 text-sm font-medium text-rose-600 flex items-center gap-3 rounded-lg hover:bg-rose-50 px-3 -mx-3 transition-colors">
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <MobileNavLink to="/login" icon={User} label="Sign In" className="text-brand-700 font-semibold" onClick={() => setMobileOpen(false)} />
              )}

              <hr className="my-2 border-slate-100" />
              <MobileNavLink to="/wishlist" icon={Heart} label="Wishlist" count={wishlistCount} onClick={() => setMobileOpen(false)} />
              <MobileNavLink to="/rewards" icon={Coins} label={`Rewards (${rewardCoins} coins)`} className="text-amber-700" onClick={() => setMobileOpen(false)} />
              <MobileNavLink to="/cart" icon={ShoppingCart} label="Cart" count={cartCount} onClick={() => setMobileOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

function MobileNavLink({ to, icon: Icon, label, count, className = "text-slate-700", onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between py-2.5 text-sm font-medium rounded-lg px-3 -mx-3 hover:bg-slate-50 transition-colors ${className}`}
    >
      <span className="flex items-center gap-3">
        {Icon && <Icon size={18} />} {label}
      </span>
      {count > 0 && (
        <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
      )}
    </Link>
  );
}
