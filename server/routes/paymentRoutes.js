import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createRazorpayOrder,
  getRazorpayKey,
  verifyRazorpayAndCreateOrder,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/razorpay/key", authMiddleware, getRazorpayKey);
router.post("/razorpay/order", createRazorpayOrder);
// Alias route (matches requested API name): POST /api/payments/create-order
router.post("/create-order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayAndCreateOrder);

export default router;
