// THE KERNEL'S js BACKEND, the reference. code/kernel/
// Each primitive is the engine's own loop, restated with the tables flattened (code/measure/register-ball-reduced conv
// and ballCycle, register-reduced beats and crossPiece, register-sea sectorPiece, seaBeat's stream and pairAt), the same
// operations in the same order. The equivalence check (task/kernel/check.ts) holds this backend to the engines
// themselves, and every other backend to this one, byte for byte.

import type { Kernel, PairOp, PairTables } from '@/code/kernel/types'

const PAIR = 64
const SITE = 256
const NR = 24
const REG = 8
const MODES = 192
const FULL = MODES * MODES

export function jsConv(
  tb: PairTables,
  srcRe: Float64Array,
  srcIm: Float64Array,
  srcOff: number,
  srcStride: number,
  t: number,
  outRe: Float64Array,
  outIm: Float64Array,
  member: 1 | 2,
  dagger: boolean,
): void {
  const N = tb.plusRep.length / NR
  const usePlus = !((member === 1) !== dagger)
  const repT = usePlus ? tb.plusRep : tb.minusRep
  const gT = usePlus ? tb.plusG : tb.minusG
  const off = dagger ? tb.offT : tb.off
  const row = dagger ? tb.rowT : tb.row
  const col = dagger ? tb.colT : tb.col
  const val = dagger ? tb.valT : tb.val
  const sg = dagger ? -1 : 1
  const tr = new Float64Array(PAIR)
  const ti = new Float64Array(PAIR)

  outRe.fill(0, 0, N * PAIR)
  outIm.fill(0, 0, N * PAIR)

  for (let i = 0; i < N; i++) {
    const oo = i * PAIR

    for (let d = 0; d < NR; d++) {
      const j = repT[i * NR + d]!

      if (j < 0) {
        continue
      }

      const base = (gT[i * NR + d]! * 4 + t) * PAIR
      const so = j * srcStride + srcOff

      for (let k = 0; k < PAIR; k++) {
        const f = tb.sgn[base + k]!
        const at = so + tb.src[base + k]!

        tr[k] = f * srcRe[at]!
        ti[k] = f * srcIm[at]!
      }

      const pr = tb.halfRe[d]!
      const pi = sg * tb.halfIm[d]!

      for (let q = off[d]!; q < off[d + 1]!; q++) {
        const r = row[q]!
        const c = col[q]!
        const v = val[q]!
        const wr = v * pr
        const wi = v * pi

        if (member === 1) {
          const ob = oo + r * 8
          const sb = c * 8

          for (let r2 = 0; r2 < 8; r2++) {
            const xr = tr[sb + r2]!
            const xi = ti[sb + r2]!

            outRe[ob + r2]! += wr * xr - wi * xi
            outIm[ob + r2]! += wr * xi + wi * xr
          }
        } else {
          for (let r1 = 0; r1 < 8; r1++) {
            const xr = tr[r1 * 8 + c]!
            const xi = ti[r1 * 8 + c]!

            outRe[oo + r1 * 8 + r]! += wr * xr - wi * xi
            outIm[oo + r1 * 8 + r]! += wr * xi + wi * xr
          }
        }
      }
    }
  }
}

export function jsPairBeat(
  re: Float64Array,
  im: Float64Array,
  t1r: Float64Array,
  t1i: Float64Array,
  t2r: Float64Array,
  t2i: Float64Array,
  fr: Float64Array,
  fi: Float64Array,
  qBr: Float64Array,
  qBi: Float64Array,
  qXr: Float64Array,
  qXi: Float64Array,
  beta: Float64Array,
  alr: number,
  ali: number,
  mainOff: number,
): void {
  const N = beta.length / 2

  for (let i = 0; i < N; i++) {
    const b1r = beta[2 * i]!
    const b1i = beta[2 * i + 1]!

    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k
      const Mi = i * SITE + mainOff + k
      const Bi = i * SITE + 64 + k
      const Xi = i * SITE + 128 + k
      const aR = re[Mi]!
      const aI = im[Mi]!
      const p1r = aR + t1r[c]!
      const p1i = aI + t1i[c]!
      const p2r = aR + t2r[c]!
      const p2i = aI + t2i[c]!
      const psr = p1r + t2r[c]! + fr[c]!
      const psi = p1i + t2i[c]! + fi[c]!

      re[Mi] = aR + alr * (p1r + p2r) - ali * (p1i + p2i) + b1r * psr - b1i * psi
      im[Mi] = aI + alr * (p1i + p2i) + ali * (p1r + p2r) + b1r * psi + b1i * psr

      const bR = re[Bi]!
      const bI = im[Bi]!
      const qbr = bR + qBr[c]!
      const qbi = bI + qBi[c]!

      re[Bi] = bR + alr * qbr - ali * qbi
      im[Bi] = bI + alr * qbi + ali * qbr

      const xR = re[Xi]!
      const xI = im[Xi]!
      const qxr = xR + qXr[c]!
      const qxi = xI + qXi[c]!

      re[Xi] = xR + alr * qxr - ali * qxi
      im[Xi] = xI + alr * qxi + ali * qxr
    }
  }
}

