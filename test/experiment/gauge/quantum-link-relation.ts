// Can a quantum link stay a relation between vibes (E-FRC-0229)? E-FRC-0175 made the classical light pure history:
// the flow is the record of what the stream copied across, the angle its time integral, so a link needs no storage
// of its own. E-FRC-0226 found the quantum (per-history) light needs the flow's conjugate angle, which no flow
// update writes: storage on the link, against the user's rule that a link is the relation between the two vibes
// on it. This file asks whether the conjugate can be a function of the vibes' history, and if not, whether the
// link can still be a relation. Run on E-FRC-0227's exact Z_N lattice QED (code/rule/lattice-qed), STAND-IN
// matter, husk squares only.
//
// DERIVED before the first run.
//   (1) no joint start   E-FRC-0175's two statements need the start (flow, angle) = (0, 0) sharp: the flow a
//                        record, the angle zero. A point of the phase space is the operator A(0, 0) = parity,
//                        whose eigenvalues are +1 ((N + 1)/2 times) and -1 ((N - 1)/2 times): no state. A quantum
//                        link keeps at most one: a sharp record has a uniform angle, a sharp angle a uniform flow
//   (2) the flow is no    Under the Clifford light (E-FRC-0227's classical limit, point by point) the angle kicks
//       record           the flow through the plaquette step (e += 2 k sigma B). So from a record start (flows
//                        sharp, angles uniform) points sharing one crossing history end with different flows: the
//                        flow is a function of the crossing history AND the initial angle. With the plaquette step
//                        off, the flow is the record of crossings alone (one flow per crossing history)
//   (3) the plaquette    f(U_p) = (1/N) sum_k g_k U_p^k, a superposition of the loop wound k times. A history of a
//       term is no       vibe circling the plaquette records its winding, so it applies U_p^k with probability
//       history          p_k: a mixture sum_k p_k U^k rho U^-k, which decoheres the angle. The unitary is the
//                        coherent sum, reachable only if the winding is erased, i.e. by no history, unless one g_k
//                        alone is nonzero (a single definite loop, a shift). For the Gauss sums of w^(-B^2) every
//                        |g_k|^2 = N, so the history mixture leaves a flow-sharp start with purity exactly 1/N
//   (4) a record light   If the matter only reads the light's registers (every coupling diagonal in them) and
//       is unital        nothing turns flow into angle between two reads, each register value picks one unitary
//                        on the matter: the matter's channel is a mixture of unitaries, unital, and never cools
//                        (E-FRC-0226's obstruction, restated for the lattice)
//   (5) the relation     The link can still be a relation between its two end SLOTS if each slot holds a port
//       of slots         register mod N (a column of D trits): the tail slot u, the head slot w, the flow
//                        a = (u - w)/2 and the angle the difference of the two slots' conjugates. The recorded hop
//                        adds d = n_x - n_y to u and takes it from w, the loop shift adds sigma to u and takes it
//                        from w, so u + w = 0 is kept by every factor and the constrained pair is one register:
//                        the storage moves from the link into the slots. Gauss becomes local to the dock:
//                        G_x = n_x + sum of dock x's own port registers
//
// Gates, fixed before the first run:
// R1 no joint start: for N = 3, 5, 7 the parity operator j -> -j has exactly (N - 1)/2 two-cycles, so A(0, 0) has
//    (N - 1)/2 eigenvalues -1 (counted exactly); the flow-sharp state's Wigner function (code/measure/quantum-light)
//    is 1/N on every angle of its flow and 0 elsewhere (to 1e-12)
// R2 the flow is no record: on one square with the Clifford light (k = 1) and the classical hop, from the record
//    start (the electron at dock 1, its string, every angle), after each of 6 beats: the charges take 1 value
//    (one crossing history), the flows take more than 1 value with the plaquette step and exactly 1 without it;
//    exhaustive over all N^8 conjugate vectors at N = 3 and 5, 4,096 golden-Weyl ones at N = 7
// R3 the plaquette term is no history: for N = 3, 5, 7 and both the Clifford (w^(-B^2)) and the fractional
//    (zeta_6N^(-B^2)) magnetic phases, all N loop amplitudes g_k are nonzero (exact, in Z[zeta_6N]); for the
//    Clifford phases g_k conj(g_k) = N exactly for every k, so the winding history leaves a flow-sharp start with
//    purity 1/N; for the fractional phases the history's purity is below 1 - 1e-3; the unitary keeps it pure
//    (1 to 1e-12)
// R4 a record light is unital: on two squares at N = 3, 5, 7, the beat with the second plaquette's magnetic step
//    off never changes that plaquette's loop (exact, every sector basis state, 0 off-block entries), and with it
//    on some entries change it (more than 0); the matter channel from a fresh zero-field register and from the
//    register's lowest-energy state satisfies sum K K^dag = 1 to 1e-12 without the step and misses it by more
//    than 1e-6 with it
// R5 the relation of slots: on one square at N = 3, 5, 7 in slot form (charges plus a tail and a head port
//    register per link, 12 registers), every factor keeps u + w = 0 on every embedded sector state (0 exits), and
//    exhaustively on all 3^12 slot basis states at N = 3 keeps u + w on every link (0 changes); the slot-form run
//    equals the link-form run exactly over 12 fear-on beats from 5 starts per N (0 mismatches); the local Gauss
//    n_x + (dock x's ports) equals the link form's G on every embedded state (0 differences)
// Status: pass if R1 to R5 pass; fail otherwise.
//
// Depth L2: Hudson's and Gross's theorems (a point is no state; Clifford maps move points), channel theory
// (a mixture of unitaries is unital), and Kogut-Susskind's gauge theory in a slot (port) form; the model's
// registers, not a derivation from the committed knit.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl } from '@/code/tool/weyl'
import { basisState, densityOf, registers, wigner } from '@/code/measure/quantum-light'
import {
  applyExact,
  applyFloat,
  bal,
  buildSector,
  canonical,
  classicalLightBeat,
  exactBasis,
  exactEqual,
  exactFrom,
  magneticExponents,
  mod,
  runExact,
  sectorBeat,
  squareLattice,
  type BeatSpec,
  type Complex,
  type Exact,
  type Lattice,
  type Sector,
  type Step,
} from '@/code/rule/lattice-qed'

