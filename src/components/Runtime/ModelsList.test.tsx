// SPEC: frontend-testing (FTEST-23)

import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ModelsList } from "./ModelsList";
import { useRuntimeStore } from "../../store/runtimeStore";
import { mockCommand } from "../../test/doubles/tauriCore";
import type { DownloadableModel, PullProgress } from "../../types";
// Importing for the side effect: `useTranslation` needs the shared i18next
// instance initialised, otherwise every label renders as its raw key and the
// queries below would match nothing.
import "../../i18n";

const QWEN_URL = "https://huggingface.co/x/qwen2.5-3b-instruct-q4_k_m.gguf";
const LLAMA_URL = "https://huggingface.co/y/llama-3.3-70b-instruct-q4_k_m.gguf";

/** Only the fields `ModelsList` and `ModelDownloadCard` actually read. Building
 *  a full `DownloadableModel` here would tie the test to every new column the
 *  Rust struct gains, which has nothing to do with the filter under test. */
function model(name: string, url: string, fits: boolean) {
  return {
    id: name,
    display_name: name,
    pull_identifier: url,
    params_billions: 3,
    default_quant: "Q4_K_M",
    estimated_ram_gb: 4,
    download_bytes: 2_000_000_000,
    fits_ram: fits,
  } as unknown as DownloadableModel;
}

const FITS = model("Qwen 3B", QWEN_URL, true);
const TOO_BIG = model("Llama 70B", LLAMA_URL, false);

const INITIAL = { ...useRuntimeStore.getState() };

beforeEach(() => {
  useRuntimeStore.setState(INITIAL);
  // The three commands the mount effect fires. The double rejects anything
  // unstubbed, so leaving one out would surface as an error banner instead of
  // the list under test.
  mockCommand("list_installed_models", []);
  mockCommand("get_active_model", null);
  mockCommand("list_downloadable_models", {
    ram_detected_gb: 16,
    models: [FITS, TOO_BIG],
  });
});

describe("fits_ram filter", () => {
  it("shows only what runs on this machine when the screen opens", async () => {
    render(<ModelsList />);

    // `findBy` because the list arrives from the async mount effect.
    expect(await screen.findByText("Qwen 3B")).toBeTruthy();
    expect(screen.queryByText("Llama 70B")).toBeNull();
  });

  it("reveals the models that do not fit once the user asks for all", async () => {
    render(<ModelsList />);
    await screen.findByText("Qwen 3B");

    fireEvent.click(screen.getByRole("checkbox"));

    expect(screen.getByText("Qwen 3B")).toBeTruthy();
    expect(screen.getByText("Llama 70B")).toBeTruthy();
  });

  it("keeps everything visible when the backend could not read the RAM", async () => {
    // The backend already answers `fits_ram = true` for every entry when the
    // memory is unknown (`runtime_commands.rs`: `!ram_known || estimated <= ram`),
    // so the component has nothing to special-case — this test pins that the
    // list does not filter a second time on `ram_detected_gb` being null.
    mockCommand("list_downloadable_models", {
      ram_detected_gb: null,
      models: [model("Qwen 3B", QWEN_URL, true), model("Llama 70B", LLAMA_URL, true)],
    });

    render(<ModelsList />);

    expect(await screen.findByText("Qwen 3B")).toBeTruthy();
    expect(screen.getByText("Llama 70B")).toBeTruthy();
    expect(screen.getByText("Couldn't detect your system memory — showing every model.")).toBeTruthy();
  });
});

describe("progress routing to the cards", () => {
  it("gives a card the progress stored under its own pull_identifier", async () => {
    // Two downloadable entries and progress for only one of them: the case the
    // C-04 names, where model A's bar would be driven by model B's download.
    useRuntimeStore.setState({
      downloadProgress: {
        [LLAMA_URL]: {
          status: "downloading",
          downloaded_bytes: 1,
          total_bytes: 4,
          message: null,
        } as PullProgress,
      },
    });

    render(<ModelsList />);
    await screen.findByText("Qwen 3B");
    fireEvent.click(screen.getByRole("checkbox"));

    // A downloading card swaps its button for a bar labelled with the status.
    // Exactly one card is in that state, and the other still offers its button —
    // the manual-download form contributes the second "Download" button.
    expect(screen.getAllByText("downloading")).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Download" })).toHaveLength(2);
  });
});
