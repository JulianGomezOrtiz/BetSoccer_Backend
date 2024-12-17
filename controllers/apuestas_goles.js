const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todas las apuestas por goles
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM apuestas_goles ORDER BY id_apuesta");
    const apuestas = result.rows;
    await connection.close();
    res.json(apuestas); // Retorna la lista de apuestas
  } catch (err) {
    console.error("Error al obtener las apuestas por goles:", err);
    res.status(500).json({ error: "Error al obtener las apuestas por goles", message: err.message });
  }
});

// Ruta GET: Obtener una apuesta por goles por ID
router.get("/:id", async (req, res) => {
  const apuestaId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM apuestas_goles WHERE id_apuesta = :id",
      [apuestaId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna la apuesta por goles encontrada
    } else {
      res.status(404).json({ error: "Apuesta por goles no encontrada" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener la apuesta por goles:", err);
    res.status(500).json({ error: "Error al buscar la apuesta por goles", message: err.message });
  }
});

// Ruta POST: Crear una nueva apuesta por goles
router.post("/", async (req, res) => {
  const {
    id_usuario,
    id_partido,
    id_cuenta,
    apuesta_goles_local,
    apuesta_goles_visitante,
    monto,
    cuota,
    estado,
    ganancia
  } = req.body;

  // Validar que todos los datos requeridos estén presentes
  if (!id_usuario || !id_partido || !id_cuenta || !apuesta_goles_local || !apuesta_goles_visitante || !monto || !cuota) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
  }

  const queryInsert = `
    INSERT INTO apuestas_goles (id_apuesta, id_usuario, id_partido, id_cuenta, apuesta_goles_local, apuesta_goles_visitante, monto, cuota, estado, ganancia, fecha)
    VALUES (apuestas_goles_seq.NEXTVAL, :id_usuario, :id_partido, :id_cuenta, :apuesta_goles_local, :apuesta_goles_visitante, :monto, :cuota, :estado, :ganancia, CURRENT_TIMESTAMP)
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      id_usuario,
      id_partido,
      id_cuenta,
      apuesta_goles_local,
      apuesta_goles_visitante,
      monto,
      cuota,
      estado,
      ganancia
    });

    await connection.commit();
    res.status(201).json({ message: "Apuesta por goles creada correctamente" });
  } catch (err) {
    console.error("Error al crear la apuesta por goles:", err);
    res.status(500).json({ error: "Error al crear la apuesta por goles", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar una apuesta por goles existente
router.put("/:id", async (req, res) => {
  const apuestaId = req.params.id;
  const {
    id_usuario,
    id_partido,
    id_cuenta,
    apuesta_goles_local,
    apuesta_goles_visitante,
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
      UPDATE apuestas_goles
      SET id_usuario = :id_usuario,
          id_partido = :id_partido,
          id_cuenta = :id_cuenta,
          apuesta_goles_local = :apuesta_goles_local,
          apuesta_goles_visitante = :apuesta_goles_visitante,
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
        apuesta_goles_local,
        apuesta_goles_visitante,
        monto,
        cuota,
        estado,
        ganancia
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Apuesta por goles no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Apuesta por goles actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar la apuesta por goles:", err);
    res.status(500).json({ error: "Error al actualizar la apuesta por goles", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar una apuesta por goles por su ID
router.delete("/:id", async (req, res) => {
  const apuestaId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM apuestas_goles WHERE id_apuesta = :id",
      [apuestaId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Apuesta por goles no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Apuesta por goles eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar la apuesta por goles:", err);
    res.status(500).json({ error: "Error al eliminar la apuesta por goles", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router; // Exportar el router
