const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todos los equipos
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM equipos ORDER BY id_equipo");
    const equipos = result.rows;
    await connection.close();
    res.json(equipos); // Retorna la lista de equipos
  } catch (err) {
    console.error("Error al obtener los equipos:", err);
    res.status(500).json({ error: "Error al obtener los equipos", message: err.message });
  }
});

// Ruta GET: Obtener un equipo por su ID
router.get("/:id", async (req, res) => {
  const equipoId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM equipos WHERE id_equipo = :id",
      [equipoId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna el equipo encontrado
    } else {
      res.status(404).json({ error: "Equipo no encontrado" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener el equipo:", err);
    res.status(500).json({ error: "Error interno al buscar el equipo", message: err.message });
  }
});

// Ruta POST: Crear un nuevo equipo
router.post("/", async (req, res) => {
  const { nombre_equipo, pais, liga, fecha_fundacion } = req.body;

  // Validar que los datos obligatorios estén presentes
  if (!nombre_equipo) {
    return res.status(400).json({ error: "El nombre del equipo es obligatorio" });
  }

  const queryInsert = `
    INSERT INTO equipos (id_equipo, nombre_equipo, pais, liga, fecha_fundacion)
    VALUES (equipos_seq.NEXTVAL, :nombre_equipo, :pais, :liga, TO_DATE(:fecha_fundacion, 'YYYY-MM-DD'))
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      nombre_equipo,
      pais,
      liga,
      fecha_fundacion
    });

    await connection.commit();
    res.status(201).json({ message: "Equipo creado correctamente" });
  } catch (err) {
    console.error("Error al crear el equipo:", err);
    res.status(500).json({ error: "Error al crear el equipo", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar un equipo existente
router.put("/:id", async (req, res) => {
  const equipoId = req.params.id;
  const { nombre_equipo, pais, liga, fecha_fundacion } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE equipos
      SET nombre_equipo = :nombre_equipo,
          pais = :pais,
          liga = :liga,
          fecha_fundacion = TO_DATE(:fecha_fundacion, 'YYYY-MM-DD')
      WHERE id_equipo = :id
    `,
      {
        id: equipoId,
        nombre_equipo,
        pais,
        liga,
        fecha_fundacion
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    await connection.commit();
    res.json({ message: "Equipo actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar el equipo:", err);
    res.status(500).json({ error: "Error al actualizar el equipo", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar un equipo por su ID
router.delete("/:id", async (req, res) => {
  const equipoId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM equipos WHERE id_equipo = :id",
      [equipoId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    await connection.commit();
    res.json({ message: "Equipo eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar el equipo:", err);
    res.status(500).json({ error: "Error al eliminar el equipo", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router; // Exportar el router
