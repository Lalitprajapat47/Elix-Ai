import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
})


export const sendMessage = async ({ message, chatId, signal, mode, image, file, aiModel }) => {
    const response = await api.post("/api/chats/message", { message, chat: chatId, mode, image, file, aiModel }, { signal })
    return response.data
}

export const getChats = async () => {
    const response = await api.get("/api/chats")
    return response.data
}

export const getMessages = async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`)
    return response.data
}

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`)
    return response.data
}

export const renameChat = async (chatId, title) => {
    const response = await api.patch(`/api/chats/rename/${chatId}`, { title })
    return response.data
}

export const regenerateMessage = async ({ chatId, mode, signal, aiModel }) => {
    const response = await api.post(`/api/chats/regenerate/${chatId}`, { mode, aiModel }, { signal })
    return response.data
}