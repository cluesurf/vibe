// THE KERNEL AS A WASM MODULE, the wasm backend. kernel/src/
// The same primitives as plain exports over the module's linear memory, built for wasm32-unknown-unknown with SIMD128.
// A caller (code/kernel/wasm.ts) allocates the arrays inside the module with vk_alloc, copies its inputs in, calls a
// primitive on a row range, and copies the outputs back. The row range is an argument, so several instances over one
// shared memory can each take a range (the route to threads, see note/research/vibe/kernel.md). Wasm float arithmetic
// is IEEE double with no contraction and no fast-math, so the bytes are the native build's and the reference's.

use crate::prim;
use std::alloc::{alloc_zeroed, dealloc, Layout};

#[no_mangle]
pub extern "C" fn vk_alloc(bytes: usize) -> *mut u8 {
    unsafe { alloc_zeroed(Layout::from_size_align(bytes.max(8), 16).unwrap()) }
}

/// # Safety
/// ptr and bytes must come from one vk_alloc call.
#[no_mangle]
pub unsafe extern "C" fn vk_free(ptr: *mut u8, bytes: usize) {
    dealloc(ptr, Layout::from_size_align(bytes.max(8), 16).unwrap())
}

/// # Safety
/// Every pointer is a table vk_alloc returned, sized as code/kernel/wasm.ts writes it, kept alive with the operator.
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_pair_op(
    count: usize,
    elements: usize,
    plus_rep: *const i32,
    plus_g: *const i32,
    minus_rep: *const i32,
    minus_g: *const i32,
    src: *const i16,
    sgn: *const i8,
    off: *const i32,
    row: *const i8,
    col: *const i8,
    val: *const f64,
    off_t: *const i32,
    row_t: *const i8,
    col_t: *const i8,
    val_t: *const f64,
    half_re: *const f64,
    half_im: *const f64,
) -> *mut prim::PairOp {
    let mut hr = [0.0; 24];
    let mut hi = [0.0; 24];

    hr.copy_from_slice(std::slice::from_raw_parts(half_re, 24));
    hi.copy_from_slice(std::slice::from_raw_parts(half_im, 24));

    Box::into_raw(Box::new(prim::PairOp {
        count,
        elements,
        plus_rep,
        plus_g,
        minus_rep,
        minus_g,
        src,
        sgn,
        off,
        row,
        col,
        val,
        off_t,
        row_t,
        col_t,
        val_t,
        half_re: hr,
        half_im: hi,
    }))
}

/// # Safety
/// op came from vk_pair_op.
#[no_mangle]
pub unsafe extern "C" fn vk_pair_op_free(op: *mut prim::PairOp) {
    drop(Box::from_raw(op));
}

/// # Safety
/// Pointers from vk_alloc, sized as the primitive reads them (checked by code/kernel/wasm.ts).
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_conv(
    op: *const prim::PairOp,
    src_re: *const f64,
    src_im: *const f64,
    src_off: usize,
    src_stride: usize,
    t: usize,
    out_re: *mut f64,
    out_im: *mut f64,
    member: i32,
    dagger: i32,
    start: usize,
    end: usize,
) {
    prim::conv(&*op, src_re, src_im, src_off, src_stride, t, out_re, out_im, member, dagger != 0, start, end)
}

/// # Safety
/// As vk_conv.
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_pair_beat(
    re: *mut f64,
    im: *mut f64,
    t1r: *const f64,
    t1i: *const f64,
    t2r: *const f64,
    t2i: *const f64,
    fr: *const f64,
    fi: *const f64,
    qbr: *const f64,
    qbi: *const f64,
    qxr: *const f64,
    qxi: *const f64,
    beta: *const f64,
    alr: f64,
    ali: f64,
    main_off: usize,
    start: usize,
    end: usize,
) {
    let b = prim::Beat { t1r, t1i, t2r, t2i, fr, fi, qbr, qbi, qxr, qxi, beta, alr, ali, main_off };

    prim::pair_beat(re, im, &b, start, end)
}

/// # Safety
/// As vk_conv.
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_cross_apply(
    re: *mut f64,
    im: *mut f64,
    t1r: *const f64,
    t1i: *const f64,
    t2r: *const f64,
    t2i: *const f64,
    t4r: *const f64,
    t4i: *const f64,
    cross: *const f64,
    own: usize,
    start: usize,
    end: usize,
) {
    let x = prim::Cross { t1r, t1i, t2r, t2i, t4r, t4i, cross, own };

    prim::cross_apply(re, im, &x, start, end)
}

/// # Safety
/// As vk_conv.
#[no_mangle]
pub unsafe extern "C" fn vk_block_add(
    out_re: *mut f64,
    out_im: *mut f64,
    fr: *const f64,
    fi: *const f64,
    off: usize,
    start: usize,
    end: usize,
) {
    prim::block_add(out_re, out_im, fr, fi, off, start, end)
}

/// # Safety
/// As vk_conv.
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_block_inner(
    a_re: *const f64,
    a_im: *const f64,
    b_re: *const f64,
    b_im: *const f64,
    part_re: *mut f64,
    part_im: *mut f64,
    start: usize,
    end: usize,
) {
    prim::block_inner(a_re, a_im, b_re, b_im, part_re, part_im, start, end)
}

/// # Safety
/// As vk_conv.
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_axpy(
    y_re: *mut f64,
    y_im: *mut f64,
    x_re: *const f64,
    x_im: *const f64,
    fr: f64,
    fi: f64,
    start: usize,
    end: usize,
) {
    prim::axpy(y_re, y_im, x_re, x_im, fr, fi, start, end)
}

/// # Safety
/// As vk_conv.
#[no_mangle]
pub unsafe extern "C" fn vk_scale(re: *mut f64, im: *mut f64, f: f64, start: usize, end: usize) {
    prim::scale(re, im, f, start, end)
}

/// # Safety
/// As vk_conv; phase may be null.
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_sea_piece(
    re: *mut f64,
    im: *mut f64,
    e: *const f64,
    alpha: *const f64,
    beta: *const f64,
    phase: *const f64,
    start: usize,
    end: usize,
) {
    prim::sea_piece(re, im, e, alpha, beta, phase, start, end)
}

/// # Safety
/// As vk_conv.
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_sea_stream(
    s_re: *const f64,
    s_im: *const f64,
    o_re: *mut f64,
    o_im: *mut f64,
    mv: *const i32,
    opposite: *const i32,
    start: usize,
    end: usize,
) {
    prim::sea_stream(s_re, s_im, o_re, o_im, mv, opposite, start, end)
}

/// # Safety
/// As vk_conv.
#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub unsafe extern "C" fn vk_phase_sum(
    re: *const f64,
    im: *const f64,
    c: *const f64,
    s: *const f64,
    docks: usize,
    width: usize,
    m_re: *mut f64,
    m_im: *mut f64,
    start: usize,
    end: usize,
) {
    prim::phase_sum(re, im, c, s, docks, width, m_re, m_im, start, end)
}
