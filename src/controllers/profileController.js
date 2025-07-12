import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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
export const upload = multer({ storage });

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = {};
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.instagram_url !== undefined) updates.instagram_url = req.body.instagram_url;

    // Remove profile picture if requested
    if (req.body.remove_profile_picture === 'true') {
      const user = await User.findByPk(userId);
      if (user && user.profile_picture) {
        const filePath = path.join(process.cwd(), user.profile_picture);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      updates.profile_picture = null;
    } else if (req.files && req.files.profile_picture && req.files.profile_picture[0]) {
      updates.profile_picture = `/uploads/${req.files.profile_picture[0].filename}`;
    }

    // Remove cover image if requested
    if (req.body.remove_cover_image === 'true') {
      const user = await User.findByPk(userId);
      if (user && user.cover_image) {
        const filePath = path.join(process.cwd(), user.cover_image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      updates.cover_image = null;
    } else if (req.files && req.files.cover_image && req.files.cover_image[0]) {
      updates.cover_image = `/uploads/${req.files.cover_image[0].filename}`;
    }

    await User.update(updates, { where: { id: userId } });
    const updatedUser = await User.findByPk(userId, { attributes: { exclude: ["password_hash"] } });
    res.json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}; 