import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    res.json(populatedCart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = Number(quantity);
    await cart.save();

    const populatedCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    res.json(populatedCart);
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    res.json(populatedCart);
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};

export const mergeCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items: localItems } = req.body;

    if (!Array.isArray(localItems) || localItems.length === 0) {
      const cart = await Cart.findOne({ user: userId }).populate("items.product");
      return res.json(cart || { items: [] });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    for (const localItem of localItems) {
      const productId = localItem._id || localItem.id;
      if (!productId) continue;

      const product = await Product.findById(productId);
      if (!product) continue;

      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += Number(localItem.quantity) || 1;
      } else {
        cart.items.push({ product: productId, quantity: Number(localItem.quantity) || 1 });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ user: userId }).populate("items.product");
    res.json(populatedCart);
  } catch (error) {
    console.error("Merge cart error:", error);
    res.status(500).json({ message: "Failed to merge cart" });
  }
};
