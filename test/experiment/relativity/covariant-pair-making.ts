// Pair creation that keeps W(F4): the pair-making isometric knit (E-RLT-0064).
//
// THE QUESTION. The isometric knit (E-RLT-0061) has W(F4) as its exact symmetry and CPT, but keeps the count, so
// its vacuum is still and a lone vibe never dresses. Is there a count-changing move that commutes with all of
// W(F4), paid from a store with no rounding, reversible, deterministic, keeping charge, momentum and energy, CPT
// and W(F4) exactly, and does it restore a clocking vacuum and dressing?
//
// THE THEOREM, worked out before building (it decides what the store must be). A dock map C that commutes with
// every coin map keeps stabilizers: Stab(x) lies in Stab(C x). W(F4) is transitive on the 24 slots, so it fixes
// only the three uniform dock states, and a charge-keeping C sends the calm dock to itself. A store W(F4) leaves
// alone (one counter per dock, or the same counter on every line) is fixed too, so the calm dock with ANY such
// store is a fixed point: no covariant rule makes a pair from the symmetric vacuum, whatever it pays with. The
// brief's version (a pair made from calm at P = 0, paid by one threshold counter) is therefore impossible as
// stated. A love-fear pair on one line is oriented (the -1 coin map carries a love on the first slot to a love on
// the second), so a covariant pair can come only from a store that holds an orientation. The least such store is
// one trit per line of the dock, read in the line's orientation (code/rule/pair-making-knit): a unit of it is a
// stored pair, 2 units of energy, with a direction. The same theorem says every vacuum that clocks breaks W(F4) in
// its STATE, since the only W(F4)-fixed store is zero: the rule is covariant, the clocking vacuum is not.
//
// THE RULE (code/rule/pair-making-knit): the pair move P (love on side sigma, fear opposite, store 0 <-> calm
// line, store sigma) on every line, then the isometric coin map K, then P again; the stream copies each vibe one
// dock along. P K P is an involution; the beat's motion reversal is (P K P) R, R the -1 coin map.
//
// PREDICTIONS, written before any run of this file (the rule's only probe, tmp/pair-probe-linear.ts, checked the
// linearization, not these):
//  H1 the cold vacuum (calm, every store 0) never changes, and a lone love or fear on it in any of the 24
//     directions stays one vibe: the move needs a store unit or a love-fear pair on one line
//  H2 the hot vacuum (calm, every store +1) clocks with period exactly 2: P makes a pair on every line, the full
//     dock has P = 0 so K is -1, which turns every pair around, and P unmakes them into the opposite store. No
//     vibe is left to stream, so the clock is in the store (a vacuum whose pairs live inside the collision)
//  H3 a lone love on the hot vacuum dresses: its dock's P is its own root, K is not -1 there, the pairs made
//     around it are not all turned back into pairs, and real vibes stream out: the difference from the vacuum run
//     has support above 1 within the first period (24 beats)
//  H4 a dense gas makes and unmakes pairs: both counts above 0 over 48 beats
//
// Gates, fixed before the first run:
//  X1 dock exactness, on every lone and two-vibe dock (stores zero, and stores from the Kronecker trits) and
//     20,000 Kronecker docks: 0 involution failures, 0 changes of charge, of P = sum of held roots, and of
//     E = count + 2 sum |tau|; the count changes on more than 0 docks (pairs are made); commutes with all 1,152
//     coin maps on 2,000 Kronecker docks (0 failures) and with charge conjugation (0); the first-mirror control
//     fails the coin maps (more than 0 failures)
//  X2 the box (side 3, 81 docks, every coin map an automorphism of it), dense Kronecker start: charge, P and E
//     exact on each of 48 beats, 48 beats back return the start exactly, the motion reversal (P K P) R turns the
//     beat into its inverse on 3 starts, charge conjugation commutes with it, all 1,152 coin maps (with their
//     cell maps) commute with the beat, and so CPT (charge conjugation, the -1 map, motion reversal) turns the
//     beat into its inverse
//  X3 the theorem's premises: W(F4) has 1 orbit on the 24 slots and 1 on the 12 lines, the -1 coin map negates
//     every store trit, and the collision fixes the calm dock with store 0
// Verdict: pass if X1 to X3 and H1 to H4 hold; fail if X1 to X3 hold and some H does not; partial otherwise.
//
// ONE EXTRA READING, asked for during the work (the coordinator, 2026-09-26), gated separately and NOT part of the
// verdict: E-MTH-0012 found that left multiplication L_u by a Hurwitz cube root u makes the knot a momentum
// closure, locks charge to 0 mod 3 on invariant states and is the generation cycle times the color cycle, but
// that no knit kept any fixed-point-free order-3 element. PREDICTIONS:
//  O1 the isometric knit and the pair-making knit keep all 48 fixed-point-free order-3 elements of W(F4) (and all
//     32 color trialities); the binary-tetrahedral knit (E-RLT-0063) keeps every L_u (8) and no color triality;
//     the first-mirror control keeps no fixed-point-free order-3 element
//  O2 dynamically, on the side-3 box: an L_u-invariant start stays L_u-invariant on every beat of 24 under the
//     isometric, binary-tetrahedral and pair-making knits, and every dock L_u fixes holds charge 0 mod 3 and
//     P = 0 on every beat
//
// Depth L2: a constructed rule, its laws checked exactly, its vacuum and dressing measured. DETERMINISM: exact
// integer state, Kronecker trits (frac(sqrt q) for the first 36 primes), no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { boxCellMap, d4BoxMesh, linearMapOf } from '@/code/substrate/d4-box'
import { binaryTetrahedralKnitTable, LINE_FIRSTS, LINE_OF, OPPOSITE, type MomentumTable } from '@/code/rule/isometric-knit'
import {
  makePairKnit,
  motionReversal,
  pairBeat,
  pairBeatBack,
  pairCharge,
  pairCount,
  pairDockCollide,
  pairEnergy,
  pairMomentum,
  samePairState,
  transformPairState,
  type PairKnit,
  type PairState,
} from '@/code/rule/pair-making-knit'
import { kroneckerPairDock } from '@/code/measure/pair-knit-linearization'
import { hurwitzUnits, leftMultiplication, quaternionOrder } from '@/code/algebra/group/hurwitz-f4'

