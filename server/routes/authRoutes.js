import express from "express";
import {
  checkEmail,
  loginUser,
  registerUser,
  forgotPasswordUser,
  resetPasswordUser,
  mergeGuestData,
} from "../controllers/authController.js";
import { updateProfile } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/check-email", checkEmail);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPasswordUser);
router.post("/reset-password", resetPasswordUser);
router.put("/update-profile", protect, updateProfile);
router.post("/merge-guest-data", protect, mergeGuestData);

export default router;
