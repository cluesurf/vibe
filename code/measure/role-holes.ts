// MANY HOLES WITH ROLES AND TONES (E-QTM-0186). code/measure/register-holes runs n holes of the register sea exactly on
// the moving part of the space, one half (fiber 8), with the pair piece a phase in relative sites. C* (E-FND-0160) adds a
// role qutrit to every member and a tone as a species, and its fear beat is a role kernel at contact (V = 0, both
// members in the beat's sector): U = P_sym + w P_anti for a like pair, V = 1 + (w - 1) Phi Phi^dag for an unlike pair.
// With two holes both kernels are diagonal in one split of the role pair, so a run is two orbital runs (the channel
// trick of E-FND-0160 and E-QTM-0166). With three or more holes the kernels of different pairs do not commute and no
// split serves them all, so this module carries the roles explicitly: the state is the register-holes store times
// 3^n role amplitudes, every member distinguishable in storage (identical members are antisymmetrized in the start and
// stay so, since the rule commutes with exchanging members of one species).
//
//   layout        amplitude ((T * B + fb) * R + r): T the momentum tuple of members 0 .. n - 2 (member n - 1 is the rest),
//                 fb the fiber tuple (B = f^n), r the role tuple (R = 3^n, member 0 the most significant digit)
//   one beat      the pair step (sign +1 in beat 1, -1 in beat 2), then the one-body transfer (A1, then A2), as
//                 register-holes holeCycle. The one-body pieces are role-blind and act on every role component alike
//   the pair step for every fiber tuple with two or more members in the sector: to relative sites, at every site tuple
//                 the phase e^(i s phi) with phi the sum over in-sector pairs of the pair angle (register-holes
//                 pairAngles: string, and the contact at V = 0) times the role kernel K_s(mask), mask the in-sector pairs
//                 at V = 0, and back to momenta
//   the kernel    a pair's channel operator H (like: P_anti, unlike: Phi Phi^dag; the control: n0_i + n0_j, the number of
//                 the pair's members in role |0>, taken by every pair alike; off: none). The fear angle moves the contact
//                 by -s fear on the channel, as in E-QTM-0166's rule(n), so a lone pair takes exp(-i s fear H)
//   several       when three or more members meet at one dock in the sector, several pairs are at contact at once and
//   contacts      their H do not commute. C* does not say which comes first. 'sum' takes exp(-i s fear sum H) (no order,
//                 equal to the product whenever the pieces commute), 'product' takes the pairs in increasing order. The
//                 pair step reports the weight it found in such configurations, so a reader can see how much the choice
//                 could matter
//   reads         crossFirst: the role state of member 0 between two runs, sum over everything else of X conj Y;
//                 crossFragments: the role state of members 1 .. m (m = 1 .. n - 1) between two runs, traced over member
//                 0's role, the other members' roles and every orbit
//
// THREADS: the beat and the reads run on worker threads over shared memory (the pattern of code/measure/meson-pool):
// every sum is over a fixed range in a fixed order, so a run is reproducible bit for bit at a given thread count.
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces.

import { Worker } from 'node:worker_threads'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import {
  allPerms,
  type HoleFrame,
  type Vec,
} from '@/code/measure/register-holes'

const ROLE = 3

// ---- role vectors and pair operators ----

export type RoleState3 = { re: readonly number[]; im: readonly number[] }

// the 12 line states of the role grid, class by class: the Z basis, then sum_n omega^(j n + k n^2) |n> / sqrt 3 for k = 0,
// 1, 2 (the qutrit's 4 stabilizer bases)
export function roleLines(): RoleState3[] {
  const out: RoleState3[] = []

  for (let j = 0; j < ROLE; j++) {
    out.push({
      re: [0, 1, 2].map(m => (m === j ? 1 : 0)),
      im: [0, 0, 0],
    })
  }

  for (let k = 0; k < ROLE; k++) {
    for (let j = 0; j < ROLE; j++) {
      const th = [0, 1, 2].map(m => (2 * Math.PI * (j * m + k * m * m)) / 3)

      out.push({
        re: th.map(t => Math.cos(t) / Math.sqrt(3)),
        im: th.map(t => Math.sin(t) / Math.sqrt(3)),
      })
    }
  }

  return out
}

export type RoleKernelForm = 'model' | 'control' | 'off'

// the channel operator of one pair on its 9 role states (index 3 r_i + r_j), real and symmetric for every form
export function pairChannel(form: RoleKernelForm, like: boolean): Float64Array {
  const H = new Float64Array(81)

  if (form === 'off') {
    return H
  }

  for (let a = 0; a < 9; a++) {
    const ai = Math.floor(a / 3)
    const aj = a % 3

    for (let b = 0; b < 9; b++) {
      const bi = Math.floor(b / 3)
      const bj = b % 3

      if (form === 'control') {
        H[a * 9 + b] = a === b ? (ai === 0 ? 1 : 0) + (aj === 0 ? 1 : 0) : 0
      } else if (like) {
        // P_anti = (1 - swap) / 2
        H[a * 9 + b] = ((a === b ? 1 : 0) - (ai === bj && aj === bi ? 1 : 0)) / 2
      } else {
        // Phi Phi^dag, Phi = sum |n n> / sqrt 3
        H[a * 9 + b] = ai === aj && bi === bj ? 1 / 3 : 0
      }
    }
  }

  return H
}

