// SPEC: frontend-testing (FTEST-12, FTEST-19)

import { beforeEach, describe, expect, it } from "vitest";
import { useDocumentsStore } from "./documentsStore";
import { callsTo, failCommand, mockCommand } from "../test/doubles/tauriCore";
import { emit } from "../test/doubles/tauriEvent";
import type { DocumentRecord } from "../types";

function doc(id: string, status: string) {
  return { id, name: `${id}.pdf`, status, error_message: null } as unknown as DocumentRecord;
}

const INITIAL = { ...useDocumentsStore.getState() };

beforeEach(() => {
  useDocumentsStore.setState(INITIAL);
});

describe("document-status listener", () => {
  it("updates only the row whose id matches", () => {
    // Three rows, and the target is the middle one: with a single document the
    // listener would pass even ignoring the id entirely.
    useDocumentsStore.setState({
      documents: [doc("a", "queued"), doc("b", "queued"), doc("c", "queued")],
    });

    emit("document-status", { id: "b", status: "indexed", error_message: null });

    expect(useDocumentsStore.getState().documents.map((d) => d.status)).toEqual([
      "queued",
      "indexed",
      "queued",
    ]);
  });

  it("carries the failure message of the row that failed", () => {
    useDocumentsStore.setState({ documents: [doc("a", "parsing"), doc("b", "parsing")] });

    emit("document-status", { id: "a", status: "error", error_message: "PDF sem texto" });

    const docs = useDocumentsStore.getState().documents;
    expect(docs[0].error_message).toBe("PDF sem texto");
    expect(docs[1].error_message).toBeNull();
  });

  it("ignores an event for a document that is not on the list", () => {
    useDocumentsStore.setState({ documents: [doc("a", "queued")] });

    emit("document-status", { id: "zzz", status: "indexed", error_message: null });

    expect(useDocumentsStore.getState().documents).toEqual([doc("a", "queued")]);
  });
});

describe("importDocuments", () => {
  it("keeps the refused files next to the ones that went in", async () => {
    const rejected = [{ path: "/tmp/x.exe", reason: "extensão não suportada" }];
    mockCommand("import_documents", { rejected });
    mockCommand("list_documents", [doc("a", "queued")]);

    await useDocumentsStore.getState().importDocuments(["/tmp/x.exe", "/tmp/ok.pdf"]);

    const state = useDocumentsStore.getState();
    expect(state.rejected).toEqual(rejected);
    expect(state.isImporting).toBe(false);
    expect(callsTo("import_documents")[0].args).toEqual({
      paths: ["/tmp/x.exe", "/tmp/ok.pdf"],
    });
  });
});

describe("error handling", () => {
  it("clears isImporting even when the import rejects", async () => {
    failCommand("import_documents", "pasta somiu");

    await expect(useDocumentsStore.getState().importDocuments(["/x"])).resolves.toBeUndefined();

    const state = useDocumentsStore.getState();
    expect(state.error).toContain("pasta somiu");
    expect(state.isImporting).toBe(false);
  });
});
