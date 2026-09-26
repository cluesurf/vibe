// The vacuum breaks the symmetry, the rule does not: the hot vacuum of the pair-making isometric knit (E-RLT-0069).
//
// THE QUESTION. E-RLT-0064 proved that a covariant rule cannot make a pair from a W(F4)-symmetric vacuum, so a
// vacuum that clocks must break W(F4) in its STATE while the rule keeps it: spontaneous symmetry breaking. Measure
// it on the hot vacuum (every dock calm, every line's store +1 in the line's own orientation): its residual group,
// its soft modes, and whether excitations on it still move isotropically. Compare with the committed knit's
// vacuum (E-FRC-0143: a period-24 condensate that respects only the charge U(1), because the committed RULE breaks
// SU(2) explicitly).
//
// WHAT CAN BE SAID BEFORE RUNNING (derived, then checked by the gates).
//  (a) The calm dock has momentum 0, where the isometric coin map is the -1 map (E-RLT-0064 H2). So for ANY store
//      tau, P makes a pair on every line with tau != 0, K turns every pair around, and P unmakes it into -tau: a
//      calm dock goes to a calm dock with store -tau. Docks with no vibe do not touch each other. So every calm
//      state is a vacuum, of period 1 (tau = 0) or 2, and the vacua are 3^12 per dock, chosen dock by dock: the
//      degeneracy is LOCAL, not the orbit of one vacuum. Flipping or zeroing one store trit of the hot vacuum is an
//      exact zero mode, still at every wave number: a flat band of store modes, not a Goldstone mode (the group is
//      finite, and nothing couples one dock's orientation to the next, so there is no stiffness).
//  (b) The residual group. The hot store names one root from each pair +-r: the roots with first nonzero
//      coordinate positive, a positive system of D4. W(D4) is simply transitive on positive systems and W(F4) is
//      its extension by the diagram group, so the stabilizer H0 of the hot vacuum in W(F4) should be the S3 of
//      diagram automorphisms (order 6). The -1 map sends the store to its negative, which is the vacuum one beat
//      later, as does charge conjugation. A group of order 6 has invariant quadratics beyond |k|^2 on R^4, so H0
//      should NOT force the transport isotropic even at leading order.
//  (c) A lone vibe on the hot vacuum: its dock's momentum is its root (the pairs cancel), the coin map fixes its
//      root and carries its line onto itself, and the pairs are carried line to line, so the vibe goes straight at
//      its root exactly as on the cold vacuum. The vacuum is invisible to a lone excitation: its displacement is
//      T r_d, and the second moment over the 48 starts is (T^2 / 2) I, isotropic. The store keeps a wake where the
//      coin map was not -1.
//  (d) Two vibes in one dock: a pair made from the store can land on a vibe's line, whose store was not spent, and
//      stay out as two vibes with the store's orientation. So the vacuum is visible to two-body collisions through
//      the pairs it lends, and the effective two-body collision on the hot vacuum should keep only part of W(F4).
//
// Gates, fixed before the first run:
//  V1 the dock theorem: the -1 map is the coin map at momentum 0, and for all 3^12 stores on a calm dock the
//     collision gives the calm dock with store -tau (0 failures)
//  V2 bookkeeping: |H0| times the orbit of the hot store under W(F4) is 1,152, and H0 is not all of W(F4)
//  V3 soft modes: on the side-3 hot vacuum, each of the 24 one-trit changes of dock 0's store (12 lines, flipped or
//     zeroed) stays a difference of exactly that one trit from the vacuum run on each of 96 beats (0 failures)
//  V4 the rule is covariant on the broken vacuum: on the side-9 box, 48 lone vibes on the hot vacuum for 48 beats;
//     for every h in H0 the displacement of the start h (d, s) is h times the displacement of (d, s), and for two
//     elements g outside H0, the run from g (d, s) on the vacuum g (hot) is g times the run from (d, s) on hot
//     (displacement and every slot and store trit), 0 failures; charge and E exact on every beat
// Hypotheses (the readings):
//  H1 |H0| = 6, and H0 does not force the bulk scalar transport isotropic at degree 2
//  H2 every lone vibe on the hot vacuum is displaced by exactly T r_d after T = 48 beats, so the second-moment
//     tensor of the 48 starts is (T^2 / 2) I, bulk and husk anisotropy 0
//  H3 the effective two-body collision on the hot vacuum (every lone and two-vibe dock, the output vibes compared)
//     keeps a proper subgroup of W(F4) containing H0; on the cold vacuum it keeps all of W(F4)
// Verdict: pass if V1 to V4 and H1 to H3 hold; fail if V1 to V4 hold and some H does not; partial otherwise.
//
// Readings, not gated: the order-parameter-free statement of the degeneracy (bits per dock), the spacetime residual
// group (H0, H0 times the -1 map with a half period, charge conjugation), which transport tensors the effective
// two-body group forces isotropic (bulk 2 and 4, husk 4 and 6, husk shear 2, E-RLT-0063's census method), the wake
// a lone vibe leaves in the store, and the comparison with E-FRC-0143.
//
// Depth L2. DETERMINISM: exhaustive enumeration and fixed starts, no draw. The husk is read in the forcing test
// (husk scalars and shear) and in the second-moment tensor's husk block (x4 = 0), the bulk beside it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { boxCellMap, d4BoxCoordinates, d4BoxMesh, d4Vector, linearMapOf } from '@/code/substrate/d4-box'
import { isometricTable, LINE_FIRSTS, momentumKey, OPPOSITE, SIDE } from '@/code/rule/isometric-knit'
import { makePairKnit, pairBeat, pairCharge, pairDockCollide, pairEnergy, transformPairState, type PairKnit, type PairState } from '@/code/rule/pair-making-knit'
import { forcedIsotropic, matrixOfPermutation, type Matrix4 } from '@/code/measure/husk-transport-symmetry'
import { kroneckerPairDock } from '@/code/measure/pair-knit-linearization'
import { hermitianSpectrum } from '@/code/measure/qutrit-clifford'
import { operator } from '@/code/measure/grid-weights'

