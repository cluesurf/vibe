// THE KERNEL AS A NODE ADDON, the native backend. kernel/src/
// Node has no FFI, but every node ships the Node-API, a stable C ABI exported by the node binary itself, and loads any
// shared library that exports napi_register_module_v1 (require or process.dlopen). This file declares the dozen napi_*
// calls it uses by hand, so the addon needs no crate and no npm package: build.rs links with -undefined dynamic_lookup
// and the symbols resolve against the running node. The typed arrays an engine already holds are read and written IN
// PLACE (napi_get_typedarray_info gives their data pointers, SharedArrayBuffer-backed or not), with no copy in or out.
//
// Every entry point checks the lengths and indices it will touch before a pointer reaches prim.rs, and throws a JS
// error (never panics across the boundary: the crate is built panic = abort, so a panic would end the process).

#![allow(non_camel_case_types)]

use crate::pool;
use crate::prim;
use std::ffi::{c_char, c_void, CString};
use std::ptr;

type napi_env = *mut c_void;
type napi_value = *mut c_void;
type napi_callback_info = *mut c_void;
type napi_status = i32;
type napi_callback = unsafe extern "C" fn(napi_env, napi_callback_info) -> napi_value;
type napi_finalize = unsafe extern "C" fn(napi_env, *mut c_void, *mut c_void);

const NAPI_OK: napi_status = 0;
const TA_INT8: i32 = 0;
const TA_INT16: i32 = 3;
const TA_INT32: i32 = 5;
const TA_FLOAT64: i32 = 8;
const VT_UNDEFINED: i32 = 0;
const VT_NULL: i32 = 1;

#[repr(C)]
struct napi_property_descriptor {
    utf8name: *const c_char,
    name: napi_value,
    method: Option<napi_callback>,
    getter: Option<napi_callback>,
    setter: Option<napi_callback>,
    value: napi_value,
    attributes: i32,
    data: *mut c_void,
}

extern "C" {
    fn napi_get_cb_info(
        env: napi_env,
        info: napi_callback_info,
        argc: *mut usize,
        argv: *mut napi_value,
        this_arg: *mut napi_value,
        data: *mut *mut c_void,
    ) -> napi_status;
    fn napi_is_typedarray(env: napi_env, value: napi_value, result: *mut bool) -> napi_status;
    fn napi_get_typedarray_info(
        env: napi_env,
        typedarray: napi_value,
        kind: *mut i32,
        length: *mut usize,
        data: *mut *mut c_void,
        arraybuffer: *mut napi_value,
        byte_offset: *mut usize,
    ) -> napi_status;
    fn napi_get_value_int32(env: napi_env, value: napi_value, result: *mut i32) -> napi_status;
    fn napi_get_value_double(env: napi_env, value: napi_value, result: *mut f64) -> napi_status;
    fn napi_throw_error(env: napi_env, code: *const c_char, msg: *const c_char) -> napi_status;
    fn napi_create_int32(env: napi_env, value: i32, result: *mut napi_value) -> napi_status;
    fn napi_get_undefined(env: napi_env, result: *mut napi_value) -> napi_status;
    fn napi_create_external(
        env: napi_env,
        data: *mut c_void,
        finalize_cb: Option<napi_finalize>,
        finalize_hint: *mut c_void,
        result: *mut napi_value,
    ) -> napi_status;
    fn napi_get_value_external(env: napi_env, value: napi_value, result: *mut *mut c_void) -> napi_status;
    fn napi_typeof(env: napi_env, value: napi_value, result: *mut i32) -> napi_status;
    fn napi_define_properties(
        env: napi_env,
        object: napi_value,
        property_count: usize,
        properties: *const napi_property_descriptor,
    ) -> napi_status;
}

// ---- argument reading ----

struct Fail;

type R<T> = Result<T, Fail>;

unsafe fn throw(env: napi_env, msg: &str) -> Fail {
    let m = CString::new(format!("vibe kernel: {msg}")).unwrap_or_default();

    napi_throw_error(env, ptr::null(), m.as_ptr());
    Fail
}

unsafe fn args<const N: usize>(env: napi_env, info: napi_callback_info) -> R<[napi_value; N]> {
    let mut argc = N;
    let mut argv = [ptr::null_mut(); N];

    if napi_get_cb_info(env, info, &mut argc, argv.as_mut_ptr(), ptr::null_mut(), ptr::null_mut()) != NAPI_OK {
        return Err(throw(env, "could not read the arguments"));
    }

    if argc < N {
        return Err(throw(env, &format!("expected {N} arguments, got {argc}")));
    }

    Ok(argv)
}