const MODULI = [3, 5, 7]
const BEATS = 12
const R2_BEATS = 6
const R2_SAMPLE = 4096

const fearOn = (n: number): BeatSpec => ({ m: 6 * n, hop: 2 * n, electric: 1, magnetic: 1 })

// ---------------------------------------------------------------------------------------------------------
// R2

function flowSpread(lattice: Lattice, n: number, magnetic: boolean): { flows: number[]; charges: number[] } {
  const R = lattice.docks + lattice.links.length
  const a0 = new Array<number>(R).fill(0)

  // the electron at dock 1 with its string
  a0[1] = 1
  lattice.strings[1]!.forEach((e, l) => (a0[lattice.docks + l] = mod(e, n)))

  const total = n ** R
  const exhaustive = n <= 5
  const count = exhaustive ? total : R2_SAMPLE
  const flows = Array.from({ length: R2_BEATS }, () => new Set<string>())
  const charges = Array.from({ length: R2_BEATS }, () => new Set<string>())

  for (let s = 0; s < count; s++) {
    const index = exhaustive ? s : Math.floor(weyl(s + 1) * total)
    const a = [...a0]
    const b = new Array<number>(R).fill(0)
    let rest = index

    for (let q = R - 1; q >= 0; q--) {
      b[q] = rest % n
      rest = Math.floor(rest / n)
    }

    for (let t = 0; t < R2_BEATS; t++) {
      classicalLightBeat(lattice, n, 1, a, b, magnetic)
      flows[t]!.add(a.slice(lattice.docks).join(','))
      charges[t]!.add(a.slice(0, lattice.docks).join(','))
    }
  }

  return { flows: flows.map(f => f.size), charges: charges.map(c => c.size) }
}

// ---------------------------------------------------------------------------------------------------------
// R3: g_k = sum_B zeta^(exponents[B]) w^(-B k) in Z[zeta_M]

function loopAmplitude(n: number, m: number, exponents: readonly number[], k: number): bigint[] {
  const g = new Array<bigint>(m).fill(0n)

  for (let B = 0; B < n; B++) {
    const e = mod(exponents[B]! - (m / n) * B * k, m)

    g[e] = g[e]! + 1n
  }

  return g
}

