// Two identical tokens under the slot's exclusion, on the husk: which two-token states can the dynamics keep?
// Built for E-MTR-0018.
//
// The tokens are the spinor token of code/rule/spinor-token (a STAND-IN for the electron): per husk dock, two
// slots (the fear walk's forward and back) times a spin doublet, the role's parity-even doublet (E-SPN-0051,
// E-SPN-0066). Each beat applies the fear coin to the slot and then copies along one husk axis a: in 'locked'
// mode the Gamma = tau_z sigma_a = +1 part of the token is copied one dock forward and the -1 part one dock
// back, so the spin decides the direction (the covariant, moving token of E-SPN-0066); in 'spectator' mode the
// slot alone decides (Gamma = tau_z) and the spin rides along (the control: a label the motion never reads).
// The one-dimensional fear walk (no spin, internal dimension 2) is the same code with a 2 x 2 coin.
//
// THE EXCLUSION IS THE SLOT'S, READ AS THE MODEL READS IT: a slot is one direction on one link and holds one
// vibe, whatever role that vibe carries. So after the coin, two tokens on one dock may not both sit in the part
// that is copied forward (both would be copied into the same slot), nor both in the part copied back: the
// forbidden pair space at a shared dock is P+ x P+ + P- x P-, P+- = (1 +- Gamma) / 2. Two tokens on different
// docks are copied into different slots, so nothing else is forbidden. A two-token state is KEPT when no beat
// ever puts amplitude on a forbidden configuration: the dynamics is then unitary on it without any rule for what
// happens when two vibes reach one slot. The kept states form the largest subspace of the two-token space that
// the beats leave inside the allowed configurations.
//
// Nothing here imposes an exchange symmetry. The two tokens are given coordinates (first, second) and the
// computation runs in the full product space; the exchange X is only read afterwards, to see which of its
// sectors the kept states lie in.
//
// The computation, exactly as linear algebra (floating rounding only). The dynamics commutes with translating
// both tokens, so each total quasi-momentum K = 2 pi k / L is its own block: psi(x1, i; x2, j) = e^(i K . x1)
// phi(r = x2 - x1, i, j), dimension n^2 L^3 (n the internal dimension). One substep on axis a is
//   phi'(r') = sum over s1, s2 of e^(-i s1 K_a) [P_s1 x P_s2 (C x C) phi](r' - (s2 - s1) e_a),
// the exchange is X phi(r, i, j) = e^(i K . r) phi(-r, j, i), and the forbidden functionals at substep k are
// the components of (P+ x P+ + P- x P-) (C x C) phi(0) after the substeps before it. The kept space is the
// orthogonal complement of the BAD space: the span of every forbidden functional pulled back to the start of the
// period, closed under the period map (for a unitary map on a finite space, the smallest invariant subspace that
// contains a set is its Krylov closure). Nothing moves: a token's "position" is where the stream has copied its
// amplitude, and the pair's coordinates are labels of the two-token amplitude, not objects.

export type Complex = [number, number]

// an internal operator, n x n complex, row-major
export type Internal = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }

// one substep of the schedule: its coin, its axis, and the projectors onto the parts copied forward and back
export type Substep = {
  readonly axis: number
  // the husk step's sign (a depth step's shadow is +-z for every component)
  readonly coin: Internal
  readonly plus: Internal
  readonly minus: Internal
  // whether the exclusion is checked on this substep (a depth step's husk shadow does not tell the depth apart)
  readonly checked: boolean
}

export type Sector = {
  readonly side: number
  readonly n: number
  readonly k: readonly [number, number, number]
  readonly dimension: number
}

// the pair operator A x B on n^2, as an n^2 x n^2 complex matrix
function kron(a: Internal, b: Internal): Internal {
  const n = a.n
  const m = n * n
  const re = new Float64Array(m * m)
  const im = new Float64Array(m * m)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        for (let l = 0; l < n; l++) {
          const ar = a.re[i * n + k] as number
          const ai = a.im[i * n + k] as number
          const br = b.re[j * n + l] as number
          const bi = b.im[j * n + l] as number
          const row = i * n + j
          const col = k * n + l

          re[row * m + col] = ar * br - ai * bi
          im[row * m + col] = ar * bi + ai * br
        }
      }
    }
  }

  return { n: m, re, im }
}