unsafe fn typed<T>(env: napi_env, v: napi_value, want: i32, what: &str) -> R<(*mut T, usize)> {
    let mut is = false;
    let mut kind = -1;
    let mut len = 0usize;
    let mut data: *mut c_void = ptr::null_mut();

    if napi_is_typedarray(env, v, &mut is) != NAPI_OK
        || !is
        || napi_get_typedarray_info(env, v, &mut kind, &mut len, &mut data, ptr::null_mut(), ptr::null_mut()) != NAPI_OK
        || kind != want
    {
        return Err(throw(env, &format!("{what} has the wrong array type")));
    }

    Ok((data as *mut T, len))
}

unsafe fn f64s(env: napi_env, v: napi_value, what: &str) -> R<(*mut f64, usize)> {
    typed::<f64>(env, v, TA_FLOAT64, what)
}

unsafe fn i32s(env: napi_env, v: napi_value, what: &str) -> R<(*mut i32, usize)> {
    typed::<i32>(env, v, TA_INT32, what)
}

unsafe fn int(env: napi_env, v: napi_value, what: &str) -> R<i32> {
    let mut x = 0i32;

    if napi_get_value_int32(env, v, &mut x) != NAPI_OK {
        return Err(throw(env, &format!("{what} is not an integer")));
    }

    Ok(x)
}

unsafe fn num(env: napi_env, v: napi_value, what: &str) -> R<f64> {
    let mut x = 0f64;

    if napi_get_value_double(env, v, &mut x) != NAPI_OK {
        return Err(throw(env, &format!("{what} is not a number")));
    }

    Ok(x)
}

unsafe fn undefined(env: napi_env) -> napi_value {
    let mut u = ptr::null_mut();

    napi_get_undefined(env, &mut u);
    u
}

unsafe fn done(env: napi_env, r: R<()>) -> napi_value {
    match r {
        Ok(()) => undefined(env),
        Err(Fail) => ptr::null_mut(),
    }
}

fn check(ok: bool, env: napi_env, what: &str) -> R<()> {
    if ok {
        Ok(())
    } else {
        Err(unsafe { throw(env, &format!("{what} arguments out of range")) })
    }
}

// a pointer that may be sent to pool threads (each writes only its own rows)
#[derive(Clone, Copy)]
struct P<T>(*mut T);

unsafe impl<T> Send for P<T> {}
unsafe impl<T> Sync for P<T> {}

impl<T> P<T> {
    // read through a method, so a closure captures the whole wrapper (Sync) and not its raw field
    fn p(&self) -> *mut T {
        self.0
    }
}

// ---- threads ----

unsafe extern "C" fn js_threads(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<napi_value> {
        let [a] = args::<1>(env, info)?;
        let n = int(env, a, "threads")?;

        check((1..=pool::MAX_THREADS as i32).contains(&n), env, "threads")?;
        pool::set_threads(n as usize);

        let mut out = ptr::null_mut();

        napi_create_int32(env, pool::threads() as i32, &mut out);
        Ok(out)
    })();

    r.unwrap_or(ptr::null_mut())
}

// ---- the pair operator ----

struct OwnedOp {
    op: prim::PairOp,
    _i32: Vec<Vec<i32>>,
    _i16: Vec<i16>,
    _i8: Vec<Vec<i8>>,
    _f64: Vec<Vec<f64>>,
}

unsafe extern "C" fn op_free(_env: napi_env, data: *mut c_void, _hint: *mut c_void) {
    drop(Box::from_raw(data as *mut OwnedOp));
}

unsafe fn to_vec<T: Copy>(p: *const T, n: usize) -> Vec<T> {
    if n == 0 {
        Vec::new()
    } else {
        std::slice::from_raw_parts(p, n).to_vec()
    }
}

