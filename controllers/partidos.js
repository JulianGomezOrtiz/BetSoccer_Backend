const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todos los partidos
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM partidos ORDER BY id_partido");
    const partidos = result.rows;
    await connection.close();
    res.json(partidos); // Retorna la lista de partidos
  } catch (err) {
    console.error("Error al obtener los partidos:", err);
    res.status(500).json({ error: "Error al obtener los partidos", message: err.message });
  }
});

// Ruta GET: Obtener un partido por ID
router.get("/:id", async (req, res) => {
  const partidoId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM partidos WHERE id_partido = :id",
      [partidoId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna el partido encontrado
    } else {
      res.status(404).json({ error: "Partido no encontrado" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener el partido:", err);
    res.status(500).json({ error: "Error al buscar el partido", message: err.message });
  }
});

// Ruta POST: Crear un nuevo partido
router.post("/", async (req, res) => {
  const {
    id_equipo_local,
    id_equipo_visitante,
    fecha,
    hora,
    estadio,
    estado,
    marcador_local,
    marcador_visitante
  } = req.body;

  // Validar que todos los datos requeridos estén presentes
  if (!id_equipo_local || !id_equipo_visitante || !fecha || !hora) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
  }

  const queryInsert = `
    INSERT INTO partidos (id_partido, id_equipo_local, id_equipo_visitante, fecha, hora, estadio, estado, marcador_local, marcador_visitante)
    VALUES (partidos_seq.NEXTVAL, :id_equipo_local, :id_equipo_visitante, :fecha, :hora, :estadio, :estado, :marcador_local, :marcador_visitante)
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      id_equipo_local,
      id_equipo_visitante,
      fecha,
      hora,
      estadio,
      estado,
      marcador_local,
      marcador_visitante
    });

    await connection.commit();
    res.status(201).json({ message: "Partido creado correctamente" });
  } catch (err) {
    console.error("Error al crear el partido:", err);
    res.status(500).json({ error: "Error al crear el partido", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar un partido existente
router.put("/:id", async (req, res) => {
  const partidoId = req.params.id;
  const {
    id_equipo_local,
    id_equipo_visitante,
    fecha,
    hora,
    estadio,
    estado,
    marcador_local,
    marcador_visitante
  } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE partidos
      SET id_equipo_local = :id_equipo_local,
          id_equipo_visitante = :id_equipo_visitante,
          fecha = :fecha,
          hora = :hora,
          estadio = :estadio,
          estado = :estado,
          marcador_local = :marcador_local,
          marcador_visitante = :marcador_visitante
      WHERE id_partido = :id
    `,
      {
        id: partidoId,
        id_equipo_local,
        id_equipo_visitante,
        fecha,
        hora,
        estadio,
        estado,
        marcador_local,
        marcador_visitante
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    await connection.commit();
    res.json({ message: "Partido actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar el partido:", err);
    res.status(500).json({ error: "Error al actualizar el partido", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar un partido por su ID
router.delete("/:id", async (req, res) => {
  const partidoId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM partidos WHERE id_partido = :id",
      [partidoId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    await connection.commit();
    res.json({ message: "Partido eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar el partido:", err);
    res.status(500).json({ error: "Error al eliminar el partido", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router; // Exportar el router
