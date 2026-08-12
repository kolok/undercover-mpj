import { spawn } from "node:child_process";
import { copyFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const publicDir = join(root, ".output/public");
const port = process.env.PRERENDER_PORT || "4173";
const origin = `http://127.0.0.1:${port}`;

const child = spawn(process.execPath, [join(root, ".output/server/index.mjs")], {
  cwd: root,
  env: {
    ...process.env,
    PORT: port,
    HOST: "127.0.0.1",
    NITRO_PORT: port,
    NITRO_HOST: "127.0.0.1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let settled = false;
const fail = (message, detail) => {
  if (settled) return;
  settled = true;
  console.error(message, detail ?? "");
  child.kill("SIGTERM");
  process.exit(1);
};

child.on("error", (error) => fail("Failed to start Nitro server:", error));
child.stderr.on("data", (chunk) => process.stderr.write(chunk));
child.stdout.on("data", (chunk) => process.stdout.write(chunk));

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode != null) {
      fail(`Nitro server exited early with code ${child.exitCode}`);
    }
    try {
      const res = await fetch(origin, { redirect: "manual" });
      if (res.status > 0) return res;
    } catch {
      // Server not ready yet.
    }
    await delay(150);
  }
  fail(`Timed out waiting for Nitro server on ${origin}`);
}

try {
  const first = await waitForServer();
  // Re-fetch a clean response in case the readiness probe consumed a partial one.
  const res = first.ok ? first : await fetch(origin);
  const html = await res.text();

  if (!res.ok) {
    fail(`SSR / returned ${res.status}`, html.slice(0, 1000));
  }
  if (!html.includes("<!DOCTYPE html>") && !html.includes("<html")) {
    fail("SSR response did not look like HTML:", html.slice(0, 300));
  }

  writeFileSync(join(publicDir, "index.html"), html);
  copyFileSync(join(publicDir, "index.html"), join(publicDir, "404.html"));
  writeFileSync(join(publicDir, ".nojekyll"), "");

  console.log(`Prerendered static pages to ${publicDir}`);
  settled = true;
  child.kill("SIGTERM");
  await delay(200);
  if (child.exitCode == null) child.kill("SIGKILL");
  process.exit(0);
} catch (error) {
  fail("Prerender failed:", error);
}
