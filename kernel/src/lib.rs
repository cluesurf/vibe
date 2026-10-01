// THE VIBE KERNEL, the crate root. kernel/
// prim     the arithmetic: each primitive computes a range of disjoint output rows, every floating-point operation the
//          reference's operation on the reference's operands in the reference's order (see prim.rs for the rules)
// pool     native only: a persistent std::thread pool that splits rows into contiguous ranges
// node     native only: the Node-API binding, raw extern "C" declarations of the few napi_* calls it needs
// wasm     wasm32 only: the same primitives as plain exports over the module's linear memory
//
// Rust never contracts a * b + c into a fused multiply-add (LLVM's default for Rust is no contraction, and there is no
// mul_add in this crate), and never reassociates without fast-math intrinsics, which this crate does not use.

pub mod prim;

#[cfg(not(target_arch = "wasm32"))]
mod node;
#[cfg(not(target_arch = "wasm32"))]
mod pool;

// the GPU binding (kernel/src/gpu.rs, the kernels in gpu.cu), only with a cargo feature: hip (AMD, hiprtc at load),
// cuda (NVIDIA, NVRTC at load) or emu (the same kernels compiled for the CPU, to check the GPU path where there is no
// GPU). Each loads its runtime with dlopen at first use, so no feature needs a GPU toolkit to BUILD
#[cfg(all(not(target_arch = "wasm32"), any(feature = "hip", feature = "cuda", feature = "emu")))]
mod gpu;

#[cfg(target_arch = "wasm32")]
mod wasm;
