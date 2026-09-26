// Triples on a triangle, the algebra. A hypothesis reached by reasoning: electric charge is
// Q = (love - fear) / 3, and a fermion is three vibes, one on each of the three lines of a zero-sum
// triangle (an A2 plane of the coin, E-FRC-0106). With love +1/3, calm 0 and fear -1/3 this is the
// Harari-Shupe rishon model (1979), love = T, calm = V, fear = anti-T, and color would be WHICH line holds
// the odd vibe. This measures the algebra exactly, before any dynamics (E-FRC-0171 runs the triples).
//
// 1. THE TABLE. All 27 triples on three ordered places: charge, the orbit under the triangle's S3 (the
//    arrangements) and under its rotations Z3, the Harari-Shupe name, and how often the S3 sign character
//    occurs in each orbit (an arrangement orbit can be antisymmetrized only if it does).
// 2. THE LOCK. The claim "one arrangement exactly when Q is whole" on all 27, and on the 15 triples where
//    love and fear do not mix (the Harari-Shupe states). Then Q on the model's own objects: a lone vibe,
//    the meson (a love and a fear), the knot (three loves), and every mix up to six vibes against the
//    frame-free whole rule of E-FRC-0118 (whole exactly when love - fear is a multiple of 3), and the
//    triple-level hadrons (proton uud, neutron udd, pi+ u anti-d).
// 3. THE KEY QUESTION: is arrangement-color the same three as the role, or a second three?
//    a. the groups: the triangle's symmetry inside W(F4) and what it induces on the three places; the 24
//       turns (the coin as a 2T torsor, E-SPN-0044: left multiplication, and conjugation); Sigma(648), the
//       knit's classical color group, generated from its matrices, its center and its triplet character
//    b. the representations: the arrangement three is a permutation representation (it contains the
//       invariant sum of the three arrangements), the role three of Sigma(648) is irreducible (no
//       invariant), so the two are not the same representation
//    c. the knit: under the combined knit with tokens and role points (E-FRC-0158), 216 different
//       starting role assignments of the same triple give vibe histories that are compared slot by slot:
//       the vibe dynamics, and so the arrangement, never read the role
//    d. the knit's own color weight W (code/rule/color-weave: a vibe weighs its sign, a calm slot the side
//       of its line), summed over the triangle's three lines: does it see the three arrangements alike?
//    e. whether each knit keeps any coin symmetry that cycles a triangle's three lines (the only way the
//       three arrangements could be exactly degenerate colors under the dynamics): the symmetry ledger of
//       code/measure/rule-symmetry-ledger on the committed knit, the combined knit and the cold weave
//       (forward only for the cold weave, whose dock also holds stores and counters)
//
// Gates, fixed before the run:
// - G1 the six rows of the hypothesis's table, exact (love-love-love +1 in 1 arrangement, love-love-calm
//   +2/3 in 3, love-calm-calm +1/3 in 3, calm-calm-calm 0 in 1, calm-calm-fear -1/3 in 3,
//   fear-fear-fear -1 in 1)
// - G2 the lock on the 15 unmixed triples: one arrangement exactly when Q is whole, 15 of 15
// - G3 the lock on all 27 (the hypothesis as stated, "every knot whole, every colored thing fractional")
// - G4 whole (love - fear = 0 mod 3) exactly when Q is whole, on every mix up to six vibes
// - G5 arrangement-color and role are one three: FAILS if the knit's vibe dynamics are blind to the role
//   (c) and the representations differ (b)
// The result is PASS only if G1 to G4 hold; G5 is reported as the answer to the key question.
//
// Depth L1: exact enumeration and exact group arithmetic, plus one exact comparison of knit histories.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { a2Planes, coldSpec, cyclingElements, KIND_ORDER, OPPOSITE, ROOTS, SIDE, TRIPLES, tripleDock } from '@/code/measure/rishon-triples'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { binaryTetrahedralGroup, quaternionMultiply, quaternionsClose, vectorAction, type Quaternion } from '@/code/algebra/binary-tetrahedral'
import { generateGroup } from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { combinedBeat, combinedCollision, combinedState, COMBINED_DEFAULT, makeCombinedKnit } from '@/code/rule/combined-knit'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { symmetryLedger } from '@/code/measure/rule-symmetry-ledger'
import { coldDockCollide, makeColdWeave } from '@/code/rule/cold-weave'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'

const mod3 = (x: number): number => ((x % 3) + 3) % 3

