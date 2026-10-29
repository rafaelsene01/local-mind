// SPEC: frontend-testing (FTEST-24)

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelDownloadCard } from "./ModelDownloadCard";
import type { DownloadableModel, PullProgress } from "../../types";
// Side-effect import: without the shared i18next instance the button labels
// render as raw keys and every query below misses.
import "../../i18n";

/** Only the fields the card reads. See `ModelsList.test.tsx` for why the object
 *  is not built as a full `DownloadableModel`. */
const MODEL = {
  id: "qwen",
  display_name: "Qwen 3B",
  pull_identifier: "https://huggingface.co/x/qwen.gguf",
  params_billions: 3,
  default_quant: "Q4_K_M",
  estimated_ram_gb: 4,
  download_bytes: 2_000_000_000,
  fits_ram: true,
} as unknown as DownloadableModel;

function progress(downloaded: number | null, total: number | null): PullProgress {
  return {
    status: "downloading",
    downloaded_bytes: downloaded,
    total_bytes: total,
    message: null,
  } as PullProgress;
}

/** The bar has no role and no text — the only thing that identifies it is the
 *  inline width, which is exactly what is under test. Querying by the inline
 *  style instead of by a Tailwind class keeps the test off the class names,
 *  which the design forbids coupling to. Throws when the bar is absent, so a
 *  card that stopped rendering it cannot pass by silence. */
function barWidth(container: HTMLElement) {
  const bar = container.querySelector<HTMLElement>('div[style*="width"]');
  if (!bar) throw new Error("no progress bar rendered");
  return bar.style.width;
}

describe("download percentage", () => {
  it("rounds the ratio the backend reports", () => {
    // 5/8 = 62.5%, which only survives as "63%" if the rounding is really there.
    const { container } = render(
      <ModelDownloadCard model={MODEL} progress={progress(5, 8)} onDownload={() => {}} />,
    );

    expect(barWidth(container)).toBe("63%");
  });

  it("stops at 100% when the backend reports more bytes than it announced", () => {
    // Real case the clamp exists for: a resumed or re-counted download can push
    // `downloaded_bytes` past `total_bytes`, and a bar wider than its track
    // spills out of the card.
    const { container } = render(
      <ModelDownloadCard model={MODEL} progress={progress(12, 10)} onDownload={() => {}} />,
    );

    expect(barWidth(container)).toBe("100%");
  });

  it("shows an empty bar instead of NaN when the total size is unknown", () => {
    const { container } = render(
      <ModelDownloadCard model={MODEL} progress={progress(500, null)} onDownload={() => {}} />,
    );

    const width = barWidth(container);
    expect(width).toBe("0%");
    expect(width).not.toContain("NaN");
  });

  it("shows an empty bar on the first event, before any byte has landed", () => {
    // `downloaded_bytes: 0` is falsy, so the percentage is skipped rather than
    // computed as zero. Same pixel result, and this test pins it so a later
    // refactor of that condition has to be deliberate.
    const { container } = render(
      <ModelDownloadCard model={MODEL} progress={progress(0, 4_000)} onDownload={() => {}} />,
    );

    expect(barWidth(container)).toBe("0%");
  });
});

describe("card state", () => {
  it("offers the download button while nothing is in flight", () => {
    render(<ModelDownloadCard model={MODEL} onDownload={() => {}} />);

    expect(screen.getByRole("button", { name: "Download" })).toBeTruthy();
  });

  it("goes back to a button once the download succeeded", () => {
    const done = { status: "success", downloaded_bytes: 4, total_bytes: 4, message: null };
    render(
      <ModelDownloadCard model={MODEL} progress={done as PullProgress} onDownload={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "Downloaded" })).toBeTruthy();
  });

  it("shows the backend message when the download failed", () => {
    const failed = {
      status: "error",
      downloaded_bytes: null,
      total_bytes: null,
      message: "conexão caiu",
    };
    render(
      <ModelDownloadCard model={MODEL} progress={failed as PullProgress} onDownload={() => {}} />,
    );

    expect(screen.getByText("conexão caiu")).toBeTruthy();
  });
});
