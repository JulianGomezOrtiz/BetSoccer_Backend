const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todas las transacciones
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM transacciones ORDER BY id_transaccion");
    const transacciones = result.rows;
    await connection.close();
    res.json(transacciones); // Retorna la lista de transacciones
  } catch (err) {
    console.error("Error al obtener las transacciones:", err);
    res.status(500).json({ error: "Error al obtener las transacciones", message: err.message });
  }
});

// Ruta GET: Obtener una transacción por ID
router.get("/:id", async (req, res) => {
  const transaccionId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM transacciones WHERE id_transaccion = :id",
      [transaccionId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna la transacción encontrada
    } else {
      res.status(404).json({ error: "Transacción no encontrada" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener la transacción:", err);
    res.status(500).json({ error: "Error al buscar la transacción", message: err.message });
  }
});

// Ruta POST: Crear una nueva transacción
router.post("/", async (req, res) => {
  const { id_usuario, id_cuenta, tipo, monto, fecha,  estado } = req.body;

  // Validar que todos los datos requeridos estén presentes
  if (!id_usuario || !id_cuenta || !tipo || !monto || !fecha || !estado) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
  }

  const queryInsert = `
    INSERT INTO transacciones (id_transaccion, id_usuario, id_cuenta, tipo, monto, fecha, estado)
    VALUES (transacciones_seq.NEXTVAL, :id_usuario, :id_cuenta, :tipo, :monto, TO_TIMESTAMP(:fecha, 'YYYY-MM-DD HH24:MI:SS'), :estado)
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      id_usuario,
      id_cuenta,
      tipo,
      monto,
      fecha,
      estado
    });

    await connection.commit();
    res.status(201).json({ message: "Transacción creada correctamente" });
  } catch (err) {
    console.error("Error al crear la transacción:", err);
    res.status(500).json({ error: "Error al crear la transacción", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar una transacción existente
router.put("/:id", async (req, res) => {
  const transaccionId = req.params.id;
  const { id_usuario, id_cuenta, tipo, monto, fecha, estado } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE transacciones
      SET id_usuario = :id_usuario,
          id_cuenta = :id_cuenta,
          tipo = :tipo,
          monto = :monto,
          fecha = TO_TIMESTAMP(:fecha, 'YYYY-MM-DD HH24:MI:SS')
,
          estado = :estado
      WHERE id_transaccion = :id
    `,
      {
        id: transaccionId,
        id_usuario,
        id_cuenta,
        tipo,
        monto,
        fecha,
        estado
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Transacción actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar la transacción:", err);
    res.status(500).json({ error: "Error al actualizar la transacción", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar una transacción por su ID
router.delete("/:id", async (req, res) => {
  const transaccionId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM transacciones WHERE id_transaccion = :id",
      [transaccionId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Transacción eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar la transacción:", err);
    res.status(500).json({ error: "Error al eliminar la transacción", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router; // Exportar el router
