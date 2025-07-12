import { Router } from "express";
import authRoutes from "./auth.js";
import postRoutes from "./posts.js";
import adminRoutes from "./admin.js";
import profileRoutes from "./profile.js";
import { search } from '../controllers/postController.js';
import { getNotifications } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/admin", adminRoutes);
router.use("/profile", profileRoutes);
router.get('/search', search);
router.get('/notifications', authenticate, getNotifications);

export default router; 