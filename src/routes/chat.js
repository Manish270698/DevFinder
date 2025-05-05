const express = require("express");
const chatRouter = express.Router();
const userAuth = require("../middlewares/userAuth");
const { Chat } = require("../models/chat");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query; // Default page and message count per page

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    // Paginate messages (latest first)
    const totalMessages = chat.messages.length;
    const messages = chat.messages
      .slice(-page * limit, -(page - 1) * limit)
      .reverse();

    res.json({
      messages,
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = chatRouter;
