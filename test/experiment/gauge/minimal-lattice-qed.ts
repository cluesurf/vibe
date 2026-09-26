// Minimal lattice QED on husk squares (E-FRC-0227): the smallest quantum light that IS the flow light, built exactly.
//
// WHY. E-FRC-0226 proved that a per-history light which is the electromagnetic (flow) light needs (a) a charge hop
// the flow records, (b) links stepping linearly mod 2D + 1 with no carry, (c) plaquette dynamics. That is
// Kogut-Susskind lattice QED with the link group cut to Z_N, N = 2D + 1. This file builds it on one husk square
// and on two squares sharing a rung, for N = 3, 5, 7, with every factor an exact unitary over Z[zeta_M]
// (code/rule/lattice-qed): nothing rounded, no angle, no real parameter, deterministic.
//
// THE MODEL (all STAND-INS for matter): a static charge +1 at dock 0 (the nucleus stand-in) and one electron
// stand-in (charge register n_x mod N, occupied at one dock) that crosses the first square's four links. Each
// link holds a flow register mod N. Gauss: G_x = div e(x) + n_x = [x = 0] mod N. The beat: the four recorded hops
// V_l(z) = (1 + z)/2 + (1 - z)/2 T_l in order, the electric phase zeta_M^(-c sum bal(e)^2), the magnetic
// f(U_p) = sum_B zeta_M^(-r bal(B)^2) Pi_B on each plaquette, the electric phase again. Fear on: z = w = zeta_3
// (the fear beat's swap phase), c = r = 1 over M = 6N (fractional turns). Fear off (Clifford): z = -1 (the
// classical hop), c = r = M / N (the light phases w_N^(-e^2), w_N^(-B^2)).
//
// DERIVED before the first run.
//   Gauss per history   T_l, U_p and every diagonal phase conserve each G_x as an operator (T_l moves the charge
//                       and the flow together; U_p adds a closed loop), so with one modulus every Wigner point of
//                       a sector state has the sector's G (E-FRC-0223's theorem: a point's position is the
//                       midpoint of a row and a column basis state, and G is linear)
//   reversal            every factor has an exact inverse in the same ring: V(z)^-1 = V(z^-1) (T_l an
//                       involution), phases negate, f(U_p)^-1 = conj f(U_p)
//   the classical limit A Clifford unitary moves each displacement to one displacement: U D(v) U^dag = k D(S v),
//                       the Wigner function moves point by point, and S is the classical integer light mod N:
//                         hop l (x -> y):  n_x, n_y swap; e_l += n_x - n_y; p_x' = p_y + b_l; p_y' = p_x - b_l
//                                          (the charge crosses, the flow records it, its conjugate is kicked by
//                                          the link's angle)
//                         electric (w^(-k e^2)):  b_l -= 2 k e_l            (the angle advances by the flow)
//                         magnetic (w^(-k B^2)):  e_l += 2 k sigma_l B_p,   B_p = sum sigma b   (the flow turns
//                                          by the plaquette's angle sum)
//                       (the hop and electric maps derived by hand; the magnetic sign read off a single-step probe,
//                       tmp/lqed-probe2.log, before this file: the angle label of U_p's eigenvalue is minus the
//                       Wigner conjugate). This is the integer-coupling leapfrog with E-FRC-0210's recorded trit
//                       hop, run mod N. The committed light's coupling kappa = 2 / (2D + 1) is a fraction, which is
//                       no element of Z_N: its carry is no quantum map (E-FRC-0223 G3), so the Clifford limit is the
//                       unit-coupling light, and a quantum light at the physical coupling has fractional phases,
//                       which are not Clifford (reported below)
//
// Gates, fixed before the first run:
// G1 Gauss per history. (a) exhaustive on the full register space (one square at N = 3, 5, 7: 6,561, 390,625,
//    5,764,801 basis states; two squares at N = 3: 1,594,323): every recorded hop and every loop shift keeps every
//    G_x on every basis state (0 violations); the unrecorded hop (charges swap, flow unchanged) violates on more
//    than 0. (b) sector closure on all six systems: the recorded hops never leave the sector (0 exits); the
//    unrecorded hops leave it (more than 0). (c) per history: from 5 starts per system (4 golden-Weyl sector basis
//    states and their sum), 12 fear-on beats, every pair of support states at every beat has a midpoint point
//    with the sector's G (0 off); the same run on one square at N = 3 with the unrecorded hop in the full register
//    space (floats, 3 beats) has more than 0 off
// G2 reversal: on all six systems, the fear-on and the Clifford beats, each start run 12 beats forward and 12
//    back equals the start exactly in Z[zeta_M] (0 mismatches of 60 runs)
// G3 the classical limit: the Clifford beat maps every generator displacement (X and Z on every register) to a
//    single displacement k D(S v) with k the same for every basis state and S the classical map above: one square
//    at N = 3 on every basis state (16 generators x 6,561), at N = 5 and two squares at N = 3 on 64 golden-Weyl
//    basis states per generator: 0 mismatches; with the fear beat's hop (z = w) and the same light, more than 0
//    conjugates are not a single displacement
// Reported: the period of the classical map S, the count of single displacements under the light at the
//    fractional (physical-side) coupling c = r = 1 with the classical hop, the norm drift in floats, the
//    denominators' growth.
// Status: pass if G1, G2, G3 pass; fail otherwise.
//
// Depth L2: Kogut-Susskind lattice gauge theory with a Z_N link group (Kogut and Susskind 1975, Horn 1979) and
// the Clifford-Wigner correspondence (Gross 2006), built exactly on the model's registers; husk squares only, no
// bulk reading (each husk link would be a column sum of bulk links, E-FRC-0207, not modeled here).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl } from '@/code/tool/weyl'
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
  fullBeat,
  fullElectric,
  fullHop,
  fullLoopShift,
  fullSpace,
  inverseSteps,
  magneticExponents,
  mod,
  reduce,
  runExact,
  sectorBeat,
  sectorHop,
  squareLattice,
  type BeatSpec,
  type Exact,
  type Full,
  type Lattice,
  type Sector,
  type Step,
} from '@/code/rule/lattice-qed'

