// THE ASYMPTOTIC SPEED OF A LONE THIRD ON A UNIFORM CENTRE FIELD (moving-matter item 0074, decision 017 point 3). A static
// periodic field confines only by localization, so a one-dock start on cf0 either stops (all its weight on flat bands, an
// Aharonov-Bohm cage) or spreads ballistically for ever at v_inf, the root-mean-square band velocity weighted by the
// start. This reads v_inf from the Bloch blocks of the CAGE ENGINE's own cycle (holonomy-caging cagingBeat, the operator
// color-gates-cage dockCageRead evolves), never from centre-flux centerBands' slab operator.
//
// THE BLOCK. A uniform centre field puts omega^(c_d) times 1 on slot d at every dock, so the three colours are three
// copies of one U(1) walk and the cell is one dock: the cycle is block diagonal in the box momentum theta (basis
// coordinates of the dock, 2 pi j / side), 192 modes a block (24 slots x the 8-mode register). With ph_d = omega^(c_d)
// e^(-i theta . m_d) (m_d the root's basis coordinates, read off the weave's own neighbours) the stream is
// (T phi)(d) = ph_d phi(-d), the sectors P_S = 1 + (u - 1) Q_S (slot average) and P_D = 1 + (conj u - 1) E E^T
// (holonomy-caging's partnerBasis E), and one cycle (beats 2b, 2b + 1) is B = T P_D T P_S.
//
// THE REDUCTION, exact. A link and its reverse are inverse, so T^2 = 1 and B = (1 + (conj u - 1) F F^dag)(1 + (u - 1) S
// S^dag) with S the 8 slot-uniform register vectors and F = T E: B is 1 off the 16-dimensional span of S and F, and on it
// it depends on the 8 x 8 overlap X = S^dag F only, X[a][e] = sum_d ph_d E[(-d, a), e] / sqrt 24. With X = A Sigma B^dag
// each pair (S a_i, F b_i) of overlap sigma_i is invariant, and its two levels are e^(+-i eps_i) with
//   cos eps_i = cos mu + sigma_i^2 (1 - cos mu),   u = e^(i mu)
// so the bands are +-eps(x) over the eigenvalues x of H = X X^dag, and on a cluster of H (projector Pi) the band velocity
// operator is eps'(x) Pi dH Pi (Hellmann-Feynman, the cluster diagonalized in the velocity). The start (one dock, slot
// uniform register mode 0, dockStart) is S e_0, so its long-time spread is
//   v_inf^2 = mean over theta of sum over clusters eps'(x)^2 sum_a |Pi dH_a Pi e_0|^2      (Z^4 units a cycle)
// with dH_a = sum_j M[a][j] dH / dtheta_j (M the basis-to-Z^4 map), since the rms is read in Z^4 units. Every step of the
// reduction is witnessed: blockRms rebuilds dockCageRead's rms at every beat from the coefficients (alpha, beta) of S and F
// per momentum, transformed back to the box, and denseVelocity reads the same v^2 at sample momenta from the full 192 x 192
// block, its unitary eigenvectors and its derivative, with no reduction.
//
// DETERMINISM: no random numbers; sample momenta are fixed Kronecker points. FLOAT: measurement.

import { makeColorWeave } from '@/code/rule/color-weave'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { partnerBasis } from '@/code/measure/register-meson'
import { d4Vector } from '@/code/substrate/d4-box-integer'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { unitaryEigenHouseholder } from '@/code/measure/spectral-flow'
import { bulkBox } from '@/code/measure/color-slab'
import { sigmaTable, type ColorField } from '@/code/measure/color-gates'
import { dockStart } from '@/code/measure/color-gates-cage'
import { CAGING_MODES, CAGING_REG, CAGING_SLOTS, slope } from '@/code/measure/holonomy-caging'

const SLOTS = CAGING_SLOTS
const REG = CAGING_REG
const MODES = CAGING_MODES
const TAU = 2 * Math.PI

// ---- the geometry and the field ----

export type CageGeometry = {
  side: number
  // m[d * 4 + j]: basis coordinate j of root d, read off the weave's neighbour of every dock (minimum image)
  m: Int32Array
  // metric[a][j]: Z^4 axis a of one unit of basis coordinate j (d4Vector, linear)
  metric: number[][]
  // docks and slots whose neighbour is not dock + m_d (a translation-invariant mesh reads 0)
  translationBad: number
  // m[-d] = -m[d] for every slot
  oppositeOk: boolean
  E: Float64Array
  // max |E^T E - 1|: the sector D is unitary only when this is rounding
  eOrtho: number
  u: [number, number]
  cosMu: number
  // G[d * 64 + a * 8 + e] = E[(-d, a), e] / sqrt 24, so X = sum_d ph_d G_d
  G: Float64Array
  // the start agrees with dockStart (slot-uniform register mode 0 at dock 0, 1/sqrt 24 a slot)
  startOk: boolean
}

