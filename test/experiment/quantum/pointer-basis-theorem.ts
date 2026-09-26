// A pointer basis is the environment's, never the rule's: the theorem behind E-QTM-0114 and E-QTM-0128.
//
// THE QUESTION (the roadmap row "decoherence and pointer states", open). E-QTM-0114 found the fear beat selects no
// pointer basis; E-QTM-0128 found SUM selects one but is not frame covariant (E-QTM-0136). The angle weighed first:
// the model's readings are lines, the stream copies trits, and quantum Darwinism says a pointer basis is the one
// whose record survives many copies. Before measuring redundancy on the vacuum (E-QTM-0155), what can a
// frame-covariant rule select at all?
//
// THE THEOREM. Let a knot token S meet an environment E by any dynamics that commutes with the frame changes (every
// meeting the knit makes does: the comoving fear beat commutes with all 648, E-SPN-0062; crossings are frame changes).
//  (A) If E's state is frame invariant, S's channel commutes with every frame change. The 648 form a unitary 2-design
//      (sum |Tr g|^4 = 2 |G|), so the adjoint action on traceless operators is irreducible and the channel is
//      rho -> lambda rho + (1 - lambda) 1/3 (Schur): every class decays at one rate, and no basis is preferred.
//  (B) No meeting of the model is a premeasurement of any basis from any ready state. Each kernel is alpha 1 + beta P
//      with P the exchange (like vibes) or the singlet projector (a love and a fear), dressed by displacements in the
//      comoving beat. alpha b e + beta P(b e) is a product only where b is parallel to e (exchange) or b^T e = 0
//      (singlet), and three orthonormal b never all satisfy either unless beta = 0. So the model's meetings SWAP a
//      state out; they never COPY it.
//  (C) The environment's symmetry bounds what can be selected: the moves fixing a point are transitive on the 4
//      classes, and those fixing a line fix its class and are transitive on the other 3. A point environment prefers
//      no class; a line environment can prefer only its own.
// So a pointer basis cannot come from the rule. It can only come from an environment that already holds lines of one
// class, together with a meeting that copies (a Clifford outside span{1, P}).
//
// Exact predictions for (A): with the uniform opening (the frame-invariant state, the sum of the 9 point members) a
// like meeting is lambda = |(1 + omega)/2|^2 + 2 Re((1 + omega)(1 - omega*))/12 = 1/4 and a love-fear meeting is
// lambda = 1 + 2 Re(omega - 1)/9 = 2/3 (derived by hand before the run from U = a 1 + b SWAP and V = 1 + (omega - 1) P).
//
// Gates, fixed before the first run:
//  G1 the 2-design: Sigma(648) has 648 elements, every |Tr g|^2 is an integer (rounding under 1e-9), and
//     sum |Tr g|^4 = 1,296 = 2 x 648.
//  G2 an invariant environment depolarizes: for both kernels (exactFearKernels(1, 1), unexchanged, the knit's) and all
//     81 pairs of own points, the one-meeting map on the knot with the uniform opening is exactly lambda id +
//     (1 - lambda) flat, lambda = 1/4 (like) and 2/3 (love-fear) on every pair: 162 of 162.
//  G3 no meeting premeasures: over 2 kernels x 81 own-point pairs x 12 ready lines x 4 classes (7,776 cases), 0 are a
//     record (the knot left on each of the class's 3 lines, uncorrelated, and 3 distinct environment marginals).
//     Control: the SUM reader of each class (E-QTM-0127) records its own class from exactly 9 ready lines (every line
//     outside the environment's tilt class, whose states X only rephases) and no other class: 36 of 192.
//  G4 the environment decides: the stabilizer of every line among the 216 moves fixes its class and is transitive on
//     the other three (12 of 12); the stabilizer of every point is transitive on all four (9 of 9); and a point member
//     environment at p met with the knot's own point at p leaves each start line a retained weight that depends only on
//     whether the line passes through p, never on its class (2 kernels x 9 points).
// Readings (not gated): the retained weights for own points q != p grouped by whether the start line is the line
// through q and p, passes through p only, through q only, or through neither; and one meeting with a line
// environment (the reset the fear beat makes instead of a record).
// Verdict: pass if G1 to G4 hold; fail otherwise.
//
// FIRST RUN (2026-09-26, 1.1 s, tmp/dar-pointer-basis-theorem.log): pass, every gate on the first run, no gate moved.
//  - G1: |Tr g|^2 takes 0 (168 elements), 1 (405), 3 (72), 9 (3, the center); sum |Tr g|^4 = 1,296 = 2 x 648.
//  - G2: lambda = 1/4 on all 81 like pairs and 2/3 on all 81 love-fear pairs, as derived by hand.
//  - G3: 0 of 7,776 model cases record, and not one leaves all three lines of a class undisturbed; the readers record
//    36 of 192, each its own class from 9 ready lines, none another class.
//  - G4: 12 of 12 lines, 9 of 9 points, 18 of 18 coincident point environments class-blind.
//  - Reading, own points apart (q != p): the retained weight depends only on whether the start line passes through the
//    KNOT'S OWN point q (like: 1 through q, 1/4 otherwise; love-fear: 1/3 through q, 1 otherwise), never on the line
//    through q and p. So the relative own point of the comoving beat supplies no axis either: a point environment is
//    class-blind at all 81 own-point pairs, not only the 9 coincident ones the gate names.
//  - Reading, a line environment: a knot on a tilt line meeting a role-line environment ends with 5/6 of its weight
//    on the environment's line under the like kernel (the environment's state is swapped in, a reset), 1/9 under the
//    love-fear kernel; its own line keeps 1/2 and 7/9. Neither is a record: the knot is changed.
//
// Depth L1 for (A) and (C) (group theory), L2 for (B) and G2 (the model's own kernels, exact). The husk is not read:
// every number is a role-grid number, since a meeting acts on roles and never on where a vibe is. No random numbers:
// every case is enumerated.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { exactFearKernels } from '@/code/rule/fear-kernel-exact'
import { marginalOne, readerPermutation, LINE_CLASSES } from '@/code/measure/sum-record'
import {
  applyMap,
  classOrbits,
  depolarizingFactor,
  framePotential,
  GRID_LINES,
  kernelStep,
  meetingMap,
  onPoints,
  permutationStep,
  phaseMoves,
  premeasures,
  productOf,
  stabilizerOf,
  UNIFORM,
  unitsOf,
  meetOnce,
} from '@/code/measure/pointer-basis'

