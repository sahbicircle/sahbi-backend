const Chat = require("../models/Chat");
const Event = require("../models/Event");

/**
 * Get or create an event chat. When a user books an event, add them to the event's group chat.
 * If no chat exists yet, create one with all current bookers.
 */
exports.getOrCreateEventChat = async (eventId, userIds) => {
  let chat = await Chat.findOne({
    type: "event",
    event: eventId,
  }).populate("event", "title");

  if (!chat) {
    chat = new Chat({
      type: "event",
      event: eventId,
      participants: [...userIds],
      messages: [],
    });
    await chat.save();
  } else {
    // Add any new participants that aren't already in the chat
    const existingIds = chat.participants.map((p) => p.toString());
    const toAdd = userIds.filter((id) => !existingIds.includes(id.toString()));
    if (toAdd.length > 0) {
      chat.participants.push(...toAdd);
      await chat.save();
    }
  }

  return chat;
};

/**
 * Get or create a private chat between two users (for mutual likes).
 */
exports.getOrCreatePrivateChat = async (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();

  const chats = await Chat.find({
    type: "private",
    participants: { $all: [userId1, userId2] },
  });
  let chat = chats.find((c) => c.participants.length === 2);

  if (!chat) {
    chat = new Chat({
      type: "private",
      event: null,
      participants: [userId1, userId2],
      messages: [],
    });
    await chat.save();
  }

  return chat;
};
