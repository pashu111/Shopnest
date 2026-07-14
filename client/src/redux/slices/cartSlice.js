import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addToCartAPI, getCartAPI, updateCartItemAPI, removeFromCartAPI, mergeCartAPI } from "../../services/cartService";

let _cartFetcher = 0;

const normalizeBackendCart = (apiCart) => {
  if (!apiCart || !Array.isArray(apiCart.items)) return [];
  return apiCart.items
    .filter((entry) => entry && entry.product)
    .map((entry) => ({
      _id: entry.product._id || entry.product.id,
      name: entry.product.name,
      price: entry.product.price,
      image: entry.product.image,
      description: entry.product.description,
      category: entry.product.category,
      stock: entry.product.stock,
      quantity: entry.quantity,
      cartItemId: entry._id,
    }));
};

export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (product, { rejectWithValue }) => {
    const fetcher = ++_cartFetcher;
    try {
      const productId = product._id || product.id;
      const res = await addToCartAPI(productId);
      return { items: normalizeBackendCart(res.data), product, fetcher };
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("SESSION_EXPIRED");
      }
      return rejectWithValue(err.response?.data?.message || "Failed to add to cart");
    }
  }
);

export const fetchCartAsync = createAsyncThunk(
  "cart/fetchCartAsync",
  async (_, { rejectWithValue }) => {
    const fetcher = ++_cartFetcher;
    try {
      const res = await getCartAPI();
      return { items: normalizeBackendCart(res.data), fetcher };
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("SESSION_EXPIRED");
      }
      return rejectWithValue(err.response?.data?.message || "Failed to fetch cart");
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItemAsync",
  async ({ productId, quantity }, { rejectWithValue }) => {
    const fetcher = ++_cartFetcher;
    try {
      const res = await updateCartItemAPI(productId, quantity);
      return { items: normalizeBackendCart(res.data), fetcher };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update cart");
    }
  }
);

export const mergeCartAsync = createAsyncThunk(
  "cart/mergeCartAsync",
  async (localItems, { rejectWithValue }) => {
    const fetcher = ++_cartFetcher;
    try {
      const res = await mergeCartAPI(localItems);
      return { items: normalizeBackendCart(res.data), fetcher };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to merge cart");
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCartAsync",
  async (productId, { rejectWithValue }) => {
    const fetcher = ++_cartFetcher;
    try {
      const res = await removeFromCartAPI(productId);
      return { items: normalizeBackendCart(res.data), fetcher };
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("SESSION_EXPIRED");
      }
      return rejectWithValue(err.response?.data?.message || "Failed to remove from cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
    _fetcher: 0,
  },
  reducers: {
    addToCartLocal: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => (i._id || i.id) === (item._id || item.id));
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => (item._id || item.id) !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((i) => (i._id || i.id) === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => (i._id || i.id) === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter((i) => (i._id || i.id) !== action.payload);
      }
    },
    setCartFetcher: (state, action) => {
      state._fetcher = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state._fetcher = action.payload.fetcher;
        state.items = action.payload.items;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartAsync.fulfilled, (state, action) => {
        if (action.payload.fetcher >= state._fetcher) {
          state.items = action.payload.items;
          state._fetcher = action.payload.fetcher;
        }
        state.loading = false;
      })
      .addCase(fetchCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.fetcher >= state._fetcher) {
          state.items = action.payload.items;
          state._fetcher = action.payload.fetcher;
        }
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.fetcher >= state._fetcher) {
          state.items = action.payload.items;
          state._fetcher = action.payload.fetcher;
        }
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(mergeCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.fetcher >= state._fetcher) {
          state.items = action.payload.items;
          state._fetcher = action.payload.fetcher;
        }
      })
      .addCase(mergeCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addToCartLocal, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, setCartFetcher } = cartSlice.actions;
export default cartSlice.reducer;
