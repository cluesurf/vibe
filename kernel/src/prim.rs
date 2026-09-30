// THE KERNEL PRIMITIVES, the arithmetic. kernel/src/
// Each function is a line-for-line restatement of a loop in a TypeScript engine (named at each function), written so
// that every floating-point operation is the same operation, on the same operands, in the same order. JavaScript rounds
// every + - * to double and evaluates left to right, a + b - c * d as ((a + b) - (c * d)); Rust does the same, and never
// fuses a multiply into an add. So each output element is bitwise the reference's.
//
// Each primitive computes rows [start, end) and writes nothing outside them, so any split of the rows over threads gives
// the same bytes. Rules kept here:
//   no fused multiply-add (no mul_add, and rustc does not contract)
//   no reassociation: a row's terms are added in the reference's order (root by root, entry by entry), never as partial
//   sums unless the reference sums partials the same way
//   signed zeros: a zero test is == 0.0 (true for -0, as JavaScript's === is), and an addition is skipped only where the
//   reference skips it
//
// Everything is on raw pointers: the rows of one output are shared by several threads, each writing its own range, and
// the callers (node.rs, wasm.rs) check every length and index before a pointer reaches here.

pub const PAIR: usize = 64;
pub const SITE: usize = 256;
pub const NR: usize = 24;
pub const REG: usize = 8;
pub const MODES: usize = 192;
pub const FULL: usize = MODES * MODES;

// the gathered block convolution's static tables (code/measure/register-ball-reduced and register-reduced conv): a
// sector of `count` representatives, 24 roots, the neighbour's representative (or -1) and the group element that carries
// it, each element's signed index map per pair type (4 x 64), and the sparse 8 x 8 overlap per root, C then C^dag
pub struct PairOp {
    pub count: usize,
    pub elements: usize,
    pub plus_rep: *const i32,
    pub plus_g: *const i32,
    pub minus_rep: *const i32,
    pub minus_g: *const i32,
    pub src: *const i16,
    pub sgn: *const i8,
    pub off: *const i32,
    pub row: *const i8,
    pub col: *const i8,
    pub val: *const f64,
    pub off_t: *const i32,
    pub row_t: *const i8,
    pub col_t: *const i8,
    pub val_t: *const f64,
    pub half_re: [f64; 24],
    pub half_im: [f64; 24],
}

unsafe impl Send for PairOp {}
unsafe impl Sync for PairOp {}

// register-ball-reduced conv and register-reduced conv (one loop): out[i] = sum over roots d of C_d (or C_d^dag) on
// member 1 or 2, applied to the neighbour's source block read through the element's signed index map
#[allow(clippy::too_many_arguments)]
pub unsafe fn conv(
    op: &PairOp,
    src_re: *const f64,
    src_im: *const f64,
    src_off: usize,
    src_stride: usize,
    t: usize,
    out_re: *mut f64,
    out_im: *mut f64,
    member: i32,
    dagger: bool,
    start: usize,
    end: usize,
) {
    let use_plus = !((member == 1) != dagger);
    let rep_t = if use_plus { op.plus_rep } else { op.minus_rep };
    let g_t = if use_plus { op.plus_g } else { op.minus_g };
    let off = if dagger { op.off_t } else { op.off };
    let row = if dagger { op.row_t } else { op.row };
    let col = if dagger { op.col_t } else { op.col };
    let val = if dagger { op.val_t } else { op.val };
    let sg: f64 = if dagger { -1.0 } else { 1.0 };
    let mut tr = [0.0f64; PAIR];
    let mut ti = [0.0f64; PAIR];

    for k in start * PAIR..end * PAIR {
        *out_re.add(k) = 0.0;
        *out_im.add(k) = 0.0;
    }

    for i in start..end {
        let oo = i * PAIR;

        for d in 0..NR {
            let j = *rep_t.add(i * NR + d);

            if j < 0 {
                continue;
            }

            let base = ((*g_t.add(i * NR + d)) as usize * 4 + t) * PAIR;
            let src = op.src.add(base);
            let sgn = op.sgn.add(base);
            let so = j as usize * src_stride + src_off;

            for k in 0..PAIR {
                let f = *sgn.add(k) as f64;
                let at = so + *src.add(k) as usize;

                tr[k] = f * *src_re.add(at);
                ti[k] = f * *src_im.add(at);
            }

            let pr = op.half_re[d];
            let pi = sg * op.half_im[d];
            let q0 = *off.add(d) as usize;
            let q1 = *off.add(d + 1) as usize;

            for q in q0..q1 {
                let r = *row.add(q) as usize;
                let c = *col.add(q) as usize;
                let v = *val.add(q);
                let wr = v * pr;
                let wi = v * pi;

                if member == 1 {
                    let ob = oo + r * 8;
                    let sb = c * 8;

                    for r2 in 0..8 {
                        let xr = tr[sb + r2];
                        let xi = ti[sb + r2];
                        let o_re = out_re.add(ob + r2);
                        let o_im = out_im.add(ob + r2);

                        *o_re = *o_re + (wr * xr - wi * xi);
                        *o_im = *o_im + (wr * xi + wi * xr);
                    }
                } else {
                    for r1 in 0..8 {
                        let xr = tr[r1 * 8 + c];
                        let xi = ti[r1 * 8 + c];
                        let o_re = out_re.add(oo + r1 * 8 + r);
                        let o_im = out_im.add(oo + r1 * 8 + r);

                        *o_re = *o_re + (wr * xr - wi * xi);
                        *o_im = *o_im + (wr * xi + wi * xr);
                    }
                }
            }
        }
    }
}

