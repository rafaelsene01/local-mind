// SPEC: frontend-testing (FTEST-02, FTEST-03)

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetCommands } from "./doubles/tauriCore";

// The command stubs live in a module, not in a `vi.fn()` per test, so they
// survive across a test file unless cleared here.
afterEach(() => {
  cleanup();
  resetCommands();
});
