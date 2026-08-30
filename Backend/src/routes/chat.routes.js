import { Router } from 'express';
import { sendMessage, getChats, getMessages, deleteChat, renameChat, regenerateResponse } from "../controllers/chat.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const chatRouter = Router();


chatRouter.post("/message", authUser, sendMessage)

chatRouter.post("/regenerate/:chatId", authUser, regenerateResponse)

chatRouter.get("/", authUser, getChats)

chatRouter.get("/:chatId/messages", authUser, getMessages)

chatRouter.delete("/delete/:chatId", authUser, deleteChat)

chatRouter.patch("/rename/:chatId", authUser, renameChat)

export default chatRouter;