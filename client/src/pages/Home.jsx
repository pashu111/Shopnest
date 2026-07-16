import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchProducts, addProduct,
} from "../redux/slices/productSlice";
import { useWebSocket } from "../context/WebSocketContext";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import {
  Apple, Carrot, Wheat, Bean, Flame, Droplet,
  Milk, Cookie, Home as HomeIcon, User, Drumstick, Heart,
  ShoppingBag, ArrowRight, Star, Truck, ShieldCheck,
  RotateCcw, HeadphonesIcon, ChevronLeft, ChevronRight,
  Sparkles, TrendingUp, Package,
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  "fruits", "vegetables", "grains", "pulses", "spices",
  "oils", "dairy", "snacks", "household", "personal", "meat", "health",
];

const CATEGORY_ICONS = {
  fruits: Apple, vegetables: Carrot, grains: Wheat, pulses: Bean,
  spices: Flame, oils: Droplet, dairy: Milk, snacks: Cookie,
  household: HomeIcon, personal: User, meat: Drumstick, health: Heart,
};

const CATEGORY_GRADIENTS = {
  fruits: "from-rose-500 to-orange-400",
  vegetables: "from-emerald-500 to-teal-400",
  grains: "from-amber-500 to-yellow-400",
  pulses: "from-lime-500 to-green-400",
  spices: "from-red-500 to-orange-400",
  oils: "from-yellow-500 to-amber-400",
  dairy: "from-sky-500 to-blue-400",
  snacks: "from-pink-500 to-rose-400",
  household: "from-indigo-500 to-purple-400",
  personal: "from-violet-500 to-fuchsia-400",
  meat: "from-orange-500 to-red-400",
  health: "from-teal-500 to-emerald-400",
};

const banners = [
  {
    title: "Fresh Picks, Daily Deals",
    desc: "Fruits & veggies delivered fast — shop today's freshest arrivals.",
    img: "/products/banner1.jpeg",
    tone: "from-emerald-700 via-teal-600 to-cyan-500",
  },
  {
    title: "Premium Quality, Better Prices",
    desc: "Stock up on pantry essentials — grains, pulses, oils & more.",
    img: "/products/mango.jpg",
    tone: "from-indigo-700 via-fuchsia-600 to-rose-500",
  },
  {
    title: "Snack Time Favorites",
    desc: "Chips, munchies & quick bites — add something tasty to your cart.",
    img: "/products/Kurkure.jpg",
    tone: "from-amber-700 via-orange-600 to-rose-500",
  },
];

