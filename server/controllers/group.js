import { Group, User, GroupMessage } from "../models/index.js";
import { getFilePath } from "../utils/index.js";
import mongoose from "mongoose";

async function create(req, res) {
    try {
        // Crear el objeto Group con los datos recibidos
        const{user_id}= req.user
        const group = new Group(req.body);
        group.creator = user_id;
        group.participants = JSON.parse(req.body.participants);
        group.participants=[...group.participants, user_id]
        // Si hay imagen, obtener la ruta y asignarla
        if (req.files?.image) {
            const imagePath = getFilePath(req.files.image);
            group.image = imagePath;
        }

        // Guardar el grupo en la base de datos
        const groupStorage = await group.save();

        // Si el grupo se guarda correctamente, responder con éxito
        res.status(200).json(groupStorage);
    } catch (error) {
        // Capturar errores y enviar una respuesta de error
        res.status(500).json({ msg: "Error del servidor", error });
    }
}
async function getAll(req, res) {
    try {
        const { user_id } = req.user;

        // Obtener los grupos en los que participa el usuario
        const groups = await Group.find({ participants: user_id })
            .populate("creator")
            .populate("participants")
            .exec();

        // Obtener fecha del último mensaje de cada grupo
        const arrayGroups = [];
        for await (const group of groups) {
            try {
                // Buscar el último mensaje del grupo
                const response = await GroupMessage.findOne({ group: group._id })
                    .sort({ createdAt: -1 })
                    .select("createdAt") // Solo recuperar el campo necesario
                    .exec();

                console.log(`Grupo: ${group._id}, Último mensaje encontrado:`, response);

                arrayGroups.push({
                    ...group._doc,
                    last_message_date: response?.createdAt || null,
                });
            } catch (error) {
                console.error(`Error obteniendo el último mensaje del grupo ${group._id}:`, error);
            }
        }

        res.status(200).json(arrayGroups);
    } catch (error) {
        console.error("Error en getAll:", error);
        res.status(500).json({ msg: "Error al obtener los grupos", error });
    }
}

async function getGroup(req, res) {
    try {
        const group_id = req.params.id;

        // Buscar grupo por ID
        const groupStorage = await Group.findById(group_id).populate("participants");

        // Si no se encuentra el grupo, enviar respuesta con código 400
        if (!groupStorage) {
            return res.status(400).json({ msg: "No se ha encontrado el grupo" });
        }

        // Enviar la respuesta con el grupo encontrado
        res.status(200).json(groupStorage);
    } catch (error) {
        res.status(500).json({ msg: "Error del servidor", error });
    }
}

async function updateGroup(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body; // Se añadió `name` para corregir el error de destructuración

        // Buscar el grupo por ID
        let group = await Group.findById(id);
        if (!group) {
            return res.status(400).json({ msg: "No se ha encontrado el grupo" });
        }

        // Actualizar el nombre si se proporciona
        if (name) group.name = name;

        // Actualizar la imagen si se proporciona
        if (req.files?.image) {
            const imagePath = getFilePath(req.files.image);
            group.image = imagePath;
        }

        // Guardar cambios en la base de datos
        group = await Group.findByIdAndUpdate(id, group, { new: true });

        res.status(200).json({ image: group.image, name: group.name });

    } catch (error) {
        res.status(500).json({ msg: "Error del servidor", error });
    }
}
async function exitGroup(req, res){
    const {id} = req.params;
    const { user_id } = req.user;
    const group = await Group.findById(id);
    const newParticipants = group.participants.filter((participant)=>
            participant.toString() !== user_id);
    const newData = {
        ...group._doc,
        participants: newParticipants,
    }
    await Group.findByIdAndUpdate( id, newData );
    res.status(200).send({msg: "Salida Exitosa"});
}


async function addParticipants(req, res) {
    try {
        const { id } = req.params;
        let { users_id } = req.body;

        // 🔹 Si `users_id` es una cadena, convertirlo en array
        if (typeof users_id === "string") {
            try {
                users_id = JSON.parse(users_id);
            } catch (parseError) {
                return res.status(400).json({ msg: "Formato incorrecto en users_id. Debe ser un array.", error: parseError.message });
            }
        }

        if (!Array.isArray(users_id) || users_id.length === 0) {
            return res.status(400).json({ msg: "users_id debe ser un array no vacío." });
        }

        // 🔹 Convertir cada `user_id` en un `ObjectId`
        const objectIds = users_id.map(userId => {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return null;
            }
            return new mongoose.Types.ObjectId(userId);
        }).filter(Boolean); // Filtramos los `null` en caso de IDs inválidos.

        if (objectIds.length === 0) {
            return res.status(400).json({ msg: "Ningún user_id es válido." });
        }

        // 🔹 Verificar si los usuarios existen en la base de datos
        const users = await User.find({ _id: { $in: objectIds } });
        if (users.length === 0) {
            return res.status(400).json({ msg: "No se encontraron usuarios válidos en la base de datos." });
        }

        // 🔹 Buscar el grupo
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ msg: "No se encontró el grupo" });
        }

        // 🔹 Añadir nuevos participantes sin duplicados
        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { $addToSet: { participants: { $each: objectIds } } }, // `$addToSet` evita duplicados
            { new: true }
        );

        return res.status(200).json({ msg: "Participantes añadidos correctamente", group: updatedGroup });

    } catch (error) {
        console.error("🔥 Error en addParticipants:", error);
        return res.status(500).json({ msg: "Error del servidor", error: error.message || error });
    }
}

async function banParticipant(req, res) {
    try {
        const { group_id, user_id } = req.body;

        // Buscar el grupo en la base de datos
        const group = await Group.findById(group_id);
        if (!group) {
            return res.status(404).send({ msg: "Grupo no encontrado" });
        }

        console.log(group);

        // Filtrar a los participantes excluyendo al usuario baneado
        const newParticipants = group.participants.filter(
            (participant) => participant.toString() !== user_id
        );

        const newData = {
            ...group._doc,
            participants: newParticipants,
        };

        console.log(newData); // Aquí se usa correctamente `newData`

        // Actualizar el grupo en la base de datos
        await Group.findByIdAndUpdate(group_id, newData);

        return res.status(200).send({ msg: "Participante baneado correctamente" });
    } catch (error) {
        console.error("Error al banear al participante:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

export const GroupController = {
    create,
    getAll,
    getGroup,
    updateGroup,
    exitGroup,
    addParticipants,
    banParticipant

};
