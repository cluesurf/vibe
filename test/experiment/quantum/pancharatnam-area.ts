// The discrete Pancharatnam phase on the role: the Bargmann invariant of three stabilizer states against the
// symplectic area of their triangle in the role's 3 x 3 phase space (E-QTM-0168).
//
// The ledger row "Berry and geometric phase" is a stand-in (E-GMT-0036 frame holonomy, E-QTM-0094 a
// hand-written walk). The routes map (routes/quantum-relativity-light-computation.md, A, Berry and geometric
// phase, first route "the discrete Pancharatnam phase") asks for a geometric phase with no slow turning: the
// phase of the Bargmann invariant B(a, b, c) = <a|b><b|c><c|a> = tr(P_a P_b P_c), on the role's stabilizer
// states, against the area of the triangle they span in the 3 x 3 phase space that the role's 9 points are
// (E-FND-0160, E-QTM-0117). Its kill: stabilizer triples whose phase does not follow the area.
//
// WHAT IS RUN. The 12 stabilizer states of one role, built exactly as the images of |0> under the 216 Clifford
// elements of code/measure/eisenstein-words (E-QTM-0117's closure of X, Z, S, F), every amplitude in
// Z[omega] / 3^k. Each state's line in phase space is read from its discrete Wigner function in the package's
// own phase-point operators (code/measure/qutrit-phase-space): the 3 points where W = 1/3. Every one of the
// 12^3 = 1,728 ordered triples has B computed exactly in Z[omega] over a power of 3. For three lines with
// pairwise different directions, the vertices are the pairwise meeting points p = a ^ b, q = b ^ c, r = c ^ a,
// the area A = 2 [q - p, r - p] mod 3 (2 = 1/2 mod 3, [u, v] = u0 v1 - u1 v0), and the orientation of the three
// directions chi = [d_a, d_b] [d_b, d_c] [d_c, d_a] mod 3, read as +1 or -1 (unchanged by rescaling any
// direction, reversed by swapping two lines). Then the knit's reached states: the 144 products of two roles'
// stabilizer states, each also after one like meeting (the swap phase U) and after one love-fear meeting (the
// singlet phase V), deduplicated up to a unit, and the Bargmann invariant of every unordered triple, exact in
// Z[omega][1/6].
//
// DERIVED BEFORE THE GATE RUN.
//   1. Degenerate triples. Two distinct states of one basis are orthogonal, so B = 0. If two of the three
//      states are equal, B = |<a|c>|^2, which is 1 or 1/3 (mutually unbiased bases) or 0.
//   2. Generic triples (three different directions, 4 * 3 * 2 * 27 = 648 ordered triples). |B| = 3^(-3/2).
//      The Clifford group mod phases is ASL(2, 3) acting on the lines (E-QTM-0117) and B is invariant under any
//      unitary, so B is a function of the ASL(2, 3) orbit. SL(2, 3) keeps [ , ], so chi and A are orbit
//      invariants. Given chi, the lines are either concurrent (A = 0) or form a triangle, and in Z_3 a
//      non-degenerate triangle's area is +-1 with its sign fixed by the order of its edge directions, so the
//      expected orbits are 4: (chi = +-1) x (concurrent, triangle), sizes 108, 216, 108, 216 (a concurrent
//      triple is fixed by the point reflection about its meeting point, an element of order 2).
//   3. Consequence, stated plainly: Clifford covariance alone forces B to depend on position only through
//      orbit data, so "the phase follows the area" has content only in the VALUES: that the ratio of a
//      triangle's B to a concurrent triple's B at the same orientation is omega^A, and what the concurrent
//      value is. Since sqrt(-3) = 1 + 2 omega = i sqrt 3, a generic B is 3^(-3/2) times a twelfth root of
//      unity exactly when 9 B is a unit times (1 + 2 omega) or a unit (an element of Z[omega]).
//
// PROBES BEFORE THE GATES (disclosed). tmp/qa-probe.ts, floats, once: the 12 states each have a 3-point line,
// and the 648 generic triples split as (chi +1, A 0) 108, (chi +1, A 2) 216, (chi -1, A 0) 108, (chi -1, A 1)
// 216, with phases pi/2, -pi/6, -pi/2, pi/6, i.e. B = 3^(-3/2) i chi omega^A on all 648. So the literal reading
// of the route, "the phase IS omega^A", fails on every concurrent triple (phase +-i, not 1): the area enters
// with an orientation factor i chi, the discrete counterpart of the Maslov index that a triple of Lagrangian
// planes carries in the continuous Bargmann invariant (Mukunda and Simon 1993). The gates below are fixed
// after this probe and say so. The reached-state part, the orbit count and the controls were not probed.
//
// HYPOTHESES AND GATES, fixed before the gate run:
//   I1 instrument: 12 distinct states, each exactly of norm 1; each Wigner function is 1/3 on 3 collinear
//      points and 0 elsewhere (to 1e-12); the 12 lines are the 12 affine lines of Z_3^2; |<a|b>|^2 is exactly 0
//      within a basis and 1/3 across; the Clifford action on the 12 states (exact) splits the 648 generic
//      ordered triples into exactly 4 orbits of sizes 108, 108, 216, 216, and chi and A are constant on each
//   C1 control, the instrument reads the other outcome: (a) a non-stabilizer role state, the strange state
//      (|1> - |2>) / sqrt 2, has a Wigner function with a negative value and no line, and among the triples
//      (a, b, strange) with a, b stabilizer states of different bases at least one B is not 3^(-3/2) i chi'
//      omega^k for any k (chi' = +-1); (b) the same 648 generic triples scored against the wrong area
//      A' = [q - p, r - p] (the 1/2 dropped, so A' = -A) fail the formula on all 432 triangles and pass on all
//      216 concurrent ones
//   H1 the route's hypothesis, in the form the probe left: on every generic triple, exactly in Z[omega],
//        9 B = chi (1 + 2 omega) omega^A,   i.e.   B = 3^(-3/2) i chi omega^A,
//      and on every degenerate triple B = 0 or |<a|c>|^2 as in derivation 1. The Pancharatnam phase is then
//      pi/2 chi + 2 pi A / 3: an orientation sign times the area count
//   P1 falsifier: any of the 1,728 triples off H1 (the route's kill as written)
//   H2 reported prediction for the reached states: every triple of products alone has B on the twelve-point
//      ladder (a rational times a twelfth root of unity, closed under products), and at least one triple
//      holding a met (U or V) state has a phase off it, so the area count stops at the stabilizer states
// VERDICT: fail if I1 or C1 fails or P1 is met; pass if H1 and H2 hold; partial if H1 holds and H2 does not.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show that the rule's role carries an exact discrete geometric phase on
// its stabilizer states that is the symplectic area of the triangle times 2 pi / 3 plus an orientation sign,
// with no slow turning and no path, and that this needs the role's 9 points to be the phase space of the
// Wigner function. It cannot show that the rule's beats ever carry a role through such a triple of
// projections (no history of the knit is run here), and it is known mathematics (Bargmann 1964, Samuel and
// Bhandari 1988, Mukunda and Simon 1993; the qutrit area law is the Weyl-Heisenberg triangle phase), checked
// on the model's own objects. A Berry phase of a slowly turned role is a different row and is not read.
//
// FIRST RUN 2026-10-02 (tmp/qa-run1.log, 0.8 s): PASS, every gate as fixed. I1: 12 states of norm 1, 12
// distinct lines (Wigner error 7e-17), overlaps exact, 4 orbits of sizes 108, 108, 216, 216 with chi and A
// constant on each. H1: 648 of 648 generic triples at 9 B = chi (1 + 2 omega) omega^A, exactly, and 1,080 of
// 1,080 degenerate triples at 0 or |<a|c>|^2; P1 not met. C1: the strange state has W = -1/3 and no line, and
// 60 of its 108 triples leave the i chi' omega^k phases; with the 1/2 dropped from the area, 0 of 432 triangles
// and 216 of 216 concurrent triples pass. H2: 396 reached states (144 products, 132 new after U, 120 new after
// V); 0 of 487,344 product triples off the twelve-point ladder, 2,795,956 of 9,784,236 triples holding a met
// state off it (3,559,890 of them zero). The area count holds on the stabilizer states only.
//
// DETERMINISM: everything enumerated, nothing random. Depth L1: exact algebra and counts.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  applySingletPhase,
  applySwapPhase,
  cliffordGroup,
  eisConj,
  eisMul,
  eisValue,
  productState,
  stabilizerStates,
  stateKey,
  UNITS,
  type Eis,
  type Mat3,
  type State9,
} from '@/code/measure/eisenstein-words'
import {
  PHASE_POINTS,
  wignerFunction,
} from '@/code/measure/qutrit-phase-space'

