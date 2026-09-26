// Minimal Z_N lattice QED on husk squares (E-FRC-0227 to 0229): Kogut-Susskind's gauge theory with the link group
// cut to Z_N, N = 2D + 1 the column's range, held EXACTLY in the cyclotomic integers Z[zeta_M].
//
// THE REGISTERS. Each dock holds a charge register n_x (the electron stand-in's occupation, mod N) and each link a
// flow register e_l (its electric flux, mod N, read balanced in -(N - 1)/2 .. (N - 1)/2). Gauss's law is the
// linear form G_x = sum_(l out of x) e_l - sum_(l into x) e_l + n_x = g_x mod N, with g the static charges (a
// STAND-IN nucleus of +1 at one dock). One common modulus, so Gauss holds in every history of the signed whole
// for any unitary that conserves G as an operator (E-FRC-0223's theorem).
//
// THE BEAT, every factor an exact unitary with entries in (1 / 2^a N^b) Z[zeta_M]:
//   hop     V_l(z) = (1 + z)/2 + (1 - z)/2 T_l for each link the electron may cross, in a fixed order. T_l is the
//           RECORDED hop, the linear map (n_x, n_y, e_l) -> (n_y, n_x, e_l + n_x - n_y): the charge crosses and
//           the flow records it, so T_l conserves every G_x and is an involution. z = -1 is the classical hop
//           (a permutation, Clifford), z = 1 no hop, any other root of unity a partial hop (the fear beat's
//           swap phase at z = w = zeta_3)
//   electric   zeta_M^(-c sum_l bal(e_l)^2), diagonal in the flows
//   magnetic   per plaquette f(U_p) = sum_B zeta_M^(-r bal(B)^2) Pi_B, with U_p the product of the plaquette's
//           link shifts (X_l^(sigma_l)) and Pi_B its eigenprojector for eigenvalue w_N^B; B is the plaquette's
//           angle sum, the conjugate of its circulation. On a basis state, f(U_p) |j> = (1/N) sum_k g_k U_p^k |j>
//           with g_k = sum_B zeta_M^(-r bal(B)^2) w_N^(-B k): a superposition of the loop shifted k times
//   electric again (the symmetric leapfrog: the flow is read by the angle on both sides of the magnetic step)
// With M a multiple of N and c = r = (M / N) k the light factors are w_N^(-k e^2) and w_N^(-k B^2), Clifford; with
// c, r not multiples of M / N the phases are fractional turns, not Clifford.
//
// THE SECTOR. With one electron and the nucleus, a Gauss-sector basis state is the electron's dock x and the
// plaquettes' loop values m_p: e = s(x) + sum_p m_p loop_p mod N, s(x) a fixed string from the nucleus to x (a
// tree path) and loop_p the plaquette's oriented boundary. m_p is read off a link that only plaquette p holds.
// U_p shifts m_p by one. The sector has (docks the electron reaches) x N^P states.
//
// THE SPACE. A space is a set of basis indices with the beat's factors as functions on indices, so one set of
// appliers runs both the sector (small, every state) and the full register space (N^(docks + links), the
// Clifford and exhaustive Gauss checks), exact (BigInt coefficients of zeta_M^j mod x^M - 1, one common
// denominator, canonical form mod the cyclotomic polynomial Phi_M) or in floats (measurement only).

export type Link = { readonly from: number; readonly to: number }

export type Plaquette = { readonly links: readonly number[]; readonly signs: readonly number[] }

export type Lattice = {
  readonly docks: number
  readonly links: readonly Link[]
  readonly plaquettes: readonly Plaquette[]
  readonly nucleus: number
  // the links the electron stand-in may cross
  readonly hops: readonly number[]
  // per dock, the integer flux per link of a string from the nucleus to an electron there (null: never there)
  readonly strings: readonly (readonly number[] | null)[]
  // per plaquette, a link on it and on no other plaquette (reads m_p)
  readonly own: readonly number[]
}