// the cold weave's dock collision on vibes alone, stores and counters empty at every call (a stand-in for
// the symmetry ledger only: the counters a clock would fill are dropped)
function coldVibeCollision(forward: boolean): (t: number) => Collision {
  const weave = makeColdWeave({ mesh: d4BoxMesh({ side: 3 }), spec: coldSpec() })

  return t => (slots, base) => {
    const a = { vibe: Int8Array.from(slots.subarray(base, base + 24)), store: new Int32Array(24), demon: new Int32Array(12), role: undefined }

    coldDockCollide(weave, a, 0, t, forward)
    slots.set(a.vibe, base)
  }
}

export default experiment({
  id: 'gauge/rishon-algebra',
  code: 'E-FRC-0170',
  title:
    'triples on a triangle, the algebra: Q = (love - fear) / 3 on the 27 triples of an A2 triangle reproduces the Harari-Shupe table on the 15 unmixed triples, the lock between one arrangement and whole charge holds on those 15 and fails on the 6 love-calm-fear triples, and arrangement-color is a second three beside the role, not the same one',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // 1. the table
    const kinds = KIND_ORDER.map(kind => {
      const members = TRIPLES.filter(t => t.kind === kind)
      const first = members[0]!
      // the S3 sign character's multiplicity in the permutation representation on this orbit:
      // (1 / 6) sum over g of (fixed points of g on the orbit) times sign(g)
      const perms = [
        [[0, 1, 2], 1],
        [[1, 2, 0], 1],
        [[2, 0, 1], 1],
        [[0, 2, 1], -1],
        [[2, 1, 0], -1],
        [[1, 0, 2], -1],
      ] as const
      const signMultiplicity =
        perms.reduce((s, [p, sign]) => s + sign * members.filter(m => p.every((i, k) => m.vibes[i] === m.vibes[k])).length, 0) / 6

      return {
        kind,
        states: members.length,
        charge3: first.charge3,
        arrangements: first.arrangements,
        rotationOrbits: members.length / first.rotations,
        harari: first.harari,
        signMultiplicity,
      }
    })
    const row = (kind: string) => kinds.find(k => k.kind === kind)!
    const hypothesisTable: [string, number, number][] = [
      ['love-love-love', 3, 1],
      ['love-love-calm', 2, 3],
      ['love-calm-calm', 1, 3],
      ['calm-calm-calm', 0, 1],
      ['calm-calm-fear', -1, 3],
      ['fear-fear-fear', -3, 1],
    ]
    const g1 = TRIPLES.length === 27 && kinds.length === 10 && hypothesisTable.every(([k, q, n]) => row(k).charge3 === q && row(k).arrangements === n)

    // 2. the lock
    const unmixed = TRIPLES.filter(t => t.loves === 0 || t.fears === 0)
    const lockHolds = (t: (typeof TRIPLES)[number]): boolean => (t.arrangements === 1) === (mod3(t.charge3) === 0)
    const g2Count = unmixed.filter(lockHolds).length
    const g3Count = TRIPLES.filter(lockHolds).length
    const lockBreakers = [...new Set(TRIPLES.filter(t => !lockHolds(t)).map(t => t.kind))]
    const g2 = unmixed.length === 15 && g2Count === 15
    const g3 = g3Count === 27

    // whole rule against whole charge, every mix of a loves and b fears, a + b <= 6
    let mixes = 0
    let wholeIsInteger = 0

    for (let n = 1; n <= 6; n++) {
      for (let a = 0; a <= n; a++) {
        const b = n - a

        mixes += 1
        wholeIsInteger += (mod3(a - b) === 0) === Number.isInteger((a - b) / 3) ? 1 : 0
      }
    }

    const g4 = wholeIsInteger === mixes
    // the vibe-level wholes of 2 and 3 vibes, and their charges
    const smallWholes = [2, 3].flatMap(n =>
      Array.from({ length: n + 1 }, (_, a) => ({ loves: a, fears: n - a })).filter(m => mod3(m.loves - m.fears) === 0),
    )
    const hadron = (parts: string[]): number => parts.reduce((s, k) => s + row(k).charge3, 0)
    const proton3 = hadron(['love-love-calm', 'love-love-calm', 'calm-calm-fear'])
    const neutron3 = hadron(['love-love-calm', 'calm-calm-fear', 'calm-calm-fear'])
    const pionPlus3 = hadron(['love-love-calm', 'love-calm-calm'])

    // 3a. the groups. The triangle's stabilizer in W(F4) and the permutations it induces on the places
    const planes = a2Planes()
    const triangles = planes.flatMap(p => [p.triangle, p.anti])
    const permutations = weylF4DirectionPermutations({ directions: ROOTS.map(r => [...r]) })
    const induced = triangles.map(t => {
      const stabilizer = permutations.filter(p => t.every(d => t.includes(p[d] ?? -1)))
      const onPlaces = new Set(stabilizer.map(p => t.map(d => t.indexOf(p[d] ?? -1)).join('')))

      return { stabilizer: stabilizer.length, onPlaces: onPlaces.size }
    })

    // the 24 turns: 2T acting on the directions by left multiplication (the torsor of E-SPN-0044) and by
    // conjugation
    const group = binaryTetrahedralGroup()
    const u: Quaternion = [Math.SQRT1_2, Math.SQRT1_2, 0, 0]
    const unit = (d: number): Quaternion => (ROOTS[d] ?? []).map(x => x * Math.SQRT1_2) as Quaternion
    const indexOf = (q: Quaternion): number => ROOTS.findIndex((_, d) => quaternionsClose(unit(d), q))
    const left = group.map(g => ROOTS.map((_, d) => indexOf(quaternionMultiply(g, unit(d)))))
    const conjugate = group.map(g => ROOTS.map((_, d) => indexOf(vectorAction(g, unit(d)))))
    const torsor = ROOTS.every((_, d) => group.filter(g => quaternionsClose(quaternionMultiply(g, u), unit(d))).length === 1)
    const setOf = (t: readonly number[]): string => [...t].sort((a, b) => a - b).join(',')
    const turnStabilizers = (action: number[][]) =>
      triangles.map(t => {
        const keep = action.filter(p => setOf(t.map(d => p[d] ?? -1)) === setOf(t))
        const cycle = keep.filter(p => t.every(d => p[d] !== d)).length

        return { keep: keep.length, cycle }
      })
    const leftStab = turnStabilizers(left)
    const conjStab = turnStabilizers(conjugate)
    // the -1 of 2T by left multiplication sends each triangle to its antitriangle, on the same three lines
    const minusOne = group.findIndex(g => quaternionsClose(g, [-1, 0, 0, 0]))
    const minusToAnti = planes.every(p => setOf(p.triangle.map(d => left[minusOne]?.[d] ?? -1)) === setOf(p.anti))
    const leftOrbit = new Set(left.map(p => setOf((triangles[0] ?? []).map(d => p[d] ?? -1)))).size

    // Sigma(648): order, center, and the triplet character's norm and invariant count
    const sigma = generateGroup({ generators: [...SU3_SUBGROUPS.sigma648.generators] })
    const chi = sigma.matrices.map(m => [(m[0] ?? 0) + (m[8] ?? 0) + (m[16] ?? 0), (m[1] ?? 0) + (m[9] ?? 0) + (m[17] ?? 0)])
    const tripletNorm = Math.round(chi.reduce((s, [x = 0, y = 0]) => s + x * x + y * y, 0) / sigma.order)
    const tripletInvariants = Math.round(chi.reduce((s, [x = 0]) => s + x, 0) / sigma.order)
    const center = sigma.matrices.filter(m => {
      const off = [2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15].every(i => Math.abs(m[i] ?? 0) < 1e-9)

      return off && Math.abs((m[0] ?? 0) - (m[8] ?? 0)) < 1e-9 && Math.abs((m[1] ?? 0) - (m[9] ?? 0)) < 1e-9 && Math.abs((m[0] ?? 0) - (m[16] ?? 0)) < 1e-9 && Math.abs((m[1] ?? 0) - (m[17] ?? 0)) < 1e-9
    }).length
    // 3b. the arrangement representation of S3 on three places: characters 3, 1 (transpositions), 0
    // (3-cycles); its invariant count is (3 + 3 * 1 + 2 * 0) / 6
    const arrangementInvariants = (3 + 3 * 1 + 2 * 0) / 6
    const arrangementNorm = (9 + 3 * 1 + 2 * 0) / 6

    // 3c. the knit is blind to the role: the same love-love-calm triple with 216 different starting role
    // assignments (every grid move applied to one assignment) on the combined knit, side 5, 24 beats
    const side = 5
    const knit = makeCombinedKnit({ side, spec: COMBINED_DEFAULT })
    const plane = planes[0]!
    const center5 = d4BoxCell({ coordinates: [2, 2, 2, 2], side })
    const vibe = new Int8Array(knit.weave.mesh.cellCount * 24)
    const dock = tripleDock(plane.triangle, [1, 1, 0])

    vibe.set(dock, center5 * 24)

    const basePoints = Int8Array.from({ length: vibe.length }, (_, i) => Math.floor((((i + 3) * 0.6180339887 * 1.37 * 9) % 9 + 9) % 9))
    const open = new Uint8Array(vibe.length)
    const history = (points: Int8Array): Int8Array[] => {
      let state = combinedState(knit, { vibe, point: points })
      const out: Int8Array[] = []

      for (let t = 0; t < 24; t++) {
        state = combinedBeat(knit, state, open, t).state
        out.push(state.vibe)
      }

      return out
    }
    const reference = history(basePoints)
    let roleMismatches = 0
    let roleRuns = 0

    for (let g = 0; g < knit.weave.moves.act.length; g++) {
      const moved = Int8Array.from(basePoints, p => knit.weave.moves.act[g]?.[p] ?? p)
      const h = history(moved)

      roleRuns += 1
      h.forEach((v, t) => {
        const r = reference[t]!

        for (let i = 0; i < v.length; i++) {
          roleMismatches += v[i] === r[i] ? 0 : 1
        }
      })
    }

    // 3d. the knit's color weight W over the triangle's three lines, relative to the empty lines: a vibe v
    // on a slot of side s changes the weight by v - s. Per triangle and colored unmixed kind: do the
    // three arrangements carry one weight mod 3?
    const weightOf = (t: readonly number[], vibes: readonly number[]): number =>
      mod3(t.reduce((s, d, k) => s + ((vibes[k] ?? 0) !== 0 ? (vibes[k] ?? 0) - (SIDE[d] ?? 0) : 0), 0))
    const colored = ['love-love-calm', 'love-calm-calm', 'calm-calm-fear', 'calm-fear-fear']
    let weightAlike = 0
    let weightSplit = 0
    let weightEqualsCharge = 0
    let weightCases = 0

    for (const t of triangles) {
      for (const kind of colored) {
        const weights = new Set(TRIPLES.filter(x => x.kind === kind).map(x => weightOf(t, x.vibes)))

        if (weights.size === 1) weightAlike += 1
        else weightSplit += 1
      }

      for (const x of TRIPLES) {
        weightCases += 1
        weightEqualsCharge += weightOf(t, x.vibes) === mod3(x.charge3) ? 1 : 0
      }
    }

    const sideSums = new Set(triangles.map(t => t.reduce((s, d) => s + (SIDE[d] ?? 0), 0)))

    // 3e. which knits keep a coin symmetry cycling a triangle's lines
    const cycling = cyclingElements()
    const unique = [...new Map(cycling.map(c => [c.permutation.join(','), c.permutation])).values()]
    const ledgerOf = (forward: (t: number) => Collision, inverse: (t: number) => Collision, forwardOnly: boolean): number =>
      symmetryLedger({ forward, inverse, period: 24, permutations: unique, degree: 24 }).filter(e => !forwardOnly || e.kind === 'forward').length
    const opposite = [...OPPOSITE]
    const committedCycling = ledgerOf(turningWeave({ opposite }), turningWeave({ opposite, forward: false }), false)
    const combinedCycling = ledgerOf(
      combinedCollision({ spec: COMBINED_DEFAULT, opposite }),
      combinedCollision({ spec: COMBINED_DEFAULT, opposite, forward: false }),
      false,
    )
    const coldCycling = ledgerOf(coldVibeCollision(true), coldVibeCollision(false), true)

    const blind = roleMismatches === 0 && roleRuns === 216
    const differentReps = tripletNorm === 1 && tripletInvariants === 0 && arrangementInvariants === 1
    const g5SameThree = !(blind && differentReps)
    const ok = g1 && g2 && g3 && g4

    const metrics: Record<string, number> = {
      triples: TRIPLES.length,
      kinds: kinds.length,
      g1HypothesisTableRows: g1 ? 6 : 0,
      g2LockOnUnmixed: g2Count,
      unmixedTriples: unmixed.length,
      g3LockOnAll: g3Count,
      g4WholeMixesMatchingIntegerCharge: wholeIsInteger,
      wholeMixesChecked: mixes,
      proton3Q: proton3,
      neutron3Q: neutron3,
      pionPlus3Q: pionPlus3,
      a2Planes: planes.length,
      triangleStabilizerInWF4: induced[0]?.stabilizer ?? 0,
      triangleStabilizerSizesDistinct: new Set(induced.map(i => i.stabilizer)).size,
      permutationsInducedOnPlaces: Math.min(...induced.map(i => i.onPlaces)),
      coinIsTorsor: torsor ? 1 : 0,
      leftTurnsKeepingATriangle: Math.min(...leftStab.map(s => s.keep)),
      leftTurnsCyclingATriangle: Math.min(...leftStab.map(s => s.cycle)),
      leftMinusOneSendsTriangleToAnti: minusToAnti ? 1 : 0,
      leftOrbitOfATriangle: leftOrbit,
      conjugationTurnsKeepingATriangleMin: Math.min(...conjStab.map(s => s.keep)),
      conjugationTurnsKeepingATriangleMax: Math.max(...conjStab.map(s => s.keep)),
      conjugationTurnsCyclingATriangleMax: Math.max(...conjStab.map(s => s.cycle)),
      sigma648Order: sigma.order,
      sigma648Center: center,
      roleTripletCharacterNorm: tripletNorm,
      roleTripletInvariants: tripletInvariants,
      arrangementInvariants,
      arrangementCharacterNorm: arrangementNorm,
      roleAssignmentsRun: roleRuns,
      vibeMismatchesAcrossRoleAssignments: roleMismatches,
      knitWeightAlikeAcrossArrangements: weightAlike,
      knitWeightSplitAcrossArrangements: weightSplit,
      knitWeightEqualsChargeMod3: weightEqualsCharge,
      knitWeightCases: weightCases,
      triangleSideSumValues: sideSums.size,
      cyclingCandidates: unique.length,
      committedCyclingSymmetries: committedCycling,
      combinedCyclingSymmetries: combinedCycling,
      coldCyclingForwardSymmetries: coldCycling,
      g5ArrangementIsTheRole: g5SameThree ? 1 : 0,
    }

    for (const k of kinds) {
      const name = k.kind.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

      metrics[`${name}Charge3`] = k.charge3
      metrics[`${name}Arrangements`] = k.arrangements
      metrics[`${name}RotationOrbits`] = k.rotationOrbits
      metrics[`${name}SignMultiplicity`] = k.signMultiplicity
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the 27 triples on an A2 triangle give the hypothesis's six rows exactly (G1 ${g1 ? 'holds' : 'fails'}); the lock (one arrangement exactly when Q is whole) holds on ${g2Count} of the 15 unmixed triples and on ${g3Count} of 27, broken only by ${lockBreakers.join(', ')} (Q = 0 in 6 arrangements); whole (love - fear = 0 mod 3) is whole Q on ${wholeIsInteger} of ${mixes} mixes, an identity; and arrangement-color is a second three: the knit's vibes run identically under all 216 role assignments (${roleMismatches} mismatches), the role triplet of Sigma(648) is irreducible with no invariant while the arrangement three contains one, the knit's own color weight splits the three arrangements on ${weightSplit} of ${weightSplit + weightAlike} triangle-kind cases, and no knit keeps a coin symmetry cycling a triangle (committed ${committedCycling}, combined ${combinedCycling}, cold ${coldCycling})`,
      metrics,
      control: {
        lockBreakingKinds: lockBreakers.length,
        smallWholes: smallWholes.length,
      },
      notes: `L1, exact. Table (kind: 3Q, arrangements under S3, orbits under Z3, S3 sign multiplicity, Harari-Shupe): ${kinds.map(k => `${k.kind}: ${k.charge3}, ${k.arrangements}, ${k.rotationOrbits}, ${k.signMultiplicity}, ${k.harari}`).join('; ')}. Vibe-level wholes of 2 and 3 vibes: ${smallWholes.map(m => `${m.loves} love ${m.fears} fear (Q ${(m.loves - m.fears) / 3})`).join(', ')}, so at the vibe level every two-vibe whole is neutral and every three-vibe whole has Q = +-1: no charged meson and no neutral three-vibe knot, which appear only at the triple level (proton 3Q ${proton3}, neutron ${neutron3}, pi+ ${pionPlus3}). The lock direction: a lone love (the knit's triplet by E-FRC-0118) gets 3Q = +1, a Standard Model quark (3) has 3Q = 2 mod 3, so the lock matches with the love read as the antitriplet or Q read with the opposite sign, a naming convention, not a failure. Arrangement-color: the triangle's stabilizer in W(F4) induces all of S3 on the three places; by left multiplication 3 of the 24 turns keep each triangle (1 and two that cycle it) and -1 sends it to its antitriangle on the same lines, so a left turn moves arrangement-color exactly as it moves the places, while the role grid is untouched by any turn (tokens ride with the vibes); Sigma(648) acts on role points only and leaves every slot as it was. The two threes are independent labels, so a quark-type triple carries 3 arrangements times the role content of its vibes. The knit's weight of a calm slot is the side of its line, and on every triangle the three sides are two of one sign and one of the other (side sums +-1), so the knit's bookkeeping sets one place apart from the other two. The symmetry ledger tried every W(F4) element that cycles some triangle, with every tone relabelling and time shift, forward and reversed.`,
    })
  },
})
