import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    bio: DataTypes.TEXT,
    profile_picture: DataTypes.STRING(500),
    cover_image: DataTypes.STRING(500),
    instagram_url: DataTypes.STRING(255),
    date_of_birth: DataTypes.DATEONLY,
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: "user",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User; 