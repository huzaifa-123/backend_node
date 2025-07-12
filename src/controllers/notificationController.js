import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: User, as: "actor", attributes: ["id", "username", "full_name"] }
      ],
      order: [["created_at", "DESC"]],
      limit: 50,
    });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}; 