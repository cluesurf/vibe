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
    for i in start..end {
        let oo = i * PAIR;
        // a row's 64 outputs are accumulated in locals (which cannot alias the source), starting from +0.0 as the
        // reference's fill(0) does and taking the same additions in the same order, then stored once
        let mut acc_re = [0.0f64; PAIR];
        let mut acc_im = [0.0f64; PAIR];

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
                    let ob = r * 8;
                    let sb = c * 8;

                    for r2 in 0..8 {
                        let xr = tr[sb + r2];
                        let xi = ti[sb + r2];

                        acc_re[ob + r2] = acc_re[ob + r2] + (wr * xr - wi * xi);
                        acc_im[ob + r2] = acc_im[ob + r2] + (wr * xi + wi * xr);
                    }
                } else {
                    for r1 in 0..8 {
                        let xr = tr[r1 * 8 + c];
                        let xi = ti[r1 * 8 + c];

                        acc_re[r1 * 8 + r] = acc_re[r1 * 8 + r] + (wr * xr - wi * xi);
                        acc_im[r1 * 8 + r] = acc_im[r1 * 8 + r] + (wr * xi + wi * xr);
                    }
                }
            }
        }

        std::ptr::copy_nonoverlapping(acc_re.as_ptr(), out_re.add(oo), PAIR);
        std::ptr::copy_nonoverlapping(acc_im.as_ptr(), out_im.add(oo), PAIR);
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

// ---- register-holes (code/measure/register-holes, and the sorted store of code/measure/register-sorted-holes) ----

// the largest fiber a member may have (both halves, 16)
pub const HOLE_FIBER_MAX: usize = 16;

// register-holes oneBody, tuples [start, end): member by member, the member's fiber index times the transfer of its
// momentum class, a[j * f * f + r * f + k], zero entries skipped as the reference skips them. A row is a tuple's block of
// f^n amplitudes, which the loop reads and writes and nothing else
#[allow(clippy::too_many_arguments)]
pub unsafe fn hole_one_body(
    re: *mut f64,
    im: *mut f64,
    mom: *const i32,
    n: usize,
    f: usize,
    a_re: *const f64,
    a_im: *const f64,
    start: usize,
    end: usize,
) {
    let block = f.pow(n as u32);
    let mut xr = [0.0f64; HOLE_FIBER_MAX];
    let mut xi = [0.0f64; HOLE_FIBER_MAX];

    for t in start..end {
        let off = t * block;

        for i in 0..n {
            let a = *mom.add(t * n + i) as usize * f * f;
            let st = f.pow((n - 1 - i) as u32);
            let outer = f.pow(i as u32);

            for hi in 0..outer {
                for lo in 0..st {
                    let base = off + hi * f * st + lo;

                    for k in 0..f {
                        xr[k] = *re.add(base + k * st);
                        xi[k] = *im.add(base + k * st);
                    }

                    for r in 0..f {
                        let mut yr = 0.0f64;
                        let mut yi = 0.0f64;
                        let ro = a + r * f;

                        for k in 0..f {
                            let ar = *a_re.add(ro + k);
                            let ai = *a_im.add(ro + k);

                            if ar == 0.0 && ai == 0.0 {
                                continue;
                            }

                            yr = yr + (ar * xr[k] - ai * xi[k]);
                            yi = yi + (ar * xi[k] + ai * xr[k]);
                        }

                        *re.add(base + r * st) = yr;
                        *im.add(base + r * st) = yi;
                    }
                }
            }
        }
    }
}

