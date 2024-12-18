const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); 
const partidosRoutes = require("./controllers/partidos");
const usuariosRoutes = require("./controllers/usuarios");
const equiposRoutes = require("./controllers/equipos");
const apuestasGolesRoutes = require("./controllers/apuestas_goles");
const apuestasMarcadorRoutes = require("./controllers/apuestas_marcador");
const apuestasEstatusRoutes = require("./controllers/apuestas_estatus");
const bancosRoutes = require("./controllers/bancos");
const transaccionesRoutes = require("./controllers/transacciones");
const cuentasBancariasRoutes = require("./controllers/cuentas_bancarias");

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
app.use("/api/equipos", equiposRoutes);
app.use("/api/partidos", partidosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/bitacora_apuestas", transaccionesRoutes);
app.use("/api/apuestas_goles", apuestasGolesRoutes);
app.use("/api/apuestas_marcador", apuestasMarcadorRoutes);
app.use("/api/apuestas_estatus", apuestasEstatusRoutes);
app.use("/api/bancos", bancosRoutes);
app.use("/api/cuentas_bancarias", cuentasBancariasRoutes);
app.use("/api/transacciones", transaccionesRoutes);


// ==================== Configuración del servidor ====================
const PORT = process.env.PORT || 3001; // Puerto por defecto o definido en variables de entorno

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // Mensaje en consola para indicar que el servidor está funcionando
});
