import { Pool } from "pg";
import { config } from "../constants/config";
export const pool = new Pool({
	host: config.DB_HOST,
	port: config.DB_PORT,
	user: config.DB_USER,
	password: config.DB_PASSWORD,
	database: config.DB_NAME,
});

// quick connectivity check if you want
(async () => {
	try {
		await pool.query("SELECT NOW()");
		console.log("Connected to DB");
	} catch (err) {
		console.error("DB connection error:", (err as Error).message);
	}
})();
