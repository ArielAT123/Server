import bcryptjs from "bcryptjs";
import { User } from "../models/index.js";
import { jwt } from "../utils/index.js";

async function register(req, res) {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).send({ msg: "El usuario ya está registrado" });
        }

        // Crear nuevo usuario
        const user = new User({
            email: email.toLowerCase(),
        });

        // Generar el salt y hashear la contraseña
        const salt = bcryptjs.genSaltSync(10);
        const hashPassword = bcryptjs.hashSync(password, salt);
        user.password = hashPassword;

        // Guardar el usuario utilizando async/await
        const userStorage = await user.save();

        // Responder con éxito
        res.status(201).send(userStorage);
    } catch (error) {
        console.log(error);
        res.status(400).send({ msg: "Error al registrar el usuario", error });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const emailLowerCase = email.toLowerCase();

        // Buscar usuario
        const userStorage = await User.findOne({ email: emailLowerCase });

        if (!userStorage) {
            return res.status(400).send({ msg: "Usuario no encontrado" });
        }

        // Verificar la contraseña
        const check = await bcryptjs.compare(password, userStorage.password);

        if (!check) {
            return res.status(400).send({ msg: "Contraseña incorrecta" });
        }

        // Generar los tokens
        const accessToken = jwt.createAccessToken(userStorage);
        const refreshToken = jwt.createRefreshToken(userStorage);

        res.status(200).send({
            access: accessToken,
            refresh: refreshToken,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "Error del servidor", error });
    }
}

async function refreshaccessToken(req, res) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).send({ msg: "Token requerido" });
        }

        const hasExpired = jwt.hasExpiredToken(refreshToken);

        if (hasExpired) {
            return res.status(400).send({ msg: "Token expirado" });
        }

        const { user_id } = jwt.decoded(refreshToken);

        const userStorage = await User.findById(user_id);

        if (!userStorage) {
            return res.status(404).send({ msg: "Usuario no encontrado" });
        }

        const newAccessToken = jwt.createAccessToken(userStorage);

        res.status(200).send({
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.error("Error al refrescar el token:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
}

export const AuthController = {
    register,
    login,
    refreshaccessToken,
};
