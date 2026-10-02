// HOW MANY SPECIES OF ONE HAND DOES ONE ORIENTATION CLASS CARRY? (E-FRC-0285). The route "count the tastes" (roadmap
// routes/matter-forces-numbers.md, G · chirality without fermion doubling): the two classes of E-FRC-0274 are a Kogut-
// Susskind staggered split; count the species per class at k = 0 and the doublers at the zone corners, by an exact band
// count on a side-4 box. Kill: more than one species of a hand per class.
//
// WHAT IS RUN. E-FRC-0274 found that each class runs a label rule: on the class that starts on e = +1 docks the
// orientation-reading mass is [S(u+, u-)], [D(u-, u+)] (half + meets u+ then conj(u-), half - meets u- then conj(u+)),
// on the other class its mirror, and that each class's band is the flat cycle's (its gate F). So a class's species are
// the band minima of that cycle over the D4 zone. This file counts them (u+ = ringUnit(-1, 4), u- = ringUnit(2, 2),
// E-FRC-0258's pair): exactly from the closed form of the Clifford hop, on the side-4 box (128 momenta), on side 6 and on
// side 12 (where every zero lies), and on the side-4 box again from the cycle's own levels for both classes and both
// halves.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE BAND (E-SPN-0160, E-FRC-0274 item 5). On each half the moving levels solve l^2 - (a + b + (a - 1)(b - 1) mu) l +
//    a b = 0 with mu = |s(K)|^2 / 4, s(K) = sum_r r sin(K . r) / sqrt 288, the naive lattice Dirac hop on the D4 roots
//    (E-SPN-0180's covariant Clifford hop in the trivial field). The rest level of a half is the root at mu = 0, so a
//    half has a species at every zero of s, all of one mass: the lightest level sits at mu = 0 and nowhere else.
// 2. THE ZEROS, EXACTLY. Summing the 24 roots r = +-e_i +- e_j, s_i = (4 / sqrt 288) sin K_i sum_{j != i} cos K_j. So
//    s = 0 needs, for each i, sin K_i = 0 or sum_{j != i} cos K_j = 0. Cases: (a) every K_i in {0, pi}: 16 points; (b) no
//    sin zero: all cos equal and 3 cos = 0, every K_i = +-pi/2: 16; (c) one K_i = 0 or pi (cos eps) and the other three
//    with cos = -eps / 2, so +-2 pi/3 or +-pi/3: 4 x 2 x 8 = 64; (d) two with cos of opposite sign 1 and -1 and two at
//    +-pi/2: 6 x 2 x 4 = 48 (two with cos equal, or three, is impossible: an odd sum of +-1 is not 0). 144 points in
//    [-pi, pi)^4; the D4 zone identifies K with K + pi (1, 1, 1, 1), which maps each case onto itself, so 72 species per
//    half per class, all isolated, 8 of them at the zone corners (k = 0 and 7 corner doublers). Each is a nondegenerate
//    Dirac point: the Jacobian of s is diagonal at (a) with entries eps_i (sum of three eps), odd, never 0, and at (b) is
//    -(sigma sigma^T - diag) with eigenvalues 3, -1, -1, -1 up to sign; (c), (d) checked in the run. By Nielsen and
//    Ninomiya the signs of the Jacobian determinants (the species' chiralities) sum to 0: 36 and 36. PREDICTED.
// 3. ON THE SIDE-4 BOX the momenta are multiples of pi/2, so cases (a), (b), (d) appear and (c) does not: (16 + 16 + 48)
//    / 2 = 40 species per half per class among the 128 momenta (1 at k = 0, 7 at the other corners, 8 of type (b), 24 of
//    type (d)), the box's 160 = 40 x 4 zeros of mu read by E-FRC-0284's probe. On side 6 (multiples of pi/3): (a) and (c),
//    (16 + 64) / 2 = 40. On side 12 all four: 72. On the husk slice K = (q, 0) of E-SPN-0167, read only: 28 (8 at the
//    cubic corners, Kogut and Susskind's 2^3, and 20 more).
// 4. WHY THE CLASS DOES NOT STAGGER. Kogut and Susskind's sign thins the naive fermion by spin-diagonalizing it: one
//    component a site, so 2^d doublers become 2^(d/2) tastes. E-FRC-0274's sign is a pure-gauge checkerboard on the true
//    mesh (holonomy +1 on every loop) and leaves each class running the full 192-mode label rule, so it removes no mode
//    and no doubler. PREDICTED: the route's hypothesis fails and its kill fires, by 72 to 1 in the zone and 40 to 1 on
//    the box.
//
// PROBES BEFORE THE GATES, disclosed. tmp/tt-probe1.log (float zeros of the closed form): 40 zeros on sides 4, 6 and 8,
//  72 on sides 12 and 24, 8 at the corners each time, every |det| at least 1 in units of (4 / sqrt 288)^4 (none
//  degenerate); Jacobian signs 4 + / 36 - on sides 4 and 8, 36 + / 4 - on side 6, 36 / 36 on 12 and 24; husk slice 20 on
//  side 4, 28 on sides 12 and 24 (8 corners). tmp/tt-probe2.log: on six box momenta the class A cycle's 8 moving levels
//  per half match the law to 6.8e-15, sit 4 + 4 at the rest roots at the zeros (0, 0, 0, 0) and (0, 0, pi, 0) and
//  0.07 to 0.46 from them elsewhere; 0.2 s per half. tmp/tt-smoke.log: the exact counters of this file alone (no cycle):
//  box 40 = (a) 8 + (b) 8 + (d) 24, side 6 40 = (a) 8 + (c) 32, side 12 72, 8 corners each, signs as the float probe, 0
//  degenerate; husk slice 20 and 28; the Wilson-shifted hop 1 and 1. No gate was set after the gate run.
//
// HYPOTHESES AND GATES, fixed before the gate run.
//  I1 INSTRUMENT: at all 128 box momenta, for both class rules and both halves, the cycle has exactly 8 moving levels per
//     half and they match the two roots of item 1 at mu = |s(K)|^2 / 4 within 1e-10, 4 on each.
//  C1 CONTROL (the counter can read one species): the same exact zero counter on a Wilson-shifted hop, mu_W = |s|^2 / 4
//     + w^2 with w = sum_r (1 - cos K . r) / 48 (zero only on the reciprocal lattice), finds exactly 1 zero on the side-4
//     box and 1 on side 12; and the cycle-level counter reads a nonzero distance (at least 1e-3) from the rest roots at
//     every box momentum with mu > 0.
//  D1 DERIVED, EXACT (integers on the box, Z[sqrt 3] on sides 6 and 12): zeros of s on the box 40, split (a) 8, (b) 8,
//     (d) 24 by type, 8 at the corners; side 6: 40; side 12: 72, 8 at the corners; every zero nondegenerate (Jacobian
//     determinant nonzero, exactly), signs 36 + and 36 - on side 12. The cycle count on the box: the levels of each half
//     sit 4 + 4 at the rest roots (1e-10) at exactly the 40 zero momenta, for both classes and both halves.
//  H1 THE ROUTE'S HYPOTHESIS: one species of a hand per class, that is, a half of a class reaches its rest level at one
//     momentum of the zone only. Predicted to FAIL.
//  P1 FALSIFIER (the route's kill): a half of a class reaches its rest level at more than one momentum of the box.
// READ, gating nothing: the husk slice count on sides 4 and 12, with corners and signs.
// VERDICT: fail (the route dies, as derived) if P1 fires with I1 and C1 holding; pass if H1 holds with I1 and C1;
// partial otherwise (an instrument or control miss, or D1 missing with P1 undecided).
//
// WHAT THIS CAN AND CANNOT SHOW. It counts the band minima of the class rule in momentum space on the flat D4 box, the
// reading E-FRC-0274's gate F used for a class; it cannot read momentum on the true hyperbolic mesh, where the classes
// live, and it reads one member with no link field. A species here is a band minimum of one register half at the rest
// level; each is a massive Dirac point carrying 4 + 4 levels. It does not say whether a piece the rule does not yet have
// (a Wilson term, E-SPN-0168's mixers on one half, an overlap operator) removes the doublers, only that the class split
// does not.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { torus } from '@/code/measure/register-sea'
import { densePiece, type Unit } from '@/code/measure/cusp-register'
import {
  chiralSchedules,
  conjUnit,
  halfBandEigenvalues,
  jordanRoots,
  matchEigenvalues,
} from '@/code/measure/orientation-taste'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { cycleMatrix } from '@/code/measure/swap-cone'
import {
  REGISTER_ROOTS,
  structureVector,
} from '@/code/measure/spinor-register'
import { volumeRight } from '@/code/measure/chiral-register'

