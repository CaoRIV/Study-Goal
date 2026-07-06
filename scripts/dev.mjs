import { spawn } from "node:child_process";
import { existsSync, renameSync, rmSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, sep } from "node:path";

const workspace = process.cwd();
const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const stableDevDistDir = ".next-local-current";
const fallbackDevDistDir = `.next-local-${process.pid}-${Date.now()}`;

function assertInsideWorkspace(target) {
  if (!target.startsWith(`${workspace}${sep}`)) {
    throw new Error(`Refusing to use path outside workspace: ${target}`);
  }
}

function removeBestEffort(target) {
  assertInsideWorkspace(target);

  try {
    rmSync(target, { recursive: true, force: true, maxRetries: 2, retryDelay: 200 });
    return true;
  } catch {
    // Windows may keep old Next dev files locked for a while. Ignore old caches
    // because this launcher always starts with a fresh cache directory.
    return false;
  }
}

function chooseDevDistDir() {
  const stablePath = resolve(workspace, stableDevDistDir);
  assertInsideWorkspace(stablePath);

  if (!existsSync(stablePath)) {
    return stableDevDistDir;
  }

  const removed = removeBestEffort(stablePath);
  if (!existsSync(stablePath) || removed) {
    return stableDevDistDir;
  }

  const staleDir = `.next-local-stale-${process.pid}-${Date.now()}`;
  const stalePath = resolve(workspace, staleDir);
  assertInsideWorkspace(stalePath);

  try {
    renameSync(stablePath, stalePath);
    removeBestEffort(stalePath);
    return stableDevDistDir;
  } catch {
    return fallbackDevDistDir;
  }
}

const devDistDir = chooseDevDistDir();
const devDistPath = resolve(workspace, devDistDir);
assertInsideWorkspace(devDistPath);

for (const entry of readdirSync(workspace, { withFileTypes: true })) {
  if (
    !entry.isDirectory() ||
    !/^\.next-local-(?:stale-)?\d+-\d+$/.test(entry.name)
  ) {
    continue;
  }

  const target = resolve(workspace, entry.name);

  try {
    const ageMs = Date.now() - statSync(target).mtimeMs;
    if (ageMs > 60_000 && target !== devDistPath) {
      removeBestEffort(target);
    }
  } catch {
    // Leave it alone if Windows is still releasing the directory.
  }
}

console.log(`Using Next dev cache: ${devDistDir}`);

const child = spawn(process.execPath, [nextCli, "dev", "--hostname", "127.0.0.1"], {
  cwd: workspace,
  env: {
    ...process.env,
    NEXT_DEV_DIST_DIR: devDistDir
  },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  removeBestEffort(devDistPath);

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