// a pair operator on members i < j, embedded in the R x R role space of n members
function embedPair(n: number, i: number, j: number, H9: Float64Array): Float64Array {
  const R = ROLE ** n
  const out = new Float64Array(R * R)
  const di = ROLE ** (n - 1 - i)
  const dj = ROLE ** (n - 1 - j)

  for (let r = 0; r < R; r++) {
    const ri = Math.floor(r / di) % ROLE
    const rj = Math.floor(r / dj) % ROLE
    const rest = r - ri * di - rj * dj

    for (let b = 0; b < 9; b++) {
      const h = H9[(ri * 3 + rj) * 9 + b]!

      if (h === 0) {
        continue
      }

      const c = rest + Math.floor(b / 3) * di + (b % 3) * dj

      out[c * R + r] = h
    }
  }

  return out
}

// exp(-i theta H) for a real symmetric H (R x R), as re and im arrays
function expSymmetric(H: Float64Array, R: number, theta: number): { re: Float64Array; im: Float64Array } {
  const m = makeDense({ rows: R, cols: R })

  m.data.set(H)

  const { values, vectors } = eigSymmetric({ matrix: m })
  const re = new Float64Array(R * R)
  const im = new Float64Array(R * R)

  for (let a = 0; a < R; a++) {
    for (let b = 0; b < R; b++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < R; k++) {
        const w = vectors[a * R + k]! * vectors[b * R + k]!

        if (w === 0) {
          continue
        }

        sr += w * Math.cos(theta * values[k]!)
        si -= w * Math.sin(theta * values[k]!)
      }

      re[a * R + b] = sr
      im[a * R + b] = si
    }
  }

  return { re, im }
}

function complexProduct(
  a: { re: Float64Array; im: Float64Array },
  b: { re: Float64Array; im: Float64Array },
  R: number,
): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(R * R)
  const im = new Float64Array(R * R)

  for (let i = 0; i < R; i++) {
    for (let k = 0; k < R; k++) {
      const ar = a.re[i * R + k]!
      const ai = a.im[i * R + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < R; j++) {
        re[i * R + j]! += ar * b.re[k * R + j]! - ai * b.im[k * R + j]!
        im[i * R + j]! += ar * b.im[k * R + j]! + ai * b.re[k * R + j]!
      }
    }
  }

  return { re, im }
}

// ---- the engine ----

export type RoleRule = {
  form: RoleKernelForm
  // per member: 0 a pleasure-tone member (a hole of the pain sea), 1 a pain-tone member (a hole of the pleasure sea)
  species: readonly number[]
  compose: 'sum' | 'product'
}

export type RoleEngine = {
  frame: HoleFrame
  n: number
  total: number
  R: number
  B: number
  tuples: number
  size: number
  pairs: [number, number][]
  states: { re: Float64Array; im: Float64Array }[]
  // one beat of rule `rule` on state x: the pair step, then the one-body transfer
  beat: (x: number, rule: number, beat: 1 | 2) => void
  // sum over everything but member 0's role of X conj Y, 3 x 3 [s * 3 + s']
  crossFirst: (x: number, y: number) => { re: Float64Array; im: Float64Array }
  // for m = 1 .. n - 1: sum over member 0's role, members m + 1 .. n - 1's roles and every orbit of X conj Y, on the roles
  // of members 1 .. m (3^m x 3^m)
  crossFragments: (x: number, y: number) => { re: Float64Array; im: Float64Array }[]
  // the weight the pair steps found in configurations where two contact pairs share a member, summed since the last
  // call, and the number of pair steps
  takeMulti: () => { weight: number; steps: number }
  // the wall-clock seconds spent in the pair steps and in the one-body steps (a read, gating nothing)
  seconds: { pair: number; oneBody: number }
  norm: (x: number) => number
  close: () => void
}

const shared = (n: number): Float64Array =>
  new Float64Array(new SharedArrayBuffer(n * 8))
const sharedInt = (a: ArrayLike<number>): Int32Array => {
  const b = new Int32Array(new SharedArrayBuffer(Math.max(1, a.length) * 4))

  b.set(a)

  return b
}
const sharedFloat = (a: ArrayLike<number>): Float64Array => {
  const b = shared(Math.max(1, a.length))

  b.set(a)

  return b
}

