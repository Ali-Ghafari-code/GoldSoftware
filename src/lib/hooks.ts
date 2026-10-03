import { useEffect, useState, useCallback } from "react";
import {
  type EntityKey,
  loadAll,
  subscribe,
  addItem as rawAdd,
  updateItem as rawUpdate,
  removeItem as rawRemove,
} from "./storage";

export function useCollection<T extends { id: string }>(key: EntityKey) {
  const [items, setItems] = useState<T[]>(() => loadAll<T>(key));

  useEffect(() => {
    const refresh = () => setItems(loadAll<T>(key));
    const unsub = subscribe(key, refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.endsWith(key)) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  const add = useCallback((item: T) => rawAdd(key, item), [key]);
  const update = useCallback(
    (id: string, patch: Partial<T>) => rawUpdate<T>(key, id, patch),
    [key]
  );
  const remove = useCallback((id: string) => rawRemove(key, id), [key]);

  return { items, add, update, remove };
}
