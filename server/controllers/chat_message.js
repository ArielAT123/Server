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

        await chat_message.save();
        const data = await chat_message.populate("user");
        io.sockets.in(chat_id).emit("message", data);
        io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);

        console.log(data); // Mostrar en consola la información del mensaje guardado

        return res.status(201).json({ message: "Enviado", data });
    } catch (error) {
        return res.status(400).send({ msg: "Error al enviar el mensaje", error });
    }
}
async function sendImage(req, res) { 
    try {
        const { chat_id } = req.body;
        const { user_id } = req.user;

        console.log(req.files.image);

        const chat_message = new ChatMessage({
            chat: chat_id,
            user: user_id,
            message: getFilePath(req.files.image),
            type: "IMAGE",
        });

        // Guardar el mensaje en la base de datos
        await chat_message.save();
        const data = await chat_message.populate("user");
        io.sockets.in(chat_id).emit("message", data);
        io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);


        // Responder con éxito
        res.status(201).json({ msg: "Imagen enviada con éxito", chat_message });

    } catch (error) {
        // Capturar errores y responder con código 400
        res.status(400).json({ msg: "Error al enviar el mensaje", error });
    }
}

async function getAll(req, res){
    const {chat_id} = req.params; 
    try {
        const messages = await ChatMessage.find({chat: chat_id}).sort({createdAt: 1}).populate("user");
        const total =    await ChatMessage.find({chat: chat_id}).countDocuments();
        res.status(200).send({messages, total});
    } catch (error) {
        res.status(500).send({msg: "Error del servidor"});
    }
}

async function getTotalMessages(req, res) {
    const {chat_id } =  req.params;
    try {
        const response = await ChatMessage.find({chat: chat_id }).countDocuments();
        res.status(200).send(JSON.stringify(response));
    } catch (error) {
        res.status(500).send({msg: "Error del servidor"})
        
    }
}

async function getLastMessage(req, res) {
    const {chat_id } =  req.params;
    try {
        const response = await ChatMessage.findOne({chat: chat_id }).sort({cretedAt: -1});
        res.status(200).send(response) || {};
    } catch (error) {
        res.status(500).send({msg: "Error del servidor"})
        
    }
}

export const ChatMessageController = {
    sendText,sendImage,getAll,getTotalMessages,getLastMessage,
};

