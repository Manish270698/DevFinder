const socket = require("socket.io");
const crypto = require("node:crypto");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    });
    socket.on("sendMessage", ({ userId, targetUserId, text, timestamp }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      io.to(roomId).emit("messageReceived", {
        senderId: userId,
        receiverId: targetUserId,
        text,
        timestamp,
      });
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
