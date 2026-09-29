// Measurement for E-SPN-0112: binding by the drift cost alone, with no contact at a full dock.
//
// TWO STAND-INS.
// (A) THE STRING-ONLY TRIO. code/measure/coined-line-bloch's three loves on one bulk line ('fermion', flavors
//     [0, 0, 0]) with the contact unit 4. A full dock there picks up det C (the coin), w (the meeting) and the lift
//     e^(i pi unit/3); unit 4 makes the lift w^2, so meeting times lift is w^3 = 1 and the full dock keeps det C alone,
//     which is what two free fermions on the dock's two slots get from the coin. So unit 4 is free fermions with the
//     string (contactEnergy 0). `slaterGap` checks this exactly: one beat of the ring form of the sector against the
//     Slater determinant of three single walks.
// (B) THE MESON. A love and a fear under C on one husk line, the locked pair stand-in of code/measure/drift-cost-bloch
//     (boxSpec(['love', 'fear'], D, box)): unlike 'knit', so a love and a fear on one dock pass through each other
//     with no meeting, and the only thing between them is the string, zeta_(2N)^(-|d|). flux-store-bloch's beat has the
//     working coin only; `pairColumn` is the same beat with the fine coin of code/rule/fine-coin (keep (1 + zeta)/2,
//     cross (1 - zeta)/2, zeta = e^(2 pi i/(3 fine))), and equals blochColumn at fine 1 (checked in the experiment).
//     The relative space is one dimensional (d = x_fear - x_love in -box .. box), so the basis is 4 (2 box + 1).
//
// THE PAIR READING (`pairReader`). A K = 0 level phi(d, j0, j1) read in relative momentum p on a ring of L docks:
// token 0 at -p, token 1 at p, each projected on the lone walk's own branches at the fine coin (B, the particle
// branch through E = 0 at k = 0; A the other). The particle sector is the even count (BB and AA, as
// flux-store-bloch's branchReader: a token in A at k is the doubler of a particle in B at k + pi), and the kinetic
// energy reads each token as that particle. At fine 1 this is branchReader's reading for two tokens.
//
// NOTHING MOVES: the coin and the cost write amplitudes on a dock's own line; the stream copies. The box is
// measurement (flux-store-bloch's wall), not rule.

import {
  blochSpace,
  branchReader,
  quartetShare,
  type Bloch,
  type Reduced,
} from '@/code/measure/flux-store-bloch'
import {
  boxSpec,
  lightN,
  inverseIterate,
} from '@/code/measure/drift-cost-bloch'
import { unitaryEigen, type Vec } from '@/code/measure/quantum-ladder'
import {
  contactEnergy,
  fineCoin,
  firstQuantized,
  lineReduced,
  readingBloch,
  ringBeat,
  ringKey,
  wholeBasis,
  type LineBasis,
  type LineLevel,
  type LineSector,
  type RingState,
} from '@/code/measure/coined-line-bloch'

type C = [number, number]

const cmul = (x: C, y: C): C => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0],
]

const wrapE = (phase: number): number => {
  let e = -phase

  while (e <= -Math.PI) {
    e += 2 * Math.PI
  }

  while (e > Math.PI) {
    e -= 2 * Math.PI
  }

  return e
}

// ---- (A) the string-only trio ----

// the contact unit that leaves a full dock with det C alone (meeting w times lift e^(i pi u/3) = 1)
export const FREE_UNIT = 4

// the weight of a configuration vector on spans of at least `from` (the three loves' string is their span)
export function spanTail(
  basis: LineBasis,
  re: Float64Array,
  im: Float64Array,
  from: number,
): number {
  let w = 0
  let t = 0

  basis.configs.forEach((ts, i) => {
    const p = re[i]! ** 2 + im[i]! ** 2
    const span =
      Math.max(...ts.map(x => x.x)) - Math.min(...ts.map(x => x.x))

    t += p

    if (span >= from) {
      w += p
    }
  })

  return w / t
}