const MODULI = [3, 5, 7]
const BEATS = 12
const SAMPLED = 64

const fearOn = (n: number): BeatSpec => ({ m: 6 * n, hop: 2 * n, electric: 1, magnetic: 1 })
const clifford = (n: number): BeatSpec => ({ m: 6 * n, hop: 3 * n, electric: 6, magnetic: 6 })

// G_x of a full basis state, into `g`
function gaussDigits(lattice: Lattice, n: number, d: Int32Array, g: Int32Array): void {
  for (let x = 0; x < lattice.docks; x++) g[x] = d[x]!

  lattice.links.forEach((l, k) => {
    g[l.from] = g[l.from]! + d[lattice.docks + k]!
    g[l.to] = g[l.to]! - d[lattice.docks + k]!
  })

  for (let x = 0; x < lattice.docks; x++) g[x] = mod(g[x]!, n)
}

// G1a: exhaustive over the full register space
function exhaustiveGauss(full: Full): { violations: number; control: number } {
  const { lattice, n } = full
  const moves = [...lattice.hops.map(l => fullHop(full, l)), ...lattice.plaquettes.map((_, p) => fullLoopShift(full, p))]
  const controls = lattice.hops.map(l => fullHop(full, l, false))
  const d = new Int32Array(full.registers)
  const g0 = new Int32Array(lattice.docks)
  const g1 = new Int32Array(lattice.docks)
  let violations = 0
  let control = 0

  const differs = (j: number): boolean => {
    full.digits(j, d)
    gaussDigits(lattice, n, d, g1)

    for (let x = 0; x < lattice.docks; x++) if (g0[x] !== g1[x]) return true

    return false
  }

  for (let i = 0; i < full.size; i++) {
    full.digits(i, d)
    gaussDigits(lattice, n, d, g0)

    for (const move of moves) if (differs(move(i))) violations++

    for (const move of controls) if (differs(move(i))) control++
  }

  return { violations, control }
}

