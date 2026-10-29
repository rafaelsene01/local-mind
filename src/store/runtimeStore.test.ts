// SPEC: frontend-testing (FTEST-11, FTEST-19)

import { beforeEach, describe, expect, it } from "vitest";
import { useRuntimeStore } from "./runtimeStore";
import { callsTo, failCommand, mockCommand } from "../test/doubles/tauriCore";
import { emit } from "../test/doubles/tauriEvent";
import type { PullProgress } from "../types";

const QWEN = "https://huggingface.co/x/qwen2.5-3b-instruct-q4_k_m.gguf";
const LLAMA = "https://huggingface.co/y/llama-3.2-1b-instruct-q4_k_m.gguf";

function progress(downloaded: number, total: number) {
  return { status: "downloading", downloaded_bytes: downloaded, total_bytes: total } as PullProgress;
}

const INITIAL = { ...useRuntimeStore.getState() };

beforeEach(() => {
  useRuntimeStore.setState(INITIAL);
});

describe("model-download-progress listener", () => {
  it("keys progress by the .gguf url the backend echoes back", () => {
    emit("model-download-progress", { identifier: QWEN, progress: progress(1, 4) });

    expect(useRuntimeStore.getState().downloadProgress[QWEN]).toEqual(progress(1, 4));
  });

  it("does not disturb a download already in flight", () => {
    // Two concurrent downloads is the case that separates "keyed by identifier"
    // from "keyed by anything at all": with a single entry, a hardcoded key
    // would pass this test too.
    useRuntimeStore.setState({ downloadProgress: { [LLAMA]: progress(9, 10) } });

    emit("model-download-progress", { identifier: QWEN, progress: progress(1, 4) });

    const map = useRuntimeStore.getState().downloadProgress;
    expect(Object.keys(map).sort()).toEqual([QWEN, LLAMA].sort());
    expect(map[LLAMA]).toEqual(progress(9, 10));
    expect(map[QWEN]).toEqual(progress(1, 4));
  });

  it("overwrites the previous progress of the same url instead of stacking", () => {
    emit("model-download-progress", { identifier: QWEN, progress: progress(1, 4) });
    emit("model-download-progress", { identifier: QWEN, progress: progress(3, 4) });

    expect(useRuntimeStore.getState().downloadProgress[QWEN]).toEqual(progress(3, 4));
    expect(Object.keys(useRuntimeStore.getState().downloadProgress)).toHaveLength(1);
  });
});

describe("runtime-changed listener", () => {
  it("re-reads status and active model, because the boot read is stale by then", async () => {
    mockCommand("runtime_status", { running: true });
    mockCommand("get_active_model", { name: "qwen" });

    emit("runtime-changed", null);
    // The listener does not await; the two commands are already recorded.
    await Promise.resolve();

    expect(callsTo("runtime_status")).toHaveLength(1);
    expect(callsTo("get_active_model")).toHaveLength(1);
  });
});

describe("loadDownloadableModels", () => {
  it("unpacks the snake_case fields the Rust side serialises", async () => {
    mockCommand("list_downloadable_models", {
      ram_detected_gb: 32,
      models: [{ id: "qwen", fits_ram: true }],
    });

    await useRuntimeStore.getState().loadDownloadableModels();

    const state = useRuntimeStore.getState();
    expect(state.ramDetectedGb).toBe(32);
    expect(state.downloadableModels).toHaveLength(1);
  });
});

describe("error handling", () => {
  it("turns a failed status read into a string instead of throwing", async () => {
    failCommand("runtime_status", "sidecar não responde");

    await expect(useRuntimeStore.getState().loadStatus()).resolves.toBeUndefined();

    expect(useRuntimeStore.getState().error).toContain("sidecar não responde");
  });

  it("still refreshes status after a failed setActiveModel", async () => {
    // The failure is recorded, but the reload is outside the try/catch on
    // purpose: the sidecar may have restarted anyway.
    failCommand("set_active_model", "arquivo corrompido");
    mockCommand("get_active_model", null);
    mockCommand("runtime_status", { running: false });

    await useRuntimeStore.getState().setActiveModel("qwen");

    expect(useRuntimeStore.getState().error).toContain("arquivo corrompido");
    expect(callsTo("runtime_status")).toHaveLength(1);
    expect(callsTo("set_active_model")[0].args).toEqual({ modelName: "qwen" });
  });

  it("lets configureModel reject, unlike every other action", async () => {
    // Deliberate exception documented in CONVENTIONS.md: the caller needs the
    // failure to keep its own form open.
    failCommand("configure_model", "contexto maior que o treinado");

    await expect(
      useRuntimeStore.getState().configureModel(131072, "max"),
    ).rejects.toThrow("contexto maior que o treinado");
  });
});
