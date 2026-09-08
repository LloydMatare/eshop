import type { SyncResult } from "../lib/odoo/sync";
import { createRequire } from "node:module";

async function main() {
  const require = createRequire(import.meta.url);
  const { syncFromOdoo } = require("../lib/odoo/sync") as {
    syncFromOdoo: () => Promise<SyncResult>;
  };
  console.log("Starting Odoo sync...");
  const result = await syncFromOdoo();
  console.log("Sync complete:", result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});