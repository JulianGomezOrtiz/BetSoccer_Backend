const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); 
const partidosRoutes = require("./routes/partidos");
const usuariosRoutes = require("./routes/usuarios");
const apuestasRoutes = require("./routes/apuestas");

require("dotenv").config(); // Configuración de variables de entorno

const app = express();


// Habilitar CORS para permitir solicitudes desde http://localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);


// Middleware para parsear cuerpos de solicitudes en formato JSON
app.use(bodyParser.json());

// ==================== Rutas ====================
// Rutas relacionadas con partidos
app.use("/api/partidos", partidosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/apuestas", apuestasRoutes);

// ==================== Configuración del servidor ====================
const PORT = process.env.PORT || 3001; // Puerto por defecto o definido en variables de entorno

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // Mensaje en consola para indicar que el servidor está funcionando
});
