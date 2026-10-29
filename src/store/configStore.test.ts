// SPEC: frontend-testing (FTEST-20, FTEST-21)

import { beforeEach, describe, expect, it } from "vitest";
import { useConfigStore } from "./configStore";
import { callsTo, failCommand, mockCommand } from "../test/doubles/tauriCore";
import type { AppConfig } from "../types";

function config(extra: Record<string, unknown> = {}) {
  return {
    onboarding_completed: true,
    theme: "dark",
    language: "pt",
    base_path: "D:/LocalMind",
    ...extra,
  } as unknown as AppConfig;
}

const INITIAL = { ...useConfigStore.getState() };

beforeEach(() => {
  useConfigStore.setState(INITIAL);
  localStorage.clear();
});

describe("loadConfig", () => {
  it("rewrites a renamed theme on disk so the migration does not run every boot", async () => {
    mockCommand("get_app_config", config({ theme: "claude" }));
    mockCommand("update_theme", config({ theme: "terracotta" }));
    mockCommand("get_storage_status", { ready: true, base_path: "D:/LocalMind" });

    await useConfigStore.getState().loadConfig();

    expect(callsTo("update_theme")).toHaveLength(1);
    expect(callsTo("update_theme")[0].args).toEqual({ theme: "terracotta" });
    expect(useConfigStore.getState().status).toBe("ready");
  });

  it("does not touch the disk when the stored theme is already valid", async () => {
    mockCommand("get_app_config", config({ theme: "ocean" }));
    mockCommand("get_storage_status", { ready: true, base_path: "D:/LocalMind" });

    await useConfigStore.getState().loadConfig();

    expect(callsTo("update_theme")).toHaveLength(0);
    expect(document.documentElement.getAttribute("data-theme")).toBe("ocean");
  });

  it("sends the user to onboarding, naming the folder, when the storage is gone", async () => {
    mockCommand("get_app_config", config());
    mockCommand("get_storage_status", { ready: false, base_path: "E:/HD-Externo/LocalMind" });

    await useConfigStore.getState().loadConfig();

    const state = useConfigStore.getState();
    expect(state.status).toBe("needs-onboarding");
    expect(state.missingBasePath).toBe("E:/HD-Externo/LocalMind");
    // The config survives: theme and language are still the user's choice even
    // when the data folder is not reachable.
    expect(state.config).not.toBeNull();
  });

  it("treats an unfinished onboarding as a first run, with no missing folder", async () => {
    mockCommand("get_app_config", config({ onboarding_completed: false }));

    await useConfigStore.getState().loadConfig();

    const state = useConfigStore.getState();
    expect(state.status).toBe("needs-onboarding");
    expect(state.config).toBeNull();
    expect(state.missingBasePath).toBeNull();
    expect(callsTo("get_storage_status")).toHaveLength(0);
  });

  it("falls back to onboarding when the config cannot be read at all", async () => {
    failCommand("get_app_config", "arquivo de bootstrap ilegível");

    await expect(useConfigStore.getState().loadConfig()).resolves.toBeUndefined();

    const state = useConfigStore.getState();
    expect(state.status).toBe("needs-onboarding");
    expect(state.error).toContain("arquivo de bootstrap ilegível");
  });
});

describe("setTheme", () => {
  it("paints before persisting, so the click feels immediate", async () => {
    let painted: string | null = null;
    mockCommand("update_theme", () => {
      painted = document.documentElement.getAttribute("data-theme");
      return config({ theme: "ocean" });
    });

    await useConfigStore.getState().setTheme("ocean");

    expect(painted).toBe("ocean");
  });
});