function add(a: Internal, b: Internal): Internal {
  return { n: a.n, re: Float64Array.from(a.re, (x, i) => x + (b.re[i] as number)), im: Float64Array.from(a.im, (x, i) => x + (b.im[i] as number)) }
}

function multiply(a: Internal, b: Internal): Internal {
  const n = a.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const xr = a.re[i * n + k] as number
      const xi = a.im[i * n + k] as number

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        re[i * n + j] = (re[i * n + j] as number) + xr * (b.re[k * n + j] as number) - xi * (b.im[k * n + j] as number)
        im[i * n + j] = (im[i * n + j] as number) + xr * (b.im[k * n + j] as number) + xi * (b.re[k * n + j] as number)
      }
    }
  }

  return { n, re, im }
}

function adjoint(a: Internal): Internal {
  const n = a.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      re[j * n + i] = a.re[i * n + j] as number
      im[j * n + i] = -(a.im[i * n + j] as number)
    }
  }

  return { n, re, im }
}

export function internalFrom(n: number, entries: readonly Complex[]): Internal {
  return { n, re: Float64Array.from(entries, e => e[0]), im: Float64Array.from(entries, e => e[1]) }
}

// the per-substep pair operators, precomputed once
type PairStep = {
  readonly axis: number
  readonly checked: boolean
  // C x C
  readonly coin: Internal
  readonly coinAdjoint: Internal
  // P_s1 x P_s2 for (s1, s2) = (+,+), (+,-), (-,+), (-,-)
  readonly parts: readonly { s1: number; s2: number; op: Internal; opAdjoint: Internal }[]
  // (C x C)^dagger (P+ x P+ + P- x P-): its columns span the pulled-back forbidden functionals at r = 0
  readonly forbidden: Internal
}

function pairSteps(substeps: readonly Substep[]): PairStep[] {
  return substeps.map(s => {
    const coin = kron(s.coin, s.coin)
    const parts = [
      { s1: 1, s2: 1, op: kron(s.plus, s.plus) },
      { s1: 1, s2: -1, op: kron(s.plus, s.minus) },
      { s1: -1, s2: 1, op: kron(s.minus, s.plus) },
      { s1: -1, s2: -1, op: kron(s.minus, s.minus) },
    ].map(p => ({ ...p, opAdjoint: adjoint(p.op) }))
    const same = add(parts[0]?.op ?? coin, parts[3]?.op ?? coin)

    return { axis: s.axis, checked: s.checked, coin, coinAdjoint: adjoint(coin), parts, forbidden: multiply(adjoint(coin), same) }
  })
}

const mod = (x: number, m: number): number => ((x % m) + m) % m

// the index of the relative displacement r in the L^3 torus
function cellOf(side: number, x: number, y: number, z: number): number {
  return mod(x, side) + side * (mod(y, side) + side * mod(z, side))
}

// a vector of the sector, split into real and imaginary parts
type Vector = { re: Float64Array; im: Float64Array }

function zero(dimension: number): Vector {
  return { re: new Float64Array(dimension), im: new Float64Array(dimension) }
}

// out(r) = M v(r) for every r, M on n^2
function applyLocal(side: number, m: Internal, v: Vector, out: Vector): void {
  const d = m.n
  const cells = side ** 3

  for (let r = 0; r < cells; r++) {
    const base = r * d

    for (let i = 0; i < d; i++) {
      let sr = 0
      let si = 0

      for (let j = 0; j < d; j++) {
        const mr = m.re[i * d + j] as number
        const mi = m.im[i * d + j] as number

        if (mr === 0 && mi === 0) {
          continue
        }

        const vr = v.re[base + j] as number
        const vi = v.im[base + j] as number

        sr += mr * vr - mi * vi
        si += mr * vi + mi * vr
      }

      out.re[base + i] = sr
      out.im[base + i] = si
    }
  }
}

