import express from "express";
import path from "path";
// solution to address __dirname is not defined error
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static("index.html"));

export default app;
