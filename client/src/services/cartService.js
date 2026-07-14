import API from "./api";

export const addToCartAPI = (productId, quantity = 1) =>
  API.post("/cart/add", { productId, quantity });

export const getCartAPI = () =>
  API.get("/cart");

export const updateCartItemAPI = (productId, quantity) =>
  API.put(`/cart/${productId}`, { quantity });

export const removeFromCartAPI = (productId) =>
  API.delete(`/cart/${productId}`);

export const clearCartAPI = () =>
  API.delete("/cart");

export const mergeCartAPI = (items) =>
  API.post("/cart/merge", { items });
