const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todas las bitácoras de apuestas
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM bitacoras_apuestas ORDER BY id_bitacora");
    const bitacoras = result.rows;
    await connection.close();
    res.json(bitacoras); // Retorna la lista de bitácoras
  } catch (err) {
    console.error("Error al obtener las bitácoras de apuestas:", err);
    res.status(500).json({ error: "Error al obtener las bitácoras de apuestas", message: err.message });
  }
});

// Ruta GET: Obtener una bitácora de apuestas por ID
router.get("/:id", async (req, res) => {
  const bitacoraId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM bitacoras_apuestas WHERE id_bitacora = :id",
      [bitacoraId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna la bitácora de apuestas encontrada
    } else {
      res.status(404).json({ error: "Bitácora de apuestas no encontrada" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener la bitácora de apuestas:", err);
    res.status(500).json({ error: "Error al buscar la bitácora de apuestas", message: err.message });
  }
});

// Ruta POST: Crear una nueva bitácora de apuestas
router.post("/", async (req, res) => {
  const { id_usuario, descripcion } = req.body;

  // Validar que todos los datos requeridos estén presentes
  if (!id_usuario || !descripcion) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
  }

  const queryInsert = `
    INSERT INTO bitacoras_apuestas (id_bitacora, id_usuario, descripcion, fecha)
    VALUES (bitacoras_apuestas_seq.NEXTVAL, :id_usuario, :descripcion, CURRENT_TIMESTAMP)
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      id_usuario,
      descripcion
    });

    await connection.commit();
    res.status(201).json({ message: "Bitácora de apuestas creada correctamente" });
  } catch (err) {
    console.error("Error al crear la bitácora de apuestas:", err);
    res.status(500).json({ error: "Error al crear la bitácora de apuestas", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar una bitácora de apuestas existente
router.put("/:id", async (req, res) => {
  const bitacoraId = req.params.id;
  const { id_usuario, descripcion } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE bitacoras_apuestas
      SET id_usuario = :id_usuario,
          descripcion = :descripcion
      WHERE id_bitacora = :id
    `,
      {
        id: bitacoraId,
        id_usuario,
        descripcion
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Bitácora de apuestas no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Bitácora de apuestas actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar la bitácora de apuestas:", err);
    res.status(500).json({ error: "Error al actualizar la bitácora de apuestas", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar una bitácora de apuestas por su ID
router.delete("/:id", async (req, res) => {
  const bitacoraId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM bitacoras_apuestas WHERE id_bitacora = :id",
      [bitacoraId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Bitácora de apuestas no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Bitácora de apuestas eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar la bitácora de apuestas:", err);
    res.status(500).json({ error: "Error al eliminar la bitácora de apuestas", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router; // Exportar el router