const PROGRAM = `
const { workerData } = require('node:worker_threads')
const d = workerData
const ctrl = new Int32Array(d.ctrl)
const states = d.states.map(s => [new Float64Array(s[0]), new Float64Array(s[1])])
const n = d.n, f = d.f, R = d.R, B = d.B, N = d.N, tuples = d.tuples, L = d.L, G = d.G, P = d.P, M = 1 << d.P
const E = R / 3
const mom = new Int32Array(d.mom)
const A = [null, [new Float64Array(d.A1re), new Float64Array(d.A1im)], [new Float64Array(d.A2re), new Float64Array(d.A2im)]]
const classOfGrid = new Int32Array(d.classOfGrid)
const gridOfSite = new Int32Array(d.gridOfSite)
const gridOfClass = new Int32Array(d.gridOfClass)
const cosT = new Float64Array(d.cos)
const sinT = new Float64Array(d.sin)
const angle = new Float64Array(d.angle)
const sepT = new Int32Array(d.sep)
const origin = d.origin
const pairI = d.pairI
const pairJ = d.pairJ
const fibers = new Int32Array(d.fibers)
const fiberPairs = new Int32Array(d.fiberPairs)
const nf = d.nFibers
const rules = d.rules.map(r => r ? [new Int32Array(r[0]), new Int32Array(r[1]), new Float64Array(r[2]), new Float64Array(r[3])] : null)
const partial = new Float64Array(d.partial)
const W = d.workers
const id = d.id
const slot = id * d.slot
const stride = []
for (let i = 0; i < n; i++) stride.push(f ** (n - 1 - i))
const br = new Float64Array(f * R), bi = new Float64Array(f * R)
const gr = new Float64Array(G), gi = new Float64Array(G), sr = new Float64Array(L), si = new Float64Array(L)
const lr = new Float64Array(N), li = new Float64Array(N)
const cr = new Float64Array(tuples * R), ci = new Float64Array(tuples * R)
const vr = new Float64Array(R), vi = new Float64Array(R)
const axes = n - 1
const shares = []
for (let p = 0; p < P; p++) {
  for (let q = p + 1; q < P; q++) {
    if (pairI[p] === pairI[q] || pairI[p] === pairJ[q] || pairJ[p] === pairI[q] || pairJ[p] === pairJ[q]) shares.push((1 << p) | (1 << q))
  }
}
function multi(mask) {
  for (const s of shares) if ((mask & s) === s) return true
  return false
}

function dft4d(re, im, sign) {
  for (let axis = 0; axis < 4; axis++) {
    const st = L ** (3 - axis)
    const outer = L ** axis
    for (let o = 0; o < outer; o++) {
      for (let lo = 0; lo < st; lo++) {
        const base = o * L * st + lo
        if (L === 4) {
          const i0 = base, i1 = base + st, i2 = base + 2 * st, i3 = base + 3 * st
          const a0r = re[i0] + re[i2], a0i = im[i0] + im[i2]
          const a1r = re[i0] - re[i2], a1i = im[i0] - im[i2]
          const b0r = re[i1] + re[i3], b0i = im[i1] + im[i3]
          const b1r = re[i1] - re[i3], b1i = im[i1] - im[i3]
          re[i0] = a0r + b0r; im[i0] = a0i + b0i
          re[i2] = a0r - b0r; im[i2] = a0i - b0i
          re[i1] = a1r - sign * b1i; im[i1] = a1i + sign * b1r
          re[i3] = a1r + sign * b1i; im[i3] = a1i - sign * b1r
          continue
        }
        for (let m = 0; m < L; m++) {
          let r = 0, q = 0
          for (let k = 0; k < L; k++) {
            const t = (m * k) % L
            const c = cosT[t], s = sign * sinT[t]
            const ar = re[base + k * st], ai = im[base + k * st]
            r += c * ar - s * ai
            q += c * ai + s * ar
          }
          sr[m] = r; si[m] = q
        }
        for (let m = 0; m < L; m++) { re[base + m * st] = sr[m]; im[base + m * st] = si[m] }
      }
    }
  }
}

function toSites() {
  for (let g = 0; g < G; g++) { const j = classOfGrid[g]; gr[g] = lr[j]; gi[g] = li[j] }
  dft4d(gr, gi, 1)
  const k = 1 / (2 * Math.sqrt(N))
  for (let i = 0; i < N; i++) { const g = gridOfSite[i]; lr[i] = gr[g] * k; li[i] = gi[g] * k }
}

function toClasses() {
  gr.fill(0); gi.fill(0)
  for (let i = 0; i < N; i++) { const g = gridOfSite[i]; gr[g] = lr[i]; gi[g] = li[i] }
  dft4d(gr, gi, -1)
  const k = 1 / Math.sqrt(N)
  for (let j = 0; j < N; j++) { const g = gridOfClass[j]; lr[j] = gr[g] * k; li[j] = gi[g] * k }
}

// on a small torus the transform is a dense N x N matrix, applied to whole blocks at once
const dense = N <= 16
const Msr = new Float64Array(N * N), Msi = new Float64Array(N * N), Mcr = new Float64Array(N * N), Mci = new Float64Array(N * N)
if (dense) {
  for (let j = 0; j < N; j++) {
    lr.fill(0); li.fill(0); lr[j] = 1; toSites()
    for (let k = 0; k < N; k++) { Msr[k * N + j] = lr[k]; Msi[k * N + j] = li[k] }
    lr.fill(0); li.fill(0); lr[j] = 1; toClasses()
    for (let k = 0; k < N; k++) { Mcr[k * N + j] = lr[k]; Mci[k * N + j] = li[k] }
  }
}
const tr = new Float64Array(dense ? tuples * R : 1), ti = new Float64Array(dense ? tuples * R : 1)

function transform(a, dir) {
  const st = (N ** (axes - 1 - a)) * R
  const outer = N ** a
  if (dense) {
    const Mr = dir === 1 ? Msr : Mcr, Mi = dir === 1 ? Msi : Mci
    for (let o = 0; o < outer; o++) {
      const base = o * N * st
      for (let k = 0; k < N; k++) {
        const ob = base + k * st
        for (let l = 0; l < st; l++) { tr[ob + l] = 0; ti[ob + l] = 0 }
        for (let j = 0; j < N; j++) {
          const mr = Mr[k * N + j], mi = Mi[k * N + j]
          if (mr === 0 && mi === 0) continue
          const ib = base + j * st
          for (let l = 0; l < st; l++) {
            const xr0 = cr[ib + l], xi0 = ci[ib + l]
            tr[ob + l] += mr * xr0 - mi * xi0
            ti[ob + l] += mr * xi0 + mi * xr0
          }
        }
      }
      for (let k = 0; k < N * st; k++) { cr[base + k] = tr[base + k]; ci[base + k] = ti[base + k] }
    }
    return
  }
  for (let o = 0; o < outer; o++) {
    for (let lo = 0; lo < st; lo++) {
      const base = o * N * st + lo
      for (let k = 0; k < N; k++) { lr[k] = cr[base + k * st]; li[k] = ci[base + k * st] }
      if (dir === 1) toSites(); else toClasses()
      for (let k = 0; k < N; k++) { cr[base + k * st] = lr[k]; ci[base + k * st] = li[k] }
    }
  }
}

function oneBody(x, beat) {
  const re = states[x][0], im = states[x][1]
  const Ar = A[beat][0], Ai = A[beat][1]
  const lo = Math.floor((tuples * id) / W), hi = Math.floor((tuples * (id + 1)) / W)
  for (let T = lo; T < hi; T++) {
    for (let i = 0; i < n; i++) {
      const aoff = mom[T * n + i] * f * f
      const st = stride[i]
      const outer = f ** i
      const step = st * R
      for (let h = 0; h < outer; h++) {
        for (let l = 0; l < st; l++) {
          const base = (T * B + h * f * st + l) * R
          for (let k = 0; k < f; k++) {
            const ib = base + k * step
            for (let r = 0; r < R; r++) { br[k * R + r] = re[ib + r]; bi[k * R + r] = im[ib + r] }
          }
          for (let row = 0; row < f; row++) {
            const ob = base + row * step
            const ro = aoff + row * f
            for (let r = 0; r < R; r++) { re[ob + r] = 0; im[ob + r] = 0 }
            for (let k = 0; k < f; k++) {
              const ar = Ar[ro + k], ai = Ai[ro + k]
              if (ar === 0 && ai === 0) continue
              const kb = k * R
              for (let r = 0; r < R; r++) {
                const x0 = br[kb + r], x1 = bi[kb + r]
                re[ob + r] += ar * x0 - ai * x1
                im[ob + r] += ar * x1 + ai * x0
              }
            }
          }
        }
      }
    }
  }
}

function pairStep(x, rule, sign) {
  const re = states[x][0], im = states[x][1]
  const K = rules[rule]
  const sIdx = sign === 1 ? 0 : 1
  const lo = Math.floor((nf * id) / W), hi = Math.floor((nf * (id + 1)) / W)
  let mw = 0
  for (let q = lo; q < hi; q++) {
    const fb = fibers[q]
    const act = fiberPairs[q]
    for (let T = 0; T < tuples; T++) {
      const src = (T * B + fb) * R
      for (let r = 0; r < R; r++) { cr[T * R + r] = re[src + r]; ci[T * R + r] = im[src + r] }
    }
    for (let a = 0; a < axes; a++) transform(a, 1)
    for (let T = 0; T < tuples; T++) {
      let phi = 0, mask = 0
      for (let p = 0; p < P; p++) {
        if ((act >> p) & 1) {
          const sep = sepT[T * P + p]
          phi += angle[sep]
          if (sep === origin) mask |= 1 << p
        }
      }
      const c = Math.cos(sign * phi), s = Math.sin(sign * phi)
      const off = T * R
      if (mask !== 0 && K) {
        const kb = (sIdx * M + mask) * R
        const Ks = K[0], Kc = K[1], Kr = K[2], Ki = K[3]
        let w = 0
        for (let r = 0; r < R; r++) { vr[r] = cr[off + r]; vi[r] = ci[off + r]; w += vr[r] * vr[r] + vi[r] * vi[r] }
        if (multi(mask)) mw += w
        for (let r = 0; r < R; r++) {
          let yr = 0, yi = 0
          const e1 = Ks[kb + r + 1]
          for (let z = Ks[kb + r]; z < e1; z++) {
            const k = Kc[z], ar = Kr[z], ai = Ki[z]
            yr += ar * vr[k] - ai * vi[k]
            yi += ar * vi[k] + ai * vr[k]
          }
          cr[off + r] = c * yr - s * yi
          ci[off + r] = c * yi + s * yr
        }
      } else {
        if (mask !== 0 && multi(mask)) {
          for (let r = 0; r < R; r++) mw += cr[off + r] * cr[off + r] + ci[off + r] * ci[off + r]
        }
        if (phi !== 0) {
          for (let r = 0; r < R; r++) {
            const ar = cr[off + r], ai = ci[off + r]
            cr[off + r] = c * ar - s * ai
            ci[off + r] = c * ai + s * ar
          }
        }
      }
    }
    for (let a = 0; a < axes; a++) transform(a, -1)
    for (let T = 0; T < tuples; T++) {
      const dst = (T * B + fb) * R
      for (let r = 0; r < R; r++) { re[dst + r] = cr[T * R + r]; im[dst + r] = ci[T * R + r] }
    }
  }
  partial[slot] = mw
}

function crossFirst(x, y) {
  const Xr = states[x][0], Xi = states[x][1], Yr = states[y][0], Yi = states[y][1]
  const blocks = tuples * B
  const lo = Math.floor((blocks * id) / W), hi = Math.floor((blocks * (id + 1)) / W)
  const acc = new Float64Array(18)
  for (let b = lo; b < hi; b++) {
    const base = b * R
    for (let s = 0; s < 3; s++) {
      for (let t = 0; t < 3; t++) {
        let ar = 0, ai = 0
        const xo = base + s * E, yo = base + t * E
        for (let e = 0; e < E; e++) {
          const a = Xr[xo + e], bb = Xi[xo + e], c = Yr[yo + e], dd = Yi[yo + e]
          ar += a * c + bb * dd
          ai += bb * c - a * dd
        }
        acc[(s * 3 + t) * 2] += ar
        acc[(s * 3 + t) * 2 + 1] += ai
      }
    }
  }
  for (let k = 0; k < 18; k++) partial[slot + 1 + k] = acc[k]
}

function crossFragments(x, y) {
  const Xr = states[x][0], Xi = states[x][1], Yr = states[y][0], Yi = states[y][1]
  const blocks = tuples * B
  const lo = Math.floor((blocks * id) / W), hi = Math.floor((blocks * (id + 1)) / W)
  let at = slot + 19
  for (let m = 1; m < n; m++) {
    const D = 3 ** m
    const rest = 3 ** (n - 1 - m)
    const acc = new Float64Array(2 * D * D)
    for (let b = lo; b < hi; b++) {
      const base = b * R
      for (let s = 0; s < 3; s++) {
        for (let a = 0; a < D; a++) {
          const xo = base + s * E + a * rest
          for (let c = 0; c < D; c++) {
            const yo = base + s * E + c * rest
            let ar = 0, ai = 0
            for (let e = 0; e < rest; e++) {
              const p = Xr[xo + e], q = Xi[xo + e], u = Yr[yo + e], v = Yi[yo + e]
              ar += p * u + q * v
              ai += q * u - p * v
            }
            acc[(a * D + c) * 2] += ar
            acc[(a * D + c) * 2 + 1] += ai
          }
        }
      }
    }
    for (let k = 0; k < 2 * D * D; k++) partial[at + k] = acc[k]
    at += 2 * D * D
  }
}

Atomics.add(ctrl, 3, 1)
Atomics.notify(ctrl, 3)
let gen = 0
for (;;) {
  Atomics.wait(ctrl, 1, gen)
  gen = Atomics.load(ctrl, 1)
  const cmd = Atomics.load(ctrl, 0)
  if (cmd === 9) break
  if (cmd === 1) oneBody(ctrl[4], ctrl[7])
  else if (cmd === 2) pairStep(ctrl[4], ctrl[6], ctrl[7] === 1 ? 1 : -1)
  else if (cmd === 3) crossFirst(ctrl[4], ctrl[5])
  else if (cmd === 4) crossFragments(ctrl[4], ctrl[5])
  Atomics.add(ctrl, 2, 1)
  Atomics.notify(ctrl, 2)
}
`

