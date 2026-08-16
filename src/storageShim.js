// Simple localStorage-backed shim that mimics the window.storage API
// used inside Claude artifacts (get/set/delete/list), so this project
// runs standalone in the browser.
//
// IMPORTANT: this is only local to each browser/device — it does NOT
// sync data between different people who open the site. For a real
// shared database (so everyone sees the same car list), replace this
// file with calls to Supabase (or another backend). Ask Claude Code:
// "troque este storageShim por chamadas ao Supabase" and it can do
// the migration for you.

const PREFIX = "ev-comparador::";

function fullKey(key, shared) {
  return `${PREFIX}${shared ? "shared" : "personal"}::${key}`;
}

export function installStorageShim() {
  window.storage = {
    async get(key, shared = false) {
      const raw = localStorage.getItem(fullKey(key, shared));
      if (raw === null) {
        throw new Error(`Key not found: ${key}`);
      }
      return { key, value: raw, shared };
    },
    async set(key, value, shared = false) {
      localStorage.setItem(fullKey(key, shared), value);
      return { key, value, shared };
    },
    async delete(key, shared = false) {
      localStorage.removeItem(fullKey(key, shared));
      return { key, deleted: true, shared };
    },
    async list(prefix = "", shared = false) {
      const scope = `${PREFIX}${shared ? "shared" : "personal"}::`;
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(scope + prefix))
        .map((k) => k.slice(scope.length));
      return { keys, prefix, shared };
    },
  };
}