// coined-line-bloch's lineLevels, reading ONLY the levels whose span tail beyond N is at most `maxTail`. The full
// reading (the first-quantized branch reader on a ring of 2 box + 6) costs far more than the eigensolve at box 2N, and
// a level far past the cut is never a family's candidate; its mean span, tail and contact are read from the
// configuration vector directly (the same numbers: for three loves of one flavor every assignment of a configuration
// carries the same string, which is its span). Returns the read levels and the count of every level.
export function lineLevelsNear(
  basis: LineBasis,
  maxTail: number,
): {
  levels: LineLevel[]
  all: number
  skipped: number
  residual: number
} {
  const sub = wholeBasis(basis)
  const red = lineReduced(basis, sub, 0)
  const eig = unitaryEigen(red.dim, red.re, red.im)
  const b = readingBloch(basis.sector)
  const read = branchReader(b, 2 * basis.sector.box + 6)
  const N = lightN(basis.sector.D)
  const sigma = Math.PI / N
  const ec = contactEnergy(basis.sector)
  const spans = basis.configs.map(
    ts => Math.max(...ts.map(t => t.x)) - Math.min(...ts.map(t => t.x)),
  )
  const docks = basis.configs.map(ts => {
    let n = 0

    for (let p = 0; p < ts.length; p++) {
      for (let q = p + 1; q < ts.length; q++) {
        if (ts[p]!.f === ts[q]!.f && ts[p]!.x === ts[q]!.x) {
          n++
        }
      }
    }

    return n
  })
  const levels: LineLevel[] = []

  let skipped = 0

  eig.phases.forEach((ph, k) => {
    const cre = Float64Array.from(eig.vectors[k]!.re)
    const cim = Float64Array.from(eig.vectors[k]!.im)

    let t = 0
    let tail = 0
    let mean = 0
    let contact = 0

    for (let i = 0; i < cre.length; i++) {
      const p = cre[i]! ** 2 + cim[i]! ** 2

      t += p
      mean += p * spans[i]!
      contact += p * docks[i]!

      if (spans[i]! >= N) {
        tail += p
      }
    }

    if (tail / t > maxTail) {
      skipped++

      return
    }

    const v = firstQuantized(basis, b, cre, cim)
    const r = read(v)

    if (r.even < 0.5) {
      return
    }

    const energy = wrapE(ph)
    const reference =
      r.kinetic + (sigma * mean) / t + (ec * contact) / t
    const unwrapped =
      energy +
      2 * Math.PI * Math.round((reference - energy) / (2 * Math.PI))

    levels.push({
      unwrapped,
      energy,
      reference,
      even: r.even,
      spinHalf: 1 - quartetShare(b, v),
      mean: mean / t,
      tailN: tail / t,
      contact: contact / t,
      cre,
      cim,
    })
  })

  return {
    levels,
    all: eig.phases.length,
    skipped,
    residual: eig.residual,
  }
}

// one beat of one love alone on a ring of L docks (fine coin, then the stream): amplitudes indexed 2 x + j
export function loneRingBeat(
  fine: number,
  L: number,
  re: Float64Array,
  im: Float64Array,
): { re: Float64Array; im: Float64Array } {
  const { keep, cross } = fineCoin(fine)
  const or = new Float64Array(2 * L)
  const oi = new Float64Array(2 * L)

  for (let x = 0; x < L; x++) {
    for (let j = 0; j < 2; j++) {
      const a: C = [re[2 * x + j]!, im[2 * x + j]!]
      const b: C = [re[2 * x + (1 - j)]!, im[2 * x + (1 - j)]!]
      const k = cmul(keep, a)
      const c = cmul(cross, b)
      const to = (((x + (j === 0 ? 1 : -1)) % L) + L) % L

      or[2 * to + j] = k[0] + c[0]
      oi[2 * to + j] = k[1] + c[1]
    }
  }

  return { re: or, im: oi }
}

