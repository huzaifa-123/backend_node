import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
}; 