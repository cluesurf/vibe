// Does the hot vacuum's broken symmetry leak into husk transport? The three-body leak of the candidate knit, as a
// function of the density (E-RLT-0072).
//
// THE QUESTION. The hot vacuum (every line's store +1 in its own orientation) keeps only the diagram S3 of W(F4)
// (E-RLT-0069), a group that forces no transport isotropic, not even at leading order. Yet a lone vibe on it goes
// straight and the one- and two-body collisions on it keep all of W(F4): the orientation shows in the vibes only
// from three vibes in one dock. So a dilute gas on the hot vacuum moves isotropically in the binary limit, and the
// broken symmetry can enter at the three-body order. At the densities the battery uses (E-RLT-0070 runs golden fills,
// about 0.4 and 0.7 of the slots held, on the hot store), does it reach the husk transport, and how does it scale?
//
// WHAT IS KNOWN BEFORE RUNNING, and what is predicted.
//  (a) The candidate is the pair-making knit with the neutral veto and the store places; its husk scalars live in the
//      72-index singlet of E-RLT-0071 (code/measure/token-store-linearization), which allows any product background,
//      including every store at +1.
//  (b) The collision is W(F4)-covariant, so at a background b, P_g A(b) P_g^-1 = A(g b). The W(F4) average of A(hot) is
//      then the linear response averaged over the 192 oriented vacua, and what is left, A(hot) minus its average, is
//      the part that sees the orientation. At the symmetric store law and at the cold vacuum (store 0) it vanishes.
//  (c) In the VIBE rows the orientation needs three vibes in a dock: the input and two others, so that part should
//      fall as rho^2. In the STORE rows it needs one: a lone vibe's dock has momentum r, not 0, so the stored pairs are
//      turned by w(r) instead of the -1 map and the dock's store is left out of phase with the vacuum on the lines w(r)
//      does not reverse (the wake of E-RLT-0069). So the store rows see the orientation at order rho^0.
//  (d) The hot vacuum clocks with period 2 (the store negates every beat), so the linear map is the period-2 product
//      M(k) = S(k) A(-hot) S(k) A(hot), and A(-hot) = R A(hot) R^-1 for the -1 map R. The hot background is not an
//      equilibrium of a gas (orientation is not conserved), so this is the linear response of a gas laid on the
//      vacuum, read before the vacuum melts; (e) measures how fast it melts.
//  (e) Melting: the orientation order m(t) = mean over lines of tau (-1)^t, from 1, on a side-5 box with the gas at
//      density rho, run by the full rule's classical kernel (code/measure/candidate-kernel).
//
// THE MEASUREMENT. rho in {1/64, 1/32, 1/16, 1/8, 1/4, 0.4, 0.7}. Per rho: the exact matrices at the hot store, at
// -hot, at the cold store and at the isotropic Gibbs store law with the same rho (stores +-1 each s^2 / (1 + 2 s^2),
// s = rho / (2 (1 - rho))), point agreement 1/9; the anisotropic part of A(hot) by block (vibe or store row, vibe or
// store column); the husk charge diffusion D per direction (37 husk directions) at k = rho / 8, rho / 16, rho / 32,
// from the hydrodynamic modes picked by their overlap with the left invariants (a flat band of store modes can sit
// nearer the unit circle, E-RLT-0069), on the oriented period-2 map and on the Gibbs control run twice; its anisotropy
// (max - min) / mean at the smallest k. Melting over 96 beats per rho.
//
// Gates, fixed before the first run:
//  X1 instrument: the anisotropic part of A is 0 to 1e-10 at the cold store and at the Gibbs store law at every rho;
//     A(-hot) = R A(hot) R^-1 to 1e-10 at every rho; the exact matrix at rho 0.3 with store law (0.6, 0.2, 0.2)
//     agrees with a 200,000-dock sampled estimate from the full collision (tokens, places, points) to 0.02; the
//     melting kernel agrees with the full rule (storeBeat) bit for bit on the side-3 box, golden fill on the hot
//     store, 48 beats, with the veto acting (vetoes over 0)
//  X2 the period-2 map's left invariants hold charge, energy and the four momenta (each inside their span to 1e-9)
//     at every rho; the Gibbs control's charge anisotropy at the smallest k is under 1e-4 at every rho (the
//     isotropic background reads isotropic)
// Hypotheses:
//  H1 the vibe-row anisotropic part of A(hot) is at least 1e-8 at every rho, and its log-log slope against rho over
//     1/64 to 1/16 is at least 1.7 (three bodies)
//  H2 the store-row anisotropic part does not vanish with rho: its slope over 1/64 to 1/16 is under 0.3 (the one-body
//     wake)
//  H3 the leak reaches the husk transport at leading order: on the oriented map the husk charge D's anisotropy at
//     the smallest k is at least 100 times the Gibbs control's at every rho from 1/16 up, and it falls toward low
//     density (its slope against rho over 1/64 to 1/16 is at least 0.7)
//  H4 at the battery's densities (0.4 and 0.7) the orientation melts within 24 beats (m under 1/e), so the leak there
//     lives only in the first beats of a run on the hot store
// Verdict: pass if X1, X2 and H1 to H4 hold; fail if X1 and X2 hold and some H does not; partial otherwise.
//
// DISCLOSED: before the first run, tmp/cand-probe-linear.ts checked the linearization (the E-RLT-0071 instrument, at
// the symmetric background only) and tmp/cand-probe-kernel.ts checked the melting kernel against storeBeat (0
// mismatching beats); neither read an anisotropic part, a transport number or a melting run.
//
// Depth L2. DETERMINISM: exact enumeration, Kronecker docks and Weyl starts, golden-spiral directions, no draw. The
// husk is read (directions with x4 = 0); the anisotropic part of A is a bulk statement about the collision, stated
// as such.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { isometricTable, OPPOSITE } from '@/code/rule/isometric-knit'
import { pairIndexPermutation } from '@/code/measure/pair-knit-linearization'
import {
  anisotropicPart,
  hydroModes,
  sampledStoreLinearization,
  storeLinearization,
  STORE_N,
  STORE_SPACE,
  type Background,
} from '@/code/measure/token-store-linearization'
import { storeKnit, storeWeave } from '@/code/measure/token-store-gates'
import { familiesOf, invariantsOf, type Named } from '@/code/measure/store-transport'
import { huskDirections, logSlope } from '@/code/measure/husk-transport-order'
import { makeColorWeave } from '@/code/rule/color-weave'
import { fullState, goldenFill, kernelAgreement, makeKernel, makeRunner, type Reduced } from '@/code/measure/candidate-kernel'
import { weyl } from '@/code/tool/weyl'

