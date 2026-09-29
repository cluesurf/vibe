// The Coulomb energy of a static charge in the QUANTUM light, and how it depends on the split of kappa between
// drift and force (E-FRC-0242). Measurement only: the rule is code/rule/loop-ring (the plaquette ladder's
// factors, every exponent an integer mod M, E-FRC-0230 to 0237).
//
// THE SHIFT THEOREM (continuum Weyl reading). On the ladder a STAND-IN static charge pair across rung 0 adds x = 1
// to that rung's flux. The drift is zeta_M^(-c sum bal(e)^2) = exp(-i (pi s / N) sum e^2) with e = e0(x) + curl m,
// m the squares' loop registers. Let m* be the REAL m minimizing sum (e0 + curl m)^2 and E* that minimum. Then
// sum (e0 + curl m)^2 = E* + sum (curl (m - m*))^2 exactly (the cross term vanishes at the minimum), so were m
// real, the beat in sector x = 1 would be exp(-i (pi s / N) E*) T U(0) T^-1 with T the translation by m*, which
// commutes with the force (the force is diagonal in the angle, T's generator). Every quasi-energy would shift by
//   Delta = (pi s / N) E*,   the static Coulomb energy, carried by the DRIFT'S share s alone.
// But m is an integer register: T is a fractional translation, exact only when the loop registers' states are
// wide in m (then the error is exp(-2 pi^2 sigma_m^2)-small). The width is set by the split: in the harmonic
// reading the vacuum is exp(-1/2 m^T W m), W = (2 pi / N) sqrt(s / f) K^(1/2), K = A^T A the loop registers'
// curl-curl, so sigma_m^2 grows as sqrt(f / s) N / (2 pi). With the classical light's split (s = 1, f = 2 / N)
// sigma_m^2 is of order 0.2 at every N, the registers sit near integers, and the static energy need not be the
// Coulomb form (on two squares E* = 2/3 while the integer minimum is 1). With the force carrying its share
// (f / s = links per square, or the drift-carried split f = 1), sigma_m^2 grows with N and the shift is the
// Coulomb energy.
//
// The ground of each sector is identified as the Floquet eigenvector of largest overlap with that harmonic
// vacuum centered at m*(x) (the least-generator-energy choice is not usable: a probe at N = 9 found the Floquet
// eigenvectors mix the ground with folded high levels, so their generator energies do not order them).
//
// So the charge's Coulomb coefficient in the quantum light is C = s kappa / 24 (husk Green's function 1/(24 pi r)
// times the drift's phase 2 pi s / N per unit of 1/2 e^2), and it is a Coulomb coefficient at all only when the
// split lets the loop registers spread.

import { bal } from '@/code/rule/lattice-qed'
import {
  ladderLoopSpec,
  loopBeat,
  loopKernel,
  loopSplit,
  type LoopSpec,
  type Split,
} from '@/code/rule/loop-ring'
import { unitaryEigen } from '@/code/measure/quantum-ladder'

// the classical light's split (drift carries the unit, force the 2/N), and the drift-carried split
export const classicalSplit = (n: number): Split => ({
  root: 2 * n * n,
  drift: n,
  force: 2,
  ratio: 2 / n,
  w: 1,
})
export const driftCarriedSplit = (n: number): Split => ({
  root: 2 * n * n,
  drift: 2,
  force: n,
  ratio: n / 2,
  w: 1,
})

// the ladder's link rows: bottom rail p reads m_p, top rail p reads m_p, rung j reads m_(j-1) - m_j (+ x on rung 0)
function ladderRows(
  L: number,
  x: number,
): { coef: number[]; offset: number }[] {
  const rows: { coef: number[]; offset: number }[] = []

  for (let p = 0; p < L; p++) {
    rows.push({
      coef: Array.from({ length: L }, (_, q) => (q === p ? 1 : 0)),
      offset: 0,
    })
  }

  for (let p = 0; p < L; p++) {
    rows.push({
      coef: Array.from({ length: L }, (_, q) => (q === p ? 1 : 0)),
      offset: 0,
    })
  }

  for (let j = 0; j < L; j++) {
    const c = new Array<number>(L).fill(0)
    const a = (j - 1 + L) % L

    c[a] = c[a]! + 1
    c[j] = c[j]! - 1
    rows.push({ coef: c, offset: j === 0 ? x : 0 })
  }

  return rows
}

function solve(a: number[][], b: number[]): number[] {
  const n = b.length
  const m = a.map(r => r.slice())
  const y = b.slice()

  for (let j = 0; j < n; j++) {
    for (let i = j + 1; i < n; i++) {
      const f = m[i]![j]! / m[j]![j]!

      for (let k = j; k < n; k++) {
        m[i]![k] = m[i]![k]! - f * m[j]![k]!
      }

      y[i] = y[i]! - f * y[j]!
    }
  }

  const out = new Array<number>(n).fill(0)

  for (let j = n - 1; j >= 0; j--) {
    let s = y[j]!

    for (let k = j + 1; k < n; k++) {
      s -= m[j]![k]! * out[k]!
    }

    out[j] = s / m[j]![j]!
  }

  return out
}