// a c-member operator (3^c x 3^c, members `support` in increasing order) embedded in the R x R role space of n members,
// the identity on every other member, with exact zeros off its support
function embedSupport(
  n: number,
  support: readonly number[],
  K: { re: Float64Array; im: Float64Array },
): { re: Float64Array; im: Float64Array } {
  const R = ROLE ** n
  const c = support.length
  const D = ROLE ** c
  const re = new Float64Array(R * R)
  const im = new Float64Array(R * R)
  const digit = (r: number, i: number): number =>
    Math.floor(r / ROLE ** (n - 1 - i)) % ROLE

  for (let r = 0; r < R; r++) {
    let local = 0
    let rest = r

    for (const i of support) {
      const d = digit(r, i)

      local = local * ROLE + d
      rest -= d * ROLE ** (n - 1 - i)
    }

    for (let b = 0; b < D; b++) {
      const kr = K.re[b * D + local]!
      const ki = K.im[b * D + local]!

      if (kr === 0 && ki === 0) {
        continue
      }

      let row = rest
      let bb = b

      for (let s = c - 1; s >= 0; s--) {
        row += (bb % ROLE) * ROLE ** (n - 1 - support[s]!)
        bb = Math.floor(bb / ROLE)
      }

      re[row * R + r] = kr
      im[row * R + r] = ki
    }
  }

  return { re, im }
}