const ROOTS = rootsD4()
const ROOT_INDEX = new Map(ROOTS.map((r, i) => [r.join(','), i]))
const DENSE = 20_000
const COVARIANT_DOCKS = 2_000
const BOX = 3
const BEATS = 48

const dockState = (vibe: Int8Array, store: Int8Array): PairState => ({ vibe: Int8Array.from(vibe), store: Int8Array.from(store) })

function dockEnergy(s: PairState): number {
  return pairEnergy(s)
}

// every lone and two-vibe dock, with stores zero and with Kronecker stores
function sparseDocks(): PairState[] {
  const out: PairState[] = []
  let m = 0

  for (let a = 0; a < 24; a++) {
    for (const s of [1, -1]) {
      for (let b = a; b < 24; b++) {
        for (const t of b === a ? [0] : [1, -1]) {
          const vibe = new Int8Array(24)

          vibe[a] = s
          if (b !== a) vibe[b] = t
          out.push(dockState(vibe, new Int8Array(12)))
          out.push(dockState(vibe, kroneckerPairDock(m++).store))
        }
      }
    }
  }

  return out
}

function denseBox(knit: PairKnit, offset: number): PairState {
  const cells = knit.mesh.cellCount
  const vibe = new Int8Array(cells * 24)
  const store = new Int8Array(cells * 12)

  for (let x = 0; x < cells; x++) {
    const dock = kroneckerPairDock(offset + 7 * x)

    vibe.set(dock.vibe, x * 24)
    store.set(dock.store, x * 12)
  }

  return { vibe, store }
}

const compose = (p: readonly number[], q: readonly number[]): number[] => q.map(d => p[d] as number)
const isIdentity = (p: readonly number[]): boolean => p.every((x, i) => x === i)

function orderOf(p: readonly number[]): number {
  let q = [...p]
  let n = 1

  while (!isIdentity(q) && n < 50) {
    q = compose(p, q)
    n++
  }

  return n
}

function orbitCount(generators: readonly (readonly number[])[], size: number): number {
  const parent = Array.from({ length: size }, (_, i) => i)
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i] as number)))

  for (const g of generators) g.forEach((image, i) => (parent[find(i)] = find(image)))

  return new Set(parent.map((_, i) => find(i))).size
}