export function cageGeometry(side: number): CageGeometry {
  const weave = makeColorWeave({ side, table: 'bind' })
  const cells = side ** 4
  const coord = (x: number, q: number): number => Math.floor(x / side ** q) % side
  const wrap = (v: number): number => {
    const r = ((v % side) + side) % side

    return r > side / 2 ? r - side : r
  }
  const m = new Int32Array(SLOTS * 4)

  for (let d = 0; d < SLOTS; d++) {
    const y = weave.mesh.neighbour(0, d)

    for (let j = 0; j < 4; j++) {
      m[d * 4 + j] = wrap(coord(y, j))
    }
  }

  let translationBad = 0

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const y = weave.mesh.neighbour(x, d)

      for (let j = 0; j < 4; j++) {
        if (wrap(coord(y, j) - coord(x, j)) !== m[d * 4 + j]) {
          translationBad++
          break
        }
      }
    }
  }

  const oppositeOk = Array.from({ length: SLOTS }, (_, d) => d).every(d =>
    [0, 1, 2, 3].every(j => m[OPPOSITE[d]! * 4 + j] === -m[d * 4 + j]!),
  )
  const metric = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(j => d4Vector([0, 1, 2, 3].map(q => (q === j ? 1 : 0)))[a]!))
  const E = partnerBasis()

  let eOrtho = 0

  for (let e = 0; e < REG; e++) {
    for (let f = 0; f < REG; f++) {
      let s = 0

      for (let i = 0; i < MODES; i++) {
        s += E[i * REG + e]! * E[i * REG + f]!
      }

      eOrtho = Math.max(eOrtho, Math.abs(s - (e === f ? 1 : 0)))
    }
  }

  const th = unitAngle(ringUnit(-1, 4))
  const G = new Float64Array(SLOTS * 64)
  const r24 = 1 / Math.sqrt(SLOTS)

  for (let d = 0; d < SLOTS; d++) {
    for (let a = 0; a < REG; a++) {
      for (let e = 0; e < REG; e++) {
        G[d * 64 + a * 8 + e] = E[(OPPOSITE[d]! * REG + a) * REG + e]! * r24
      }
    }
  }

  const s = dockStart(1, 1, 0)
  const startOk = Array.from(s.re).every((v, i) =>
    Math.abs(v - (i % REG === 0 ? r24 : 0)) < 1e-15,
  ) && s.im.every(v => v === 0)

  return {
    side,
    m,
    metric,
    translationBad,
    oppositeOk,
    E,
    eOrtho,
    u: [Math.cos(th), Math.sin(th)],
    cosMu: Math.cos(th),
    G,
    startOk,
  }
}

export type FieldPhases = {
  // the phase angle (radians) of slot d's link, the same at every dock
  angle: Float64Array
  // links that are not a scalar times 1, or differ from dock 0's on the same slot
  bad: number
}

// the field's links read from the field itself on the side box: a uniform centre field is omega^(c_d) times 1 on slot d
export function fieldPhases(field: ColorField, side: number): FieldPhases {
  const box = bulkBox(side)
  const link = field.on(box, 'bulk')
  const f = sigmaTable().lifts.floats
  const angle = new Float64Array(SLOTS)

  let bad = 0

  for (let d = 0; d < SLOTS; d++) {
    const g = f[link[d]!]!

    angle[d] = Math.atan2(g[1]!, g[0]!)
  }

  for (let l = 0; l < link.length; l++) {
    const g = f[link[l]!]!
    const d = l % SLOTS
    const cr = Math.cos(angle[d]!)
    const ci = Math.sin(angle[d]!)

    let off = 0

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const wr = i === j ? cr : 0
        const wi = i === j ? ci : 0

        off = Math.max(off, Math.abs(g[2 * (3 * i + j)]! - wr), Math.abs(g[2 * (3 * i + j) + 1]! - wi))
      }
    }

    if (off > 1e-12) {
      bad++
    }
  }

  return { angle, bad }
}

// ph_d = e^(i (angle_d - theta . m_d)), as (cos, sin)
function slotPhases(geo: CageGeometry, angle: Float64Array, theta: readonly number[], out: Float64Array): void {
  for (let d = 0; d < SLOTS; d++) {
    let t = angle[d]!

    for (let j = 0; j < 4; j++) {
      t -= theta[j]! * geo.m[d * 4 + j]!
    }

    out[2 * d] = Math.cos(t)
    out[2 * d + 1] = Math.sin(t)
  }
}

// X = sum_d ph_d G_d and, when dX is given, dX_j = sum_d (-i m_dj) ph_d G_d (64 complex each, re im interleaved)
function overlap(geo: CageGeometry, ph: Float64Array, X: Float64Array, dX?: Float64Array): void {
  X.fill(0)
  dX?.fill(0)

  for (let d = 0; d < SLOTS; d++) {
    const pr = ph[2 * d]!
    const pi = ph[2 * d + 1]!

    for (let i = 0; i < 64; i++) {
      const g = geo.G[d * 64 + i]!

      if (g === 0) {
        continue
      }

      X[2 * i]! += pr * g
      X[2 * i + 1]! += pi * g

      if (dX) {
        for (let j = 0; j < 4; j++) {
          const mj = geo.m[d * 4 + j]!

          if (mj !== 0) {
            // (-i m) (pr + i pi) g = m g (pi - i pr)
            dX[j * 128 + 2 * i]! += mj * g * pi
            dX[j * 128 + 2 * i + 1]! -= mj * g * pr
          }
        }
      }
    }
  }
}

// ---- STEP 1: the blocks evolved and transformed back to the box ----

export type BlockRun = {
  rms: number[]
  // |sum_x P(x) - 1| at the worst beat
  normDrift: number
  seconds: number
}

// the inverse DFT on the side^4 box, in place, one component: f(n) = (1/N) sum_k e^(i 2 pi k . n / side) f_k
function inverseDft4(re: Float64Array, im: Float64Array, side: number, cw: Float64Array, sw: Float64Array): void {
  const N = side ** 4
  const lr = new Float64Array(side)
  const li = new Float64Array(side)

  for (let q = 0; q < 4; q++) {
    const stride = side ** q

    for (let base = 0; base < N; base++) {
      if (Math.floor(base / stride) % side !== 0) {
        continue
      }

      for (let j = 0; j < side; j++) {
        lr[j] = re[base + j * stride]!
        li[j] = im[base + j * stride]!
      }

      for (let n = 0; n < side; n++) {
        let r = 0
        let s = 0

        for (let j = 0; j < side; j++) {
          const c = cw[(n * j) % side]!
          const w = sw[(n * j) % side]!

          r += c * lr[j]! - w * li[j]!
          s += c * li[j]! + w * lr[j]!
        }

        re[base + n * stride] = r
        im[base + n * stride] = s
      }
    }
  }

  for (let i = 0; i < N; i++) {
    re[i]! /= N
    im[i]! /= N
  }
}