export function jsCrossApply(
  re: Float64Array,
  im: Float64Array,
  t1r: Float64Array,
  t1i: Float64Array,
  t2r: Float64Array,
  t2i: Float64Array,
  t4r: Float64Array,
  t4i: Float64Array,
  cross: Float64Array,
  own: number,
): void {
  const N = cross.length / 2

  for (let i = 0; i < N; i++) {
    const cr = cross[2 * i]!
    const ci = cross[2 * i + 1]!

    if (cr === 0 && ci === 0) {
      continue
    }

    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k
      const o = i * SITE + own + k
      const xr = re[o]! + t1r[c]! + t2r[c]! + t4r[c]!
      const xi = im[o]! + t1i[c]! + t2i[c]! + t4i[c]!

      re[o]! += cr * xr - ci * xi
      im[o]! += cr * xi + ci * xr
    }
  }
}

export function jsBlockAdd(outRe: Float64Array, outIm: Float64Array, fr: Float64Array, fi: Float64Array, off: number): void {
  const N = outRe.length / SITE

  for (let i = 0; i < N; i++) {
    for (let k = 0; k < PAIR; k++) {
      outRe[i * SITE + off + k]! += fr[i * PAIR + k]!
      outIm[i * SITE + off + k]! += fi[i * PAIR + k]!
    }
  }
}

export function jsBlockInner(
  aRe: Float64Array,
  aIm: Float64Array,
  bRe: Float64Array,
  bIm: Float64Array,
  partRe: Float64Array,
  partIm: Float64Array,
): void {
  for (let i = 0; i < partRe.length; i++) {
    let sr = 0
    let si = 0

    for (let k = i * SITE; k < (i + 1) * SITE; k++) {
      const xr = aRe[k]!
      const xi = aIm[k]!
      const yr = bRe[k]!
      const yi = bIm[k]!

      sr += xr * yr + xi * yi
      si += xr * yi - xi * yr
    }

    partRe[i] = sr
    partIm[i] = si
  }
}

export function jsAxpy(yRe: Float64Array, yIm: Float64Array, xRe: Float64Array, xIm: Float64Array, fr: number, fi: number): void {
  for (let i = 0; i < yRe.length; i++) {
    const r = xRe[i]!
    const m = xIm[i]!

    yRe[i]! += fr * r - fi * m
    yIm[i]! += fr * m + fi * r
  }
}

export function jsScale(re: Float64Array, im: Float64Array, f: number): void {
  for (let i = 0; i < re.length; i++) {
    re[i]! *= f
    im[i]! *= f
  }
}

