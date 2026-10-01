/**
 * Vercel serverless entry point.
 *
 * Vercel functions are stateless and short-lived, so this only exposes the
 * plain HTTP/Express API surface. Socket.IO, Bull queue workers, and the
 * interval-based schedulers from index.js's `main()` cannot run here — they
 * need a persistent process (see backend/render.yaml for that deployment).
 */
import "../loadEnv.js";
import { createApp } from "../index.js";
import { connectMongoDB } from "../app/core/startup.js";

let appPromise = null;

async function getApp() {
  if (!appPromise) {
    appPromise = connectMongoDB()
      .then(() => createApp())
      .catch((error) => {
        appPromise = null;
        throw error;
      });
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("[api] Initialization failed:", error.message);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        error: true,
        message: "Service initialization failed",
      }),
    );
  }
}
