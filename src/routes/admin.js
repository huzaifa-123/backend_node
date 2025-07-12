import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { getPendingPosts, approvePost, rejectPost, getReports, deleteReportedPost } from "../controllers/postController.js";
import { getAllUsers } from "../controllers/authController.js";

const router = Router();

router.get("/pending-posts", authenticate, requireAdmin, getPendingPosts);
router.patch("/posts/:id/approve", authenticate, requireAdmin, approvePost);
router.delete("/posts/:id/reject", authenticate, requireAdmin, rejectPost);
router.get("/users", authenticate, requireAdmin, getAllUsers);
router.get('/reports', getReports);
router.delete('/posts/:postId', deleteReportedPost);

export default router; 