const PLUS: readonly [number, number] = [-1, 4]
const MINUS: readonly [number, number] = [2, 2]
const LAW = 1e-10
const APART = 1e-3

const flag = (b: boolean): number => (b ? 1 : 0)

// ---- Z[sqrt 3]: [a, b] = a + b sqrt 3, integers ----
type Q3 = readonly [number, number]

const add = (x: Q3, y: Q3): Q3 => [x[0] + y[0], x[1] + y[1]]
const mul = (x: Q3, y: Q3): Q3 => [x[0] * y[0] + 3 * x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const neg = (x: Q3): Q3 => [-x[0], -x[1]]
const isZero = (x: Q3): boolean => x[0] === 0 && x[1] === 0
// the exact sign of a + b sqrt 3
const sign3 = (x: Q3): number => {
  const [a, b] = x

  if (a >= 0 && b >= 0) {
    return a === 0 && b === 0 ? 0 : 1
  }

  if (a <= 0 && b <= 0) {
    return -1
  }

  const d = a * a - 3 * b * b

  return a > 0 ? Math.sign(d) : -Math.sign(d)
}

// 2 cos(2 pi x / L) for L dividing 12, in Z[sqrt 3]
const TWO_COS_12: readonly Q3[] = [
  [2, 0],
  [0, 1],
  [1, 0],
  [0, 0],
  [-1, 0],
  [0, -1],
  [-2, 0],
  [0, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [0, 1],
]

// 2 cos(2 pi m / 12) for m in twelfths of a turn
const twoCos12 = (m: number): Q3 => TWO_COS_12[((m % 12) + 12) % 12]!
const twelfths = (x: number, L: number): number => {
  if (12 % L !== 0) {
    throw new Error(`staggered-tastes: side ${L} does not divide 12`)
  }

  return (x * 12) / L
}
const twoCos = (x: number, L: number): Q3 => twoCos12(twelfths(x, L))
// sin a = cos(a - quarter turn)
const twoSin = (x: number, L: number): Q3 => twoCos12(twelfths(x, L) - 3)

const det = (m: readonly (readonly Q3[])[]): Q3 => {
  if (m.length === 1) {
    return m[0]![0]!
  }

  let s: Q3 = [0, 0]

  m[0]!.forEach((v, j) => {
    const minor = det(m.slice(1).map(r => r.filter((_, k) => k !== j)))
    const term = mul(v, minor)

    s = add(s, j % 2 === 0 ? term : neg(term))
  })

  return s
}

type Zero = { x: number[]; type: string; corner: boolean; detSign: number }

// the exact zeros of s on the side-L grid, one per D4 class (x and x + L/2 (1, 1, 1, 1) identified, so the
// representatives with x_4 < L/2, as code/measure/register-sea's torus takes them); dims 4, or 3 for the husk slice
// K = (q, 0), where no identification applies
export function exactZeros(L: number, slice: boolean): Zero[] {
  const out: Zero[] = []
  const n = 4

  for (let a = 0; a < L; a++) {
    for (let b = 0; b < L; b++) {
      for (let c = 0; c < L; c++) {
        for (let d = 0; d < (slice ? 1 : L / 2); d++) {
          const x = [a, b, c, d]
          const C = x.map(y => twoCos(y, L))
          const S = x.map(y => twoSin(y, L))
          const sumOthers = (i: number): Q3 =>
            C.reduce<Q3>((acc, v, k) => (k === i ? acc : add(acc, v)), [0, 0])
          const zero = [0, 1, 2, 3].every(
            i => isZero(S[i]!) || isZero(sumOthers(i)),
          )

          if (!zero) {
            continue
          }

          // 4 x the Jacobian of sin K_i sum cos K_j, in Z[sqrt 3]
          const dims = slice ? 3 : n
          const Jm = Array.from({ length: dims }, (_, i) =>
            Array.from({ length: dims }, (__, j) =>
              i === j ? mul(C[i]!, sumOthers(i)) : neg(mul(S[i]!, S[j]!)),
            ),
          )
          const sinZero = S.filter(isZero).length
          const quarter = x.filter(y => (4 * y) % L === 0 && (2 * y) % L !== 0).length
          const type =
            sinZero === 4
              ? 'a'
              : sinZero === 0
                ? 'b'
                : sinZero === 1
                  ? 'c'
                  : quarter === 2
                    ? 'd'
                    : '?'

          out.push({
            x,
            type,
            corner: x.every(y => (2 * y) % L === 0),
            detSign: sign3(det(Jm)),
          })
        }
      }
    }
  }

  return out
}

// the Wilson-shifted control: mu_W = |s|^2 / 4 + w^2 is zero iff s = 0 and w = sum_r (1 - cos K . r) = 0; w is zero iff
// every cos K . r = 1; exactly: 2 cos(K_i +- K_j) = (2 cos K_i 2 cos K_j -+ 2 sin K_i 2 sin K_j) / 2
export function wilsonZeros(L: number): number {
  let count = 0

  for (let a = 0; a < L; a++) {
    for (let b = 0; b < L; b++) {
      for (let c = 0; c < L; c++) {
        for (let d = 0; d < L / 2; d++) {
          const x = [a, b, c, d]
          const C = x.map(y => twoCos(y, L))
          const S = x.map(y => twoSin(y, L))
          const sZero = [0, 1, 2, 3].every(
            i =>
              isZero(S[i]!) ||
              isZero(C.reduce<Q3>((acc, v, k) => (k === i ? acc : add(acc, v)), [0, 0])),
          )

          let wZero = true

          for (let i = 0; i < 4 && wZero; i++) {
            for (let j = i + 1; j < 4 && wZero; j++) {
              const cc = mul(C[i]!, C[j]!)
              const ss = mul(S[i]!, S[j]!)

              // 4 cos(K_i + K_j) = cc - ss and 4 cos(K_i - K_j) = cc + ss must both be 4
              wZero =
                isZero(add(add(cc, neg(ss)), [-4, 0])) &&
                isZero(add(add(cc, ss), [-4, 0]))
            }
          }

          if (sZero && wZero) {
            count++
          }
        }
      }
    }
  }

  return count
}

export default experiment({
  id: 'gauge/staggered-tastes',
  code: 'E-FRC-0285',
  title:
    'the species one orientation class carries, counted on the side-4 box and the D4 zone (pending the gate run)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return tastesRun()
  },
})

export function tastesRun(): Verdict {
  const started = Date.now()
  const aP = unitAngle(ringUnit(PLUS[0], PLUS[1]))
  const aM = unitAngle(ringUnit(MINUS[0], MINUS[1]))
  const plus: Unit = [Math.cos(aP), Math.sin(aP)]
  const minus: Unit = [Math.cos(aM), Math.sin(aM)]
  const sch = chiralSchedules(plus, minus)
  const J = volumeRight()
  const t = torus(4)

  // ---- D1: the exact zeros ----
  const box = exactZeros(4, false)
  const six = exactZeros(6, false)
  const twelve = exactZeros(12, false)
  const huskBox = exactZeros(4, true)
  const husk12 = exactZeros(12, true)
  const byType = (z: Zero[], ty: string): number => z.filter(q => q.type === ty).length
  const signs = (z: Zero[]): [number, number, number] => [
    z.filter(q => q.detSign > 0).length,
    z.filter(q => q.detSign < 0).length,
    z.filter(q => q.detSign === 0).length,
  ]
  const zeroKeys = new Set(box.map(q => q.x.join(',')))

  // ---- I1 and the cycle count, both classes, both halves ----
  const classes: { name: string; specs: typeof sch.geometricEven; ab: [[Unit, Unit], [Unit, Unit]] }[] = [
    { name: 'A', specs: sch.geometricEven, ab: [[plus, conjUnit(minus)], [minus, conjUnit(plus)]] },
    { name: 'B', specs: sch.geometricOdd, ab: [[minus, conjUnit(plus)], [plus, conjUnit(minus)]] },
  ]

  let lawWorst = 0
  let lawCounts = true
  let levelsEight = true
  let restWorstAtZeros = 0
  let leastApart = Infinity

  const species: { cls: string; half: number; count: number; matchesExact: boolean; corners: number }[] = []

  for (const cl of classes) {
    const dense = cl.specs.map(p => densePiece(p[0]!))
    const found: { half: number; keys: string[] }[] = [
      { half: 1, keys: [] },
      { half: -1, keys: [] },
    ]

    for (const K of t.momenta) {
      const U = cycleMatrix(dense, REGISTER_ROOTS, K)
      const mu = structureVector(K).reduce((q, x) => q + x * x, 0) / 4
      const xKey = K.map(k => Math.round((k * 4) / (2 * Math.PI))).join(',')

      for (const sign of [1, -1] as const) {
        const ev = halfBandEigenvalues(U, J, sign)
        const ab = sign > 0 ? cl.ab[0] : cl.ab[1]
        const law = matchEigenvalues(ev, jordanRoots(ab[0], ab[1], mu), LAW)
        const rest = matchEigenvalues(ev, jordanRoots(ab[0], ab[1], 0), LAW)

        levelsEight &&= ev.length === 8
        lawWorst = Math.max(lawWorst, law.worst)
        lawCounts &&= law.counts.every(c => c === 4)

        if (rest.worst <= LAW && rest.counts.every(c => c === 4)) {
          found.find(f => f.half === sign)!.keys.push(xKey)
          restWorstAtZeros = Math.max(restWorstAtZeros, rest.worst)
        } else if (mu > 0) {
          leastApart = Math.min(leastApart, rest.worst)
        }
      }
    }

    for (const f of found) {
      const set = new Set(f.keys)

      species.push({
        cls: cl.name,
        half: f.half,
        count: f.keys.length,
        matchesExact:
          set.size === zeroKeys.size && [...zeroKeys].every(k => set.has(k)),
        corners: f.keys.filter(k => k.split(',').every(y => Number(y) % 2 === 0)).length,
      })
    }
  }

  // ---- C1: the Wilson control ----
  const wilsonBox = wilsonZeros(4)
  const wilson12 = wilsonZeros(12)

  // ---- gates ----
  const I1 = levelsEight && lawWorst <= LAW && lawCounts
  const C1 = wilsonBox === 1 && wilson12 === 1 && leastApart >= APART
  const [s12p, s12m, s12z] = signs(twelve)
  const D1 =
    box.length === 40 &&
    byType(box, 'a') === 8 &&
    byType(box, 'b') === 8 &&
    byType(box, 'd') === 24 &&
    box.filter(q => q.corner).length === 8 &&
    six.length === 40 &&
    twelve.length === 72 &&
    twelve.filter(q => q.corner).length === 8 &&
    [box, six, twelve].every(z => z.every(q => q.detSign !== 0 && q.type !== '?')) &&
    s12p === 36 &&
    s12m === 36 &&
    species.every(s => s.count === 40 && s.matchesExact)
  const H1 = species.every(s => s.count === 1) && twelve.length === 1
  const P1 = species.some(s => s.count > 1)
  const status: Verdict['status'] =
    P1 && I1 && C1 ? 'fail' : H1 && I1 && C1 ? 'pass' : 'partial'
  const [sbp, sbm] = signs(box)
  const [s6p, s6m] = signs(six)
  const [hbp, hbm] = signs(huskBox)
  const [h12p, h12m] = signs(husk12)
  const speciesLine = species
    .map(s => `class ${s.cls} half ${s.half > 0 ? '+' : '-'}: ${s.count} (corners ${s.corners}, the exact zero set ${s.matchesExact})`)
    .join('; ')

  return verdict({
    status,
    claim: `I1 ${I1} (8 moving levels per half at all 128 momenta ${levelsEight}, law worst ${lawWorst.toExponential(2)}); C1 ${C1} (Wilson-shifted hop zeros: box ${wilsonBox}, side 12 ${wilson12}; least distance from the rest roots where mu > 0: ${leastApart.toExponential(3)}); D1 ${D1} (exact zeros of the Clifford hop: box ${box.length} = (a) ${byType(box, 'a')} + (b) ${byType(box, 'b')} + (d) ${byType(box, 'd')}, ${box.filter(q => q.corner).length} at the corners, signs ${sbp} + / ${sbm} -; side 6 ${six.length} (signs ${s6p} / ${s6m}); side 12 ${twelve.length} = (a) ${byType(twelve, 'a')} + (b) ${byType(twelve, 'b')} + (c) ${byType(twelve, 'c')} + (d) ${byType(twelve, 'd')}, ${twelve.filter(q => q.corner).length} at the corners, signs ${s12p} + / ${s12m} - / ${s12z} degenerate; cycle count ${speciesLine}); H1 ${H1}; P1 ${P1} (more than one species of a hand per class); read: husk slice side 4 ${huskBox.length} (corners ${huskBox.filter(q => q.corner).length}, signs ${hbp} / ${hbm}), side 12 ${husk12.length} (corners ${husk12.filter(q => q.corner).length}, signs ${h12p} / ${h12m})`,
    metrics: {
      I1: flag(I1),
      C1: flag(C1),
      D1: flag(D1),
      H1: flag(H1),
      P1: flag(P1),
      boxZeros: box.length,
      boxCorners: box.filter(q => q.corner).length,
      side6Zeros: six.length,
      zoneZeros: twelve.length,
      zoneCorners: twelve.filter(q => q.corner).length,
      zonePlus: s12p,
      zoneMinus: s12m,
      zoneDegenerate: s12z,
      boxPlus: sbp,
      boxMinus: sbm,
      speciesPerHalfMin: Math.min(...species.map(s => s.count)),
      speciesPerHalfMax: Math.max(...species.map(s => s.count)),
      lawWorst,
      restWorstAtZeros,
      leastApart,
      wilsonBox,
      wilson12,
      huskBox: huskBox.length,
      huskZone: husk12.length,
      seconds: (Date.now() - started) / 1000,
    },
    control: { wilsonBox, wilson12, leastApart },
    notes: `L1 (exact zero counts in integers and Z[sqrt 3]) with an L2 read of the cycle's levels. Units u+ ringUnit(${PLUS.join(', ')}), u- ringUnit(${MINUS.join(', ')}); class A half + (u+, conj u-), half - (u-, conj u+), class B mirrored. Box zeros (integer coordinates, K = pi x / 2): ${box.map(q => `${q.x.join('')}${q.type}${q.detSign > 0 ? '+' : '-'}`).join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