// failures of C(g x) = g C(x) on the given docks, g a coin map (sign -1 composes charge conjugation)
function dockCovarianceFailures(knit: PairKnit, g: readonly number[], sign: number, docks: readonly PairState[]): number {
  let bad = 0

  for (const x of docks) {
    const gx = transformPairState(x, [0], g, sign)

    pairDockCollide(knit, gx, 0)

    const cx = dockState(x.vibe, x.store)

    pairDockCollide(knit, cx, 0)
    bad += samePairState(gx, transformPairState(cx, [0], g, sign)) ? 0 : 1
  }

  return bad
}

// the difference between two box states: slots whose vibe differs plus store trits that differ
function support(a: PairState, b: PairState): number {
  let n = 0

  for (let i = 0; i < a.vibe.length; i++) n += a.vibe[i] === b.vibe[i] ? 0 : 1
  for (let i = 0; i < a.store.length; i++) n += a.store[i] === b.store[i] ? 0 : 1

  return n
}

function uniformBox(cells: number, tau: number): PairState {
  return { vibe: new Int8Array(cells * 24), store: new Int8Array(cells * 12).fill(tau) }
}

// the permutation of the 24 slots a doubled quaternion matrix induces
function slotPermutationOfDoubled(m: Int32Array): number[] {
  return ROOTS.map(r => ROOT_INDEX.get([0, 1, 2, 3].map(i => [0, 1, 2, 3].reduce((s, j) => s + (m[i * 4 + j] as number) * (r[j] as number), 0) / 2).join(',')) ?? -1)
}