// the role kernel of one rule as sparse rows: for both beat signs and every mask of contact pairs that occurs, K_s(mask).
// A mask splits into groups of members that meet (pairs sharing a member); each group's kernel acts on its own members'
// roles only, and groups on different members commute
function kernelTable(input: {
  n: number
  pairs: [number, number][]
  rule: RoleRule
  fear: number
  masks: number[]
}): { start: Int32Array; col: Int32Array; re: Float64Array; im: Float64Array } | null {
  const { n, pairs, rule, fear, masks } = input

  if (rule.form === 'off') {
    return null
  }

  const R = ROLE ** n
  const P = pairs.length
  const M = 1 << P
  const start = new Int32Array(2 * M * R + 1)
  const cols: number[] = []
  const res: number[] = []
  const ims: number[] = []
  const tables = new Map<number, { re: Float64Array; im: Float64Array }>()

  for (const mask of masks) {
    for (const [sIdx, sign] of [
      [0, 1],
      [1, -1],
    ] as const) {
      // the groups: connected components of the mask's pairs
      const left = pairs.map((_, p) => p).filter(p => (mask >> p) & 1)
      const groups: number[][] = []

      while (left.length > 0) {
        const comp = [left.shift()!]
        let grew = true

        while (grew) {
          grew = false

          for (let k = left.length - 1; k >= 0; k--) {
            const q = left[k]!
            const touches = comp.some(p =>
              pairs[p]!.some(m => pairs[q]!.includes(m)),
            )

            if (touches) {
              comp.push(left.splice(k, 1)[0]!)
              grew = true
            }
          }
        }

        groups.push(comp.sort((a, b) => a - b))
      }

      let K = embedSupport(n, [], {
        re: Float64Array.from([1]),
        im: Float64Array.from([0]),
      })

      for (const comp of groups) {
        const support = [...new Set(comp.flatMap(p => pairs[p]!))].sort(
          (a, b) => a - b,
        )
        const c = support.length
        const D = ROLE ** c
        const local = comp.map(p =>
          embedPair(
            c,
            support.indexOf(pairs[p]![0]),
            support.indexOf(pairs[p]![1]),
            pairChannel(
              rule.form,
              rule.species[pairs[p]![0]] === rule.species[pairs[p]![1]],
            ),
          ),
        )

        let G: { re: Float64Array; im: Float64Array }

        if (rule.compose === 'sum') {
          const S = new Float64Array(D * D)

          for (const H of local) {
            for (let k = 0; k < D * D; k++) {
              S[k]! += H[k]!
            }
          }

          G = expSymmetric(S, D, sign * fear)
        } else {
          G = expSymmetric(new Float64Array(D * D), D, 0)

          // later pairs act after earlier ones: G <- exp(H_p) G
          for (const H of local) {
            G = complexProduct(expSymmetric(H, D, sign * fear), G, D)
          }
        }

        K = complexProduct(embedSupport(n, support, G), K, R)
      }

      tables.set(sIdx * M + mask, K)
    }
  }

  for (let key = 0; key < 2 * M; key++) {
    const K = tables.get(key)

    for (let r = 0; r < R; r++) {
      start[key * R + r] = cols.length

      if (!K) {
        continue
      }

      for (let k = 0; k < R; k++) {
        const kr = K.re[r * R + k]!
        const ki = K.im[r * R + k]!

        if (kr !== 0 || ki !== 0) {
          cols.push(k)
          res.push(kr)
          ims.push(ki)
        }
      }
    }
  }

  start[2 * M * R] = cols.length

  return {
    start: sharedInt(start),
    col: sharedInt(cols),
    re: sharedFloat(res),
    im: sharedFloat(ims),
  }
}

