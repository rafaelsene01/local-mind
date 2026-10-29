// SPEC: generated-types (TYPE-01, TYPE-02, TYPE-03, TYPE-04, TYPE-09)

//! Generates `src/types.ts` from the Rust structs that cross the IPC.
//!
//! The point of this module is the **asymmetry** between its two callers:
//!
//! * `cargo test --lib` runs [`tests::types_ts_matches_rust_structs`], which
//!   only *reads* `src/types.ts` and compares. It never writes.
//! * Regenerating is an `#[ignore]`d test, run by hand.
//!
//! A generator that wrote during the normal test run would repair every
//! divergence on the spot and could never fail — the file would become a copy
//! of the current state instead of a check on it (the AD-041 trap: a test that
//! passes for the wrong reason).

use ts_rs::TS;

/// Header of the generated file. The regeneration command is written into the
/// file itself so whoever opens it does not have to find this module first.
const HEADER: &str = "\
// GENERATED FILE — do not edit by hand.
//
// Produced from the Rust structs that cross the Tauri IPC, by
// `src-tauri/src/types_export.rs`. To regenerate after changing a struct:
//
//     cd src-tauri && cargo test --lib types_export -- --ignored
//
// SPEC: generated-types (TYPE-01, TYPE-02, TYPE-05, TYPE-07, TYPE-08)
";

/// Emits one `export type X = …;` per type, in the order given below.
///
/// The order is written out by hand rather than collected from the `TS` impls
/// because there is no registry to iterate and, more to the point, TYPE-09
/// wants byte-identical output across runs: anything derived from test
/// execution order (which is parallel) would not give that.
macro_rules! declarations {
    ($cfg:expr, $($ty:ty),+ $(,)?) => {
        vec![$(<$ty as TS>::decl($cfg)),+]
    };
}

pub fn generate_types_ts() -> String {
    // `Config::default()`, not `from_env()`: reading `TS_RS_LARGE_INT` and
    // friends would make the generated file depend on the shell that ran the
    // test, and the gate compares bytes.
    let cfg = ts_rs::Config::default();

    let decls: Vec<String> = declarations![
        &cfg,
        // Chat surface
        crate::models::Chat,
        crate::models::Message,
        crate::chat_commands::ChatStreamChunk,
        crate::chat_commands::ChatRetrievalWarning,
        crate::chat_commands::ChatAttachment,
        crate::chat::memory::MemoryBackfillProgress,
        // Configuration and storage
        crate::config::AppConfig,
        crate::config::StorageStatus,
        // Updates
        crate::update::InstallFlavor,
        crate::update::UpdateInfo,
        crate::update_commands::UpdateSettings,
        crate::update::portable::DownloadProgress,
        // Documents and RAG
        crate::rag::pipeline::DocumentStatus,
        crate::document_commands::DocumentRecord,
        crate::document_commands::RejectedImport,
        crate::document_commands::ImportResult,
        crate::rag::pipeline::DocumentStatusEvent,
        // Models
        crate::providers::InstalledModel,
        crate::models::catalog::CuratedModelInfo,
        crate::runtime_commands::DownloadableModel,
        crate::runtime_commands::DownloadableModelsResponse,
        crate::providers::PullStatus,
        crate::providers::PullProgress,
        crate::runtime_commands::ModelDownloadProgress,
        crate::providers::ModelLimits,
        crate::runtime::store::ActiveModel,
        // Runtime
        crate::runtime::Backend,
        crate::runtime_commands::RuntimeStage,
        crate::runtime_commands::RuntimeStatus,
        crate::runtime_commands::RuntimeProgress,
    ];

    let mut out = String::from(HEADER);
    for decl in decls {
        out.push('\n');
        out.push_str("export ");
        out.push_str(decl.trim_end());
        if !decl.trim_end().ends_with(';') {
            out.push(';');
        }
        out.push('\n');
    }
    out
}

/// Path of the file the generation targets, resolved from the crate root so it
/// does not depend on the shell's working directory.
pub fn types_ts_path() -> std::path::PathBuf {
    std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../src/types.ts")
}