// the full tuple (charges, flows) of a sector index
function tupleOf(sector: Sector, i: number): number[] {
  const t = new Array<number>(sector.lattice.docks).fill(0)

  t[sector.dock[i]!] = 1

  for (let l = 0; l < sector.lattice.links.length; l++) t.push(sector.flux[i * sector.lattice.links.length + l]!)

  return t
}

// G1c: the midpoints of every support pair carry the sector's G
function midpointsOff(lattice: Lattice, n: number, tuples: number[][]): number {
  const half = (n + 1) / 2
  const g = new Int32Array(lattice.docks)
  const d = new Int32Array(lattice.docks + lattice.links.length)
  let off = 0

  for (let a = 0; a < tuples.length; a++) {
    for (let b = a; b < tuples.length; b++) {
      for (let q = 0; q < d.length; q++) d[q] = mod((tuples[a]![q]! + tuples[b]![q]!) * half, n)

      gaussDigits(lattice, n, d, g)

      for (let x = 0; x < lattice.docks; x++) {
        if (g[x] !== (x === lattice.nucleus ? 1 : 0)) {
          off++
          break
        }
      }
    }
  }

  return off
}

function starts(sector: Sector, m: number): Exact[] {
  const picks: number[] = []

  for (let k = 1; picks.length < 4; k++) {
    const i = Math.floor(weyl(k) * sector.size)

    if (!picks.includes(i)) picks.push(i)
  }

  return [...picks.map(i => exactBasis(m, i)), exactFrom(m, picks.map(i => [i, 1n]))]
}

function displace(full: Full, m: number, v: Exact, a: readonly number[], b: readonly number[]): Exact {
  const d = new Int32Array(full.registers)
  const out = new Map<number, bigint[]>()
  const unit = m / full.n

  for (const [i, e] of v.entries) {
    full.digits(i, d)

    let phase = 0

    for (let q = 0; q < full.registers; q++) phase += unit * b[q]! * d[q]!

    const shifted = new Array<bigint>(m).fill(0n)

    for (let j = 0; j < m; j++) shifted[mod(j + phase, m)] = e[j]!

    for (let q = 0; q < full.registers; q++) d[q] = d[q]! + a[q]!

    out.set(full.index(d), shifted)
  }

  return { m, den: v.den, entries: out }
}

const applyAll = (steps: readonly Step[], v: Exact): Exact => reduce(steps.reduce((w, s) => applyExact(s, w), v))

// G3: U D(v) U^dag against k D(S v), over basis states `js`; returns [mismatches, conjugates with more than one entry]
function cliffordCheck(full: Full, spec: BeatSpec, js: readonly number[], k: number | null): { mismatches: number; spread: number; checked: number } {
  const m = spec.m
  const U = fullBeat(full, spec)
  const Ud = inverseSteps(U)
  let mismatches = 0
  let spread = 0
  let checked = 0

  for (let q = 0; q < full.registers; q++) {
    for (const [ga, gb] of [
      [1, 0],
      [0, 1],
    ] as const) {
      const a = new Array<number>(full.registers).fill(0)
      const b = new Array<number>(full.registers).fill(0)

      a[q] = ga
      b[q] = gb

      if (k !== null) classicalLightBeat(full.lattice, full.n, k, a, b)

      let first: { value: bigint[]; den: bigint; pred: number } | null = null

      for (const j of js) {
        const g = new Array<number>(full.registers).fill(0)
        const h = new Array<number>(full.registers).fill(0)

        g[q] = ga
        h[q] = gb

        const w = applyAll(U, displace(full, m, applyAll(Ud, exactBasis(m, j)), g, h))

        checked++

        if (w.entries.size !== 1) {
          spread++
          mismatches++
          continue
        }

        if (k === null) continue

        // prediction: D(S v) |j> = zeta^(pred) |target>
        const pred = displace(full, m, exactBasis(m, j), a, b)
        const [target, predValue] = [...pred.entries][0]!
        const [at, value] = [...w.entries][0]!

        if (at !== target) {
          mismatches++
          continue
        }

        const predPower = predValue!.findIndex(x => x !== 0n)

        if (first === null) {
          first = { value: value!, den: w.den, pred: predPower }
          continue
        }

        // value(j) zeta^(pred(j0)) den(j0) == value(j0) zeta^(pred(j)) den(j)
        const left = new Array<bigint>(m).fill(0n)
        const right = new Array<bigint>(m).fill(0n)

        for (let t = 0; t < m; t++) {
          left[mod(t + first.pred, m)] = value![t]! * first.den
          right[mod(t + predPower, m)] = first.value[t]! * w.den
        }

        const cl = canonical(left, m)
        const cr = canonical(right, m)

        if (cl.some((x, t) => x !== cr[t])) mismatches++
      }
    }
  }

  return { mismatches, spread, checked }
}

