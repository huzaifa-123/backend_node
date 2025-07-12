import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

class Notification extends Model {}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { // recipient
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    actor_id: { // who triggered
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    type: { // 'like', 'comment', 'follow'
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_id: { // nullable, for like/comment
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: false,
  }
);

Notification.belongsTo(User, { as: "actor", foreignKey: "actor_id" });

export default Notification; 