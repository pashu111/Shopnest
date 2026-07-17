import { useDispatch, useSelector } from "react-redux";
import { useState, memo, useCallback } from "react";
import {
  addToCartLocal,
  addToCartAsync,
  increaseQuantity,
  decreaseQuantity,
} from "../redux/slices/cartSlice";
import { toast } from "react-toastify";
import { ShoppingCart, Plus, Minus, Star, Image as ImageIcon, Loader, Check } from "lucide-react";
import WishlistButton from "./WishlistButton";
import { resolveAssetUrl } from "../utils/assetUrl";

const ProductImage = memo(function ProductImage({ product }) {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imageUrl = resolveAssetUrl(product.image);

  if (imageError || !imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
        <div className="text-center">
          <ImageIcon size={36} className="mx-auto mb-1" />
          <span className="text-xs">Unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}
      <img
        src={imageUrl}
        alt={product.name}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImageError(true)}
      />
    </>
  );
});

const ProductCard = memo(function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [addingProductId, setAddingProductId] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const productId = product._id || product.id;
  const existingItem = cartItems.find(
    (item) => (item._id || item.id) === productId
  );
  const isAddingThis = addingProductId === productId;

  const handleAdd = useCallback(async () => {
    if (isAddingThis) return;
    setAddingProductId(productId);
    if (user) {
      const result = await dispatch(addToCartAsync(product));
      setAddingProductId(null);
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Added to cart");
      } else if (result.payload === "SESSION_EXPIRED") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        dispatch({ type: "auth/logout" });
        dispatch(addToCartLocal(product));
        toast.success("Added to cart");
      } else {
        toast.error(typeof result.payload === "string" ? result.payload : "Failed to add");
      }
    } else {
      dispatch(addToCartLocal(product));
      setAddingProductId(null);
      toast.success("Added to cart");
    }
  }, [isAddingThis, productId, user, dispatch, product]);

  const handleIncrease = useCallback(() => {
    dispatch(increaseQuantity(productId));
  }, [dispatch, productId]);

  const handleDecrease = useCallback(() => {
    dispatch(decreaseQuantity(productId));
  }, [dispatch, productId]);

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className="absolute top-3 right-3 z-10">
        <WishlistButton product={product} />
      </div>

      {Number(product.stock) <= 0 && (
        <span className="absolute top-3 left-3 z-10 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
          Out of Stock
        </span>
      )}
      {product.discount && (
        <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
          {product.discount}% OFF
        </span>
      )}

      <div className="relative overflow-hidden bg-slate-50 aspect-square">
        <ProductImage product={product} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      <div className="p-3.5">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={star <= Math.round(Number(product.rating || 4.5)) ? "text-accent-500 fill-accent-500" : "text-slate-200"}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-500">(1.2k)</span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <p className="font-extrabold text-lg text-slate-900">₹{product.price}</p>
          {product.mrp && Number(product.mrp) > Number(product.price) && (
            <>
              <p className="text-xs text-slate-400 line-through">₹{product.mrp}</p>
              <span className="text-[11px] font-bold text-brand-600">
                {Math.round((1 - Number(product.price) / Number(product.mrp)) * 100)}% off
              </span>
            </>
          )}
        </div>

        {Number(product.stock) <= 0 ? (
          <button
            disabled
            className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-300 text-slate-500 cursor-not-allowed py-2.5 rounded-xl text-sm font-semibold"
          >
            <ShoppingCart size={15} />
            Out of Stock
          </button>
        ) : existingItem ? (
          <div className="mt-3 flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-2 py-1.5">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 rounded-lg bg-white border border-brand-200 flex items-center justify-center hover:bg-brand-100 transition-all active:scale-95"
            >
              <Minus size={13} className="text-brand-700" />
            </button>
            <span className="font-bold text-sm text-brand-800 min-w-[24px] text-center">
              {existingItem.quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="w-8 h-8 rounded-lg bg-white border border-brand-200 flex items-center justify-center hover:bg-brand-100 transition-all active:scale-95"
            >
              <Plus size={13} className="text-brand-700" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isAddingThis}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
          >
            {isAddingThis ? (
              <Loader size={15} className="animate-spin" />
            ) : (
              <ShoppingCart size={15} />
            )}
            {isAddingThis ? "Adding..." : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
});

export default ProductCard;
