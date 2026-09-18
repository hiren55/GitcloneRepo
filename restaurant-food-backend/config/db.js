import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "restaurant_db",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL Connection Error:", err.message);
    } else {
        console.log("Connected to MySQL Database:", process.env.DB_NAME || "restaurant_db");
        connection.release();
    }
});

const db = pool.promise();

export default db;
