const oracledb = require('oracledb');
const dotenv = require('dotenv');

dotenv.config(); 

const getConnection = async () => {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING 
    });
    console.log("Conexión a Oracle establecida.");
    return connection;
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err.message);
    throw err;
  }
  
};

module.exports = getConnection;