// One square (docks 0..3, links 0 -> 1, 1 -> 2, 2 -> 3, 3 -> 0) or two sharing the rung 1 -> 2 (docks 4, 5, links
// 1 -> 4, 4 -> 5, 5 -> 2). Nucleus at dock 0, the electron crosses the first square's four links, and every
// string avoids the rung (0 -> 1, 0 -> 3, 0 -> 3 -> 2), so the second square's loop is read by nothing but the rung.
export function squareLattice(count: 1 | 2): Lattice {
  const links: Link[] = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 0 },
  ]
  const plaquettes: Plaquette[] = [{ links: [0, 1, 2, 3], signs: [1, 1, 1, 1] }]

  if (count === 2) {
    links.push({ from: 1, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 2 })
    plaquettes.push({ links: [4, 5, 6, 1], signs: [1, 1, 1, -1] })
  }

  const zero = (): number[] => new Array<number>(links.length).fill(0)
  const s0 = zero()
  const s1 = zero()
  const s2 = zero()
  const s3 = zero()

  s1[0] = 1
  s3[3] = -1
  s2[3] = -1
  s2[2] = -1

  const strings: (number[] | null)[] = [s0, s1, s2, s3]

  if (count === 2) strings.push(null, null)

  return { docks: count === 2 ? 6 : 4, links, plaquettes, nucleus: 0, hops: [0, 1, 2, 3], strings, own: count === 2 ? [0, 4] : [0] }
}

export const mod = (x: number, m: number): number => ((x % m) + m) % m

export const bal = (x: number, n: number): number => {
  const r = mod(x, n)

  return r > (n - 1) / 2 ? r - n : r
}

// ---------------------------------------------------------------------------------------------------------
// the Gauss sector

export type Sector = {
  readonly lattice: Lattice
  readonly n: number
  readonly size: number
  // per index: the electron's dock, the flows (at [i * links + l]) and the loop values (at [i * plaquettes + p])
  readonly dock: Int32Array
  readonly flux: Int32Array
  readonly loops: Int32Array
  indexOf(dock: number, flux: ArrayLike<number>): number
}

export function gaussOf(lattice: Lattice, n: number, charge: ArrayLike<number>, flux: ArrayLike<number>): number[] {
  const g = Array.from({ length: lattice.docks }, (_, x) => charge[x]!)

  lattice.links.forEach((l, k) => {
    g[l.from] = g[l.from]! + flux[k]!
    g[l.to] = g[l.to]! - flux[k]!
  })

  return g.map(v => mod(v, n))
}

export function buildSector(lattice: Lattice, n: number): Sector {
  const L = lattice.links.length
  const P = lattice.plaquettes.length
  const docks = lattice.strings.map((s, x) => (s ? x : -1)).filter(x => x >= 0)
  const loopsPer = n ** P
  const size = docks.length * loopsPer
  const dock = new Int32Array(size)
  const flux = new Int32Array(size * L)
  const loops = new Int32Array(size * P)
  const loopVectors = lattice.plaquettes.map(p => {
    const v = new Array<number>(L).fill(0)

    p.links.forEach((l, k) => (v[l] = p.signs[k]!))

    return v
  })

  for (let d = 0; d < docks.length; d++) {
    for (let c = 0; c < loopsPer; c++) {
      const i = d * loopsPer + c
      const x = docks[d]!

      dock[i] = x

      for (let p = 0; p < P; p++) loops[i * P + p] = Math.floor(c / n ** (P - 1 - p)) % n

      for (let l = 0; l < L; l++) {
        let e = lattice.strings[x]![l]!

        for (let p = 0; p < P; p++) e += loops[i * P + p]! * loopVectors[p]![l]!

        flux[i * L + l] = mod(e, n)
      }
    }
  }

  const docksIndex = new Int32Array(lattice.docks).fill(-1)

  docks.forEach((x, d) => (docksIndex[x] = d))

  const indexOf = (x: number, e: ArrayLike<number>): number => {
    const d = docksIndex[x]!

    if (d < 0) return -1

    let c = 0

    for (let p = 0; p < P; p++) {
      const own = lattice.own[p]!
      const sign = loopVectors[p]![own]!
      const m = mod(sign * (e[own]! - lattice.strings[x]![own]!), n)

      c = c * n + m
    }

    const i = d * loopsPer + c

    for (let l = 0; l < L; l++) if (mod(e[l]!, n) !== flux[i * L + l]) return -1

    return i
  }

  return { lattice, n, size, dock, flux, loops, indexOf }
}

