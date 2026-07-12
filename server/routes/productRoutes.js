// import express from "express";
// import Product from "../models/Product.js";

// const router = express.Router();

// // GET all products
// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // POST a new product
// router.post("/",async (req,res)=>{
//   try{
//     const product = new Product(req.body);
//     await product.save();
//     res.status(201).json(product);
//   }catch(err){
//     res.status(500).json({ error: "Invalid Product data" });
//   }
// });




// export default router;


import express from "express";
import { addProduct, getProducts, getProductById, getAllProducts, removeMissingImageProducts, removeAllProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadProductImage, handleMulterError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ── Static routes (MUST be defined before parameterized /:id routes) ──

// admin add product
router.post("/add", authMiddleware, uploadProductImage, handleMulterError, addProduct);

// admin remove products missing images
router.delete("/remove-missing-images", authMiddleware, removeMissingImageProducts);

// admin remove all products
router.delete("/remove-all", authMiddleware, removeAllProducts);

// admin get all products (including non-public)
router.get("/all", authMiddleware, getAllProducts);

// user get products (public only)
router.get("/", getProducts);

// ── Parameterized routes ──

// admin update product
router.put("/:id", authMiddleware, uploadProductImage, handleMulterError, updateProduct);

// admin delete product
router.delete("/:id", authMiddleware, deleteProduct);

// user get single public product (returns 404 if private)
router.get("/:id", getProductById);

export default router;