// three orbitals as a Slater determinant on the ring, in the sector's canonical mode order
function slater(
  L: number,
  orbitals: readonly { re: Float64Array; im: Float64Array }[],
): Map<string, C> {
  const out = new Map<string, C>()
  const modes: { x: number; j: number }[] = []

  for (let x = 0; x < L; x++) {
    for (let j = 0; j < 2; j++) {
      modes.push({ x, j })
    }
  }

  const key = (m: { x: number; j: number }): number =>
    2 * m.x + (m.j === 0 ? 1 : 0)

  modes.sort((a, b) => key(a) - key(b))

  const at = (a: number, m: { x: number; j: number }): C => [
    orbitals[a]!.re[2 * m.x + m.j]!,
    orbitals[a]!.im[2 * m.x + m.j]!,
  ]

  for (let p = 0; p < modes.length; p++) {
    for (let q = p + 1; q < modes.length; q++) {
      for (let r = q + 1; r < modes.length; r++) {
        const ms = [modes[p]!, modes[q]!, modes[r]!]

        let det: C = [0, 0]

        for (const [perm, s] of [
          [[0, 1, 2], 1],
          [[1, 2, 0], 1],
          [[2, 0, 1], 1],
          [[1, 0, 2], -1],
          [[0, 2, 1], -1],
          [[2, 1, 0], -1],
        ] as const) {
          const v = cmul(
            cmul(at(0, ms[perm[0]]!), at(1, ms[perm[1]]!)),
            at(2, ms[perm[2]]!),
          )

          det = [det[0] + s * v[0], det[1] + s * v[1]]
        }

        out.set(ringKey(ms.map(m => ({ ...m, f: 0 }))), det)
      }
    }
  }

  return out
}

// THE CONTACT-OFF CHECK. Three Weyl-filled orbitals on a ring of L; the sector's ring form (no cost) run one beat on
// their Slater determinant against the determinant of the three orbitals each run one beat alone. Returns the
// largest amplitude difference over every configuration, and the norm of the determinant (so a gap can be read
// against it). Zero exactly when the sector's full dock is the free fermions' det C.
export function slaterGap(
  sector: LineSector,
  L: number,
): { gap: number; norm: number } {
  const fine = sector.fine ?? 1
  const weyl = [
    Math.SQRT2 - 1,
    Math.sqrt(3) - 1,
    (Math.sqrt(5) - 1) / 2,
  ]
  const orbitals = weyl.map((a, o) => {
    const re = new Float64Array(2 * L)
    const im = new Float64Array(2 * L)

    for (let m = 0; m < 2 * L; m++) {
      const th = 2 * Math.PI * (((m + 1) * a * (o + 1)) % 1)
      const r = 0.5 + ((m * a + o * 0.37) % 1)

      re[m] = r * Math.cos(th)
      im[m] = r * Math.sin(th)
    }

    return { re, im }
  })
  const before = slater(L, orbitals)
  const state: RingState = new Map()

  for (const [k, amp] of before) {
    const ts = k.split('|').map(s => {
      const [x, j, f] = s.split(',').map(Number)

      return { x: x!, j: j!, f: f! }
    })

    state.set(k, { ts, amp })
  }

  const run = ringBeat(sector, L, state)
  const after = slater(
    L,
    orbitals.map(o => loneRingBeat(fine, L, o.re, o.im)),
  )

  let gap = 0
  let norm = 0

  for (const [k, amp] of after) {
    const got = run.get(k)?.amp ?? [0, 0]

    norm += amp[0] ** 2 + amp[1] ** 2
    gap = Math.max(gap, Math.hypot(amp[0] - got[0], amp[1] - got[1]))
  }

  for (const [k, v] of run) {
    if (!after.has(k)) {
      gap = Math.max(gap, Math.hypot(v.amp[0], v.amp[1]))
    }
  }

  return { gap, norm: Math.sqrt(norm) }
}

// ---- (B) the meson ----

export type Meson = { D: number; box: number; fine: number; b: Bloch }

export function meson(D: number, box: number, fine: number): Meson {
  return {
    D,
    box,
    fine,
    b: blochSpace(boxSpec(['love', 'fear'], D, box)),
  }
}