// the loop registers' curl-curl K = A^T A, the real minimizer m* of sum (e0 + A m)^2, and the minimum E*
export function realMinimizer(
  L: number,
  x: number,
): { k: number[][]; m: number[]; value: number } {
  const rows = ladderRows(L, x)
  const k = Array.from({ length: L }, () =>
    new Array<number>(L).fill(0),
  )
  const b = new Array<number>(L).fill(0)

  for (const r of rows) {
    for (let i = 0; i < L; i++) {
      b[i] = b[i]! - r.coef[i]! * r.offset

      for (let j = 0; j < L; j++) {
        k[i]![j] = k[i]![j]! + r.coef[i]! * r.coef[j]!
      }
    }
  }

  const m = solve(k, b)
  const value = rows.reduce(
    (s, r) =>
      s +
      (r.offset + r.coef.reduce((a, c, i) => a + c * m[i]!, 0)) ** 2,
    0,
  )

  return { k, m, value }
}

export const realMinimum = (L: number, x: number): number =>
  realMinimizer(L, x).value

// the integer minimum over m in Z^L (small L, a box search)
export function integerMinimum(
  L: number,
  x: number,
  reach = 3,
): number {
  const rows = ladderRows(L, x)

  let best = Infinity

  const m = new Array<number>(L).fill(-reach)

  for (;;) {
    const s = rows.reduce(
      (a, r) =>
        a +
        (r.offset + r.coef.reduce((b, c, i) => b + c * m[i]!, 0)) ** 2,
      0,
    )

    best = Math.min(best, s)

    let p = 0

    while (p < L && m[p] === reach) {
      m[p++] = -reach
    }

    if (p === L) {
      break
    }

    m[p] = m[p]! + 1
  }

  return best
}

// K^(1/2) for a small symmetric K, by Jacobi rotations
function symmetricSqrt(k: number[][]): number[][] {
  const n = k.length
  const a = k.map(r => r.slice())
  const v: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j): number => (i === j ? 1 : 0)),
  )

  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += a[p]![q]! ** 2
      }
    }

    if (off < 1e-30) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p]![q]!) < 1e-300) {
          continue
        }

        const theta = (a[q]![q]! - a[p]![p]!) / (2 * a[p]![q]!)
        const t =
          Math.sign(theta || 1) /
          (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let r = 0; r < n; r++) {
          const arp = a[r]![p]!
          const arq = a[r]![q]!

          a[r]![p] = c * arp - s * arq
          a[r]![q] = s * arp + c * arq
        }

        for (let r = 0; r < n; r++) {
          const apr = a[p]![r]!
          const aqr = a[q]![r]!

          a[p]![r] = c * apr - s * aqr
          a[q]![r] = s * apr + c * aqr
        }

        for (let r = 0; r < n; r++) {
          const vrp = v[r]![p]!
          const vrq = v[r]![q]!

          v[r]![p] = c * vrp - s * vrq
          v[r]![q] = s * vrp + c * vrq
        }
      }
    }
  }

  const root = a.map((r, i) => Math.sqrt(Math.max(0, r[i]!)))

  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      v[i]!.reduce((s, x, l) => s + x * root[l]! * v[j]![l]!, 0),
    ),
  )
}

export type StaticShift = {
  n: number
  L: number
  s: number
  f: number
  // the ground quasi-energies (per beat) of sectors x = 0, 1, and their difference
  ground0: number
  ground1: number
  shift: number
  predicted: number
  ratio: number
  // (pi s / N) E_int over the prediction: what a register pinned to integers would read
  integerRatio: number
  // the identification: the chosen eigenvector's overlap with the harmonic vacuum, and the next largest
  overlap0: number
  overlap1: number
  nextOverlap: number
  // the harmonic vacuum's register spread, sum_p sigma_p^2 / L
  sigma2: number
  residual: number
  seconds: number
}

// the dense beat of one sector (x fixed), as row-major re, im
function sectorMatrix(
  spec: LoopSpec,
  x: number,
): { re: Float64Array; im: Float64Array; dim: number } {
  const k = loopKernel(spec)
  const half = k.half
  const re = new Float64Array(half * half)
  const im = new Float64Array(half * half)
  const vr = new Float64Array(k.size)
  const vi = new Float64Array(k.size)

  for (let j = 0; j < half; j++) {
    vr.fill(0)
    vi.fill(0)
    vr[x * half + j] = 1
    loopBeat(k, vr, vi)

    for (let i = 0; i < half; i++) {
      re[i * half + j] = vr[x * half + i]!
      im[i * half + j] = vi[x * half + i]!
    }
  }

  return { re, im, dim: half }
}

