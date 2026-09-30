// THE KERNEL ON A GPU: the Node-API binding for the hip, cuda and emu backends. kernel/src/
// The primitives' arithmetic is gpu.cu, one C-like source that compiles as HIP, as CUDA and (with VK_EMU) as plain C++.
// This file loads a runtime, compiles gpu.cu for the device at hand, owns device memory, and launches the kernels.
//
// WHY RUNTIME COMPILATION. The source is compiled at load by the vendor's runtime compiler (hiprtc for AMD, NVRTC for
// NVIDIA) on the machine that runs it, and both runtimes are opened with dlopen, their few calls declared here by hand
// as node.rs declares napi. So the crate stays dependency-free, a build with the hip or cuda feature needs no toolkit
// (it compiles on a laptop with neither, which is how it is checked there), the device architecture is the one found
// at load (gfx942 on an MI300X, sm_90 on a GH200) rather than a guess at build time, and the FMA control is a compile
// OPTION at load (VIBE_KERNEL_GPU_CONTRACT), not a second build.
//
// The compile options are the arithmetic contract: hiprtc gets -ffp-contract=off (clang's HIP default is to fuse), and
// gpu.cu carries `#pragma clang fp contract(off)` as well; NVRTC gets --fmad=false, which emits mul.rn and add.rn (the
// .rn forms ptxas never fuses). The control passes -ffp-contract=fast and --fmad=true and defines VK_CONTRACT, which
// drops the pragma.
//
// MEMORY. A device buffer is a napi external (DevBuf) owning one allocation, freed by gpuFree or when the external is
// collected. The TypeScript side (code/kernel/gpu.ts) decides what lives on the device between calls: held states, and
// tables uploaded once. Every call here checks each buffer's size against what the kernel will touch, as node.rs checks
// a typed array's length; index CONTENTS (the pair operator's tables excepted, checked here from the host arrays before
// upload) are checked by the TypeScript side on the host copy, as the wasm backend's are.
//
// Every launch is followed by a synchronize and an error check, so a fault is reported at the primitive that caused it
// and a timing is the kernel's.

#![allow(non_camel_case_types)]
// a build with one feature leaves the other runtimes' loaders unused
#![allow(dead_code)]

use crate::node::{
    self, args, check, done, int, napi_callback, napi_create_external, napi_create_string_utf8,
    napi_get_typedarray_info, napi_get_value_external, napi_get_value_string_utf8, napi_is_typedarray, napi_typeof,
    napi_env, napi_callback_info, napi_value, num, throw, NAPI_OK, R, VT_NULL, VT_UNDEFINED,
};
use crate::prim;
use std::collections::HashMap;
use std::ffi::{c_char, c_int, c_void, CStr, CString};
use std::ptr;
use std::sync::Mutex;

pub const SOURCE: &str = include_str!("gpu.cu");

const KERNELS: [&str; 21] = [
    "vk_conv",
    "vk_pair_beat",
    "vk_cross_apply",
    "vk_block_add",
    "vk_block_inner",
    "vk_axpy",
    "vk_scale",
    "vk_sea_phase",
    "vk_sea_left",
    "vk_sea_right",
    "vk_sea_core",
    "vk_sea_g",
    "vk_sea_update",
    "vk_sea_stream",
    "vk_phase_sum",
    "vk_hole_one_body",
    "vk_hole_band",
    "vk_hp_gather",
    "vk_hp_axis",
    "vk_hp_phase",
    "vk_hp_scatter",
];

const BLOCK: u64 = 256;
// a grid-stride launch never needs more blocks than this (the kernels loop over the rest)
const MAX_BLOCKS: u64 = 1 << 20;
// the pair piece's columns take at most this many bytes a batch of orbits
const COLUMN_BUDGET: usize = 2 << 30;
// the pair piece's transform uses at most this many threads, each with its own grid scratch
const AXIS_SLOTS: usize = 1 << 17;

// ---- dlopen ----

extern "C" {
    fn dlopen(filename: *const c_char, flag: c_int) -> *mut c_void;
    fn dlsym(handle: *mut c_void, symbol: *const c_char) -> *mut c_void;
    fn dlerror() -> *const c_char;
}

const RTLD_NOW: c_int = 2;

unsafe fn open(names: &[String]) -> Result<*mut c_void, String> {
    let mut why = Vec::new();

    for n in names {
        let c = CString::new(n.as_str()).map_err(|_| "a library name holds a NUL".to_string())?;
        let h = dlopen(c.as_ptr(), RTLD_NOW);

        if !h.is_null() {
            return Ok(h);
        }

        let e = dlerror();

        why.push(if e.is_null() { n.clone() } else { CStr::from_ptr(e).to_string_lossy().into_owned() });
    }

    Err(format!("could not load {}", why.join("; ")))
}

unsafe fn sym<T: Copy>(h: *mut c_void, name: &str) -> Result<T, String> {
    let c = CString::new(name).map_err(|_| "a symbol name holds a NUL".to_string())?;
    let p = dlsym(h, c.as_ptr());

    if p.is_null() {
        return Err(format!("the runtime has no {name}"));
    }

    Ok(std::mem::transmute_copy::<*mut c_void, T>(&p))
}

// ---- the driver: the same dozen calls in HIP and in CUDA ----

type Malloc = unsafe extern "C" fn(*mut u64, usize) -> i32;
type Free = unsafe extern "C" fn(u64) -> i32;
type HtoD = unsafe extern "C" fn(u64, *const c_void, usize) -> i32;
type DtoH = unsafe extern "C" fn(*mut c_void, u64, usize) -> i32;
type DtoD = unsafe extern "C" fn(u64, u64, usize) -> i32;
type Launch = unsafe extern "C" fn(
    *mut c_void,
    u32,
    u32,
    u32,
    u32,
    u32,
    u32,
    u32,
    *mut c_void,
    *mut *mut c_void,
    *mut *mut c_void,
) -> i32;
type Synchronize = unsafe extern "C" fn() -> i32;
type HipErr = unsafe extern "C" fn(i32) -> *const c_char;
type CuErr = unsafe extern "C" fn(i32, *mut *const c_char) -> i32;

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Kind {
    Hip,
    Cuda,
    Emu,
}

struct Driver {
    malloc: Malloc,
    free: Free,
    htod: HtoD,
    dtoh: DtoH,
    dtod: DtoD,
    launch: Launch,
    sync: Synchronize,
    hip_err: Option<HipErr>,
    cu_err: Option<CuErr>,
    // CUDA's context is per thread: set current before every call (a no-op when it already is)
    cu_ctx: *mut c_void,
    cu_set: Option<unsafe extern "C" fn(*mut c_void) -> i32>,
}

pub struct Gpu {
    kind: Kind,
    contract: bool,
    drv: Option<Driver>,
    fns: HashMap<&'static str, *mut c_void>,
    info: String,
    // reusable device scratch by slot: (pointer, bytes)
    scratch: Mutex<Vec<(u64, usize)>>,
}

unsafe impl Send for Gpu {}
unsafe impl Sync for Gpu {}

static GPU: Mutex<Option<&'static Gpu>> = Mutex::new(None);

fn gpu() -> Option<&'static Gpu> {
    *GPU.lock().unwrap_or_else(|e| e.into_inner())
}

impl Gpu {
    fn err(&self, code: i32, what: &str) -> Result<(), String> {
        if code == 0 {
            return Ok(());
        }

        let d = self.drv.as_ref();
        let text = unsafe {
            match (d.and_then(|d| d.hip_err), d.and_then(|d| d.cu_err)) {
                (Some(f), _) => {
                    let p = f(code);

                    if p.is_null() { String::new() } else { CStr::from_ptr(p).to_string_lossy().into_owned() }
                }
                (_, Some(f)) => {
                    let mut p: *const c_char = ptr::null();

                    f(code, &mut p);

                    if p.is_null() { String::new() } else { CStr::from_ptr(p).to_string_lossy().into_owned() }
                }
                _ => String::new(),
            }
        };

        Err(format!("{what}: error {code} {text}"))
    }

    fn current(&self) -> Result<(), String> {
        if let Some(d) = &self.drv {
            if let Some(set) = d.cu_set {
                return self.err(unsafe { set(d.cu_ctx) }, "cuCtxSetCurrent");
            }
        }

        Ok(())
    }