// one beat of the pair (C, knit: no meeting) with the fine coin, on basis vector `col` at total momentum K
export function pairColumn(
  m: Meson,
  K: number,
  col: number,
  withCost = true,
): { idx: number[]; re: number[]; im: number[] } {
  const { b } = m
  const N = lightN(m.D)
  const c = Math.floor(col / b.labelCount)
  const r0 = col % b.labelCount
  const d = b.configs[c]!
  const { keep, cross } = fineCoin(m.fine)
  const th = withCost ? (-Math.PI * b.strings[c]!) / N : 0
  const cost: C = [Math.cos(th), Math.sin(th)]
  const j0 = [Math.floor(r0 / 2), r0 % 2]
  const out = {
    idx: [] as number[],
    re: [] as number[],
    im: [] as number[],
  }

  for (let mask = 0; mask < 4; mask++) {
    const j = j0.map((v, t) => ((mask >> t) & 1 ? 1 - v : v))

    let a = cost

    for (let t = 0; t < 2; t++) {
      a = cmul(a, (mask >> t) & 1 ? cross : keep)
    }

    const steps = j.map(v => (v === 0 ? 1 : -1))
    const y = d.map((x, t) => x + steps[t]!)

    if (Math.abs(y[1]! - y[0]!) > m.box) {
      out.idx.push(b.index(c, (1 - j[0]!) * 2 + (1 - j[1]!)))
      out.re.push(a[0])
      out.im.push(a[1])
      continue
    }

    const nc = b.configOf([0, y[1]! - y[0]!])
    const ph = cmul(a, [
      Math.cos(-K * steps[0]!),
      Math.sin(-K * steps[0]!),
    ])

    out.idx.push(b.index(nc, j[0]! * 2 + j[1]!))
    out.re.push(ph[0])
    out.im.push(ph[1])
  }

  return out
}

// THE PARITY OF d. Each token moves one dock each beat, so d = x_1 - x_0 changes by 0 or +-2, and the wall's flip
// keeps d: the parity of d is kept exactly, and the beat is block diagonal in it. `Parity` 0 is even d (contact
// possible), 1 odd d (never at contact). The basis indices of one parity, in order:
export type Parity = 0 | 1

export function parityIndices(m: Meson, parity: Parity): number[] {
  const out: number[] = []

  for (let i = 0; i < m.b.size; i++) {
    if (
      Math.abs(m.b.configs[Math.floor(i / m.b.labelCount)]![1]!) % 2 ===
      parity
    ) {
      out.push(i)
    }
  }

  return out
}

// the beat on one parity block (`leak` is the largest weight a column sends to the other block: 0 exactly)
export function pairReduced(
  m: Meson,
  K: number,
  parity: Parity,
  withCost = true,
): Reduced {
  const idx = parityIndices(m, parity)
  const at = new Map(idx.map((i, a) => [i, a]))
  const dim = idx.length
  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)

  let unitarity = 0
  let leak = 0

  idx.forEach((i0, col) => {
    const c = pairColumn(m, K, i0, withCost)

    let t = 0
    let out = 0

    c.idx.forEach((i, k) => {
      const a = at.get(i)

      if (a === undefined) {
        out += c.re[k]! ** 2 + c.im[k]! ** 2

        return
      }

      re[a * dim + col] = re[a * dim + col]! + c.re[k]!
      im[a * dim + col] = im[a * dim + col]! + c.im[k]!
    })

    for (let a = 0; a < dim; a++) {
      t += re[a * dim + col]! ** 2 + im[a * dim + col]! ** 2
    }

    unitarity = Math.max(unitarity, Math.abs(t - 1))
    leak = Math.max(leak, out)
  })

  return { dim, re, im, leak, unitarity }
}

// a block vector in the full pair basis
export function pairEmbed(m: Meson, parity: Parity, v: Vec): Vec {
  const full = {
    re: new Float64Array(m.b.size),
    im: new Float64Array(m.b.size),
  }

  parityIndices(m, parity).forEach((i, a) => {
    full.re[i] = v.re[a]!
    full.im[i] = v.im[a]!
  })

  return full
}