// the site-local update of one beat (register-ball-reduced ballCycle, register-reduced beats). Beat 1: main block A,
// B from g, X from e, beta1; beat 2: main block D, B from e, X from g, beta2
pub struct Beat {
    pub t1r: *const f64,
    pub t1i: *const f64,
    pub t2r: *const f64,
    pub t2i: *const f64,
    pub fr: *const f64,
    pub fi: *const f64,
    pub qbr: *const f64,
    pub qbi: *const f64,
    pub qxr: *const f64,
    pub qxi: *const f64,
    pub beta: *const f64,
    pub alr: f64,
    pub ali: f64,
    pub main_off: usize,
}

unsafe impl Send for Beat {}
unsafe impl Sync for Beat {}

pub unsafe fn pair_beat(re: *mut f64, im: *mut f64, b: &Beat, start: usize, end: usize) {
    let (alr, ali) = (b.alr, b.ali);

    for i in start..end {
        let b1r = *b.beta.add(2 * i);
        let b1i = *b.beta.add(2 * i + 1);

        for k in 0..PAIR {
            let c = i * PAIR + k;
            let mi = i * SITE + b.main_off + k;
            let bi = i * SITE + 64 + k;
            let xi_ = i * SITE + 128 + k;
            let a_r = *re.add(mi);
            let a_i = *im.add(mi);
            let p1r = a_r + *b.t1r.add(c);
            let p1i = a_i + *b.t1i.add(c);
            let p2r = a_r + *b.t2r.add(c);
            let p2i = a_i + *b.t2i.add(c);
            let psr = p1r + *b.t2r.add(c) + *b.fr.add(c);
            let psi = p1i + *b.t2i.add(c) + *b.fi.add(c);

            *re.add(mi) = a_r + alr * (p1r + p2r) - ali * (p1i + p2i) + b1r * psr - b1i * psi;
            *im.add(mi) = a_i + alr * (p1i + p2i) + ali * (p1r + p2r) + b1r * psi + b1i * psr;

            let b_r = *re.add(bi);
            let b_i = *im.add(bi);
            let qbr = b_r + *b.qbr.add(c);
            let qbi = b_i + *b.qbi.add(c);

            *re.add(bi) = b_r + alr * qbr - ali * qbi;
            *im.add(bi) = b_i + alr * qbi + ali * qbr;

            let x_r = *re.add(xi_);
            let x_i = *im.add(xi_);
            let qxr = x_r + *b.qxr.add(c);
            let qxi = x_i + *b.qxi.add(c);

            *re.add(xi_) = x_r + alr * qxr - ali * qxi;
            *im.add(xi_) = x_i + alr * qxi + ali * qxr;
        }
    }
}

// register-reduced crossProjection then crossPiece, fused per representative (the projection at i reads only i's own
// block, and the piece writes only it): p = st[own] + t1 + t2 + t4, st[own] += cross p where cross is not 0
pub struct Cross {
    pub t1r: *const f64,
    pub t1i: *const f64,
    pub t2r: *const f64,
    pub t2i: *const f64,
    pub t4r: *const f64,
    pub t4i: *const f64,
    pub cross: *const f64,
    pub own: usize,
}

unsafe impl Send for Cross {}
unsafe impl Sync for Cross {}

pub unsafe fn cross_apply(re: *mut f64, im: *mut f64, x: &Cross, start: usize, end: usize) {
    for i in start..end {
        let cr = *x.cross.add(2 * i);
        let ci = *x.cross.add(2 * i + 1);

        if cr == 0.0 && ci == 0.0 {
            continue;
        }

        for k in 0..PAIR {
            let c = i * PAIR + k;
            let o = i * SITE + x.own + k;
            let xr = *re.add(o) + *x.t1r.add(c) + *x.t2r.add(c) + *x.t4r.add(c);
            let xi = *im.add(o) + *x.t1i.add(c) + *x.t2i.add(c) + *x.t4i.add(c);

            *re.add(o) = *re.add(o) + (cr * xr - ci * xi);
            *im.add(o) = *im.add(o) + (cr * xi + ci * xr);
        }
    }
}

