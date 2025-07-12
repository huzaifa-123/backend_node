import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { listPosts, createPost, likeToggle, followToggle, addComment, getComments, reportPost } from "../controllers/postController.js";
import { deleteOwnPost } from "../controllers/postController.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

const router = Router();

router.get("/", (req, res, next) => {
  if (req.query.feed === "following") {
    return authenticate(req, res, next);
  }
  next();
}, listPosts);
router.post("/", authenticate, upload.single('image'), createPost);
router.post("/like", authenticate, likeToggle);
router.post("/follow", authenticate, followToggle);
router.post('/:id/comments', authenticate, addComment);
router.get('/:id/comments', getComments);
router.post('/:id/report', authenticate, reportPost);
router.delete('/:id', authenticate, deleteOwnPost);

export default router; 