// the lone walk's branches at the fine coin and momentum k: B (the particle branch, E in [0, pi - 2 pi/(3 fine)])
// and A (orthogonal), with E_B(k)
export function fineBranch(
  fine: number,
  k: number,
): { B: [C, C]; A: [C, C]; energy: number } {
  const { keep, cross } = fineCoin(fine)
  const s0: C = [Math.cos(-k), Math.sin(-k)]
  const s1: C = [s0[0], -s0[1]]
  const m00 = cmul(s0, keep)
  const m01 = cmul(s0, cross)
  const m10 = cmul(s1, cross)
  const m11 = cmul(s1, keep)
  const tr: C = [m00[0] + m11[0], m00[1] + m11[1]]
  const x = cmul(m00, m11)
  const y = cmul(m01, m10)
  const det: C = [x[0] - y[0], x[1] - y[1]]
  const t2 = cmul(tr, tr)
  const disc: C = [t2[0] - 4 * det[0], t2[1] - 4 * det[1]]
  const md = Math.hypot(disc[0], disc[1])
  const ag = Math.atan2(disc[1], disc[0])
  const root: C = [
    Math.sqrt(md) * Math.cos(ag / 2),
    Math.sqrt(md) * Math.sin(ag / 2),
  ]
  const top = Math.PI - (2 * Math.PI) / (3 * fine)
  const lams: C[] = [
    [(tr[0] + root[0]) / 2, (tr[1] + root[1]) / 2],
    [(tr[0] - root[0]) / 2, (tr[1] - root[1]) / 2],
  ]
  const eOf = (l: C): number => -Math.atan2(l[1], l[0])
  const lam =
    lams.find(l => eOf(l) > -1e-9 && eOf(l) < top + 1e-9) ?? lams[0]!

  let e0: C = m01
  let e1: C = [lam[0] - m00[0], lam[1] - m00[1]]

  if (Math.hypot(...e0) + Math.hypot(...e1) < 1e-9) {
    e0 = [lam[0] - m11[0], lam[1] - m11[1]]
    e1 = m10
  }

  const n = Math.sqrt(e0[0] ** 2 + e0[1] ** 2 + e1[0] ** 2 + e1[1] ** 2)
  const B: [C, C] = [
    [e0[0] / n, e0[1] / n],
    [e1[0] / n, e1[1] / n],
  ]
  const A: [C, C] = [
    [-B[1][0], B[1][1]],
    [B[0][0], -B[0][1]],
  ]

  return { B, A, energy: Math.max(0, eOf(lam)) }
}

export type PairReading = { even: number; kinetic: number }

export function pairReader(
  m: Meson,
  L: number,
): (v: Vec) => PairReading {
  const { b } = m
  const rows = Array.from({ length: L }, (_, k) =>
    fineBranch(m.fine, (2 * Math.PI * k) / L),
  )

  return (v: Vec): PairReading => {
    let total = 0
    let even = 0
    let kinetic = 0

    for (let k = 0; k < L; k++) {
      const p = (2 * Math.PI * k) / L
      // phi-hat(p, j0, j1) = sum_d phi(d) e^(-i p d) / sqrt(L)
      const hat: C[] = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ]

      b.configs.forEach((cfg, c) => {
        const ph: C = [
          Math.cos(-p * cfg[1]!) / Math.sqrt(L),
          Math.sin(-p * cfg[1]!) / Math.sqrt(L),
        ]

        for (let r = 0; r < 4; r++) {
          const w = cmul(ph, [
            v.re[b.index(c, r)]!,
            v.im[b.index(c, r)]!,
          ])

          hat[r] = [hat[r]![0] + w[0], hat[r]![1] + w[1]]
        }
      })

      const t0 = rows[(L - k) % L]!
      const t1 = rows[k]!
      const e0 = [t0.energy, rows[(L - k + L / 2) % L]!.energy]
      const e1 = [t1.energy, rows[(k + L / 2) % L]!.energy]

      for (let a = 0; a < 4; a++) {
        const a0 = a >> 1
        const a1 = a & 1
        const v0 = a0 === 0 ? t0.B : t0.A
        const v1 = a1 === 0 ? t1.B : t1.A

        let s: C = [0, 0]

        for (let r = 0; r < 4; r++) {
          const w = cmul(
            cmul(
              [v0[r >> 1]![0], -v0[r >> 1]![1]],
              [v1[r & 1]![0], -v1[r & 1]![1]],
            ),
            hat[r]!,
          )

          s = [s[0] + w[0], s[1] + w[1]]
        }

        const wgt = s[0] ** 2 + s[1] ** 2

        total += wgt

        if (a0 === a1) {
          even += wgt
        }

        kinetic += wgt * (e0[a0]! + e1[a1]!)
      }
    }

    return { even: even / total, kinetic: kinetic / total }
  }
}