// dockCageRead's rms per beat (one colour: a centre field gives the three the same probability), from the blocks
export function blockRms(geo: CageGeometry, angle: Float64Array, beats: number, r2: Float64Array): BlockRun {
  const started = Date.now()
  const side = geo.side
  const N = side ** 4
  const [ur, ui] = geo.u
  const X = new Float64Array(N * 128)
  const ph = new Float64Array(2 * SLOTS)
  const one = new Float64Array(128)

  for (let k = 0; k < N; k++) {
    const theta = [0, 1, 2, 3].map(q => (TAU * (Math.floor(k / side ** q) % side)) / side)

    slotPhases(geo, angle, theta, ph)
    overlap(geo, ph, one)
    X.set(one, k * 128)
  }

  // coefficients of S (alpha) and F or E (beta), component-major [c * N + k]
  const aR = new Float64Array(8 * N)
  const aI = new Float64Array(8 * N)
  const bR = new Float64Array(8 * N)
  const bI = new Float64Array(8 * N)

  for (let k = 0; k < N; k++) {
    aR[k] = 1
  }

  const cw = Float64Array.from({ length: side }, (_, t) => Math.cos((TAU * t) / side))
  const sw = Float64Array.from({ length: side }, (_, t) => Math.sin((TAU * t) / side))
  // shifted[d * N + n] = n - m_d on the box
  const shifted = new Int32Array(SLOTS * N)

  for (let n = 0; n < N; n++) {
    for (let d = 0; d < SLOTS; d++) {
      let idx = 0

      for (let q = 0; q < 4; q++) {
        const c = (((Math.floor(n / side ** q) % side) - geo.m[d * 4 + q]!) % side + side) % side

        idx += c * side ** q
      }

      shifted[d * N + n] = idx
    }
  }

  const ca = Float64Array.from({ length: SLOTS }, (_, d) => Math.cos(angle[d]!))
  const sa = Float64Array.from({ length: SLOTS }, (_, d) => Math.sin(angle[d]!))
  const r24 = 1 / Math.sqrt(SLOTS)
  const rms: number[] = []
  const hR = new Float64Array(8 * N)
  const hI = new Float64Array(8 * N)
  const gR = new Float64Array(8 * N)
  const gI = new Float64Array(8 * N)

  let normDrift = 0

  for (let b = 0; b <= beats; b++) {
    hR.set(aR)
    hI.set(aI)
    gR.set(bR)
    gI.set(bI)

    for (let c = 0; c < 8; c++) {
      inverseDft4(hR.subarray(c * N, (c + 1) * N), hI.subarray(c * N, (c + 1) * N), side, cw, sw)
      inverseDft4(gR.subarray(c * N, (c + 1) * N), gI.subarray(c * N, (c + 1) * N), side, cw, sw)
    }

    const even = b % 2 === 0

    let m2 = 0
    let norm = 0

    for (let n = 0; n < N; n++) {
      let p = 0

      for (let d = 0; d < SLOTS; d++) {
        const sn = shifted[d * N + n]!
        // even: S alpha at n plus omega^c (E beta)(-d) at n - m_d; odd: omega^c (S alpha) at n - m_d plus (E beta)(d) at n
        const an = even ? n : sn
        const gn = even ? sn : n
        const row = even ? OPPOSITE[d]! : d

        for (let a = 0; a < REG; a++) {
          let er = 0
          let ei = 0

          for (let e = 0; e < REG; e++) {
            const w = geo.E[(row * REG + a) * REG + e]!

            if (w !== 0) {
              er += w * gR[e * N + gn]!
              ei += w * gI[e * N + gn]!
            }
          }

          let sr = hR[a * N + an]! * r24
          let si = hI[a * N + an]! * r24

          // omega^(c_d) multiplies the shifted part
          if (even) {
            const tr = ca[d]! * er - sa[d]! * ei
            const ti = ca[d]! * ei + sa[d]! * er

            er = tr
            ei = ti
          } else {
            const tr = ca[d]! * sr - sa[d]! * si
            const ti = ca[d]! * si + sa[d]! * sr

            sr = tr
            si = ti
          }

          p += (sr + er) ** 2 + (si + ei) ** 2
        }
      }

      norm += p
      m2 += p * r2[n]!
    }

    rms.push(Math.sqrt(m2 / norm))
    normDrift = Math.max(normDrift, Math.abs(norm - 1))

    if (b === beats) {
      break
    }

    // beat b even: P_S then T, alpha' = u alpha + (u - 1) X beta; odd: P_D then T, beta' = conj u beta + (conj u - 1) X^dag alpha
    const nr = new Float64Array(8)
    const ni = new Float64Array(8)

    for (let k = 0; k < N; k++) {
      const o = k * 128

      if (even) {
        for (let a = 0; a < 8; a++) {
          let xr = 0
          let xi = 0

          for (let e = 0; e < 8; e++) {
            const pr = X[o + 2 * (a * 8 + e)]!
            const pi = X[o + 2 * (a * 8 + e) + 1]!
            const vr = bR[e * N + k]!
            const vi = bI[e * N + k]!

            xr += pr * vr - pi * vi
            xi += pr * vi + pi * vr
          }

          const ar = aR[a * N + k]!
          const ai = aI[a * N + k]!

          nr[a] = ur * ar - ui * ai + (ur - 1) * xr - ui * xi
          ni[a] = ur * ai + ui * ar + (ur - 1) * xi + ui * xr
        }

        for (let a = 0; a < 8; a++) {
          aR[a * N + k] = nr[a]!
          aI[a * N + k] = ni[a]!
        }
      } else {
        const vr0 = ur
        const vi0 = -ui

        for (let e = 0; e < 8; e++) {
          let xr = 0
          let xi = 0

          for (let a = 0; a < 8; a++) {
            // (X^dag)[e][a] = conj X[a][e]
            const pr = X[o + 2 * (a * 8 + e)]!
            const pi = -X[o + 2 * (a * 8 + e) + 1]!
            const vr = aR[a * N + k]!
            const vi = aI[a * N + k]!

            xr += pr * vr - pi * vi
            xi += pr * vi + pi * vr
          }

          const br = bR[e * N + k]!
          const bi = bI[e * N + k]!

          nr[e] = vr0 * br - vi0 * bi + (vr0 - 1) * xr - vi0 * xi
          ni[e] = vr0 * bi + vi0 * br + (vr0 - 1) * xi + vi0 * xr
        }

        for (let e = 0; e < 8; e++) {
          bR[e * N + k] = nr[e]!
          bI[e * N + k] = ni[e]!
        }
      }
    }
  }

  return { rms, normDrift, seconds: (Date.now() - started) / 1000 }
}