export function roleEngine(input: {
  frame: HoleFrame
  n: number
  total: number
  // the pair angle at each relative site (register-holes pairAngles), taken by every pair
  angle: Float64Array
  fear: number
  rules: readonly RoleRule[]
  states: number
  threads: number
}): RoleEngine {
  const { frame: fr, n, total, angle, fear, rules, threads } = input
  const F = fr.fourier
  const N = F.N
  const f = fr.fiber
  const R = ROLE ** n
  const B = f ** n
  const tuples = N ** (n - 1)
  const size = tuples * B * R
  const pairs: [number, number][] = []

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j])
    }
  }

  const P = pairs.length

  // the member momenta of every tuple (register-holes memberMomenta's convention)
  const mom = new Int32Array(tuples * n)

  for (let T = 0; T < tuples; T++) {
    let rest = T
    let acc = total

    for (let i = n - 2; i >= 0; i--) {
      const j = rest % N

      rest = Math.floor(rest / N)
      mom[T * n + i] = j
      acc = F.sum[acc * N + F.neg[j]!]!
    }

    mom[T * n + n - 1] = acc
  }

  // the separation of every pair at every site tuple, member n - 1 at the origin
  const origin = fr.t.origin
  const sep = new Int32Array(tuples * P)
  const site = new Int32Array(n)

  for (let T = 0; T < tuples; T++) {
    let rest = T

    for (let i = n - 2; i >= 0; i--) {
      site[i] = rest % N
      rest = Math.floor(rest / N)
    }

    site[n - 1] = origin

    pairs.forEach(([i, j], p) => {
      sep[T * P + p] = F.diff[site[i]! * N + site[j]!]!
    })
  }

  // the fibers with two or more members in the sector, and their in-sector pairs
  const fibers: number[] = []
  const fiberPairs: number[] = []

  for (let fb = 0; fb < B; fb++) {
    let act = 0

    pairs.forEach(([i, j], p) => {
      const bi = Math.floor(fb / f ** (n - 1 - i)) % f
      const bj = Math.floor(fb / f ** (n - 1 - j)) % f

      if (fr.sector[bi] && fr.sector[bj]) {
        act |= 1 << p
      }
    })

    if (act !== 0) {
      fibers.push(fb)
      fiberPairs.push(act)
    }
  }

  // every contact mask that can occur
  const maskSet = new Set<number>()

  for (const act of new Set(fiberPairs)) {
    for (let T = 0; T < tuples; T++) {
      let mask = 0

      for (let p = 0; p < P; p++) {
        if ((act >> p) & 1 && sep[T * P + p] === origin) {
          mask |= 1 << p
        }
      }

      if (mask !== 0) {
        maskSet.add(mask)
      }
    }
  }

  const masks = [...maskSet].sort((a, b) => a - b)
  const tables = rules.map(rule => kernelTable({ n, pairs, rule, fear, masks }))
  const flat = (ms: readonly { re: Float64Array; im: Float64Array }[], part: 're' | 'im'): Float64Array => {
    const out = shared(N * f * f)

    ms.forEach((m, j) => out.set(m[part], j * f * f))

    return out
  }

  let slotSize = 19

  for (let m = 1; m < n; m++) {
    slotSize += 2 * 9 ** m
  }

  const pool = Array.from({ length: input.states }, () => ({
    re: shared(size),
    im: shared(size),
  }))
  const ctrl = new Int32Array(new SharedArrayBuffer(16 * 4))
  const partial = shared(threads * slotSize)
  const data = {
    ctrl: ctrl.buffer,
    states: pool.map(s => [s.re.buffer, s.im.buffer]),
    n,
    f,
    R,
    B,
    N,
    tuples,
    L: F.L,
    G: F.G,
    P,
    mom: sharedInt(mom).buffer,
    A1re: flat(fr.A1, 're').buffer,
    A1im: flat(fr.A1, 'im').buffer,
    A2re: flat(fr.A2, 're').buffer,
    A2im: flat(fr.A2, 'im').buffer,
    classOfGrid: sharedInt(F.classOfGrid).buffer,
    gridOfSite: sharedInt(F.gridOfSite).buffer,
    gridOfClass: sharedInt(F.gridOfClass).buffer,
    cos: sharedFloat(F.cos).buffer,
    sin: sharedFloat(F.sin).buffer,
    angle: sharedFloat(angle).buffer,
    sep: sharedInt(sep).buffer,
    origin,
    pairI: pairs.map(p => p[0]),
    pairJ: pairs.map(p => p[1]),
    fibers: sharedInt(fibers).buffer,
    fiberPairs: sharedInt(fiberPairs).buffer,
    nFibers: fibers.length,
    rules: tables.map(t =>
      t ? [t.start.buffer, t.col.buffer, t.re.buffer, t.im.buffer] : null,
    ),
    partial: partial.buffer,
    workers: threads,
    slot: slotSize,
  }
  const workers = Array.from({ length: threads }, (_, id) => {
    const w = new Worker(PROGRAM, { eval: true, workerData: { ...data, id } })

    w.unref()

    return w
  })

  for (;;) {
    const ready = Atomics.load(ctrl, 3)

    if (ready >= threads) {
      break
    }

    Atomics.wait(ctrl, 3, ready, 1000)
  }

  const run = (cmd: number): void => {
    Atomics.store(ctrl, 0, cmd)
    Atomics.store(ctrl, 2, 0)
    Atomics.add(ctrl, 1, 1)
    Atomics.notify(ctrl, 1)

    for (;;) {
      const done = Atomics.load(ctrl, 2)

      if (done >= threads) {
        break
      }

      Atomics.wait(ctrl, 2, done, 1000)
    }
  }

  let multiWeight = 0
  let multiSteps = 0

  const seconds = { pair: 0, oneBody: 0 }

  return {
    frame: fr,
    n,
    total,
    R,
    B,
    tuples,
    size,
    pairs,
    states: pool,
    beat: (x, rule, beat) => {
      ctrl[4] = x
      ctrl[6] = rule
      ctrl[7] = beat

      const t0 = performance.now()

      run(2)

      const t1 = performance.now()

      for (let t = 0; t < threads; t++) {
        multiWeight += partial[t * slotSize]!
      }

      multiSteps++
      run(1)
      seconds.pair += (t1 - t0) / 1000
      seconds.oneBody += (performance.now() - t1) / 1000
    },
    seconds,
    crossFirst: (x, y) => {
      ctrl[4] = x
      ctrl[5] = y
      run(3)

      const re = new Float64Array(9)
      const im = new Float64Array(9)

      for (let t = 0; t < threads; t++) {
        for (let k = 0; k < 9; k++) {
          re[k]! += partial[t * slotSize + 1 + 2 * k]!
          im[k]! += partial[t * slotSize + 2 + 2 * k]!
        }
      }

      return { re, im }
    },
    crossFragments: (x, y) => {
      ctrl[4] = x
      ctrl[5] = y
      run(4)

      const out: { re: Float64Array; im: Float64Array }[] = []

      let at = 19

      for (let m = 1; m < n; m++) {
        const D2 = 9 ** m
        const re = new Float64Array(D2)
        const im = new Float64Array(D2)

        for (let t = 0; t < threads; t++) {
          for (let k = 0; k < D2; k++) {
            re[k]! += partial[t * slotSize + at + 2 * k]!
            im[k]! += partial[t * slotSize + at + 2 * k + 1]!
          }
        }

        out.push({ re, im })
        at += 2 * D2
      }

      return out
    },
    takeMulti: () => {
      const r = { weight: multiWeight, steps: multiSteps }

      multiWeight = 0
      multiSteps = 0

      return r
    },
    norm: x => {
      const s = pool[x]!
      let w = 0

      for (let k = 0; k < size; k++) {
        w += s.re[k]! ** 2 + s.im[k]! ** 2
      }

      return w
    },
    close: () => {
      Atomics.store(ctrl, 0, 9)
      Atomics.add(ctrl, 1, 1)
      Atomics.notify(ctrl, 1)

      for (const w of workers) {
        void w.terminate()
      }
    },
  }
}