// pairOp(plusRep, plusG, minusRep, minusG, src, sgn, off, row, col, val, offT, rowT, colT, valT, halfRe, halfIm)
unsafe extern "C" fn js_pair_op(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<napi_value> {
        let a = args::<16>(env, info)?;
        let (plus_rep, n_pr) = i32s(env, a[0], "plusRep")?;
        let (plus_g, n_pg) = i32s(env, a[1], "plusG")?;
        let (minus_rep, n_mr) = i32s(env, a[2], "minusRep")?;
        let (minus_g, n_mg) = i32s(env, a[3], "minusG")?;
        let (src, n_src) = typed::<i16>(env, a[4], TA_INT16, "src")?;
        let (sgn, n_sgn) = typed::<i8>(env, a[5], TA_INT8, "sgn")?;
        let (off, n_off) = i32s(env, a[6], "off")?;
        let (row, n_row) = typed::<i8>(env, a[7], TA_INT8, "row")?;
        let (col, n_col) = typed::<i8>(env, a[8], TA_INT8, "col")?;
        let (val, n_val) = f64s(env, a[9], "val")?;
        let (off_t, n_off_t) = i32s(env, a[10], "offT")?;
        let (row_t, n_row_t) = typed::<i8>(env, a[11], TA_INT8, "rowT")?;
        let (col_t, n_col_t) = typed::<i8>(env, a[12], TA_INT8, "colT")?;
        let (val_t, n_val_t) = f64s(env, a[13], "valT")?;
        let (half_re, n_hr) = f64s(env, a[14], "halfRe")?;
        let (half_im, n_hi) = f64s(env, a[15], "halfIm")?;

        check(
            n_pr % 24 == 0
                && n_pg == n_pr
                && n_mr == n_pr
                && n_mg == n_pr
                && n_src % 256 == 0
                && n_sgn == n_src
                && n_off == 25
                && n_off_t == 25
                && n_row == n_val
                && n_col == n_val
                && n_row_t == n_val_t
                && n_col_t == n_val_t
                && n_hr == 24
                && n_hi == 24,
            env,
            "pairOp",
        )?;

        let count = n_pr / 24;
        let elements = n_src / 256;
        let v_pr = to_vec(plus_rep, n_pr);
        let v_pg = to_vec(plus_g, n_pg);
        let v_mr = to_vec(minus_rep, n_mr);
        let v_mg = to_vec(minus_g, n_mg);
        let v_src = to_vec(src, n_src);
        let v_sgn = to_vec(sgn, n_sgn);
        let v_off = to_vec(off, 25);
        let v_row = to_vec(row, n_row);
        let v_col = to_vec(col, n_col);
        let v_val = to_vec(val, n_val);
        let v_off_t = to_vec(off_t, 25);
        let v_row_t = to_vec(row_t, n_row_t);
        let v_col_t = to_vec(col_t, n_col_t);
        let v_val_t = to_vec(val_t, n_val_t);

        // every index in range, so the kernel never reads outside a table
        let good_rep = |rep: &[i32], g: &[i32]| {
            rep.iter()
                .zip(g)
                .all(|(&r, &e)| r < count as i32 && (r < 0 || (e >= 0 && (e as usize) < elements)))
        };
        let good_off = |o: &[i32], n: usize| o[0] == 0 && o.windows(2).all(|w| w[0] <= w[1]) && o[24] as usize == n;

        check(
            good_rep(&v_pr, &v_pg)
                && good_rep(&v_mr, &v_mg)
                && v_src.iter().all(|&s| (0..64).contains(&s))
                && v_sgn.iter().all(|&s| s == 1 || s == -1)
                && good_off(&v_off, n_val)
                && good_off(&v_off_t, n_val_t)
                && v_row.iter().chain(&v_col).chain(&v_row_t).chain(&v_col_t).all(|&x| (0..8).contains(&x)),
            env,
            "pairOp index",
        )?;

        let mut hr = [0.0; 24];
        let mut hi = [0.0; 24];

        hr.copy_from_slice(std::slice::from_raw_parts(half_re, 24));
        hi.copy_from_slice(std::slice::from_raw_parts(half_im, 24));

        let op = prim::PairOp {
            count,
            elements,
            plus_rep: v_pr.as_ptr(),
            plus_g: v_pg.as_ptr(),
            minus_rep: v_mr.as_ptr(),
            minus_g: v_mg.as_ptr(),
            src: v_src.as_ptr(),
            sgn: v_sgn.as_ptr(),
            off: v_off.as_ptr(),
            row: v_row.as_ptr(),
            col: v_col.as_ptr(),
            val: v_val.as_ptr(),
            off_t: v_off_t.as_ptr(),
            row_t: v_row_t.as_ptr(),
            col_t: v_col_t.as_ptr(),
            val_t: v_val_t.as_ptr(),
            half_re: hr,
            half_im: hi,
        };
        let owned = Box::new(OwnedOp {
            op,
            _i32: vec![v_pr, v_pg, v_mr, v_mg, v_off, v_off_t],
            _i16: v_src,
            _i8: vec![v_sgn, v_row, v_col, v_row_t, v_col_t],
            _f64: vec![v_val, v_val_t],
        });
        let mut out = ptr::null_mut();

        if napi_create_external(env, Box::into_raw(owned) as *mut c_void, Some(op_free), ptr::null_mut(), &mut out)
            != NAPI_OK
        {
            return Err(throw(env, "could not wrap the pair operator"));
        }

        Ok(out)
    })();

    r.unwrap_or(ptr::null_mut())
}

unsafe fn op_of(env: napi_env, v: napi_value) -> R<&'static prim::PairOp> {
    let mut data: *mut c_void = ptr::null_mut();

    if napi_get_value_external(env, v, &mut data) != NAPI_OK || data.is_null() {
        return Err(throw(env, "not a pair operator"));
    }

    Ok(&(*(data as *const OwnedOp)).op)
}