const ROOTS = rootsD4()
const LONE_BEATS = 48
const SOFT_BEATS = 96
const BOX = 9

const hotStore = (cells: number, tau = 1): Int8Array => new Int8Array(cells * 12).fill(tau)

// the least-length vector of each dock from dock 0 over the periods (the 81 shifts of d4BoxDistance)
function minimalImages(side: number): Float64Array {
  const cells = side ** 4
  const out = new Float64Array(cells * 4)

  for (let x = 0; x < cells; x++) {
    const c = d4BoxCoordinates({ cell: x, side }).map(v => (v > side / 2 ? v - side : v))
    let best: number[] = [0, 0, 0, 0]
    let bestLength = Number.POSITIVE_INFINITY

    for (let shift = 0; shift < 81; shift++) {
      const s = [0, 1, 2, 3].map(k => (Math.floor(shift / 3 ** k) % 3) - 1)
      const v = d4Vector(c.map((x0, k) => x0 + side * (s[k] ?? 0)))
      const length = v.reduce((a, b) => a + b * b, 0)

      if (length < bestLength) {
        bestLength = length
        best = v
      }
    }

    out.set(best, x * 4)
  }

  return out
}

function eigenvalues(m: number[][]): number[] {
  const n = m.length
  const op = operator(n)

  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) op.re[i * n + j] = m[i]?.[j] ?? 0

  return hermitianSpectrum(op)
}

const anisotropy = (values: number[]): number => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length

  return mean === 0 ? 0 : (Math.max(...values) - Math.min(...values)) / mean
}

