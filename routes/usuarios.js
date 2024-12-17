const express = require("express");
const router = express.Router();
const getConnection = require("../db");

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM usuarios");
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un usuario por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM usuarios WHERE id_usuario = :id",
      [id]
    );
    await connection.close();

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar un nuevo usuario
router.post("/", async (req, res) => {
  const { nombre, correo, contraseña, rol, estado, saldo } = req.body;

  try {
    const connection = await getConnection();
    const query = `
      INSERT INTO usuarios (id_usuario, nombre, correo, contraseña, rol, estado, saldo)
      VALUES (usuarios_seq.NEXTVAL, :nombre, :correo, :contraseña, :rol, :estado, :saldo)
    `;
    const binds = { nombre, correo, contraseña, rol, estado, saldo };

    await connection.execute(query, binds, { autoCommit: true });
    await connection.close();

    res.json({ message: "Usuario registrado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar un usuario por ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contraseña, rol, estado, saldo } = req.body;

  try {
    const connection = await getConnection();
    const query = `
      UPDATE usuarios
      SET nombre = :nombre, correo = :correo, contraseña = :contraseña,
          rol = :rol, estado = :estado, saldo = :saldo
      WHERE id_usuario = :id
    `;
    const binds = { nombre, correo, contraseña, rol, estado, saldo, id };

    const result = await connection.execute(query, binds, { autoCommit: true });
    await connection.close();

    if (result.rowsAffected === 0) {
      res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      res.json({ message: "Usuario actualizado con éxito" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un usuario por ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "DELETE FROM usuarios WHERE id_usuario = :id",
      [id],
      { autoCommit: true }
    );
    await connection.close();

    if (result.rowsAffected === 0) {
      res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      res.json({ message: "Usuario eliminado con éxito" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
