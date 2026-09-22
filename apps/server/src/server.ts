import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDatabase } from "./db/client.js";
import { createMailer } from "./mail/index.js";

const config = loadConfig();
const database = createDatabase(config);
const app = createApp(config, database.db, createMailer(config));
const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(JSON.stringify({ level: "info", event: "server_started", port: config.port }));
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(JSON.stringify({ level: "info", event: "shutdown_started", signal }));

  const forceClose = setTimeout(() => server.closeAllConnections(), 8_000);
  forceClose.unref();
  server.close(async (error) => {
    clearTimeout(forceClose);
    try {
      await database.close();
      if (error) throw error;
      console.log(JSON.stringify({ level: "info", event: "shutdown_completed" }));
      process.exitCode = 0;
    } catch (closeError) {
      console.error(JSON.stringify({
        level: "error",
        event: "shutdown_failed",
        error: closeError instanceof Error ? closeError.message : "unknown",
      }));
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
