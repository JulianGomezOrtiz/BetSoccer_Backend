const express = require("express");
const router = express.Router();
const getConnection = require("../db"); // Obtener la conexión a la base de datos

// Ruta GET: Obtener todas las cuentas bancarias
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute("SELECT * FROM cuentas_bancarias ORDER BY id_cuenta");
    const cuentas = result.rows;
    await connection.close();
    res.json(cuentas); // Retorna la lista de cuentas bancarias
  } catch (err) {
    console.error("Error al obtener las cuentas bancarias:", err);
    res.status(500).json({ error: "Error al obtener las cuentas bancarias", message: err.message });
  }
});

// Ruta GET: Obtener una cuenta bancaria por ID
router.get("/:id", async (req, res) => {
  const cuentaId = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM cuentas_bancarias WHERE id_cuenta = :id",
      [cuentaId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna la cuenta bancaria encontrada
    } else {
      res.status(404).json({ error: "Cuenta bancaria no encontrada" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error al obtener la cuenta bancaria:", err);
    res.status(500).json({ error: "Error al buscar la cuenta bancaria", message: err.message });
  }
});

// Ruta POST: Crear una nueva cuenta bancaria
router.post("/", async (req, res) => {
  const { id_usuario, id_banco, numero_cuenta, saldo, estado } = req.body;

  // Validar que todos los datos requeridos estén presentes
  if (!id_usuario || !id_banco || !numero_cuenta) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud" });
  }

  const queryInsert = `
    INSERT INTO cuentas_bancarias (id_cuenta, id_usuario, id_banco, numero_cuenta, saldo, estado)
    VALUES (cuentas_bancarias_seq.NEXTVAL, :id_usuario, :id_banco, :numero_cuenta, :saldo, :estado)
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(queryInsert, {
      id_usuario,
      id_banco,
      numero_cuenta,
      saldo: saldo || 0.0,
      estado: estado || 'Activo'
    });

    await connection.commit();
    res.status(201).json({ message: "Cuenta bancaria creada correctamente" });
  } catch (err) {
    console.error("Error al crear la cuenta bancaria:", err);
    res.status(500).json({ error: "Error al crear la cuenta bancaria", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta PUT: Actualizar una cuenta bancaria existente
router.put("/:id", async (req, res) => {
  const cuentaId = req.params.id;
  const { id_usuario, id_banco, numero_cuenta, saldo, estado } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE cuentas_bancarias
      SET id_usuario = :id_usuario,
          id_banco = :id_banco,
          numero_cuenta = :numero_cuenta,
          saldo = :saldo,
          estado = :estado
      WHERE id_cuenta = :id
    `,
      {
        id: cuentaId,
        id_usuario,
        id_banco,
        numero_cuenta,
        saldo,
        estado
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Cuenta bancaria no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Cuenta bancaria actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar la cuenta bancaria:", err);
    res.status(500).json({ error: "Error al actualizar la cuenta bancaria", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta DELETE: Eliminar una cuenta bancaria por su ID
router.delete("/:id", async (req, res) => {
  const cuentaId = req.params.id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      "DELETE FROM cuentas_bancarias WHERE id_cuenta = :id",
      [cuentaId]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Cuenta bancaria no encontrada" });
    }

    await connection.commit();
    res.json({ message: "Cuenta bancaria eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar la cuenta bancaria:", err);
    res.status(500).json({ error: "Error al eliminar la cuenta bancaria", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
