import app from "./app";
import { env, prisma } from "./config";

const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);