// ---- starts ----

export type RoleMember = {
  // the member's role, a vector in C^3
  role: RoleState3
  // a dock start: the fiber index (a sector state when below 4, momentum independent). A band start: the momentum class and
  // a fiber vector
  fiber?: number
  momentum?: number
  vector?: Vec
}

const permSign = (p: readonly number[]): number => {
  let s = 1

  for (let i = 0; i < p.length; i++) {
    for (let j = i + 1; j < p.length; j++) {
      if (p[i]! > p[j]!) {
        s = -s
      }
    }
  }

  return s
}

// the permutations of 0 .. n - 1 that keep every group and move members only within their group
function groupPerms(n: number, groups: readonly (readonly number[])[]): number[][] {
  return allPerms(n).filter(p =>
    p.every((q, i) => {
      const g = groups.find(x => x.includes(i))

      return g ? g.includes(q) : q === i
    }),
  )
}

// the start: member i holds members[p(i)] for every permutation p within the groups (identical members), with the
// permutation's sign, normalized. With every member's `fiber` set, all members sit on one dock (relative sites all 0,
// so the momentum amplitude is uniform over the tuples); otherwise each member has a momentum class and a fiber vector,
// and the momenta must sum to the total
export function roleStart(input: {
  engine: RoleEngine
  x: number
  members: readonly RoleMember[]
  groups: readonly (readonly number[])[]
}): void {
  const { engine: e, x, members, groups } = input
  const fr = e.frame
  const N = fr.fourier.N
  const f = fr.fiber
  const n = e.n
  const R = e.R
  const B = e.B
  const s = e.states[x]!
  const dock = members.every(m => m.fiber !== undefined)
  const perms = groupPerms(n, groups)
  const roleRe = new Float64Array(R)
  const roleIm = new Float64Array(R)

  s.re.fill(0)
  s.im.fill(0)

  for (const p of perms) {
    const sg = permSign(p)

    // the role product
    for (let r = 0; r < R; r++) {
      let pr = 1
      let pi = 0

      for (let i = 0; i < n; i++) {
        const ri = Math.floor(r / ROLE ** (n - 1 - i)) % ROLE
        const m = members[p[i]!]!
        const ar = m.role.re[ri]!
        const ai = m.role.im[ri]!
        const nr = pr * ar - pi * ai

        pi = pr * ai + pi * ar
        pr = nr
      }

      roleRe[r] = pr
      roleIm[r] = pi
    }

    if (dock) {
      let fb = 0

      for (let i = 0; i < n; i++) {
        fb = fb * f + members[p[i]!]!.fiber!
      }

      const amp = sg / Math.sqrt(N ** (n - 1))

      for (let T = 0; T < e.tuples; T++) {
        const base = (T * B + fb) * R

        for (let r = 0; r < R; r++) {
          s.re[base + r]! += amp * roleRe[r]!
          s.im[base + r]! += amp * roleIm[r]!
        }
      }

      continue
    }

    let acc = e.total

    for (let i = 0; i < n; i++) {
      acc = fr.fourier.sum[acc * N + fr.fourier.neg[members[i]!.momentum!]!]!
    }

    if (acc !== 0) {
      throw new Error('role-holes: the start momenta do not sum to the total')
    }

    let T = 0

    for (let i = 0; i < n - 1; i++) {
      T = T * N + members[p[i]!]!.momentum!
    }

    const idx = new Int32Array(n)

    for (let fb = 0; fb < B; fb++) {
      let rest = fb

      for (let i = n - 1; i >= 0; i--) {
        idx[i] = rest % f
        rest = Math.floor(rest / f)
      }

      let ar = sg
      let ai = 0

      for (let i = 0; i < n; i++) {
        const v = members[p[i]!]!.vector!
        const vr = v.re[idx[i]!]!
        const vi = v.im[idx[i]!]!
        const nr = ar * vr - ai * vi

        ai = ar * vi + ai * vr
        ar = nr
      }

      if (ar === 0 && ai === 0) {
        continue
      }

      const base = (T * B + fb) * R

      for (let r = 0; r < R; r++) {
        s.re[base + r]! += ar * roleRe[r]! - ai * roleIm[r]!
        s.im[base + r]! += ar * roleIm[r]! + ai * roleRe[r]!
      }
    }
  }

  const nrm = Math.sqrt(e.norm(x))

  for (let k = 0; k < e.size; k++) {
    s.re[k]! /= nrm
    s.im[k]! /= nrm
  }
}