    fn alloc(&self, bytes: usize) -> Result<u64, String> {
        let size = bytes.max(8);

        match &self.drv {
            None => {
                let layout = std::alloc::Layout::from_size_align(size, 64).map_err(|e| e.to_string())?;
                let p = unsafe { std::alloc::alloc_zeroed(layout) };

                if p.is_null() {
                    return Err(format!("could not allocate {size} bytes"));
                }

                Ok(p as u64)
            }
            Some(d) => {
                self.current()?;

                let mut p = 0u64;

                self.err(unsafe { (d.malloc)(&mut p, size) }, &format!("device allocation of {size} bytes"))?;
                Ok(p)
            }
        }
    }

    fn free(&self, p: u64, bytes: usize) {
        match &self.drv {
            None => {
                if let Ok(layout) = std::alloc::Layout::from_size_align(bytes.max(8), 64) {
                    unsafe { std::alloc::dealloc(p as *mut u8, layout) };
                }
            }
            Some(d) => {
                let _ = self.current();

                unsafe { (d.free)(p) };
            }
        }
    }

    fn htod(&self, dst: u64, src: *const u8, bytes: usize) -> Result<(), String> {
        if bytes == 0 {
            return Ok(());
        }

        match &self.drv {
            None => {
                unsafe { ptr::copy_nonoverlapping(src, dst as *mut u8, bytes) };
                Ok(())
            }
            Some(d) => {
                self.current()?;
                self.err(unsafe { (d.htod)(dst, src as *const c_void, bytes) }, "copy to the device")
            }
        }
    }

    fn dtoh(&self, dst: *mut u8, src: u64, bytes: usize) -> Result<(), String> {
        if bytes == 0 {
            return Ok(());
        }

        match &self.drv {
            None => {
                unsafe { ptr::copy_nonoverlapping(src as *const u8, dst, bytes) };
                Ok(())
            }
            Some(d) => {
                self.current()?;
                self.err(unsafe { (d.sync)() }, "synchronize")?;
                self.err(unsafe { (d.dtoh)(dst as *mut c_void, src, bytes) }, "copy from the device")
            }
        }
    }

    fn dtod(&self, dst: u64, src: u64, bytes: usize) -> Result<(), String> {
        if bytes == 0 {
            return Ok(());
        }

        match &self.drv {
            None => {
                unsafe { ptr::copy(src as *const u8, dst as *mut u8, bytes) };
                Ok(())
            }
            Some(d) => {
                self.current()?;
                self.err(unsafe { (d.dtod)(dst, src, bytes) }, "copy on the device")?;
                self.err(unsafe { (d.sync)() }, "synchronize")
            }
        }
    }

    // launch `threads` threads (a grid-stride kernel loops over the rest of its work), then synchronize
    fn launch<T>(&self, name: &'static str, threads: u64, a: &T) -> Result<(), String> {
        if threads == 0 {
            return Ok(());
        }

        let f = *self.fns.get(name).ok_or_else(|| format!("no kernel {name}"))?;

        match &self.drv {
            None => {
                // the emulator: one call runs the whole grid-stride loop on this thread
                let g: unsafe extern "C" fn(*const c_void) = unsafe { std::mem::transmute(f) };

                unsafe { g(a as *const T as *const c_void) };
                Ok(())
            }
            Some(d) => {
                self.current()?;

                let blocks = threads.div_ceil(BLOCK).clamp(1, MAX_BLOCKS) as u32;
                let mut params = [a as *const T as *mut c_void];
                let code = unsafe {
                    (d.launch)(
                        f,
                        blocks,
                        1,
                        1,
                        BLOCK as u32,
                        1,
                        1,
                        0,
                        ptr::null_mut(),
                        params.as_mut_ptr(),
                        ptr::null_mut(),
                    )
                };

                self.err(code, name)?;
                self.err(unsafe { (d.sync)() }, name)
            }
        }
    }

    // a scratch buffer of at least `bytes`, reused across calls (slot numbers are fixed per use below)
    fn scratch(&self, slot: usize, bytes: usize) -> Result<u64, String> {
        let mut s = self.scratch.lock().unwrap_or_else(|e| e.into_inner());

        while s.len() <= slot {
            s.push((0, 0));
        }

        if s[slot].1 < bytes {
            if s[slot].0 != 0 {
                self.free(s[slot].0, s[slot].1);
                s[slot] = (0, 0);
            }

            let p = self.alloc(bytes)?;

            s[slot] = (p, bytes.max(8));
        }

        Ok(s[slot].0)
    }

    fn emu(&self) -> bool {
        self.kind == Kind::Emu
    }
}

// ---- loading a runtime and compiling gpu.cu ----

fn rocm_names(lib: &str, version: &str) -> Vec<String> {
    let mut out = vec![format!("{lib}.so"), format!("{lib}.so.{version}")];

    if let Ok(p) = std::env::var("ROCM_PATH") {
        out.push(format!("{p}/lib/{lib}.so"));
    }

    out.push(format!("/opt/rocm/lib/{lib}.so"));
    out
}

fn cuda_names(lib: &str, versions: &[&str]) -> Vec<String> {
    let mut out = vec![format!("{lib}.so")];

    out.extend(versions.iter().map(|v| format!("{lib}.so.{v}")));

    if let Ok(p) = std::env::var("CUDA_PATH") {
        out.push(format!("{p}/lib64/{lib}.so"));
    }

    out.push(format!("/usr/local/cuda/lib64/{lib}.so"));
    out
}

fn options(contract: bool, extra: &[String], on: &[&str], off: &[&str]) -> Vec<CString> {
    let mut v: Vec<String> = extra.to_vec();

    v.extend((if contract { on } else { off }).iter().map(|s| s.to_string()));

    if contract {
        v.push("-DVK_CONTRACT".to_string());
    }

    v.into_iter().filter_map(|s| CString::new(s).ok()).collect()
}

type RtcCreate = unsafe extern "C" fn(
    *mut *mut c_void,
    *const c_char,
    *const c_char,
    c_int,
    *const *const c_char,
    *const *const c_char,
) -> i32;
type RtcCompile = unsafe extern "C" fn(*mut c_void, c_int, *const *const c_char) -> i32;
type RtcSize = unsafe extern "C" fn(*mut c_void, *mut usize) -> i32;
type RtcGet = unsafe extern "C" fn(*mut c_void, *mut c_char) -> i32;
type RtcDestroy = unsafe extern "C" fn(*mut *mut c_void) -> i32;

// hiprtc and NVRTC have the same shape: create, compile, read the log, read the code
unsafe fn rtc_compile(
    lib: *mut c_void,
    prefix: &str,
    code_size: &str,
    code_get: &str,
    opts: &[CString],
) -> Result<Vec<u8>, String> {
    let create: RtcCreate = sym(lib, &format!("{prefix}CreateProgram"))?;
    let compile: RtcCompile = sym(lib, &format!("{prefix}CompileProgram"))?;
    let log_size: RtcSize = sym(lib, &format!("{prefix}GetProgramLogSize"))?;
    let log_get: RtcGet = sym(lib, &format!("{prefix}GetProgramLog"))?;
    let size: RtcSize = sym(lib, code_size)?;
    let get: RtcGet = sym(lib, code_get)?;
    let destroy: RtcDestroy = sym(lib, &format!("{prefix}DestroyProgram"))?;
    let src = CString::new(SOURCE).map_err(|_| "gpu.cu holds a NUL".to_string())?;
    let name = CString::new("vibe-kernel.cu").unwrap_or_default();
    let mut prog: *mut c_void = ptr::null_mut();

    if create(&mut prog, src.as_ptr(), name.as_ptr(), 0, ptr::null(), ptr::null()) != 0 {
        return Err(format!("{prefix}CreateProgram failed"));
    }

    let ptrs: Vec<*const c_char> = opts.iter().map(|o| o.as_ptr()).collect();
    let status = compile(prog, ptrs.len() as c_int, ptrs.as_ptr());
    let mut n = 0usize;

    log_size(prog, &mut n);

    let mut log = vec![0u8; n.max(1)];

    log_get(prog, log.as_mut_ptr() as *mut c_char);

    if status != 0 {
        destroy(&mut prog);

        return Err(format!(
            "{prefix}CompileProgram failed ({status}): {}",
            String::from_utf8_lossy(&log).trim_end_matches('\0')
        ));
    }

    let mut m = 0usize;

    size(prog, &mut m);

    let mut code = vec![0u8; m.max(1)];

    get(prog, code.as_mut_ptr() as *mut c_char);
    destroy(&mut prog);
    Ok(code)
}