// THE POTENTIAL MODEL'S INERTIA on a level's own momentum content (E-SPN-0149). The level is read in relative momentum
// p as pairReader reads it (token 0 at -p, token 1 at p, each on the lone walk's branches; a token in A at k is the
// particle at k + pi). A boost P gives each token P/2, so E(P) = E_B(-p + P/2) + E_B(p + P/2) + (the string, which a
// boost does not touch in this model): the first order cancels between -p and p, and E''(P) = (E_B''(-p) + E_B''(p)) /
// 4. The model's inertia is 1 / <E''(P)> over the particle sector (the even count, renormalized), E_B'' by a symmetric
// second difference of fineBranch's energy. It is the inertia a pair of free walkers with this momentum content would
// carry under an instantaneous string: a READING to set beside the level's measured inertia, never a gate's input.
export function pairModelInertia(
  m: Meson,
  L: number,
  v: Vec,
  h = 1e-3,
): { inertia: number; even: number } {
  const { b } = m
  const eB = (k: number): number => fineBranch(m.fine, k).energy
  const curvature = (k: number): number =>
    (eB(k + h) + eB(k - h) - 2 * eB(k)) / (h * h)
  const rows = Array.from({ length: L }, (_, k) =>
    fineBranch(m.fine, (2 * Math.PI * k) / L),
  )

  let total = 0
  let even = 0
  let second = 0

  for (let k = 0; k < L; k++) {
    const p = (2 * Math.PI * k) / L
    const hat: C[] = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ]

    b.configs.forEach((cfg, c) => {
      const ph: C = [
        Math.cos(-p * cfg[1]!) / Math.sqrt(L),
        Math.sin(-p * cfg[1]!) / Math.sqrt(L),
      ]

      for (let r = 0; r < 4; r++) {
        const w = cmul(ph, [v.re[b.index(c, r)]!, v.im[b.index(c, r)]!])

        hat[r] = [hat[r]![0] + w[0], hat[r]![1] + w[1]]
      }
    })

    const t0 = rows[(L - k) % L]!
    const t1 = rows[k]!

    for (let a = 0; a < 4; a++) {
      const a0 = a >> 1
      const a1 = a & 1
      const v0 = a0 === 0 ? t0.B : t0.A
      const v1 = a1 === 0 ? t1.B : t1.A

      let s: C = [0, 0]

      for (let r = 0; r < 4; r++) {
        const w = cmul(
          cmul(
            [v0[r >> 1]![0], -v0[r >> 1]![1]],
            [v1[r & 1]![0], -v1[r & 1]![1]],
          ),
          hat[r]!,
        )

        s = [s[0] + w[0], s[1] + w[1]]
      }

      const wgt = s[0] ** 2 + s[1] ** 2

      total += wgt

      if (a0 !== a1) {
        continue
      }

      even += wgt

      // the particle momenta: -p and p on B, -p + pi and p + pi on A
      const shift = a0 === 0 ? 0 : Math.PI

      second +=
        (wgt * (curvature(-p + shift) + curvature(p + shift))) / 4
    }
  }

  return { inertia: even / second, even: even / total }
}

// `vector` in the full pair basis, `block` the same on its parity block
export type PairLevel = {
  parity: Parity
  energy: number
  unwrapped: number
  reference: number
  even: number
  kinetic: number
  mean: number
  tailN: number
  contact: number
  vector: Vec
  block: Vec
}

// the relative observables of a pair vector: mean |d|, weight at |d| >= N, weight at d = 0
export function pairMoments(
  m: Meson,
  v: Vec,
): { mean: number; tailN: number; contact: number } {
  const N = lightN(m.D)

  let t = 0
  let mean = 0
  let tail = 0
  let contact = 0

  for (let i = 0; i < m.b.size; i++) {
    const p = v.re[i]! ** 2 + v.im[i]! ** 2
    const l = m.b.strings[Math.floor(i / m.b.labelCount)]!

    t += p
    mean += p * l

    if (l >= N) {
      tail += p
    }

    if (l === 0) {
      contact += p
    }
  }

  return { mean: mean / t, tailN: tail / t, contact: contact / t }
}