// the harmonic vacuum of sector x: exp(-1/2 (m - m*)^T W (m - m*)), m read balanced, normalized
function harmonicVacuum(
  spec: LoopSpec,
  x: number,
): { v: Float64Array; sigma2: number } {
  const n = spec.n
  const L = spec.squares
  const { s, f } = loopSplit(spec)
  const { k, m: center } = realMinimizer(L, x)
  const root = symmetricSqrt(k)
  const scale = ((2 * Math.PI) / n) * Math.sqrt(s / f)
  const w = root.map(r => r.map(v => scale * v))
  const half = n ** L
  const out = new Float64Array(half)
  const d = new Array<number>(L).fill(0)

  let norm = 0

  for (let i = 0; i < half; i++) {
    let rest = i

    for (let p = 0; p < L; p++) {
      d[p] = bal(rest % n, n) - center[p]!
      rest = Math.floor(rest / n)
    }

    let q = 0

    for (let a = 0; a < L; a++) {
      for (let b = 0; b < L; b++) {
        q += d[a]! * w[a]![b]! * d[b]!
      }
    }

    out[i] = Math.exp(-q / 2)
    norm += out[i]! ** 2
  }

  for (let i = 0; i < half; i++) {
    out[i] = out[i]! / Math.sqrt(norm)
  }

  // sigma^2 = diag(W^-1) / 2, averaged
  const inv = Array.from({ length: L }, (_, j) =>
    solve(
      w,
      Array.from({ length: L }, (__, i) => (i === j ? 1 : 0)),
    ),
  )
  const sigma2 = inv.reduce((acc, col, j) => acc + col[j]! / 2, 0) / L

  return { v: out, sigma2 }
}

const wrap = (a: number): number => {
  let b = a

  while (b > Math.PI) {
    b -= 2 * Math.PI
  }

  while (b <= -Math.PI) {
    b += 2 * Math.PI
  }

  return b
}

export function staticShift(
  n: number,
  L: number,
  split: Split,
): StaticShift {
  const started = Date.now()
  const spec = ladderLoopSpec(n, L, split, 0)
  const { s, f } = loopSplit(spec)
  const ground: { phase: number; overlap: number; next: number }[] = []

  let residual = 0
  let sigma2 = 0

  for (const x of [0, 1]) {
    const m = sectorMatrix(spec, x)
    const eig = unitaryEigen(m.dim, m.re, m.im)
    const trial = harmonicVacuum(spec, x)

    residual = Math.max(residual, eig.residual)

    if (x === 0) {
      sigma2 = trial.sigma2
    }

    const overlaps = eig.vectors.map(v => {
      let r = 0
      let i = 0

      for (let j = 0; j < m.dim; j++) {
        r += trial.v[j]! * v.re[j]!
        i += trial.v[j]! * v.im[j]!
      }

      return r * r + i * i
    })
    const order = overlaps
      .map((o, i) => [o, i] as const)
      .sort((a, b) => b[0] - a[0])

    ground.push({
      phase: eig.phases[order[0]![1]]!,
      overlap: order[0]![0],
      next: order[1]?.[0] ?? 0,
    })
  }

  // quasi-energy = -phase per beat
  const shift = wrap(-(ground[1]!.phase - ground[0]!.phase))
  const predicted = ((Math.PI * s) / n) * realMinimum(L, 1)
  const integer = ((Math.PI * s) / n) * integerMinimum(L, 1)

  return {
    n,
    L,
    s,
    f,
    ground0: -ground[0]!.phase,
    ground1: -ground[1]!.phase,
    shift,
    predicted,
    ratio: shift / predicted,
    integerRatio: integer / predicted,
    overlap0: ground[0]!.overlap,
    overlap1: ground[1]!.overlap,
    nextOverlap: Math.max(ground[0]!.next, ground[1]!.next),
    sigma2,
    residual,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the closed forms (E-FRC-0242), N = 2D + 1, kappa = 2 / N, c = sqrt(2 kappa / 3) (E-FRC-0212, 0235)

export const kappaOfDepth = (d: number): number => 2 / (2 * d + 1)
export const huskLightSpeed = (d: number): number =>
  Math.sqrt((2 * kappaOfDepth(d)) / 3)

// the Coulomb coefficient C = s kappa / 24 and alpha = C / c for a drift share s
export const coulombOfShare = (d: number, s: number): number =>
  (s * kappaOfDepth(d)) / 24
export const alphaOfShare = (d: number, s: number): number =>
  coulombOfShare(d, s) / huskLightSpeed(d)

// the share of a split with f / s = rho: s = sqrt(kappa / rho); then alpha = kappa sqrt(3 / (2 rho)) / 24
export const shareOfRatio = (d: number, rho: number): number =>
  Math.sqrt(kappaOfDepth(d) / rho)
export const alphaOfRatio = (d: number, rho: number): number =>
  (kappaOfDepth(d) * Math.sqrt(3 / (2 * rho))) / 24
