const express = require("express");
const router = express.Router();
const getConnection = require("../db");

// Ruta GET para obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM usuarios");
    console.log(result);
    const usuarios = result.rows;
    await connection.close();
    res.json(usuarios);  // Enviar solo los datos relevantes
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta GET para obtener un usuario por ID
router.get("/:id", async (req, res) => {
  const usuarioId = req.params.id;
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM usuarios WHERE ID_USUARIO = :id", [usuarioId]);
    console.log(result);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);  // Devolver el usuario encontrado
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
    await connection.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta POST para crear un nuevo usuario
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

// Ruta PUT para actualizar un usuario existente
router.put("/:id", async (req, res) => {
  const usuarioId = req.params.id;
  const { nombre, correo, contraseña, rol, estado } = req.body;

  let connection;
  try {
    connection = await getConnection();

    // Actualizamos el usuario
    const result = await connection.execute(
      `
      UPDATE usuarios
      SET NOMBRE = :nombre, CORREO = :correo, CONTRASEÑA = :contraseña, ROL = :rol, ESTADO = :estado
      WHERE ID_USUARIO = :id
    `,
      {
        id: usuarioId,
        nombre,
        correo,
        contraseña,
        rol,
        estado
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Confirmamos la transacción
    await connection.commit();
    res.json({ message: "Usuario actualizado correctamente" });

  } catch (err) {
    console.error("Error al actualizar el usuario:", err);
    res.status(500).json({ error: "Error interno en el servidor", message: err.message });
  } finally {
    if (connection) await connection.close(); // Asegura que la conexión se cierra
  }
});

// Ruta DELETE para eliminar un usuario
router.delete("/:id", async (req, res) => {
  const usuarioId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    // Eliminar el usuario
    const result = await connection.execute(
      "DELETE FROM usuarios WHERE ID_USUARIO = :id",
      [usuarioId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Confirmamos la transacción
    await connection.commit();
    res.json({ message: "Usuario eliminado correctamente" });

  } catch (err) {
    console.error("Error al eliminar el usuario:", err);
    res.status(500).json({ error: "Error interno en el servidor", message: err.message });
  } finally {
    if (connection) await connection.close(); // Asegura que la conexión se cierra
  }
});

module.exports = router;