// ---------------------------------------------------------------------------------------------------------
// steps and beats

export type Step =
  // (1 + zeta^z)/2 |i> + (1 - zeta^z)/2 |move(i)>, move an involution
  | { readonly kind: 'hop'; readonly move: (i: number) => number; readonly z: number }
  // zeta^exponent(i)
  | { readonly kind: 'phase'; readonly exponent: (i: number) => number }
  // f(U) |i> = (1/n) sum_k g_k |shift^k(i)>, g_k = sum_B zeta^(exponents[B]) w_n^(-B k), shift of order n
  | { readonly kind: 'loop'; readonly shift: (i: number) => number; readonly exponents: readonly number[]; readonly n: number }
  // float only (measurement): e^(2 pi i turns(i))
  | { readonly kind: 'turns'; readonly turns: (i: number) => number }

export type BeatSpec = {
  // the order of the root of unity every phase is a power of (a multiple of 6 N)
  readonly m: number
  // the hop's z = zeta^hop
  readonly hop: number
  // electric and magnetic exponents: zeta^(-electric bal(e)^2) per link, zeta^(-magnetic bal(B)^2) per plaquette
  readonly electric: number
  readonly magnetic: number
  // links left out of the hop (default none) and plaquettes left out of the magnetic step (default none)
  readonly skipHops?: readonly number[]
  readonly skipPlaquettes?: readonly number[]
}

export function inverseSteps(steps: readonly Step[]): Step[] {
  return [...steps].reverse().map(s => {
    if (s.kind === 'hop') return { kind: 'hop', move: s.move, z: -s.z }
    if (s.kind === 'phase') return { kind: 'phase', exponent: (i: number) => -s.exponent(i) }
    if (s.kind === 'loop') return { kind: 'loop', shift: s.shift, exponents: s.exponents.map(e => -e), n: s.n }

    return { kind: 'turns', turns: (i: number) => -s.turns(i) }
  })
}

// the sector's recorded hop across link l, as a move on indices (-1 if the image leaves the sector)
export function sectorHop(sector: Sector, l: number, recorded = true): Int32Array {
  const { lattice, n } = sector
  const L = lattice.links.length
  const link = lattice.links[l]!
  const out = new Int32Array(sector.size)
  const e = new Int32Array(L)

  for (let i = 0; i < sector.size; i++) {
    const x = sector.dock[i]!

    if (x !== link.from && x !== link.to) {
      out[i] = i
      continue
    }

    for (let k = 0; k < L; k++) e[k] = sector.flux[i * L + k]!

    if (recorded) e[l] = mod(e[l]! + (x === link.from ? 1 : -1), n)

    out[i] = sector.indexOf(x === link.from ? link.to : link.from, e)
  }

  return out
}

// sum over links of bal(e)^2, per sector index
export function sectorElectric(sector: Sector, skipLinks: readonly number[] = []): Int32Array {
  const L = sector.lattice.links.length
  const out = new Int32Array(sector.size)

  for (let i = 0; i < sector.size; i++) {
    let s = 0

    for (let l = 0; l < L; l++) if (!skipLinks.includes(l)) s += bal(sector.flux[i * L + l]!, sector.n) ** 2

    out[i] = s
  }

  return out
}

// U_p on sector indices: m_p + 1
export function sectorLoopShift(sector: Sector, p: number): Int32Array {
  const P = sector.lattice.plaquettes.length
  const stride = sector.n ** (P - 1 - p)
  const out = new Int32Array(sector.size)

  for (let i = 0; i < sector.size; i++) {
    const m = sector.loops[i * P + p]!

    out[i] = i + (mod(m + 1, sector.n) - m) * stride
  }

  return out
}