// register-sea sectorPiece at one dock, with seaBeat's `whole` phase first when phase is given
function seaPieceAt(
  re: Float64Array,
  im: Float64Array,
  off: number,
  E: Float64Array,
  ar: number,
  ai: number,
  br: number,
  bi: number,
  phase: readonly [number, number] | null,
): void {
  if (phase) {
    const [c, sn] = phase

    for (let k = 0; k < FULL; k++) {
      const xr = re[off + k]!
      const xi = im[off + k]!

      re[off + k] = c * xr - sn * xi
      im[off + k] = c * xi + sn * xr
    }
  }

  const Lr = new Float64Array(REG * MODES)
  const Li = new Float64Array(REG * MODES)
  const Rr = new Float64Array(MODES * REG)
  const Ri = new Float64Array(MODES * REG)

  for (let s1 = 0; s1 < MODES; s1++) {
    const o = off + s1 * MODES

    for (let eta = 0; eta < REG; eta++) {
      const w = E[s1 * REG + eta]!

      if (w === 0) {
        continue
      }

      const lo = eta * MODES

      for (let s2 = 0; s2 < MODES; s2++) {
        Lr[lo + s2]! += w * re[o + s2]!
        Li[lo + s2]! += w * im[o + s2]!
      }
    }

    for (let s2 = 0; s2 < MODES; s2++) {
      const xr = re[o + s2]!
      const xi = im[o + s2]!

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let eta = 0; eta < REG; eta++) {
        const w = E[s2 * REG + eta]!

        Rr[s1 * REG + eta]! += w * xr
        Ri[s1 * REG + eta]! += w * xi
      }
    }
  }

  const Cr = new Float64Array(REG * REG)
  const Ci = new Float64Array(REG * REG)

  for (let eta = 0; eta < REG; eta++) {
    for (let s2 = 0; s2 < MODES; s2++) {
      const xr = Lr[eta * MODES + s2]!
      const xi = Li[eta * MODES + s2]!

      for (let z = 0; z < REG; z++) {
        const w = E[s2 * REG + z]!

        Cr[eta * REG + z]! += w * xr
        Ci[eta * REG + z]! += w * xi
      }
    }
  }

  const gr = new Float64Array(REG)
  const gi = new Float64Array(REG)

  for (let s1 = 0; s1 < MODES; s1++) {
    for (let z = 0; z < REG; z++) {
      let cr = 0
      let ci = 0

      for (let eta = 0; eta < REG; eta++) {
        const w = E[s1 * REG + eta]!

        cr += w * Cr[eta * REG + z]!
        ci += w * Ci[eta * REG + z]!
      }

      const rr = Rr[s1 * REG + z]!
      const ri = Ri[s1 * REG + z]!

      gr[z] = ar * rr - ai * ri + br * cr - bi * ci
      gi[z] = ar * ri + ai * rr + br * ci + bi * cr
    }

    const o = off + s1 * MODES

    for (let s2 = 0; s2 < MODES; s2++) {
      let sr = 0
      let si = 0

      for (let eta = 0; eta < REG; eta++) {
        const w1 = E[s1 * REG + eta]!
        const w2 = E[s2 * REG + eta]!

        if (w1 !== 0) {
          const lr = Lr[eta * MODES + s2]!
          const li = Li[eta * MODES + s2]!

          sr += w1 * (ar * lr - ai * li)
          si += w1 * (ar * li + ai * lr)
        }

        if (w2 !== 0) {
          sr += w2 * gr[eta]!
          si += w2 * gi[eta]!
        }
      }

      re[o + s2]! += sr
      im[o + s2]! += si
    }
  }
}

export function jsSeaPiece(
  re: Float64Array,
  im: Float64Array,
  E: Float64Array,
  alpha: Float64Array,
  beta: Float64Array,
  phase: Float64Array | null,
): void {
  const docks = alpha.length / 2

  for (let i = 0; i < docks; i++) {
    seaPieceAt(
      re,
      im,
      i * FULL,
      E,
      alpha[2 * i]!,
      alpha[2 * i + 1]!,
      beta[2 * i]!,
      beta[2 * i + 1]!,
      phase ? [phase[2 * i]!, phase[2 * i + 1]!] : null,
    )
  }
}

export function jsSeaStream(
  sRe: Float64Array,
  sIm: Float64Array,
  oRe: Float64Array,
  oIm: Float64Array,
  move: Int32Array,
  opposite: Int32Array,
): void {
  const N = sRe.length / FULL

  for (let i = 0; i < N; i++) {
    for (let d = 0; d < NR; d++) {
      const from1 = opposite[d]!

      for (let e = 0; e < NR; e++) {
        const j = move[i * NR * NR + d * NR + e]!
        const from2 = opposite[e]!

        for (let a = 0; a < REG; a++) {
          const src = i * FULL + (from1 * REG + a) * MODES + from2 * REG
          const dst = j * FULL + (d * REG + a) * MODES + e * REG

          for (let b = 0; b < REG; b++) {
            oRe[dst + b] = sRe[src + b]!
            oIm[dst + b] = sIm[src + b]!
          }
        }
      }
    }
  }
}

export function jsPhaseSum(
  re: Float64Array,
  im: Float64Array,
  c: Float64Array,
  s: Float64Array,
  width: number,
  mRe: Float64Array,
  mIm: Float64Array,
): void {
  mRe.fill(0)
  mIm.fill(0)

  for (let i = 0; i < c.length; i++) {
    const ci = c[i]!
    const sn = s[i]!
    const o = i * width

    for (let k = 0; k < width; k++) {
      const xr = re[o + k]!
      const xi = im[o + k]!

      if (xr === 0 && xi === 0) {
        continue
      }

      mRe[k]! += ci * xr - sn * xi
      mIm[k]! += ci * xi + sn * xr
    }
  }
}

export function jsKernel(): Kernel {
  return {
    backend: 'js',
    threads: 1,
    pairOp: (tables: PairTables): PairOp => ({ count: tables.plusRep.length / NR, tables }),
    conv: (op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger) =>
      jsConv(op.tables, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger),
    pairBeat: jsPairBeat,
    crossApply: jsCrossApply,
    blockAdd: jsBlockAdd,
    blockInner: jsBlockInner,
    axpy: jsAxpy,
    scale: jsScale,
    seaPiece: jsSeaPiece,
    seaStream: jsSeaStream,
    phaseSum: jsPhaseSum,
  }
}
