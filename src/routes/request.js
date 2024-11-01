const express = require("express");

const userAuth = require("../middlewares/userAuth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status.toLocaleLowerCase())) {
        return res.status(400).json({ message: `Invalid status: ${status}` });
      }

      const toUser = await User.findById(toUserId);

      if (!toUser) {
        return res
          .status(400)
          .json({ message: "User doesn't exist!", toUserId });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res.status(400).json({ message: "Request already exists!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: `Request sent with status: ${status}`,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["rejected", "accepted"];
      if (!allowedStatus.includes(status.toLowerCase())) {
        return res.status(400).json({ message: `Invalid status: ${status}` });
      }

      // Check if connection request exists with status interested
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: `Connection request not found` });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({
        message: `Connection request sent with status: ${status}`,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

module.exports = requestRouter;
