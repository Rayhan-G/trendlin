globalThis.process ??= {}; globalThis.process.env ??= {};
function getDB(env) {
  return env.DB;
}
function prepare(db, query, params) {
  const stmt = db.prepare(query);
  if (params) {
    return stmt.bind(...params).all();
  }
  return stmt.all();
}
function prepareFirst(db, query, params) {
  const stmt = db.prepare(query);
  if (params) {
    return stmt.bind(...params).first();
  }
  return stmt.first();
}

export { prepareFirst as a, getDB as g, prepare as p };
