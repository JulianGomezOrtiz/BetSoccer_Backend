const getConnection = require("./db");

async function testConnection() {
  try {
    const connection = await getConnection();
    console.log("Conexión exitosa a Oracle");
    await connection.close();
  } catch (err) {
    console.error("Error al conectar:", err.message);
  }
}

testConnection();
