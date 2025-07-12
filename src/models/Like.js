import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Post from "./Post.js";

class Like extends Model {}

Like.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    sequelize,
    modelName: "Like",
    tableName: "likes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

User.belongsToMany(Post, { through: Like, foreignKey: "user_id", otherKey: "post_id" });
Post.belongsToMany(User, { through: Like, foreignKey: "post_id", otherKey: "user_id" });

export default Like; 