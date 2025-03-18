import { Group , User } from "../models/index.js";
import {getFilePath} from "../utils/index.js";


async function getMe(req, res){
    const{ user_id }= req.user;
    try {
        const response = await User.findById(user_id).select(["-password"]);
        if(!response){
        res.status(400).send({msg: "No se ha encontrado el usuario"});
        }
    res.status(200).send(response);
        
    } catch (error) {
        res.status(500).send({msg: "Error el servidor"})
        
    }
    
}

async function getUsers(req, res){
    try {   
        const { user_id } = req.user;
        const users = await User.find({_id: { $ne: user_id } }).select(["-password"]);
        if(!users){
            res.status(400).send({msg: "No se han encontrado usuarios"})

        }else{
            res.status(200).send(users);
        }

        
    } catch (error) {
        res.status(500).send({msg: "Error del servidor "})
    }
}

async function getUser(req, res) {
    const { id } = req.params; 

    try {
      const response = await User.findById(id).select(["-password"]);

      if(!response) {
        res.status(400).send({msg: "No se ha encontrado usuario"});
      } else {
        res.status(200).send(response);
      }
    } catch (error) {
        res.status(500).send({msg: "Error del servidor"});
    }
}

async function updateUser(req, res) {
    const { user_id } = req.user;
    const userData = req.body;

    if (req.files.avatar) {
        const imagePath = getFilePath(req.files.avatar);
        userData.avatar = imagePath;
    }
    try {
        const response = await User.findByIdAndUpdate({ _id: user_id }, userData);
    
        if(!response) {
            res.status(400).send({msg: "Error al actualizar el usuario"})
        } else { 
            res.status(200).send(response);
        }
    } catch (error) {
        res.status(500).send({msg: "Error del servidor"})
    }
}

async function getUsersExeptParticipantsGroup(req, res) {
    const { group_id } = req.params;

    try {
        const group = await Group.findById(group_id);
        if (!group) {
            return res.status(404).send({ msg: "Grupo no encontrado" });
        }

        const participantsStrings = group.participants.toString();
        const participants = participantsStrings.split(",");

        const response = await User.find({ _id: { $nin: participants } })
            .select(["-password"]);

        if (!response || response.length === 0) {
            res.status(400).send({ msg: "No se ha encontrado ningún usuario" });
        } else {
            res.status(200).send(response);
        }
    } catch (error) {
        res.status(500).send({ msg: "Error en el servidor", error: error.message });
    }
}

export const  UserController = { 
    getMe,
    getUsers,
    getUser,
    updateUser,
    getUsersExeptParticipantsGroup
};