unsafe fn load_hip(contract: bool, arch: &str) -> Result<Gpu, String> {
    let hip = open(&rocm_names("libamdhip64", "6"))?;
    let rtc = open(&rocm_names("libhiprtc", "6"))?;
    let init: unsafe extern "C" fn(u32) -> i32 = sym(hip, "hipInit")?;
    let count: unsafe extern "C" fn(*mut c_int) -> i32 = sym(hip, "hipGetDeviceCount")?;
    let set: unsafe extern "C" fn(c_int) -> i32 = sym(hip, "hipSetDevice")?;
    let dev_name: unsafe extern "C" fn(*mut c_char, c_int, c_int) -> i32 = sym(hip, "hipDeviceGetName")?;
    let load: unsafe extern "C" fn(*mut *mut c_void, *const c_void) -> i32 = sym(hip, "hipModuleLoadData")?;
    let get: unsafe extern "C" fn(*mut *mut c_void, *mut c_void, *const c_char) -> i32 =
        sym(hip, "hipModuleGetFunction")?;
    let drv = Driver {
        malloc: sym(hip, "hipMalloc")?,
        free: sym(hip, "hipFree")?,
        htod: sym(hip, "hipMemcpyHtoD")?,
        dtoh: sym(hip, "hipMemcpyDtoH")?,
        dtod: sym(hip, "hipMemcpyDtoD")?,
        launch: sym(hip, "hipModuleLaunchKernel")?,
        sync: sym(hip, "hipDeviceSynchronize")?,
        hip_err: Some(sym(hip, "hipGetErrorString")?),
        cu_err: None,
        cu_ctx: ptr::null_mut(),
        cu_set: None,
    };
    let mut g = Gpu {
        kind: Kind::Hip,
        contract,
        drv: Some(drv),
        fns: HashMap::new(),
        info: String::new(),
        scratch: Mutex::new(Vec::new()),
    };

    g.err(init(0), "hipInit")?;

    let mut n: c_int = 0;

    g.err(count(&mut n), "hipGetDeviceCount")?;

    if n < 1 {
        return Err("no HIP device".to_string());
    }

    g.err(set(0), "hipSetDevice")?;

    let mut name = [0 as c_char; 256];

    dev_name(name.as_mut_ptr(), 255, 0);

    let opts = options(
        contract,
        &[format!("--gpu-architecture={arch}"), "-O3".to_string()],
        &["-ffp-contract=fast"],
        &["-ffp-contract=off"],
    );
    let code = rtc_compile(rtc, "hiprtc", "hiprtcGetCodeSize", "hiprtcGetCode", &opts)?;
    let mut module: *mut c_void = ptr::null_mut();

    g.err(load(&mut module, code.as_ptr() as *const c_void), "hipModuleLoadData")?;

    for k in KERNELS {
        let c = CString::new(k).unwrap_or_default();
        let mut f: *mut c_void = ptr::null_mut();

        g.err(get(&mut f, module, c.as_ptr()), &format!("hipModuleGetFunction {k}"))?;
        g.fns.insert(k, f);
    }

    g.info = format!(
        "hip: {} ({arch}), {n} device(s), hiprtc {}",
        CStr::from_ptr(name.as_ptr()).to_string_lossy(),
        if contract { "-ffp-contract=fast (the FMA control)" } else { "-ffp-contract=off" }
    );

    Ok(g)
}

unsafe fn load_cuda(contract: bool, arch: &str) -> Result<Gpu, String> {
    let cu = open(&cuda_names("libcuda", &["1"]))?;
    let rtc = open(&cuda_names("libnvrtc", &["13", "12", "11.2"]))?;
    let init: unsafe extern "C" fn(u32) -> i32 = sym(cu, "cuInit")?;
    let dev_get: unsafe extern "C" fn(*mut c_int, c_int) -> i32 = sym(cu, "cuDeviceGet")?;
    let attr: unsafe extern "C" fn(*mut c_int, c_int, c_int) -> i32 = sym(cu, "cuDeviceGetAttribute")?;
    let dev_name: unsafe extern "C" fn(*mut c_char, c_int, c_int) -> i32 = sym(cu, "cuDeviceGetName")?;
    let retain: unsafe extern "C" fn(*mut *mut c_void, c_int) -> i32 = sym(cu, "cuDevicePrimaryCtxRetain")?;
    let set: unsafe extern "C" fn(*mut c_void) -> i32 = sym(cu, "cuCtxSetCurrent")?;
    let load: unsafe extern "C" fn(*mut *mut c_void, *const c_void) -> i32 = sym(cu, "cuModuleLoadData")?;
    let get: unsafe extern "C" fn(*mut *mut c_void, *mut c_void, *const c_char) -> i32 =
        sym(cu, "cuModuleGetFunction")?;
    let mut g = Gpu {
        kind: Kind::Cuda,
        contract,
        drv: None,
        fns: HashMap::new(),
        info: String::new(),
        scratch: Mutex::new(Vec::new()),
    };
    let err: CuErr = sym(cu, "cuGetErrorString")?;
    let fail = |code: i32, what: &str| -> Result<(), String> {
        if code == 0 {
            Ok(())
        } else {
            let mut p: *const c_char = ptr::null();

            err(code, &mut p);

            Err(format!(
                "{what}: error {code} {}",
                if p.is_null() { String::new() } else { CStr::from_ptr(p).to_string_lossy().into_owned() }
            ))
        }
    };

    fail(init(0), "cuInit")?;

    let mut dev: c_int = 0;

    fail(dev_get(&mut dev, 0), "cuDeviceGet")?;

    let mut ctx: *mut c_void = ptr::null_mut();

    fail(retain(&mut ctx, dev), "cuDevicePrimaryCtxRetain")?;
    fail(set(ctx), "cuCtxSetCurrent")?;

    // CU_DEVICE_ATTRIBUTE_COMPUTE_CAPABILITY_MAJOR 75, MINOR 76
    let (mut major, mut minor): (c_int, c_int) = (0, 0);

    fail(attr(&mut major, 75, dev), "cuDeviceGetAttribute")?;
    fail(attr(&mut minor, 76, dev), "cuDeviceGetAttribute")?;

    let target = if arch.is_empty() { format!("compute_{major}{minor}") } else { arch.to_string() };
    let mut name = [0 as c_char; 256];

    dev_name(name.as_mut_ptr(), 255, dev);

    let opts = options(
        contract,
        &[format!("--gpu-architecture={target}"), "--std=c++17".to_string()],
        &["--fmad=true"],
        &["--fmad=false"],
    );
    let ptx = rtc_compile(rtc, "nvrtc", "nvrtcGetPTXSize", "nvrtcGetPTX", &opts)?;
    let mut module: *mut c_void = ptr::null_mut();

    fail(load(&mut module, ptx.as_ptr() as *const c_void), "cuModuleLoadData")?;

    for k in KERNELS {
        let c = CString::new(k).unwrap_or_default();
        let mut f: *mut c_void = ptr::null_mut();

        fail(get(&mut f, module, c.as_ptr()), &format!("cuModuleGetFunction {k}"))?;
        g.fns.insert(k, f);
    }

    // the _v2 entry points: the unversioned cuMemAlloc and friends are the 32-bit legacy ABI
    g.drv = Some(Driver {
        malloc: sym(cu, "cuMemAlloc_v2")?,
        free: sym(cu, "cuMemFree_v2")?,
        htod: sym(cu, "cuMemcpyHtoD_v2")?,
        dtoh: sym(cu, "cuMemcpyDtoH_v2")?,
        dtod: sym(cu, "cuMemcpyDtoD_v2")?,
        launch: sym(cu, "cuLaunchKernel")?,
        sync: sym(cu, "cuCtxSynchronize")?,
        hip_err: None,
        cu_err: Some(err),
        cu_ctx: ctx,
        cu_set: Some(set),
    });
    g.info = format!(
        "cuda: {} (sm_{major}{minor}, {target}), NVRTC {}",
        CStr::from_ptr(name.as_ptr()).to_string_lossy(),
        if contract { "--fmad=true (the FMA control)" } else { "--fmad=false" }
    );

    Ok(g)
}

