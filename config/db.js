const sql = require("mssql/msnodesqlv8");

const dbConfig = {
  server: process.env.localhost,   // e.g. localhost or DESKTOP-XXX
  database: process.env.FineOpticsDB,   // FineOpticsDB
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};
