// SPEC: frontend-testing (FTEST-19, FTEST-22)

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUpdateStore } from "./updateStore";
import { callsTo, failCommand, mockCommand } from "../test/doubles/tauriCore";
import type { UpdateInfo } from "../types";

function release(version: string) {
  return { version, notes: "" } as unknown as UpdateInfo;
}

const INITIAL = { ...useUpdateStore.getState() };

beforeEach(() => {
  useUpdateStore.setState(INITIAL);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("checkOnBoot", () => {
  it("does not check when auto-check is off", async () => {
    useUpdateStore.setState({ settings: { auto_check: false } as never });
    mockCommand("check_for_update", release("9.9.9"));

    useUpdateStore.getState().checkOnBoot();
    await vi.advanceTimersByTimeAsync(10_000);

    expect(callsTo("check_for_update")).toHaveLength(0);
    expect(useUpdateStore.getState().available).toBeNull();
  });

  it("waits for the window to be usable before going to the network", async () => {
    useUpdateStore.setState({ settings: { auto_check: true } as never });
    mockCommand("check_for_update", release("9.9.9"));

    useUpdateStore.getState().checkOnBoot();
    await vi.advanceTimersByTimeAsync(4_000);
    expect(callsTo("check_for_update")).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(1_500);
    expect(callsTo("check_for_update")).toHaveLength(1);
    expect(useUpdateStore.getState().available).toEqual(release("9.9.9"));
  });

  it("stays silent when the boot check fails — offline is this app's normal state", async () => {
    useUpdateStore.setState({ settings: { auto_check: true } as never });
    failCommand("check_for_update", "getaddrinfo ENOTFOUND");

    useUpdateStore.getState().checkOnBoot();
    await vi.advanceTimersByTimeAsync(10_000);

    expect(useUpdateStore.getState().error).toBeNull();
  });
});

describe("checkNow", () => {
  it("is loud where the boot check is silent", async () => {
    failCommand("check_for_update", "getaddrinfo ENOTFOUND");

    await useUpdateStore.getState().checkNow();

    const state = useUpdateStore.getState();
    expect(state.error).toContain("ENOTFOUND");
    expect(state.checking).toBe(false);
  });

  it("marks that the answer came from an explicit check, even with no update", async () => {
    mockCommand("check_for_update", null);

    await useUpdateStore.getState().checkNow();

    const state = useUpdateStore.getState();
    expect(state.available).toBeNull();
    expect(state.checkedManually).toBe(true);
  });
});

describe("skip", () => {
  it("does nothing when there is no version to skip", async () => {
    await useUpdateStore.getState().skip();

    expect(callsTo("skip_update_version")).toHaveLength(0);
  });

  it("sends the version of the release currently offered", async () => {
    useUpdateStore.setState({ available: release("1.2.3") });
    mockCommand("skip_update_version", null);
    mockCommand("get_update_settings", { auto_check: true, skipped_version: "1.2.3" });

    await useUpdateStore.getState().skip();

    expect(callsTo("skip_update_version")[0].args).toEqual({ version: "1.2.3" });
    expect(useUpdateStore.getState().available).toBeNull();
  });
});
