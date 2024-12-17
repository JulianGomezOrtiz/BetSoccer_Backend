const express = require("express");
const router = express.Router();
const getConnection = require("../db");


// Ruta GET para obtener todos los partidos
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM partidos");
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta PUT para crear/actualizar un partido
router.post("/", async (req, res) => {
  console.log("Solicitud POST recibida:", req.body); // Esto imprimirá el cuerpo de la solicitud
  const { equipoLocal, equipoVisitante, fecha, hora, estadio, estado } = req.body;

  // Validar que todos los datos requeridos estén presentes
  if (!equipoLocal || !equipoVisitante || !fecha || !hora || !estadio || !estado) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
  }

  const queryInsert = `
    INSERT INTO PARTIDOS (ID_PARTIDO, EQUIPO_LOCAL, EQUIPO_VISITANTE, FECHA, HORA, ESTADIO, ESTADO, MARCADOR_LOCAL, MARCADOR_VISITANTE)
    VALUES (PARTIDOS_SEQ.NEXTVAL, :equipoLocal, :equipoVisitante, TO_DATE(:fecha, 'YYYY-MM-DD'), TO_TIMESTAMP(:hora, 'YYYY-MM-DD HH24:MI:SS'), :estadio, :estado, NULL, NULL)
  `;

  let connection;
  try {
    connection = await getConnection();

    // Insertamos el nuevo partido
    await connection.execute(queryInsert, {
      equipoLocal,
      equipoVisitante,
      fecha,
      hora,
      estadio,
      estado
    });

    // Confirmamos la transacción
    await connection.commit();
    res.status(201).json({ message: "Partido insertado correctamente" });

  } catch (err) {
    console.error("Error al crear el partido:", err);
    res.status(500).json({ error: "Error interno en el servidor", message: err.message });
  } finally {
    if (connection) await connection.close(); // Asegura que la conexión se cierra
  }
});

module.exports = router;