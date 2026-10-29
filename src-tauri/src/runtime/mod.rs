// SPEC: generated-types (TYPE-07)

pub mod bundled;
pub mod detect;
pub mod download;
pub mod job;
pub mod log;
pub mod model;
pub mod process;
pub mod store;

/// Only these two are shipped as prebuilt llama.cpp binaries by the project
/// for the platforms this milestone targets; anything else makes the embedded
/// runtime unavailable instead of downloading something guaranteed to fail.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TargetOs {
    Windows,
    Linux,
}

impl TargetOs {
    pub fn current() -> Option<Self> {
        match std::env::consts::OS {
            "windows" => Some(TargetOs::Windows),
            "linux" => Some(TargetOs::Linux),
            _ => None,
        }
    }
}

/// Vulkan covers NVIDIA/AMD/Intel with a single binary and no vendor toolkit;
/// CUDA is deliberately out of scope (AD-022). Cpu is the fallback for
/// machines where the Vulkan build cannot even start.
/// `TS` is derived even though `Backend` is never serialized by serde: the value
/// that reaches the frontend is the string `as_str()` produces, stored in
/// `embedded_runtime.backend` and read back into `RuntimeStatus.backend`
/// (TYPE-07). Deriving it here is what lets that field be narrowed to the
/// variant list instead of two hand-typed literals in `types.ts`.
///
/// `rename_all` restates the mapping `as_str()` performs; the two are pinned
/// together by `types_export::tests::backend_as_str_matches_generated_union`.
#[derive(Debug, Clone, Copy, PartialEq, ts_rs::TS)]
#[ts(rename_all = "lowercase")]
pub enum Backend {
    Vulkan,
    Cpu,
}

impl Backend {
    pub fn as_str(&self) -> &'static str {
        match self {
            Backend::Vulkan => "vulkan",
            Backend::Cpu => "cpu",
        }
    }
}

#[derive(Debug)]
pub enum RuntimeError {
    UnsupportedPlatform,
    Network(String),
    Io(String),
}

impl std::fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RuntimeError::UnsupportedPlatform => write!(
                f,
                "runtime embutido não está disponível neste sistema operacional"
            ),
            RuntimeError::Network(msg) => write!(f, "falha de rede: {msg}"),
            RuntimeError::Io(msg) => write!(f, "erro de arquivo: {msg}"),
        }
    }
}

impl std::error::Error for RuntimeError {}
