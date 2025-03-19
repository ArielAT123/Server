import { Group, User } from "../models/index.js";
import { getFilePath } from "../utils/index.js";

async function getMe(req, res) {
    const { user_id } = req.user;

    try {
        const response = await User.findById(user_id).select(["-password"]);
        
        if (!response) {
            return res.status(400).send({ msg: "No se ha encontrado el usuario" });
        }

        return res.status(200).send(response);
    } catch (error) {
        console.error("Error en getMe:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

async function getUsers(req, res) {
    try {
        const { user_id } = req.user;
        const users = await User.find({ _id: { $ne: user_id } }).select(["-password"]);

        if (!users || users.length === 0) {
            return res.status(400).send({ msg: "No se han encontrado usuarios" });
        }

        return res.status(200).send(users);
    } catch (error) {
        console.error("Error en getUsers:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

async function getUser(req, res) {
    const { id } = req.params;

    try {
        const response = await User.findById(id).select(["-password"]);

        if (!response) {
            return res.status(400).send({ msg: "No se ha encontrado el usuario" });
        }

        return res.status(200).send(response);
    } catch (error) {
        console.error("Error en getUser:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

async function updateUser(req, res) {
    try {
        const { user_id } = req.user;
        const userData = req.body;

        if (req.files?.avatar) {
            const imagePath = getFilePath(req.files.avatar);
            userData.avatar = imagePath;
        }

        const response = await User.findByIdAndUpdate(user_id, userData, { new: true });

        if (!response) {
            return res.status(400).send({ msg: "Error al actualizar el usuario" });
        }

        return res.status(200).send(response);
    } catch (error) {
        console.error("Error en updateUser:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

async function getUsersExeptParticipantsGroup(req, res) {
    try {
        const { group_id } = req.params;

        console.log(req);

        const group = await Group.findById(group_id);
        if (!group) {
            return res.status(404).send({ msg: "Grupo no encontrado" });
        }

        const participants = group.participants.map(participant => participant.toString());

        const response = await User.find({ _id: { $nin: participants } }).select(["-password"]);

        if (!response || response.length === 0) {
            return res.status(400).send({ msg: "No se ha encontrado ningún usuario" });
        }

        return res.status(200).send(response);
    } catch (error) {
        console.error("Error en getUsersExeptParticipantsGroup:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

export const UserController = {
    getMe,
    getUsers,
    getUser,
    updateUser,
    getUsersExeptParticipantsGroup,
};