type Col = { num: Eis[]; den3: number }
type Point = [number, number]

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const add = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
const isZero = (x: Eis): boolean => x[0] === 0 && x[1] === 0
const same = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]
const scale = (x: Eis, k: number): Eis => [x[0] * k, x[1] * k]
const OMEGA_POW: Eis[] = [
  [1, 0],
  [0, 1],
  [-1, -1],
]
const SQRT_M3: Eis = [1, 2]

// a Z[omega] value is on the twelve-point ladder (a rational times a twelfth root of unity) exactly when it is
// a rational times one of 1, omega, omega^2, (1 + 2 omega), (1 + 2 omega) omega, (1 + 2 omega) omega^2
function onLadder(x: Eis): boolean {
  const [a, b] = x

  return (
    b === 0 ||
    a === 0 ||
    a === b ||
    b === 2 * a ||
    a === 2 * b ||
    a === -b
  )
}

// sum conj(x_k) y_k over the shared length
function inner(x: readonly Eis[], y: readonly Eis[]): Eis {
  let s: Eis = [0, 0]

  x.forEach((v, k) => {
    s = add(s, eisMul(eisConj(v), y[k]!))
  })

  return s
}

function colKey(c: Col): string {
  return UNITS.map(
    u =>
      `${c.den3}|${c.num.map(x => eisMul(x, u).join(',')).join(';')}`,
  ).sort()[0]!
}