const whyChooseUs = [
  {
    icon: Truck, title: "Fast Delivery", desc: "30 min delivery guaranteed within city limits.",
  },
  {
    icon: ShieldCheck, title: "Secure Payments", desc: "256-bit encrypted checkout with multiple options.",
  },
  {
    icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free returns within 24 hours of delivery.",
  },
  {
    icon: HeadphonesIcon, title: "24/7 Support", desc: "Round-the-clock help via chat, email, and phone.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma", role: "Regular Customer",
    text: "The quality of fruits and vegetables is outstanding. Delivery is always on time, and the packaging is eco-friendly!",
    rating: 5,
  },
  {
    name: "Rahul Verma", role: "Premium Member",
    text: "I love the reward coins system. I've saved over ₹2000 in the last 3 months just by ordering groceries regularly.",
    rating: 5,
  },
  {
    name: "Ananya Patel", role: "Home Chef",
    text: "The variety of organic produce and spices is incredible. It's like having a premium farmer's market at my doorstep.",
    rating: 5,
  },
  {
    name: "Vikram Singh", role: "Fitness Enthusiast",
    text: "Finally a grocery app that stocks quality protein sources and health foods. Meal prep has never been easier.",
    rating: 4,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

function BannerSlide({ slide, isActive }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.05 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.tone}`} />
      <div className="absolute inset-y-0 right-0 hidden sm:flex items-center pr-8 md:pr-12">
        {imageError ? (
          <div className="h-40 w-40 md:h-56 md:w-56 rounded-3xl bg-white/20 flex items-center justify-center">
            <span className="text-white/60 text-xs">Unavailable</span>
          </div>
        ) : (
          <div className="relative">
            {!imageLoaded && <div className="h-40 w-40 md:h-56 md:w-56 rounded-3xl bg-white/10 animate-pulse" />}
            <img
              src={slide.img}
              alt={slide.title}
              className={`h-40 w-40 md:h-56 md:w-56 rounded-3xl object-cover shadow-2xl ring-8 ring-white/40 transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/35 to-transparent flex flex-col justify-center px-6 sm:px-10">
        <h2 className="text-2xl sm:text-4xl font-bold text-white max-w-md leading-tight">
          {slide.title}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-white/80 max-w-sm">
          {slide.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const bannerIntervalRef = useRef(null);
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.products);

  const productsByCategory = useMemo(() => {
    const grouped = {};
    (items || []).forEach((product) => {
      if (product.isPublic === false) return;
      const cat = (product.category || "general").toLowerCase();
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(product);
    });
    return grouped;
  }, [items]);

  const categoriesOrder = useMemo(() => {
    const dynamic = Object.keys(productsByCategory).filter(
      (c) => !DEFAULT_CATEGORIES.includes(c),
    );
    return [...DEFAULT_CATEGORIES, ...dynamic.sort()];
  }, [productsByCategory]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    if (!normalizedSearch) return categoriesOrder;
    return categoriesOrder.filter((cat) =>
      (productsByCategory[cat] || []).some((p) =>
        (p.name || "").toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [categoriesOrder, normalizedSearch, productsByCategory]);

  const displayedCategories = useMemo(() => {
    if (!selectedCategory) return visibleCategories;
    return visibleCategories.includes(selectedCategory)
      ? [selectedCategory]
      : [];
  }, [selectedCategory, visibleCategories]);

  const toggleCategory = (cat) =>
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const nextBanner = useCallback(
    () => setCurrentBanner((p) => (p + 1) % banners.length),
    [],
  );

  useEffect(() => {
    bannerIntervalRef.current = setInterval(nextBanner, 4000);
    return () => clearInterval(bannerIntervalRef.current);
  }, [nextBanner]);

  useEffect(() => {
    if (isOffline) return;
    if (status === "idle") dispatch(fetchProducts());
  }, [dispatch, isOffline, status]);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const { lastMessage, status: wsStatus } = useWebSocket();
  useEffect(() => {
    if (wsStatus !== "open") return;
    if (
      lastMessage?.topic === "products" &&
      lastMessage?.payload?.event === "productAdded"
    ) {
      dispatch(addProduct(lastMessage.payload.product));
    }
  }, [lastMessage, wsStatus, dispatch]);

  useEffect(() => {
    const t = setInterval(
      () => setTestimonialIndex((p) => (p + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setNewsletterSubscribed(true);
      toast.success("Thanks for subscribing!");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="z-10"
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/90"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Fresh Picks in 20 min delivery
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
              >
                Shop smarter.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-cyan-200">
                  Fresh groceries delivered fast.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 text-base sm:text-lg text-white/80 max-w-xl leading-relaxed"
              >
                Curated essentials, seasonal favorites, and premium brands in
                one place. Quality checked and packed with care.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 bg-white text-emerald-800 px-6 py-3.5 rounded-xl font-bold shadow-card hover:shadow-card-hover hover:scale-105 transition-all"
                >
                  <ShoppingBag size={18} />
                  Shop Now
                </a>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-white/20 hover:scale-105 transition-all"
                >
                  Explore Products
                  <ArrowRight size={16} />
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 grid grid-cols-3 gap-4 max-w-md"
              >
                {[
                  { value: "5K+", label: "Products" },
                  { value: "30 min", label: "Avg delivery" },
                  { value: "4.8/5", label: "Rating" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-center"
                  >
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-[11px] font-medium text-white/60">
                      {s.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <div className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
              <AnimatePresence mode="wait">
                <BannerSlide
                  key={currentBanner}
                  slide={banners[currentBanner]}
                  isActive
                />
              </AnimatePresence>

              <button
                onClick={() =>
                  setCurrentBanner(
                    (p) => (p - 1 + banners.length) % banners.length,
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/40 p-2 rounded-full transition-all"
                aria-label="Previous"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/40 p-2 rounded-full transition-all"
                aria-label="Next"
              >
                <ChevronRight size={20} className="text-white" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBanner(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentBanner
                        ? "bg-white w-6"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <motion.section
        id="categories"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === null
                  ? "bg-brand-600 text-white shadow-card"
                  : "bg-surface-tertiary text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {categoriesOrder.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white shadow-card"
                    : "bg-surface-tertiary text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4"
        >
          {categoriesOrder.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || ShoppingBag;
            const gradient = CATEGORY_GRADIENTS[cat] || "from-emerald-500 to-teal-400";
            const count = (productsByCategory[cat] || []).length;
            return (
              <motion.button
                key={cat}
                variants={scaleIn}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
                className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                  selectedCategory === cat
                    ? "border-brand-500 bg-brand-50 shadow-card"
                    : "border-slate-200 bg-surface hover:shadow-card-hover hover:-translate-y-1"
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold capitalize text-slate-700 text-center leading-tight">
                  {cat}
                </span>
                <span className="text-[10px] text-slate-400 -mt-1">{count} items</span>
              </motion.button>
            );
          })}
        </motion.div>

        <div className="mt-4 flex sm:hidden flex-wrap gap-2">
          {categoriesOrder.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white"
                  : "bg-surface-tertiary text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.section>

      {/* FEATURED PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        {status === "loading" && <ProductGridSkeleton count={10} />}

        {isOffline && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium flex items-center gap-2">
            <Package size={16} />
            You are offline. Showing cached products until the connection returns.
          </div>
        )}

        {!isOffline && status === "failed" && items.length === 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
            <Package size={16} />
            {error || "Failed to load products."}
          </div>
        )}

        {status === "succeeded" && displayedCategories.length === 0 && !normalizedSearch && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag size={48} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600">No public products available.</h3>
            <p className="text-sm text-slate-400 mt-1">Check back later for new arrivals.</p>
          </div>
        )}

        {status !== "loading" &&
          displayedCategories.map((category) => {
            const products = (productsByCategory[category] || []).filter((p) =>
              (p.name || "").toLowerCase().includes(normalizedSearch),
            );
            const showAll = normalizedSearch || expandedCategories[category];
            const sliceAt = showAll ? undefined : 10;

            if (products.length === 0) return null;

            return (
              <motion.div
                key={category}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                variants={stagger}
                className="mb-10"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 rounded-full bg-brand-500" />
                    <h2 className="text-xl sm:text-2xl font-bold capitalize text-slate-900">
                      {category}
                    </h2>
                    <span className="text-sm text-slate-400 font-medium">
                      ({products.length})
                    </span>
                  </div>
                  {products.length > 10 && (
                    <button
                      onClick={() => toggleCategory(category)}
                      className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors"
                    >
                      {showAll ? "Show less" : `View all ${products.length}`}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>

                <motion.div
                  variants={stagger}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                  {products.slice(0, sliceAt).map((p, i) => (
                    <motion.div key={p._id || p.id} variants={scaleIn}>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            );
          })}
      </section>

      {/* SPECIAL OFFERS */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16"
      >
        <motion.div variants={fadeUp} className="text-center mb-8">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Deals & Offers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Special Offers Just for You
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          <motion.div
            variants={scaleIn}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 p-6 sm:p-8 text-white"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="relative">
              <Sparkles size={28} className="text-yellow-300 mb-3" />
              <h3 className="text-2xl font-extrabold">First Order Offer</h3>
              <p className="mt-2 text-white/80 text-sm leading-relaxed max-w-xs">
                Get up to <span className="font-bold text-yellow-300">20% off</span> on your
                first order. Use code <span className="font-mono font-bold text-yellow-300">WELCOME20</span>.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 bg-white text-rose-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all shadow-card">
                Claim Offer <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="relative">
              <TrendingUp size={28} className="text-emerald-300 mb-3" />
              <h3 className="text-2xl font-extrabold">Premium Rewards</h3>
              <p className="mt-2 text-white/80 text-sm leading-relaxed max-w-xs">
                Earn <span className="font-bold text-yellow-300">reward coins</span> on every
                purchase. Redeem them for discounts, free items &amp; exclusive deals.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all shadow-card">
                Learn More <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* WHY CHOOSE US */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
        className="bg-surface border-y border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Why ShopNest
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Why Choose Us
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {whyChooseUs.map((item) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                className="group p-6 rounded-xl border border-slate-200 bg-surface-secondary hover:bg-surface hover:shadow-card-hover hover:border-brand-200 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
                  <item.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* TESTIMONIALS */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        <motion.div variants={fadeUp} className="text-center mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            What Our Customers Say
          </h2>
        </motion.div>

        <div className="relative max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="bg-surface border border-slate-200 rounded-2xl p-8 shadow-card text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center mx-auto text-white text-xl font-bold shadow-card">
                {testimonials[testimonialIndex].name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h4 className="mt-4 text-lg font-bold text-slate-900">
                {testimonials[testimonialIndex].name}
              </h4>
              <p className="text-sm text-brand-600 font-medium">
                {testimonials[testimonialIndex].role}
              </p>
              <div className="flex justify-center gap-1 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < testimonials[testimonialIndex].rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }
                  />
                ))}
              </div>
              <p className="mt-4 text-slate-600 leading-relaxed italic">
                &ldquo;{testimonials[testimonialIndex].text}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === testimonialIndex
                    ? "bg-brand-600 w-6"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() =>
              setTestimonialIndex(
                (p) => (p - 1 + testimonials.length) % testimonials.length,
              )
            }
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-12 bg-surface border border-slate-200 p-2.5 rounded-full shadow-card hover:shadow-card-hover hover:bg-slate-50 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() =>
              setTestimonialIndex((p) => (p + 1) % testimonials.length)
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-12 bg-surface border border-slate-200 p-2.5 rounded-full shadow-card hover:shadow-card-hover hover:bg-slate-50 transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.section>

      {/* NEWSLETTER */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUp}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 px-6 sm:px-12 py-12 sm:py-16 text-center text-white">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-teal-400/20 blur-3xl" />

          <div className="relative">
            <MailStrokeIcon />
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-4">
              Stay in the Loop
            </h2>
            <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-md mx-auto">
              Subscribe to get exclusive offers, fresh produce alerts, and
              member-only discounts delivered to your inbox.
            </p>

            {newsletterSubscribed ? (
              <div className="mt-6 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 text-emerald-100 text-sm font-medium">
                <Package size={18} />
                You're subscribed! Welcome aboard.
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-white text-brand-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all shadow-card whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function MailStrokeIcon() {
  return (
    <svg
      className="w-10 h-10 mx-auto text-emerald-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}