export const magneticExponents = (n: number, r: number): number[] => Array.from({ length: n }, (_, B) => -r * bal(B, n) ** 2)

export function sectorBeat(sector: Sector, spec: BeatSpec): Step[] {
  const steps: Step[] = []

  for (const l of sector.lattice.hops) {
    if (spec.skipHops?.includes(l)) continue

    const move = sectorHop(sector, l)

    for (let i = 0; i < move.length; i++) if (move[i]! < 0) throw new Error('lattice-qed: a recorded hop left the Gauss sector')

    steps.push({ kind: 'hop', move: i => move[i]!, z: spec.hop })
  }

  const electric = sectorElectric(sector)
  const half: Step = { kind: 'phase', exponent: i => -spec.electric * electric[i]! }

  steps.push(half)

  sector.lattice.plaquettes.forEach((_, p) => {
    if (spec.skipPlaquettes?.includes(p)) return

    const shift = sectorLoopShift(sector, p)

    steps.push({ kind: 'loop', shift: i => shift[i]!, exponents: magneticExponents(sector.n, spec.magnetic), n: sector.n })
  })

  steps.push(half)

  return steps
}

// ---------------------------------------------------------------------------------------------------------
// the classical integer light mod N, on a point (a, b) of the full register space (registers: charges, then
// flows): the beat's Clifford limit (hop z = -1, light phases w_N^(-k e^2) and w_N^(-k B^2)) moves each Wigner
// point by this map (E-FRC-0227 G3). Hop l (x -> y): the charges swap, the flow records n_x - n_y, and the
// conjugates are kicked by the link's angle; electric: the angle advances by -2 k e; magnetic: the flow turns by
// 2 k sigma B_p with B_p = sum sigma b; electric again. `magnetic` false leaves the plaquette step out (a light
// whose flows change only by crossings).
export function classicalLightBeat(lattice: Lattice, n: number, k: number, a: number[], b: number[], magnetic = true): void {
  const V = lattice.docks

  for (const l of lattice.hops) {
    const { from: x, to: y } = lattice.links[l]!
    const [nx, ny, px, py, bl] = [a[x]!, a[y]!, b[x]!, b[y]!, b[V + l]!]

    a[x] = ny
    a[y] = nx
    a[V + l] = mod(a[V + l]! + nx - ny, n)
    b[x] = mod(py + bl, n)
    b[y] = mod(px - bl, n)
  }

  const electric = (): void => {
    for (let l = 0; l < lattice.links.length; l++) b[V + l] = mod(b[V + l]! - 2 * k * a[V + l]!, n)
  }

  electric()

  if (magnetic) {
    for (const p of lattice.plaquettes) {
      let B = 0

      p.links.forEach((l, j) => (B += p.signs[j]! * b[V + l]!))
      p.links.forEach((l, j) => (a[V + l] = mod(a[V + l]! + 2 * k * p.signs[j]! * B, n)))
    }
  }

  electric()
}

// ---------------------------------------------------------------------------------------------------------
// the full register space: index = sum over registers (charges 0..docks-1, then flows) of digit * n^(position)

export type Full = {
  readonly lattice: Lattice
  readonly n: number
  readonly registers: number
  readonly size: number
  digits(i: number, out: Int32Array): void
  index(digits: ArrayLike<number>): number
}

export function fullSpace(lattice: Lattice, n: number): Full {
  const registers = lattice.docks + lattice.links.length
  const size = n ** registers

  return {
    lattice,
    n,
    registers,
    size,
    digits(i, out) {
      let rest = i

      for (let q = registers - 1; q >= 0; q--) {
        out[q] = rest % n
        rest = Math.floor(rest / n)
      }
    },
    index(d) {
      let i = 0

      for (let q = 0; q < registers; q++) i = i * n + mod(d[q]!, n)

      return i
    },
  }
}

