import { memo } from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

const EmptyState = memo(function EmptyState({
  icon: Icon = ShoppingBag,
  title = "Nothing here yet",
  description = "",
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <Icon size={48} className="text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-center max-w-md mb-8">{description}</p>
      )}
      {action}
    </motion.div>
  );
});

export default EmptyState;
