import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { resolveAssetUrl } from "../utils/assetUrl";
import { X, Image as ImageIcon } from "lucide-react";

export default function QuickViewModal({ product, onClose }) {
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white rounded-2xl w-full max-w-lg relative overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition"
          >
            <X size={16} />
          </button>

          <div className="bg-slate-50 h-56 flex items-center justify-center p-6">
            {imageError || !product.image ? (
              <div className="text-center text-slate-400">
                <ImageIcon size={48} className="mx-auto mb-2" />
                <span className="text-xs">Image unavailable</span>
              </div>
            ) : (
              <img
                src={resolveAssetUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <div className="p-5 space-y-3">
            <h2 className="font-bold text-xl text-slate-900">{product.name}</h2>
            <p className="text-emerald-700 text-2xl font-extrabold">₹{product.price}</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Fresh quality guaranteed. Order now and enjoy quick delivery straight to your doorstep.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
