import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import { extractTextFromFile } from "../services/file.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {

    const { message, chat: chatId, mode, image, file, aiModel } = req.body;


    let title = null, chat = null;
    let fileName = null, fileText = null;

    if (file) {
        fileName = file.name;
        try {
            fileText = await extractTextFromFile(file);
        } catch (err) {
            fileText = "[Could not read this file's content]";
        }
    }

    if (!chatId) {
        const titleSeed = message?.trim() ? message : (fileName ? `File: ${fileName}` : "Shared an image");
        title = await generateChatTitle(titleSeed);
        chat = await chatModel.create({
            user: req.user.id,
            title
        })
    }

    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        image,
        fileName,
        fileText,
        role: "user"
    })

    const messages = await messageModel.find({ chat: chatId || chat._id })

    const result = await generateResponse(messages, mode, aiModel);

    const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: result.text,
        sources: result.sources,
        role: "ai"
    })

    res.status(201).json({
        title,
        chat,
        aiMessage
    })

}

/**
 * @desc Delete the last AI reply in a chat and generate a fresh one for
 *       the same conversation context
 * @route POST /api/chats/regenerate/:chatId
 * @access Private
 */
export async function regenerateResponse(req, res) {

    const { chatId } = req.params;
    const { mode, aiModel } = req.body;

    const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const lastMessage = await messageModel.findOne({ chat: chatId }).sort({ createdAt: -1 });

    if (!lastMessage || lastMessage.role !== "ai") {
        return res.status(400).json({
            message: "Nothing to regenerate"
        })
    }

    await messageModel.deleteOne({ _id: lastMessage._id });

    const messages = await messageModel.find({ chat: chatId });

    const result = await generateResponse(messages, mode, aiModel);

    const aiMessage = await messageModel.create({
        chat: chatId,
        content: result.text,
        sources: result.sources,
        role: "ai"
    })

    res.status(200).json({
        aiMessage
    })

}

export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}


/**
 * @desc Rename a chat's title
 * @route PATCH /api/chats/rename/:chatId
 * @access Private
 */
export async function renameChat(req, res) {

    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Title is required"
        })
    }

    const chat = await chatModel.findOneAndUpdate(
        { _id: chatId, user: req.user.id },
        { title: title.trim() },
        { new: true }
    )

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat renamed successfully",
        chat
    })
}