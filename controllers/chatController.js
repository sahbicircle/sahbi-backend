const Chat = require("../models/Chat");
const User = require("../models/User");

exports.getChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id)
      .populate("participants", "firstName lastName photoUrl")
      .populate("event", "title date")
      .lean();

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user.id.toString(),
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const currentUserId = req.user.id.toString();
    let title;
    if (chat.type === "event" && chat.event) {
      title = chat.event.title || "Event chat";
    } else if (chat.type === "private" && chat.participants) {
      const other = chat.participants.find(
        (p) => p._id.toString() !== currentUserId,
      );
      title = other
        ? `${other.firstName || ""} ${other.lastName || ""}`.trim() || "Private chat"
        : "Private chat";
    } else {
      title = "Chat";
    }

    res.json({ id: chat._id, title, type: chat.type, event: chat.event });
  } catch (err) {
    console.error("getChat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate("participants", "firstName lastName photoUrl")
      .populate("event", "title date")
      .sort({ updatedAt: -1 })
      .lean();

    const currentUserId = req.user.id.toString();

    const formatted = chats.map((chat) => {
      const lastMsg = chat.messages?.length
        ? chat.messages[chat.messages.length - 1]
        : null;

      let title;
      if (chat.type === "event" && chat.event) {
        title = chat.event.title || "Event chat";
      } else if (chat.type === "private" && chat.participants) {
        const other = chat.participants.find(
          (p) => p._id.toString() !== currentUserId,
        );
        title = other
          ? `${other.firstName || ""} ${other.lastName || ""}`.trim() || "Private chat"
          : "Private chat";
      } else {
        title = "Chat";
      }

      return {
        id: chat._id,
        _id: chat._id,
        type: chat.type,
        title,
        lastMessage: lastMsg?.message || null,
        lastMessageAt: lastMsg?.timestamp || chat.updatedAt,
        event: chat.event,
        participants: chat.participants,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("getChats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const chat = await Chat.findById(chatId).populate(
      "messages.sender",
      "firstName lastName",
    );

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user.id.toString(),
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const messages = (chat.messages || []).map((m) => ({
      id: m._id,
      text: m.message,
      sender: m.sender?._id,
      senderName: m.sender
        ? `${m.sender.firstName || ""} ${m.sender.lastName || ""}`.trim() || "Unknown"
        : "Unknown",
      timestamp: m.timestamp,
    }));

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text required" });
    }

    const chat = await Chat.findById(chatId).populate(
      "messages.sender",
      "firstName lastName",
    );

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user.id.toString(),
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not a participant" });
    }

    chat.messages.push({
      sender: req.user.id,
      message: text.trim(),
    });
    await chat.save();

    const lastMsg = chat.messages[chat.messages.length - 1];
    await chat.populate("messages.sender", "firstName lastName");
    const populatedMsg = chat.messages[chat.messages.length - 1];

    res.json({
      id: lastMsg._id,
      text: lastMsg.message,
      sender: req.user.id,
      senderName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "You",
      timestamp: lastMsg.timestamp,
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
