import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { readFileSync } from "node:fs";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";

const app = express();
const openApiSpec = JSON.parse(
  readFileSync(path.resolve(__dirname, "../openapi.json"), "utf8")
);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(
  "/api-docs",
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
      },
    },
  }),
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec)
);

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;