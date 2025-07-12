import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

class Follow extends Model {}

Follow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: "Follow",
    tableName: "follows",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["follower_id", "following_id"],
      },
    ],
  }
);

User.belongsToMany(User, {
  as: "Followers",
  through: Follow,
  foreignKey: "following_id",
  otherKey: "follower_id",
});

User.belongsToMany(User, {
  as: "Following",
  through: Follow,
  foreignKey: "follower_id",
  otherKey: "following_id",
});

export default Follow; 