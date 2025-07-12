import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { updateProfile, upload } from "../controllers/profileController.js";
import { getProfile } from "../controllers/authController.js";

const router = Router();

// PATCH /api/profile
router.patch(
  "/",
  authenticate,
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ]),
  updateProfile
);

// GET /api/profile/:username
router.get("/:username", getProfile);

export default router; 