// the recorded hop T_l on full indices (the linear map (n_x, n_y, e_l) -> (n_y, n_x, e_l + n_x - n_y)); with
// `recorded` false the charges swap and the flow stays (the control that breaks Gauss)
export function fullHop(full: Full, l: number, recorded = true): (i: number) => number {
  const link = full.lattice.links[l]!
  const d = new Int32Array(full.registers)
  const at = full.lattice.docks + l

  return i => {
    full.digits(i, d)

    const nx = d[link.from]!
    const ny = d[link.to]!

    d[link.from] = ny
    d[link.to] = nx

    if (recorded) d[at] = d[at]! + nx - ny

    return full.index(d)
  }
}

export function fullLoopShift(full: Full, p: number): (i: number) => number {
  const plaquette = full.lattice.plaquettes[p]!
  const d = new Int32Array(full.registers)

  return i => {
    full.digits(i, d)
    plaquette.links.forEach((l, k) => (d[full.lattice.docks + l] = d[full.lattice.docks + l]! + plaquette.signs[k]!))

    return full.index(d)
  }
}

export function fullElectric(full: Full): (i: number) => number {
  const d = new Int32Array(full.registers)

  return i => {
    full.digits(i, d)

    let s = 0

    for (let l = 0; l < full.lattice.links.length; l++) s += bal(d[full.lattice.docks + l]!, full.n) ** 2

    return s
  }
}

export function fullBeat(full: Full, spec: BeatSpec): Step[] {
  const steps: Step[] = []

  for (const l of full.lattice.hops) steps.push({ kind: 'hop', move: fullHop(full, l), z: spec.hop })

  const electric = fullElectric(full)
  const half: Step = { kind: 'phase', exponent: i => -spec.electric * electric(i) }

  steps.push(half)
  full.lattice.plaquettes.forEach((_, p) =>
    steps.push({ kind: 'loop', shift: fullLoopShift(full, p), exponents: magneticExponents(full.n, spec.magnetic), n: full.n }),
  )
  steps.push(half)

  return steps
}

// ---------------------------------------------------------------------------------------------------------
// exact vectors over Z[zeta_M]: each entry a length-M BigInt array (coefficients of zeta^0 .. zeta^(M-1)),
// one common denominator

export type Exact = { readonly m: number; den: bigint; entries: Map<number, bigint[]> }

const PHI = new Map<number, bigint[]>()

// the cyclotomic polynomial Phi_M, coefficients low to high (monic)
export function cyclotomic(m: number): bigint[] {
  const found = PHI.get(m)

  if (found) return found

  // x^m - 1 divided by Phi_d for every proper divisor d
  let poly: bigint[] = new Array<bigint>(m + 1).fill(0n)

  poly[0] = -1n
  poly[m] = 1n

  for (let d = 1; d < m; d++) {
    if (m % d !== 0) continue

    const phi = cyclotomic(d)
    const deg = phi.length - 1
    const quotient = new Array<bigint>(poly.length - deg).fill(0n)
    const rest = [...poly]

    for (let k = rest.length - 1; k >= deg; k--) {
      const c = rest[k]!

      if (c === 0n) continue

      quotient[k - deg] = c

      for (let t = 0; t <= deg; t++) rest[k - deg + t] = rest[k - deg + t]! - c * phi[t]!
    }

    for (let k = 0; k < deg; k++) if (rest[k] !== 0n) throw new Error('lattice-qed: cyclotomic division left a remainder')

    poly = quotient
  }

  PHI.set(m, poly)

  return poly
}

// the canonical form of a cyclic coefficient array: its remainder mod Phi_M, padded with zeros to length M
export function canonical(a: readonly bigint[], m: number): bigint[] {
  const phi = cyclotomic(m)
  const deg = phi.length - 1
  const r = [...a]

  for (let k = m - 1; k >= deg; k--) {
    const c = r[k]!

    if (c === 0n) continue

    for (let t = 0; t <= deg; t++) r[k - deg + t] = r[k - deg + t]! - c * phi[t]!
  }

  return r
}