// ---- STEP 2: the band velocities from the reduced block ----

export type PointVelocity = {
  // sum over clusters of eps'^2 sum_a |Pi dH_a Pi e_0|^2 (Z^4 units a cycle, squared)
  v2: number
  // the start's mean velocity, Z^4 axes
  mean: number[]
  // H's eigenvalues ascending and the start's weight on each
  x: number[]
  w: number[]
  // clusters at sin eps < 1e-7 (the two levels meet at eps 0), skipped
  singular: number
}

const CLUSTER = 1e-9

// the reduced read at one momentum
export function reducedPoint(geo: CageGeometry, angle: Float64Array, theta: readonly number[]): PointVelocity {
  const ph = new Float64Array(2 * SLOTS)
  const X = new Float64Array(128)
  const dX = new Float64Array(4 * 128)

  slotPhases(geo, angle, theta, ph)
  overlap(geo, ph, X, dX)

  // H = X X^dag, dHj = dXj X^dag + X dXj^dag, then dH_a = sum_j M[a][j] dHj
  const Hr = new Float64Array(64)
  const Hi = new Float64Array(64)
  const dHr = new Float64Array(4 * 64)
  const dHi = new Float64Array(4 * 64)

  for (let a = 0; a < 8; a++) {
    for (let b = 0; b < 8; b++) {
      let hr = 0
      let hi = 0

      for (let e = 0; e < 8; e++) {
        const xr = X[2 * (a * 8 + e)]!
        const xi = X[2 * (a * 8 + e) + 1]!
        const yr = X[2 * (b * 8 + e)]!
        const yi = -X[2 * (b * 8 + e) + 1]!

        hr += xr * yr - xi * yi
        hi += xr * yi + xi * yr
      }

      Hr[a * 8 + b] = hr
      Hi[a * 8 + b] = hi
    }
  }

  const dTr = new Float64Array(64)
  const dTi = new Float64Array(64)

  for (let j = 0; j < 4; j++) {
    for (let a = 0; a < 8; a++) {
      for (let b = 0; b < 8; b++) {
        let hr = 0
        let hi = 0

        for (let e = 0; e < 8; e++) {
          // dX[a,e] conj X[b,e] + X[a,e] conj dX[b,e]
          const pr = dX[j * 128 + 2 * (a * 8 + e)]!
          const pi = dX[j * 128 + 2 * (a * 8 + e) + 1]!
          const qr = X[2 * (b * 8 + e)]!
          const qi = -X[2 * (b * 8 + e) + 1]!
          const rr = X[2 * (a * 8 + e)]!
          const ri = X[2 * (a * 8 + e) + 1]!
          const sr = dX[j * 128 + 2 * (b * 8 + e)]!
          const si = -dX[j * 128 + 2 * (b * 8 + e) + 1]!

          hr += pr * qr - pi * qi + rr * sr - ri * si
          hi += pr * qi + pi * qr + rr * si + ri * sr
        }

        dTr[a * 8 + b] = hr
        dTi[a * 8 + b] = hi
      }
    }

    for (let ax = 0; ax < 4; ax++) {
      const c = geo.metric[ax]![j]!

      if (c === 0) {
        continue
      }

      for (let i = 0; i < 64; i++) {
        dHr[ax * 64 + i]! += c * dTr[i]!
        dHi[ax * 64 + i]! += c * dTi[i]!
      }
    }
  }

  const h = hermitianEigenRows(8, Hr, Hi)
  const cm = geo.cosMu
  const [ur, ui] = geo.u
  const x = Array.from(h.values)
  const w = x.map((_, i) => h.vectorsRe[i * 8]! ** 2 + h.vectorsIm[i * 8]! ** 2)
  const mean = [0, 0, 0, 0]

  let v2 = 0
  let singular = 0
  let start = 0

  while (start < 8) {
    let end = start + 1

    while (end < 8 && x[end]! - x[end - 1]! <= CLUSTER) {
      end++
    }

    const xc = x.slice(start, end).reduce((s, v) => s + v, 0) / (end - start)
    const cosE = Math.min(1, Math.max(-1, cm + xc * (1 - cm)))
    const sinE = Math.sqrt(1 - cosE * cosE)

    if (sinE < 1e-7) {
      singular++
      start = end
      continue
    }

    const fp = -(1 - cm) / sinE
    // p = Pi e_0 = sum_i v_i conj(v_i[0])
    const pr = new Float64Array(8)
    const pi = new Float64Array(8)

    for (let i = start; i < end; i++) {
      const cr = h.vectorsRe[i * 8]!
      const ci = -h.vectorsIm[i * 8]!

      for (let a = 0; a < 8; a++) {
        const vr = h.vectorsRe[i * 8 + a]!
        const vi = h.vectorsIm[i * 8 + a]!

        pr[a]! += vr * cr - vi * ci
        pi[a]! += vr * ci + vi * cr
      }
    }

    // the pair's split of the start between e^(+i eps) and e^(-i eps): U2 = M_D M_S on (s, f_perp), f = sigma s + tau f_perp
    const sg = Math.sqrt(Math.max(0, xc))
    const tu = Math.sqrt(Math.max(0, 1 - xc))
    const pf = [xc, sg * tu, sg * tu, 1 - xc]
    // M_D = 1 + (conj u - 1) P_f, M_S = diag(u, 1)
    const dr = ur - 1
    const di = -ui
    const md = pf.map((v, i): [number, number] => [(i === 0 || i === 3 ? 1 : 0) + dr * v, di * v])
    // U2 = M_D diag(u, 1): column 0 times u
    const u00: [number, number] = [md[0]![0] * ur - md[0]![1] * ui, md[0]![0] * ui + md[0]![1] * ur]
    const u01 = md[1]!
    // eigenvector of lambda+ = e^(i eps): (u01, lambda+ - u00)
    const lr = cosE - u00[0]
    const li = sinE - u00[1]
    const n0 = u01[0] ** 2 + u01[1] ** 2
    const n1 = lr * lr + li * li
    const wPlus = n0 + n1 > 0 ? n0 / (n0 + n1) : 0.5
    // lambda = e^(-i e) is the convention, so the e^(+i eps) branch moves at -eps', the other at +eps'
    const signMean = 1 - 2 * wPlus

    for (let ax = 0; ax < 4; ax++) {
      // q = dH_a p, then Pi q
      const qr = new Float64Array(8)
      const qi = new Float64Array(8)

      for (let a = 0; a < 8; a++) {
        for (let b = 0; b < 8; b++) {
          const hr = dHr[ax * 64 + a * 8 + b]!
          const hi = dHi[ax * 64 + a * 8 + b]!

          qr[a]! += hr * pr[b]! - hi * pi[b]!
          qi[a]! += hr * pi[b]! + hi * pr[b]!
        }
      }

      let pq = 0

      for (let a = 0; a < 8; a++) {
        pq += pr[a]! * qr[a]! + pi[a]! * qi[a]!
      }

      let n2 = 0

      for (let i = start; i < end; i++) {
        let cr = 0
        let ci = 0

        for (let a = 0; a < 8; a++) {
          const vr = h.vectorsRe[i * 8 + a]!
          const vi = -h.vectorsIm[i * 8 + a]!

          cr += vr * qr[a]! - vi * qi[a]!
          ci += vr * qi[a]! + vi * qr[a]!
        }

        n2 += cr * cr + ci * ci
      }

      v2 += fp * fp * n2
      mean[ax]! += signMean * fp * pq
    }

    start = end
  }

  return { v2, mean, x, w, singular }
}

