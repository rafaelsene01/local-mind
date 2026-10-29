// GENERATED FILE — do not edit by hand.
//
// Produced from the Rust structs that cross the Tauri IPC, by
// `src-tauri/src/types_export.rs`. To regenerate after changing a struct:
//
//     cd src-tauri && cargo test --lib types_export -- --ignored
//
// SPEC: generated-types (TYPE-01, TYPE-02, TYPE-05, TYPE-07, TYPE-08)

export type Chat = { id: string, title: string, created_at: string, updated_at: string, 
/**
 * Whether this chat also searches the global knowledge base (CHAT-14).
 * Travels with the chat so the UI can show the persisted choice instead
 * of assuming a default per render.
 */
use_global_rag: boolean, 
/**
 * Whether completed turns of this chat are remembered and recalled
 * (MEM-14). Same reasoning as above: it travels with the chat so the
 * toggle shows the stored choice, not a default.
 */
use_memory: boolean, };

export type Message = { id: string, chat_id: string, role: "user" | "assistant" | "system", content: string, created_at: string, };

export type ChatStreamChunk = { chat_id: string, message_id: string, delta: string, done: boolean, error: string | null, };

export type ChatRetrievalWarning = { chat_id: string, reason: string, };

export type ChatAttachment = { id: string, filename: string, status: DocumentStatus | "injected_whole", error_message: string | null, created_at: string, };

export type MemoryBackfillProgress = { chat_id: string, done: number, total: number, };

export type AppConfig = { base_path: string, theme: string, language: string, onboarding_completed: boolean, 
/**
 * Update preferences (M8). Both `#[serde(default)]` so a config written by
 * an older build keeps deserializing instead of resetting the wizard.
 */
auto_update_check: boolean, skipped_version: string | null, };

export type StorageStatus = { configured: boolean, ready: boolean, base_path: string, };

export type InstallFlavor = "installed" | "portable";

export type UpdateInfo = { version: string, current_version: string, notes: string | null, pub_date: string | null, flavor: InstallFlavor, };

export type UpdateSettings = { current_version: string, auto_check: boolean, flavor: InstallFlavor, skipped_version: string | null, };

export type UpdateProgress = { downloaded: number, total: number | null, };

export type DocumentStatus = "queued" | "parsing" | "chunking" | "embedding" | "ready" | "error";

export type DocumentRecord = { id: string, filename: string, file_path: string, size_bytes: number, status: DocumentStatus, error_message: string | null, created_at: string, updated_at: string, };

export type RejectedImport = { path: string, reason: string, };

export type ImportResult = { imported: Array<DocumentRecord>, rejected: Array<RejectedImport>, };

export type DocumentStatusEvent = { id: string, status: DocumentStatus, error_message: string | null, };

export type InstalledModel = { name: string, size_bytes: number | null, };

export type CuratedModelInfo = { id: string, display_name: string, 
/**
 * The direct `.gguf` URL — there is no registry to pull by name (SELF-02).
 */
pull_identifier: string, params_billions: number, default_quant: string, estimated_ram_gb: number, 
/**
 * Exact download size, checked against the server when the entry was added.
 */
download_bytes: number | null, };

export type DownloadableModel = { fits_ram: boolean, id: string, display_name: string, 
/**
 * The direct `.gguf` URL — there is no registry to pull by name (SELF-02).
 */
pull_identifier: string, params_billions: number, default_quant: string, estimated_ram_gb: number, 
/**
 * Exact download size, checked against the server when the entry was added.
 */
download_bytes: number | null, };

export type DownloadableModelsResponse = { ram_detected_gb: number | null, models: Array<DownloadableModel>, };

export type PullStatus = "downloading" | "success" | "error";

export type PullProgress = { status: PullStatus, downloaded_bytes: number | null, total_bytes: number | null, message: string | null, };

export type ModelDownloadProgressEvent = { identifier: string, progress: PullProgress, };

export type ModelLimits = { max_context: number | null, current_context: number | null, };

export type ActiveModel = { name: string, path: string, context_length: number | null, gpu_layers: number | null, };

export type Backend = "vulkan" | "cpu";

export type RuntimeStage = "unsupported" | "not_prepared" | "preparing" | "no_model" | "ready" | "running";

export type RuntimeStatus = { stage: RuntimeStage, release_tag: string | null, backend: Backend | null, port: number | null, model_name: string | null, message: string | null, };

export type RuntimeProgressEvent = { stage: RuntimeStage, progress: PullProgress | null, message: string | null, };