// the emulator: gpu.cu compiled with -DVK_EMU by the host compiler into a shared library (code/kernel/gpu.ts builds
// it), each kernel exported as vk_x_emu(const Args*)
unsafe fn load_emu(contract: bool, library: &str) -> Result<Gpu, String> {
    let lib = open(&[library.to_string()])?;
    let mut g = Gpu {
        kind: Kind::Emu,
        contract,
        drv: None,
        fns: HashMap::new(),
        info: format!("emu: gpu.cu on one CPU thread, {library}"),
        scratch: Mutex::new(Vec::new()),
    };

    for k in KERNELS {
        let f: *mut c_void = sym(lib, &format!("{k}_emu"))?;

        g.fns.insert(k, f);
    }

    Ok(g)
}

// ---- argument reading ----

const DEV_TAG: u64 = 0x7669_6265_6465_7631;
const OP_TAG: u64 = 0x7669_6265_6f70_7631;

#[repr(C)]
struct DevBuf {
    tag: u64,
    ptr: u64,
    bytes: usize,
    live: bool,
}

unsafe extern "C" fn buf_free(_env: napi_env, data: *mut c_void, _hint: *mut c_void) {
    let b = Box::from_raw(data as *mut DevBuf);

    if b.live {
        if let Some(g) = gpu() {
            g.free(b.ptr, b.bytes);
        }
    }
}

unsafe fn external<T>(env: napi_env, v: napi_value, tag: u64, what: &str) -> R<*mut T> {
    let mut data: *mut c_void = ptr::null_mut();

    if napi_get_value_external(env, v, &mut data) != NAPI_OK || data.is_null() || *(data as *const u64) != tag {
        return Err(throw(env, &format!("{what} is not a device buffer of this kernel")));
    }

    Ok(data as *mut T)
}

unsafe fn buf(env: napi_env, v: napi_value, what: &str) -> R<&'static mut DevBuf> {
    let b = &mut *external::<DevBuf>(env, v, DEV_TAG, what)?;

    if !b.live {
        return Err(throw(env, &format!("{what} was freed")));
    }

    Ok(b)
}

// a device buffer read as `size`-byte elements: (pointer, count)
unsafe fn dev(env: napi_env, v: napi_value, size: usize, what: &str) -> R<(u64, usize)> {
    let b = buf(env, v, what)?;

    check(b.bytes % size == 0, env, what)?;
    Ok((b.ptr, b.bytes / size))
}

unsafe fn f64d(env: napi_env, v: napi_value, what: &str) -> R<(u64, usize)> {
    dev(env, v, 8, what)
}

unsafe fn i32d(env: napi_env, v: napi_value, what: &str) -> R<(u64, usize)> {
    dev(env, v, 4, what)
}

unsafe fn i8d(env: napi_env, v: napi_value, what: &str) -> R<(u64, usize)> {
    dev(env, v, 1, what)
}

// any typed array's bytes: (data, byte length)
unsafe fn host_bytes(env: napi_env, v: napi_value, what: &str) -> R<(*mut u8, usize)> {
    let mut is = false;
    let mut kind = -1;
    let mut len = 0usize;
    let mut data: *mut c_void = ptr::null_mut();

    if napi_is_typedarray(env, v, &mut is) != NAPI_OK
        || !is
        || napi_get_typedarray_info(env, v, &mut kind, &mut len, &mut data, ptr::null_mut(), ptr::null_mut()) != NAPI_OK
    {
        return Err(throw(env, &format!("{what} is not a typed array")));
    }

    let size = match kind {
        0..=2 => 1,
        3 | 4 => 2,
        5..=7 => 4,
        8..=10 => 8,
        _ => return Err(throw(env, &format!("{what} has an unknown array type"))),
    };

    Ok((data as *mut u8, len * size))
}

unsafe fn the_gpu(env: napi_env) -> R<&'static Gpu> {
    gpu().ok_or_else(|| throw(env, "the GPU is not initialized (gpuInit)"))
}

fn lift<T>(env: napi_env, r: Result<T, String>) -> R<T> {
    r.map_err(|e| unsafe { throw(env, &e) })
}

unsafe fn text(env: napi_env, v: napi_value, what: &str) -> R<String> {
    let mut n = 0usize;

    if napi_get_value_string_utf8(env, v, ptr::null_mut(), 0, &mut n) != NAPI_OK {
        return Err(throw(env, &format!("{what} is not a string")));
    }

    let mut b = vec![0u8; n + 1];
    let mut m = 0usize;

    napi_get_value_string_utf8(env, v, b.as_mut_ptr() as *mut c_char, n + 1, &mut m);
    b.truncate(m);
    Ok(String::from_utf8_lossy(&b).into_owned())
}

unsafe fn string(env: napi_env, s: &str) -> napi_value {
    let mut out = ptr::null_mut();

    napi_create_string_utf8(env, s.as_ptr() as *const c_char, s.len(), &mut out);
    out
}

unsafe fn wrap_buf(env: napi_env, b: DevBuf) -> R<napi_value> {
    let mut out = ptr::null_mut();

    if napi_create_external(env, Box::into_raw(Box::new(b)) as *mut c_void, Some(buf_free), ptr::null_mut(), &mut out)
        != NAPI_OK
    {
        return Err(throw(env, "could not wrap a device buffer"));
    }

    Ok(out)
}

// ---- memory ----

// gpuInit(kind: 0 hip, 1 cuda, 2 emu, contract: 0 or 1, arg: the AMD architecture, the NVIDIA target (empty: the
// device's own), or the emulator library) -> a line describing the device. Once per process
unsafe extern "C" fn js_init(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<napi_value> {
        let a = args::<3>(env, info)?;
        let kind = int(env, a[0], "kind")?;
        let contract = int(env, a[1], "contract")? != 0;
        let arg = text(env, a[2], "arg")?;
        let mut slot = GPU.lock().unwrap_or_else(|e| e.into_inner());
        let want = match kind {
            0 => Kind::Hip,
            1 => Kind::Cuda,
            2 => Kind::Emu,
            _ => return Err(throw(env, "gpuInit kind is 0 (hip), 1 (cuda) or 2 (emu)")),
        };

        if let Some(g) = *slot {
            if g.kind != want || g.contract != contract {
                return Err(throw(
                    env,
                    &format!("the GPU is already initialized as {:?} (contract {}) in this process", g.kind, g.contract),
                ));
            }

            return Ok(string(env, &g.info));
        }

        let loaded = match want {
            #[cfg(feature = "hip")]
            Kind::Hip => load_hip(contract, &arg),
            #[cfg(feature = "cuda")]
            Kind::Cuda => load_cuda(contract, &arg),
            #[cfg(feature = "emu")]
            Kind::Emu => load_emu(contract, &arg),
            #[allow(unreachable_patterns)]
            k => Err(format!("this build has no {k:?} backend (build with --features {k:?})").to_lowercase()),
        };
        let g: &'static Gpu = Box::leak(Box::new(lift(env, loaded)?));

        *slot = Some(g);
        Ok(string(env, &g.info))
    })();

    r.unwrap_or(ptr::null_mut())
}

// gpuAlloc(bytes) -> a zeroed-or-uninitialized device buffer (its contents are written before any read)
unsafe extern "C" fn js_alloc(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<napi_value> {
        let [a] = args::<1>(env, info)?;
        let g = the_gpu(env)?;
        let bytes = num(env, a, "bytes")?;

        check(bytes >= 0.0 && bytes.fract() == 0.0 && bytes < 9.0e15, env, "gpuAlloc")?;

        let p = lift(env, g.alloc(bytes as usize))?;

        wrap_buf(env, DevBuf { tag: DEV_TAG, ptr: p, bytes: bytes as usize, live: true })
    })();

    r.unwrap_or(ptr::null_mut())
}

// gpuFree(buf): now, rather than when the external is collected
unsafe extern "C" fn js_free(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let [a] = args::<1>(env, info)?;
        let g = the_gpu(env)?;
        let b = buf(env, a, "buffer")?;

        g.free(b.ptr, b.bytes);
        b.live = false;
        Ok(())
    })();

    done(env, r)
}