export type GridVelocity = {
  nk: number
  points: number
  // mean over the grid, Z^4 units a CYCLE (two beats), squared
  v2: number
  mean: number[]
  // v2 with the mean velocity removed
  v2Centered: number
  // the 8 pair bands: widths in eps over the grid, the start's mean weight on each, and the weight on bands under 1e-9
  widths: number[]
  bandWeight: number[]
  flatWeight: number
  singular: number
  seconds: number
}

export function gridVelocity(geo: CageGeometry, angle: Float64Array, nk: number): GridVelocity {
  const started = Date.now()
  const points = nk ** 4
  const xmin = Array<number>(8).fill(Infinity)
  const xmax = Array<number>(8).fill(-Infinity)
  const wsum = Array<number>(8).fill(0)
  const mean = [0, 0, 0, 0]

  let v2 = 0
  let singular = 0

  for (let k = 0; k < points; k++) {
    const theta = [0, 1, 2, 3].map(q => (TAU * (Math.floor(k / nk ** q) % nk)) / nk)
    const p = reducedPoint(geo, angle, theta)

    v2 += p.v2
    singular += p.singular

    for (let a = 0; a < 4; a++) {
      mean[a]! += p.mean[a]!
    }

    for (let i = 0; i < 8; i++) {
      xmin[i] = Math.min(xmin[i]!, p.x[i]!)
      xmax[i] = Math.max(xmax[i]!, p.x[i]!)
      wsum[i]! += p.w[i]!
    }
  }

  const eps = (x: number): number => Math.acos(Math.min(1, Math.max(-1, geo.cosMu + x * (1 - geo.cosMu))))
  const widths = xmin.map((v, i) => Math.abs(eps(xmax[i]!) - eps(v)))
  const bandWeight = wsum.map(v => v / points)
  const m = mean.map(v => v / points)

  return {
    nk,
    points,
    v2: v2 / points,
    mean: m,
    v2Centered: v2 / points - m.reduce((s, v) => s + v * v, 0),
    widths,
    bandWeight,
    flatWeight: bandWeight.reduce((s, v, i) => s + (widths[i]! < 1e-9 ? v : 0), 0),
    singular,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the dense instrument: any unitary block, its derivatives, a start ----

export type DenseVelocity = {
  v2: number
  mean: number[]
  // eigenphases arg(lambda), ascending, and the start's weight on each eigenvector
  phases: number[]
  weights: number[]
  residual: number
  unitarity: number
}

// sum over eigenphase clusters (circular distance <= tol) of sum_a |P (i conj(lambda) dU_a) P phi|^2, lambda = e^(-i eps)
export function denseVelocity(
  n: number,
  U: { re: Float64Array; im: Float64Array },
  dU: readonly { re: Float64Array; im: Float64Array }[],
  phi: { re: Float64Array; im: Float64Array },
  tol = 1e-8,
): DenseVelocity {
  let unitarity = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let r = 0
      let s = 0

      for (let l = 0; l < n; l++) {
        const ar = U.re[l * n + i]!
        const ai = -U.im[l * n + i]!
        const br = U.re[l * n + j]!
        const bi = U.im[l * n + j]!

        r += ar * br - ai * bi
        s += ar * bi + ai * br
      }

      unitarity = Math.max(unitarity, Math.hypot(r - (i === j ? 1 : 0), s))
    }
  }

  const eig = unitaryEigenHouseholder(n, U.re, U.im)
  const order = eig.phases.map((_, i) => i).sort((a, b) => eig.phases[a]! - eig.phases[b]!)
  const phases = order.map(i => eig.phases[i]!)
  const vecs = order.map(i => eig.vectors[i]!)
  const weights = vecs.map(v => {
    let r = 0
    let s = 0

    for (let x = 0; x < n; x++) {
      r += v.re[x]! * phi.re[x]! + v.im[x]! * phi.im[x]!
      s += v.re[x]! * phi.im[x]! - v.im[x]! * phi.re[x]!
    }

    return r * r + s * s
  })
  // clusters on the circle: join consecutive phases within tol, and the last with the first across pi
  const label = new Int32Array(n)

  for (let i = 1; i < n; i++) {
    label[i] = phases[i]! - phases[i - 1]! <= tol ? label[i - 1]! : label[i - 1]! + 1
  }

  if (n > 1 && phases[0]! + TAU - phases[n - 1]! <= tol) {
    const last = label[n - 1]!

    for (let i = 0; i < n; i++) {
      if (label[i] === last) {
        label[i] = 0
      }
    }
  }

  const clusters = [...new Set(label)]
  const mean = dU.map(() => 0)

  let v2 = 0

  for (const c of clusters) {
    const idx = phases.map((_, i) => i).filter(i => label[i] === c)
    const lam = idx.reduce<[number, number]>(
      (s, i) => [s[0] + Math.cos(phases[i]!) / idx.length, s[1] + Math.sin(phases[i]!) / idx.length],
      [0, 0],
    )
    const ln = Math.hypot(lam[0], lam[1])
    // i conj(lambda) = i (lr - i li) = li + i lr
    const fr = lam[1] / ln
    const fi = lam[0] / ln
    const project = (y: { re: Float64Array; im: Float64Array }): { re: Float64Array; im: Float64Array } => {
      const out = { re: new Float64Array(n), im: new Float64Array(n) }

      for (const i of idx) {
        const v = vecs[i]!

        let r = 0
        let s = 0

        for (let x = 0; x < n; x++) {
          r += v.re[x]! * y.re[x]! + v.im[x]! * y.im[x]!
          s += v.re[x]! * y.im[x]! - v.im[x]! * y.re[x]!
        }

        for (let x = 0; x < n; x++) {
          out.re[x]! += v.re[x]! * r - v.im[x]! * s
          out.im[x]! += v.re[x]! * s + v.im[x]! * r
        }
      }

      return out
    }
    const p = project(phi)

    dU.forEach((D, a) => {
      const y = { re: new Float64Array(n), im: new Float64Array(n) }

      for (let i = 0; i < n; i++) {
        let r = 0
        let s = 0

        for (let j = 0; j < n; j++) {
          const dr = D.re[i * n + j]!
          const di = D.im[i * n + j]!

          r += dr * p.re[j]! - di * p.im[j]!
          s += dr * p.im[j]! + di * p.re[j]!
        }

        y.re[i] = fr * r - fi * s
        y.im[i] = fr * s + fi * r
      }

      const q = project(y)

      for (let i = 0; i < n; i++) {
        v2 += q.re[i]! ** 2 + q.im[i]! ** 2
        mean[a]! += p.re[i]! * q.re[i]! + p.im[i]! * q.im[i]!
      }
    })
  }

  return { v2, mean, phases, weights, residual: eig.residual, unitarity }
}