export default experiment({
  id: 'relativity/hot-vacuum-symmetry-breaking',
  code: 'E-RLT-0069',
  title:
    'the hot vacuum breaks W(F4) and hides it, fail on one hypothesis: every calm dock with any of the 3^12 stores returns calm with the store negated (0 failures), so the vacua are chosen dock by dock (19.02 bits per dock) and a one-trit store change is an exact still zero mode (a flat band, no Goldstone mode, no stiffness); the uniform hot vacuum keeps the diagram S3 (order 6, orbit 192, 24 with the half-period shift and charge conjugation), which forces no transport isotropic, yet the rule stays covariant on it (0 failures), a lone vibe goes straight at its root (48 of 48, second moment (T^2/2) I exactly), and the one- and two-body collisions on it keep all 1,152 elements (predicted a proper subgroup: the H3 that fails), so binary transport on the hot vacuum is forced isotropic as on the symmetric background; the orientation shows only from three vibes in a dock on',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const permutations = weylF4DirectionPermutations({ directions: ROOTS })
    const dockKnit = makePairKnit({ mesh: d4BoxMesh({ side: 1 }) })

    // V1
    const w0 = isometricTable()[momentumKey([0, 0, 0, 0])]
    const w0IsMinus = !!w0 && Array.from(w0).every((image, d) => image === OPPOSITE[d])
    let dockFailures = 0

    for (let code = 0; code < 3 ** 12; code++) {
      const store = new Int8Array(12)
      let rest = code

      for (let l = 0; l < 12; l++) {
        store[l] = (rest % 3) - 1
        rest = Math.floor(rest / 3)
      }

      const s: PairState = { vibe: new Int8Array(24), store: Int8Array.from(store) }

      pairDockCollide(dockKnit, s, 0)
      dockFailures += s.vibe.every(v => v === 0) && s.store.every((t, l) => t === -(store[l] as number)) ? 0 : 1
    }

    const v1 = w0IsMinus && dockFailures === 0

    // V2 and H1: the residual group
    const signsOf = (g: readonly number[]): number[] => LINE_FIRSTS.map(f => SIDE[g[f] as number] as number)
    const h0 = permutations.filter(g => signsOf(g).every(s => s === 1))
    const h1 = permutations.filter(g => signsOf(g).every(s => s === -1))
    const orbit = new Set(permutations.map(g => transformPairState({ vibe: new Int8Array(24), store: hotStore(1) }, [0], g).store.join(','))).size
    const v2 = h0.length * orbit === 1152 && h0.length < 1152
    const matricesOf = (group: readonly (readonly number[])[]): Matrix4[] => group.map(g => matrixOfPermutation(g))
    const forcing = (group: readonly (readonly number[])[]): Record<string, number> => {
      const m = matricesOf(group)

      return {
        bulk2: forcedIsotropic({ group: m, kind: 'scalar', degree: 2, husk: false }).forced ? 1 : 0,
        bulk4: forcedIsotropic({ group: m, kind: 'scalar', degree: 4, husk: false }).forced ? 1 : 0,
        husk2: forcedIsotropic({ group: m, kind: 'scalar', degree: 2, husk: true }).forced ? 1 : 0,
        husk4: forcedIsotropic({ group: m, kind: 'scalar', degree: 4, husk: true }).forced ? 1 : 0,
        husk6: forcedIsotropic({ group: m, kind: 'scalar', degree: 6, husk: true }).forced ? 1 : 0,
        huskShear2: forcedIsotropic({ group: m, kind: 'transverse', degree: 2, husk: true }).forced ? 1 : 0,
      }
    }
    const h0Forcing = forcing(h0)
    const h1Ok = h0.length === 6 && h0Forcing.bulk2 === 0

    // V3: soft modes on the side-3 hot vacuum
    const soft = makePairKnit({ mesh: d4BoxMesh({ side: 3 }) })
    const softCells = soft.mesh.cellCount
    let softFailures = 0

    for (let l = 0; l < 12; l++) {
      for (const changed of [-1, 0]) {
        let vac: PairState = { vibe: new Int8Array(softCells * 24), store: hotStore(softCells) }
        let mod: PairState = { vibe: new Int8Array(softCells * 24), store: hotStore(softCells) }

        mod.store[l] = changed

        for (let t = 0; t < SOFT_BEATS; t++) {
          vac = pairBeat(soft, vac).state
          mod = pairBeat(soft, mod).state

          let differences = 0

          for (let i = 0; i < mod.vibe.length; i++) differences += mod.vibe[i] === vac.vibe[i] ? 0 : 1
          for (let i = 0; i < mod.store.length; i++) differences += mod.store[i] === vac.store[i] ? 0 : 1

          const sign = t % 2 === 0 ? -1 : 1
          const expected = changed === 0 ? 0 : -sign

          softFailures += differences === 1 && mod.store[l] === expected ? 0 : 1
        }
      }
    }

    const v3 = softFailures === 0

    // V4, H2: lone vibes on the side-9 hot vacuum
    const mesh = d4BoxMesh({ side: BOX })
    const cells = mesh.cellCount
    const knit = makePairKnit({ mesh })
    const images = minimalImages(BOX)
    const coords = Array.from({ length: cells }, (_, x) => d4BoxCoordinates({ cell: x, side: BOX }))
    const minus = (a: number, b: number): number =>
      [0, 1, 2, 3].reduce((index, k) => index + ((((coords[a]?.[k] ?? 0) - (coords[b]?.[k] ?? 0)) % BOX) + BOX) % BOX * BOX ** k, 0)
    type Run = { displacement: number[]; wake: number; chargeExact: boolean; energyExact: boolean; final: PairState }
    const loneRun = (k: PairKnit, store: Int8Array, slot: number, sign: number): Run => {
      let s: PairState = { vibe: new Int8Array(cells * 24), store: Int8Array.from(store) }

      s.vibe[slot] = sign

      const q0 = pairCharge(s)
      const e0 = pairEnergy(s)
      let vac: PairState = { vibe: new Int8Array(cells * 24), store: Int8Array.from(store) }
      let ref = Math.floor(slot / 24)
      const acc = [0, 0, 0, 0]
      let chargeExact = true
      let energyExact = true
      let centroid = [0, 0, 0, 0]

      for (let t = 0; t < LONE_BEATS; t++) {
        s = pairBeat(k, s).state
        vac = pairBeat(k, vac).state
        chargeExact = chargeExact && pairCharge(s) === q0
        energyExact = energyExact && pairEnergy(s) === e0

        const charge = new Map<number, number>()

        for (let i = 0; i < s.vibe.length; i++) {
          const v = s.vibe[i] as number

          if (v !== 0) charge.set(Math.floor(i / 24), (charge.get(Math.floor(i / 24)) ?? 0) + v)
        }

        let next = ref
        let largest = -1

        for (const [x, q] of charge) {
          if (Math.abs(q) > largest || (Math.abs(q) === largest && x < next)) {
            largest = Math.abs(q)
            next = x
          }
        }

        const step = minus(next, ref)

        for (let c = 0; c < 4; c++) acc[c] = (acc[c] as number) + (images[step * 4 + c] as number)
        ref = next
        centroid = [...acc]

        for (const [x, q] of charge) {
          const rel = minus(x, ref)

          for (let c = 0; c < 4; c++) centroid[c] = (centroid[c] as number) + ((q * (images[rel * 4 + c] as number)) / q0)
        }
      }

      let wake = 0

      for (let i = 0; i < s.store.length; i++) wake += s.store[i] === vac.store[i] ? 0 : 1

      return { displacement: centroid, wake, chargeExact, energyExact, final: s }
    }

    const hot = hotStore(cells)
    const lone: Run[] = []
    const starts: [number, number][] = []

    for (let d = 0; d < 24; d++) {
      for (const sign of [1, -1]) {
        starts.push([d, sign])
        lone.push(loneRun(knit, hot, d, sign))
      }
    }

    const apply = (g: readonly number[], v: readonly number[]): number[] => {
      const m = matrixOfPermutation(g)

      return [0, 1, 2, 3].map(i => [0, 1, 2, 3].reduce((s, j) => s + (m[i * 4 + j] as number) * (v[j] ?? 0), 0))
    }
    const close = (a: readonly number[], b: readonly number[]): boolean => a.every((x, i) => Math.abs(x - (b[i] ?? 0)) < 1e-9)
    let h0Failures = 0

    for (const h of h0) {
      starts.forEach(([d, sign], i) => {
        const j = starts.findIndex(([e, t]) => e === h[d] && t === sign)

        h0Failures += close(lone[j]?.displacement ?? [], apply(h, lone[i]?.displacement ?? [])) ? 0 : 1
      })
    }

    const outside = permutations.filter(g => !signsOf(g).every(s => s === 1) && !signsOf(g).every(s => s === -1)).slice(0, 2)
    let outsideFailures = 0

    for (const g of outside) {
      const matrix = linearMapOf(g)
      const cellMap = matrix ? boxCellMap({ matrix, side: BOX }) : undefined

      if (!cellMap) {
        outsideFailures++
        continue
      }

      const gHot = transformPairState({ vibe: new Int8Array(cells * 24), store: hot }, cellMap, g).store

      starts.forEach(([d, sign], i) => {
        const run = loneRun(knit, gHot, g[d] as number, sign)
        const expected = transformPairState(lone[i]?.final as PairState, cellMap, g)
        const same = run.final.vibe.every((v, k) => v === expected.vibe[k]) && run.final.store.every((v, k) => v === expected.store[k])

        outsideFailures += same && close(run.displacement, apply(g, lone[i]?.displacement ?? [])) ? 0 : 1
      })
    }

    const lawsExact = lone.every(r => r.chargeExact && r.energyExact)
    const v4 = h0Failures === 0 && outside.length === 2 && outsideFailures === 0 && lawsExact
    const straightFailures = lone.reduce((n, r, i) => n + (close(r.displacement, (ROOTS[starts[i]?.[0] ?? 0] as number[]).map(x => LONE_BEATS * x)) ? 0 : 1), 0)
    const second = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => lone.reduce((s, r) => s + (r.displacement[i] ?? 0) * (r.displacement[j] ?? 0), 0) / lone.length))
    const bulkEigen = eigenvalues(second)
    const huskEigen = eigenvalues(second.slice(0, 3).map(row => row.slice(0, 3)))
    const h2 = straightFailures === 0 && anisotropy(bulkEigen) < 1e-9 && anisotropy(huskEigen) < 1e-9

    // H3: the effective two-body collision on the hot and the cold vacuum
    const inputs: Int8Array[] = []

    for (let a = 0; a < 24; a++) {
      for (const s of [1, -1]) {
        const lone1 = new Int8Array(24)

        lone1[a] = s
        inputs.push(lone1)

        for (let b = a + 1; b < 24; b++) {
          for (const t of [1, -1]) {
            const two = new Int8Array(24)

            two[a] = s
            two[b] = t
            inputs.push(two)
          }
        }
      }
    }

    const outVibes = (vibe: Int8Array, store: Int8Array): Int8Array => {
      const s: PairState = { vibe: Int8Array.from(vibe), store: Int8Array.from(store) }

      pairDockCollide(dockKnit, s, 0)

      return s.vibe
    }
    const effectiveGroup = (store: Int8Array): { kept: number[][]; visible: number } => {
      const base = inputs.map(v => outVibes(v, store))
      const kept: number[][] = []

      for (const g of permutations) {
        let ok = true

        for (let i = 0; i < inputs.length && ok; i++) {
          const gin = new Int8Array(24)
          const gout = new Int8Array(24)

          for (let d = 0; d < 24; d++) {
            gin[g[d] as number] = inputs[i]?.[d] as number
            gout[g[d] as number] = base[i]?.[d] as number
          }

          const actual = outVibes(gin, store)

          ok = actual.every((v, d) => v === gout[d])
        }

        if (ok) kept.push([...g])
      }

      let visible = 0

      for (let i = 0; i < inputs.length; i++) {
        const cold = outVibes(inputs[i] as Int8Array, new Int8Array(12))

        visible += cold.every((v, d) => v === base[i]?.[d]) ? 0 : 1
      }

      return { kept, visible }
    }
    const hotEffective = effectiveGroup(hotStore(1))
    const coldEffective = effectiveGroup(new Int8Array(12))
    const containsH0 = h0.every(h => hotEffective.kept.some(g => g.every((x, i) => x === h[i])))
    const h3 = hotEffective.kept.length < 1152 && containsH0 && coldEffective.kept.length === 1152
    const effectiveForcing = forcing(hotEffective.kept)

    // spacetime residual group: H0 at even shifts; H1 (all line signs -1, the -1 map among them) and charge
    // conjugation each send the store to its negative, the vacuum one beat later
    const spacetimeOrder = 2 * (h0.length + h1.length)

    const ok = v1 && v2 && v3 && v4
    const status = ok ? (h1Ok && h2 && h3 ? 'pass' : 'fail') : 'partial'
    const metrics: Record<string, number> = {
      w0IsMinusOne: w0IsMinus ? 1 : 0,
      dockStores: 3 ** 12,
      dockTheoremFailures: dockFailures,
      vacuumBitsPerDock: 12 * Math.log2(3),
      h0Order: h0.length,
      h1Order: h1.length,
      hotOrbit: orbit,
      spacetimeResidualOrder: spacetimeOrder,
      ...Object.fromEntries(Object.entries(h0Forcing).map(([k, v]) => [`h0Forces_${k}`, v])),
      softModeFailures: softFailures,
      softModeCases: 24,
      loneStarts: lone.length,
      loneStraightFailures: straightFailures,
      h0CovarianceFailures: h0Failures,
      outsideCovarianceFailures: outsideFailures,
      loneLawsExact: lawsExact ? 1 : 0,
      secondMomentTrace: bulkEigen.reduce((a, b) => a + b, 0),
      bulkAnisotropy: anisotropy(bulkEigen),
      huskAnisotropy: anisotropy(huskEigen),
      wakeMean: lone.reduce((s, r) => s + r.wake, 0) / lone.length,
      wakeLargest: Math.max(...lone.map(r => r.wake)),
      twoBodyInputs: inputs.length,
      hotEffectiveOrder: hotEffective.kept.length,
      coldEffectiveOrder: coldEffective.kept.length,
      hotEffectiveContainsH0: containsH0 ? 1 : 0,
      vacuumVisibleInputs: hotEffective.visible,
      ...Object.fromEntries(Object.entries(effectiveForcing).map(([k, v]) => [`effectiveForces_${k}`, v])),
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `the hot vacuum breaks W(F4) in its state while the rule keeps it: every calm dock with any of the 3^12 stores goes to the calm dock with the negated store (${dockFailures} failures), so the vacua are chosen dock by dock (${(12 * Math.log2(3)).toFixed(2)} bits per dock) and a one-trit store change is an exact still zero mode (${softFailures} failures on 24 cases): a flat band, not a Goldstone mode; the hot vacuum keeps H0 of order ${h0.length} (orbit ${orbit}; forces bulk degree 2: ${h0Forcing.bulk2 ? 'yes' : 'no'}), ${h0.length + h1.length} with the half-period shift, ${spacetimeOrder} with charge conjugation; the rule stays covariant on it (${h0Failures + outsideFailures} failures); a lone vibe goes straight at its root (${straightFailures} of ${lone.length} starts deviate), so its transport is isotropic (anisotropy bulk ${anisotropy(bulkEigen).toExponential(1)}, husk ${anisotropy(huskEigen).toExponential(1)}) and it leaves a wake of ${(lone.reduce((s, r) => s + r.wake, 0) / lone.length).toFixed(1)} store trits; the vacuum shows in two-body collisions (${hotEffective.visible} of ${inputs.length} one- and two-vibe docks differ from the cold vacuum), whose effective group on the hot vacuum has order ${hotEffective.kept.length} (cold ${coldEffective.kept.length})`,
      metrics,
      control: { coldEffectiveOrder: coldEffective.kept.length },
      notes: `L2. Gates: V1 ${v1}, V2 ${v2}, V3 ${v3}, V4 ${v4}, H1 ${h1Ok}, H2 ${h2}, H3 ${h3}. First run recorded as is. Effective two-body group on the hot vacuum forces (bulk 2, bulk 4, husk 2, husk 4, husk 6, husk shear 2): ${JSON.stringify(effectiveForcing)}; H0 forces ${JSON.stringify(h0Forcing)}. Bulk second-moment eigenvalues ${bulkEigen.map(x => x.toFixed(3)).join(', ')} (T = ${LONE_BEATS}, free streaming gives T^2 / 2 = ${(LONE_BEATS ** 2 / 2).toFixed(1)} each). The comparison with E-FRC-0143: there the committed RULE breaks SU(2) explicitly and its vacuum is one period-24 condensate that respects only the charge U(1); here the rule keeps W(F4), CPT and reversal and the vacuum picks one of 3^12 store patterns per dock, the uniform hot one keeping a finite group. FIRST RUN (17.7 s): fail on H3 alone. The header's reasoning (d) was wrong: the 24 one- and two-vibe docks the hot vacuum changes are exactly the 24 love-fear pairs on one line (the unspent store stops them being unmade), and their output does not depend on the store's sign, so up to two bodies the vacuum shows only |tau|, which W(F4) fixes. DISCLOSED, added after the run and outside the verdict (tmp/vac-probe-orientation.ts): comparing the hot store with all 192 of its W(F4) images on the same vibes, the output depends on the orientation in 1,687 of 3,000 three-vibe docks, 1,103 to 1,643 of 3,000 at 4 to 12 held, and 660 of 2,000 Kronecker docks. So the broken symmetry reaches excitations only through collisions of three or more vibes in one dock: in the dilute (binary-collision) limit the husk transport on the hot vacuum is forced isotropic exactly as E-RLT-0065 found on the symmetric background (the effective group forces bulk 2 and 4, husk 2 and 4 and the husk shear at degree 2), and the anisotropy H0 allows can enter first at the order of the three-body rate.`,
    })
  },
})