// register-holes bandWeights' local sum, tuples [start, end): part[t * n + i] = the weight of member i of tuple t in the
// band projector of its momentum class, |P x|^2 summed over the other members' indices in the reference's order. The sum
// over tuples into each (member, class) is finished in TypeScript, in tuple order
#[allow(clippy::too_many_arguments)]
pub unsafe fn hole_band(
    re: *const f64,
    im: *const f64,
    mom: *const i32,
    n: usize,
    f: usize,
    p_re: *const f64,
    p_im: *const f64,
    part: *mut f64,
    start: usize,
    end: usize,
) {
    let block = f.pow(n as u32);
    let mut yr = [0.0f64; HOLE_FIBER_MAX];
    let mut yi = [0.0f64; HOLE_FIBER_MAX];

    for t in start..end {
        let off = t * block;

        for i in 0..n {
            let p = *mom.add(t * n + i) as usize * f * f;
            let st = f.pow((n - 1 - i) as u32);
            let outer = f.pow(i as u32);
            let mut w = 0.0f64;

            for hi in 0..outer {
                for lo in 0..st {
                    let base = off + hi * f * st + lo;

                    for r in 0..f {
                        let mut ar = 0.0f64;
                        let mut ai = 0.0f64;

                        for k in 0..f {
                            let pr = *p_re.add(p + r * f + k);
                            let pi = *p_im.add(p + r * f + k);
                            let xr = *re.add(base + k * st);
                            let xi = *im.add(base + k * st);

                            ar = ar + (pr * xr - pi * xi);
                            ai = ai + (pr * xi + pi * xr);
                        }

                        yr[r] = ar;
                        yi[r] = ai;
                    }

                    for r in 0..f {
                        w = w + (yr[r] * yr[r] + yi[r] * yi[r]);
                    }
                }
            }

            *part.add(t * n + i) = w;
        }
    }
}

// the D4 torus Fourier transform's tables (register-holes torusFourier): L, the N classes and sites, the G = L^4 grid,
// the class of every grid momentum, the grid index of every site and every class's representative, cos and sin of
// 2 pi m / L, and the two unitary scales (1 / (2 sqrt N) to sites, 1 / sqrt N to classes), computed in TypeScript
pub struct HoleFourier {
    pub l: usize,
    pub n: usize,
    pub g: usize,
    pub class_of_grid: *const i32,
    pub grid_of_site: *const i32,
    pub grid_of_class: *const i32,
    pub cos: *const f64,
    pub sin: *const f64,
    pub k_sites: f64,
    pub k_classes: f64,
}

unsafe impl Send for HoleFourier {}
unsafe impl Sync for HoleFourier {}

// the pair piece's tables. A row is an ORBIT: a set of fiber indices whose full-momentum column is one function. The
// dense engine's orbit is one fiber index (nperm 1, every map the identity); the sorted store's is a fiber tuple and its
// member permutations. Gather: column[t] = psign[p] * state[row_of[t] * block + fb_of[orbit * nperm + p]], p = perm_of[t].
// Then the transform to sites on every axis, the phase (cos, sin) of the orbit's sector pattern at every site tuple
// unless skip, the transform back, and the scatter: for each (c, tau) of the orbit's write list and every stored row r,
// state[r * block + c] = psign[tau] * column[t_of[r * nperm + tau]]
pub struct HolePair {
    pub block: usize,
    pub tuples: usize,
    pub axes: usize,
    pub rows: usize,
    pub nperm: usize,
    pub row_of: *const i32,
    pub perm_of: *const i32,
    pub psign: *const i32,
    pub fb_of: *const i32,
    pub pattern: *const i32,
    pub write_off: *const i32,
    pub write_c: *const i32,
    pub write_tau: *const i32,
    pub t_of: *const i32,
    pub cos: *const f64,
    pub sin: *const f64,
    pub skip: *const i8,
}

unsafe impl Send for HolePair {}
unsafe impl Sync for HolePair {}

