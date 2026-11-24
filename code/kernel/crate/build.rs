// THE KERNEL CRATE'S LINK STEP. A Node-API addon calls napi_* functions that live in the node binary itself, so on macOS
// the shared library is linked with those symbols left undefined, to be resolved against node when it is loaded
// (-undefined dynamic_lookup, what node-gyp passes). No effect on the wasm build.

fn main() {
    let os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();

    if os == "macos" {
        println!("cargo:rustc-cdylib-link-arg=-undefined");
        println!("cargo:rustc-cdylib-link-arg=dynamic_lookup");
    }

    // the threaded wasm module (built with +atomics): its memory must be IMPORTED, so that one shared memory can be
    // handed to every instance, one per worker_thread (code/kernel/wasm-threads.ts). Set here rather than in RUSTFLAGS
    // so that changing it relinks the crate without rebuilding std
    let arch = std::env::var("CARGO_CFG_TARGET_ARCH").unwrap_or_default();
    let features = std::env::var("CARGO_CFG_TARGET_FEATURE").unwrap_or_default();

    if arch == "wasm32" && features.split(',').any(|f| f == "atomics") {
        println!("cargo:rustc-cdylib-link-arg=--import-memory");
        println!("cargo:rustc-cdylib-link-arg=--shared-memory");
    }

    println!("cargo:rerun-if-changed=build.rs");
}