// the order of the classical beat as a map on points
function classicalPeriod(lattice: Lattice, n: number): number {
  const R = lattice.docks + lattice.links.length
  const vectors = Array.from({ length: 2 * R }, (_, u) => {
    const a = new Array<number>(R).fill(0)
    const b = new Array<number>(R).fill(0)

    if (u < R) a[u] = 1
    else b[u - R] = 1

    return { a, b, a0: [...a], b0: [...b] }
  })

  for (let t = 1; t <= 100000; t++) {
    for (const v of vectors) classicalLightBeat(lattice, n, 1, v.a, v.b)

    if (vectors.every(v => v.a.every((x, q) => x === v.a0[q]) && v.b.every((x, q) => x === v.b0[q]))) return t
  }

  return -1
}

export default experiment({
  id: 'gauge/minimal-lattice-qed',
  code: 'E-FRC-0227',
  title:
    'minimal lattice QED on husk squares, exact over the cyclotomic integers: with STAND-IN matter (a static charge and one hopping electron whose crossings the flow records), Z_N links, the electric and plaquette terms as exact unitaries, Gauss holds in every history, the run reverses exactly, and the Clifford (fear-off) limit is the classical integer light mod N point for point',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const systems: { count: 1 | 2; n: number; sector: Sector }[] = []

    for (const count of [1, 2] as const) for (const n of MODULI) systems.push({ count, n, sector: buildSector(squareLattice(count), n) })

    // G1a
    let gaussViolations = 0
    let gaussControl = 0

    for (const [count, n] of [
      [1, 3],
      [1, 5],
      [1, 7],
      [2, 3],
    ] as const) {
      const r = exhaustiveGauss(fullSpace(squareLattice(count), n))

      metrics[`gaussViolationsS${count}N${n}`] = r.violations
      metrics[`gaussControlS${count}N${n}`] = r.control
      gaussViolations += r.violations
      gaussControl += r.control
    }

    // G1b
    let exits = 0
    let controlExits = 0

    for (const { sector } of systems) {
      for (const l of sector.lattice.hops) {
        exits += sectorHop(sector, l).filter(j => j < 0).length
        controlExits += sectorHop(sector, l, false).filter(j => j < 0).length
      }
    }

    // G1c and G2
    let midpointOff = 0
    let reversalMismatches = 0
    let reversalRuns = 0
    let largestDenBits = 0

    for (const { count, n, sector } of systems) {
      for (const [name, spec] of [
        ['fear', fearOn(n)],
        ['clifford', clifford(n)],
      ] as const) {
        const steps = sectorBeat(sector, spec)
        const back = inverseSteps(steps)

        for (const start of starts(sector, spec.m)) {
          let v = start

          for (let t = 0; t < BEATS; t++) {
            v = runExact(steps, v)

            if (name === 'fear') midpointOff += midpointsOff(sector.lattice, n, [...v.entries.keys()].map(i => tupleOf(sector, i)))
          }

          largestDenBits = Math.max(largestDenBits, v.den.toString(2).length)
          reversalRuns++

          if (!exactEqual(runExact(back, v, BEATS), start)) reversalMismatches++
        }
      }

      metrics[`sectorSizeS${count}N${n}`] = sector.size
    }

    // G1c control: the unrecorded hop in the full space of one square at N = 3, floats, 3 beats
    const full3 = fullSpace(squareLattice(1), 3)
    const spec3 = fearOn(3)
    const electric3 = fullElectric(full3)
    const half3: Step = { kind: 'phase', exponent: i => -spec3.electric * electric3(i) }
    const controlSteps: Step[] = [
      ...full3.lattice.hops.map(l => ({ kind: 'hop', move: fullHop(full3, l, false), z: spec3.hop }) as Step),
      half3,
      { kind: 'loop', shift: fullLoopShift(full3, 0), exponents: magneticExponents(3, spec3.magnetic), n: 3 },
      half3,
    ]
    const sector13 = systems[0]!.sector
    const startTuple = tupleOf(sector13, starts(sector13, spec3.m).map(s => [...s.entries.keys()][0]!)[0]!)
    let cv = { re: new Float64Array(full3.size), im: new Float64Array(full3.size) }

    cv.re[full3.index(startTuple)] = 1

    let controlOff = 0
    const dd = new Int32Array(full3.registers)

    for (let t = 0; t < 3; t++) {
      for (const s of controlSteps) cv = applyFloat(s, cv, spec3.m)

      const support: number[][] = []

      for (let i = 0; i < full3.size; i++) {
        if (cv.re[i]! ** 2 + cv.im[i]! ** 2 > 1e-24) {
          full3.digits(i, dd)
          support.push(Array.from(dd))
        }
      }

      controlOff += midpointsOff(full3.lattice, 3, support)
    }

    // G3
    const full5 = fullSpace(squareLattice(1), 5)
    const full23 = fullSpace(squareLattice(2), 3)
    const sample = (full: Full): number[] => Array.from({ length: SAMPLED }, (_, k) => Math.floor(weyl(k + 1) * full.size))
    const every3 = Array.from({ length: full3.size }, (_, j) => j)
    const g3a = cliffordCheck(full3, clifford(3), every3, 1)
    const g3b = cliffordCheck(full5, clifford(5), sample(full5), 1)
    const g3c = cliffordCheck(full23, clifford(3), sample(full23), 1)
    const g3control = cliffordCheck(full3, { ...clifford(3), hop: 2 * 3 }, sample(full3), null)
    const fractional = cliffordCheck(full3, { ...clifford(3), electric: 1, magnetic: 1 }, sample(full3), null)
    const cliffordMismatches = g3a.mismatches + g3b.mismatches + g3c.mismatches

    Object.assign(metrics, {
      gaussViolations,
      gaussControl,
      sectorExits: exits,
      sectorControlExits: controlExits,
      midpointOff,
      midpointControlOff: controlOff,
      reversalRuns,
      reversalMismatches,
      largestDenBits,
      cliffordChecked: g3a.checked + g3b.checked + g3c.checked,
      cliffordMismatchesS1N3: g3a.mismatches,
      cliffordMismatchesS1N5: g3b.mismatches,
      cliffordMismatchesS2N3: g3c.mismatches,
      fearHopSpread: g3control.spread,
      fearHopChecked: g3control.checked,
      fractionalLightSpread: fractional.spread,
      fractionalLightChecked: fractional.checked,
      classicalPeriodS1N3: classicalPeriod(squareLattice(1), 3),
      classicalPeriodS1N5: classicalPeriod(squareLattice(1), 5),
      classicalPeriodS1N7: classicalPeriod(squareLattice(1), 7),
      classicalPeriodS2N3: classicalPeriod(squareLattice(2), 3),
    })

    const gates = {
      G1: gaussViolations === 0 && gaussControl > 0 && exits === 0 && controlExits > 0 && midpointOff === 0 && controlOff > 0,
      G2: reversalMismatches === 0 && reversalRuns === 60,
      G3: cliffordMismatches === 0 && g3control.spread > 0,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : 'fail'

    return verdict({
      status,
      claim: `Z_N lattice QED on one and two husk squares (N = 3, 5, 7; sectors of ${systems.map(s => s.sector.size).join(', ')} states) with a STAND-IN nucleus and electron, exact over Z[zeta_6N]: every recorded hop and loop shift keeps Gauss on every full basis state (${gaussViolations} violations over 4 full spaces, the unrecorded hop ${gaussControl}), the recorded hops never leave the sector (${exits}; unrecorded ${controlExits}), every support pair's midpoint over 12 fear-on beats carries the sector's G (${midpointOff} off; unrecorded ${controlOff}), ${reversalRuns - reversalMismatches} of ${reversalRuns} runs return exactly after 12 beats back, and the Clifford beat (z = -1, w_N^(-e^2), w_N^(-B^2)) moves every generator displacement to one displacement equal to the classical integer light mod N with the recorded hop (${cliffordMismatches} mismatches of ${g3a.checked + g3b.checked + g3c.checked}; period ${metrics.classicalPeriodS1N3}, ${metrics.classicalPeriodS1N5}, ${metrics.classicalPeriodS1N7} beats on one square at N = 3, 5, 7), while the fear beat's hop spreads ${g3control.spread} of ${g3control.checked} and the fractional light (c = r = 1) spreads ${fractional.spread} of ${fractional.checked}: the physical coupling is not a per-history light`,
      metrics,
      control: { gaussControl, sectorControlExits: controlExits, midpointControlOff: controlOff, fearHopSpread: g3control.spread },
      notes:
        'L2. FIRST RUN 2026-09-26 (tmp/frc0227.log), PASS in 33.7 s, no gate changed; FINAL RUN (tmp/frc0227-final.log) after a mechanical typecheck edit reproduces every number. Probes before the file: tmp/lqed-probe1.log (exact reversal on all six systems, floats within 1.6e-15, a first Clifford position check that disagreed with the hand map on 816 of 1,088 cases) and tmp/lqed-probe2.log (the single-step images: hop and electric exactly as derived, the magnetic sign opposite, because the label B of U_p\'s eigenvalue w^B is minus the Wigner conjugate); the classical map in code/rule/lattice-qed was written with the observed magnetic sign before this file. G1: 0 Gauss violations over the four full spaces (6,561 + 390,625 + 5,764,801 + 1,594,323 basis states, 9 or 12 moves each), the unrecorded hop 25,284,056; 0 sector exits (784 unrecorded); 0 of every support pair midpoint off over 12 fear-on beats from 5 starts on 6 systems (216 off with the unrecorded hop in 3 beats). G2: 60 of 60 runs back exactly (denominators up to 116 bits). G3: 107,664 conjugates, 0 mismatches against the classical integer light with the recorded hop; the fear beat\'s hop (z = w) makes 732 of 1,024 conjugates spread over several displacements, and the fractional light c = r = 1 (zeta_6N^(-e^2), the physical side of the coupling) 768 of 1,024. The classical map has period 36, 60, 42 on one square at N = 3, 5, 7 and 18 on two squares at N = 3: a finite-field cat map, not a slow oscillation, because the Clifford coupling is an integer. KEY: the quantum flow light is buildable exactly, reversible and Gauss-exact per history; its per-history (Clifford) limit is the unit-coupling light mod N, and the physical fractional coupling kappa = 2 / (2D + 1) exists only as fractional phases, which are not Clifford, so at the physical coupling the light moves no point to one point and no history carries a definite light (negative weight was not measured here).',
    })
  },
})

void bal
