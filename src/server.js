  // import dotenv from "dotenv";
  // import express from "express";
  // import cors from "cors";
  // import routes from "./routes/index.js";
  // import db from "./config/database.js";
  // import "./models/index.js";
  // import bcrypt from "bcrypt";
  // import User from "./models/User.js";
  // import { getAllUsers } from "./controllers/authController.js"; // or adminController.js
  // import Post from "./models/Post.js";
  // import path from "path";

  // dotenv.config();

  // const app = express();
  // const corsOptions = {
  //   origin: ["http://localhost:8080", "http://localhost:3000"],
  //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  //   allowedHeaders: ["Content-Type", "Authorization"],
  //   credentials: true,
  // };
  // app.use(cors(corsOptions));
  // app.use(express.json());
  // app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // app.use("/api", routes);

  // const PORT = process.env.PORT || 8000;

  // (async () => {
  //   try {
  //     await db.authenticate();
  //     console.log("Database connected");
  //     await db.sync();

  //     // Seed default admin if none exists
  //     const [admin, created] = await User.findOrCreate({
  //       where: { email: "admin@dizesi.com" },
  //       defaults: {
  //         username: "admin",
  //         full_name: "Admin",
  //         password_hash: await bcrypt.hash("admin123", 10),
  //         role: "admin",
  //         is_admin: true,
  //         email_verified: true,
  //       },
  //     });
  //     if (created) {
  //       console.log("⚠︎ Default admin account created: admin@dizesi.com / admin123");
  //     }

  //     app.listen(PORT, () => {
  //       console.log(`Server running on port ${PORT}`);
  //     });
  //   } catch (err) {
  //     console.error("Unable to connect to the database:", err);
  //   }
  // })();

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
  origin: ["http://localhost:8080", "http://localhost:3000", "https://dizesi-frontend.vercel.app"], // add live frontend too
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

    // Start server ONLY in local development
    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
        console.log(`Local server running on http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();


export default app;