// gpuUpload(buf, typed array): the array's bytes into the buffer, sizes equal
unsafe extern "C" fn js_upload(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let [b, h] = args::<2>(env, info)?;
        let g = the_gpu(env)?;
        let b = buf(env, b, "buffer")?;
        let (data, bytes) = host_bytes(env, h, "array")?;

        check(bytes == b.bytes, env, "gpuUpload size")?;
        lift(env, g.htod(b.ptr, data, bytes))
    })();

    done(env, r)
}

// gpuDownload(buf, typed array): the buffer's bytes into the array, sizes equal
unsafe extern "C" fn js_download(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let [b, h] = args::<2>(env, info)?;
        let g = the_gpu(env)?;
        let b = buf(env, b, "buffer")?;
        let (data, bytes) = host_bytes(env, h, "array")?;

        check(bytes == b.bytes, env, "gpuDownload size")?;
        lift(env, g.dtoh(data, b.ptr, bytes))
    })();

    done(env, r)
}

// gpuCopy(dst, src): device to device, sizes equal
unsafe extern "C" fn js_copy(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let [d, s] = args::<2>(env, info)?;
        let g = the_gpu(env)?;
        let d = buf(env, d, "dst")?;
        let s = buf(env, s, "src")?;

        check(d.bytes == s.bytes, env, "gpuCopy size")?;
        lift(env, g.dtod(d.ptr, s.ptr, d.bytes))
    })();

    done(env, r)
}

// ---- the pair operator ----

#[repr(C)]
struct GpuOp {
    tag: u64,
    count: usize,
    // the device tables: plus_rep, plus_g, minus_rep, minus_g, src, sgn, off, row, col, val, off_t, row_t, col_t,
    // val_t, half_re, half_im, each (pointer, bytes)
    t: [(u64, usize); 16],
}

unsafe extern "C" fn op_free(_env: napi_env, data: *mut c_void, _hint: *mut c_void) {
    let op = Box::from_raw(data as *mut GpuOp);

    if let Some(g) = gpu() {
        for (p, b) in op.t {
            if p != 0 {
                g.free(p, b);
            }
        }
    }
}

// gpuPairOp(the sixteen tables, as pairOp): read and checked by node.rs's reader, then uploaded once
unsafe extern "C" fn js_pair_op(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<napi_value> {
        let a = args::<16>(env, info)?;
        let g = the_gpu(env)?;
        let owned = node::read_pair_op(env, &a)?;
        let op = &owned.op;
        let n_val = *op.off.add(24) as usize;
        let n_val_t = *op.off_t.add(24) as usize;
        let reps = op.count * 24 * 4;
        let els = op.elements * 256;
        let parts: [(*const u8, usize); 16] = [
            (op.plus_rep as *const u8, reps),
            (op.plus_g as *const u8, reps),
            (op.minus_rep as *const u8, reps),
            (op.minus_g as *const u8, reps),
            (op.src as *const u8, els * 2),
            (op.sgn as *const u8, els),
            (op.off as *const u8, 25 * 4),
            (op.row as *const u8, n_val),
            (op.col as *const u8, n_val),
            (op.val as *const u8, n_val * 8),
            (op.off_t as *const u8, 25 * 4),
            (op.row_t as *const u8, n_val_t),
            (op.col_t as *const u8, n_val_t),
            (op.val_t as *const u8, n_val_t * 8),
            (op.half_re.as_ptr() as *const u8, 24 * 8),
            (op.half_im.as_ptr() as *const u8, 24 * 8),
        ];
        let mut out = Box::new(GpuOp { tag: OP_TAG, count: op.count, t: [(0, 0); 16] });

        for (k, (p, bytes)) in parts.iter().enumerate() {
            let d = lift(env, g.alloc(*bytes))?;

            out.t[k] = (d, *bytes);
            lift(env, g.htod(d, *p, *bytes))?;
        }

        let mut v = ptr::null_mut();

        if napi_create_external(env, Box::into_raw(out) as *mut c_void, Some(op_free), ptr::null_mut(), &mut v) != NAPI_OK {
            return Err(throw(env, "could not wrap the pair operator"));
        }

        Ok(v)
    })();

    r.unwrap_or(ptr::null_mut())
}

// ---- the kernels' arguments, field for field gpu.cu's structs (every field 8 bytes) ----

#[repr(C)]
struct VkConv {
    rep: u64,
    gel: u64,
    src: u64,
    sgn: u64,
    off: u64,
    row: u64,
    col: u64,
    val: u64,
    half_re: u64,
    half_im: u64,
    sg: f64,
    sre: u64,
    sim: u64,
    src_off: i64,
    src_stride: i64,
    t: i64,
    ore: u64,
    oim: u64,
    member: i64,
    count: i64,
}

#[repr(C)]
struct VkBeat {
    re: u64,
    im: u64,
    t: [u64; 10],
    beta: u64,
    alr: f64,
    ali: f64,
    main_off: i64,
    n: i64,
}

#[repr(C)]
struct VkCross {
    re: u64,
    im: u64,
    t: [u64; 6],
    cross: u64,
    own: i64,
    n: i64,
}

#[repr(C)]
struct VkBlockAdd {
    ore: u64,
    oim: u64,
    fr: u64,
    fi: u64,
    off: i64,
    n: i64,
}

#[repr(C)]
struct VkBlockInner {
    ar: u64,
    ai: u64,
    br: u64,
    bi: u64,
    pr: u64,
    pi: u64,
    n: i64,
}

#[repr(C)]
struct VkAxpy {
    yr: u64,
    yi: u64,
    xr: u64,
    xi: u64,
    fr: f64,
    fi: f64,
    n: i64,
}

#[repr(C)]
struct VkScale {
    re: u64,
    im: u64,
    f: f64,
    n: i64,
}

#[repr(C)]
struct VkSeaPhase {
    re: u64,
    im: u64,
    phase: u64,
    docks: i64,
}

#[repr(C)]
struct VkSeaSide {
    re: u64,
    im: u64,
    e: u64,
    xr: u64,
    xi: u64,
    docks: i64,
}

#[repr(C)]
struct VkSeaCore {
    e: u64,
    lr: u64,
    li: u64,
    cr: u64,
    ci: u64,
    docks: i64,
}

#[repr(C)]
struct VkSeaG {
    e: u64,
    rr: u64,
    ri: u64,
    cr: u64,
    ci: u64,
    alpha: u64,
    beta: u64,
    gr: u64,
    gi: u64,
    docks: i64,
}

#[repr(C)]
struct VkSeaUpdate {
    re: u64,
    im: u64,
    e: u64,
    lr: u64,
    li: u64,
    gr: u64,
    gi: u64,
    alpha: u64,
    docks: i64,
}

#[repr(C)]
struct VkSeaStream {
    sr: u64,
    si: u64,
    or: u64,
    oi: u64,
    mv: u64,
    opp: u64,
    docks: i64,
}

#[repr(C)]
struct VkPhaseSum {
    re: u64,
    im: u64,
    c: u64,
    s: u64,
    mr: u64,
    mi: u64,
    docks: i64,
    width: i64,
}

#[repr(C)]
struct VkOneBody {
    re: u64,
    im: u64,
    mom: u64,
    ar: u64,
    ai: u64,
    n: i64,
    f: i64,
    i: i64,
    rows: i64,
}

#[repr(C)]
struct VkBand {
    re: u64,
    im: u64,
    mom: u64,
    pr: u64,
    pi: u64,
    part: u64,
    n: i64,
    f: i64,
    rows: i64,
}

#[repr(C)]
struct VkGather {
    re: u64,
    im: u64,
    row_of: u64,
    perm_of: u64,
    psign: u64,
    fb_of: u64,
    cr: u64,
    ci: u64,
    block: i64,
    nperm: i64,
    tuples: i64,
    o0: i64,
    nb: i64,
}

#[repr(C)]
struct VkAxis {
    cr: u64,
    ci: u64,
    cog: u64,
    gos: u64,
    goc: u64,
    cos: u64,
    sin: u64,
    gr: u64,
    gi: u64,
    sr: u64,
    si: u64,
    k_sites: f64,
    k_classes: f64,
    l: i64,
    n: i64,
    g: i64,
    tuples: i64,
    axes: i64,
    axis: i64,
    dir: i64,
    nb: i64,
    slots: i64,
}

