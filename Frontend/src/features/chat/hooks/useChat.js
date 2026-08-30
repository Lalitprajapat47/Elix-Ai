import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat, renameChat, regenerateMessage } from "../service/chat.api";
import { setChats, removeChat, renameChatTitle, replaceLastMessage, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages } from "../chat.slice";
import { useDispatch } from "react-redux";


export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId, signal, mode, image, file }) {
        dispatch(setLoading(true))
        dispatch(setError(null))
        try {
            const data = await sendMessage({ message, chatId, signal, mode, image, file })
            const { chat, aiMessage } = data
            if (!chatId)
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }))
            dispatch(addNewMessage({
                chatId: chatId || chat._id,
                content: message,
                role: "user",
                image,
                fileName: file?.name,
            }))
            dispatch(addNewMessage({
                chatId: chatId || chat._id,
                content: aiMessage.content,
                role: aiMessage.role,
                sources: aiMessage.sources,
            }))
            dispatch(setCurrentChatId(chatId || chat._id))
        } catch (error) {
            if (error.code !== "ERR_CANCELED") {
                dispatch(setError(error.response?.data?.message || "Failed to send message"))
            }
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChat(chatId, chats) {

        if (chats[chatId]?.messages.length === 0) {
            const data = await getMessages(chatId)
            const { messages } = data

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
                image: msg.image,
                fileName: msg.fileName,
                sources: msg.sources,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
            dispatch(removeChat(chatId))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to delete chat"))
            throw error
        }
    }

    async function handleRenameChat(chatId, title) {
        try {
            await renameChat(chatId, title)
            dispatch(renameChatTitle({ chatId, title }))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to rename chat"))
            throw error
        }
    }

    async function handleRegenerateMessage({ chatId, mode, signal }) {
        dispatch(setLoading(true))
        dispatch(setError(null))
        try {
            const data = await regenerateMessage({ chatId, mode, signal })
            dispatch(replaceLastMessage({
                chatId,
                content: data.aiMessage.content,
                role: data.aiMessage.role,
                sources: data.aiMessage.sources,
            }))
        } catch (error) {
            if (error.code !== "ERR_CANCELED") {
                dispatch(setError(error.response?.data?.message || "Failed to regenerate response"))
            }
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleRenameChat,
        handleRegenerateMessage
    }

}