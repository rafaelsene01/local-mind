// SPEC: frontend-testing (FTEST-05, FTEST-06, FTEST-07, FTEST-08, FTEST-09,
//       FTEST-10, FTEST-13, FTEST-14, FTEST-15, FTEST-16, FTEST-17, FTEST-18,
//       FTEST-19)

import { beforeEach, describe, expect, it } from "vitest";
import { useChatStore } from "./chatStore";
import { callsTo, failCommand, mockCommand } from "../test/doubles/tauriCore";
import { emit } from "../test/doubles/tauriEvent";
import type { Chat, Message } from "../types";

// Cast instead of spelling every field: `src/types.ts` mirrors the Rust structs
// and is being generated (C-03), so a literal with all columns would break on
// any unrelated schema change. The store only reads the fields named here.
function chat(id: string, extra: Record<string, unknown> = {}) {
  return { id, title: id, use_global_rag: true, use_memory: true, ...extra } as unknown as Chat;
}
function message(id: string, chatId: string, content: string) {
  return { id, chat_id: chatId, role: "assistant", content } as unknown as Message;
}

const INITIAL = { ...useChatStore.getState() };

beforeEach(() => {
  useChatStore.setState(INITIAL);
});

describe("memory-backfill-progress listener", () => {
  it("updates progress for the chat that is being indexed", () => {
    useChatStore.setState({ memoryIndexing: { chat_id: "a", done: 0, total: 10 } });

    emit("memory-backfill-progress", { chat_id: "a", done: 4, total: 10 });

    expect(useChatStore.getState().memoryIndexing).toEqual({ chat_id: "a", done: 4, total: 10 });
  });

  it("drops an event that belongs to a different conversation", () => {
    useChatStore.setState({ memoryIndexing: { chat_id: "a", done: 4, total: 10 } });

    emit("memory-backfill-progress", { chat_id: "b", done: 9, total: 9 });

    expect(useChatStore.getState().memoryIndexing).toEqual({ chat_id: "a", done: 4, total: 10 });
  });

  it("drops an event when no indexing is running", () => {
    expect(useChatStore.getState().memoryIndexing).toBeNull();

    emit("memory-backfill-progress", { chat_id: "a", done: 1, total: 3 });

    expect(useChatStore.getState().memoryIndexing).toBeNull();
  });
});

describe("chat-stream-chunk listener", () => {
  it("concatenates deltas of the streaming chat in arrival order", () => {
    useChatStore.setState({ streamingChatId: "a", streamingContent: "" });

    emit("chat-stream-chunk", { chat_id: "a", delta: "Bom ", done: false });
    emit("chat-stream-chunk", { chat_id: "a", delta: "dia", done: false });

    expect(useChatStore.getState().streamingContent).toBe("Bom dia");
  });

  it("discards a delta from a chat that is not streaming, even when it is on screen", () => {
    // The pair that matters: the event's chat IS the active one, so a guard
    // written against `activeChatId` instead of `streamingChatId` would let it
    // through and pollute the text of the generation actually running.
    useChatStore.setState({ activeChatId: "b", streamingChatId: "a", streamingContent: "olá" });

    emit("chat-stream-chunk", { chat_id: "b", delta: "INTRUSO", done: false });

    expect(useChatStore.getState().streamingContent).toBe("olá");
  });

  it("ends the generation on done without touching the accumulated text", () => {
    useChatStore.setState({
      streamingChatId: "a",
      generatingChatId: "a",
      streamingContent: "olá",
    });

    emit("chat-stream-chunk", { chat_id: "a", delta: "", done: true });

    const state = useChatStore.getState();
    expect(state.generatingChatId).toBeNull();
    expect(state.streamingContent).toBe("olá");
  });

  it("ends the generation on error without showing it in the conversation on screen", () => {
    useChatStore.setState({
      activeChatId: "b",
      streamingChatId: "a",
      generatingChatId: "a",
      error: null,
    });

    emit("chat-stream-chunk", { chat_id: "a", delta: "", done: false, error: "sidecar caiu" });

    const state = useChatStore.getState();
    expect(state.generatingChatId).toBeNull();
    expect(state.error).toBeNull();
  });

  it("shows the error when the failing chat is the one on screen", () => {
    useChatStore.setState({ activeChatId: "a", streamingChatId: "a", generatingChatId: "a" });

    emit("chat-stream-chunk", { chat_id: "a", delta: "", done: false, error: "sidecar caiu" });

    expect(useChatStore.getState().error).toBe("sidecar caiu");
  });
});

describe("chat-retrieval-warning listener", () => {
  it("warns only for the conversation on screen", () => {
    useChatStore.setState({ activeChatId: "a" });

    emit("chat-retrieval-warning", { chat_id: "b", reason: "índice indisponível" });
    expect(useChatStore.getState().retrievalWarning).toBeNull();

    emit("chat-retrieval-warning", { chat_id: "a", reason: "índice indisponível" });
    expect(useChatStore.getState().retrievalWarning).toBe("índice indisponível");
  });
});

