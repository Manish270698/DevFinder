const express = require("express");
const userAuth = require("../middlewares/userAuth");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();

const USER_SAFE_FIELDS = "firstName lastName age skills gender photoUrl";

// Get all the pending request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    console.log(loggedInUser._id);

    const pendingReuqests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_FIELDS);

    res.json({ data: pendingReuqests });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionsData = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS);

    const data = connectionsData.map((row) => {
      console.log(row.toUserId.toString());
      if (row.toUserId.toString() === loggedInUser._id.toString()) {
        console.log("Hello");
        return row.fromUserId;
      }
      return row.toUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;