const zeroPoly = (m: number): bigint[] => new Array<bigint>(m).fill(0n)

const addShifted = (target: bigint[], source: readonly bigint[], shift: number, sign: bigint, m: number): void => {
  const s = mod(shift, m)

  for (let j = 0; j < m; j++) {
    const c = source[j]!

    if (c !== 0n) target[(j + s) % m] = target[(j + s) % m]! + sign * c
  }
}

const entryOf = (map: Map<number, bigint[]>, i: number, m: number): bigint[] => {
  let e = map.get(i)

  if (!e) {
    e = zeroPoly(m)
    map.set(i, e)
  }

  return e
}

export function exactBasis(m: number, i: number, weight = 1n): Exact {
  const e = zeroPoly(m)

  e[0] = weight

  return { m, den: 1n, entries: new Map([[i, e]]) }
}

export function exactFrom(m: number, entries: readonly [number, bigint][]): Exact {
  const map = new Map<number, bigint[]>()

  for (const [i, w] of entries) entryOf(map, i, m)[0] = w

  return { m, den: 1n, entries: map }
}

const gcd = (x: bigint, y: bigint): bigint => {
  let p = x < 0n ? -x : x
  let q = y < 0n ? -y : y

  while (q !== 0n) [p, q] = [q, p % q]

  return p
}

// canonical form, zero entries dropped, the common factor of every coefficient and the denominator removed
export function reduce(v: Exact): Exact {
  const entries = new Map<number, bigint[]>()
  let g = v.den

  for (const [i, e] of v.entries) {
    const c = canonical(e, v.m)

    if (c.every(x => x === 0n)) continue

    entries.set(i, c)

    for (const x of c) if (x !== 0n) g = gcd(g, x)
  }

  if (g === 0n) g = 1n

  if (v.den < 0n) g = -g

  for (const e of entries.values()) for (let j = 0; j < e.length; j++) e[j] = e[j]! / g

  return { m: v.m, den: v.den / g, entries }
}

export function applyExact(step: Step, v: Exact): Exact {
  const m = v.m
  const out = new Map<number, bigint[]>()

  if (step.kind === 'hop') {
    for (const [i, s] of v.entries) {
      const j = step.move(i)
      const a = entryOf(out, i, m)

      addShifted(a, s, 0, 1n, m)
      addShifted(a, s, step.z, 1n, m)

      const b = entryOf(out, j, m)

      addShifted(b, s, 0, 1n, m)
      addShifted(b, s, step.z, -1n, m)
    }

    return { m, den: v.den * 2n, entries: out }
  }

  if (step.kind === 'phase') {
    for (const [i, s] of v.entries) addShifted(entryOf(out, i, m), s, step.exponent(i), 1n, m)

    return { m, den: v.den, entries: out }
  }

  if (step.kind === 'loop') {
    const n = step.n
    const unit = m / n

    if (!Number.isInteger(unit)) throw new Error('lattice-qed: the loop step needs N | M')

    for (const [i, s] of v.entries) {
      let at = i

      for (let k = 0; k < n; k++) {
        const target = entryOf(out, at, m)

        // g_k = sum_B zeta^(exponents[B] - unit B k)
        for (let B = 0; B < n; B++) addShifted(target, s, step.exponents[B]! - unit * B * k, 1n, m)

        at = step.shift(at)
      }
    }

    return { m, den: v.den * BigInt(n), entries: out }
  }

  throw new Error('lattice-qed: a float-only step met an exact vector')
}

export function runExact(steps: readonly Step[], v: Exact, beats = 1): Exact {
  let w = v

  for (let t = 0; t < beats; t++) {
    for (const s of steps) w = applyExact(s, w)

    w = reduce(w)
  }

  return w
}

// exact equality of two reduced vectors
export function exactEqual(a: Exact, b: Exact): boolean {
  const ra = reduce(a)
  const rb = reduce(b)
  const keys = new Set([...ra.entries.keys(), ...rb.entries.keys()])

  for (const k of keys) {
    const x = ra.entries.get(k) ?? zeroPoly(a.m)
    const y = rb.entries.get(k) ?? zeroPoly(a.m)

    for (let j = 0; j < a.m; j++) if (x[j]! * rb.den !== y[j]! * ra.den) return false
  }

  return true
}