// one substep forward: the pair coin, then each part copied to its displacement with its phase
function forward(sector: Sector, step: PairStep, v: Vector): Vector {
  const { side } = sector
  const d = sector.n * sector.n
  const cells = side ** 3
  const coined = zero(sector.dimension)
  const out = zero(sector.dimension)
  const part = zero(sector.dimension)
  const kAxis = (2 * Math.PI * (sector.k[step.axis] ?? 0)) / side

  applyLocal(side, step.coin, v, coined)

  for (const p of step.parts) {
    const shift = p.s2 - p.s1
    const c = Math.cos(-p.s1 * kAxis)
    const s = Math.sin(-p.s1 * kAxis)

    applyLocal(side, p.op, coined, part)

    for (let r = 0; r < cells; r++) {
      const xyz = [r % side, Math.floor(r / side) % side, Math.floor(r / (side * side))]

      xyz[step.axis] = (xyz[step.axis] ?? 0) + shift

      const target = cellOf(side, xyz[0] ?? 0, xyz[1] ?? 0, xyz[2] ?? 0)

      for (let i = 0; i < d; i++) {
        const pr = part.re[r * d + i] as number
        const pi = part.im[r * d + i] as number

        out.re[target * d + i] = (out.re[target * d + i] as number) + c * pr - s * pi
        out.im[target * d + i] = (out.im[target * d + i] as number) + c * pi + s * pr
      }
    }
  }

  return out
}

// the adjoint of one substep: each part gathered back with the conjugate phase, then the pair coin's adjoint
function backward(sector: Sector, step: PairStep, v: Vector): Vector {
  const { side } = sector
  const d = sector.n * sector.n
  const cells = side ** 3
  const gathered = zero(sector.dimension)
  const shifted = zero(sector.dimension)
  const part = zero(sector.dimension)
  const out = zero(sector.dimension)
  const kAxis = (2 * Math.PI * (sector.k[step.axis] ?? 0)) / side

  for (const p of step.parts) {
    const shift = p.s2 - p.s1
    const c = Math.cos(p.s1 * kAxis)
    const s = Math.sin(p.s1 * kAxis)

    for (let r = 0; r < cells; r++) {
      const xyz = [r % side, Math.floor(r / side) % side, Math.floor(r / (side * side))]

      xyz[step.axis] = (xyz[step.axis] ?? 0) + shift

      const source = cellOf(side, xyz[0] ?? 0, xyz[1] ?? 0, xyz[2] ?? 0)

      for (let i = 0; i < d; i++) {
        const vr = v.re[source * d + i] as number
        const vi = v.im[source * d + i] as number

        shifted.re[r * d + i] = c * vr - s * vi
        shifted.im[r * d + i] = c * vi + s * vr
      }
    }

    applyLocal(side, p.opAdjoint, shifted, part)

    for (let i = 0; i < gathered.re.length; i++) {
      gathered.re[i] = (gathered.re[i] as number) + (part.re[i] as number)
      gathered.im[i] = (gathered.im[i] as number) + (part.im[i] as number)
    }
  }

  applyLocal(side, step.coinAdjoint, gathered, out)

  return out
}

// An orthonormal basis grown by modified Gram-Schmidt, twice, with a relative drop tolerance
class Basis {
  readonly vectors: Vector[] = []

  constructor(
    readonly dimension: number,
    readonly tolerance: number,
  ) {}

  // add v's component outside the span, if it is larger than the tolerance times |v|; returns whether it grew
  add(v: Vector): boolean {
    const w: Vector = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }
    const before = Math.sqrt(norm2(w))

    if (before === 0) {
      return false
    }

    for (let pass = 0; pass < 2; pass++) {
      for (const q of this.vectors) {
        // c = <q, w>
        let cr = 0
        let ci = 0

        for (let i = 0; i < this.dimension; i++) {
          const qr = q.re[i] as number
          const qi = q.im[i] as number
          const wr = w.re[i] as number
          const wi = w.im[i] as number

          cr += qr * wr + qi * wi
          ci += qr * wi - qi * wr
        }

        if (cr === 0 && ci === 0) {
          continue
        }

        for (let i = 0; i < this.dimension; i++) {
          const qr = q.re[i] as number
          const qi = q.im[i] as number

          w.re[i] = (w.re[i] as number) - (cr * qr - ci * qi)
          w.im[i] = (w.im[i] as number) - (cr * qi + ci * qr)
        }
      }
    }

    const after = Math.sqrt(norm2(w))

    if (after <= this.tolerance * before) {
      return false
    }

