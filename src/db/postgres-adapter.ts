/**
 * Postgres adapter for dbStore.
 * When DATABASE_URL is set, this adapter will persist the entire application
 * state into a single JSONB row in the `app_state` table (id = 'default').
 * It patches the existing exported `dbStore` from src/db/db-store.ts at runtime.
 *
 * This is a pragmatic minimal change to enable Neon quickly without a full
 * refactor. Long-term migration to normalized tables or an ORM is recommended.
 */

import { Pool } from "pg";
import { dbStore } from "./db-store";

const DEFAULT_STATE_ID = "default";

async function setupPostgresAdapter() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;

  // Create pool with relaxed TLS (common for managed Postgres). Adjust if needed.
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    // Try to read existing state
    const res = await pool.query("SELECT data FROM app_state WHERE id = $1", [DEFAULT_STATE_ID]);
    if (res.rowCount === 1) {
      // Overwrite in-memory schema with DB state
      try {
        // dbStore keeps internal schema private; use any to set it at runtime.
        (dbStore as any).schema = res.rows[0].data;
        console.log("[DB-ADAPTER] Loaded state from Postgres app_state.");
      } catch (err) {
        console.error("[DB-ADAPTER] Failed to apply state to dbStore instance:", err);
      }
    } else {
      // No state row yet: initialize with current in-memory schema
      try {
        const initial = (dbStore as any).schema;
        await pool.query("INSERT INTO app_state (id, data) VALUES ($1, $2)", [DEFAULT_STATE_ID, initial]);
        console.log("[DB-ADAPTER] Initialized app_state row with in-memory seed data.");
      } catch (err) {
        console.error("[DB-ADAPTER] Failed to insert initial state:", err);
      }
    }

    // Patch dbStore.save to also persist to Postgres
    const originalSave = (dbStore as any).save.bind(dbStore);
    (dbStore as any).save = async function patchedSave() {
      try {
        // call existing save (writes to file) to preserve original behavior in case
        // local file is expected in development
        try {
          originalSave();
        } catch (err) {
          // ignore local file save errors
        }

        const state = (dbStore as any).schema;
        await pool.query("UPDATE app_state SET data = $1 WHERE id = $2", [state, DEFAULT_STATE_ID]);
      } catch (err) {
        console.error("[DB-ADAPTER] Failed to persist state to Postgres:", err);
      }
    };

    console.log("[DB-ADAPTER] Postgres adapter ready. dbStore.save() will persist to Postgres.");
  } catch (err) {
    console.error("[DB-ADAPTER] Postgres adapter initialization failed:", err);
    try {
      await pool.end();
    } catch {}
  }
}

// Start setup but don't block import
setupPostgresAdapter().catch((e) => console.error(e));
