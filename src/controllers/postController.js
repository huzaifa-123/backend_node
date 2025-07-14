import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Follow from "../models/Follow.js";
import User from "../models/User.js";
import { Op, fn, col, literal } from "sequelize";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";
import Notification from "../models/Notification.js";
import fs from "fs";
import path from "path";

export const listPosts = async (req, res) => {
  try {
    const feed = req.query.feed || "general";
    let where = { status: "approved" };

    let followingIds = [];
    if (req.user) {
      const rows = await Follow.findAll({
        where: { follower_id: req.user.id },
        attributes: ["following_id"],
      });
      followingIds = rows.map((r) => r.following_id);

    }

    if (feed === "following") {
      if (!req.user) {
        return res.status(401).json({ message: "Login required to view following feed" });
      }
      where.user_id = { [Op.in]: followingIds.length ? followingIds : [0] };
    }

    const posts = await Post.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: { exclude: ["password_hash"] } },
      ],
      attributes: {
        include: [
          [
            literal(`(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)`),
            "commentsCount"
          ],
          [
            literal(`(SELECT COUNT(*) FROM likes WHERE likes.post_id = Post.id)`),
            "likesCount"
          ]
        ]
      },
      order: [["created_at", "DESC"]],
    });

    // Add isFollowing to each post's user
    if (req.user) {
      for (const post of posts) {
        if (post.user) {
          const isFollowing = followingIds.includes(post.user.id);
          console.log(`Post user.id: ${post.user.id}, isFollowing: ${isFollowing}`);
          post.user.setDataValue('isFollowing', isFollowing);
        }
      }
    } else {
      for (const post of posts) {
        if (post.user) {
          post.user.setDataValue('isFollowing', false);
        }
      }
    }

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    let image_url = null;
    if (req.file) {
      // Save the file path or URL as needed
      image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      image_url = req.body.image_url;
    }
    const post = await Post.create({
      user_id: req.user.id,
      title,
      content,
      image_url,
      status: "pending",
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const likeToggle = async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const existing = await Like.findOne({ where: { user_id: req.user.id, post_id: postId } });
    if (existing) {
      await existing.destroy();
    } else {
      await Like.create({ user_id: req.user.id, post_id: postId });
      // Create notification for post owner (if not liking own post)
      if (post.user_id !== req.user.id) {
        await Notification.create({
          user_id: post.user_id,
          actor_id: req.user.id,
          type: "like",
          post_id: postId,
        });
      }
    }
    const likesCount = await Like.count({ where: { post_id: postId } });
    res.json({ likesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const followToggle = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const followerId = req.user.id;
    const followingId = parseInt(userId);

    if (followerId === followingId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const target = await User.findByPk(followingId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚨 Make sure both values are integers and match your schema types
    const existing = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (existing) {
      console.log(`[UNFOLLOW] Removing follow from ${followerId} ➡️ ${followingId}`);
      await existing.destroy();
      return res.json({ following: false });
    } else {
      console.log(`[FOLLOW] Creating follow from ${followerId} ➡️ ${followingId}`);
      const newFollow = await Follow.create({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date(),
      });
      // Create notification for followed user
      await Notification.create({
        user_id: followingId,
        actor_id: followerId,
        type: "follow",
        post_id: null,
      });
      return res.json({ following: true });
    }
  } catch (err) {
    console.error("FollowToggle Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


// ADMIN: Get all pending posts
export const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: "pending" },
      include: [{ model: User, as: "user", attributes: { exclude: ["password_hash"] } }],
      order: [["created_at", "DESC"]],
    });
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: Approve a post
export const approvePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.status = "approved";
    post.approved_at = new Date();
    post.approved_by = req.user.id;
    await post.save();
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: Reject a post
export const rejectPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await post.destroy();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Login required" });
    const { postId, content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: "Comment content required" });
    }
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = await Comment.create({
      post_id: postId,
      user_id: req.user.id,
      content: content.trim(),
      created_at: new Date(),
    });
    // Create notification for post owner (if not commenting on own post)
    if (post.user_id !== req.user.id) {
      await Notification.create({
        user_id: post.user_id,
        actor_id: req.user.id,
        type: "comment",
        post_id: postId,
      });
    }
    res.json({ comment });
  } catch (err) {
    console.error("AddComment Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({ message: 'Missing search query' });
    }
    const query = q.trim();
    // Search users
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { full_name: { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: { exclude: ['password_hash'] },
      limit: 20,
    });
    // Search posts
    const posts = await Post.findAll({
      where: {
        status: 'approved',
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { content: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }],
      attributes: {
        include: [
          [
            literal(`(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)`),
            "commentsCount"
          ],
          [
            literal(`(SELECT COUNT(*) FROM likes WHERE likes.post_id = Post.id)`),
            "likesCount"
          ]
        ]
      },
      order: [['created_at', 'DESC']],
      limit: 20,
    });
    return res.json({ users, posts });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.findAll({
      where: { post_id: postId },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }],
      order: [['created_at', 'ASC']],
    });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const reportPost = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Login required" });
    const postId = req.params.id;
    const { reason } = req.body;
    // Prevent duplicate reports by same user
    const existing = await Report.findOne({ where: { post_id: postId, user_id: req.user.id } });
    if (existing) return res.status(400).json({ message: "You have already reported this post." });
    const report = await Report.create({
      post_id: postId,
      user_id: req.user.id,
      reason: reason || null,
      created_at: new Date(),
    });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getReports = async (req, res) => {
  try {
    console.log('DEBUG: Entering getReports controller, about to query Report.findAll');
    const reports = await Report.findAll({
      include: [
        { model: Post, as: 'post', include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }] },
        { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
      ],
      order: [['created_at', 'DESC']],
    });
    console.log('DEBUG: Reports array:', reports);
    res.json({ reports });
  } catch (err) {
    console.error('DEBUG: getReports error:', err);
    if (err && err.stack) console.error('DEBUG: getReports error stack:', err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteReportedPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    // Delete all reports for this post
    await Report.destroy({ where: { post_id: postId } });
    // Delete the post
    await Post.destroy({ where: { id: postId } });
    res.json({ message: "Post and its reports deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteOwnPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }
    // Delete post image from uploads folder if exists
    if (post.image_url) {
      const filePath = path.join(process.cwd(), post.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await post.destroy();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}; 