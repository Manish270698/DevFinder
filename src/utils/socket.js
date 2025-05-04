const socket = require("socket.io");
const crypto = require("node:crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

// Generate a unique room ID based on user IDs
const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

// Initialize Socket.io server
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", "https://dev-finder-j6pv.onrender.com"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    });

    // Optimized message sending
    socket.on(
      "sendMessage",
      async ({ userId, targetUserId, text, timestamp }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          // Optimistically broadcast the message BEFORE DB write
          io.to(roomId).emit("messageReceived", {
            senderId: userId,
            text,
            timestamp,
          });

          // Validate connection between users
          const connection = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: targetUserId },
              { fromUserId: targetUserId, toUserId: userId },
            ],
            status: "accepted",
          });

          if (!connection) {
            throw new Error("Connection doesn't exist.");
          }

          // Find or create chat document
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          // Append new message and save asynchronously
          chat.messages.push({ senderId: userId, text });
          chat
            .save()
            .catch((err) => console.error("Error saving message:", err));
        } catch (err) {
          console.error("Error in sendMessage:", err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
