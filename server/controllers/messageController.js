import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

/* ---------- get all users except the logged‑in user ---------- */
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;                              // fixed .id → ._id
    const filteredUsers = await User
      .find({ _id: { $ne: userId } })
      .select("-password");

    // count unseen messages per user
    const unseenMessages = {};
    const jobs = filteredUsers.map(async user => {
      const msgs = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (msgs.length) unseenMessages[user._id] = msgs.length;
    });
    await Promise.all(jobs);

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

/* ---------- get all messages for the selected user ---------- */
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;                // kept “capital U” per your choice
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId,            receiverId: selectedUserId },
        { senderId: selectedUserId,  receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true },
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

/* ---------- mark a single message as seen ---------- */
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

/* ---------- send a message to the selected user ---------- */
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // emit real‑time event to receiver if online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