function timesConjugate(g: readonly bigint[], m: number): bigint[] {
  const out = new Array<bigint>(m).fill(0n)

  for (let i = 0; i < m; i++) {
    if (g[i] === 0n) continue

    for (let j = 0; j < m; j++) if (g[j] !== 0n) out[mod(i - j, m)] = out[mod(i - j, m)]! + g[i]! * g[j]!
  }

  return canonical(out, m)
}

function modulusSquared(g: readonly bigint[], m: number): number {
  let re = 0
  let im = 0

  for (let j = 0; j < m; j++) {
    re += Number(g[j]) * Math.cos((2 * Math.PI * j) / m)
    im += Number(g[j]) * Math.sin((2 * Math.PI * j) / m)
  }

  return re * re + im * im
}

// ---------------------------------------------------------------------------------------------------------
// R4: Kraus operators of one beat on the first square's matter and loop, the second loop a fresh register

type Matrix = { re: Float64Array; im: Float64Array }

function krausDefect(sector: Sector, steps: readonly Step[], m: number, register: readonly [number, number][]): number {
  const n = sector.n
  const d = sector.size / n
  const kraus: Matrix[] = Array.from({ length: n }, () => ({ re: new Float64Array(d * d), im: new Float64Array(d * d) }))

  for (let a = 0; a < d; a++) {
    let w: Complex = { re: new Float64Array(sector.size), im: new Float64Array(sector.size) }

    for (let f = 0; f < n; f++) {
      w.re[a * n + f] = register[f]![0]
      w.im[a * n + f] = register[f]![1]
    }

    for (const s of steps) w = applyFloat(s, w, m)

    for (let a2 = 0; a2 < d; a2++) {
      for (let f = 0; f < n; f++) {
        kraus[f]!.re[a2 * d + a] = w.re[a2 * n + f]!
        kraus[f]!.im[a2 * d + a] = w.im[a2 * n + f]!
      }
    }
  }

  // largest entry of sum_f K_f K_f^dag - 1
  let defect = 0

  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      let re = 0
      let im = 0

      for (const K of kraus) {
        for (let k = 0; k < d; k++) {
          // K_ik conj(K_jk)
          re += K.re[i * d + k]! * K.re[j * d + k]! + K.im[i * d + k]! * K.im[j * d + k]!
          im += K.im[i * d + k]! * K.re[j * d + k]! - K.re[i * d + k]! * K.im[j * d + k]!
        }
      }

      defect = Math.max(defect, Math.hypot(re - (i === j ? 1 : 0), im))
    }
  }

  return defect
}

// the lowest-energy state of the register's own generator (three far links' electric twice, its magnetic)
function registerVacuum(n: number): [number, number][] {
  // power iteration on (lambda_max - H) is avoided: the generator is small, so take the eigenvector of the
  // Hermitian matrix directly by Jacobi through the float unitary's Hermitian part is not needed; H is real
  // symmetric here (the magnetic part's g'_k is real for the even function bal(B)^2)
  const h: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))

  for (let f = 0; f < n; f++) h[f]![f] = h[f]![f]! + 6 * bal(f, n) ** 2

  for (let k = 0; k < n; k++) {
    let g = 0

    for (let B = 0; B < n; B++) g += (bal(B, n) ** 2 * Math.cos((2 * Math.PI * B * k) / n)) / n

    for (let f = 0; f < n; f++) h[(f + k) % n]![f] = h[(f + k) % n]![f]! + g
  }

  // inverse-free: shifted power iteration on (c - H), deterministic start
  const c = n * n * 8
  let v = Array.from({ length: n }, (_, f) => 1 + weyl(f + 1))

  for (let it = 0; it < 20000; it++) {
    const w = v.map((_, i) => c * v[i]! - h[i]!.reduce((s, x, j) => s + x * v[j]!, 0))
    const norm = Math.hypot(...w)

    v = w.map(x => x / norm)
  }

  return v.map(x => [x, 0] as [number, number])
}

// ---------------------------------------------------------------------------------------------------------
// R5: slot form

type SlotSpace = { tuples: number[][]; index: Map<string, number> }

function slotTupleOf(sector: Sector, i: number): number[] {
  const L = sector.lattice.links.length
  const t = new Array<number>(sector.lattice.docks).fill(0)

  t[sector.dock[i]!] = 1

  for (let l = 0; l < L; l++) {
    const a = sector.flux[i * L + l]!

    t.push(a, mod(-a, sector.n))
  }

  return t
}

