import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import db from "./config/database.js";
import "./models/index.js";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import path from "path";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:8080",
    "https://www.dizesi.com",
    "https://dizesi-backend.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", routes);

(async () => {
  try {
    await db.authenticate();
    console.log("Database connected");
    await db.sync();

    const [admin, created] = await User.findOrCreate({
      where: { email: "admin@dizesi.com" },
      defaults: {
        username: "admin",
        full_name: "Admin",
        password_hash: await bcrypt.hash("admin123", 10),
        role: "admin",
        is_admin: true,
        email_verified: true,
      },
    });

    if (created) {
      console.log("⚠︎ Default admin account created.");
    }

    // Always start the server (for Render and all environments)
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();

export default app;