    for (let i = 0; i < this.dimension; i++) {
      w.re[i] = (w.re[i] as number) / after
      w.im[i] = (w.im[i] as number) / after
    }

    this.vectors.push(w)

    return true
  }

  // |v - projection of v on the span| / |v|
  residual(v: Vector): number {
    const w: Vector = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }
    const before = Math.sqrt(norm2(w))

    for (let pass = 0; pass < 2; pass++) {
      for (const q of this.vectors) {
        let cr = 0
        let ci = 0

        for (let i = 0; i < this.dimension; i++) {
          cr += (q.re[i] as number) * (w.re[i] as number) + (q.im[i] as number) * (w.im[i] as number)
          ci += (q.re[i] as number) * (w.im[i] as number) - (q.im[i] as number) * (w.re[i] as number)
        }

        for (let i = 0; i < this.dimension; i++) {
          const qr = q.re[i] as number
          const qi = q.im[i] as number

          w.re[i] = (w.re[i] as number) - (cr * qr - ci * qi)
          w.im[i] = (w.im[i] as number) - (cr * qi + ci * qr)
        }
      }
    }

    return before === 0 ? 0 : Math.sqrt(norm2(w)) / before
  }
}

function norm2(v: Vector): number {
  let s = 0

  for (let i = 0; i < v.re.length; i++) {
    s += (v.re[i] as number) ** 2 + (v.im[i] as number) ** 2
  }

  return s
}

// the exchange of the two tokens in the sector: X phi(r, i, j) = e^(i K . r) phi(-r, j, i)
export function exchange(sector: Sector, v: Vector): Vector {
  const { side, n } = sector
  const d = n * n
  const cells = side ** 3
  const out = zero(sector.dimension)

  for (let r = 0; r < cells; r++) {
    const x = r % side
    const y = Math.floor(r / side) % side
    const z = Math.floor(r / (side * side))
    const minus = cellOf(side, -x, -y, -z)
    const phase = (2 * Math.PI * ((sector.k[0] ?? 0) * x + (sector.k[1] ?? 0) * y + (sector.k[2] ?? 0) * z)) / side
    const c = Math.cos(phase)
    const s = Math.sin(phase)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const vr = v.re[minus * d + j * n + i] as number
        const vi = v.im[minus * d + j * n + i] as number

        out.re[r * d + i * n + j] = c * vr - s * vi
        out.im[r * d + i * n + j] = c * vi + s * vr
      }
    }
  }

  return out
}

export type KeptSpace = {
  readonly sector: Sector
  // dim of the kept space, of the bad space, and of the exchange-antisymmetric part of the sector
  readonly kept: number
  readonly bad: number
  readonly antisymmetric: number
  // how many independent symmetric directions lie outside the bad space: 0 means every kept state is
  // antisymmetric under the exchange
  readonly symmetricKept: number
  // how many independent antisymmetric directions lie inside the bad space: the antisymmetric states the
  // exclusion still removes
  readonly antisymmetricRemoved: number
  // the largest drift of a kept-space test: |bad space closed under the period map| (0 if it is invariant)
  readonly closureResidual: number
  // is the exchange a symmetry of the beat (|X U v - U X v| / |v| on a probe)?
  readonly exchangeCommutes: number
}

