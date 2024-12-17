const express = require("express");
const router = express.Router(); // Crear el router
const getConnection = require("../db");

router.post("/", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    const { id_usuario, id_partido, tipo_apuesta, monto, cuota, estado, ganancia } = req.body;
    const connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO apuestas (id_apuesta, id_usuario, id_partido, tipo_apuesta, monto, cuota, estado, ganancia)
      VALUES (apuestas_seq.NEXTVAL, :id_usuario, :id_partido, :tipo_apuesta, :monto, :cuota, :estado, :ganancia)`,
      {
        id_usuario,
        id_partido,
        tipo_apuesta,
        monto,
        cuota,
        estado,
        ganancia
      },
      { autoCommit: true }
    );

    console.log("Apuesta insertada:", result);
    await connection.close();
    res.status(200).json({ message: "Apuesta insertada correctamente" });

  } catch (err) {
    console.error("Error al insertar la apuesta:", err);
    res.status(500).json({ error: "Error al insertar la apuesta" });
  }
});

module.exports = router; // Exportar el router
