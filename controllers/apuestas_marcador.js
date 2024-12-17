const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todas las apuestas de marcador
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM apuestas_marcador ORDER BY id_apuesta");
    const apuestas = result.rows;
    await connection.close();
    res.json(apuestas); // Retorna la lista de apuestas
  } catch (err) {
    console.error("Error al obtener las apuestas de marcador:", err);
    res.status(500).json({ error: "Error al obtener las apuestas de marcador", message: err.message });
  }
});

// Ruta GET: Obtener una apuesta de marcador por ID
router.get("/:id", async (req, res) => {
  const apuestaId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM apuestas_marcador WHERE id_apuesta = :id",
      [apuestaId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna la apuesta de marcador encontrada
    } else {
      res.status(404).json({ error: "Apuesta de marcador no encontrada" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener la apuesta de marcador:", err);
    res.status(500).json({ error: "Error al buscar la apuesta de marcador", message: err.message });
  }
});

// Ruta POST: Crear una nueva apuesta de marcador
router.post("/", async (req, res) => {
  const {
    id_usuario,
    id_partido,
    id_cuenta,
    monto,
    cuota,
    estado,
    ganancia,
    apuesta_marcador_local,
    apuesta_marcador_visitante
  } = req.body;

  // Validar que todos los datos requeridos estén presentes
  if (!id_usuario || !id_partido || !id_cuenta || !monto || !cuota || !apuesta_marcador_local || !apuesta_marcador_visitante) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
  }

  const queryInsert = `
    INSERT INTO apuestas_marcador (id_apuesta, id_usuario, id_partido, id_cuenta, monto, cuota, estado, ganancia, fecha, apuesta_marcador_local, apuesta_marcador_visitante)
    VALUES (apuestas_marcador_seq.NEXTVAL, :id_usuario, :id_partido, :id_cuenta, :monto, :cuota, :estado, :ganancia, CURRENT_TIMESTAMP, :apuesta_marcador_local, :apuesta_marcador_visitante)
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      id_usuario,
      id_partido,
      id_cuenta,
      monto,
      cuota,
      estado,
      ganancia,
      apuesta_marcador_local,
      apuesta_marcador_visitante
    });

    await connection.commit();
    res.status(201).json({ message: "Apuesta de marcador creada correctamente" });
  } catch (err) {
    console.error("Error al crear la apuesta de marcador:", err);
    res.status(500).json({ error: "Error al crear la apuesta de marcador", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar una apuesta de marcador existente
router.put("/:id", async (req, res) => {
  const apuestaId = req.params.id;
  const {
    id_usuario,
    id_partido,
    id_cuenta,
    monto,
    cuota,
    estado,
    ganancia,
    apuesta_marcador_local,
    apuesta_marcador_visitante
  } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE apuestas_marcador
      SET id_usuario = :id_usuario,
          id_partido = :id_partido,
          id_cuenta = :id_cuenta,
          monto = :monto,
          cuota = :cuota,
          estado = :estado,
          ganancia = :ganancia,
          apuesta_marcador_local = :apuesta_marcador_local,
          apuesta_marcador_visitante = :apuesta_marcador_visitante
      WHERE id_apuesta = :id
    `,
      {
        id: apuestaId,
        id_usuario,
        id_partido,
        id_cuenta,
        monto,
        cuota,
        estado,
        ganancia,
        apuesta_marcador_local,
        apuesta_marcador_visitante
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Apuesta de marcador no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Apuesta de marcador actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar la apuesta de marcador:", err);
    res.status(500).json({ error: "Error al actualizar la apuesta de marcador", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar una apuesta de marcador por su ID
router.delete("/:id", async (req, res) => {
  const apuestaId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM apuestas_marcador WHERE id_apuesta = :id",
      [apuestaId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Apuesta de marcador no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Apuesta de marcador eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar la apuesta de marcador:", err);
    res.status(500).json({ error: "Error al eliminar la apuesta de marcador", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router; // Exportar el router
