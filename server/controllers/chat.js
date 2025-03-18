import { Chat, ChatMessage } from "../models/index.js";

async function create(req, res) {
    const {participant_id_one, participant_id_two} = req.body;

    const foundOne = await Chat.findOne({
        participant_one: participant_id_one, 
        participant_two: participant_id_two,
    });

    const foundTwo = await Chat.findOne({
        participant_one: participant_id_two,  
        participant_two: participant_id_one,
    });

    if(foundOne || foundTwo){
        res.status(200).send({ msg: "Ya tienes un chat con este usuario"})
        return;
    }

    const chat = new Chat({
        participant_one: participant_id_one,
        participant_two: participant_id_two,
    });
    
    try {
        const chatStorage = await chat.save();
        res.status(201).send(chatStorage);
    } catch (error) {
        res.status(400).send({ msg: "Error al crear el chat", error });
    }
    
}

async function getAll(req, res) {
    try {
        const { user_id } = req.user;  // ✅ Obtiene el ID del usuario autenticado

        const chats = await Chat.find({
            $or: [{ participant_one: user_id }, { participant_two: user_id }]
        })
        .populate("participant_one")  // ✅ Agrega datos de los participantes
        .populate("participant_two");

        const arrayChats = [];
        for await(const chat of chats){
            const response = await  ChatMessage.findOne({char: chat._id}).sort({createdAt: -1})
            arrayChats.push({
            ...chat._doc, last_message_date: response?.createdAt || null
            });   
        }

        res.status(200).send(arrayChats);
    } catch (error) {
        res.status(500).send({ msg: "Error al obtener los chats", error });
    }

    
}

export const deleteChat = async (req, res) => {
    try {
        const { chat_id } = req.params; // Asegúrate de que el ID se obtiene correctamente

        // ✅ Usa await en lugar de callback
        const deletedChat = await Chat.findByIdAndDelete(chat_id);

        res.status(200).json({ message: 'Chat eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el chat', error });
    }
};
    

async function getChat(req, res) {
    try {
        const chat_id = req.params.id;
        const chatStorage = await Chat.findById(chat_id)
            .populate("participant_one")
            .populate("participant_two"); // ✅ Usamos await en lugar de callback y añadimos populate

        if (!chatStorage) {
            return res.status(404).send({ msg: "Chat no encontrado" });
        }

        res.status(200).send(chatStorage);

    } catch (error) {
        res.status(500).send({ msg: "Error al obtener el chat", error });
    }
}



export const ChatController = {
    create,
    getAll,
    deleteChat,
    getChat,
};