const N = STORE_N
const ROOTS = rootsD4()
const RHOS = [1 / 64, 1 / 32, 1 / 16, 1 / 8, 1 / 4, 0.4, 0.7]
const LOW = [0, 1, 2]
const K_FRACTIONS = [1 / 8, 1 / 16, 1 / 32]
const EQUAL = 1 / 9
const SAMPLES = 200_000
const MELT_SIDE = 5
const MELT_BEATS = 96
const NAMED: Named = {
  charge: Float64Array.from({ length: N }, (_, i) => (i < 48 ? (i % 2 === 0 ? 1 : -1) : 0)),
  momentumAlong: u => Float64Array.from({ length: N }, (_, i) => (i < 48 ? (ROOTS[i >> 1] as number[]).reduce((s, x, k) => s + x * (u[k] ?? 0), 0) : 0)),
}
const ENERGY = Float64Array.from({ length: N }, (_, i) => (i < 48 ? 1 : 2))

const gibbs = (rho: number): Background => {
  const s = rho / (2 * (1 - rho))
  const z = 1 + 2 * s * s

  return { rho, store: [(s * s) / z, (s * s) / z, 1 / z], equal: EQUAL }
}

function inside(v: Float64Array, basis: readonly Float64Array[]): number {
  let norm = 0
  let projected = 0

  for (let i = 0; i < v.length; i++) norm += (v[i] as number) ** 2

  for (const b of basis) {
    let s = 0

    for (let i = 0; i < v.length; i++) s += (b[i] as number) * (v[i] as number)

    projected += s * s
  }

  return projected / norm
}

