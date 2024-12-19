const express = require("express");
const router = express.Router();
const getConnection = require("../db"); 

router.post("/", async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    // Obtener conexión a la base de datos
    const connection = await getConnection();

    // Ejecutar la consulta SQL
    const query = `SELECT * FROM usuarios WHERE correo = :correo AND contraseña = :contraseña`;
    const binds = { correo, contraseña };

    const result = await connection.execute(query, binds, { outFormat: require("oracledb").OUT_FORMAT_OBJECT });

    // Verificar si hay resultados
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Inicio de sesión exitoso", usuario: result.rows[0] });
    } else {
      res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    // Cerrar la conexión
    await connection.close();
  } catch (error) {
    console.error("Error en la ruta de login:", error.message);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

module.exports = router;
