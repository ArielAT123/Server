import { Group, User, GroupMessage } from "../models/index.js";
import { getFilePath } from "../utils/index.js";
import mongoose from "mongoose";

async function create(req, res) {
    try {
        const { user_id } = req.user;
        const group = new Group(req.body);
        group.creator = user_id;
        group.participants = JSON.parse(req.body.participants);
        group.participants = [...group.participants, user_id];

        if (req.files?.image) {
            const imagePath = getFilePath(req.files.image);
            group.image = imagePath;
        }

        try {
            const groupStorage = await group.save();
            return res.status(201).json(groupStorage);
        } catch (error) {
            console.error("Error al guardar el grupo:", error);
            return res.status(400).json({ msg: "Error al crear el grupo", error });
        }
    } catch (error) {
        console.error("Error en create:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function getAll(req, res) {
    try {
        const { user_id } = req.user;

        const groups = await Group.find({ participants: user_id })
            .populate("creator")
            .populate("participants");

        const arrayGroups = [];
        for await (const group of groups) {
            try {
                const response = await GroupMessage.findOne({ group: group._id })
                    .sort({ createdAt: -1 })
                    .select("createdAt");

                arrayGroups.push({
                    ...group._doc,
                    last_message_date: response?.createdAt || null,
                });
            } catch (error) {
                console.error(`Error obteniendo el último mensaje del grupo ${group._id}:`, error);
            }
        }

        return res.status(200).json(arrayGroups);
    } catch (error) {
        console.error("Error en getAll:", error);
        return res.status(500).json({ msg: "Error al obtener los grupos", error });
    }
}

async function getGroup(req, res) {
    try {
        const group_id = req.params.id;
        const groupStorage = await Group.findById(group_id).populate("participants");

        if (!groupStorage) {
            return res.status(404).json({ msg: "No se ha encontrado el grupo" });
        }

        return res.status(200).json(groupStorage);
    } catch (error) {
        console.error("Error en getGroup:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function updateGroup(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        let group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ msg: "No se ha encontrado el grupo" });
        }

        if (name) group.name = name;

        if (req.files?.image) {
            const imagePath = getFilePath(req.files.image);
            group.image = imagePath;
        }

        group = await Group.findByIdAndUpdate(id, group, { new: true });

        return res.status(200).json({ image: group.image, name: group.name });
    } catch (error) {
        console.error("Error en updateGroup:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function exitGroup(req, res) {
    try {
        const { id } = req.params;
        const { user_id } = req.user;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ msg: "Grupo no encontrado" });
        }

        const newParticipants = group.participants.filter(
            (participant) => participant.toString() !== user_id
        );

        await Group.findByIdAndUpdate(id, { participants: newParticipants });

        return res.status(200).json({ msg: "Salida exitosa" });
    } catch (error) {
        console.error("Error en exitGroup:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function addParticipants(req, res) {
    try {
        const { id } = req.params;
        let { users_id } = req.body;

        if (typeof users_id === "string") {
            try {
                users_id = JSON.parse(users_id);
            } catch (parseError) {
                return res.status(400).json({ msg: "Formato incorrecto en users_id.", error: parseError.message });
            }
        }

        if (!Array.isArray(users_id) || users_id.length === 0) {
            return res.status(400).json({ msg: "users_id debe ser un array no vacío." });
        }

        const objectIds = users_id
            .map((userId) => (mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null))
            .filter(Boolean);

        if (objectIds.length === 0) {
            return res.status(400).json({ msg: "Ningún user_id es válido." });
        }

        const users = await User.find({ _id: { $in: objectIds } });
        if (users.length === 0) {
            return res.status(400).json({ msg: "No se encontraron usuarios válidos en la base de datos." });
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { $addToSet: { participants: { $each: objectIds } } },
            { new: true }
        );

        return res.status(200).json({ msg: "Participantes añadidos correctamente", group: updatedGroup });
    } catch (error) {
        console.error("Error en addParticipants:", error);
        return res.status(500).json({ msg: "Error del servidor", error: error.message || error });
    }
}

async function banParticipant(req, res) {
    try {
        const { group_id, user_id } = req.body;

        const group = await Group.findById(group_id);
        if (!group) {
            return res.status(404).json({ msg: "Grupo no encontrado" });
        }

        const newParticipants = group.participants.filter(
            (participant) => participant.toString() !== user_id
        );

        await Group.findByIdAndUpdate(group_id, { participants: newParticipants });

        return res.status(200).json({ msg: "Participante baneado correctamente" });
    } catch (error) {
        console.error("Error en banParticipant:", error);
        return res.status(500).json({ msg: "Error del servidor", error });
    }
}

export const GroupController = {
    create,
    getAll,
    getGroup,
    updateGroup,
    exitGroup,
    addParticipants,
    banParticipant,
};
