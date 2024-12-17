const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todos los bancos
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM bancos ORDER BY id_banco");
    const bancos = result.rows;
    await connection.close();
    res.json(bancos); // Retorna la lista de bancos
  } catch (err) {
    console.error("Error al obtener los bancos:", err);
    res.status(500).json({ error: "Error al obtener los bancos", message: err.message });
  }
});

// Ruta GET: Obtener un banco por su ID
router.get("/:id", async (req, res) => {
  const bancoId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM bancos WHERE id_banco = :id",
      [bancoId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna el banco encontrado
    } else {
      res.status(404).json({ error: "Banco no encontrado" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener el banco:", err);
    res.status(500).json({ error: "Error al buscar el banco", message: err.message });
  }
});

// Ruta POST: Crear un nuevo banco
router.post("/", async (req, res) => {
  const { nombre_banco, codigo_autorizacion } = req.body;

  // Validar que el nombre del banco esté presente
  if (!nombre_banco) {
    return res.status(400).json({ error: "El nombre del banco es obligatorio" });
  }

  const queryInsert = `
    INSERT INTO bancos (id_banco, nombre_banco, codigo_autorizacion)
    VALUES (bancos_seq.NEXTVAL, :nombre_banco, :codigo_autorizacion)
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      nombre_banco,
      codigo_autorizacion
    });

    await connection.commit();
    res.status(201).json({ message: "Banco creado correctamente" });
  } catch (err) {
    console.error("Error al crear el banco:", err);
    res.status(500).json({ error: "Error al crear el banco", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar un banco existente
router.put("/:id", async (req, res) => {
  const bancoId = req.params.id;
  const { nombre_banco, codigo_autorizacion } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE bancos
      SET nombre_banco = :nombre_banco,
          codigo_autorizacion = :codigo_autorizacion
      WHERE id_banco = :id
    `,
      {
        id: bancoId,
        nombre_banco,
        codigo_autorizacion
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Banco no encontrado" });
    }

    await connection.commit();
    res.json({ message: "Banco actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar el banco:", err);
    res.status(500).json({ error: "Error al actualizar el banco", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar un banco por su ID
router.delete("/:id", async (req, res) => {
  const bancoId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM bancos WHERE id_banco = :id",
      [bancoId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Banco no encontrado" });
    }

    await connection.commit();
    res.json({ message: "Banco eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar el banco:", err);
    res.status(500).json({ error: "Error al eliminar el banco", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router; // Exportar el router
