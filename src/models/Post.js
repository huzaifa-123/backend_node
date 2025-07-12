import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: DataTypes.STRING(500),
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    approved_at: DataTypes.DATE,
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "posts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

User.hasMany(Post, { foreignKey: "user_id" });
Post.belongsTo(User, { foreignKey: "user_id", as: "user" });

export default Post; 