// ---- the pair engine's primitives ----

// conv(op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger)
unsafe extern "C" fn js_conv(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<10>(env, info)?;
        let op = op_of(env, a[0])?;
        let (sr, n_sr) = f64s(env, a[1], "srcRe")?;
        let (si, n_si) = f64s(env, a[2], "srcIm")?;
        let src_off = int(env, a[3], "srcOff")?;
        let src_stride = int(env, a[4], "srcStride")?;
        let t = int(env, a[5], "t")?;
        let (or, n_or) = f64s(env, a[6], "outRe")?;
        let (oi, n_oi) = f64s(env, a[7], "outIm")?;
        let member = int(env, a[8], "member")?;
        let dagger = int(env, a[9], "dagger")? != 0;

        check(
            src_off >= 0 && src_stride >= 64 && (0..4).contains(&t) && (member == 1 || member == 2),
            env,
            "conv",
        )?;

        let need = if op.count == 0 { 0 } else { (op.count - 1) * src_stride as usize + src_off as usize + 64 };

        check(n_sr == n_si && n_or == n_oi && n_sr >= need && n_or >= op.count * 64, env, "conv")?;

        let (sr, si, or, oi) = (P(sr), P(si), P(or), P(oi));

        pool::run(op.count, 4, &|s, e| {
            prim::conv(
                op,
                sr.p(),
                si.p(),
                src_off as usize,
                src_stride as usize,
                t as usize,
                or.p(),
                oi.p(),
                member,
                dagger,
                s,
                e,
            )
        });
        Ok(())
    })();

    done(env, r)
}

// pairBeat(re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta, alr, ali, mainOff)
unsafe extern "C" fn js_pair_beat(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<16>(env, info)?;
        let (re, n_re) = f64s(env, a[0], "re")?;
        let (im, n_im) = f64s(env, a[1], "im")?;
        let names = ["t1r", "t1i", "t2r", "t2i", "fr", "fi", "qBr", "qBi", "qXr", "qXi"];
        let mut f = [ptr::null_mut::<f64>(); 10];
        let (beta, n_beta) = f64s(env, a[12], "beta")?;
        let n = n_beta / 2;

        for k in 0..10 {
            let (p, len) = f64s(env, a[2 + k], names[k])?;

            check(len >= n * 64, env, "pairBeat")?;
            f[k] = p;
        }

        let alr = num(env, a[13], "alr")?;
        let ali = num(env, a[14], "ali")?;
        let main_off = int(env, a[15], "mainOff")?;

        check(n_re == n * 256 && n_im == n_re && (main_off == 0 || main_off == 192), env, "pairBeat")?;

        let b = prim::Beat {
            t1r: f[0],
            t1i: f[1],
            t2r: f[2],
            t2i: f[3],
            fr: f[4],
            fi: f[5],
            qbr: f[6],
            qbi: f[7],
            qxr: f[8],
            qxi: f[9],
            beta,
            alr,
            ali,
            main_off: main_off as usize,
        };
        let (re, im) = (P(re), P(im));

        pool::run(n, 16, &|s, e| prim::pair_beat(re.p(), im.p(), &b, s, e));
        Ok(())
    })();

    done(env, r)
}

// crossApply(re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross, own)
unsafe extern "C" fn js_cross_apply(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<10>(env, info)?;
        let (re, n_re) = f64s(env, a[0], "re")?;
        let (im, n_im) = f64s(env, a[1], "im")?;
        let (cross, n_cross) = f64s(env, a[8], "cross")?;
        let n = n_cross / 2;
        let names = ["t1r", "t1i", "t2r", "t2i", "t4r", "t4i"];
        let mut f = [ptr::null_mut::<f64>(); 6];

        for k in 0..6 {
            let (p, len) = f64s(env, a[2 + k], names[k])?;

            check(len >= n * 64, env, "crossApply")?;
            f[k] = p;
        }

        let own = int(env, a[9], "own")?;

        check(n_re == n * 256 && n_im == n_re && (own == 64 || own == 128), env, "crossApply")?;

        let x = prim::Cross {
            t1r: f[0],
            t1i: f[1],
            t2r: f[2],
            t2i: f[3],
            t4r: f[4],
            t4i: f[5],
            cross,
            own: own as usize,
        };
        let (re, im) = (P(re), P(im));

        pool::run(n, 16, &|s, e| prim::cross_apply(re.p(), im.p(), &x, s, e));
        Ok(())
    })();

    done(env, r)
}

