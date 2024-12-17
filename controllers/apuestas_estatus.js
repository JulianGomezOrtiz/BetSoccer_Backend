const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todas las apuestas
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM apuestas_estatus ORDER BY id_apuesta");
    const apuestas = result.rows;
    await connection.close();
    res.json(apuestas); // Retorna la lista de apuestas
  } catch (err) {
    console.error("Error al obtener las apuestas:", err);
    res.status(500).json({ error: "Error al obtener las apuestas", message: err.message });
  }
});

// Ruta GET: Obtener una apuesta por ID
router.get("/:id", async (req, res) => {
  const apuestaId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM apuestas_estatus WHERE id_apuesta = :id",
      [apuestaId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna la apuesta encontrada
    } else {
      res.status(404).json({ error: "Apuesta no encontrada" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener la apuesta:", err);
    res.status(500).json({ error: "Error al buscar la apuesta", message: err.message });
  }
});

// Ruta POST: Crear una nueva apuesta
router.post("/", async (req, res) => {
  const {
    id_usuario,
    id_partido,
    id_cuenta,
    apuesta_resultado,
    monto,
    cuota,
    estado,
    ganancia
  } = req.body;

  // Validar que todos los datos requeridos estén presentes
  if (!id_usuario || !id_partido || !id_cuenta || !apuesta_resultado || !monto || !cuota) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
  }

  const queryInsert = `
    INSERT INTO apuestas_estatus (id_apuesta, id_usuario, id_partido, id_cuenta, apuesta_resultado, monto, cuota, estado, ganancia, fecha)
    VALUES (apuestas_estatus_seq.NEXTVAL, :id_usuario, :id_partido, :id_cuenta, :apuesta_resultado, :monto, :cuota, :estado, :ganancia, CURRENT_TIMESTAMP)
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      id_usuario,
      id_partido,
      id_cuenta,
      apuesta_resultado,
      monto,
      cuota,
      estado,
      ganancia
    });

    await connection.commit();
    res.status(201).json({ message: "Apuesta creada correctamente" });
  } catch (err) {
    console.error("Error al crear la apuesta:", err);
    res.status(500).json({ error: "Error al crear la apuesta", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar una apuesta existente
router.put("/:id", async (req, res) => {
  const apuestaId = req.params.id;
  const {
    id_usuario,
    id_partido,
    id_cuenta,
    apuesta_resultado,
    monto,
    cuota,
    estado,
    ganancia
  } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE apuestas_estatus
      SET id_usuario = :id_usuario,
          id_partido = :id_partido,
          id_cuenta = :id_cuenta,
          apuesta_resultado = :apuesta_resultado,
          monto = :monto,
          cuota = :cuota,
          estado = :estado,
          ganancia = :ganancia
      WHERE id_apuesta = :id
    `,
      {
        id: apuestaId,
        id_usuario,
        id_partido,
        id_cuenta,
        apuesta_resultado,
        monto,
        cuota,
        estado,
        ganancia
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Apuesta no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Apuesta actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar la apuesta:", err);
    res.status(500).json({ error: "Error al actualizar la apuesta", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar una apuesta por su ID
router.delete("/:id", async (req, res) => {
  const apuestaId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM apuestas_estatus WHERE id_apuesta = :id",
      [apuestaId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Apuesta no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Apuesta eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar la apuesta:", err);
    res.status(500).json({ error: "Error al eliminar la apuesta", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router; // Exportar el router
