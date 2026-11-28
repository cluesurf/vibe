// THE BERRY PHASE OF A ROLE TURNED ROUND A CLOSED LOOP BY THE RULE'S LINKS (E-QTM-0196, OPEN-QTM-12, quantum-coverage
// an earlier step). The ledger holds "Berry and geometric phase" as a stand-in (E-GMT-0036, E-QTM-0094); atoms-and-quanta.md
// lists the Berry phase as not measured. This explores whether a role carried round a loop by Sigma(648), the rule's link
// group, picks up a geometric phase, how it depends on the solid angle the loop encloses, and whether the value is the
// spin-1 one a qutrit would suggest or the spin-1/2 one.
//
// WHAT IS RUN (code/measure/role-berry).
// - A role is a line of the 3 x 3 grid of points (12 lines: 4 directions, role (1,0), tilt (0,1), (1,1), (1,2), 3 lines
//   each). Its state is the line's stabilizer state: the projector (1/3) sum of the phase points on it, exact in
//   Q(zeta_9). A link turns a role by its grid move lifted to Sigma(648) (holonomy-caging gridLifts, all 648 elements).
// - A loop is a closed walk of lines l_0 -> l_1 -> ... -> l_0, each step between lines of different directions. Two lines
//   of one direction are orthogonal, so no slow step joins them; lines of different directions overlap 1/3, the
//   slowest turn the group has. Every loop of length 2 to 6 is enumerated (each step exists as a link move, I3).
// - The geometric phase gamma = -arg prod <l_k | l_(k+1)> (Pancharatnam, Bargmann), read exactly: the float angle picks
//   j, and B^2 = |B|^2 zeta_18^j is checked in the field, so gamma is an exact multiple of pi/18.
// - The solid angle: the 4 lines through a point q lie in the +1 eigenspace of the phase point A(q), a 2-dim space (the
//   doublet at q). A loop whose lines all pass through one point q (concurrent) is a loop on that doublet's Bloch
//   sphere, where the 4 lines sit on a regular tetrahedron (overlap 1/3 is cos = -1/3). Omega is its signed solid angle
//   (floats).
//
// DERIVED BEFORE THE RUN.
// - The 24 moves fixing q form SL(2,3), the binary tetrahedral group 2T, and act on the doublet as 2T acts on spin-1/2:
//   on the 4 lines through q they make the tetrahedral rotations A4 (12 even permutations, kernel the parity -1). So the
//   rule's links turn a role through q the way rotations turn a spin-1/2, and the Bargmann phase of a geodesic loop on a
//   CP^1 is half its solid angle: a face of the tetrahedron (Omega = pi) gives |gamma| = pi/2, two faces pi, and a loop
//   that encloses nothing 0.
// - The spin-1 value would be gamma = Omega, pi on a face. Read instead with a spin-1 coherent sphere fixed by the
//   overlaps ((1 + cos t)/2)^2 = 1/3, a face is an equilateral triangle of side t, Omega_1 = 1.1675, gamma = Omega_1. Both
//   spin-1 values differ from pi/2.
// - A triangle of lines not through one point leaves every doublet: its phase is not a solid angle. The Heisenberg
//   group of the 9 translations (Weyl's clock and shift) suggests it differs from the concurrent triangle of the same
//   three directions by 2 pi/3 times the symplectic area A of the triangle the lines cut out, one sign for all.
// - Hand check before the run (paper, no code): Z's |0>, X's (1,1,1)/sqrt 3 and (1, w, w)/sqrt 3 give the product
//   i / (3 sqrt 3), gamma = -pi/2; the last moved by X gives gamma = pi/6, which differs by 2 pi/3.
//
// HYPOTHESES AND GATES, fixed before any run, never moved.
// I1 (instrument) Sigma(648) closes at 648 and its lifts are read (216 moves, 3 lifts each); the 12 line projectors are
//    rank one with trace one, exactly; every move's lift carries every line projector to its image line's, exactly
//    (216 x 12).
// I2 at each of the 9 points the 24 moves fixing it make 12 distinct permutations of its 4 lines, all even, with
//    kernel 2 (A4).
// I3 (the loop is made by the rule's group) on each of the 216 ordered face triangles through a point, the lifts of moves
//    fixing q that carry l_a -> l_b -> l_c -> l_a turn l_a's ket back onto its own ray exactly, and the Bargmann phase of
//    the turned kets equals the lines' phase exactly.
// I4 the 4 line states through each point lie in its doublet (weight >= 1 - 1e-12) and their Bloch vectors meet at
//    cos = -1/3 (1e-12).
// C1 (control, a loop that encloses nothing) all 108 back-and-forth loops read gamma = 0 exactly, and every concurrent
//    loop with Omega = 0 mod 4 pi (1e-9) reads gamma = 0 exactly.
// C2 (control, the instrument tells spin-1/2 from spin-1) spin-1/2 coherent states on a regular tetrahedron read
//    |gamma| = pi/2 on each face, spin-1 coherent states pi (1e-12).
// H1 (spin-1/2) every concurrent loop of length 2 to 6 reads gamma = s Omega / 2 mod 2 pi (1e-9), one sign s for all.
// H2 (exact) every loop's phase passes the field check, and every phase is a multiple of pi/6.
// H3 (the discrete limit) on every concurrent face triangle, splitting each edge into k = 2, 4, 8, 16 geodesic steps
//    (floats, in the doublet) leaves gamma unchanged (1e-12): the tetrahedral step already reads the slow-turn value.
// H4 (the flux of the translations) on all 432 ordered triangles not through one point, gamma minus the concurrent
//    triangle's of the same directions at l_0 cut l_1 is s' 2 pi A / 3 mod 2 pi, one sign s' for all, A the symplectic
//    area det(P_1 - P_0, P_2 - P_0) mod 3 of the points P_i = l_i cut l_(i+1).
// P1 (kill for spin-1/2) some face triangle reads |gamma| = pi or |gamma| = Omega_1.
// VERDICT, fixed before the run: fail if I1 to I4, C1 or C2 fails or P1 fires; pass if H1 to H4 hold; partial otherwise.
//
// WHAT THIS CAN AND CANNOT SHOW. It reads the geometric phase of the role's own states under the rule's own link group,
// exactly. It does not run the beat: no vibe moves, the loop is a walk in the group, and the "slow" turn is the slowest
// the finite group allows (overlap 1/3). The solid-angle law is read on loops through one point only, where the states
// share a 2-dim space; other loops carry a phase that no sphere defines.
//
// FIRST RUN 2026-10-27 (test/record/E-QTM-0196/run-2026-10-27.log, 1.2 s): PASS, every gate as registered, none moved,
// run once, no probe before it. I1 to I4, C1, C2 hold (2,592 of 2,592 covariant, every pencil 24 moves, 12 even
// permutations, kernel 2, 216 of 216 face triangles made by lifts and closing exactly). H1: gamma = -Omega/2 mod 2 pi on
// 9,828 of 9,828 concurrent loops (worst 3.6e-15), Omega in {0, pi, 2 pi, 3 pi, 4 pi} giving gamma units 0, 27, 18, 9, 0
// of pi/18; the opposite sign fails (worst pi). Face triangles read |gamma| = pi/2 (units 9 and 27), never pi or
// Omega_1 = 1.1677: spin-1/2, not spin-1 (spin-1 would also read 0, not pi, on the 3,024 loops of Omega = 2 pi). C1: 108 of
// 108 back-and-forth loops and 4,428 of 4,428 loops of Omega = 0 read 0 exactly. H2: all 599,508 loops of length 2 to 6
// exact, every phase a multiple of pi/6. H3: geodesic refinement moves gamma by 8.9e-16 at most. H4: on 432 of 432
// triangles not through one point gamma - gamma_concurrent = +2 pi A/3 (A = 1: +2 pi/3 on 216, A = 2: +4 pi/3 on 216).
//
// DETERMINISM: no random numbers; loops in lexicographic order. Depth L2: exact algebra on the rule's group.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { gridLifts } from '@/code/measure/holonomy-caging'
import { gridMoves } from '@/code/rule/vibe-weave'
import {
  applyMatrix,
  coherentHalf,
  coherentOne,
  conjugateProjector,
  doubletBloch,
  exactPhase,
  floatBargmannPhase,
  geodesicRefine,
  gridLines,
  lineFloatKet,
  lineImage,
  lineKey,
  lineOverlaps,
  lineStates,
  pencilPermutations,
  signedSolidAngle,
  inner,
  type ExactPhase,
  type Vector3,
} from '@/code/measure/role-berry'
import {
  equals,
  keyOf,
  mul,
  sameMatrix,
  type Ninth,
} from '@/code/algebra/ninth-field'