// the kept space of one total-momentum sector
export function keptSpace(input: { side: number; n: number; k: readonly [number, number, number]; substeps: readonly Substep[]; tolerance?: number }): KeptSpace {
  const { side, n, k, substeps } = input
  const d = n * n
  const sector: Sector = { side, n, k, dimension: d * side ** 3 }
  const steps = pairSteps(substeps)
  const tolerance = input.tolerance ?? 1e-8
  const bad = new Basis(sector.dimension, tolerance)
  const period = (v: Vector): Vector => {
    // the adjoint of the period map: the last substep's adjoint first ... the first's last
    let w = v

    for (let s = steps.length - 1; s >= 0; s--) {
      w = backward(sector, steps[s] as PairStep, w)
    }

    return w
  }
  const periodForward = (v: Vector): Vector => steps.reduce((w, s) => forward(sector, s, w), v)
  const queue: Vector[] = []

  // the forbidden functionals of every checked substep, pulled back to the start of the period
  steps.forEach((step, s) => {
    if (!step.checked) {
      return
    }

    for (let col = 0; col < d; col++) {
      let v = zero(sector.dimension)

      // the column of (C x C)^dagger (P+ P+ + P- P-) at r = 0
      for (let i = 0; i < d; i++) {
        v.re[i] = step.forbidden.re[i * d + col] as number
        v.im[i] = step.forbidden.im[i * d + col] as number
      }

      for (let t = s - 1; t >= 0; t--) {
        v = backward(sector, steps[t] as PairStep, v)
      }

      if (bad.add(v)) {
        queue.push(bad.vectors[bad.vectors.length - 1] as Vector)
      }
    }
  })

  // the Krylov closure under the (adjoint) period map
  while (queue.length > 0) {
    const v = queue.shift() as Vector
    const w = period(v)

    if (bad.add(w)) {
      queue.push(bad.vectors[bad.vectors.length - 1] as Vector)
    }
  }

  // closure check: the period map of every bad vector stays in the bad space
  const closureResidual = bad.vectors.reduce((worst, v) => Math.max(worst, bad.residual(periodForward(v))), 0)

  // the exchange sectors: X e_i projected, for every basis vector e_i of the sector
  const symmetric = new Basis(sector.dimension, 1e-8)
  const antisymmetric = new Basis(sector.dimension, 1e-8)

  for (let i = 0; i < sector.dimension; i++) {
    const e = zero(sector.dimension)

    e.re[i] = 1

    const x = exchange(sector, e)
    const plus = { re: Float64Array.from(e.re, (a, j) => (a + (x.re[j] as number)) / 2), im: Float64Array.from(e.im, (a, j) => (a + (x.im[j] as number)) / 2) }
    const minus = { re: Float64Array.from(e.re, (a, j) => (a - (x.re[j] as number)) / 2), im: Float64Array.from(e.im, (a, j) => (a - (x.im[j] as number)) / 2) }

    symmetric.add(plus)
    antisymmetric.add(minus)
  }

  // symmetric directions outside the bad space: grow a copy of the bad basis by them
  const withSymmetric = new Basis(sector.dimension, 1e-6)

  bad.vectors.forEach(v => withSymmetric.vectors.push(v))

  let symmetricKept = 0

  for (const v of symmetric.vectors) {
    symmetricKept += withSymmetric.add(v) ? 1 : 0
  }

  // antisymmetric directions inside the bad space: dim(bad) + dim(anti) - dim(bad + anti)
  const withAnti = new Basis(sector.dimension, 1e-6)

  bad.vectors.forEach(v => withAnti.vectors.push(v))

  let grown = 0

  for (const v of antisymmetric.vectors) {
    grown += withAnti.add(v) ? 1 : 0
  }

  // the exchange commutes with the beat: one probe vector from the golden sequence
  const probe = zero(sector.dimension)

  for (let i = 0; i < sector.dimension; i++) {
    probe.re[i] = ((i + 1) * 0.6180339887498949) % 1 - 0.5
    probe.im[i] = ((i + 1) * 0.41421356237309515) % 1 - 0.5
  }

  const a = exchange(sector, periodForward(probe))
  const b = periodForward(exchange(sector, probe))
  const diff = { re: Float64Array.from(a.re, (x, i) => x - (b.re[i] as number)), im: Float64Array.from(a.im, (x, i) => x - (b.im[i] as number)) }

  return {
    sector,
    kept: sector.dimension - bad.vectors.length,
    bad: bad.vectors.length,
    antisymmetric: antisymmetric.vectors.length,
    symmetricKept,
    antisymmetricRemoved: antisymmetric.vectors.length - grown,
    closureResidual,
    exchangeCommutes: Math.sqrt(norm2(diff) / norm2(probe)),
  }
}

// ---------------------------------------------------------------------------------------------------------
// the tokens

const OMEGA: Complex = [-0.5, Math.sqrt(3) / 2]
// the fear coin's entries, (1 + omega) / 2 and (1 - omega) / 2 (code/rule/spinor-token)
const COIN_A: Complex = [(1 + OMEGA[0]) / 2, OMEGA[1] / 2]
const COIN_B: Complex = [(1 - OMEGA[0]) / 2, -OMEGA[1] / 2]

