// SPEC: frontend-testing (FTEST-03)

type Handler = (event: { payload: unknown }) => void;

const handlers = new Map<string, Handler[]>();

/** Stands in for `@tauri-apps/api/event`.`listen`, which in a test process has
 *  no IPC channel to attach to and would reject. */
export function listen(name: string, handler: Handler): Promise<() => void> {
  const list = handlers.get(name) ?? [];
  list.push(handler);
  handlers.set(name, list);
  return Promise.resolve(() => {
    handlers.set(name, (handlers.get(name) ?? []).filter((h) => h !== handler));
  });
}

/** Drives a listener the way the Rust side does. Fails loudly when nothing is
 *  listening: a silent no-op here would let a test assert "state unchanged"
 *  against a handler that was never registered. */
export function emit(name: string, payload: unknown) {
  const list = handlers.get(name);
  if (!list || list.length === 0) {
    throw new Error(`no listener registered for "${name}"`);
  }
  for (const handler of list) handler({ payload });
}

export function listenerCount(name: string) {
  return handlers.get(name)?.length ?? 0;
}