const MAX_LENGTH = 6
const UNIT = Math.PI / 18
const TOL = 1e-9

const mod = (x: number, m: number): number => ((x % m) + m) % m
// the distance of an angle from 0 mod 2 pi
const angleOff = (x: number): number => {
  const y = mod(x, 2 * Math.PI)

  return Math.min(y, 2 * Math.PI - y)
}

export default experiment({
  id: 'quantum/role-berry-phase',
  code: 'E-QTM-0196',
  title:
    "a role turned round a closed loop by the rule's link group Sigma(648) picks up the spin-1/2 geometric phase, pass: the 24 links fixing a point turn the 4 roles through it as the tetrahedral rotations of a spin-1/2 (A4, kernel parity), and on 9,828 of 9,828 loops of length 2 to 6 through one point gamma = -Omega/2 exactly (a tetrahedron face pi/2, never the spin-1 pi or 1.168), loops that enclose nothing read 0 (4,428 of 4,428), geodesic refinement moves nothing (9e-16), and on 432 of 432 triangles not through one point the phase gains +2 pi A/3, the symplectic area's flux of the translations; every phase of 599,508 loops an exact multiple of pi/6",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const moves = gridMoves()
    const lifts = gridLifts()
    const lines = gridLines()
    const states = lineStates(lines)
    const G = lineOverlaps(states)
    const index = new Map(lines.map((l, i) => [lineKey(l.points), i]))
    const parallel = (a: number, b: number): boolean =>
      lines[a]!.direction === lines[b]!.direction

    // ---- I1 ----
    let covariant = 0

    moves.act.forEach((_, m) => {
      const U = lifts.elements[lifts.lifts[m]![0]!]!

      lines.forEach((l, i) => {
        const to = lineImage(moves, m, l, index)

        if (
          to >= 0 &&
          sameMatrix(
            conjugateProjector(U, states[i]!.projector),
            states[to]!.projector,
          )
        ) {
          covariant++
        }
      })
    })

    const I1 =
      lifts.elements.length === 648 &&
      lifts.liftsRead &&
      states.every(s => s.rankOne) &&
      covariant === 216 * 12

    // ---- I2 ----
    const pencils = Array.from({ length: 9 }, (_, q) =>
      pencilPermutations(moves, lines, q),
    )
    const I2 = pencils.every(
      p => p.stabilizer === 24 && p.images === 12 && p.allEven && p.kernel === 2,
    )

    // ---- the doublets ----
    const through = (q: number): number[] =>
      lines.map((l, i) => (l.points.includes(q) ? i : -1)).filter(i => i >= 0)
    const blochOf = new Map<string, Vector3>()

    let inSpace = Infinity
    let tetraOff = 0

    for (let q = 0; q < 9; q++) {
      const pencil = through(q)
      const d = doubletBloch(pencil.map(i => states[i]!))

      inSpace = Math.min(inSpace, d.inSpace)
      pencil.forEach((i, k) => blochOf.set(`${q}:${i}`, d.bloch[k]!))

      for (let a = 0; a < 4; a++) {
        for (let b = a + 1; b < 4; b++) {
          const x = d.bloch[a]!
          const y = d.bloch[b]!

          tetraOff = Math.max(
            tetraOff,
            Math.abs(x[0] * y[0] + x[1] * y[1] + x[2] * y[2] + 1 / 3),
          )
        }
      }
    }

    const I4 = inSpace >= 1 - 1e-12 && tetraOff <= 1e-12
    const commonPoint = (loop: readonly number[]): number => {
      const [a, b] = [loop[0]!, loop[1]!]
      const q = lines[a]!.points.find(p => lines[b]!.points.includes(p))!

      return loop.every(i => lines[i]!.points.includes(q)) ? q : -1
    }

    // ---- every loop ----
    const cache = new Map<string, ExactPhase>()
    const phaseOf = (B: Ninth): ExactPhase => {
      const k = keyOf(B)
      const hit = cache.get(k)

      if (hit) {
        return hit
      }

      const p = exactPhase(B)

      cache.set(k, p)

      return p
    }
    const counts: number[] = Array<number>(MAX_LENGTH + 1).fill(0)
    const concurrentCounts: number[] = Array<number>(MAX_LENGTH + 1).fill(0)

    let allExact = true
    let allSixth = true
    let backForthZero = 0
    let backForth = 0
    let zeroOmega = 0
    let zeroOmegaZero = 0
    let lawPlus = 0
    let lawMinus = 0
    let concurrentTotal = 0
    let worstPlus = 0
    let worstMinus = 0

    const concurrentUnits = new Map<number, number>()
    const otherUnits = new Map<number, number>()
    const omegaTable = new Map<string, number>()

    const visit = (loop: number[], B: Ninth): void => {
      const n = loop.length
      const close = mul(B, G[loop[n - 1]!]![loop[0]!]!)
      const ph = phaseOf(close)

      counts[n]!++
      allExact &&= ph.exact
      allSixth &&= ph.units % 3 === 0

      const gamma = ph.units * UNIT

      if (n === 2) {
        backForth++

        if (ph.units === 0) {
          backForthZero++
        }
      }

      const q = commonPoint(loop)

      if (q < 0) {
        otherUnits.set(ph.units, (otherUnits.get(ph.units) ?? 0) + 1)

        return
      }

      concurrentCounts[n]!++
      concurrentTotal++
      concurrentUnits.set(ph.units, (concurrentUnits.get(ph.units) ?? 0) + 1)

      const omega = signedSolidAngle(loop.map(i => blochOf.get(`${q}:${i}`)!))
      const om4 = angleOff(omega / 2) * 2

      if (om4 < TOL) {
        zeroOmega++

        if (ph.units === 0) {
          zeroOmegaZero++
        }
      }

      const plus = angleOff(gamma - omega / 2)
      const minus = angleOff(gamma + omega / 2)

      worstPlus = Math.max(worstPlus, plus)
      worstMinus = Math.max(worstMinus, minus)

      if (plus < TOL) {
        lawPlus++
      }

      if (minus < TOL) {
        lawMinus++
      }

      const omKey = `${(Math.round((mod(omega, 4 * Math.PI) / Math.PI) * 1000) / 1000).toFixed(3)} pi -> ${ph.units}`

      omegaTable.set(omKey, (omegaTable.get(omKey) ?? 0) + 1)
    }

    const walk = (loop: number[], B: Ninth): void => {
      const n = loop.length

      if (n >= 2 && !parallel(loop[n - 1]!, loop[0]!)) {
        visit(loop, B)
      }

      if (n === MAX_LENGTH) {
        return
      }

      const last = loop[n - 1]!

      for (let next = 0; next < 12; next++) {
        if (parallel(last, next)) {
          continue
        }

        loop.push(next)
        walk(loop, mul(B, G[last]![next]!))
        loop.pop()
      }
    }

    for (let start = 0; start < 12; start++) {
      walk([start], G[start]![start]!)
    }

    // G[start][start] is the norm of the start ket, a positive rational: it does not move the phase

    const sign = lawPlus === concurrentTotal ? 1 : lawMinus === concurrentTotal ? -1 : 0
    const C1 =
      backForth === 108 &&
      backForthZero === 108 &&
      zeroOmega > 0 &&
      zeroOmegaZero === zeroOmega

    // ---- C2: coherent states on a regular tetrahedron ----
    const tetra: Vector3[] = [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ].map(v => v.map(x => x / Math.sqrt(3)) as Vector3)
    const faces = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2],
    ]
    const halfFace = faces.map(f =>
      Math.abs(floatBargmannPhase(f.map(k => coherentHalf(tetra[k]!)))),
    )
    const oneFace = faces.map(f =>
      Math.abs(floatBargmannPhase(f.map(k => coherentOne(tetra[k]!)))),
    )
    const C2 =
      halfFace.every(x => Math.abs(x - Math.PI / 2) < 1e-12) &&
      oneFace.every(x => Math.abs(x - Math.PI) < 1e-12)

    // ---- the face triangles through a point: I3, H3, P1 ----
    const c1 = 2 / Math.sqrt(3) - 1
    const omegaOne =
      2 * Math.atan2(Math.sqrt(1 - 3 * c1 * c1 + 2 * c1 ** 3), 1 + 3 * c1)

    let faceTriangles = 0
    let realized = 0
    let refineWorst = 0
    let spinOneHits = 0

    const faceUnits = new Set<number>()

    const movesFixing = (q: number): number[] =>
      moves.act.map((a, m) => (a[q] === q ? m : -1)).filter(m => m >= 0)

    for (let q = 0; q < 9; q++) {
      const pencil = through(q)
      const fix = movesFixing(q)

      for (const a of pencil) {
        for (const b of pencil) {
          for (const c of pencil) {
            if (a === b || b === c || a === c) {
              continue
            }

            faceTriangles++

            const tri = [a, b, c]
            const ph = phaseOf(mul(mul(G[a]![b]!, G[b]![c]!), G[c]![a]!))

            faceUnits.add(ph.units)

            const gamma = ph.units * UNIT
            const absGamma = Math.min(gamma, 2 * Math.PI - gamma)

            if (
              Math.abs(absGamma - Math.PI) < TOL ||
              Math.abs(absGamma - omegaOne) < TOL
            ) {
              spinOneHits++
            }

            // I3: turn l_a's ket by lifts of moves fixing q
            const kets: Ninth[][] = [states[a]!.ket]

            let ok = true

            for (const [from, to] of [
              [a, b],
              [b, c],
              [c, a],
            ] as const) {
              const m = fix.find(
                mm => lineImage(moves, mm, lines[from]!, index) === to,
              )

              if (m === undefined) {
                ok = false
                break
              }

              kets.push(
                applyMatrix(
                  lifts.elements[lifts.lifts[m]![0]!]!,
                  kets[kets.length - 1]!,
                ),
              )
            }

            if (ok) {
              const back = kets[3]!
              const v = kets[0]!

              for (let i = 0; i < 3 && ok; i++) {
                for (let j = 0; j < 3 && ok; j++) {
                  ok = equals(mul(back[i]!, v[j]!), mul(back[j]!, v[i]!))
                }
              }

              const turned = phaseOf(
                mul(
                  mul(inner(kets[0]!, kets[1]!), inner(kets[1]!, kets[2]!)),
                  inner(kets[2]!, kets[0]!),
                ),
              )

              ok &&= turned.exact && turned.units === ph.units
            }

            if (ok) {
              realized++
            }

            // H3: geodesic refinement
            const fk = tri.map(i => lineFloatKet(states[i]!))

            for (const k of [2, 4, 8, 16]) {
              const path = [0, 1, 2].flatMap(e =>
                geodesicRefine(fk[e]!, fk[(e + 1) % 3]!, k),
              )
              const g = floatBargmannPhase(path)

              refineWorst = Math.max(refineWorst, angleOff(g - gamma))
            }

            refineWorst = Math.max(
              refineWorst,
              angleOff(floatBargmannPhase(fk) - gamma),
            )
          }
        }
      }
    }

    const I3 = faceTriangles === 216 && realized === 216
    const H3 = refineWorst < 1e-12
    const P1 = spinOneHits > 0

    // ---- H4: triangles not through one point ----
    const det = (u: number[], v: number[]): number =>
      mod(u[0]! * v[1]! - u[1]! * v[0]!, 3)
    const xy = (p: number): number[] => [p % 3, Math.floor(p / 3)]
    const meet = (a: number, b: number): number =>
      lines[a]!.points.find(p => lines[b]!.points.includes(p))!
    const lineThrough = (q: number, direction: number): number =>
      lines.findIndex(l => l.direction === direction && l.points.includes(q))
    const fluxBySign: Record<string, number> = { plus: 0, minus: 0 }
    const fluxTable = new Map<string, number>()

    let otherTriangles = 0

    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        for (let c = 0; c < 12; c++) {
          const ds = [a, b, c].map(i => lines[i]!.direction)

          if (new Set(ds).size < 3 || commonPoint([a, b, c]) >= 0) {
            continue
          }

          otherTriangles++

          const P = [meet(a, b), meet(b, c), meet(c, a)].map(xy)
          const A = det(
            [P[1]![0]! - P[0]![0]!, P[1]![1]! - P[0]![1]!],
            [P[2]![0]! - P[0]![0]!, P[2]![1]! - P[0]![1]!],
          )
          const q = meet(a, b)
          const [ca, cb, cc] = ds.map(d => lineThrough(q, d!)) as [
            number,
            number,
            number,
          ]
          const g = phaseOf(mul(mul(G[a]![b]!, G[b]![c]!), G[c]![a]!)).units
          const gc = phaseOf(
            mul(mul(G[ca]![cb]!, G[cb]![cc]!), G[cc]![ca]!),
          ).units
          const diff = mod(g - gc, 36)

          fluxTable.set(
            `A ${A} diff ${diff}`,
            (fluxTable.get(`A ${A} diff ${diff}`) ?? 0) + 1,
          )

          if (diff === mod(12 * A, 36)) {
            fluxBySign.plus!++
          }

          if (diff === mod(-12 * A, 36)) {
            fluxBySign.minus!++
          }
        }
      }
    }

    const H4 =
      otherTriangles === 432 &&
      (fluxBySign.plus === 432 || fluxBySign.minus === 432)
    const H1 = sign !== 0
    const H2 = allExact && allSixth
    const instrument = I1 && I2 && I3 && I4 && C1 && C2
    const status = !instrument || P1 ? 'fail' : H1 && H2 && H3 && H4 ? 'pass' : 'partial'
    const units = (m: Map<number, number>): string =>
      [...m.entries()]
        .sort((x, y) => x[0] - y[0])
        .map(([u, n]) => `${u}:${n}`)
        .join(' ')

    const metrics: Record<string, number> = {
      gate_I1: I1 ? 1 : 0,
      gate_I2: I2 ? 1 : 0,
      gate_I3: I3 ? 1 : 0,
      gate_I4: I4 ? 1 : 0,
      gate_C1: C1 ? 1 : 0,
      gate_C2: C2 ? 1 : 0,
      gate_H1: H1 ? 1 : 0,
      gate_H2: H2 ? 1 : 0,
      gate_H3: H3 ? 1 : 0,
      gate_H4: H4 ? 1 : 0,
      P1: P1 ? 1 : 0,
      sign,
      concurrentLoops: concurrentTotal,
      loops: counts.reduce((s, x) => s + x, 0),
      backForth,
      zeroOmegaLoops: zeroOmega,
      worstLawPlus: worstPlus,
      worstLawMinus: worstMinus,
      refineWorst,
      faceTriangles,
      otherTriangles,
      fluxPlus: fluxBySign.plus!,
      fluxMinus: fluxBySign.minus!,
      omegaOne,
      inSpace,
      tetraOff,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `a role turned round a loop of lines through one point by Sigma(648) reads gamma = ${sign === 0 ? 'no single' : sign > 0 ? '+' : '-'} Omega/2 on ${sign > 0 ? lawPlus : lawMinus} of ${concurrentTotal} loops (lengths 2 to ${MAX_LENGTH}), face triangles |gamma| in units of pi/18 {${[...faceUnits].sort((x, y) => x - y).join(', ')}} (spin-1/2 pi/2, spin-1 would be pi or ${omegaOne.toFixed(4)}); loops that enclose nothing read 0 (${backForthZero} of ${backForth} back-and-forth, ${zeroOmegaZero} of ${zeroOmega} with Omega 0); triangles not through one point differ from the concurrent one by 2 pi A/3 (${fluxBySign.plus} plus, ${fluxBySign.minus} minus of ${otherTriangles})`,
      metrics,
      control: {
        backForthZero,
        zeroOmegaZero,
        spinHalfFace: halfFace[0]!,
        spinOneFace: oneFace[0]!,
      },
      notes: `L2. Gates I1 ${I1} (covariant ${covariant} of 2592), I2 ${I2} (pencils ${pencils.map(p => `${p.stabilizer}/${p.images}/${p.kernel}/${p.allEven}`).join(' ')}), I3 ${I3} (${realized} of ${faceTriangles}), I4 ${I4}, C1 ${C1}, C2 ${C2}, H1 ${H1}, H2 ${H2} (exact ${allExact}, multiples of pi/6 ${allSixth}), H3 ${H3}, H4 ${H4}; P1 ${P1}. Loops by length ${counts.slice(2).join(', ')}, concurrent ${concurrentCounts.slice(2).join(', ')}. Concurrent gamma units (pi/18): ${units(concurrentUnits)}. Other gamma units: ${units(otherUnits)}. Omega -> gamma units: ${[...omegaTable.entries()].sort().map(([k, n]) => `${k} (${n})`).join('; ')}. Flux table: ${[...fluxTable.entries()].sort().map(([k, n]) => `${k}: ${n}`).join('; ')}. Spin-1/2 faces ${halfFace.map(x => x.toFixed(6)).join(' ')}, spin-1 faces ${oneFace.map(x => x.toFixed(6)).join(' ')}. ${metrics.seconds!.toFixed(0)} s.`,
    })
  },
})
