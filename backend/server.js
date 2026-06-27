import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = (await import("./app.js")).default;
const { connectDB } = await import("./src/config/db.js");

connectDB();

const port = process.env.PORT || 5000;
const EXPO_PUBLIC_API_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://localhost:${port}`;
app.listen(port, () => {
  console.log(`Server running at ${EXPO_PUBLIC_API_URL}`);
});