// the full 192 x 192 cycle block B = T P_D T P_S at theta and its Z^4-axis derivatives, with no reduction
export function fullBlock(
  geo: CageGeometry,
  angle: Float64Array,
  theta: readonly number[],
): { U: { re: Float64Array; im: Float64Array }; dU: { re: Float64Array; im: Float64Array }[] } {
  const n = MODES
  const ph = new Float64Array(2 * SLOTS)
  const [ur, ui] = geo.u

  slotPhases(geo, angle, theta, ph)

  type V = { re: Float64Array; im: Float64Array }
  const T = (v: V): V => {
    const o = { re: new Float64Array(n), im: new Float64Array(n) }

    for (let d = 0; d < SLOTS; d++) {
      const pr = ph[2 * d]!
      const pi = ph[2 * d + 1]!

      for (let a = 0; a < REG; a++) {
        const s = OPPOSITE[d]! * REG + a

        o.re[d * REG + a] = pr * v.re[s]! - pi * v.im[s]!
        o.im[d * REG + a] = pr * v.im[s]! + pi * v.re[s]!
      }
    }

    return o
  }
  const PS = (v: V): V => {
    const o = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }

    for (let a = 0; a < REG; a++) {
      let sr = 0
      let si = 0

      for (let d = 0; d < SLOTS; d++) {
        sr += v.re[d * REG + a]! / SLOTS
        si += v.im[d * REG + a]! / SLOTS
      }

      for (let d = 0; d < SLOTS; d++) {
        o.re[d * REG + a]! += (ur - 1) * sr - ui * si
        o.im[d * REG + a]! += (ur - 1) * si + ui * sr
      }
    }

    return o
  }
  const PD = (v: V): V => {
    const o = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }
    const cr = new Float64Array(REG)
    const ci = new Float64Array(REG)

    for (let m = 0; m < n; m++) {
      for (let e = 0; e < REG; e++) {
        cr[e]! += geo.E[m * REG + e]! * v.re[m]!
        ci[e]! += geo.E[m * REG + e]! * v.im[m]!
      }
    }

    // conj u - 1
    const wr = ur - 1
    const wi = -ui

    for (let m = 0; m < n; m++) {
      let pr = 0
      let pi = 0

      for (let e = 0; e < REG; e++) {
        pr += geo.E[m * REG + e]! * cr[e]!
        pi += geo.E[m * REG + e]! * ci[e]!
      }

      o.re[m]! += wr * pr - wi * pi
      o.im[m]! += wr * pi + wi * pr
    }

    return o
  }
  // D_a = -i sum_j M[a][j] m_dj on slot d
  const D = (v: V, ax: number): V => {
    const o = { re: new Float64Array(n), im: new Float64Array(n) }

    for (let d = 0; d < SLOTS; d++) {
      let g = 0

      for (let j = 0; j < 4; j++) {
        g += geo.metric[ax]![j]! * geo.m[d * 4 + j]!
      }

      for (let a = 0; a < REG; a++) {
        const i = d * REG + a

        o.re[i] = g * v.im[i]!
        o.im[i] = -g * v.re[i]!
      }
    }

    return o
  }
  const add = (x: V, y: V): V => ({
    re: Float64Array.from(x.re, (v, i) => v + y.re[i]!),
    im: Float64Array.from(x.im, (v, i) => v + y.im[i]!),
  })
  const U = { re: new Float64Array(n * n), im: new Float64Array(n * n) }
  const dU = [0, 1, 2, 3].map(() => ({ re: new Float64Array(n * n), im: new Float64Array(n * n) }))

  for (let col = 0; col < n; col++) {
    const e: V = { re: new Float64Array(n), im: new Float64Array(n) }

    e.re[col] = 1

    const y = T(PS(e))
    const ue = T(PD(y))

    for (let i = 0; i < n; i++) {
      U.re[i * n + col] = ue.re[i]!
      U.im[i * n + col] = ue.im[i]!
    }

    // dU = D (U e) + T P_D D (T P_S e), since dT = D T
    for (let ax = 0; ax < 4; ax++) {
      const g = add(D(ue, ax), T(PD(D(y, ax))))

      for (let i = 0; i < n; i++) {
        dU[ax]!.re[i * n + col] = g.re[i]!
        dU[ax]!.im[i * n + col] = g.im[i]!
      }
    }
  }

  return { U, dU }
}