// blockAdd(outRe, outIm, fr, fi, off)
unsafe extern "C" fn js_block_add(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<5>(env, info)?;
        let (or, n_or) = f64s(env, a[0], "outRe")?;
        let (oi, n_oi) = f64s(env, a[1], "outIm")?;
        let (fr, n_fr) = f64s(env, a[2], "fr")?;
        let (fi, n_fi) = f64s(env, a[3], "fi")?;
        let off = int(env, a[4], "off")?;
        let n = n_or / 256;

        check(
            n_oi == n_or && n_or % 256 == 0 && n_fr >= n * 64 && n_fi >= n * 64 && [0, 64, 128, 192].contains(&off),
            env,
            "blockAdd",
        )?;

        let (or, oi, fr, fi) = (P(or), P(oi), P(fr), P(fi));

        pool::run(n, 64, &|s, e| prim::block_add(or.p(), oi.p(), fr.p(), fi.p(), off as usize, s, e));
        Ok(())
    })();

    done(env, r)
}

// blockInner(aRe, aIm, bRe, bIm, partRe, partIm)
unsafe extern "C" fn js_block_inner(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<6>(env, info)?;
        let (ar, n1) = f64s(env, a[0], "aRe")?;
        let (ai, n2) = f64s(env, a[1], "aIm")?;
        let (br, n3) = f64s(env, a[2], "bRe")?;
        let (bi, n4) = f64s(env, a[3], "bIm")?;
        let (pr, n_pr) = f64s(env, a[4], "partRe")?;
        let (pi, n_pi) = f64s(env, a[5], "partIm")?;

        check(n_pi == n_pr && n1 == n_pr * 256 && n2 == n1 && n3 == n1 && n4 == n1, env, "blockInner")?;

        let (ar, ai, br, bi, pr, pi) = (P(ar), P(ai), P(br), P(bi), P(pr), P(pi));

        pool::run(n_pr, 64, &|s, e| prim::block_inner(ar.p(), ai.p(), br.p(), bi.p(), pr.p(), pi.p(), s, e));
        Ok(())
    })();

    done(env, r)
}

// axpy(yRe, yIm, xRe, xIm, fr, fi)
unsafe extern "C" fn js_axpy(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<6>(env, info)?;
        let (yr, n1) = f64s(env, a[0], "yRe")?;
        let (yi, n2) = f64s(env, a[1], "yIm")?;
        let (xr, n3) = f64s(env, a[2], "xRe")?;
        let (xi, n4) = f64s(env, a[3], "xIm")?;
        let fr = num(env, a[4], "fr")?;
        let fi = num(env, a[5], "fi")?;

        check(n2 == n1 && n3 >= n1 && n4 >= n1, env, "axpy")?;

        let (yr, yi, xr, xi) = (P(yr), P(yi), P(xr), P(xi));

        pool::run(n1, 1 << 14, &|s, e| prim::axpy(yr.p(), yi.p(), xr.p(), xi.p(), fr, fi, s, e));
        Ok(())
    })();

    done(env, r)
}

// scale(re, im, f)
unsafe extern "C" fn js_scale(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<3>(env, info)?;
        let (re, n1) = f64s(env, a[0], "re")?;
        let (im, n2) = f64s(env, a[1], "im")?;
        let f = num(env, a[2], "f")?;

        check(n2 == n1, env, "scale")?;

        let (re, im) = (P(re), P(im));

        pool::run(n1, 1 << 14, &|s, e| prim::scale(re.p(), im.p(), f, s, e));
        Ok(())
    })();

    done(env, r)
}

// ---- register-sea ----

// seaPiece(re, im, E, alpha, beta, phase or null)
unsafe extern "C" fn js_sea_piece(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<6>(env, info)?;
        let (re, n1) = f64s(env, a[0], "re")?;
        let (im, n2) = f64s(env, a[1], "im")?;
        let (e, n_e) = f64s(env, a[2], "E")?;
        let (alpha, n_a) = f64s(env, a[3], "alpha")?;
        let (beta, n_b) = f64s(env, a[4], "beta")?;
        let mut kind = -1;

        napi_typeof(env, a[5], &mut kind);

        let (phase, n_p) = if kind == VT_NULL || kind == VT_UNDEFINED {
            (ptr::null_mut(), n_a)
        } else {
            f64s(env, a[5], "phase")?
        };
        let docks = n_a / 2;

        check(
            n2 == n1 && n1 == docks * prim::FULL && n_e == prim::MODES * prim::REG && n_b == n_a && n_p == n_a,
            env,
            "seaPiece",
        )?;

        let (re, im, e, alpha, beta, phase) = (P(re), P(im), P(e), P(alpha), P(beta), P(phase));

        pool::run(docks, 1, &|s, t| prim::sea_piece(re.p(), im.p(), e.p(), alpha.p(), beta.p(), phase.p(), s, t));
        Ok(())
    })();

    done(env, r)
}

