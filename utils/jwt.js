import jsonwebtoken from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../constants.js";

/**
 * Crea un Access Token válido por 24 horas.
 * @param {Object} user - El usuario autenticado.
 * @returns {String} - JWT Access Token
 */
function createAccessToken(user) {
    try {
        const payload = {
            token_type: "access",
            user_id: user._id,
        };

        // Genera el token con expiración en 24 horas
        const token = jsonwebtoken.sign(payload, JWT_SECRET_KEY, { expiresIn: "24h" });

        return token;
    } catch (error) {
        console.error("Error al crear el Access Token:", error);
        throw new Error("No se pudo generar el token");
    }
}

/**
 * Crea un Refresh Token válido por 30 días.
 * @param {Object} user - El usuario autenticado.
 * @returns {String} - JWT Refresh Token
 */
function createRefreshToken(user) {
    try {
        const payload = {
            token_type: "refresh",
            user_id: user._id,
        };

        // Genera el token con expiración en 30 días
        const token = jsonwebtoken.sign(payload, JWT_SECRET_KEY, { expiresIn: "30d" });

        return token;
    } catch (error) {
        console.error("Error al crear el Refresh Token:", error);
        throw new Error("No se pudo generar el token");
    }
}

/**
 * Verifica si el token es válido.
 * @param {String} token - El token JWT.
 * @returns {Object} - Payload si es válido, error si no.
 */
function verifyToken(token) {
    try {
        return jsonwebtoken.verify(token, JWT_SECRET_KEY);
    } catch (error) {
        console.error("Error al verificar el token:", error);
        return null;
    }
}

function decoded(token) {
    return jsonwebtoken.decode(token, JWT_SECRET_KEY, true);
}

function hasExpiredToken(token) {
    try {
        const { exp } = decoded(token);

        if (!exp) {
            console.error("El token no contiene fecha de expiración.");
            return true; // Consideramos que ha expirado si no tiene 'exp'
        }

        const currentDate = new Date().getTime() / 1000; // Convertimos a segundos

        if (exp <= currentDate) {
            console.log("El token ha expirado.");
            return true;
        }

        console.log("El token es válido.");
        return false;
    } catch (error) {
        console.error("Error al verificar la expiración del token:", error);
        return true; // Si hay un error al decodificar, consideramos que ha expirado
    }
}


export const jwt = {
    createAccessToken,
    createRefreshToken,
    verifyToken,
    decoded,
    hasExpiredToken,
};
