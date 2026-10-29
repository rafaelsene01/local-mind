// SPEC: frontend-testing (FTEST-20)

import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_THEME, SUPPORTED_THEMES, applyTheme, cachedTheme, normalizeTheme } from "./theme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("normalizeTheme", () => {
  it("keeps every supported theme untouched", () => {
    for (const theme of SUPPORTED_THEMES) {
      expect(normalizeTheme(theme)).toBe(theme);
    }
  });

  it("maps the renamed id instead of resetting the user to the default", () => {
    // The whole reason RENAMED_THEMES exists: "claude" is persisted on disk for
    // users who chose it before the rename, and falling through to the default
    // would look like the app forgot their choice.
    expect(normalizeTheme("claude")).toBe("terracotta");
    expect(normalizeTheme("claude")).not.toBe(DEFAULT_THEME);
  });

  it("falls back to the default for an id nobody ever shipped", () => {
    expect(normalizeTheme("solarized")).toBe(DEFAULT_THEME);
  });

  it("survives null and undefined", () => {
    expect(normalizeTheme(null)).toBe(DEFAULT_THEME);
    expect(normalizeTheme(undefined)).toBe(DEFAULT_THEME);
  });
});

describe("applyTheme", () => {
  it("writes the normalized id, not the raw one, to both the DOM and storage", () => {
    applyTheme("claude");

    expect(document.documentElement.getAttribute("data-theme")).toBe("terracotta");
    expect(localStorage.getItem("localmind-theme")).toBe("terracotta");
  });
});

describe("cachedTheme", () => {
  it("normalizes what it reads back from storage", () => {
    localStorage.setItem("localmind-theme", "claude");

    expect(cachedTheme()).toBe("terracotta");
  });
});
