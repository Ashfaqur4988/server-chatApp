import { getReceiverSocketId, io } from "../socket/socket.js";
import prisma from "../util/prisma.js";

export const sendMessage = async (req, res) => {
  const { message } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.userId;

  //check if conversation exists
  let conversation = await prisma.conversation.findFirst({
    where: {
      participantIds: {
        hasEvery: [senderId, receiverId],
      },
    },
  });

  //if not exists then start new conversation
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantIds: {
          set: [senderId, receiverId],
        },
      },
    });
  }

  //create the new message
  const newMessage = await prisma.message.create({
    data: {
      senderId,
      body: message,
      conversationsId: conversation.id,
    },
  });

  //add the message in conversation
  if (newMessage) {
    conversation = await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        messages: {
          connect: { id: newMessage.id },
        },
      },
    });
  }

  //socket io will go here
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res.status(201).json(newMessage);
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error sending message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.userId;
    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, userToChatId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "cannot get message" });
  }
};

export const getUsersForSidebar = async (req, res) => {
  const authUserId = req.userId;

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: authUserId,
      },
    },
    select: {
      id: true,
      username: true,
      profilePic: true,
    },
  });
  res.status(200).json(users);
  try {
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "cannot get user conversations for sidebar" });
  }
};