const PAULI: Record<'x' | 'y' | 'z', Complex[]> = {
  x: [
    [0, 0],
    [1, 0],
    [1, 0],
    [0, 0],
  ],
  y: [
    [0, 0],
    [0, -1],
    [0, 1],
    [0, 0],
  ],
  z: [
    [1, 0],
    [0, 0],
    [0, 0],
    [-1, 0],
  ],
}

export type TokenMode = 'locked' | 'spectator' | 'walk'
export type TokenStep = 'x' | 'y' | 'z' | 'up' | 'down'

// the substeps of a schedule for the spinor token (n = 4, index 2 slot + spin) or the bare fear walk (n = 2)
export function tokenSubsteps(schedule: readonly TokenStep[], mode: TokenMode): Substep[] {
  const n = mode === 'walk' ? 2 : 4
  const coin: Complex[] = Array.from({ length: n * n }, () => [0, 0] as Complex)
  const spins = n / 2

  for (let s = 0; s < spins; s++) {
    coin[(0 + s) * n + (0 + s)] = COIN_A
    coin[(0 + s) * n + (spins + s)] = COIN_B
    coin[(spins + s) * n + (0 + s)] = COIN_B
    coin[(spins + s) * n + (spins + s)] = COIN_A
  }

  return schedule.map(step => {
    const depth = step === 'up' || step === 'down'
    const axis = step === 'x' ? 0 : step === 'y' ? 1 : 2
    const gamma: Complex[] = Array.from({ length: n * n }, (_, i) => [depth && i % (n + 1) === 0 ? 1 : 0, 0] as Complex)

    if (!depth) {
      for (let slot = 0; slot < 2; slot++) {
        const tau = slot === 0 ? 1 : -1

        for (let s = 0; s < spins; s++) {
          for (let t = 0; t < spins; t++) {
            const sigma: Complex = mode === 'locked' ? (PAULI[step as 'x' | 'y' | 'z'][s * 2 + t] ?? [0, 0]) : s === t ? [1, 0] : [0, 0]

            gamma[(spins * slot + s) * n + (spins * slot + t)] = [tau * sigma[0], tau * sigma[1]]
          }
        }
      }
    }

    // a depth step's shadow copies every component the same way, +z (up) or -z (down); as a two-token move it
    // shifts both tokens together, so it is written as an axis-2 substep whose plus or minus part is everything
    const identity: Complex[] = Array.from({ length: n * n }, (_, i) => [i % (n + 1) === 0 ? 1 : 0, 0] as Complex)
    const plus: Complex[] = identity.map((v, i) => [(v[0] + (gamma[i] as Complex)[0]) / 2, (v[1] + (gamma[i] as Complex)[1]) / 2])
    const minus: Complex[] = identity.map((v, i) => [(v[0] - (gamma[i] as Complex)[0]) / 2, (v[1] - (gamma[i] as Complex)[1]) / 2])
    const zeroes: Complex[] = identity.map(() => [0, 0])

    return {
      axis,
      coin: internalFrom(n, coin),
      plus: internalFrom(n, step === 'down' ? zeroes : plus),
      minus: internalFrom(n, step === 'down' ? identity : step === 'up' ? zeroes : minus),
      checked: !depth,
    }
  })
}

// the dimension of the totally antisymmetric part of k d-valued labels, C(d, k), by the antisymmetrizer's
// trace: (1 / k!) sum over permutations of sgn(p) d^(cycles of p)
export function antisymmetricLabels(d: number, k: number): number {
  const permutations = (m: number): number[][] =>
    m === 0 ? [[]] : permutations(m - 1).flatMap(p => Array.from({ length: m }, (_, i) => [...p.slice(0, i), m - 1, ...p.slice(i)]))
  const all = permutations(k)

  let sum = 0

  for (const p of all) {
    const seen = p.map(() => false)

    let count = 0
    let sign = 1

    for (let i = 0; i < p.length; i++) {
      if (!seen[i]) {
        let length = 0
        let j = i

        while (!seen[j]) {
          seen[j] = true
          j = p[j] as number
          length++
        }

        count++
        sign *= length % 2 === 0 ? -1 : 1
      }
    }

    sum += sign * d ** count
  }

  return sum / all.length
}