// the slot-form factors, written on port registers only
function slotHop(lattice: Lattice, n: number, l: number, t: readonly number[]): number[] {
  const { from: x, to: y } = lattice.links[l]!
  const out = [...t]
  const dd = t[x]! - t[y]!

  out[x] = t[y]!
  out[y] = t[x]!
  out[lattice.docks + 2 * l] = mod(t[lattice.docks + 2 * l]! + dd, n)
  out[lattice.docks + 2 * l + 1] = mod(t[lattice.docks + 2 * l + 1]! - dd, n)

  return out
}

function slotLoop(lattice: Lattice, n: number, p: number, t: readonly number[]): number[] {
  const out = [...t]
  const pl = lattice.plaquettes[p]!

  pl.links.forEach((l, j) => {
    out[lattice.docks + 2 * l] = mod(out[lattice.docks + 2 * l]! + pl.signs[j]!, n)
    out[lattice.docks + 2 * l + 1] = mod(out[lattice.docks + 2 * l + 1]! - pl.signs[j]!, n)
  })

  return out
}

function slotElectric(lattice: Lattice, n: number, t: readonly number[]): number {
  const half = (n + 1) / 2
  let s = 0

  for (let l = 0; l < lattice.links.length; l++) s += bal((t[lattice.docks + 2 * l]! - t[lattice.docks + 2 * l + 1]!) * half, n) ** 2

  return s
}

function slotGauss(lattice: Lattice, n: number, t: readonly number[]): number[] {
  const g = Array.from({ length: lattice.docks }, (_, x) => t[x]!)

  lattice.links.forEach((l, k) => {
    g[l.from] = g[l.from]! + t[lattice.docks + 2 * k]!
    g[l.to] = g[l.to]! + t[lattice.docks + 2 * k + 1]!
  })

  return g.map(v => mod(v, n))
}

function slotSteps(sector: Sector, spec: BeatSpec): { steps: Step[]; exits: number; space: SlotSpace } {
  const { lattice, n } = sector
  const tuples = Array.from({ length: sector.size }, (_, i) => slotTupleOf(sector, i))
  const index = new Map(tuples.map((t, i) => [t.join(','), i]))
  let exits = 0

  const move = (f: (t: readonly number[]) => number[]): Int32Array =>
    Int32Array.from(tuples, t => {
      const j = index.get(f(t).join(','))

      if (j === undefined) {
        exits++

        return 0
      }

      return j
    })

  const steps: Step[] = []

  for (const l of lattice.hops) {
    const mv = move(t => slotHop(lattice, n, l, t))

    steps.push({ kind: 'hop', move: i => mv[i]!, z: spec.hop })
  }

  const electric = Int32Array.from(tuples, t => slotElectric(lattice, n, t))
  const half: Step = { kind: 'phase', exponent: i => -spec.electric * electric[i]! }

  steps.push(half)
  lattice.plaquettes.forEach((_, p) => {
    const sh = move(t => slotLoop(lattice, n, p, t))

    steps.push({ kind: 'loop', shift: i => sh[i]!, exponents: magneticExponents(n, spec.magnetic), n })
  })
  steps.push(half)

  return { steps, exits, space: { tuples, index } }
}

// exhaustive over the whole slot register space of one square at N = 3: does every factor keep u + w per link?
function slotSumChanges(lattice: Lattice, n: number): number {
  const R = lattice.docks + 2 * lattice.links.length
  const total = n ** R
  const t = new Array<number>(R).fill(0)
  let changes = 0

  const sums = (x: readonly number[]): string => lattice.links.map((_, l) => mod(x[lattice.docks + 2 * l]! + x[lattice.docks + 2 * l + 1]!, n)).join(',')

  for (let i = 0; i < total; i++) {
    let rest = i

    for (let q = R - 1; q >= 0; q--) {
      t[q] = rest % n
      rest = Math.floor(rest / n)
    }

    const before = sums(t)

    for (const l of lattice.hops) if (sums(slotHop(lattice, n, l, t)) !== before) changes++

    lattice.plaquettes.forEach((_, p) => {
      if (sums(slotLoop(lattice, n, p, t)) !== before) changes++
    })
  }

  return changes
}