#[cfg(test)]
mod tests {
    use super::*;

    /// TYPE-03/TYPE-04. This is the whole feature: a field renamed in Rust
    /// compiles on both sides today and only surfaces as `undefined` on screen.
    #[test]
    fn types_ts_matches_rust_structs() {
        let path = types_ts_path();
        let committed = std::fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("could not read {}: {e}", path.display()));
        let generated = generate_types_ts();

        // Line endings are normalized before comparing: git may check the file
        // out with CRLF on Windows, and a diff over that would be noise that
        // fails the gate for a reason nobody can act on.
        let committed_norm = committed.replace("\r\n", "\n");

        if committed_norm != generated {
            let first_diff = committed_norm
                .lines()
                .zip(generated.lines())
                .position(|(a, b)| a != b)
                .map(|i| {
                    format!(
                        "first differing line ({}):\n  committed:  {}\n  generated:  {}",
                        i + 1,
                        committed_norm.lines().nth(i).unwrap_or("<missing>"),
                        generated.lines().nth(i).unwrap_or("<missing>"),
                    )
                })
                .unwrap_or_else(|| {
                    format!(
                        "same prefix, different length: committed {} lines, generated {} lines",
                        committed_norm.lines().count(),
                        generated.lines().count()
                    )
                });

            panic!(
                "src/types.ts is out of sync with the Rust structs.\n\
                 {first_diff}\n\n\
                 Regenerate it with:\n\
                 \x20   cd src-tauri && cargo test --lib types_export -- --ignored"
            );
        }
    }

    /// TYPE-09. Determinism is not free here: it is the reason the type list is
    /// a hand-written macro instead of anything collected at runtime.
    #[test]
    fn generation_is_deterministic() {
        assert_eq!(generate_types_ts(), generate_types_ts());
    }

    /// The `Backend` union in the generated file comes from the enum's variant
    /// names plus `#[ts(rename_all = "lowercase")]`, but the value that actually
    /// travels is whatever `Backend::as_str()` returns. Nothing in the compiler
    /// ties those two together, so this test does — otherwise changing
    /// `as_str()` would leave `RuntimeStatus.backend` narrowed to strings the
    /// backend no longer sends.
    #[test]
    fn backend_as_str_matches_generated_union() {
        use crate::runtime::Backend;
        let decl = <Backend as TS>::decl(&ts_rs::Config::default());
        for value in [Backend::Vulkan.as_str(), Backend::Cpu.as_str()] {
            assert!(
                decl.contains(&format!("\"{value}\"")),
                "Backend::as_str() returns {value:?}, missing from the generated union: {decl}"
            );
        }
    }

    /// TYPE-08, as a net rather than a per-field promise. ts-rs maps `u64`,
    /// `i64` and `usize` to `bigint`; the Tauri IPC serializes with
    /// `serde_json`, which writes them as JSON numbers, so the frontend always
    /// receives a `number`. Each affected field carries `#[ts(type = "number")]`
    /// — this test is what catches the *next* 64-bit field, added by someone who
    /// did not know the rule.
    #[test]
    fn no_bigint_reaches_the_frontend() {
        let generated = generate_types_ts();
        assert!(
            !generated.contains("bigint"),
            "a 64-bit field reached src/types.ts as `bigint`. The IPC delivers a \
             JSON number — annotate the field with #[ts(type = \"number\")]:\n{generated}"
        );
    }

    /// Rewrites `src/types.ts`. `#[ignore]`d on purpose: run inside the normal
    /// gate it would erase the divergence the gate exists to catch.
    #[test]
    #[ignore = "writes src/types.ts; run explicitly after changing a struct"]
    fn regenerate_types_ts() {
        let path = types_ts_path();
        std::fs::write(&path, generate_types_ts())
            .unwrap_or_else(|e| panic!("could not write {}: {e}", path.display()));
        println!("wrote {}", path.display());
    }
}
