import Product from "../models/Product.js";

// ADMIN ADD PRODUCT
export const addProduct = async (req, res) => {
  try {

    const productData = { ...req.body };
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }
    if (productData.price !== undefined) {
      productData.price = Number(productData.price);
    }

    const product = new Product(productData);

    await product.save();

    // Only broadcast public products to connected clients (security: never expose non-public data via WebSocket)
    const publish = req.app.get("wsPublish");
    if (publish && product.isPublic) {
      publish("products", { event: "productAdded", product });
    }

    res.json(product);

  } catch (error) {

    res.status(500).json({
      message: "Product add failed"
    });

  }
};

// USER GET PUBLIC PRODUCTS
export const getProducts = async (req, res) => {

  try {

    const products = await Product.find({ isPublic: true }).sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch products"
    });

  }

};

// USER GET SINGLE PUBLIC PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isPublic: true });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

// ADMIN GET ALL PRODUCTS (including non-public)
export const getAllProducts = async (req, res) => {

  try {

    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch products"
    });

  }

};

// ADMIN REMOVE PRODUCTS WITH MISSING IMAGE FIELD
export const removeMissingImageProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({
      $or: [
        { image: { $exists: false } },
        { image: null },
        { image: "" },
      ],
    });

    res.json({ deletedCount: result.deletedCount || 0 });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove products" });
  }
};

// ADMIN REMOVE ALL PRODUCTS
export const removeAllProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({ deletedCount: result.deletedCount || 0 });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove products" });
  }
};

// ADMIN UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Product update failed" });
  }
};

// ADMIN DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Product delete failed" });
  }
};