#[repr(C)]
struct VkPhase {
    cr: u64,
    ci: u64,
    pattern: u64,
    cos: u64,
    sin: u64,
    skip: u64,
    tuples: i64,
    o0: i64,
    nb: i64,
}

#[repr(C)]
struct VkScatter {
    re: u64,
    im: u64,
    cr: u64,
    ci: u64,
    psign: u64,
    write_off: u64,
    write_c: u64,
    write_tau: u64,
    t_of: u64,
    block: i64,
    nperm: i64,
    rows: i64,
    tuples: i64,
    o0: i64,
    nb: i64,
}

// ---- the pair engines ----

// gpuConv(op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger)
unsafe extern "C" fn js_conv(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<10>(env, info)?;
        let g = the_gpu(env)?;
        let op = &*external::<GpuOp>(env, a[0], OP_TAG, "op")?;
        let (sr, n_sr) = f64d(env, a[1], "srcRe")?;
        let (si, n_si) = f64d(env, a[2], "srcIm")?;
        let src_off = int(env, a[3], "srcOff")?;
        let src_stride = int(env, a[4], "srcStride")?;
        let t = int(env, a[5], "t")?;
        let (or, n_or) = f64d(env, a[6], "outRe")?;
        let (oi, n_oi) = f64d(env, a[7], "outIm")?;
        let member = int(env, a[8], "member")?;
        let dagger = int(env, a[9], "dagger")? != 0;

        check(
            src_off >= 0 && src_stride >= 64 && (0..4).contains(&t) && (member == 1 || member == 2),
            env,
            "conv",
        )?;

        let need = if op.count == 0 { 0 } else { (op.count - 1) * src_stride as usize + src_off as usize + 64 };

        check(n_sr == n_si && n_or == n_oi && n_sr >= need && n_or >= op.count * 64, env, "conv")?;
        check(sr != or && si != oi && sr != oi && si != or, env, "conv aliasing")?;

        // prim.rs conv's choice of tables: the plus neighbours unless (member 1) xor dagger
        let use_plus = (member == 1) == dagger;
        let (rep, gel) = if use_plus { (op.t[0].0, op.t[1].0) } else { (op.t[2].0, op.t[3].0) };
        let q = if dagger { 10 } else { 6 };
        let k = VkConv {
            rep,
            gel,
            src: op.t[4].0,
            sgn: op.t[5].0,
            off: op.t[q].0,
            row: op.t[q + 1].0,
            col: op.t[q + 2].0,
            val: op.t[q + 3].0,
            half_re: op.t[14].0,
            half_im: op.t[15].0,
            sg: if dagger { -1.0 } else { 1.0 },
            sre: sr,
            sim: si,
            src_off: src_off as i64,
            src_stride: src_stride as i64,
            t: t as i64,
            ore: or,
            oim: oi,
            member: member as i64,
            count: op.count as i64,
        };

        lift(env, g.launch("vk_conv", (op.count * 64) as u64, &k))
    })();

    done(env, r)
}

// gpuPairBeat(re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta, alr, ali, mainOff)
unsafe extern "C" fn js_pair_beat(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<16>(env, info)?;
        let g = the_gpu(env)?;
        let (re, n_re) = f64d(env, a[0], "re")?;
        let (im, n_im) = f64d(env, a[1], "im")?;
        let (beta, n_beta) = f64d(env, a[12], "beta")?;
        let n = n_beta / 2;
        let mut t = [0u64; 10];

        for (k, slot) in t.iter_mut().enumerate() {
            let (p, len) = f64d(env, a[2 + k], "pairBeat field")?;

            check(len >= n * 64, env, "pairBeat")?;
            *slot = p;
        }

        let alr = num(env, a[13], "alr")?;
        let ali = num(env, a[14], "ali")?;
        let main_off = int(env, a[15], "mainOff")?;

        check(n_re == n * 256 && n_im == n_re && (main_off == 0 || main_off == 192), env, "pairBeat")?;

        let k = VkBeat { re, im, t, beta, alr, ali, main_off: main_off as i64, n: n as i64 };

        lift(env, g.launch("vk_pair_beat", (n * 64) as u64, &k))
    })();

    done(env, r)
}

// gpuCrossApply(re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross, own)
unsafe extern "C" fn js_cross_apply(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<10>(env, info)?;
        let g = the_gpu(env)?;
        let (re, n_re) = f64d(env, a[0], "re")?;
        let (im, n_im) = f64d(env, a[1], "im")?;
        let (cross, n_cross) = f64d(env, a[8], "cross")?;
        let n = n_cross / 2;
        let mut t = [0u64; 6];

        for (k, slot) in t.iter_mut().enumerate() {
            let (p, len) = f64d(env, a[2 + k], "crossApply field")?;

            check(len >= n * 64, env, "crossApply")?;
            *slot = p;
        }

        let own = int(env, a[9], "own")?;

        check(n_re == n * 256 && n_im == n_re && (own == 64 || own == 128), env, "crossApply")?;

        let k = VkCross { re, im, t, cross, own: own as i64, n: n as i64 };

        lift(env, g.launch("vk_cross_apply", (n * 64) as u64, &k))
    })();

    done(env, r)
}

// gpuBlockAdd(outRe, outIm, fr, fi, off)
unsafe extern "C" fn js_block_add(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<5>(env, info)?;
        let g = the_gpu(env)?;
        let (or, n_or) = f64d(env, a[0], "outRe")?;
        let (oi, n_oi) = f64d(env, a[1], "outIm")?;
        let (fr, n_fr) = f64d(env, a[2], "fr")?;
        let (fi, n_fi) = f64d(env, a[3], "fi")?;
        let off = int(env, a[4], "off")?;
        let n = n_or / 256;

        check(
            n_oi == n_or && n_or % 256 == 0 && n_fr >= n * 64 && n_fi >= n * 64 && [0, 64, 128, 192].contains(&off),
            env,
            "blockAdd",
        )?;

        let k = VkBlockAdd { ore: or, oim: oi, fr, fi, off: off as i64, n: n as i64 };

        lift(env, g.launch("vk_block_add", (n * 64) as u64, &k))
    })();

    done(env, r)
}

// gpuBlockInner(aRe, aIm, bRe, bIm, partRe, partIm)
unsafe extern "C" fn js_block_inner(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<6>(env, info)?;
        let g = the_gpu(env)?;
        let (ar, n1) = f64d(env, a[0], "aRe")?;
        let (ai, n2) = f64d(env, a[1], "aIm")?;
        let (br, n3) = f64d(env, a[2], "bRe")?;
        let (bi, n4) = f64d(env, a[3], "bIm")?;
        let (pr, n_pr) = f64d(env, a[4], "partRe")?;
        let (pi, n_pi) = f64d(env, a[5], "partIm")?;

        check(n_pi == n_pr && n1 == n_pr * 256 && n2 == n1 && n3 == n1 && n4 == n1, env, "blockInner")?;

        let k = VkBlockInner { ar, ai, br, bi, pr, pi, n: n_pr as i64 };

        lift(env, g.launch("vk_block_inner", n_pr as u64, &k))
    })();

    done(env, r)
}

// gpuAxpy(yRe, yIm, xRe, xIm, fr, fi)
unsafe extern "C" fn js_axpy(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<6>(env, info)?;
        let g = the_gpu(env)?;
        let (yr, n1) = f64d(env, a[0], "yRe")?;
        let (yi, n2) = f64d(env, a[1], "yIm")?;
        let (xr, n3) = f64d(env, a[2], "xRe")?;
        let (xi, n4) = f64d(env, a[3], "xIm")?;
        let fr = num(env, a[4], "fr")?;
        let fi = num(env, a[5], "fi")?;

        check(n2 == n1 && n3 >= n1 && n4 >= n1, env, "axpy")?;

        let k = VkAxpy { yr, yi, xr, xi, fr, fi, n: n1 as i64 };

        lift(env, g.launch("vk_axpy", n1 as u64, &k))
    })();

    done(env, r)
}

// gpuScale(re, im, f)
unsafe extern "C" fn js_scale(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<3>(env, info)?;
        let g = the_gpu(env)?;
        let (re, n1) = f64d(env, a[0], "re")?;
        let (im, n2) = f64d(env, a[1], "im")?;
        let f = num(env, a[2], "f")?;

        check(n2 == n1, env, "scale")?;

        let k = VkScale { re, im, f, n: n1 as i64 };

        lift(env, g.launch("vk_scale", n1 as u64, &k))
    })();

    done(env, r)
}

