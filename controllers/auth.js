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
        const user = new User({ email: email.toLowerCase() });

        // Generar el hash de la contraseña
        const salt = bcryptjs.genSaltSync(10);
        user.password = bcryptjs.hashSync(password, salt);

        // Guardar usuario en la base de datos
        const userStorage = await user.save();
        return res.status(201).send(userStorage);
    } catch (error) {
        console.error("Error en register:", error);
        return res.status(500).send({ msg: "Error al registrar el usuario", error });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const emailLowerCase = email.toLowerCase();
        const userStorage = await User.findOne({ email: emailLowerCase });

        if (!userStorage) {
            return res.status(400).send({ msg: "Usuario no encontrado" });
        }

        try {
            // Comparar contraseña usando bcryptjs
            const check = await bcryptjs.compare(password, userStorage.password);

            if (!check) {
                return res.status(400).send({ msg: "Contraseña incorrecta" });
            }

            // Generar tokens
            return res.status(200).send({
                access: jwt.createAccessToken(userStorage),
                refresh: jwt.createRefreshToken(userStorage),
            });

        } catch (bcryptError) {
            console.error("Error en bcrypt.compare:", bcryptError);
            return res.status(500).send({ msg: "Error al verificar la contraseña" });
        }
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

async function refreshAccessToken(req, res) {
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

        return res.status(200).send({
            accessToken: jwt.createAccessToken(userStorage),
        });

    } catch (error) {
        console.error("Error en refreshAccessToken:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

export const AuthController = {
    register,
    login,
    refreshAccessToken,
};
