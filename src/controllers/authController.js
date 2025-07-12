import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Post from "../models/Post.js";
import multer from "multer";

const upload = multer();

export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      full_name,
      dateOfBirth,
      date_of_birth,
    } = req.body;

    const effectiveFullName = full_name || fullName;
    if (!username || !email || !password || !effectiveFullName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const taken = await User.findOne({ where: { username } });
    if (taken) return res.status(400).json({ message: "Username taken" });
    const emailTaken = await User.findOne({ where: { email } });
    if (emailTaken) return res.status(400).json({ message: "Email taken" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      full_name: effectiveFullName,
      password_hash,
      date_of_birth: date_of_birth || dateOfBirth,
    });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "30m" }
    );
    res.json({ 
      token, 
      user: {
        ...user.get({ plain: true }),
        isAdmin: user.is_admin,
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, hasPassword: !!password });
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username/email and password required" });
    }

    // Allow login with either username OR email
    const whereClause = username.includes("@") ? { email: username } : { username };
    console.log("Looking for user with:", whereClause);
    
    const user = await User.findOne({ where: whereClause });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.log("Invalid password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "30m" }
    );
    
    const userResponse = {
      ...user.get({ plain: true }),
      isAdmin: user.is_admin,
      role: user.role || 'user'
    };
    
    console.log("Login successful for:", userResponse.username, "isAdmin:", userResponse.isAdmin);
    res.json({ token, user: userResponse });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/check-username?username=foo
export const checkUsername = async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ available: false, message: "username query param required" });
  }
  try {
    const exists = await User.findOne({ where: { username } });
    return res.json({ available: !Boolean(exists) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ available: false, message: "Server error" });
  }
};

// GET /api/auth/profile/:username
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
       console.log("Looking up user:", username);
       const user = await User.findOne({
         where: { username },
         attributes: { exclude: ['password_hash'] }
       });
       console.log("User found:", user);
       if (!user) {
         return res.status(404).json({ message: "User not found" });
       }

    // Get user's posts
    const posts = await Post.findAll({
      where: { user_id: user.id, status: 'approved' },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }],
      order: [['created_at', 'DESC']]
    });

    res.json({ user, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Debug endpoint to check admin user
export const debugAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ where: { email: "admin@dizesi.com" } });
    if (admin) {
      res.json({
        exists: true,
        username: admin.username,
        email: admin.email,
        is_admin: admin.is_admin,
        role: admin.role,
        hasPassword: !!admin.password_hash
      });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    // ... rest of your logic
  } catch (err) {
    // error handling
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] }
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}; 