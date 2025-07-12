import { Router } from "express";
import { register, login, checkUsername, getProfile, debugAdmin } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-username", checkUsername);
router.get("/profile/:username", getProfile);
router.get("/debug-admin", debugAdmin);

export default router; 