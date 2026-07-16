import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useState } from "react";
import { Trash2, Heart, Image as ImageIcon } from "lucide-react";
import { removeFromWishlist } from "../redux/slices/wishlistSlice";
import { resolveAssetUrl } from "../utils/assetUrl";

const getItemId = (item) => item.id ?? item._id;

function WishlistImage({ item }) {
  const [error, setError] = useState(false);
  if (error || !item.image) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-surface-tertiary text-slate-400">
        <ImageIcon size={32} />
      </div>
    );
  }
  return (
    <img
      src={resolveAssetUrl(item.image)}
      alt={item.name}
      className="h-full w-full object-contain p-4"
      onError={() => setError(true)}
    />
  );
}

const Wishlist = () => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="bg-surface border border-slate-200 rounded-2xl p-14 text-center shadow-card">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
              <Heart size={36} className="text-rose-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Your Wishlist is empty
            </h2>
            <p className="text-slate-500 mt-2">
              Add your favorite products to keep them here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
              Saved For Later
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-slate-500 mt-1">
              Keep track of items you love and revisit anytime.
            </p>
          </div>
          <div className="bg-surface border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 shadow-card">
            {wishlist.length} item{wishlist.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item, index) => {
            const itemId = getItemId(item);
            return (
              <motion.div
                key={itemId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="bg-surface border border-slate-200 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden rounded-xl bg-surface-secondary aspect-square">
                  <WishlistImage item={item} />
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-brand-600 font-bold mt-1">
                    ₹{item.price}
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => dispatch(removeFromWishlist(itemId))}
                    className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-3 py-2.5 rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 font-semibold text-sm transition-all"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
