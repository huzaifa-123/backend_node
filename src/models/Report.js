import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Post from "./Post.js";

class Report extends Model {}

Report.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Post, key: 'id' },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Report",
    tableName: "reports",
    timestamps: false,
  }
);

Post.hasMany(Report, { foreignKey: 'post_id', as: 'reports' });
Report.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Report.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Report; 