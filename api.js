import express from "express";
import path from "path";
import helmet from "helmet";
// solution to address __dirname is not defined error
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "cdnjs.cloudflare.com"],
      },
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static("index.html"));

export default app;
