const express = require("express");
const router = express.Router();
const getConnection = require("../db");

// Ruta para registrar un nuevo usuario
router.post("/", async (req, res) => {
    console.log("Solicitud POST recibida:", req.body); // Esto imprimirá el cuerpo de la solicitud
    const { nombre, correo, contraseña, rol, estado } = req.body;

    // Validar que todos los datos requeridos estén presentes
    if (!nombre || !correo || !contraseña || !rol) {
        return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
    }

    const queryInsert = `
      INSERT INTO usuarios (ID_USUARIO, NOMBRE, CORREO, CONTRASEÑA, ROL, ESTADO)
      VALUES (usuarios_seq.NEXTVAL, :nombre, :correo, :contraseña, :rol, :estado)
    `;

    let connection;
    try {
        connection = await getConnection();

        // Insertamos el nuevo usuario
        await connection.execute(queryInsert, {
            nombre,
            correo,
            contraseña,
            rol,
            estado
        });

        // Confirmamos la transacción
        await connection.commit();
        res.status(201).json({ message: "Usuario creado correctamente" });

    } catch (err) {
        console.error("Error al crear el usuario:", err);
        res.status(500).json({ error: "Error interno en el servidor", message: err.message });
    } finally {
        if (connection) await connection.close(); // Asegura que la conexión se cierra
    }
});

module.exports = router;