// seaStream(sRe, sIm, oRe, oIm, move, opposite)
unsafe extern "C" fn js_sea_stream(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<6>(env, info)?;
        let (sr, n1) = f64s(env, a[0], "sRe")?;
        let (si, n2) = f64s(env, a[1], "sIm")?;
        let (or, n3) = f64s(env, a[2], "oRe")?;
        let (oi, n4) = f64s(env, a[3], "oIm")?;
        let (mv, n_mv) = i32s(env, a[4], "move")?;
        let (opp, n_opp) = i32s(env, a[5], "opposite")?;
        let docks = n1 / prim::FULL;

        check(
            n2 == n1 && n3 == n1 && n4 == n1 && n1 % prim::FULL == 0 && n_mv == docks * 576 && n_opp == 24,
            env,
            "seaStream",
        )?;

        let mvs = std::slice::from_raw_parts(mv, n_mv);
        let opps = std::slice::from_raw_parts(opp, n_opp);

        check(
            mvs.iter().all(|&j| j >= 0 && (j as usize) < docks) && opps.iter().all(|&o| (0..24).contains(&o)),
            env,
            "seaStream index",
        )?;

        let (sr, si, or, oi, mv, opp) = (P(sr), P(si), P(or), P(oi), P(mv), P(opp));

        pool::run(docks, 1, &|s, e| prim::sea_stream(sr.p(), si.p(), or.p(), oi.p(), mv.p(), opp.p(), s, e));
        Ok(())
    })();

    done(env, r)
}

// phaseSum(re, im, c, s, width, mRe, mIm)
unsafe extern "C" fn js_phase_sum(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<7>(env, info)?;
        let (re, n1) = f64s(env, a[0], "re")?;
        let (im, n2) = f64s(env, a[1], "im")?;
        let (c, n_c) = f64s(env, a[2], "c")?;
        let (s, n_s) = f64s(env, a[3], "s")?;
        let width = int(env, a[4], "width")?;
        let (mr, n_mr) = f64s(env, a[5], "mRe")?;
        let (mi, n_mi) = f64s(env, a[6], "mIm")?;

        check(
            width > 0 && n2 == n1 && n_s == n_c && n1 == n_c * width as usize && n_mr == width as usize && n_mi == n_mr,
            env,
            "phaseSum",
        )?;

        let (re, im, c, s, mr, mi) = (P(re), P(im), P(c), P(s), P(mr), P(mi));
        let docks = n_c;

        pool::run(width as usize, 1024, &|a0, a1| {
            prim::phase_sum(re.p(), im.p(), c.p(), s.p(), docks, width as usize, mr.p(), mi.p(), a0, a1)
        });
        Ok(())
    })();

    done(env, r)
}

// ---- register-holes ----

// block = f^n, when it fits (f 1..=16, n 1..=8)
fn hole_block(n: i32, f: i32) -> Option<usize> {
    if !(1..=8).contains(&n) || !(1..=prim::HOLE_FIBER_MAX as i32).contains(&f) {
        return None;
    }

    (f as usize).checked_pow(n as u32)
}

// the shape shared by holeOneBody and holeBand: rows, and every momentum class a valid transfer
unsafe fn hole_rows(
    env: napi_env,
    n_re: usize,
    n_im: usize,
    mom: *const i32,
    n_mom: usize,
    n: i32,
    f: i32,
    n_a: usize,
    n_ai: usize,
    what: &str,
) -> R<(usize, usize)> {
    let block = match hole_block(n, f) {
        Some(b) => b,
        None => return Err(throw(env, &format!("{what} arguments out of range"))),
    };
    let ff = (f * f) as usize;

    check(
        n_im == n_re && n_re % block == 0 && n_a == n_ai && n_a % ff == 0 && n_a > 0,
        env,
        what,
    )?;

    let rows = n_re / block;
    let classes = n_a / ff;

    check(n_mom == rows * n as usize, env, what)?;
    check(
        std::slice::from_raw_parts(mom, n_mom).iter().all(|&j| j >= 0 && (j as usize) < classes),
        env,
        &format!("{what} index"),
    )?;

    Ok((rows, block))
}

// holeOneBody(re, im, mom, n, f, aRe, aIm)
unsafe extern "C" fn js_hole_one_body(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<7>(env, info)?;
        let (re, n_re) = f64s(env, a[0], "re")?;
        let (im, n_im) = f64s(env, a[1], "im")?;
        let (mom, n_mom) = i32s(env, a[2], "mom")?;
        let n = int(env, a[3], "n")?;
        let f = int(env, a[4], "f")?;
        let (ar, n_ar) = f64s(env, a[5], "aRe")?;
        let (ai, n_ai) = f64s(env, a[6], "aIm")?;
        let (rows, _) = hole_rows(env, n_re, n_im, mom, n_mom, n, f, n_ar, n_ai, "holeOneBody")?;
        let (re, im, mom, ar, ai) = (P(re), P(im), P(mom), P(ar), P(ai));

        pool::run(rows, 1, &|s, e| {
            prim::hole_one_body(re.p(), im.p(), mom.p(), n as usize, f as usize, ar.p(), ai.p(), s, e)
        });
        Ok(())
    })();

    done(env, r)
}

