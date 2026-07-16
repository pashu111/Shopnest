import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 200 } },
};

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <circle cx="12" cy="8" r="4.5" />
      <path d="M3.5 21c0-5 4-8.5 8.5-8.5s8.5 3.5 8.5 8.5" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M12 2.5L3.5 7v4.5c0 5.2 3.8 10 8.5 11.5 4.7-1.5 8.5-6.3 8.5-11.5V7L12 2.5z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <rect x="1.5" y="4" width="14" height="11" rx="1.5" />
      <rect x="15.5" y="7" width="6" height="8" rx="1" />
      <circle cx="5" cy="17.5" r="2" />
      <circle cx="18" cy="17.5" r="2" />
      <path d="M15.5 12.5h6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
  );
}

export default function RoleSelect() {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-surface to-accent-50" />
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-brand-200/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-accent-200/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-brand-100/15 blur-3xl" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-10"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface/80 backdrop-blur-md rounded-2xl shadow-card border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                  <path d="M12 12v4" />
                  <path d="M9 14h6" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">ShopNest</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              Welcome to ShopNest
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Choose how you want to enter
            </h1>
            <p className="mt-3 text-slate-600 text-base">
              Pick your role to continue. You can always switch later.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto"
          >
            <motion.div variants={cardVariants}>
              <Link
                to="/home"
                className="group block bg-surface border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ring-1 ring-brand-200/50">
                  <UserIcon />
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  User
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Shop groceries, track orders, and manage your profile.
                </p>
                <div className="mt-5 text-sm font-semibold text-brand-600 group-hover:translate-x-1 transition inline-flex items-center gap-1.5">
                  Continue as User <ArrowRight />
                </div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link
                to="/admin/login"
                className="group block bg-surface border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 text-accent-600 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ring-1 ring-accent-200/50">
                  <AdminIcon />
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Admin
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Manage products, orders, and store insights.
                </p>
                <div className="mt-5 text-sm font-semibold text-accent-600 group-hover:translate-x-1 transition inline-flex items-center gap-1.5">
                  Go to Admin <ArrowRight />
                </div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link
                to="/delivery/login"
                className="group block bg-surface border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ring-1 ring-sky-200/50">
                  <DeliveryIcon />
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Delivery Partner
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  View assigned deliveries and update order status.
                </p>
                <div className="mt-5 text-sm font-semibold text-sky-600 group-hover:translate-x-1 transition inline-flex items-center gap-1.5">
                  Continue as Delivery <ArrowRight />
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
