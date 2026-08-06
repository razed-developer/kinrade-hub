import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const toolsDataFile = path.resolve(rootDirectory, "src/features/tools/data/tools.json");
const githubProjectsDataFile = path.resolve(rootDirectory, "src/features/github/data/repositories.json");

function jsonEditor(endpoint: string, dataFile: string, expectedName: string): Plugin {
  return {
    name: `local-${expectedName}-editor`,
    configureServer(server) {
      server.middlewares.use(endpoint, async (request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        try {
          if (request.method === "GET") {
            response.end(await fs.readFile(dataFile, "utf8"));
            return;
          }
          if (request.method === "PUT") {
            const chunks: Buffer[] = [];
            for await (const chunk of request) chunks.push(Buffer.from(chunk));
            const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            if (!Array.isArray(parsed)) {
              response.statusCode = 400;
              response.end(JSON.stringify({ error: `Expected an array of ${expectedName}.` }));
              return;
            }
            await fs.writeFile(dataFile, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
            response.end(JSON.stringify({ saved: true }));
            return;
          }
          response.statusCode = 405;
          response.end(JSON.stringify({ error: "Method not allowed." }));
        } catch (error) {
          response.statusCode = 500;
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown server error." }));
        }
      });
    }
  };
}

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    jsonEditor("/api/tools", toolsDataFile, "tools"),
    jsonEditor("/api/github-projects", githubProjectsDataFile, "repositories")
  ],
  server: { open: true },
  build: {
    rollupOptions: {
      input: {
        home: path.resolve(rootDirectory, "index.html"),
        marine: path.resolve(rootDirectory, "marine/index.html"),
        tools: path.resolve(rootDirectory, "tools/index.html"),
        github: path.resolve(rootDirectory, "github/index.html")
      }
    }
  }
});