function applyMat(g: Mat3, c: Col): Col {
  let num: Eis[] = [0, 1, 2].map(i =>
    [0, 1, 2].reduce<Eis>(
      (s, k) => add(s, eisMul(g.num[3 * i + k]!, c.num[k]!)),
      [0, 0],
    ),
  )
  let den3 = g.den3 + c.den3

  while (den3 > 0 && num.every(x => x[0] % 3 === 0 && x[1] % 3 === 0)) {
    num = num.map(x => [x[0] / 3, x[1] / 3])
    den3--
  }

  return { num, den3 }
}

function floatVector(
  num: readonly Eis[],
  s: number,
): {
  re: number[]
  im: number[]
} {
  const v = num.map(x => eisValue(x, s))

  return { re: v.map(z => z[0]), im: v.map(z => z[1]) }
}

const sym = (u: Point, v: Point): number =>
  mod3(u[0] * v[1] - u[1] * v[0])
const sub = (u: Point, v: Point): Point => [
  mod3(u[0] - v[0]),
  mod3(u[1] - v[1]),
]
const sign = (x: number): number => (mod3(x) === 1 ? 1 : -1)

export default experiment({
  id: 'quantum/pancharatnam-area',
  code: 'E-QTM-0168',
  title:
    "the discrete Pancharatnam phase on the role is the symplectic area count with an orientation sign, pass: on all 648 ordered triples of stabilizer states with three different directions the Bargmann invariant is exactly 3^(-3/2) i chi omega^A, A the area of the triangle of their lines in the role's 9-point phase space and chi = +-1 the orientation of the directions, so concurrent triples read +-i and the literal omega^A fails on them; the 1,080 degenerate triples give 0 or |<a|c>|^2; Clifford covariance leaves 4 orbits, so the content is the ratio omega^A; the strange state and a wrong area are read as off the law; after one like or love-fear meeting 2,795,956 of 9,784,236 reached-state triples leave the twelve-point ladder, so the area count stops at the stabilizer states",
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const group = cliffordGroup()
    const states: Col[] = stabilizerStates(group)
    const n = states.length

    // I1: norms, lines, overlaps
    const norms = states.map(c => {
      const s = inner(c.num, c.num)

      return s[1] === 0 && s[0] === 9 ** c.den3
    })
    const wigners = states.map(c =>
      wignerFunction(floatVector(c.num, 3 ** c.den3)),
    )

    let wignerError = 0

    const lines: Point[][] = wigners.map(w => {
      const pts: Point[] = []

      w.forEach((v, i) => {
        const near = Math.abs(v - 1 / 3) < 1e-9

        wignerError = Math.max(
          wignerError,
          near ? Math.abs(v - 1 / 3) : Math.abs(v),
        )

        if (near) {
          pts.push(PHASE_POINTS[i]! as Point)
        }
      })

      return pts
    })
    const isLine = (l: Point[]): boolean =>
      l.length === 3 &&
      sym(sub(l[1]!, l[0]!), sub(l[2]!, l[0]!)) === 0 &&
      !(l[1]![0] === l[0]![0] && l[1]![1] === l[0]![1])
    const linesOk = lines.every(isLine)
    const lineKeys = new Set(
      lines.map(l =>
        l
          .map(p => 3 * p[0] + p[1])
          .sort((x, y) => x - y)
          .join(','),
      ),
    )
    const dirOf = (l: Point[]): Point => sub(l[1]!, l[0]!)
    const dirs = lines.map(dirOf)
    const parallel = (i: number, j: number): boolean =>
      sym(dirs[i]!, dirs[j]!) === 0
    const meet = (i: number, j: number): Point =>
      lines[i]!.find(p =>
        lines[j]!.some(q => q[0] === p[0] && q[1] === p[1]),
      )!

    // exact overlaps: gram[i][j] = <i|j> * 3^(den_i + den_j)
    const gram: Eis[][] = states.map(a =>
      states.map(b => inner(a.num, b.num)),
    )

    let overlapsOk = true

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const g = gram[i]![j]!
        const nrm = eisMul(g, eisConj(g))
        const den = 9 ** (states[i]!.den3 + states[j]!.den3)
        const want = i === j ? den : parallel(i, j) ? 0 : den / 3

        if (nrm[1] !== 0 || nrm[0] !== want) {
          overlapsOk = false
        }
      }
    }

    // the Clifford action on the 12 states, exactly
    const keyIndex = new Map(states.map((c, i) => [colKey(c), i]))
    const actions = group.map(g =>
      states.map(c => {
        const k = keyIndex.get(colKey(applyMat(g, c)))

        if (k === undefined) {
          throw new Error('a Clifford image is not a stabilizer state')
        }

        return k
      }),
    )

    // B(a, b, c) exactly: 9 B = num9 / 3^den, returned as [num9, den]
    const bargmann = (
      a: number,
      b: number,
      c: number,
    ): [Eis, number] => {
      const num = eisMul(
        eisMul(gram[a]![b]!, gram[b]![c]!),
        gram[c]![a]!,
      )
      const den =
        2 * (states[a]!.den3 + states[b]!.den3 + states[c]!.den3)

      return [scale(num, 9), den]
    }

    const equalScaled = (x: [Eis, number], y: Eis): boolean =>
      same(x[0], scale(y, 3 ** x[1]))

    let generic = 0
    let degenerate = 0
    let h1Generic = 0
    let h1Degenerate = 0
    let wrongAreaPassTriangle = 0
    let wrongAreaPassConcurrent = 0
    let triangles = 0

    const classes = new Map<string, number>()
    const triples: [number, number, number][] = []

    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        for (let c = 0; c < n; c++) {
          const bv = bargmann(a, b, c)

          if (parallel(a, b) || parallel(b, c) || parallel(c, a)) {
            degenerate++

            // derivation 1
            let want: Eis

            if (a === b || b === c || c === a) {
              const [x, y] =
                a === b ? [a, c] : b === c ? [b, a] : [c, b]
              const g = gram[x]![y]!
              const nrm = eisMul(g, eisConj(g))
              // 9 |<x|y>|^2 at the same 3-power as bv
              const den = 9 ** (states[x]!.den3 + states[y]!.den3)

              want = [0, 0]

              if (!isZero(nrm)) {
                want = [(9 * nrm[0]) / den, 0]
              }
            } else {
              want = [0, 0]
            }

            if (equalScaled(bv, want)) {
              h1Degenerate++
            }

            continue
          }

          generic++
          triples.push([a, b, c])

          const p = meet(a, b)
          const q = meet(b, c)
          const r = meet(c, a)
          const area = mod3(2 * sym(sub(q, p), sub(r, p)))
          const wrongArea = sym(sub(q, p), sub(r, p))
          const chi = sign(
            sym(dirs[a]!, dirs[b]!) *
              sym(dirs[b]!, dirs[c]!) *
              sym(dirs[c]!, dirs[a]!),
          )
          const predicted = scale(
            eisMul(SQRT_M3, OMEGA_POW[area]!),
            chi,
          )
          const wrong = scale(
            eisMul(SQRT_M3, OMEGA_POW[wrongArea]!),
            chi,
          )
          const key = `chi ${chi > 0 ? '+1' : '-1'}, A ${area}`

          classes.set(key, (classes.get(key) ?? 0) + 1)

          if (equalScaled(bv, predicted)) {
            h1Generic++
          }

          if (area !== 0) {
            triangles++
          }

          if (equalScaled(bv, wrong)) {
            if (area === 0) {
              wrongAreaPassConcurrent++
            } else {
              wrongAreaPassTriangle++
            }
          }
        }
      }
    }

    // orbits of the generic ordered triples under the Clifford action
    const tripleKey = (t: readonly number[]): number =>
      144 * t[0]! + 12 * t[1]! + t[2]!
    const genericSet = new Set(triples.map(tripleKey))
    const orbitOf = new Map<number, number>()
    const orbitSizes: number[] = []

    let invariantsConstant = true

    const invariant = (t: readonly number[]): string => {
      const [a, b, c] = t as [number, number, number]
      const p = meet(a, b)
      const q = meet(b, c)
      const r = meet(c, a)

      return `${sign(sym(dirs[a]!, dirs[b]!) * sym(dirs[b]!, dirs[c]!) * sym(dirs[c]!, dirs[a]!))},${mod3(2 * sym(sub(q, p), sub(r, p)))}`
    }

    for (const t of triples) {
      const k = tripleKey(t)

      if (orbitOf.has(k)) {
        continue
      }

      const id = orbitSizes.length
      const seen = new Set<number>()
      const inv = invariant(t)

      for (const act of actions) {
        const image = [act[t[0]]!, act[t[1]]!, act[t[2]]!]
        const ik = tripleKey(image)

        if (!genericSet.has(ik)) {
          throw new Error(
            'a Clifford image of a generic triple is degenerate',
          )
        }

        if (invariant(image) !== inv) {
          invariantsConstant = false
        }

        seen.add(ik)
        orbitOf.set(ik, id)
      }

      orbitSizes.push(seen.size)
    }

    const sortedSizes = [...orbitSizes].sort((x, y) => x - y)
    const i1 =
      n === 12 &&
      norms.every(Boolean) &&
      linesOk &&
      lineKeys.size === 12 &&
      wignerError < 1e-12 &&
      overlapsOk &&
      generic === 648 &&
      sortedSizes.join(',') === '108,108,216,216' &&
      invariantsConstant

    // C1a: the strange state (|1> - |2>) / sqrt 2, B * 2 * 3^(den_a + den_b) exactly
    const strange: Eis[] = [
      [0, 0],
      [1, 0],
      [-1, 0],
    ]
    const strangeWigner = wignerFunction(
      floatVector(strange, Math.SQRT2),
    )
    const strangeMin = Math.min(...strangeWigner)
    const strangeLine = strangeWigner.filter(
      v => Math.abs(v - 1 / 3) < 1e-9,
    ).length

    let strangeTriples = 0
    let strangeOff = 0

    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        if (parallel(a, b)) {
          continue
        }

        strangeTriples++

        // <a|b><b|s><s|a> times 3^(da + db) * 3^db * 3^da * 2; on the law it would be a unit times
        // sqrt(-3) with |B| = 3^(-3/2): test the phase only, through the ladder of i omega^k values
        const x = eisMul(
          eisMul(gram[a]![b]!, inner(states[b]!.num, strange)),
          inner(strange, states[a]!.num),
        )
        // phase i chi' omega^k means x is a rational times (1 + 2 omega) omega^k: a ratio b/a in {2, 1/2, -1}
        const onLaw =
          !isZero(x) &&
          (x[1] === 2 * x[0] || x[0] === 2 * x[1] || x[0] === -x[1])

        if (!onLaw) {
          strangeOff++
        }
      }
    }

    const c1a = strangeMin < -1e-9 && strangeLine < 3 && strangeOff > 0
    const c1b =
      wrongAreaPassTriangle === 0 &&
      wrongAreaPassConcurrent === 216 &&
      triangles === 432
    const c1 = c1a && c1b

    const h1 = h1Generic === 648 && h1Degenerate === degenerate
    const p1 = !h1

    // the reached states: products, after one like meeting U, after one love-fear meeting V
    const products: State9[] = []

    for (const x of states) {
      for (const y of states) {
        products.push(productState(x, y))
      }
    }

    const reached = new Map<string, { s: State9; kind: 0 | 1 | 2 }>()

    for (const p of products) {
      reached.set(stateKey(p), { s: p, kind: 0 })
    }

    for (const [kind, f] of [
      [1, applySwapPhase],
      [2, applySingletPhase],
    ] as const) {
      for (const p of products) {
        const s = f(p)
        const k = stateKey(s)

        if (!reached.has(k)) {
          reached.set(k, { s, kind })
        }
      }
    }

    const list = [...reached.values()]
    const m = list.length
    const rg: Eis[][] = list.map(x =>
      list.map(y => inner(x.s.num, y.s.num)),
    )

    let productTriples = 0
    let productOff = 0
    let metTriples = 0
    let metOff = 0
    let metZero = 0

    for (let i = 0; i < m; i++) {
      for (let j = i + 1; j < m; j++) {
        const gij = rg[i]![j]!

        if (isZero(gij)) {
          for (let k = j + 1; k < m; k++) {
            if (list[i]!.kind + list[j]!.kind + list[k]!.kind === 0) {
              productTriples++
            } else {
              metTriples++
              metZero++
            }
          }

          continue
        }

        for (let k = j + 1; k < m; k++) {
          const x = eisMul(eisMul(gij, rg[j]![k]!), rg[k]![i]!)
          const allProducts =
            list[i]!.kind + list[j]!.kind + list[k]!.kind === 0

          if (allProducts) {
            productTriples++

            if (!isZero(x) && !onLadder(x)) {
              productOff++
            }
          } else {
            metTriples++

            if (isZero(x)) {
              metZero++
            } else if (!onLadder(x)) {
              metOff++
            }
          }
        }
      }
    }

    const h2 = productOff === 0 && metOff > 0
    const status = !i1 || !c1 || p1 ? 'fail' : h2 ? 'pass' : 'partial'
    const classText = [...classes.entries()]
      .sort()
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ')

    return verdict({
      status,
      claim: h1
        ? `on all 648 ordered triples of the role's stabilizer states with three different directions the Bargmann invariant is exactly 3^(-3/2) i chi omega^A, A the symplectic area of the triangle of their lines in the role's 9-point phase space and chi = +-1 the orientation of the three directions (${classText}), and the 1,080 degenerate triples give 0 or |<a|c>|^2; the phase is the area count plus an orientation sign, not omega^A alone (concurrent triples read +-i); among the knit's reached states (${m}: products, after one like or love-fear meeting) ${productOff} of ${productTriples} product triples and ${metOff} of ${metTriples} triples with a met state have a phase off the twelve-point ladder`
        : `the Bargmann invariant leaves the area formula on ${648 - h1Generic} generic and ${degenerate - h1Degenerate} degenerate triples`,
      metrics: {
        stabilizerStates: n,
        orderedTriples: n * n * n,
        genericTriples: generic,
        degenerateTriples: degenerate,
        genericOnFormula: h1Generic,
        degenerateOnFormula: h1Degenerate,
        triangles,
        orbits: orbitSizes.length,
        reachedStates: m,
        productTriples,
        productTriplesOffLadder: productOff,
        metTriples,
        metTriplesZero: metZero,
        metTriplesOffLadder: metOff,
      },
      control: {
        instrument: i1 ? 1 : 0,
        wignerError,
        strangeWignerMin: strangeMin,
        strangeTriples,
        strangeTriplesOffLaw: strangeOff,
        wrongAreaPassTriangles: wrongAreaPassTriangle,
        wrongAreaPassConcurrent: wrongAreaPassConcurrent,
      },
      notes: `L1. Orbit sizes ${sortedSizes.join(', ')}. Classes (chi, A): ${classText}. Reached states by kind: ${[0, 1, 2].map(k => list.filter(x => x.kind === k).length).join(', ')} (products, new after U, new after V). Known mathematics (Bargmann 1964, Samuel and Bhandari 1988, Mukunda and Simon 1993) on the model's own objects; no knit history carries a role through these projections here.`,
    })
  },
})