// register-holes dft4d: the 4d DFT on the L^4 grid in place, x(m) <- sum_n x(n) e^(sign 2 pi i m . n / L), the radix-4
// butterfly at L = 4 and the direct sum otherwise, operation for operation
#[allow(clippy::too_many_arguments)]
fn dft4d(fo: &HoleFourier, re: &mut [f64], im: &mut [f64], sign: f64, sr: &mut [f64], si: &mut [f64]) {
    let l = fo.l;
    let cos = unsafe { std::slice::from_raw_parts(fo.cos, l) };
    let sin = unsafe { std::slice::from_raw_parts(fo.sin, l) };

    for axis in 0..4u32 {
        let st = l.pow(3 - axis);
        let outer = l.pow(axis);

        for o in 0..outer {
            for lo in 0..st {
                let base = o * l * st + lo;

                if l == 4 {
                    // the grid is l^4 = 256 entries and base + 3 st < 256 for every (axis, o, lo), so the reads are in
                    // bounds without a check (the slices were made from G entries by the caller)
                    unsafe {
                        let r = re.as_mut_ptr();
                        let m = im.as_mut_ptr();
                        let i0 = base;
                        let i1 = base + st;
                        let i2 = base + 2 * st;
                        let i3 = base + 3 * st;
                        let a0r = *r.add(i0) + *r.add(i2);
                        let a0i = *m.add(i0) + *m.add(i2);
                        let a1r = *r.add(i0) - *r.add(i2);
                        let a1i = *m.add(i0) - *m.add(i2);
                        let b0r = *r.add(i1) + *r.add(i3);
                        let b0i = *m.add(i1) + *m.add(i3);
                        let b1r = *r.add(i1) - *r.add(i3);
                        let b1i = *m.add(i1) - *m.add(i3);

                        *r.add(i0) = a0r + b0r;
                        *m.add(i0) = a0i + b0i;
                        *r.add(i2) = a0r - b0r;
                        *m.add(i2) = a0i - b0i;
                        *r.add(i1) = a1r - sign * b1i;
                        *m.add(i1) = a1i + sign * b1r;
                        *r.add(i3) = a1r + sign * b1i;
                        *m.add(i3) = a1i - sign * b1r;
                    }
                    continue;
                }

                for m in 0..l {
                    let mut r = 0.0f64;
                    let mut q = 0.0f64;

                    for nn in 0..l {
                        let k = (m * nn) % l;
                        let c = cos[k];
                        let s = sign * sin[k];
                        let xr = re[base + nn * st];
                        let xi = im[base + nn * st];

                        r = r + (c * xr - s * xi);
                        q = q + (c * xi + s * xr);
                    }

                    sr[m] = r;
                    si[m] = q;
                }

                for m in 0..l {
                    re[base + m * st] = sr[m];
                    im[base + m * st] = si[m];
                }
            }
        }
    }
}

// the scratch one thread needs for a pair piece
struct HoleScratch {
    br: Vec<f64>,
    bi: Vec<f64>,
    lr: Vec<f64>,
    li: Vec<f64>,
    gr: Vec<f64>,
    gi: Vec<f64>,
    sr: Vec<f64>,
    si: Vec<f64>,
}

// register-holes toSites (dir 1) and toClasses (dir -1) on the line lr, li (N entries), in place
//
// Indices are read unchecked here: the caller checked every class_of_grid entry below N and every grid index below G,
// the grid scratch holds G entries and the line N
fn hole_line(fo: &HoleFourier, x: &mut HoleScratch, dir: i32) {
    unsafe {
        let (lr, li) = (x.lr.as_mut_ptr(), x.li.as_mut_ptr());
        let (gr, gi) = (x.gr.as_mut_ptr(), x.gi.as_mut_ptr());

        if dir == 1 {
            for g in 0..fo.g {
                let j = *fo.class_of_grid.add(g) as usize;

                *gr.add(g) = *lr.add(j);
                *gi.add(g) = *li.add(j);
            }

            dft4d(fo, &mut x.gr, &mut x.gi, 1.0, &mut x.sr, &mut x.si);

            let k = fo.k_sites;

            for i in 0..fo.n {
                let g = *fo.grid_of_site.add(i) as usize;

                *lr.add(i) = *gr.add(g) * k;
                *li.add(i) = *gi.add(g) * k;
            }
        } else {
            x.gr.fill(0.0);
            x.gi.fill(0.0);

            for i in 0..fo.n {
                let g = *fo.grid_of_site.add(i) as usize;

                *gr.add(g) = *lr.add(i);
                *gi.add(g) = *li.add(i);
            }

            dft4d(fo, &mut x.gr, &mut x.gi, -1.0, &mut x.sr, &mut x.si);

            let k = fo.k_classes;

            for j in 0..fo.n {
                let g = *fo.grid_of_class.add(j) as usize;

                *lr.add(j) = *gr.add(g) * k;
                *li.add(j) = *gi.add(g) * k;
            }
        }
    }
}