const ratio = (num: bigint, den: bigint): string => {
  const g = gcd(num, den)

  return `${num / g}/${den / g}`
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y > 0n) [x, y] = [y, x % y]

  return x
}

export default experiment({
  id: 'quantum/pointer-basis-theorem',
  code: 'E-QTM-0154',
  title: 'a pointer basis is the environment\'s, never the rule\'s: the frame changes are a unitary 2-design, so a frame-invariant environment depolarizes (like 1/4, love-fear 2/3 per meeting), no meeting of the model premeasures any basis, and only a line environment can single out a class',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const kernels = exactFearKernels({ like: 1, unlike: 1, likeExchanged: false })
    const kinds = [
      { name: 'like', kernel: kernels.like, divisor: kernels.likeDivisor, lambda: [1n, 4n] as const },
      { name: 'loveFear', kernel: kernels.unlike, divisor: kernels.unlikeDivisor, lambda: [2n, 3n] as const },
    ]

    // G1
    const fp = framePotential()
    const g1 = fp.elements === 648 && fp.worstRounding < 1e-9 && fp.potential === 2 * 648

    // G2
    let g2Pass = 0
    const lambdas: Record<string, string[]> = {}

    for (const k of kinds) {
      const seen = new Set<string>()

      for (let q = 0; q < 9; q++) {
        for (let p = 0; p < 9; p++) {
          const map = meetingMap({ kernel: k.kernel, divisor: k.divisor, env: UNIFORM, own: [q, p] })
          const f = depolarizingFactor(map)
          const exact = f.depolarizing && f.num * k.lambda[1] === f.den * k.lambda[0]

          g2Pass += exact ? 1 : 0
          seen.add(f.depolarizing ? ratio(f.num, f.den) : 'not')
        }
      }

      lambdas[k.name] = [...seen]
    }

    const g2 = g2Pass === 162

    // G3
    let modelRecords = 0
    let modelUndisturbedAll = 0
    let cases = 0

    for (const k of kinds) {
      for (let q = 0; q < 9; q++) {
        for (let p = 0; p < 9; p++) {
          const step = kernelStep(k.kernel, k.divisor, [q, p])

          for (const ready of GRID_LINES) {
            for (let cls = 0; cls < 4; cls++) {
              const r = premeasures(step, cls, onPoints(ready.points))

              cases++
              modelRecords += r.record ? 1 : 0
              modelUndisturbedAll += r.undisturbed === 3 ? 1 : 0
            }
          }
        }
      }
    }

    let readerRecords = 0
    let readerWrong = 0
    const readerReady: number[] = []

    LINE_CLASSES.forEach((c, own) => {
      const step = permutationStep(readerPermutation(c.direction).perm)
      let n = 0

      for (const ready of GRID_LINES) {
        for (let cls = 0; cls < 4; cls++) {
          const r = premeasures(step, cls, onPoints(ready.points))

          if (r.record) {
            readerRecords++
            if (cls === own) n++
            else readerWrong++
          }
        }
      }

      readerReady.push(n)
    })

    const g3 = cases === 7776 && modelRecords === 0 && readerRecords === 36 && readerWrong === 0 && readerReady.every(n => n === 9)

    // G4
    const moves = phaseMoves()
    let lineOk = 0

    for (const line of GRID_LINES) {
      const orbits = classOrbits(stabilizerOf(moves, line.points))
      const fixed = orbits.find(o => o.length === 1)

      lineOk += orbits.length === 2 && fixed?.[0] === line.cls && orbits.some(o => o.length === 3) ? 1 : 0
    }

    let pointOk = 0

    for (let p = 0; p < 9; p++) pointOk += classOrbits(stabilizerOf(moves, [p])).length === 1 ? 1 : 0

    let pointEnvOk = 0
    const coincident: Record<string, string> = {}
    const apart: Record<string, Set<string>> = {}

    for (const k of kinds) {
      for (let p = 0; p < 9; p++) {
        for (let q = 0; q < 9; q++) {
          const map = meetingMap({ kernel: k.kernel, divisor: k.divisor, env: onPoints([p]), own: [q, p] })
          const retained = GRID_LINES.map(l => {
            const after = applyMap(map, onPoints(l.points))
            const on = l.points.reduce((s, x) => s + (after[x] as bigint), 0n)

            return ratio(on, unitsOf(after))
          })

          if (q === p) {
            const through = new Set(GRID_LINES.filter(l => l.points.includes(p)).map(l => retained[GRID_LINES.indexOf(l)]))
            const off = new Set(GRID_LINES.filter(l => !l.points.includes(p)).map(l => retained[GRID_LINES.indexOf(l)]))

            pointEnvOk += through.size === 1 && off.size === 1 ? 1 : 0
            coincident[`${k.name}_p${p}`] = `${[...through][0]} through, ${[...off][0]} off`
          } else {
            GRID_LINES.forEach((l, i) => {
              const hasP = l.points.includes(p)
              const hasQ = l.points.includes(q)
              const group = hasP && hasQ ? 'axis' : hasP ? 'p' : hasQ ? 'q' : 'neither'
              const key = `${k.name}_${group}`

              apart[key] = apart[key] ?? new Set<string>()
              ;(apart[key] as Set<string>).add(retained[i] as string)
            })
          }
        }
      }
    }

    const g4 = lineOk === 12 && pointOk === 9 && pointEnvOk === 18

    // reading: one meeting with a line environment, the knot on a line of another class (the reset)
    const lineEnv: Record<string, string> = {}

    for (const k of kinds) {
      const knot = GRID_LINES[3] as (typeof GRID_LINES)[number]
      const env = GRID_LINES[0] as (typeof GRID_LINES)[number]
      const met = meetOnce(productOf(onPoints(knot.points), onPoints(env.points)), k.kernel, k.divisor)
      const s = marginalOne(met, 0)
      const u = unitsOf(s)

      lineEnv[k.name] = `knot on ${JSON.stringify(knot.points)} (class ${knot.cls}) meets env on ${JSON.stringify(env.points)} (class ${env.cls}): weight on the env line ${ratio(env.points.reduce((a, x) => a + (s[x] as bigint), 0n), u)}, on its own line ${ratio(knot.points.reduce((a, x) => a + (s[x] as bigint), 0n), u)}`
    }

    const gates = { G1: g1, G2: g2, G3: g3, G4: g4 }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the 648 frame changes are a unitary 2-design (sum |Tr g|^4 = ${fp.potential} = 2 x 648), so with a frame-invariant environment every frame-covariant dynamics depolarizes the knot, one rate for every basis: one like meeting keeps lambda ${lambdas.like?.join(' ')} and one love-fear meeting ${lambdas.loveFear?.join(' ')}, exactly, at all 81 own-point pairs; no meeting of the model premeasures any basis (${modelRecords} of ${cases} cases) while each SUM reader records its own class from 9 ready lines (${readerRecords} of 192); a point's stabilizer is transitive on the 4 classes (${pointOk} of 9) and a line's fixes only its own (${lineOk} of 12), so a pointer basis needs an environment that already holds lines of one class`,
      metrics: {
        elements: fp.elements,
        framePotential: fp.potential,
        worstRounding: fp.worstRounding,
        depolarizingMaps: g2Pass,
        premeasureCases: cases,
        modelRecords,
        modelUndisturbedAllThree: modelUndisturbedAll,
        readerRecords,
        readerWrongClass: readerWrong,
        lineStabilizersFixingOnlyOwnClass: lineOk,
        pointStabilizersTransitive: pointOk,
        pointEnvironmentsClassBlind: pointEnvOk,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes: `|Tr g|^2 value:count ${[...fp.squares.entries()].sort((a, b) => a[0] - b[0]).map(([v, n]) => `${v}:${n}`).join(' ')}. lambda by kernel ${JSON.stringify(lambdas)}. Point member environment, own points coincide (retained weight of a start line): ${JSON.stringify(coincident)}. Own points apart (q != p), retained weights by the start line's relation to the line through q and p: ${JSON.stringify(Object.fromEntries(Object.entries(apart).map(([k, v]) => [k, [...v]])))}. One meeting with a line environment: ${JSON.stringify(lineEnv)}. L1 for the group theory, L2 for the model's kernels; role grid only, exact integers except the 648 traces (floats, rounded under 1e-9).`,
    })
  },
})