export default experiment({
  id: 'relativity/covariant-pair-making',
  code: 'E-RLT-0064',
  title:
    'pair creation that keeps W(F4) exists, and needs an oriented store: no W(F4)-covariant rule makes a pair from the symmetric vacuum with any store W(F4) fixes (1 orbit on slots and on lines, so the calm dock is a fixed point); with one trit per line read in the line\'s orientation, the pair move (love on side sigma and fear opposite with store 0, against a calm line with store sigma) around the isometric coin map, P K P, is an exact involution keeping charge, momentum and E = count + 2 sum |tau| (0 failures on 22,304 docks, count changed on 5,578), commutes with all 1,152 coin maps and charge conjugation, and on the side-3 box reverses exactly with motion reversal and CPT (0 failures); the cold vacuum is still and a lone vibe stays bare, the hot vacuum (store +1 everywhere) clocks with period 2 in its store with its pairs inside the collision, a lone love on it carries a bounded dressing (largest 82 trits per 24 beats, 55 at rest, no avalanche), and a dense gas makes 7,034 and unmakes 7,041 pairs in 48 beats; extra reading: the isometric and pair-making knits keep all 48 fixed-point-free order-3 elements of W(F4), the binary-tetrahedral knit keeps the 8 left cube roots L_u and no color triality, and an L_u-invariant start stays invariant with the charge lock on every beat',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const permutations = weylF4DirectionPermutations({ directions: ROOTS })
    const smallMesh = d4BoxMesh({ side: 1 })
    const dockKnit = makePairKnit({ mesh: smallMesh })
    const controlKnit = makePairKnit({ mesh: smallMesh, variant: 'first-mirror' })

    // X1: dock by dock
    const docks = [...sparseDocks(), ...Array.from({ length: DENSE }, (_, m) => dockState(kroneckerPairDock(m).vibe, kroneckerPairDock(m).store))]
    let involution = 0
    let charge = 0
    let momentum = 0
    let energy = 0
    let countChanged = 0

    for (const x of docks) {
      const y = dockState(x.vibe, x.store)

      pairDockCollide(dockKnit, y, 0)

      const back = dockState(y.vibe, y.store)

      pairDockCollide(dockKnit, back, 0)
      involution += samePairState(back, x) ? 0 : 1
      charge += pairCharge(y) === pairCharge(x) ? 0 : 1
      momentum += pairMomentum(y).every((v, k) => v === pairMomentum(x)[k]) ? 0 : 1
      energy += dockEnergy(y) === dockEnergy(x) ? 0 : 1
      countChanged += pairCount(y) === pairCount(x) ? 0 : 1
    }

    const covariantDocks = docks.slice(docks.length - COVARIANT_DOCKS)
    let coinFailures = 0

    for (const g of permutations) coinFailures += dockCovarianceFailures(dockKnit, g, 1, covariantDocks)

    const identity = Array.from({ length: 24 }, (_, d) => d)
    const conjugationFailures = dockCovarianceFailures(dockKnit, identity, -1, covariantDocks)
    let controlCoinFailures = 0

    for (const g of permutations.slice(0, 64)) controlCoinFailures += dockCovarianceFailures(controlKnit, g, 1, covariantDocks.slice(0, 200))

    const x1 = involution === 0 && charge === 0 && momentum === 0 && energy === 0 && countChanged > 0 && coinFailures === 0 && conjugationFailures === 0 && controlCoinFailures > 0

    // X2: the box
    const mesh = d4BoxMesh({ side: BOX })
    const cells = mesh.cellCount
    const knit = makePairKnit({ mesh })
    const start = denseBox(knit, 101)
    let boxExact = true
    let made = 0
    let unmade = 0
    let s = start

    for (let t = 0; t < BEATS; t++) {
      const r = pairBeat(knit, s)

      s = r.state
      made += r.made
      unmade += r.unmade
      boxExact = boxExact && pairCharge(s) === pairCharge(start) && pairEnergy(s) === pairEnergy(start) && pairMomentum(s).every((v, k) => v === pairMomentum(start)[k])
    }

    for (let t = 0; t < BEATS; t++) s = pairBeatBack(knit, s)

    const returns = samePairState(s, start)
    let reversalFailures = 0
    let chargeConjugationFailures = 0

    for (const offset of [101, 2003, 40009]) {
      const x = denseBox(knit, offset)
      const forward = pairBeat(knit, motionReversal(knit, x)).state

      reversalFailures += samePairState(motionReversal(knit, forward), pairBeatBack(knit, x)) ? 0 : 1

      const identityCells = Array.from({ length: cells }, (_, c) => c)
      const cx = transformPairState(x, identityCells, identity, -1)

      chargeConjugationFailures += samePairState(pairBeat(knit, cx).state, transformPairState(pairBeat(knit, x).state, identityCells, identity, -1)) ? 0 : 1
    }

    let boxCoinFailures = 0
    let boxAutomorphisms = 0
    let inversionCells: number[] = []

    for (const g of permutations) {
      const matrix = linearMapOf(g)
      const cellMap = matrix ? boxCellMap({ matrix, side: BOX }) : undefined

      if (!cellMap) continue

      boxAutomorphisms++

      if (g.every((image, d) => image === OPPOSITE[d])) inversionCells = cellMap

      const x = denseBox(knit, 777)

      boxCoinFailures += samePairState(pairBeat(knit, transformPairState(x, cellMap, g)).state, transformPairState(pairBeat(knit, x).state, cellMap, g)) ? 0 : 1
    }

    // CPT: charge conjugation, the -1 map with x -> -x, motion reversal
    const cpt = (x: PairState): PairState => motionReversal(knit, transformPairState(x, inversionCells, OPPOSITE, -1))
    const cptInverse = (x: PairState): PairState => transformPairState(motionReversal(knit, x), inversionCells, OPPOSITE, -1)
    let cptFailures = 0

    for (const offset of [101, 2003, 40009]) {
      const x = denseBox(knit, offset)

      cptFailures += samePairState(cptInverse(pairBeat(knit, cpt(x)).state), pairBeatBack(knit, x)) ? 0 : 1
    }

    const x2 = boxExact && returns && reversalFailures === 0 && chargeConjugationFailures === 0 && boxAutomorphisms === 1152 && boxCoinFailures === 0 && inversionCells.length === cells && cptFailures === 0

    // X3: the theorem's premises
    const slotOrbits = orbitCount(permutations, 24)
    const lineOrbits = orbitCount(
      permutations.map(g => LINE_FIRSTS.map(f => LINE_OF[g[f] as number] as number)),
      12,
    )
    const trits = kroneckerPairDock(5).store
    const minusStore = transformPairState({ vibe: new Int8Array(24), store: trits }, [0], OPPOSITE).store
    const negates = minusStore.every((v, l) => v === -(trits[l] as number))
    const calm = dockState(new Int8Array(24), new Int8Array(12))

    pairDockCollide(dockKnit, calm, 0)

    const calmFixed = calm.vibe.every(v => v === 0) && calm.store.every(v => v === 0)
    const x3 = slotOrbits === 1 && lineOrbits === 1 && negates && calmFixed

    // H1: the cold vacuum and a lone vibe on it
    const coldMesh = d4BoxMesh({ side: 5 })
    const cold = makePairKnit({ mesh: coldMesh })
    let coldStill = true
    let v = uniformBox(coldMesh.cellCount, 0)

    for (let t = 0; t < BEATS; t++) {
      v = pairBeat(cold, v).state
      coldStill = coldStill && v.vibe.every(x => x === 0) && v.store.every(x => x === 0)
    }

    let loneLargest = 0

    for (const sign of [1, -1]) {
      for (let d = 0; d < 24; d++) {
        let lone = uniformBox(coldMesh.cellCount, 0)

        lone.vibe[d] = sign

        for (let t = 0; t < BEATS; t++) {
          lone = pairBeat(cold, lone).state
          loneLargest = Math.max(loneLargest, pairCount(lone) + lone.store.reduce((a, x) => a + Math.abs(x), 0))
        }
      }
    }

    const h1 = coldStill && loneLargest === 1

    // H2: the hot vacuum's period
    const hotMesh = d4BoxMesh({ side: 5 })
    const hot = makePairKnit({ mesh: hotMesh })
    const hot0 = uniformBox(hotMesh.cellCount, 1)
    let hotState = hot0
    let hotPeriod = 0
    let hotEnergyExact = true
    let hotLargestCount = 0

    for (let t = 1; t <= 96 && hotPeriod === 0; t++) {
      hotState = pairBeat(hot, hotState).state
      hotEnergyExact = hotEnergyExact && pairEnergy(hotState) === pairEnergy(hot0)
      hotLargestCount = Math.max(hotLargestCount, pairCount(hotState))

      if (samePairState(hotState, hot0)) hotPeriod = t
    }

    const h2 = hotPeriod === 2 && hotEnergyExact

    // H3: a lone love on the hot vacuum, side 9, 96 beats
    const dressMesh = d4BoxMesh({ side: 9 })
    const dress = makePairKnit({ mesh: dressMesh })
    let vacuum = uniformBox(dressMesh.cellCount, 1)
    let loved = uniformBox(dressMesh.cellCount, 1)

    loved.vibe[0] = 1
    // the love pays for itself: its dock's store on its own line is the vacuum's, so E differs by exactly 1
    const dressing: number[] = []
    const dressingEnergy: number[] = []

    for (let t = 0; t < 96; t++) {
      vacuum = pairBeat(dress, vacuum).state
      loved = pairBeat(dress, loved).state
      dressing.push(support(vacuum, loved))
      dressingEnergy.push(pairEnergy(loved) - pairEnergy(vacuum))
    }

    const periodLargest = [0, 1, 2, 3].map(p => Math.max(...dressing.slice(p * 24, p * 24 + 24)))
    const h3 = (periodLargest[0] ?? 0) > 1

    // H4: a dense gas
    const h4 = made > 0 && unmade > 0

    // O: the extra reading, the one omega
    const orderThree = permutations.filter(g => !isIdentity(g) && orderOf(g) === 3)
    const free = orderThree.filter(g => g.every((image, d) => image !== d))
    const trialities = orderThree.filter(g => g.some((image, d) => image === d))
    const units = hurwitzUnits().filter(u => quaternionOrder(u) === 3)
    const lefts = units.map(u => slotPermutationOfDoubled(leftMultiplication(u)))
    const knits: [string, MomentumTable | undefined, boolean][] = [
      ['isometric', undefined, false],
      ['pairMaking', undefined, true],
      ['binaryTetrahedral', binaryTetrahedralKnitTable(), false],
      ['firstMirror', makePairKnit({ mesh: smallMesh, variant: 'first-mirror' }).table, false],
    ]
    const omega: Record<string, number> = {}
    const omegaDocks = covariantDocks.slice(0, 300)

    for (const [name, table, pairs] of knits) {
      const k: PairKnit = { ...makePairKnit({ mesh: smallMesh, pairs }), ...(table ? { table } : {}) }
      // a pairs-off knit's store is idle, so compare on stores zero for it
      const docksFor = pairs ? omegaDocks : omegaDocks.map(x => dockState(x.vibe, new Int8Array(12)))
      const kept = (g: readonly number[]): boolean => dockCovarianceFailures(k, g, 1, docksFor) === 0

      omega[`${name}KeptFreeOrderThree`] = free.filter(kept).length
      omega[`${name}KeptColorTrialities`] = trialities.filter(kept).length
      omega[`${name}KeptLeftCubeRoots`] = lefts.filter(kept).length
    }

    // O2: an L_u-invariant start on the side-3 box
    const lu = lefts[0] ?? identity
    const luMatrix = linearMapOf(lu)
    const luCells = luMatrix ? (boxCellMap({ matrix: luMatrix, side: BOX }) ?? []) : []
    const fixedDocks = luCells.flatMap((image, x) => (image === x ? [x] : []))
    const invariantStart = (withStore: boolean): PairState => {
      const base = denseBox(knit, 313)
      const out: PairState = { vibe: new Int8Array(base.vibe.length), store: new Int8Array(base.store.length) }
      // symmetrize: follow each (dock, slot) orbit under L_u and give it the value at its least member
      const seen = new Uint8Array(base.vibe.length)

      for (let i = 0; i < base.vibe.length; i++) {
        if (seen[i]) continue

        const orbit = [i]
        let j = (luCells[Math.floor(i / 24)] as number) * 24 + (lu[i % 24] as number)

        while (j !== i) {
          orbit.push(j)
          j = (luCells[Math.floor(j / 24)] as number) * 24 + (lu[j % 24] as number)
        }

        for (const o of orbit) {
          seen[o] = 1
          out.vibe[o] = base.vibe[i] as number
        }
      }

      if (withStore) {
        // store orbits carry a sign; an orbit whose signs multiply to -1 around it holds only 0
        const lineImage = LINE_FIRSTS.map(f => LINE_OF[lu[f] as number] as number)
        const lineSign = LINE_FIRSTS.map(f => (lu[f] as number) < (OPPOSITE[lu[f] as number] as number) ? 1 : -1)
        const done = new Uint8Array(base.store.length)

        for (let i = 0; i < base.store.length; i++) {
          if (done[i]) continue

          const members: [number, number][] = [[i, 1]]
          let j = (luCells[Math.floor(i / 12)] as number) * 12 + (lineImage[i % 12] as number)
          let sign = lineSign[i % 12] as number

          while (j !== i) {
            members.push([j, sign])
            sign *= lineSign[j % 12] as number
            j = (luCells[Math.floor(j / 12)] as number) * 12 + (lineImage[j % 12] as number)
          }

          const value = sign === 1 ? (base.store[i] as number) : 0

          for (const [m, sg] of members) {
            done[m] = 1
            out.store[m] = sg * value
          }
        }
      }

      return out
    }
    let invarianceBreaks = 0
    let lockBreaks = 0

    for (const [, table, pairs] of knits.slice(0, 3)) {
      const k: PairKnit = { ...makePairKnit({ mesh, pairs }), ...(table ? { table } : {}) }
      let state = invariantStart(pairs)

      invarianceBreaks += samePairState(transformPairState(state, luCells, lu), state) ? 0 : 1

      for (let t = 0; t < 24; t++) {
        state = pairBeat(k, state).state
        invarianceBreaks += samePairState(transformPairState(state, luCells, lu), state) ? 0 : 1

        for (const x of fixedDocks) {
          const dock: PairState = { vibe: state.vibe.slice(x * 24, x * 24 + 24), store: state.store.slice(x * 12, x * 12 + 12) }
          const q = pairCharge(dock)

          lockBreaks += ((q % 3) + 3) % 3 === 0 && pairMomentum(dock).every(p => p === 0) ? 0 : 1
        }
      }
    }

    const o1 =
      omega.isometricKeptFreeOrderThree === free.length &&
      omega.pairMakingKeptFreeOrderThree === free.length &&
      omega.isometricKeptColorTrialities === trialities.length &&
      omega.binaryTetrahedralKeptLeftCubeRoots === lefts.length &&
      omega.binaryTetrahedralKeptColorTrialities === 0 &&
      omega.firstMirrorKeptFreeOrderThree === 0
    const o2 = invarianceBreaks === 0 && lockBreaks === 0 && fixedDocks.length > 0

    const ok = x1 && x2 && x3
    const status = ok ? (h1 && h2 && h3 && h4 ? 'pass' : 'fail') : 'partial'
    const metrics: Record<string, number> = {
      auditDocks: docks.length,
      involutionFailures: involution,
      chargeChanges: charge,
      momentumChanges: momentum,
      energyChanges: energy,
      countChangedDocks: countChanged,
      coinMapFailures: coinFailures,
      chargeConjugationFailures: conjugationFailures,
      controlCoinMapFailures: controlCoinFailures,
      boxExact: boxExact ? 1 : 0,
      boxReturns: returns ? 1 : 0,
      boxPairsMade: made,
      boxPairsUnmade: unmade,
      motionReversalFailures: reversalFailures,
      boxChargeConjugationFailures: chargeConjugationFailures,
      boxAutomorphisms,
      boxCoinMapFailures: boxCoinFailures,
      cptFailures,
      slotOrbits,
      lineOrbits,
      minusNegatesStore: negates ? 1 : 0,
      calmDockFixed: calmFixed ? 1 : 0,
      coldVacuumStill: coldStill ? 1 : 0,
      loneOnColdLargest: loneLargest,
      hotVacuumPeriod: hotPeriod,
      hotEnergyExact: hotEnergyExact ? 1 : 0,
      hotLargestCountBetweenBeats: hotLargestCount,
      ...Object.fromEntries(periodLargest.map((x, p) => [`dressingPeriod${p + 1}`, x])),
      ...Object.fromEntries([1, 2, 4, 8, 16, 24, 48, 96].map(t => [`dressingAtBeat${t}`, dressing[t - 1] ?? -1])),
      dressingEnergyDifferenceFirst: dressingEnergy[0] ?? -1,
      dressingEnergyDifferenceLast: dressingEnergy[95] ?? -1,
      boxSlots: dressMesh.cellCount * 36,
      orderThreeElements: orderThree.length,
      freeOrderThree: free.length,
      colorTrialities: trialities.length,
      leftCubeRoots: lefts.length,
      ...omega,
      luFixedDocks: fixedDocks.length,
      luInvarianceBreaks: invarianceBreaks,
      luLockBreaks: lockBreaks,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `a W(F4)-covariant pair move exists only with an oriented store (the calm dock with any W(F4)-fixed store is a fixed point: ${slotOrbits} slot orbit, ${lineOrbits} line orbit); with one trit per line, the collision P K P is an exact involution keeping charge, P and E = count + 2 sum |tau| on ${docks.length} docks (${involution + charge + momentum + energy} failures), changes the count on ${countChanged}, commutes with all 1,152 coin maps (${coinFailures} failures) and charge conjugation, and on the side-${BOX} box keeps every law, reverses exactly, and has motion reversal and CPT (${reversalFailures + cptFailures} failures); the cold vacuum is still (a lone vibe stays ${loneLargest}), the hot vacuum clocks with period ${hotPeriod} in its store, a lone love on it dresses (${periodLargest.join(', ')} per 24 beats on ${dressMesh.cellCount * 36} slot and store trits), and a dense gas made ${made} and unmade ${unmade} pairs in ${BEATS} beats`,
      metrics,
      control: { firstMirrorCoinMapFailures: controlCoinFailures, firstMirrorKeptFreeOrderThree: omega.firstMirrorKeptFreeOrderThree ?? -1 },
      notes: `L2. Gates: X1 ${x1}, X2 ${x2}, X3 ${x3}, H1 ${h1}, H2 ${h2}, H3 ${h3}, H4 ${h4}. Extra reading (gated apart, not in the verdict): O1 ${o1}, O2 ${o2}; order-3 elements of W(F4) ${orderThree.length} (${free.length} fixed-point-free, ${trialities.length} color trialities), kept fixed-point-free / color trialities / left cube roots: isometric ${omega.isometricKeptFreeOrderThree}/${omega.isometricKeptColorTrialities}/${omega.isometricKeptLeftCubeRoots}, pair-making ${omega.pairMakingKeptFreeOrderThree}/${omega.pairMakingKeptColorTrialities}/${omega.pairMakingKeptLeftCubeRoots}, binary tetrahedral ${omega.binaryTetrahedralKeptFreeOrderThree}/${omega.binaryTetrahedralKeptColorTrialities}/${omega.binaryTetrahedralKeptLeftCubeRoots}, first mirror ${omega.firstMirrorKeptFreeOrderThree}/${omega.firstMirrorKeptColorTrialities}/${omega.firstMirrorKeptLeftCubeRoots}; an L_u-invariant start stayed invariant with ${invarianceBreaks} breaks over 24 beats on three knits, and the ${fixedDocks.length} docks L_u fixes broke the lock (charge 0 mod 3, P = 0) ${lockBreaks} times. First run recorded as is. The store is dock storage, one trit per line, never on a link; it does not stream. The Kronecker box starts use dock index 7 x plus an offset into one Kronecker sequence, so neighboring docks are correlated (the E-RLT-0059 caveat); every gate on them is an exact identity, so the correlation cannot bias it.`,
    })
  },
})