// the husk charge D per direction at wave number k, and its anisotropy; with `all`, also the trace, sound and shear
// of the other hydrodynamic modes (store-transport's quantities, a reading added after the first run)
function chargeAnisotropy(
  matrices: Float64Array[],
  invariants: Float64Array[],
  k: number,
  directions: number[][],
  all = false,
): { anisotropy: number; mean: number; found: number; others: Record<string, number> } {
  const values: number[] = []
  const per: Record<string, number[]> = { trace: [], sound: [], shear: [] }

  for (const u of directions) {
    const families = familiesOf(STORE_SPACE, NAMED, u, invariants)
    const modes = hydroModes({ matrices, wave: u.map(x => x * k), invariants, families, count: invariants.length })
    const charge = modes.reduce((best, m) => (m.family === 'charge' && m.share > (best?.share ?? -1) ? m : best), undefined as (typeof modes)[number] | undefined)

    if (charge) values.push(charge.gamma / (k * k))

    if (all) {
      const decaying = modes.filter(m => m !== charge && m.gamma / (k * k) > 1e-4)

      if (decaying.length > 0) {
        per.trace!.push(decaying.reduce((s, m) => s + m.gamma / (k * k), 0))

        const speed = Math.max(...decaying.map(m => m.omega / k))

        if (speed > 1e-3) per.sound!.push(speed)
      }

      for (const m of decaying) if (m.family === 'shear') per.shear!.push(m.gamma / (k * k))
    }
  }

  const spreadOf = (v: number[]): number => (v.length > 1 ? (Math.max(...v) - Math.min(...v)) / (v.reduce((s, x) => s + x, 0) / v.length) : Number.NaN)
  const mean = values.reduce((s, x) => s + x, 0) / Math.max(1, values.length)

  return {
    anisotropy: spreadOf(values),
    mean,
    found: values.length,
    others: all ? Object.fromEntries(Object.entries(per).map(([q, v]) => [q, spreadOf(v)])) : {},
  }
}

// a reading added after the first run: the orientation order per dock, |sum over its lines of tau| / 12, averaged
// over docks (1 on any hot vacuum at any beat, whatever docks negate; about 0.19 for independent symmetric stores)
function dockOrder(store: Int8Array): number {
  let total = 0
  const cells = store.length / 12

  for (let x = 0; x < cells; x++) {
    let s = 0

    for (let l = 0; l < 12; l++) s += store[x * 12 + l] as number

    total += Math.abs(s) / 12
  }

  return total / cells
}

// the orientation order and the store filling over the melting run
function melt(rho: number, symmetric = false): { order: number[]; filling: number[]; meltBeat: number; dock: number[] } {
  const weave = makeColorWeave({ side: MELT_SIDE, table: 'bind' })
  const kernel = makeKernel(weave)
  const cells = weave.mesh.cellCount
  const start: Reduced = {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    store: new Int8Array(cells * 12).fill(1),
    spoint: new Int8Array(cells * 12),
  }
  const rate = (q: number): number => Math.sqrt(q) - Math.floor(Math.sqrt(q))

  for (let i = 0; i < cells * 24; i++) {
    const u = weyl(i + 1, rate(2))

    start.vibe[i] = u < rho / 2 ? 1 : u < rho ? -1 : 0
    start.point[i] = Math.floor(weyl(i + 1, rate(3)) * 9) % 9
  }

  for (let i = 0; i < cells * 12; i++) start.spoint[i] = Math.floor(weyl(i + 1, rate(5)) * 9) % 9

  // the control (a reading added after the first run): stores symmetric, each a third to each value
  if (symmetric) for (let i = 0; i < cells * 12; i++) start.store[i] = Math.floor(weyl(i + 1, rate(7)) * 3) - 1

  const run = makeRunner(kernel, start)
  const order: number[] = []
  const filling: number[] = []
  const dock: number[] = []
  let meltBeat = -1

  for (let t = 0; t <= MELT_BEATS; t++) {
    const s = run.state()
    let m = 0
    let f = 0

    dock.push(dockOrder(s.store))

    for (let i = 0; i < s.store.length; i++) {
      m += (s.store[i] as number) * (t % 2 === 0 ? 1 : -1)
      f += s.store[i] !== 0 ? 1 : 0
    }

    order.push(m / s.store.length)
    filling.push(f / s.store.length)

    if (meltBeat < 0 && m / s.store.length < 1 / Math.E) meltBeat = t

    if (t < MELT_BEATS) run.beat()
  }

  return { order, filling, meltBeat, dock }
}

let cached: { status: string; metrics: Record<string, number> } | undefined

