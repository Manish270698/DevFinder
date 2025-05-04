const socket = require("socket.io");
const crypto = require("node:crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

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
    socket.on(
      "sendMessage",
      async ({ userId, targetUserId, text, timestamp }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          const connection = await ConnectionRequest.findOne({
            $or: [
              {
                fromUserId: userId,
                toUserId: targetUserId,
              },
              { fromUserId: targetUserId, toUserId: userId },
            ],
            status: "accepted",
          });
          if (connection) {
            // save message to DB
            let chat = await Chat.findOne({
              participants: { $all: [userId, targetUserId] },
            });

            if (!chat) {
              chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
                createdAt: timestamp,
              });
            }

            chat.messages.push({ senderId: userId, text });

            await chat.save();
            io.to(roomId).emit("messageReceived", {
              senderId: userId,
              receiverId: targetUserId,
              text,
              timestamp,
            });
          } else {
            throw new Error("Connection doesn't exist.");
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