// ballGram's add: out block `off` += f, per representative
pub unsafe fn block_add(
    out_re: *mut f64,
    out_im: *mut f64,
    fr: *const f64,
    fi: *const f64,
    off: usize,
    start: usize,
    end: usize,
) {
    for i in start..end {
        for k in 0..PAIR {
            let o = i * SITE + off + k;
            let c = i * PAIR + k;

            *out_re.add(o) = *out_re.add(o) + *fr.add(c);
            *out_im.add(o) = *out_im.add(o) + *fi.add(c);
        }
    }
}

// ballInner's local product per representative, (sr, si) = sum over its 256 entries of conj(a) b, in order (the caller
// sums orbit(i) (sr, si) over i in order)
#[allow(clippy::too_many_arguments)]
pub unsafe fn block_inner(
    a_re: *const f64,
    a_im: *const f64,
    b_re: *const f64,
    b_im: *const f64,
    part_re: *mut f64,
    part_im: *mut f64,
    start: usize,
    end: usize,
) {
    for i in start..end {
        let mut sr = 0.0f64;
        let mut si = 0.0f64;

        for k in i * SITE..(i + 1) * SITE {
            let xr = *a_re.add(k);
            let xi = *a_im.add(k);
            let yr = *b_re.add(k);
            let yi = *b_im.add(k);

            sr = sr + (xr * yr + xi * yi);
            si = si + (xr * yi - xi * yr);
        }

        *part_re.add(i) = sr;
        *part_im.add(i) = si;
    }
}

// axpyBall: y += (fr + i fi) x, entries [start, end)
#[allow(clippy::too_many_arguments)]
pub unsafe fn axpy(
    y_re: *mut f64,
    y_im: *mut f64,
    x_re: *const f64,
    x_im: *const f64,
    fr: f64,
    fi: f64,
    start: usize,
    end: usize,
) {
    for i in start..end {
        let r = *x_re.add(i);
        let m = *x_im.add(i);

        *y_re.add(i) = *y_re.add(i) + (fr * r - fi * m);
        *y_im.add(i) = *y_im.add(i) + (fr * m + fi * r);
    }
}

// scaleBall: st *= f, entries [start, end)
pub unsafe fn scale(re: *mut f64, im: *mut f64, f: f64, start: usize, end: usize) {
    for i in start..end {
        *re.add(i) = *re.add(i) * f;
        *im.add(i) = *im.add(i) * f;
    }
}

