// localStorage-backed persistence with a tiny subscription layer so React
// screens can react to new records added from another screen or tab.

export type EntityKey =
  | "customers"
  | "suppliers"
  | "products"
  | "sales"
  | "purchases"
  | "coins"
  | "checks"
  | "ledger"
  | "settings";

const PREFIX = "goldshop:";

type Listener = () => void;
const listeners = new Map<EntityKey, Set<Listener>>();

function keyFor(key: EntityKey) {
  return `${PREFIX}${key}`;
}

export function loadAll<T>(key: EntityKey): T[] {
  try {
    const raw = localStorage.getItem(keyFor(key));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function saveAll<T>(key: EntityKey, items: T[]) {
  localStorage.setItem(keyFor(key), JSON.stringify(items));
  listeners.get(key)?.forEach((l) => l());
}

export function addItem<T extends { id: string }>(key: EntityKey, item: T) {
  const items = loadAll<T>(key);
  items.unshift(item);
  saveAll(key, items);
}

export function updateItem<T extends { id: string }>(
  key: EntityKey,
  id: string,
  patch: Partial<T>
) {
  const items = loadAll<T>(key);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], ...patch };
  saveAll(key, items);
}

export function removeItem<T extends { id: string }>(
  key: EntityKey,
  id: string
) {
  const items = loadAll<T>(key).filter((i) => i.id !== id);
  saveAll(key, items);
}

export function subscribe(key: EntityKey, listener: Listener) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => listeners.get(key)!.delete(listener);
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadSettings<T>(defaults: T): T {
  const raw = loadAll<T>("settings")[0];
  return raw ? { ...defaults, ...raw } : defaults;
}

export function saveSettings<T>(value: T) {
  saveAll("settings", [value]);
}