function startsOf(sector: Sector, m: number): Exact[] {
  const picks: number[] = []

  for (let k = 1; picks.length < 4; k++) {
    const i = Math.floor(weyl(k) * sector.size)

    if (!picks.includes(i)) picks.push(i)
  }

  return [...picks.map(i => exactBasis(m, i)), exactFrom(m, picks.map(i => [i, 1n]))]
}

export default experiment({
  id: 'gauge/quantum-link-relation',
  code: 'E-FRC-0229',
  title:
    "can a quantum link stay a relation between vibes: its conjugate angle is no function of the vibes' history (no state starts with flow and angle both sharp, the plaquette step makes the flow depend on the initial angle, the plaquette term is a coherent sum of windings no history performs, and a light the matter only reads is unital), but the link IS a relation of its two end slots when each slot holds a port register mod N, with u + w = 0 kept exactly and Gauss local to each dock",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // R1
    let r1 = true

    for (const n of MODULI) {
      let twoCycles = 0

      for (let j = 1; j < n; j++) if (mod(-j, n) > j) twoCycles++

      metrics[`parityNegativeN${n}`] = twoCycles

      const reg = registers([n])
      const a0 = 1
      const w = wigner(reg, densityOf(basisState(reg, [a0]))).w
      let dev = 0

      for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) dev = Math.max(dev, Math.abs(w[a * n + b]! - (a === a0 ? 1 / n : 0)))

      metrics[`flowSharpAngleDeviationN${n}`] = dev
      r1 &&= twoCycles === (n - 1) / 2 && dev <= 1e-12
    }

    // R2
    let r2 = true

    for (const n of MODULI) {
      const lattice = squareLattice(1)
      const on = flowSpread(lattice, n, true)
      const off = flowSpread(lattice, n, false)

      // ADDED AFTER THE FIRST RUN (a reading, no gate changed): the count at each beat
      on.flows.forEach((c, t) => (metrics[`flowsWithPlaquetteN${n}Beat${t + 1}`] = c))
      metrics[`flowsWithPlaquetteN${n}`] = Math.min(...on.flows)
      metrics[`flowsWithPlaquetteMaxN${n}`] = Math.max(...on.flows)
      metrics[`flowsRecordOnlyN${n}`] = Math.max(...off.flows)
      metrics[`crossingHistoriesN${n}`] = Math.max(...on.charges, ...off.charges)
      r2 &&= on.charges.every(c => c === 1) && off.charges.every(c => c === 1) && on.flows.every(f => f > 1) && off.flows.every(f => f === 1)
    }

    // R3
    let r3 = true

    for (const n of MODULI) {
      const m = 6 * n

      for (const [name, r] of [
        ['Clifford', 6],
        ['Fractional', 1],
      ] as const) {
        const exponents = magneticExponents(n, r)
        let nonzero = 0
        let exactNorm = 0
        let purityHistory = 0
        const g = Array.from({ length: n }, (_, k) => loopAmplitude(n, m, exponents, k))

        for (let k = 0; k < n; k++) {
          if (canonical(g[k]!, m).some(x => x !== 0n)) nonzero++

          const sq = timesConjugate(g[k]!, m)

          if (sq[0] === BigInt(n) && sq.slice(1).every(x => x === 0n)) exactNorm++

          purityHistory += (modulusSquared(g[k]!, m) / (n * n)) ** 2
        }

        // the unitary's output from the flow-sharp start: sum_k (g_k / N) |k>, its purity is its norm squared
        const unitaryNorm = g.reduce((s, gk) => s + modulusSquared(gk, m) / (n * n), 0)

        metrics[`loopAmplitudesNonzero${name}N${n}`] = nonzero
        metrics[`loopAmplitudesExactN${name}N${n}`] = exactNorm
        metrics[`historyPurity${name}N${n}`] = purityHistory
        metrics[`unitaryPurity${name}N${n}`] = unitaryNorm ** 2
        r3 &&= nonzero === n && Math.abs(unitaryNorm ** 2 - 1) <= 1e-12

        if (name === 'Clifford') r3 &&= exactNorm === n && Math.abs(purityHistory - 1 / n) <= 1e-12
        else r3 &&= purityHistory < 1 - 1e-3
      }
    }

    // R4
    let r4 = true

    for (const n of MODULI) {
      const sector = buildSector(squareLattice(2), n)
      const spec = fearOn(n)
      const record = sectorBeat(sector, { ...spec, skipPlaquettes: [1] })
      const quantum = sectorBeat(sector, spec)
      let offRecord = 0
      let offQuantum = 0

      for (let i = 0; i < sector.size; i++) {
        const mB = sector.loops[i * 2 + 1]!

        for (const [steps, which] of [
          [record, 0],
          [quantum, 1],
        ] as const) {
          const out = runExact(steps, exactBasis(spec.m, i))

          for (const j of out.entries.keys()) {
            if (sector.loops[j * 2 + 1] !== mB) {
              if (which === 0) offRecord++
              else offQuantum++
            }
          }
        }
      }

      const zeroField: [number, number][] = Array.from({ length: n }, () => [1 / Math.sqrt(n), 0])
      const vacuum = registerVacuum(n)
      const defects = [
        krausDefect(sector, record, spec.m, zeroField),
        krausDefect(sector, record, spec.m, vacuum),
        krausDefect(sector, quantum, spec.m, zeroField),
        krausDefect(sector, quantum, spec.m, vacuum),
      ]

      metrics[`recordOffBlockN${n}`] = offRecord
      metrics[`quantumOffBlockN${n}`] = offQuantum
      metrics[`recordUnitalDefectZeroFieldN${n}`] = defects[0]!
      metrics[`recordUnitalDefectVacuumN${n}`] = defects[1]!
      metrics[`quantumUnitalDefectZeroFieldN${n}`] = defects[2]!
      metrics[`quantumUnitalDefectVacuumN${n}`] = defects[3]!
      r4 &&= offRecord === 0 && offQuantum > 0 && defects[0]! <= 1e-12 && defects[1]! <= 1e-12 && defects[2]! > 1e-6 && defects[3]! > 1e-6
    }

    // R5
    let r5 = true
    const slotChanges = slotSumChanges(squareLattice(1), 3)

    metrics.slotSumChangesN3 = slotChanges
    r5 &&= slotChanges === 0

    for (const n of MODULI) {
      const sector = buildSector(squareLattice(1), n)
      const spec = fearOn(n)
      const link = sectorBeat(sector, spec)
      const slot = slotSteps(sector, spec)
      let mismatches = 0
      let gaussDifferences = 0

      for (const start of startsOf(sector, spec.m)) {
        let a = start
        let b = start

        for (let t = 0; t < BEATS; t++) {
          a = runExact(link, a)
          b = runExact(slot.steps, b)

          if (!exactEqual(a, b)) mismatches++
        }
      }

      for (let i = 0; i < sector.size; i++) {
        const g = slotGauss(sector.lattice, n, slot.space.tuples[i]!)

        if (g.some((v, x) => v !== (x === sector.lattice.nucleus ? 1 : 0))) gaussDifferences++
      }

      metrics[`slotExitsN${n}`] = slot.exits
      metrics[`slotMismatchesN${n}`] = mismatches
      metrics[`slotGaussDifferencesN${n}`] = gaussDifferences
      metrics[`tritsPerLinkSlotFormN${n}`] = 2 * Math.ceil(Math.log(n) / Math.log(3) - 1e-12)
      r5 &&= slot.exits === 0 && mismatches === 0 && gaussDifferences === 0
    }

    const gates = { R1: r1, R2: r2, R3: r3, R4: r4, R5: r5 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : 'fail'

    return verdict({
      status,
      claim: `the conjugate angle is no function of the vibes' history: no state starts with flow and angle both sharp (A(0, 0) has ${metrics.parityNegativeN3}, ${metrics.parityNegativeN5}, ${metrics.parityNegativeN7} eigenvalues -1 at N = 3, 5, 7; a sharp flow has a uniform angle to ${Math.max(metrics.flowSharpAngleDeviationN3!, metrics.flowSharpAngleDeviationN5!, metrics.flowSharpAngleDeviationN7!).toExponential(1)}); from a record start one crossing history ends with ${metrics.flowsWithPlaquetteMaxN3}, ${metrics.flowsWithPlaquetteMaxN5}, ${metrics.flowsWithPlaquetteMaxN7} flows through the plaquette step and ${metrics.flowsRecordOnlyN3} without it, but at N = 3 and 5 the flows refocus to ${metrics.flowsWithPlaquetteN3} on every even beat (one beat maps the square's circulation and angle by a matrix of trace -30, whose square is -1 mod 3 and 5), so R2's every-beat clause fails; the plaquette term is a coherent sum of all N windings (${metrics.loopAmplitudesNonzeroCliffordN3}, ${metrics.loopAmplitudesNonzeroCliffordN5}, ${metrics.loopAmplitudesNonzeroCliffordN7} nonzero), and a winding history leaves purity ${metrics.historyPurityCliffordN7!.toFixed(4)} (= 1/7 exactly for the Clifford phases, ${metrics.historyPurityFractionalN7!.toFixed(4)} fractional) where the unitary keeps 1; a light the matter only reads is exactly block diagonal (${metrics.recordOffBlockN3}, ${metrics.recordOffBlockN5}, ${metrics.recordOffBlockN7} off-block) and unital (defect ${Math.max(metrics.recordUnitalDefectZeroFieldN7!, metrics.recordUnitalDefectVacuumN7!).toExponential(1)} at N = 7, ${metrics.quantumUnitalDefectVacuumN7!.toExponential(2)} with the plaquette step); but the link IS a relation of its two end slots: port registers u, w mod N with a = (u - w)/2 keep u + w = 0 (${slotChanges} changes over all 3^12 slot states), run the lattice QED exactly (${MODULI.map(n => metrics[`slotMismatchesN${n}`]).join(', ')} mismatches) and make Gauss local to each dock, at ${metrics.tritsPerLinkSlotFormN7} trits per link at N = 7: the conjugate is storage in the slots, not history`,
      metrics,
      control: {
        flowsRecordOnlyN5: metrics.flowsRecordOnlyN5!,
        recordOffBlockN5: metrics.recordOffBlockN5!,
        quantumOffBlockN5: metrics.quantumOffBlockN5!,
      },
      notes:
        "L2. FIRST RUN 2026-09-26 (tmp/frc0229.log), FAIL on R2 only, 4.7 s; FINAL RUN (tmp/frc0229-final.log) reproduces every number. SECOND RUN (tmp/frc0229-second.log), same verdict, with a per-beat reading of R2 ADDED AFTER THE FIRST RUN (no gate changed; the claim text was rewritten to name the refocusing). R2 as registered demanded more than one flow at EVERY beat; the per-beat counts are 3, 1, 3, 1, 3, 1 at N = 3, 5, 1, 5, 1, 5, 1 at N = 5 and 7 at every beat at N = 7. The reason, derived after the run: on one square the Clifford beat maps (circulation C, angle sum B) by E M E = [[-15, 8], [28, -15]] (electric B -= 2C, magnetic C += 8B), trace -30; for N | 30 its square is -1, so every second beat the flow is again the crossing record alone (an echo of the finite-field cat map), while at N = 7 the flow depends on the initial angle at every beat. Without the plaquette step the flow is the crossing record at every beat and every N (1 value), and the charges take 1 value throughout (one crossing history). R1: A(0, 0) has 1, 2, 3 eigenvalues -1 at N = 3, 5, 7, and a flow-sharp state's angle is uniform exactly. R3: all N loop amplitudes are nonzero for both magnetic phases; for the Clifford phases g_k conj(g_k) = N exactly for every k, so a winding history leaves purity 1/3, 1/5, 1/7 exactly; for the fractional phases 0.947, 0.785, 0.600; the unitary keeps 1. R4: the record light (second square's magnetic step off) is block diagonal in m_B exactly (0 off-block at N = 3, 5, 7; with the step 810, 7,500, 30,870) and unital to 1.6e-15 from the zero-field and the vacuum registers; with the step it misses unitality by 5.1e-3 to 4.5e-2. R5: u + w is kept on all 531,441 slot states at N = 3, the slot form never leaves the embedded sector, runs the lattice QED exactly (0 mismatches of 60 beat-states per N) and its dock-local Gauss equals the link form's on every state; 2 ceil(log3 N) trits per link, 2, 4, 4 at N = 3, 5, 7. KEY: the quantum link's conjugate is no function of the vibes' history (no joint sharp start; the plaquette step makes the flow depend on the initial angle, apart from echo beats; the plaquette term is a coherent sum of windings no history performs; a light the matter only reads is unital), but the link stays a RELATION of its two end slots if each slot holds a port register mod N (a column of D trits): the storage moves from the link into the slots, and Gauss becomes local to the dock.",
    })
  },
})

void applyExact
