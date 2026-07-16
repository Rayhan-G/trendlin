globalThis.process ??= {}; globalThis.process.env ??= {};
function getDB(env) {
  console.log("🔍 getDB called");
  const db = env?.DB || // Direct
  env?.runtime?.env?.DB || // Runtime env
  env?.env?.DB || // Nested env
  null;
  if (!db) {
    console.error("❌ Database not available");
    console.error("Available env keys:", Object.keys(env || {}));
    console.error("Available runtime keys:", Object.keys(env?.runtime || {}));
    console.error("Available runtime.env keys:", Object.keys(env?.runtime?.env || {}));
    throw new Error("Database not available. Please check D1 binding.");
  }
  if (typeof db.prepare !== "function") {
    console.error("❌ DB object does not have prepare method");
    console.error("DB type:", typeof db);
    console.error("DB keys:", Object.keys(db || {}));
    throw new Error("Invalid database binding. Expected D1Database instance.");
  }
  console.log("✅ Database connection successful");
  return db;
}
async function prepare(db, query, params) {
  try {
    console.log("📝 Preparing query:", query.substring(0, 100) + (query.length > 100 ? "..." : ""));
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      console.log("📊 Query params:", params);
      return stmt.bind(...params).all();
    }
    return stmt.all();
  } catch (error) {
    console.error("❌ Database prepare error:", error);
    console.error("Query:", query);
    console.error("Params:", params);
    throw error;
  }
}
async function prepareFirst(db, query, params) {
  try {
    console.log("📝 Preparing first query:", query.substring(0, 100) + (query.length > 100 ? "..." : ""));
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      console.log("📊 Query params:", params);
      return stmt.bind(...params).first();
    }
    return stmt.first();
  } catch (error) {
    console.error("❌ Database prepareFirst error:", error);
    console.error("Query:", query);
    console.error("Params:", params);
    throw error;
  }
}

export { prepare as a, getDB as g, prepareFirst as p };