// register-holes transformAxis: one axis of the N^axes column between classes and sites (base + k st < N^axes, the
// column's length)
fn hole_axis(fo: &HoleFourier, x: &mut HoleScratch, axes: usize, a: usize, dir: i32) {
    let n = fo.n;
    let st = n.pow((axes - 1 - a) as u32);
    let outer = n.pow(a as u32);

    for o in 0..outer {
        for lo in 0..st {
            let base = o * n * st + lo;

            unsafe {
                let (br, bi) = (x.br.as_ptr(), x.bi.as_ptr());
                let (lr, li) = (x.lr.as_mut_ptr(), x.li.as_mut_ptr());

                for k in 0..n {
                    *lr.add(k) = *br.add(base + k * st);
                    *li.add(k) = *bi.add(base + k * st);
                }
            }

            hole_line(fo, x, dir);

            unsafe {
                let (br, bi) = (x.br.as_mut_ptr(), x.bi.as_mut_ptr());
                let (lr, li) = (x.lr.as_ptr(), x.li.as_ptr());

                for k in 0..n {
                    *br.add(base + k * st) = *lr.add(k);
                    *bi.add(base + k * st) = *li.add(k);
                }
            }
        }
    }
}

// register-holes pairPhases (and the sorted store's), orbits [start, end): gather an orbit's full-momentum column, to
// sites axis by axis, the phase, back to classes, scatter. An orbit reads and writes only its own fiber indices, so
// orbits are independent rows
pub unsafe fn hole_pair(re: *mut f64, im: *mut f64, fo: &HoleFourier, hp: &HolePair, start: usize, end: usize) {
    let tuples = hp.tuples;
    let mut x = HoleScratch {
        br: vec![0.0; tuples],
        bi: vec![0.0; tuples],
        lr: vec![0.0; fo.n],
        li: vec![0.0; fo.n],
        gr: vec![0.0; fo.g],
        gi: vec![0.0; fo.g],
        sr: vec![0.0; fo.l],
        si: vec![0.0; fo.l],
    };

    for o in start..end {
        let fbs = hp.fb_of.add(o * hp.nperm);

        // the gather, row by row so the state is read one row's block at a time: tuple t is reached from its own row
        // and its own permutation, t = t_of[row_of[t] * nperm + perm_of[t]] (checked by the caller), and from no other
        // (row, permutation) whose permutation is t's, so every entry of the column is assigned exactly once
        for r in 0..hp.rows {
            let rb = r * hp.block;

            for p in 0..hp.nperm {
                let t = *hp.t_of.add(r * hp.nperm + p) as usize;

                if *hp.perm_of.add(t) as usize != p {
                    continue;
                }

                let at = rb + *fbs.add(p) as usize;

                if *hp.psign.add(p) < 0 {
                    x.br[t] = -*re.add(at);
                    x.bi[t] = -*im.add(at);
                } else {
                    x.br[t] = *re.add(at);
                    x.bi[t] = *im.add(at);
                }
            }
        }

        for a in 0..hp.axes {
            hole_axis(fo, &mut x, hp.axes, a, 1);
        }

        let pat = *hp.pattern.add(o) as usize * tuples;

        for t in 0..tuples {
            if *hp.skip.add(pat + t) != 0 {
                continue;
            }

            let c = *hp.cos.add(pat + t);
            let sn = *hp.sin.add(pat + t);
            let xr = x.br[t];
            let xi = x.bi[t];

            x.br[t] = c * xr - sn * xi;
            x.bi[t] = c * xi + sn * xr;
        }

        for a in 0..hp.axes {
            hole_axis(fo, &mut x, hp.axes, a, -1);
        }

        let w0 = *hp.write_off.add(o) as usize;
        let w1 = *hp.write_off.add(o + 1) as usize;

        // the scatter, row by row (each (row, c) is written once, so the order is free)
        for r in 0..hp.rows {
            let rb = r * hp.block;

            for w in w0..w1 {
                let c = *hp.write_c.add(w) as usize;
                let tau = *hp.write_tau.add(w) as usize;
                let t = *hp.t_of.add(r * hp.nperm + tau) as usize;
                let at = rb + c;

                if *hp.psign.add(tau) < 0 {
                    *re.add(at) = -x.br[t];
                    *im.add(at) = -x.bi[t];
                } else {
                    *re.add(at) = x.br[t];
                    *im.add(at) = x.bi[t];
                }
            }
        }
    }
}
