// THE KERNEL CRATE'S LINK STEP. A Node-API addon calls napi_* functions that live in the node binary itself, so on macOS
// the shared library is linked with those symbols left undefined, to be resolved against node when it is loaded
// (-undefined dynamic_lookup, what node-gyp passes). No effect on the wasm build.

fn main() {
    let os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();

    if os == "macos" {
        println!("cargo:rustc-cdylib-link-arg=-undefined");
        println!("cargo:rustc-cdylib-link-arg=dynamic_lookup");
    }

    println!("cargo:rerun-if-changed=build.rs");
}