// the largest |P x + x| over the transpositions of members inside each group (0 when x is antisymmetric there)
export function exchangeResidual(input: {
  engine: RoleEngine
  x: number
  groups: readonly (readonly number[])[]
}): number {
  const { engine: e, x, groups } = input
  const fr = e.frame
  const N = fr.fourier.N
  const f = fr.fiber
  const n = e.n
  const R = e.R
  const B = e.B
  const s = e.states[x]!
  const mom = new Int32Array(n)
  const bits = new Int32Array(n)
  const roles = new Int32Array(n)

  let worst = 0

  for (const g of groups) {
    for (let a = 0; a < g.length; a++) {
      for (let b = a + 1; b < g.length; b++) {
        const perm = Array.from({ length: n }, (_, i) => i)

        perm[g[a]!] = g[b]!
        perm[g[b]!] = g[a]!

        for (let T = 0; T < e.tuples; T++) {
          let rest = T
          let acc = e.total

          for (let i = n - 2; i >= 0; i--) {
            const j = rest % N

            rest = Math.floor(rest / N)
            mom[perm[i]!] = j
            acc = fr.fourier.sum[acc * N + fr.fourier.neg[j]!]!
          }

          mom[perm[n - 1]!] = acc

          let T2 = 0

          for (let i = 0; i < n - 1; i++) {
            T2 = T2 * N + mom[i]!
          }

          for (let fb = 0; fb < B; fb++) {
            for (let i = 0; i < n; i++) {
              bits[perm[i]!] = Math.floor(fb / f ** (n - 1 - i)) % f
            }

            let fb2 = 0

            for (let i = 0; i < n; i++) {
              fb2 = fb2 * f + bits[i]!
            }

            for (let r = 0; r < R; r++) {
              for (let i = 0; i < n; i++) {
                roles[perm[i]!] = Math.floor(r / ROLE ** (n - 1 - i)) % ROLE
              }

              let r2 = 0

              for (let i = 0; i < n; i++) {
                r2 = r2 * ROLE + roles[i]!
              }

              const k1 = (T * B + fb) * R + r
              const k2 = (T2 * B + fb2) * R + r2

              worst = Math.max(
                worst,
                Math.hypot(s.re[k1]! + s.re[k2]!, s.im[k1]! + s.im[k2]!),
              )
            }
          }
        }
      }
    }
  }

  return worst
}

// ---- reads on role states ----

// the von Neumann entropy in bits of a Hermitian D x D matrix (re, im), normalized by its trace
export function entropyBits(rho: { re: Float64Array; im: Float64Array }, D: number): number {
  const m = makeDense({ rows: 2 * D, cols: 2 * D })
  let tr = 0

  for (let i = 0; i < D; i++) {
    tr += rho.re[i * D + i]!
  }

  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      const a = (rho.re[i * D + j]! + rho.re[j * D + i]!) / (2 * tr)
      const b = (rho.im[i * D + j]! - rho.im[j * D + i]!) / (2 * tr)

      m.data[i * 2 * D + j] = a
      m.data[(D + i) * 2 * D + D + j] = a
      m.data[i * 2 * D + D + j] = -b
      m.data[(D + i) * 2 * D + j] = b
    }
  }

  // the real 2D embedding doubles every eigenvalue
  const { values } = eigSymmetric({ matrix: m })

  let S = 0

  for (const v of values) {
    if (v > 1e-14) {
      S -= (v * Math.log2(v)) / 2
    }
  }

  return S + 0
}

// the Holevo quantity of an equally weighted ensemble of D x D states, in bits
export function holevoBits(states: readonly { re: Float64Array; im: Float64Array }[], D: number): number {
  const mean = { re: new Float64Array(D * D), im: new Float64Array(D * D) }

  let each = 0

  for (const s of states) {
    let tr = 0

    for (let i = 0; i < D; i++) {
      tr += s.re[i * D + i]!
    }

    for (let k = 0; k < D * D; k++) {
      mean.re[k]! += s.re[k]! / tr / states.length
      mean.im[k]! += s.im[k]! / tr / states.length
    }

    each += entropyBits(s, D) / states.length
  }

  return entropyBits(mean, D) - each
}