// holeBand(re, im, mom, n, f, pRe, pIm, part)
unsafe extern "C" fn js_hole_band(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<8>(env, info)?;
        let (re, n_re) = f64s(env, a[0], "re")?;
        let (im, n_im) = f64s(env, a[1], "im")?;
        let (mom, n_mom) = i32s(env, a[2], "mom")?;
        let n = int(env, a[3], "n")?;
        let f = int(env, a[4], "f")?;
        let (pr, n_pr) = f64s(env, a[5], "pRe")?;
        let (pi, n_pi) = f64s(env, a[6], "pIm")?;
        let (part, n_part) = f64s(env, a[7], "part")?;
        let (rows, _) = hole_rows(env, n_re, n_im, mom, n_mom, n, f, n_pr, n_pi, "holeBand")?;

        check(n_part == rows * n as usize, env, "holeBand")?;

        let (re, im, mom, pr, pi, part) = (P(re), P(im), P(mom), P(pr), P(pi), P(part));

        pool::run(rows, 1, &|s, e| {
            prim::hole_band(re.p(), im.p(), mom.p(), n as usize, f as usize, pr.p(), pi.p(), part.p(), s, e)
        });
        Ok(())
    })();

    done(env, r)
}

unsafe fn in_range(p: *const i32, len: usize, lo: i32, hi: usize) -> bool {
    len == 0 || std::slice::from_raw_parts(p, len).iter().all(|&x| x >= lo && (x as i64) < hi as i64)
}