export type InstrumentPoint = {
  theta: number[]
  reducedV2: number
  denseV2: number
  meanGap: number
  // the dense block's eigenphases against +-eps(x_i) and the 176 levels at 1, sorted
  spectrumGap: number
  singular: number
  residual: number
  unitarity: number
}

// the reduction against the dense block at fixed momenta: the 16 corners {0, pi}^4, the axis quarter points and Kronecker points
export function samplePoints(count: number): number[][] {
  const out: number[][] = []

  for (let c = 0; c < 16; c++) {
    out.push([0, 1, 2, 3].map(q => ((c >> q) & 1) * Math.PI))
  }

  for (let q = 0; q < 4; q++) {
    out.push([0, 1, 2, 3].map(r => (r === q ? Math.PI / 2 : 0)))
  }

  const roots = [Math.SQRT2, Math.sqrt(3), Math.sqrt(5), Math.sqrt(7)]

  for (let i = 1; out.length < count; i++) {
    out.push(roots.map(r => TAU * ((i * r) % 1)))
  }

  return out
}

export function instrumentPoint(geo: CageGeometry, angle: Float64Array, theta: number[]): InstrumentPoint {
  const r = reducedPoint(geo, angle, theta)
  const { U, dU } = fullBlock(geo, angle, theta)
  const phi = { re: new Float64Array(MODES), im: new Float64Array(MODES) }

  for (let d = 0; d < SLOTS; d++) {
    phi.re[d * REG] = 1 / Math.sqrt(SLOTS)
  }

  const dv = denseVelocity(MODES, U, dU, phi)
  const cm = geo.cosMu
  const expect = [
    ...r.x.flatMap(x => {
      const e = Math.acos(Math.min(1, Math.max(-1, cm + x * (1 - cm))))

      return [e, -e]
    }),
    ...Array<number>(MODES - 16).fill(0),
  ].sort((a, b) => a - b)

  return {
    theta,
    reducedV2: r.v2,
    denseV2: dv.v2,
    meanGap: Math.max(...r.mean.map((v, a) => Math.abs(Math.abs(v) - Math.abs(dv.mean[a]!)))),
    spectrumGap: Math.max(...expect.map((v, i) => Math.abs(v - dv.phases[i]!))),
    singular: r.singular,
    residual: dv.residual,
    unitarity: dv.unitarity,
  }
}

// ---- the positive control: the rhombic chain of Vidal, Mosseri and Doucot (PRL 81 5888 (1998)) ----