// every particle-sector level at K = 0 (even reading at least 1/2), unwrapped to the representative nearest its
// reference energy (kinetic + sigma <|d|>, no contact term: the pair has no meeting)
// every particle-sector level at K = 0 of both parity blocks (even reading at least 1/2), unwrapped to the
// representative nearest its reference energy (kinetic + sigma <|d|>, no contact term: the pair has no meeting)
export function pairLevels(
  m: Meson,
  withCost = true,
): {
  levels: PairLevel[]
  dim: number
  residual: number
  unitarity: number
  leak: number
} {
  const read = pairReader(m, 2 * m.box + 6)
  const sigma = withCost ? Math.PI / lightN(m.D) : 0
  const levels: PairLevel[] = []

  let residual = 0
  let unitarity = 0
  let leak = 0
  let dim = 0

  for (const parity of [0, 1] as const) {
    const red = pairReduced(m, 0, parity, withCost)
    const eig = unitaryEigen(red.dim, red.re, red.im)

    dim += red.dim
    residual = Math.max(residual, eig.residual)
    unitarity = Math.max(unitarity, red.unitarity)
    leak = Math.max(leak, red.leak)

    eig.phases.forEach((ph, k) => {
      const block = eig.vectors[k]!
      const vector = pairEmbed(m, parity, block)
      const r = read(vector)

      if (r.even < 0.5) {
        return
      }

      const mo = pairMoments(m, vector)
      const energy = wrapE(ph)
      const reference = r.kinetic + sigma * mo.mean
      const unwrapped =
        energy +
        2 * Math.PI * Math.round((reference - energy) / (2 * Math.PI))

      levels.push({
        parity,
        energy,
        unwrapped,
        reference,
        even: r.even,
        kinetic: r.kinetic,
        ...mo,
        vector,
        block,
      })
    })
  }

  return { levels, dim, residual, unitarity, leak }
}

export type PairBandPoint = {
  K: number
  energy: number
  vector: Vec
  overlap: number
  residual: number
}

// the level followed from K = 0 by inverse iteration on its parity block in steps of at most `step` to each K of `ks`
// (moving-level's followLevel, on the pair's operator); vectors on the block
export function followPair(
  m: Meson,
  start: PairLevel,
  ks: readonly number[],
  step: number,
): PairBandPoint[] {
  const dim = start.block.re.length

  let prev: Vec = {
    re: Float64Array.from(start.block.re),
    im: Float64Array.from(start.block.im),
  }
  let K = 0
  let energy = start.unwrapped
  let least = 1
  let residual = 0

  const out: PairBandPoint[] = []

  for (const target of ks) {
    while (K < target - 1e-15) {
      const next = Math.min(target, K + step)
      const it = inverseIterate(
        pairReduced(m, next, start.parity),
        prev,
        6,
      )

      let r = 0
      let i = 0
      let n1 = 0
      let n2 = 0

      for (let a = 0; a < dim; a++) {
        r +=
          prev.re[a]! * it.vector.re[a]! +
          prev.im[a]! * it.vector.im[a]!

        i +=
          prev.re[a]! * it.vector.im[a]! -
          prev.im[a]! * it.vector.re[a]!
        n1 += prev.re[a]! ** 2 + prev.im[a]! ** 2
        n2 += it.vector.re[a]! ** 2 + it.vector.im[a]! ** 2
      }

      least = Math.min(least, Math.hypot(r, i) / Math.sqrt(n1 * n2))
      residual = Math.max(residual, it.residual)
      energy =
        it.energy +
        2 * Math.PI * Math.round((energy - it.energy) / (2 * Math.PI))
      prev = it.vector
      K = next
    }

    out.push({
      K,
      energy,
      vector: {
        re: Float64Array.from(prev.re),
        im: Float64Array.from(prev.im),
      },
      overlap: least,
      residual,
    })
  }

  return out
}

// E''(K) at a band point, a second difference of eigenvalues (moving-level's bandCurvature on the pair)
export function pairCurvature(
  m: Meson,
  parity: Parity,
  at: PairBandPoint,
  d: number,
): number {
  const near = (K: number): number => {
    const it = inverseIterate(pairReduced(m, K, parity), at.vector, 6)

    return (
      it.energy +
      2 * Math.PI * Math.round((at.energy - it.energy) / (2 * Math.PI))
    )
  }

  return (near(at.K + d) + near(at.K - d) - 2 * at.energy) / (d * d)
}
