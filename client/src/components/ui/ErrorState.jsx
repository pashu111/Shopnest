import { memo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = memo(function ErrorState({
  title = "Something went wrong",
  description = "",
  onRetry,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mb-6">
        <AlertCircle size={48} className="text-rose-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-center max-w-md mb-8">{description}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200/60 transition-all"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </motion.div>
  );
});

export default ErrorState;