describe("sendMessage", () => {
  function stubReloads(chatId: string, messages: Message[] = []) {
    mockCommand("list_messages", () => (chatId === "*" ? messages : messages));
    mockCommand("list_chat_attachments", []);
    mockCommand("list_chats", []);
  }

  it("does nothing without an active chat", async () => {
    await useChatStore.getState().sendMessage("oi", []);

    expect(callsTo("send_message")).toHaveLength(0);
    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  it("shows the user message before the backend answers", async () => {
    let release: () => void = () => {};
    const held = new Promise<string>((resolve) => {
      release = () => resolve("id");
    });
    useChatStore.setState({ activeChatId: "a", messages: [] });
    mockCommand("send_message", () => held);
    stubReloads("a");

    const pending = useChatStore.getState().sendMessage("oi", []);

    // Asserted while `send_message` is still unresolved — that is the whole
    // point of the optimistic message.
    expect(useChatStore.getState().messages.map((m) => m.content)).toEqual(["oi"]);
    expect(useChatStore.getState().generatingChatId).toBe("a");

    release();
    await pending;
  });

  it("does not replace the conversation the user switched to mid-generation", async () => {
    const openConversation = [message("m-b", "b", "conversa B")];
    useChatStore.setState({ activeChatId: "a", messages: [] });
    mockCommand("send_message", () => {
      // The user navigates away while the answer is still being produced.
      useChatStore.setState({ activeChatId: "b", messages: openConversation });
      return "id";
    });
    mockCommand("list_messages", [message("m-a", "a", "conversa A")]);
    mockCommand("list_chat_attachments", []);
    mockCommand("list_chats", []);

    await useChatStore.getState().sendMessage("oi", []);

    expect(useChatStore.getState().messages.map((m) => m.content)).toEqual(["conversa B"]);
    expect(callsTo("list_messages")).toHaveLength(0);
  });

  it("hides a failure that belongs to a conversation no longer on screen", async () => {
    useChatStore.setState({ activeChatId: "a", messages: [] });
    mockCommand("send_message", () => {
      useChatStore.setState({ activeChatId: "b", messages: [] });
      throw new Error("modelo não carregado");
    });
    stubReloads("a");

    await useChatStore.getState().sendMessage("oi", []);

    expect(useChatStore.getState().error).toBeNull();
  });

  // CHARACTERIZATION — this asserts a DEFECT, not the intended behaviour.
  //
  // `sendMessage` sets `error` in its `catch`, then its `finally` calls
  // `loadChats()`, whose first statement is `set({ isLoading: true, error: null })`.
  // The failure is therefore visible for one tick and gone before React can
  // paint it: a `send_message` that rejects reaches the user as silence.
  //
  // The test is written over the sequence of values rather than the final one
  // so that fixing the store makes it fail loudly here (the second expectation
  // is the one that has to be flipped), instead of quietly still passing.
  it("loses a failure of the conversation on screen when the chat list reloads (defect)", async () => {
    const seen: Array<string | null> = [];
    const unsubscribe = useChatStore.subscribe((s) => seen.push(s.error));
    useChatStore.setState({ activeChatId: "a", messages: [] });
    failCommand("send_message", "modelo não carregado");
    stubReloads("a");

    await useChatStore.getState().sendMessage("oi", []);
    unsubscribe();

    expect(seen.some((e) => e?.includes("modelo não carregado"))).toBe(true);
    expect(useChatStore.getState().error).toBeNull();
  });
});

describe("optimistic toggles", () => {
  it("keeps the new value when the backend accepts it, with the params the bridge expects", async () => {
    useChatStore.setState({ chats: [chat("a", { use_memory: false }), chat("b")] });
    mockCommand("set_chat_use_memory", null);

    await useChatStore.getState().setUseMemory("a", true);

    expect(useChatStore.getState().chats[0].use_memory).toBe(true);
    expect(callsTo("set_chat_use_memory")[0].args).toEqual({ chatId: "a", enabled: true });
  });

  it("rolls the whole list back when the backend refuses", async () => {
    const before = [chat("a", { use_memory: false }), chat("b", { use_memory: true })];
    useChatStore.setState({ chats: before });
    failCommand("set_chat_use_memory", "banco travado");

    await useChatStore.getState().setUseMemory("a", true);

    expect(useChatStore.getState().chats).toEqual(before);
    expect(useChatStore.getState().error).toContain("banco travado");
  });

  it("rolls the global rag toggle back too", async () => {
    const before = [chat("a", { use_global_rag: true })];
    useChatStore.setState({ chats: before });
    failCommand("set_chat_use_global_rag", "banco travado");

    await useChatStore.getState().setUseGlobalRag("a", false);

    expect(useChatStore.getState().chats).toEqual(before);
  });
});

describe("deleteChat", () => {
  it("clears the view when the deleted chat was the one open", async () => {
    useChatStore.setState({ activeChatId: "a", messages: [message("m", "a", "texto")] });
    mockCommand("delete_chat", null);
    mockCommand("list_chats", []);

    await useChatStore.getState().deleteChat("a");

    const state = useChatStore.getState();
    expect(state.activeChatId).toBeNull();
    expect(state.messages).toHaveLength(0);
  });

  it("leaves the open conversation alone when another chat is deleted", async () => {
    useChatStore.setState({ activeChatId: "a", messages: [message("m", "a", "texto")] });
    mockCommand("delete_chat", null);
    mockCommand("list_chats", []);

    await useChatStore.getState().deleteChat("b");

    const state = useChatStore.getState();
    expect(state.activeChatId).toBe("a");
    expect(state.messages.map((m) => m.content)).toEqual(["texto"]);
  });
});

describe("error handling", () => {
  it("turns a rejected command into a string instead of propagating it", async () => {
    failCommand("list_chats", "sem banco");

    await expect(useChatStore.getState().loadChats()).resolves.toBeUndefined();

    const state = useChatStore.getState();
    expect(state.error).toContain("sem banco");
    expect(state.isLoading).toBe(false);
  });
});
