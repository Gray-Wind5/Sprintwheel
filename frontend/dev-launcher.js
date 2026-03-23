import { spawn } from "node:child_process";
import net from "node:net";

function run(name, command) {
  const child = spawn(command, {
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  child.on("exit", (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });

  return child;
}

function waitForPort(port, hosts = ["127.0.0.1", "localhost"], timeout = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function tryConnect() {
      for (const host of hosts) {
        const socket = net.createConnection({ port, host });

        socket.on("connect", () => {
          socket.end();
          resolve();
        });

        socket.on("error", () => {
          socket.destroy();
        });
      }

      if (Date.now() - start > timeout) {
        reject(new Error(`Timeout waiting for port ${port}`));
        return;
      }

      setTimeout(tryConnect, 1000);
    }

    tryConnect();
  });
}

const frontend = run("FRONTEND", "npm run dev:frontend");
const backend = run("BACKEND", "npm run dev:backend");

Promise.all([
  waitForPort(5173),
  waitForPort(8000)
])
  .then(() => {
    console.log("");
    console.log("======================================");
    console.log("Frontend URL: http://localhost:5173/");
    console.log("Backend  URL: http://127.0.0.1:8000/");
    console.log("======================================");
    console.log("");
  })
  .catch(() => {
    console.log("Servers started but port check timed out.");
  });

function shutdown() {
  frontend.kill();
  backend.kill();
  process.exit();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);