// hub A_n joined to B_n, C_n and to B_(n-1), C_(n-1); flux phi through each rhombus on the C_(n-1) hop. One step e^(-i H(k))
export function rhombicBlock(
  flux: number,
  k: number,
): { U: { re: Float64Array; im: Float64Array }; dU: { re: Float64Array; im: Float64Array }[] } {
  const n = 3
  const Hr = new Float64Array(9)
  const Hi = new Float64Array(9)
  const dHr = new Float64Array(9)
  const dHi = new Float64Array(9)
  const set = (i: number, j: number, re: number, im: number, dre: number, dim: number): void => {
    Hr[i * 3 + j] = re
    Hi[i * 3 + j] = im
    Hr[j * 3 + i] = re
    Hi[j * 3 + i] = -im
    dHr[i * 3 + j] = dre
    dHi[i * 3 + j] = dim
    dHr[j * 3 + i] = dre
    dHi[j * 3 + i] = -dim
  }

  // H_AB = 1 + e^(-ik), H_AC = 1 + e^(-i(k + flux)); d/dk e^(-i t) = -i e^(-i t)
  set(0, 1, 1 + Math.cos(k), -Math.sin(k), -Math.sin(k), -Math.cos(k))
  set(0, 2, 1 + Math.cos(k + flux), -Math.sin(k + flux), -Math.sin(k + flux), -Math.cos(k + flux))

  const h = hermitianEigenRows(n, Hr, Hi)
  // U = V e^(-i E) V^dag; dU = V [ (V^dag dH V)_mn g(E_m, E_n) ] V^dag (Daleckii-Krein)
  const Vr = (i: number, m: number): number => h.vectorsRe[m * n + i]!
  const Vi = (i: number, m: number): number => h.vectorsIm[m * n + i]!
  const E = Array.from(h.values)
  const U = { re: new Float64Array(9), im: new Float64Array(9) }
  const dU = { re: new Float64Array(9), im: new Float64Array(9) }
  const Mr = new Float64Array(9)
  const Mi = new Float64Array(9)

  // M = V^dag dH V
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      let r = 0
      let s = 0

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const ar = Vr(i, a)
          const ai = -Vi(i, a)
          const hr = dHr[i * 3 + j]!
          const hi = dHi[i * 3 + j]!
          const br = Vr(j, b)
          const bi = Vi(j, b)
          const tr = ar * hr - ai * hi
          const ti = ar * hi + ai * hr

          r += tr * br - ti * bi
          s += tr * bi + ti * br
        }
      }

      const gap = E[a]! - E[b]!
      // g = (e^(-i Ea) - e^(-i Eb)) / (Ea - Eb), or -i e^(-i Ea) at Ea = Eb
      const g: [number, number] =
        Math.abs(gap) > 1e-12
          ? [(Math.cos(E[a]!) - Math.cos(E[b]!)) / gap, (-Math.sin(E[a]!) + Math.sin(E[b]!)) / gap]
          : [-Math.sin(E[a]!), -Math.cos(E[a]!)]

      Mr[a * 3 + b] = r * g[0] - s * g[1]
      Mi[a * 3 + b] = r * g[1] + s * g[0]
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let ur = 0
      let ui = 0
      let dr = 0
      let di = 0

      for (let a = 0; a < n; a++) {
        // V[i][a] e^(-i Ea) conj V[j][a]
        const pr = Vr(i, a) * Vr(j, a) + Vi(i, a) * Vi(j, a)
        const pi = Vi(i, a) * Vr(j, a) - Vr(i, a) * Vi(j, a)
        const c = Math.cos(E[a]!)
        const s = -Math.sin(E[a]!)

        ur += pr * c - pi * s
        ui += pr * s + pi * c

        for (let b = 0; b < n; b++) {
          // V[i][a] M[a][b] conj V[j][b]
          const xr = Vr(i, a) * Mr[a * 3 + b]! - Vi(i, a) * Mi[a * 3 + b]!
          const xi = Vr(i, a) * Mi[a * 3 + b]! + Vi(i, a) * Mr[a * 3 + b]!
          const yr = Vr(j, b)
          const yi = -Vi(j, b)

          dr += xr * yr - xi * yi
          di += xr * yi + xi * yr
        }
      }

      U.re[i * 3 + j] = ur
      U.im[i * 3 + j] = ui
      dU.re[i * 3 + j] = dr
      dU.im[i * 3 + j] = di
    }
  }

  return { U, dU: [dU] }
}

export type ChainVelocity = { flux: number; nk: number; v2: number; flatWeight: number; widths: number[] }

// the same velocity function (denseVelocity) on the chain from the hub A_0
export function chainVelocity(flux: number, nk: number): ChainVelocity {
  const phi = { re: Float64Array.from([1, 0, 0]), im: new Float64Array(3) }
  const lo = [Infinity, Infinity, Infinity]
  const hi = [-Infinity, -Infinity, -Infinity]
  const ws = [0, 0, 0]

  let v2 = 0

  for (let j = 0; j < nk; j++) {
    const { U, dU } = rhombicBlock(flux, (TAU * j) / nk)
    const d = denseVelocity(3, U, dU, phi)

    v2 += d.v2 / nk
    d.phases.forEach((p, i) => {
      lo[i] = Math.min(lo[i]!, p)
      hi[i] = Math.max(hi[i]!, p)
      ws[i]! += d.weights[i]! / nk
    })
  }

  const widths = lo.map((v, i) => hi[i]! - v)

  return { flux, nk, v2, flatWeight: ws.reduce((s, w, i) => s + (widths[i]! < 1e-9 ? w : 0), 0), widths }
}

// ---- STEP 3 ----

export type Windows = { C: number[]; alpha: number }

// C over beats 16-32, 32-48, 48-64 and the rms log-log slope over 16-64
export function windowRead(rmsC: readonly number[], rmsT: readonly number[], from: number, to: number): Windows {
  const span = (a: number, b: number): number[] => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  const C = [16, 32, 48].map(a => {
    const xs = span(a, a + 16)

    return slope(xs, xs.map(b => rmsC[b]!)) / slope(xs, xs.map(b => rmsT[b]!))
  })
  const xs = span(from, to)

  return { C, alpha: slope(xs.map(Math.log), xs.map(b => Math.log(rmsC[b]!))) }
}

export { slope }