// ---- register-sea ----

// gpuSeaPiece(re, im, E, alpha, beta, phase or null): the five passes of gpu.cu, each over every dock, in order
unsafe extern "C" fn js_sea_piece(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<6>(env, info)?;
        let g = the_gpu(env)?;
        let (re, n1) = f64d(env, a[0], "re")?;
        let (im, n2) = f64d(env, a[1], "im")?;
        let (e, n_e) = f64d(env, a[2], "E")?;
        let (alpha, n_a) = f64d(env, a[3], "alpha")?;
        let (beta, n_b) = f64d(env, a[4], "beta")?;
        let mut kind = -1;

        napi_typeof(env, a[5], &mut kind);

        let (phase, n_p) = if kind == VT_NULL || kind == VT_UNDEFINED { (0u64, n_a) } else { f64d(env, a[5], "phase")? };
        let docks = n_a / 2;

        check(
            n2 == n1 && n1 == docks * prim::FULL && n_e == prim::MODES * prim::REG && n_b == n_a && n_p == n_a,
            env,
            "seaPiece",
        )?;

        let side = docks * prim::REG * prim::MODES;
        let bytes = side * 8;
        let lr = lift(env, g.scratch(0, bytes))?;
        let li = lift(env, g.scratch(1, bytes))?;
        let rr = lift(env, g.scratch(2, bytes))?;
        let ri = lift(env, g.scratch(3, bytes))?;
        let cr = lift(env, g.scratch(4, docks * prim::REG * prim::REG * 8))?;
        let ci = lift(env, g.scratch(5, docks * prim::REG * prim::REG * 8))?;
        let gr = lift(env, g.scratch(6, bytes))?;
        let gi = lift(env, g.scratch(7, bytes))?;
        let d = docks as i64;

        if phase != 0 {
            lift(env, g.launch("vk_sea_phase", (docks * prim::FULL) as u64, &VkSeaPhase { re, im, phase, docks: d }))?;
        }

        lift(env, g.launch("vk_sea_left", side as u64, &VkSeaSide { re, im, e, xr: lr, xi: li, docks: d }))?;
        lift(env, g.launch("vk_sea_right", side as u64, &VkSeaSide { re, im, e, xr: rr, xi: ri, docks: d }))?;
        lift(
            env,
            g.launch("vk_sea_core", (docks * prim::REG * prim::REG) as u64, &VkSeaCore { e, lr, li, cr, ci, docks: d }),
        )?;
        lift(
            env,
            g.launch("vk_sea_g", side as u64, &VkSeaG { e, rr, ri, cr, ci, alpha, beta, gr, gi, docks: d }),
        )?;
        lift(
            env,
            g.launch(
                "vk_sea_update",
                (docks * prim::FULL) as u64,
                &VkSeaUpdate { re, im, e, lr, li, gr, gi, alpha, docks: d },
            ),
        )
    })();

    done(env, r)
}

// gpuSeaStream(sRe, sIm, oRe, oIm, move, opposite): the index contents are checked by the caller on the host tables
unsafe extern "C" fn js_sea_stream(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<6>(env, info)?;
        let g = the_gpu(env)?;
        let (sr, n1) = f64d(env, a[0], "sRe")?;
        let (si, n2) = f64d(env, a[1], "sIm")?;
        let (or, n3) = f64d(env, a[2], "oRe")?;
        let (oi, n4) = f64d(env, a[3], "oIm")?;
        let (mv, n_mv) = i32d(env, a[4], "move")?;
        let (opp, n_opp) = i32d(env, a[5], "opposite")?;
        let docks = n1 / prim::FULL;

        check(
            n2 == n1 && n3 == n1 && n4 == n1 && n1 % prim::FULL == 0 && n_mv == docks * 576 && n_opp == 24,
            env,
            "seaStream",
        )?;
        check(sr != or && si != oi, env, "seaStream aliasing")?;

        let k = VkSeaStream { sr, si, or, oi, mv, opp, docks: docks as i64 };

        lift(env, g.launch("vk_sea_stream", (docks * prim::FULL) as u64, &k))
    })();

    done(env, r)
}

// gpuPhaseSum(re, im, c, s, width, mRe, mIm)
unsafe extern "C" fn js_phase_sum(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<7>(env, info)?;
        let g = the_gpu(env)?;
        let (re, n1) = f64d(env, a[0], "re")?;
        let (im, n2) = f64d(env, a[1], "im")?;
        let (c, n_c) = f64d(env, a[2], "c")?;
        let (s, n_s) = f64d(env, a[3], "s")?;
        let width = int(env, a[4], "width")?;
        let (mr, n_mr) = f64d(env, a[5], "mRe")?;
        let (mi, n_mi) = f64d(env, a[6], "mIm")?;

        check(
            width > 0 && n2 == n1 && n_s == n_c && n1 == n_c * width as usize && n_mr == width as usize && n_mi == n_mr,
            env,
            "phaseSum",
        )?;

        let k = VkPhaseSum { re, im, c, s, mr, mi, docks: n_c as i64, width: width as i64 };

        lift(env, g.launch("vk_phase_sum", width as u64, &k))
    })();

    done(env, r)
}

// ---- register-holes ----

fn hole_block(n: i32, f: i32) -> Option<usize> {
    if !(1..=8).contains(&n) || !(1..=prim::HOLE_FIBER_MAX as i32).contains(&f) {
        return None;
    }

    (f as usize).checked_pow(n as u32)
}

// the shape shared by holeOneBody and holeBand (the classes in mom are checked by the caller on the host table)
fn hole_rows(env: napi_env, n_re: usize, n_im: usize, n_mom: usize, n: i32, f: i32, n_a: usize, n_ai: usize) -> R<usize> {
    let block = match hole_block(n, f) {
        Some(b) => b,
        None => return Err(unsafe { throw(env, "hole rows arguments out of range") }),
    };
    let ff = (f * f) as usize;

    check(n_im == n_re && n_re % block == 0 && n_a == n_ai && n_a % ff == 0 && n_a > 0, env, "hole rows")?;

    let rows = n_re / block;

    check(n_mom == rows * n as usize, env, "hole rows")?;
    Ok(rows)
}

// gpuHoleOneBody(re, im, mom, n, f, aRe, aIm): member 0, then 1, ... (member i + 1 reads what member i wrote)
unsafe extern "C" fn js_hole_one_body(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<7>(env, info)?;
        let g = the_gpu(env)?;
        let (re, n_re) = f64d(env, a[0], "re")?;
        let (im, n_im) = f64d(env, a[1], "im")?;
        let (mom, n_mom) = i32d(env, a[2], "mom")?;
        let n = int(env, a[3], "n")?;
        let f = int(env, a[4], "f")?;
        let (ar, n_ar) = f64d(env, a[5], "aRe")?;
        let (ai, n_ai) = f64d(env, a[6], "aIm")?;
        let rows = hole_rows(env, n_re, n_im, n_mom, n, f, n_ar, n_ai)?;
        let lines = (f as usize).pow(n as u32 - 1);

        for i in 0..n {
            let k = VkOneBody { re, im, mom, ar, ai, n: n as i64, f: f as i64, i: i as i64, rows: rows as i64 };

            lift(env, g.launch("vk_hole_one_body", (rows * lines) as u64, &k))?;
        }

        Ok(())
    })();

    done(env, r)
}

// gpuHoleBand(re, im, mom, n, f, pRe, pIm, part)
unsafe extern "C" fn js_hole_band(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<8>(env, info)?;
        let g = the_gpu(env)?;
        let (re, n_re) = f64d(env, a[0], "re")?;
        let (im, n_im) = f64d(env, a[1], "im")?;
        let (mom, n_mom) = i32d(env, a[2], "mom")?;
        let n = int(env, a[3], "n")?;
        let f = int(env, a[4], "f")?;
        let (pr, n_pr) = f64d(env, a[5], "pRe")?;
        let (pi, n_pi) = f64d(env, a[6], "pIm")?;
        let (part, n_part) = f64d(env, a[7], "part")?;
        let rows = hole_rows(env, n_re, n_im, n_mom, n, f, n_pr, n_pi)?;

        check(n_part == rows * n as usize, env, "holeBand")?;

        let k = VkBand { re, im, mom, pr, pi, part, n: n as i64, f: f as i64, rows: rows as i64 };

        lift(env, g.launch("vk_hole_band", (rows * n as usize) as u64, &k))
    })();

    done(env, r)
}

