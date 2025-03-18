import { GroupMessage } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";

async function sendText(req, res) {
    try {
        const { group_id, message } = req.body;
        const { user_id } = req.user;

        // Crear una nueva instancia del mensaje de grupo
        const group_message = new GroupMessage({
            group: group_id,
            user: user_id,
            message,
            type: "TEXT",
        });

        // Guardar el mensaje en la base de datos
        const savedMessage = await group_message.save();

        // Poblar el usuario para obtener más detalles
        const populatedMessage = await savedMessage.populate("user");

        // Emitir eventos a los sockets del grupo
        io.sockets.in(group_id).emit("message", populatedMessage);
        io.sockets.in(`${group_id}_notify`).emit("message_notify", populatedMessage);

        // Responder con éxito
        res.status(201).send({ message: "Mensaje enviado", data: populatedMessage });

    } catch (error) {
        console.error("Error en sendText:", error);
        res.status(500).send({ msg: "Error del servidor", error: error.message });
    }
}

async function sendImage(req, res) {
    try {
        const { group_id } = req.body;
        const { user_id } = req.user;

        //console.log(req);
        
        // Verificar si hay archivos adjuntos
        if (!req.files || !req.files.image) {
            return res.status(400).send({ msg: "No se ha enviado ninguna imagen." });
        }

        

        const group_message = new GroupMessage({
            group: group_id,
            user: user_id,
            message: getFilePath(req.files.image),
            type: "IMAGE",
        });

        // Guardar el mensaje en la base de datos
        const savedMessage = await group_message.save();

        // Poblar el usuario para obtener más detalles
        const data = await savedMessage.populate("user");

        // Emitir eventos a los sockets del grupo
        io.sockets.in(group_id).emit("message", data);
        io.sockets.in(`${group_id}_notify`).emit("message_notify", data);

        // Responder con éxito
        res.status(201).send({ message: "Imagen enviada con éxito", data });

    } catch (error) {
        console.error("Error en sendImage:", error);
        res.status(500).send({ msg: "Error del servidor", error: error.message });
    }
}

async function getAll(req, res) {
    const { group_id } = req.params;

    try {
        // Ejecutar ambas consultas en paralelo para mejorar el rendimiento
        const [messages, total] = await Promise.all([
            GroupMessage.find({ group: group_id })
                .sort({ createdAt: 1 })
                .populate("user"),
            GroupMessage.countDocuments({ group: group_id }) // Método recomendado
        ]);

        res.status(200).send({ messages, total });
    } catch (error) {
        console.error("Error en getAll:", error);
        res.status(500).send({ msg: "Error del servidor", error: error.message });
    }
}

async function getTotalMessages(req, res) {
    const { group_id } = req.params;

    try {
        const total = await GroupMessage.find({ group: group_id });
        res.status(200).send(JSON.stringify(total));
    } catch (error) {
        res.status(500).send({ msg: "Error del servidor" });
    }
}

async function getLastMessage(req, res) {
    const { group_id } = req.params;

    try {
        const response = await GroupMessage.findOne({ group: group_id })
            .sort({ createdAt: -1 })
            .populate("user");

        res.status(200).send(response || {});
    } catch (error) {
        res.status(500).send({ msg: "Error del servidor" });
    }
}


export const GroupMessageController = {
    sendText,
    sendImage,
    getAll,
    getTotalMessages,
    getLastMessage,
};
