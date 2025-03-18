import { Chat, ChatMessage } from "../models/index.js";

async function create(req, res) {
    try {
        const { participant_id_one, participant_id_two } = req.body;

        // Verificar si ya existe un chat entre los usuarios
        const foundChat = await Chat.findOne({
            $or: [
                { participant_one: participant_id_one, participant_two: participant_id_two },
                { participant_one: participant_id_two, participant_two: participant_id_one }
            ]
        });

        if (foundChat) {
            return res.status(200).json({ msg: "Ya tienes un chat con este usuario" });
        }

        // Crear un nuevo chat
        const chat = new Chat({ participant_one: participant_id_one, participant_two: participant_id_two });

        // Guardar en base de datos con manejo de error
        try {
            const chatStorage = await chat.save();
            return res.status(201).json(chatStorage);
        } catch (error) {
            console.error("Error al guardar el chat:", error);
            return res.status(400).json({ msg: "Error al crear el chat", error });
        }
    } catch (error) {
        console.error("Error en create:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function getAll(req, res) {
    try {
        const { user_id } = req.user;

        // Buscar chats donde el usuario sea participante
        const chats = await Chat.find({
            $or: [{ participant_one: user_id }, { participant_two: user_id }]
        })
        .populate("participant_one")
        .populate("participant_two");

        const arrayChats = [];
        for await (const chat of chats) {
            const response = await ChatMessage.findOne({ chat: chat._id })
                .sort({ createdAt: -1 })
                .select("createdAt");

            arrayChats.push({
                ...chat._doc,
                last_message_date: response?.createdAt || null
            });
        }

        return res.status(200).json(arrayChats);
    } catch (error) {
        console.error("Error en getAll:", error);
        return res.status(500).json({ msg: "Error al obtener los chats", error });
    }
}

async function deleteChat(req, res) {
    try {
        const { chat_id } = req.params;

        // Eliminar el chat con manejo de error
        const deletedChat = await Chat.findByIdAndDelete(chat_id);
        if (!deletedChat) {
            return res.status(404).json({ msg: "El chat no existe" });
        }

        return res.status(200).json({ msg: "Chat eliminado correctamente" });
    } catch (error) {
        console.error("Error en deleteChat:", error);
        return res.status(500).json({ msg: "Error al eliminar el chat", error });
    }
}

async function getChat(req, res) {
    try {
        const { id } = req.params;

        // Buscar el chat por ID
        const chatStorage = await Chat.findById(id)
            .populate("participant_one")
            .populate("participant_two");

        if (!chatStorage) {
            return res.status(404).json({ msg: "Chat no encontrado" });
        }

        return res.status(200).json(chatStorage);
    } catch (error) {
        console.error("Error en getChat:", error);
        return res.status(500).json({ msg: "Error al obtener el chat", error });
    }
}

export const ChatController = {
    create,
    getAll,
    deleteChat,
    getChat,
};
