// SPEC: frontend-testing (FTEST-03)

type Args = Record<string, unknown>;
type CommandImpl = (args: Args) => unknown;

const impls = new Map<string, CommandImpl>();
const calls: Array<{ command: string; args: Args }> = [];

/** Stands in for `@tauri-apps/api/core`.`invoke`. Interception happens at this
 *  level, not at the `*Api.ts` wrappers, so the recorded call still carries the
 *  command name and the camelCase parameter names the Tauri bridge converts —
 *  renaming either of those is a runtime-only break today. */
export function invoke<T>(command: string, args: Args = {}): Promise<T> {
  calls.push({ command, args });
  const impl = impls.get(command);
  // An unstubbed command rejects instead of resolving `undefined`: resolving
  // would let a store keep going with a value it never received and make the
  // test pass for the wrong reason.
  if (!impl) return Promise.reject(new Error(`unstubbed command "${command}"`));
  try {
    return Promise.resolve(impl(args) as T);
  } catch (err) {
    return Promise.reject(err);
  }
}

export function mockCommand(command: string, result: unknown | CommandImpl) {
  impls.set(command, typeof result === "function" ? (result as CommandImpl) : () => result);
}

export function failCommand(command: string, message: string) {
  impls.set(command, () => {
    throw new Error(message);
  });
}

export function callsTo(command: string) {
  return calls.filter((c) => c.command === command);
}

export function resetCommands() {
  impls.clear();
  calls.length = 0;
}