// holePair(re, im, scales, classOfGrid, gridOfSite, gridOfClass, cosL, sinL, rowOf, permOf, psign, fbOf, pattern,
// writeOff, writeC, writeTau, tOf, phaseC, phaseS, skip): every size is read off the arrays and checked against the
// others, every index checked against what it indexes, and the orbits checked disjoint (each fiber index written by one
// orbit only, each orbit reading only what it writes), so the threads never share an entry
unsafe extern "C" fn js_hole_pair(env: napi_env, info: napi_callback_info) -> napi_value {
    let r = (|| -> R<()> {
        let a = args::<20>(env, info)?;
        let (re, n_re) = f64s(env, a[0], "re")?;
        let (im, n_im) = f64s(env, a[1], "im")?;
        let (scales, n_scales) = f64s(env, a[2], "scales")?;
        let (cog, g) = i32s(env, a[3], "classOfGrid")?;
        let (gos, n) = i32s(env, a[4], "gridOfSite")?;
        let (goc, n_goc) = i32s(env, a[5], "gridOfClass")?;
        let (cos_l, l) = f64s(env, a[6], "cosL")?;
        let (sin_l, n_sin_l) = f64s(env, a[7], "sinL")?;
        let (row_of, tuples) = i32s(env, a[8], "rowOf")?;
        let (perm_of, n_perm_of) = i32s(env, a[9], "permOf")?;
        let (psign, nperm) = i32s(env, a[10], "psign")?;
        let (fb_of, n_fb_of) = i32s(env, a[11], "fbOf")?;
        let (pattern, orbits) = i32s(env, a[12], "pattern")?;
        let (write_off, n_write_off) = i32s(env, a[13], "writeOff")?;
        let (write_c, n_write_c) = i32s(env, a[14], "writeC")?;
        let (write_tau, n_write_tau) = i32s(env, a[15], "writeTau")?;
        let (t_of, n_t_of) = i32s(env, a[16], "tOf")?;
        let (ph_c, n_ph_c) = f64s(env, a[17], "phaseC")?;
        let (ph_s, n_ph_s) = f64s(env, a[18], "phaseS")?;
        let (skip, n_skip) = typed::<i8>(env, a[19], TA_INT8, "skip")?;

        // the grid and the axes: G = L^4, tuples = N^axes
        check(
            n_scales == 2
                && l >= 1
                && n_sin_l == l
                && l.checked_pow(4) == Some(g)
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

        let patterns = n_ph_c / tuples;
        let wo = std::slice::from_raw_parts(write_off, n_write_off);

        check(
            wo[0] == 0 && wo.windows(2).all(|w| w[0] <= w[1]) && wo[orbits] as usize == n_write_c,
            env,
            "holePair writeOff",
        )?;
        check(
            in_range(cog, g, 0, n)
                && in_range(gos, n, 0, g)
                && in_range(goc, n, 0, g)
                && in_range(row_of, tuples, 0, rows)
                && in_range(perm_of, tuples, 0, nperm)
                && std::slice::from_raw_parts(psign, nperm).iter().all(|&s| s == 1 || s == -1)
                && in_range(fb_of, n_fb_of, 0, block)
                && in_range(pattern, orbits, 0, patterns)
                && in_range(write_c, n_write_c, 0, block)
                && in_range(write_tau, n_write_tau, 0, nperm)
                && in_range(t_of, n_t_of, 0, tuples),
            env,
            "holePair index",
        )?;

        // the orbits are disjoint: a fiber index is written by one orbit once, and an orbit gathers only what it writes
        let mut owner = vec![-1i64; block];
        let wc = std::slice::from_raw_parts(write_c, n_write_c);
        let fbs = std::slice::from_raw_parts(fb_of, n_fb_of);
        let mut disjoint = true;

        for o in 0..orbits {
            for w in wo[o] as usize..wo[o + 1] as usize {
                let c = wc[w] as usize;

                if owner[c] >= 0 {
                    disjoint = false;
                }

                owner[c] = o as i64;
            }
        }

        for o in 0..orbits {
            for p in 0..nperm {
                if owner[fbs[o * nperm + p] as usize] != o as i64 {
                    disjoint = false;
                }
            }
        }

        check(disjoint, env, "holePair orbits")?;

        // the gather covers every tuple once: t = t_of[row_of[t] * nperm + perm_of[t]] for every t, and every (row, p)
        // whose tuple has permutation p is that tuple's own row (so a column entry is never left from another orbit)
        let ro = std::slice::from_raw_parts(row_of, tuples);
        let po = std::slice::from_raw_parts(perm_of, tuples);
        let to = std::slice::from_raw_parts(t_of, n_t_of);
        let covered = (0..tuples).all(|t| to[ro[t] as usize * nperm + po[t] as usize] as usize == t)
            && (0..rows).all(|r| {
                (0..nperm).all(|p| {
                    let t = to[r * nperm + p] as usize;

                    po[t] as usize != p || ro[t] as usize == r
                })
            });

        check(covered, env, "holePair gather")?;

        let sc = std::slice::from_raw_parts(scales, 2);
        let fo = prim::HoleFourier {
            l,
            n,
            g,
            class_of_grid: cog,
            grid_of_site: gos,
            grid_of_class: goc,
            cos: cos_l,
            sin: sin_l,
            k_sites: sc[0],
            k_classes: sc[1],
        };
        let hp = prim::HolePair {
            block,
            tuples,
            axes,
            rows,
            nperm,
            row_of,
            perm_of,
            psign,
            fb_of,
            pattern,
            write_off,
            write_c,
            write_tau,
            t_of,
            cos: ph_c,
            sin: ph_s,
            skip,
        };
        let (re, im) = (P(re), P(im));

        pool::run(orbits, 1, &|s, e| prim::hole_pair(re.p(), im.p(), &fo, &hp, s, e));
        Ok(())
    })();

    done(env, r)
}

// ---- the module ----

fn method(name: &'static [u8], f: napi_callback) -> napi_property_descriptor {
    napi_property_descriptor {
        utf8name: name.as_ptr() as *const c_char,
        name: ptr::null_mut(),
        method: Some(f),
        getter: None,
        setter: None,
        value: ptr::null_mut(),
        attributes: 0,
        data: ptr::null_mut(),
    }
}

/// # Safety
/// Called by node once, when the addon is loaded.
#[no_mangle]
pub unsafe extern "C" fn napi_register_module_v1(env: napi_env, exports: napi_value) -> napi_value {
    let fns = [
        method(b"threads\0", js_threads),
        method(b"pairOp\0", js_pair_op),
        method(b"conv\0", js_conv),
        method(b"pairBeat\0", js_pair_beat),
        method(b"crossApply\0", js_cross_apply),
        method(b"blockAdd\0", js_block_add),
        method(b"blockInner\0", js_block_inner),
        method(b"axpy\0", js_axpy),
        method(b"scale\0", js_scale),
        method(b"seaPiece\0", js_sea_piece),
        method(b"seaStream\0", js_sea_stream),
        method(b"phaseSum\0", js_phase_sum),
        method(b"holeOneBody\0", js_hole_one_body),
        method(b"holeBand\0", js_hole_band),
        method(b"holePair\0", js_hole_pair),
    ];

    if napi_define_properties(env, exports, fns.len(), fns.as_ptr()) != NAPI_OK {
        throw(env, "could not define the exports");
        return ptr::null_mut();
    }

    exports
}
