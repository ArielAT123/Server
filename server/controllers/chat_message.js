import { ChatMessage } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";

async function sendText(req, res) {
    try {
        const { chat_id, message } = req.body;
        const { user_id } = req.user;

        const chat_message = new ChatMessage({
            chat: chat_id,
            user: user_id,
            message,
            type: "TEXT",
        });

        // Guardar mensaje con manejo de error
        try {
            await chat_message.save();
        } catch (error) {
            console.error("Error al guardar el mensaje:", error);
            return res.status(400).json({ msg: "Error al enviar el mensaje", error });
        }

        const data = await chat_message.populate("user");
        io.sockets.in(chat_id).emit("message", data);
        io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);

        console.log(data); // Mostrar en consola la información del mensaje guardado

        return res.status(201).json({ message: "Enviado", data });
    } catch (error) {
        console.error("Error en sendText:", error);
        return res.status(400).send({ msg: "Error al enviar el mensaje", error });
    }
}

async function sendImage(req, res) {
    try {
        const { chat_id } = req.body;
        const { user_id } = req.user;

        if (!req.files?.image) {
            return res.status(400).json({ msg: "No se ha enviado ninguna imagen." });
        }

        const chat_message = new ChatMessage({
            chat: chat_id,
            user: user_id,
            message: getFilePath(req.files.image),
            type: "IMAGE",
        });

        // Guardar mensaje con manejo de error
        try {
            await chat_message.save();
        } catch (error) {
            console.error("Error al guardar la imagen:", error);
            return res.status(400).json({ msg: "Error al enviar la imagen", error });
        }

        const data = await chat_message.populate("user");
        io.sockets.in(chat_id).emit("message", data);
        io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);

        return res.status(201).json({ msg: "Imagen enviada con éxito", data });
    } catch (error) {
        console.error("Error en sendImage:", error);
        return res.status(400).json({ msg: "Error al enviar el mensaje", error });
    }
}

async function getAll(req, res) {
    const { chat_id } = req.params;
    try {
        const messages = await ChatMessage.find({ chat: chat_id })
            .sort({ createdAt: 1 })
            .populate("user");

        const total = await ChatMessage.countDocuments({ chat: chat_id }) || 0;

        res.status(200).send({ messages, total });
    } catch (error) {
        console.error("Error en getAll:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
}

async function getTotalMessages(req, res) {
    const { chat_id } = req.params;
    try {
        const total = await ChatMessage.countDocuments({ chat: chat_id }) || 0;
        res.status(200).send({ total });
    } catch (error) {
        console.error("Error en getTotalMessages:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
}

async function getLastMessage(req, res) {
    const { chat_id } = req.params;
    try {
        const response = await ChatMessage.findOne({ chat: chat_id })
            .sort({ createdAt: -1 })
            .populate("user");

        res.status(200).send(response ?? {});
    } catch (error) {
        console.error("Error en getLastMessage:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
}

export const ChatMessageController = {
    sendText,
    sendImage,
    getAll,
    getTotalMessages,
    getLastMessage,
};