// gpuHolePair(re, im, classOfGrid, gridOfSite, gridOfClass, cosL, sinL, rowOf, permOf, psign, fbOf, pattern, writeOff,
// writeC, writeTau, tOf, phaseC, phaseS, skip, kSites, kClasses): every size read off the buffers and checked against
// the others, as node.rs does; the index contents, the orbits' disjointness and the gather's coverage are checked by
// the caller on the host tables (code/kernel/holes holePairShape). A batch of orbits at a time: gather, the axes to
// sites, the phase, the axes back, scatter
unsafe extern "C" fn js_hole_pair(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<21>(env, info)?;
        let g = the_gpu(env)?;
        let (re, n_re) = f64d(env, a[0], "re")?;
        let (im, n_im) = f64d(env, a[1], "im")?;
        let (cog, gg) = i32d(env, a[2], "classOfGrid")?;
        let (gos, n) = i32d(env, a[3], "gridOfSite")?;
        let (goc, n_goc) = i32d(env, a[4], "gridOfClass")?;
        let (cos_l, l) = f64d(env, a[5], "cosL")?;
        let (sin_l, n_sin_l) = f64d(env, a[6], "sinL")?;
        let (row_of, tuples) = i32d(env, a[7], "rowOf")?;
        let (perm_of, n_perm_of) = i32d(env, a[8], "permOf")?;
        let (psign, nperm) = i32d(env, a[9], "psign")?;
        let (fb_of, n_fb_of) = i32d(env, a[10], "fbOf")?;
        let (pattern, orbits) = i32d(env, a[11], "pattern")?;
        let (write_off, n_write_off) = i32d(env, a[12], "writeOff")?;
        let (write_c, n_write_c) = i32d(env, a[13], "writeC")?;
        let (write_tau, n_write_tau) = i32d(env, a[14], "writeTau")?;
        let (t_of, n_t_of) = i32d(env, a[15], "tOf")?;
        let (ph_c, n_ph_c) = f64d(env, a[16], "phaseC")?;
        let (ph_s, n_ph_s) = f64d(env, a[17], "phaseS")?;
        let (skip, n_skip) = i8d(env, a[18], "skip")?;
        let k_sites = num(env, a[19], "kSites")?;
        let k_classes = num(env, a[20], "kClasses")?;

        check(
            l >= 1
                && n_sin_l == l
                && l.checked_pow(4) == Some(gg)
                && n >= 2
                && n_goc == n
                && n_perm_of == tuples
                && nperm >= 1
                && tuples >= 1,
            env,
            "holePair",
        )?;

        let mut axes = 0usize;
        let mut span = 1usize;

        while span < tuples {
            span = span.saturating_mul(n);
            axes += 1;
        }

        check(span == tuples && axes >= 1, env, "holePair axes")?;
        check(
            n_t_of % nperm == 0 && n_t_of > 0 && n_fb_of == orbits * nperm && n_write_off == orbits + 1,
            env,
            "holePair",
        )?;

        let rows = n_t_of / nperm;

        check(n_re % rows == 0 && n_im == n_re && n_re > 0, env, "holePair")?;

        let block = n_re / rows;

        check(
            n_ph_s == n_ph_c && n_skip == n_ph_c && n_ph_c % tuples == 0 && n_write_tau == n_write_c,
            env,
            "holePair",
        )?;

        if orbits == 0 {
            return Ok(());
        }

        // a batch of orbits: the columns within COLUMN_BUDGET, and the transform's threads, each with its own grid
        let col_bytes = tuples * 8;
        let nb = (COLUMN_BUDGET / (2 * col_bytes)).clamp(1, orbits);
        let lines = tuples / n;
        let slots = if g.emu() { 1 } else { (nb * lines).div_ceil(BLOCK as usize).max(1) * BLOCK as usize };
        let slots = slots.min(AXIS_SLOTS);
        let cr = lift(env, g.scratch(8, nb * col_bytes))?;
        let ci = lift(env, g.scratch(9, nb * col_bytes))?;
        let sgr = lift(env, g.scratch(10, gg * slots * 8))?;
        let sgi = lift(env, g.scratch(11, gg * slots * 8))?;
        let ssr = lift(env, g.scratch(12, l * slots * 8))?;
        let ssi = lift(env, g.scratch(13, l * slots * 8))?;
        let mut o0 = 0usize;

        while o0 < orbits {
            let b = nb.min(orbits - o0);
            let (bi, oi) = (b as i64, o0 as i64);

            lift(
                env,
                g.launch(
                    "vk_hp_gather",
                    (b * tuples) as u64,
                    &VkGather {
                        re,
                        im,
                        row_of,
                        perm_of,
                        psign,
                        fb_of,
                        cr,
                        ci,
                        block: block as i64,
                        nperm: nperm as i64,
                        tuples: tuples as i64,
                        o0: oi,
                        nb: bi,
                    },
                ),
            )?;

            let axis = |ax: usize, dir: i64| -> Result<(), String> {
                g.launch(
                    "vk_hp_axis",
                    slots as u64,
                    &VkAxis {
                        cr,
                        ci,
                        cog,
                        gos,
                        goc,
                        cos: cos_l,
                        sin: sin_l,
                        gr: sgr,
                        gi: sgi,
                        sr: ssr,
                        si: ssi,
                        k_sites,
                        k_classes,
                        l: l as i64,
                        n: n as i64,
                        g: gg as i64,
                        tuples: tuples as i64,
                        axes: axes as i64,
                        axis: ax as i64,
                        dir,
                        nb: bi,
                        slots: slots as i64,
                    },
                )
            };

            for ax in 0..axes {
                lift(env, axis(ax, 1))?;
            }

            lift(
                env,
                g.launch(
                    "vk_hp_phase",
                    (b * tuples) as u64,
                    &VkPhase { cr, ci, pattern, cos: ph_c, sin: ph_s, skip, tuples: tuples as i64, o0: oi, nb: bi },
                ),
            )?;

            for ax in 0..axes {
                lift(env, axis(ax, -1))?;
            }

            lift(
                env,
                g.launch(
                    "vk_hp_scatter",
                    (b * rows) as u64,
                    &VkScatter {
                        re,
                        im,
                        cr,
                        ci,
                        psign,
                        write_off,
                        write_c,
                        write_tau,
                        t_of,
                        block: block as i64,
                        nperm: nperm as i64,
                        rows: rows as i64,
                        tuples: tuples as i64,
                        o0: oi,
                        nb: bi,
                    },
                ),
            )?;
            o0 += b;
        }

        Ok(())
    })();

    done(env, r)
}

// ---- the exports ----

pub(crate) fn methods() -> Vec<node::napi_property_descriptor> {
    let m = |name: &'static [u8], f: napi_callback| node::method(name, f);

    vec![
        m(b"gpuInit\0", js_init),
        m(b"gpuAlloc\0", js_alloc),
        m(b"gpuFree\0", js_free),
        m(b"gpuUpload\0", js_upload),
        m(b"gpuDownload\0", js_download),
        m(b"gpuCopy\0", js_copy),
        m(b"gpuPairOp\0", js_pair_op),
        m(b"gpuConv\0", js_conv),
        m(b"gpuPairBeat\0", js_pair_beat),
        m(b"gpuCrossApply\0", js_cross_apply),
        m(b"gpuBlockAdd\0", js_block_add),
        m(b"gpuBlockInner\0", js_block_inner),
        m(b"gpuAxpy\0", js_axpy),
        m(b"gpuScale\0", js_scale),
        m(b"gpuSeaPiece\0", js_sea_piece),
        m(b"gpuSeaStream\0", js_sea_stream),
        m(b"gpuPhaseSum\0", js_phase_sum),
        m(b"gpuHoleOneBody\0", js_hole_one_body),
        m(b"gpuHoleBand\0", js_hole_band),
        m(b"gpuHolePair\0", js_hole_pair),
    ]
}