// a reduced value as a float complex number (measurement)
export function toComplex(c: readonly bigint[], den: bigint, m: number): [number, number] {
  const bits = (x: bigint): number => (x < 0n ? -x : x).toString(2).length
  let top = bits(den)

  for (const x of c) top = Math.max(top, bits(x))

  const drop = BigInt(Math.max(0, top - 900))
  const d = Number(den >> drop)
  let re = 0
  let im = 0

  for (let j = 0; j < m; j++) {
    if (c[j] === 0n) continue

    const x = Number(c[j]! >> drop) / d

    re += x * Math.cos((2 * Math.PI * j) / m)
    im += x * Math.sin((2 * Math.PI * j) / m)
  }

  return [re, im]
}

// ---------------------------------------------------------------------------------------------------------
// float vectors (measurement): dense over a space of `size` indices

export type Complex = { re: Float64Array; im: Float64Array }

export function applyFloat(step: Step, v: Complex, m: number): Complex {
  const size = v.re.length
  const re = new Float64Array(size)
  const im = new Float64Array(size)

  if (step.kind === 'hop') {
    const t = (2 * Math.PI * step.z) / m
    const zr = Math.cos(t)
    const zi = Math.sin(t)
    const ar = (1 + zr) / 2
    const ai = zi / 2
    const br = (1 - zr) / 2
    const bi = -zi / 2

    for (let i = 0; i < size; i++) {
      const xr = v.re[i]!
      const xi = v.im[i]!

      if (xr === 0 && xi === 0) continue

      const j = step.move(i)

      re[i] = re[i]! + ar * xr - ai * xi
      im[i] = im[i]! + ar * xi + ai * xr
      re[j] = re[j]! + br * xr - bi * xi
      im[j] = im[j]! + br * xi + bi * xr
    }

    return { re, im }
  }

  if (step.kind === 'phase' || step.kind === 'turns') {
    for (let i = 0; i < size; i++) {
      const t = step.kind === 'phase' ? (2 * Math.PI * step.exponent(i)) / m : 2 * Math.PI * step.turns(i)
      const c = Math.cos(t)
      const s = Math.sin(t)

      re[i] = v.re[i]! * c - v.im[i]! * s
      im[i] = v.re[i]! * s + v.im[i]! * c
    }

    return { re, im }
  }

  const n = step.n
  const gr = new Float64Array(n)
  const gi = new Float64Array(n)

  for (let k = 0; k < n; k++) {
    for (let B = 0; B < n; B++) {
      const t = (2 * Math.PI * step.exponents[B]!) / m - (2 * Math.PI * B * k) / n

      gr[k] = gr[k]! + Math.cos(t) / n
      gi[k] = gi[k]! + Math.sin(t) / n
    }
  }

  for (let i = 0; i < size; i++) {
    const xr = v.re[i]!
    const xi = v.im[i]!

    if (xr === 0 && xi === 0) continue

    let at = i

    for (let k = 0; k < n; k++) {
      re[at] = re[at]! + gr[k]! * xr - gi[k]! * xi
      im[at] = im[at]! + gr[k]! * xi + gi[k]! * xr
      at = step.shift(at)
    }
  }

  return { re, im }
}

export function runFloat(steps: readonly Step[], v: Complex, m: number, beats = 1): Complex {
  let w = v

  for (let t = 0; t < beats; t++) for (const s of steps) w = applyFloat(s, w, m)

  return w
}

export function exactToFloat(v: Exact, size: number): Complex {
  const out = { re: new Float64Array(size), im: new Float64Array(size) }

  for (const [i, e] of v.entries) {
    const [re, im] = toComplex(e, v.den, v.m)

    out.re[i] = re
    out.im[i] = im
  }

  return out
}
