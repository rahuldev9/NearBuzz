import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.replace(/\\[^\\]*$/, "");

dotenv.config({ path: `${__dirname}/.env` });

import app from "./app.js";
import { connectDB } from "./src/config/db.js";

connectDB();

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