// register-sea sectorPiece, with seaBeat's `whole` phase first when `phase` is not null, docks [start, end): psi <- psi +
// alpha (Q psi + psi Q) + beta Q psi Q, Q = E E^T, alpha and beta per dock
#[allow(clippy::too_many_arguments)]
pub unsafe fn sea_piece(
    re: *mut f64,
    im: *mut f64,
    e: *const f64,
    alpha: *const f64,
    beta: *const f64,
    phase: *const f64,
    start: usize,
    end: usize,
) {
    let mut lr = vec![0.0f64; REG * MODES];
    let mut li = vec![0.0f64; REG * MODES];
    let mut rr = vec![0.0f64; MODES * REG];
    let mut ri = vec![0.0f64; MODES * REG];
    let mut gr = [0.0f64; REG];
    let mut gi = [0.0f64; REG];
    let ew = |k: usize| -> f64 { *e.add(k) };

    for dock in start..end {
        let off = dock * FULL;

        if !phase.is_null() {
            let c = *phase.add(2 * dock);
            let sn = *phase.add(2 * dock + 1);

            for k in 0..FULL {
                let xr = *re.add(off + k);
                let xi = *im.add(off + k);

                *re.add(off + k) = c * xr - sn * xi;
                *im.add(off + k) = c * xi + sn * xr;
            }
        }

        lr.iter_mut().for_each(|x| *x = 0.0);
        li.iter_mut().for_each(|x| *x = 0.0);
        rr.iter_mut().for_each(|x| *x = 0.0);
        ri.iter_mut().for_each(|x| *x = 0.0);
        let mut cr_ = [0.0f64; REG * REG];
        let mut ci_ = [0.0f64; REG * REG];

        for s1 in 0..MODES {
            let o = off + s1 * MODES;

            for eta in 0..REG {
                let w = ew(s1 * REG + eta);

                if w == 0.0 {
                    continue;
                }

                let lo = eta * MODES;

                for s2 in 0..MODES {
                    lr[lo + s2] = lr[lo + s2] + w * *re.add(o + s2);
                    li[lo + s2] = li[lo + s2] + w * *im.add(o + s2);
                }
            }

            for s2 in 0..MODES {
                let xr = *re.add(o + s2);
                let xi = *im.add(o + s2);

                if xr == 0.0 && xi == 0.0 {
                    continue;
                }

                for eta in 0..REG {
                    let w = ew(s2 * REG + eta);

                    rr[s1 * REG + eta] = rr[s1 * REG + eta] + w * xr;
                    ri[s1 * REG + eta] = ri[s1 * REG + eta] + w * xi;
                }
            }
        }

        for eta in 0..REG {
            for s2 in 0..MODES {
                let xr = lr[eta * MODES + s2];
                let xi = li[eta * MODES + s2];

                for z in 0..REG {
                    let w = ew(s2 * REG + z);

                    cr_[eta * REG + z] = cr_[eta * REG + z] + w * xr;
                    ci_[eta * REG + z] = ci_[eta * REG + z] + w * xi;
                }
            }
        }

        let ar = *alpha.add(2 * dock);
        let ai = *alpha.add(2 * dock + 1);
        let br = *beta.add(2 * dock);
        let bi = *beta.add(2 * dock + 1);

        for s1 in 0..MODES {
            for z in 0..REG {
                let mut cr = 0.0f64;
                let mut ci = 0.0f64;

                for eta in 0..REG {
                    let w = ew(s1 * REG + eta);

                    cr = cr + w * cr_[eta * REG + z];
                    ci = ci + w * ci_[eta * REG + z];
                }

                let rrv = rr[s1 * REG + z];
                let riv = ri[s1 * REG + z];

                gr[z] = ar * rrv - ai * riv + br * cr - bi * ci;
                gi[z] = ar * riv + ai * rrv + br * ci + bi * cr;
            }

            let o = off + s1 * MODES;

            for s2 in 0..MODES {
                let mut sr = 0.0f64;
                let mut si = 0.0f64;

                for eta in 0..REG {
                    let w1 = ew(s1 * REG + eta);
                    let w2 = ew(s2 * REG + eta);

                    if w1 != 0.0 {
                        let l_r = lr[eta * MODES + s2];
                        let l_i = li[eta * MODES + s2];

                        sr = sr + w1 * (ar * l_r - ai * l_i);
                        si = si + w1 * (ar * l_i + ai * l_r);
                    }

                    if w2 != 0.0 {
                        sr = sr + w2 * gr[eta];
                        si = si + w2 * gi[eta];
                    }
                }

                *re.add(o + s2) = *re.add(o + s2) + sr;
                *im.add(o + s2) = *im.add(o + s2) + si;
            }
        }
    }
}

// register-sea seaBeat's swap coin and stream, source docks [start, end). For each (d, e) the move is a bijection of
// docks, so two source docks never write one destination
#[allow(clippy::too_many_arguments)]
pub unsafe fn sea_stream(
    s_re: *const f64,
    s_im: *const f64,
    o_re: *mut f64,
    o_im: *mut f64,
    mv: *const i32,
    opposite: *const i32,
    start: usize,
    end: usize,
) {
    for i in start..end {
        for d in 0..NR {
            let from1 = *opposite.add(d) as usize;

            for e in 0..NR {
                let j = *mv.add(i * NR * NR + d * NR + e) as usize;
                let from2 = *opposite.add(e) as usize;

                for a in 0..REG {
                    let src = i * FULL + (from1 * REG + a) * MODES + from2 * REG;
                    let dst = j * FULL + (d * REG + a) * MODES + e * REG;

                    std::ptr::copy_nonoverlapping(s_re.add(src), o_re.add(dst), REG);
                    std::ptr::copy_nonoverlapping(s_im.add(src), o_im.add(dst), REG);
                }
            }
        }
    }
}

// register-sea pairAt's sum over docks, entries [start, end) of a block of `width`: M[k] = sum_i (c_i + i s_i) psi_i[k],
// zero entries skipped as the reference skips them
#[allow(clippy::too_many_arguments)]
pub unsafe fn phase_sum(
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
    for k in start..end {
        *m_re.add(k) = 0.0;
        *m_im.add(k) = 0.0;
    }

    for i in 0..docks {
        let ci = *c.add(i);
        let sn = *s.add(i);
        let o = i * width;

        for k in start..end {
            let xr = *re.add(o + k);
            let xi = *im.add(o + k);

            if xr == 0.0 && xi == 0.0 {
                continue;
            }

            *m_re.add(k) = *m_re.add(k) + (ci * xr - sn * xi);
            *m_im.add(k) = *m_im.add(k) + (ci * xi + sn * xr);
        }
    }
}
