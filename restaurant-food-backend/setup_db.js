import fs from "fs";
import path from "path";
import db from "./config/db.js";

async function setupDatabase() {
    try {
        console.log("Setting up database and stored procedures...");
        const sqlFile = path.resolve("database/restaurant.sql");
        const rawSql = fs.readFileSync(sqlFile, "utf-8");

        // Split by delimiter statements or remove them for mysql2 multipleStatements
        const cleanSql = rawSql
            .replace(/DELIMITER \$\$/g, "")
            .replace(/DELIMITER ;/g, "")
            .replace(/\$\$/g, ";");

        await db.query(cleanSql);
        console.log("Database and Stored Procedures created successfully!");

        // Verify roles
        const [rolesResult] = await db.query("CALL sp_GetRoles()");
        console.log("Roles in DB:", rolesResult[0]);

        process.exit(0);
    } catch (error) {
        console.error("Database setup failed:", error.message);
        process.exit(1);
    }
}

setupDatabase();