export function threeBodyLeak(): { status: string; claim: string; metrics: Record<string, number>; control: Record<string, number>; notes: string } {
  const started = Date.now()
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const table = isometricTable()
  const minus = pairIndexPermutation(OPPOSITE)
  const directions = huskDirections(24)
  const metrics: Record<string, number> = {}
  const control: Record<string, number> = {}
  const rows: { rho: number; vv: number; vs: number; sv: number; ss: number; oriented: number; gibbs: number; invariants: number; lawsInside: boolean; meltBeat: number; order24: number; filling24: number }[] = []
  let symmetricWorst = 0
  let minusWorst = 0

  for (const rho of RHOS) {
    const hot = storeLinearization({ table, background: { rho, store: [1, 0, 0], equal: EQUAL } })
    const cold = storeLinearization({ table, background: { rho, store: [0, 0, 1], equal: EQUAL } })
    const odd = storeLinearization({ table, background: { rho, store: [0, 1, 0], equal: EQUAL } })
    const iso = storeLinearization({ table, background: gibbs(rho) })
    const part = anisotropicPart(hot, permutations)

    symmetricWorst = Math.max(symmetricWorst, anisotropicPart(cold, permutations).vibeRows, anisotropicPart(cold, permutations).storeRows)
    symmetricWorst = Math.max(symmetricWorst, anisotropicPart(iso, permutations).vibeRows, anisotropicPart(iso, permutations).storeRows)

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        minusWorst = Math.max(minusWorst, Math.abs((odd[(minus[r] as number) * N + (minus[c] as number)] as number) - (hot[r * N + c] as number)))
      }
    }

    const oriented = [hot, odd]
    const control2 = [iso, iso]
    const invariants = invariantsOf(STORE_SPACE, oriented)
    const controlInvariants = invariantsOf(STORE_SPACE, control2)
    const laws = [NAMED.charge, ENERGY, ...[0, 1, 2, 3].map(k => NAMED.momentumAlong([0, 1, 2, 3].map(j => (j === k ? 1 : 0))))]
    const lawsInside = laws.every(v => Math.abs(inside(v, invariants) - 1) < 1e-9)
    const k = rho * (K_FRACTIONS[K_FRACTIONS.length - 1] as number)
    const onOriented = K_FRACTIONS.map(f => chargeAnisotropy(oriented, invariants, rho * f, directions, true))
    const onGibbs = chargeAnisotropy(control2, controlInvariants, k, directions, true)
    const melted = melt(rho)
    const meltedControl = melt(rho, true)
    const row = {
      rho,
      ...part.blocks,
      oriented: onOriented[onOriented.length - 1]?.anisotropy ?? Number.NaN,
      gibbs: onGibbs.anisotropy,
      invariants: invariants.length,
      lawsInside,
      meltBeat: melted.meltBeat,
      order24: melted.order[24] ?? Number.NaN,
      filling24: melted.filling[24] ?? Number.NaN,
    }

    rows.push(row)

    const tag = `rho${rho < 0.1 ? `1_${Math.round(1 / rho)}` : String(rho).replace('.', 'p')}`

    metrics[`${tag}_anisotropic_vibeFromVibe`] = part.blocks.vv
    metrics[`${tag}_anisotropic_vibeFromStore`] = part.blocks.vs
    metrics[`${tag}_anisotropic_storeFromVibe`] = part.blocks.sv
    metrics[`${tag}_anisotropic_storeFromStore`] = part.blocks.ss
    metrics[`${tag}_invariants`] = invariants.length
    metrics[`${tag}_gibbsInvariants`] = controlInvariants.length
    metrics[`${tag}_lawsInsideInvariants`] = lawsInside ? 1 : 0
    onOriented.forEach((r, i) => {
      metrics[`${tag}_orientedChargeAnisotropy_k${Math.round(1 / (K_FRACTIONS[i] as number))}`] = r.anisotropy
    })
    metrics[`${tag}_orientedChargeD`] = onOriented[onOriented.length - 1]?.mean ?? Number.NaN
    metrics[`${tag}_orientedDirectionsRead`] = onOriented[onOriented.length - 1]?.found ?? 0
    control[`${tag}_gibbsChargeAnisotropy`] = onGibbs.anisotropy
    control[`${tag}_gibbsChargeD`] = onGibbs.mean
    metrics[`${tag}_meltBeat`] = melted.meltBeat
    metrics[`${tag}_orderAt24`] = melted.order[24] ?? Number.NaN
    metrics[`${tag}_orderAt96`] = melted.order[MELT_BEATS] ?? Number.NaN
    metrics[`${tag}_fillingAt24`] = melted.filling[24] ?? Number.NaN
    metrics[`${tag}_fillingAt96`] = melted.filling[MELT_BEATS] ?? Number.NaN

    // readings added after the first run (no gate): the other husk quantities, and the per-dock order
    for (const [q, v] of Object.entries(onOriented[onOriented.length - 1]?.others ?? {})) metrics[`${tag}_oriented_${q}Anisotropy`] = v

    // and each quantity's anisotropy at the three k, with its slope against k (0 for a leading-order leak, 2 or 4
    // for one the symmetry forces away at leading order)
    for (const q of ['trace', 'sound', 'shear']) {
      const ys = onOriented.map(r => r.others[q] ?? Number.NaN)

      ys.forEach((y, i) => {
        metrics[`${tag}_oriented_${q}Anisotropy_k${Math.round(1 / (K_FRACTIONS[i] as number))}`] = y
      })
      metrics[`${tag}_oriented_${q}SlopeInK`] = ys.every(y => Number.isFinite(y) && y > 0) ? logSlope(K_FRACTIONS.map(f => rho * f), ys).slope : Number.NaN
    }

    metrics[`${tag}_oriented_chargeSlopeInK`] = logSlope(
      K_FRACTIONS.map(f => rho * f),
      onOriented.map(r => r.anisotropy),
    ).slope
    for (const [q, v] of Object.entries(onGibbs.others)) control[`${tag}_gibbs_${q}Anisotropy`] = v
    for (const t of [0, 1, 2, 4, 8, 24, 96]) metrics[`${tag}_dockOrderAt${t}`] = melted.dock[t] ?? Number.NaN
    control[`${tag}_symmetricStoreDockOrderAt24`] = meltedControl.dock[24] ?? Number.NaN
    control[`${tag}_symmetricStoreDockOrderAt96`] = meltedControl.dock[MELT_BEATS] ?? Number.NaN
  }

  // a reading added after the first run: the vibe rows' anisotropic part at lower density, where the expansion
  // parameter (the other 23 slots' expected vibes, 23 rho) is small
  for (const rho of [1 / 256, 1 / 1024]) {
    const part = anisotropicPart(storeLinearization({ table, background: { rho, store: [1, 0, 0], equal: EQUAL } }), permutations)

    metrics[`rho1_${Math.round(1 / rho)}_anisotropic_vibeFromVibe`] = part.blocks.vv
    metrics[`rho1_${Math.round(1 / rho)}_anisotropic_vibeFromStore`] = part.blocks.vs
    metrics[`rho1_${Math.round(1 / rho)}_anisotropic_storeFromVibe`] = part.blocks.sv
  }

  const lowVibe = [1 / 1024, 1 / 256, 1 / 64].map(rho => metrics[`rho1_${Math.round(1 / rho)}_anisotropic_vibeFromVibe`] as number)

  metrics.vibeFromVibeSlope_1024_to_64 = logSlope([1 / 1024, 1 / 256, 1 / 64], lowVibe).slope
  metrics.vibeFromStoreSlope_1024_to_64 = logSlope(
    [1 / 1024, 1 / 256, 1 / 64],
    [1 / 1024, 1 / 256, 1 / 64].map(rho => metrics[`rho1_${Math.round(1 / rho)}_anisotropic_vibeFromStore`] as number),
  ).slope

  // the general-background check against the full collision
  const checkBackground: Background = { rho: 0.3, store: [0.6, 0.2, 0.2], equal: EQUAL }
  const exact = storeLinearization({ table, background: checkBackground })
  const sampled = sampledStoreLinearization({ knit: storeKnit(storeWeave(), 'returned-neutral'), background: checkBackground, samples: SAMPLES })
  let sampledWorst = 0

  for (let i = 0; i < exact.length; i++) sampledWorst = Math.max(sampledWorst, Math.abs((exact[i] as number) - (sampled[i] as number)))

  // the melting kernel against the full rule, on the side-3 box with the golden fill on the hot store
  const checkWeave = makeColorWeave({ side: 3, table: 'bind' })
  const agreement = kernelAgreement({ weave: checkWeave, start: fullState({ ...goldenFill(checkWeave.mesh.cellCount * 24, 1.37), tau: 1 }), beats: 48 })

  metrics.kernelMismatchBeats = agreement.mismatches
  metrics.kernelCheckVetoed = agreement.vetoed
  metrics.kernelCheckMade = agreement.made

  const x1 = symmetricWorst < 1e-10 && minusWorst < 1e-10 && sampledWorst < 0.02 && agreement.mismatches === 0 && agreement.vetoed > 0
  const x2 = rows.every(r => r.lawsInside) && rows.every(r => r.gibbs < 1e-4)
  const low = LOW.map(i => rows[i]!)
  const slope = (ys: number[]): number => logSlope(low.map(r => r.rho), ys).slope
  const vibeSlope = slope(low.map(r => Math.max(r.vv, r.vs)))
  const storeSlope = slope(low.map(r => Math.max(r.sv, r.ss)))
  const leakSlope = slope(low.map(r => r.oriented))
  const h1 = rows.every(r => Math.max(r.vv, r.vs) >= 1e-8) && vibeSlope >= 1.7
  const h2 = storeSlope < 0.3
  const h3 = rows.filter(r => r.rho >= 1 / 16).every(r => r.oriented >= 100 * r.gibbs) && leakSlope >= 0.7
  const battery = rows.filter(r => r.rho === 0.4 || r.rho === 0.7)
  const h4 = battery.length === 2 && battery.every(r => r.meltBeat >= 0 && r.meltBeat <= 24)

  metrics.symmetricAnisotropicWorst = symmetricWorst
  metrics.minusConjugationWorst = minusWorst
  metrics.sampledWorst = sampledWorst
  metrics.vibeRowSlopeLowRho = vibeSlope
  metrics.storeRowSlopeLowRho = storeSlope
  metrics.leakSlopeLowRho = leakSlope
  metrics.seconds = (Date.now() - started) / 1000

  const status = x1 && x2 ? (h1 && h2 && h3 && h4 ? 'pass' : 'fail') : 'partial'
  const at = (rho: number) => rows.find(r => r.rho === rho)!
  const fmt = (x: number): string => x.toExponential(2)

  cached = { status, metrics }

  return {
    status,
    claim: `the hot vacuum's orientation reaches the gas's collisions but not its husk transport at leading order, fail on two hypotheses: the part of the exact linearized collision that sees the orientation is, in the vibe rows, ${fmt(at(1 / 64).vv)} at rho 1/64 and ${fmt(at(0.7).vv)} at 0.7 with slope ${vibeSlope.toFixed(2)} over 1/64 to 1/16 (registered at least 1.7; ${(metrics.vibeFromVibeSlope_1024_to_64 ?? Number.NaN).toFixed(2)} over 1/1024 to 1/64, the three-body rho^2, and ${(metrics.vibeFromStoreSlope_1024_to_64 ?? Number.NaN).toFixed(2)} for a store's effect on the vibes), and in the store rows ${fmt(at(1 / 64).sv)} at every density (the one-body wake); yet on the period-2 map every husk charge anisotropy tracks the isotropic Gibbs control (${fmt(at(0.7).oriented)} against ${fmt(at(0.7).gibbs)} at rho 0.7, k = rho / 32) and falls as k^4 (slope ${(metrics['rho0p7_oriented_chargeSlopeInK'] ?? Number.NaN).toFixed(2)} at 0.7, ${(metrics['rho0p4_oriented_chargeSlopeInK'] ?? Number.NaN).toFixed(2)} at 0.4), the trace and sound as k^2.6 to k^4.6 and the shear as k^2, so no leading-order leak was found at any density from 1/64 to 0.7; the orientation melts in the collisions over tens of beats at the battery's densities (per-dock order ${(metrics['rho0p4_dockOrderAt24'] ?? Number.NaN).toFixed(2)} at beat 24 at rho 0.4 and ${(metrics['rho0p7_dockOrderAt24'] ?? Number.NaN).toFixed(2)} at 0.7, symmetric stores ${(control['rho0p7_symmetricStoreDockOrderAt24'] ?? Number.NaN).toFixed(2)})`,
    metrics,
    control,
    notes: `L2. Gates: X1 ${x1}, X2 ${x2}, H1 ${h1}, H2 ${h2}, H3 ${h3}, H4 ${h4}. Per rho (vibe-from-vibe, vibe-from-store, store-from-vibe, store-from-store anisotropic parts; oriented and Gibbs charge anisotropy at k = rho / 32; invariants; melt beat; order and filling at beat 24): ${rows.map(r => `${r.rho.toFixed(4)}: ${fmt(r.vv)}, ${fmt(r.vs)}, ${fmt(r.sv)}, ${fmt(r.ss)}; ${fmt(r.oriented)} vs ${fmt(r.gibbs)}; ${r.invariants}; ${r.meltBeat}; ${r.order24.toFixed(3)}, ${r.filling24.toFixed(3)}`).join(' | ')}. The oriented background is not an equilibrium: this is the linear response of a gas laid on the vacuum, read before the vacuum melts (the melting run says how long that is). FIRST RUN (82.5 s, log kept as tmp/cand-three-body-leak-first.log): fail on H1 (slope 1.43) and H3 (the oriented charge anisotropy equals the Gibbs control's, 2.8e-7 against 2.9e-7 at rho 0.7); X1, X2, H2 and H4 passed. READINGS ADDED AFTER THE FIRST RUN, no gate moved, every gated number reproduced: (1) the vibe rows' anisotropic part at rho 1/256 and 1/1024 (${fmt(metrics['rho1_256_anisotropic_vibeFromVibe'] ?? Number.NaN)}, ${fmt(metrics['rho1_1024_anisotropic_vibeFromVibe'] ?? Number.NaN)}): the slope reaches ${(metrics.vibeFromVibeSlope_1024_to_64 ?? Number.NaN).toFixed(2)}, so the registered range 1/64 to 1/16 was not yet asymptotic (the expansion parameter is the other 23 slots' expected vibes, 23 rho, which is 0.36 at 1/64); the three-body rho^2 holds below it, and a store's effect on the vibes goes as rho^3 (four bodies). (2) the trace, sound and shear anisotropies at the three k (metrics *_oriented_*_k8/16/32 and *SlopeInK): every one falls with k, none is constant, so the orientation does not reach the husk transport at leading order; one reading is not trusted: the sound at rho 0.25 rises as k falls (0.0049, 0.0061, 0.167), where the overlap selection can take a store mode for the sound pair, and at rho 1/64 to 1/8 no propagating mode is read at all. (3) H4's registered order parameter, mean of tau (-1)^t, is DEFECTIVE: it assumes every dock's store negates each beat, which only a calm dock does, so it read a melt at beat 1 that is an artifact of the sign (and 0.52 at beat 24 at rho 0.7). The corrected order, per dock |sum of its 12 stores| / 12 averaged, is 1 on every hot vacuum and about 0.13 to 0.17 for symmetric stores at these densities (the control): from the hot start it reads ${[1, 2, 4, 8, 24, 96].map(t => (metrics[`rho0p7_dockOrderAt${t}`] ?? Number.NaN).toFixed(2)).join(', ')} at beats 1, 2, 4, 8, 24, 96 at rho 0.7 and ${[1, 2, 4, 8, 24, 96].map(t => (metrics[`rho0p4_dockOrderAt${t}`] ?? Number.NaN).toFixed(2)).join(', ')} at 0.4. So H4 passed as registered only through the defect: at rho 0.7 the orientation keeps about half its excess over the symmetric level at beat 24 (it melts over about 40 to 100 beats), at 0.4 it falls to that level by beat 8 to 24, and at rho 1/64 a part (0.46 to 0.48) survives 96 beats, since most docks are never visited twice.`,
  }
}

export function threeBodyLeakCached(): { status: string; metrics: Record<string, number> } {
  return cached ?? threeBodyLeak()
}

export default experiment({
  id: 'relativity/three-body-leak',
  code: 'E-RLT-0072',
  title:
    "the hot vacuum's orientation reaches a gas's collisions (vibe rows at the three-body rho^2, store rows at order 1, the wake) but not its husk transport at leading order at any density from 1/64 to 0.7: every husk anisotropy tracks the isotropic control and falls with k, fail on the two hypotheses that predicted the slope range and a leak",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = threeBodyLeak()

    return verdict({ status: r.status as 'pass' | 'fail' | 'partial', claim: r.claim, metrics: r.metrics, control: r.control, notes: r.notes })
  },
})
