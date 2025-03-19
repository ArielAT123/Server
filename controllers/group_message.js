import { GroupMessage } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";

async function sendText(req, res) {
    try {
        const { group_id, message } = req.body;
        const { user_id } = req.user;

        const group_message = new GroupMessage({
            group: group_id,
            user: user_id,
            message,
            type: "TEXT",
        });

        // Guardar mensaje con manejo de error
        try {
            await group_message.save();
        } catch (error) {
            console.error("Error al guardar el mensaje:", error);
            return res.status(500).json({ msg: "Error al enviar el mensaje", error });
        }

        const populatedMessage = await group_message.populate("user");
        io.sockets.in(group_id).emit("message", populatedMessage);
        io.sockets.in(`${group_id}_notify`).emit("message_notify", populatedMessage);

        return res.status(201).json({ message: "Mensaje enviado", data: populatedMessage });
    } catch (error) {
        console.error("Error en sendText:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function sendImage(req, res) {
    try {
        const { group_id } = req.body;
        const { user_id } = req.user;

        if (!req.files?.image) {
            return res.status(400).json({ msg: "No se ha enviado ninguna imagen." });
        }

        const group_message = new GroupMessage({
            group: group_id,
            user: user_id,
            message: getFilePath(req.files.image),
            type: "IMAGE",
        });

        // Guardar mensaje con manejo de error
        try {
            await group_message.save();
        } catch (error) {
            console.error("Error al guardar la imagen:", error);
            return res.status(500).json({ msg: "Error al enviar la imagen", error });
        }

        const populatedMessage = await group_message.populate("user");
        io.sockets.in(group_id).emit("message", populatedMessage);
        io.sockets.in(`${group_id}_notify`).emit("message_notify", populatedMessage);

        return res.status(201).json({ message: "Imagen enviada con éxito", data: populatedMessage });
    } catch (error) {
        console.error("Error en sendImage:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function getAll(req, res) {
    try {
        const { group_id } = req.params;

        // Ejecutar ambas consultas en paralelo
        const [messages, total] = await Promise.all([
            GroupMessage.find({ group: group_id }).sort({ createdAt: 1 }).populate("user"),
            GroupMessage.countDocuments({ group: group_id })
        ]);

        return res.status(200).json({ messages, total });
    } catch (error) {
        console.error("Error en getAll:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function getTotalMessages(req, res) {
    try {
        const { group_id } = req.params;
        const total = await GroupMessage.countDocuments({ group: group_id }) || 0;
        return res.status(200).json({ total });
    } catch (error) {
        console.error("Error en getTotalMessages:", error);
        return res.status(500).json({ msg: "Error del servidor" });
    }
}

async function getLastMessage(req, res) {
    try {
        const { group_id } = req.params;
        const response = await GroupMessage.findOne({ group: group_id })
            .sort({ createdAt: -1 })
            .populate("user");

        return res.status(200).json(response ?? {});
    } catch (error) {
        console.error("Error en getLastMessage:", error);
        return res.status(500).json({ msg: "Error del servidor" });
    }
}

export const GroupMessageController = {
    sendText,
    sendImage,
    getAll,
    getTotalMessages,
    getLastMessage,
};
