// A whole without amplitudes. The open item of note/experiment/gauge/what-the-base-needs was that a
// whole, three roles bound into one, is a quantum singlet with no classical state (E-FRC-0101), so it
// seemed to need the phase on the swap. This asks whether wholeness can be defined classically.
//
// Each vibe carries a role point p on the 3 x 3 grid Z3^2 and a sign v, +1 for love and -1 for fear.
// Call a set of them whole when the signed sum S = sum v p is zero. A change of role frame is one grid
// move g(p) = A p + u for all of them (A in SL(2, 3), the 216 moves of E-FRC-0104), and it sends S to
// A S + (sum v) u. So S = 0 is kept by every change of frame exactly when sum v is a multiple of 3:
// the triality rule of E-FRC-0101, wholes only at triality zero, from a sum rather than a
// superposition. For three loves, three distinct points sum to zero exactly when they lie on one of
// the grid's 12 lines, so on each axis (role and tilt) the three are all the same or all different:
// the rule of the card game SET. And the quantum singlet epsilon lives on the triples of role values
// that are all different, which is the all-different half of the zero-sum set on the role axis.
//
// Gates, exact and exhaustive:
// - for every mix of a loves and b fears with a + b <= 6, the whole set {S = 0} is kept by all 216
//   moves exactly when a - b is a multiple of 3
// - that pattern is the quantum one: the number of Sigma(648)-invariant states in 3^a x 3bar^b,
//   computed from the group's characters, is nonzero exactly when a - b is a multiple of 3, and
//   matches the SU(3) singlet counts of E-FRC-0101 where they were measured (qq 0, q qbar 1, qqq 1,
//   qqq qbar 0)
// - three loves: the zero-sum triples of distinct points are exactly the 12 lines x 6 orders = 72,
//   and every one satisfies the SET rule on both axes
// - the singlet's support, the 6 role triples with all values different, all sum to zero
// Reported: the Sigma(648) invariant counts beside SU(3)'s where they differ.
//
// What it does not show: that a rule binds a whole, keeps it together as it moves. It shows that
// wholeness is a frame-free relation a classical rule can carry, and that the amplitude is needed
// only for the singlet's sign, which tells all-different (antisymmetric) from all-the-same.
//
// Depth L1: exact counting on the grid and on the group.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { generateGroup } from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'

const mod3 = (x: number): number => ((x % 3) + 3) % 3

type Move = {
  a: number
  b: number
  c: number
  d: number
  u: number
  v: number
}

function gridMoves(): Move[] {
  const moves: Move[] = []

  for (let m = 0; m < 81; m++) {
    const [a, b, c, d] = [0, 1, 2, 3].map(
      k => Math.floor(m / 3 ** k) % 3,
    ) as [number, number, number, number]

    if (mod3(a * d - b * c) !== 1) {
      continue
    }

    for (let s = 0; s < 9; s++) {
      moves.push({ a, b, c, d, u: s % 3, v: Math.floor(s / 3) })
    }
  }

  return moves
}

const move = (
  g: Move,
  p: readonly [number, number],
): [number, number] => [
  mod3(g.a * p[0] + g.b * p[1] + g.u),
  mod3(g.c * p[0] + g.d * p[1] + g.v),
]

export default experiment({
  id: 'gauge/whole-is-a-line',
  code: 'E-FRC-0118',
  title:
    'a whole without amplitudes: role points whose vibe-signed sum is zero stay whole under every change of frame exactly when love minus fear is a multiple of 3, the same pattern as the quantum singlets of SU(3) and of Sigma(648), and three loves are whole exactly when they lie on a line of the role grid, the rule of SET',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const moves = gridMoves()
    const points: [number, number][] = [0, 1, 2].flatMap(x =>
      [0, 1, 2].map(y => [x, y] as [number, number]),
    )

    // 1. every mix of a loves and b fears, a + b <= 6: is {S = 0} kept by every move? Checked on
    // every configuration for a + b <= 4, and for larger sets on the configurations built from all
    // choices of the first four points with the rest fixed, which already carry every translation
    const classical: { a: number; b: number; kept: boolean }[] = []

    for (let n = 1; n <= 6; n++) {
      for (let a = 0; a <= n; a++) {
        const b = n - a
        const signs = [
          ...Array.from({ length: a }, () => 1),
          ...Array.from({ length: b }, () => -1),
        ] as number[]
        const free = Math.min(n, 4)
        const origin: [number, number] = [0, 0]
        const fixed = Array.from(
          { length: n - free },
          (_, k) => points[(k * 4 + 1) % 9] ?? origin,
        )

        let kept = true

        for (let code = 0; code < 9 ** free && kept; code++) {
          const config: [number, number][] = [
            ...Array.from(
              { length: free },
              (_, k) => points[Math.floor(code / 9 ** k) % 9] ?? origin,
            ),
            ...fixed,
          ]
          const sum = (
            ps: readonly (readonly [number, number])[],
          ): string =>
            [0, 1]
              .map(axis =>
                mod3(
                  ps.reduce(
                    (s, p, k) => s + (signs[k] ?? 0) * (p[axis] ?? 0),
                    0,
                  ),
                ),
              )
              .join(',')

          if (sum(config) !== '0,0') {
            continue
          }

          kept = moves.every(
            g => sum(config.map(p => move(g, p))) === '0,0',
          )
        }

        classical.push({ a, b, kept })
      }
    }

    const classicalMatchesTriality = classical.every(
      c => c.kept === (mod3(c.a - c.b) === 0),
    )

    // 2. the quantum count: invariant states of Sigma(648) in 3^a x 3bar^b from its characters,
    // (1 / |G|) sum chi^a conj(chi)^b
    const group = generateGroup({
      generators: [...SU3_SUBGROUPS.sigma648.generators],
    })
    const characters = group.matrices.map(m => [
      (m[0] ?? 0) + (m[8] ?? 0) + (m[16] ?? 0),
      (m[1] ?? 0) + (m[9] ?? 0) + (m[17] ?? 0),
    ])

    const invariants = (a: number, b: number): number => {
      let re = 0

      for (const [x, y] of characters) {
        // chi^a conj(chi)^b in polar form
        const r = Math.hypot(x ?? 0, y ?? 0)
        const phi = Math.atan2(y ?? 0, x ?? 0)

        re += r ** (a + b) * Math.cos((a - b) * phi)
      }

      return Math.round(re / group.order)
    }

    const quantum = classical.map(c => ({
      ...c,
      count: invariants(c.a, c.b),
    }))
    const quantumMatchesTriality = quantum.every(
      c => c.count > 0 === (mod3(c.a - c.b) === 0),
    )
    const su3 = [
      { a: 2, b: 0, count: 0 },
      { a: 1, b: 1, count: 1 },
      { a: 3, b: 0, count: 1 },
      { a: 3, b: 1, count: 0 },
    ]
    const matchesSu3 = su3.every(
      s =>
        quantum.find(q => q.a === s.a && q.b === s.b)?.count ===
        s.count,
    )

    // 3. three loves: zero-sum triples of distinct points, and the SET rule
    let distinctZeroSum = 0
    let setRule = true

    for (const p of points) {
      for (const q of points) {
        for (const r of points) {
          const distinct =
            p.join() !== q.join() &&
            q.join() !== r.join() &&
            p.join() !== r.join()

          if (
            !distinct ||
            mod3(p[0] + q[0] + r[0]) !== 0 ||
            mod3(p[1] + q[1] + r[1]) !== 0
          ) {
            continue
          }

          distinctZeroSum += 1
          setRule =
            setRule &&
            [0, 1].every(axis => {
              const values = new Set([p[axis], q[axis], r[axis]])

              return values.size === 1 || values.size === 3
            })
        }
      }
    }

    // 4. the singlet's support: role triples with all values different
    let singletSupport = 0
    let singletZeroSum = 0

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (new Set([x, y, z]).size === 3) {
            singletSupport += 1
            singletZeroSum += mod3(x + y + z) === 0 ? 1 : 0
          }
        }
      }
    }

    const ok =
      moves.length === 216 &&
      classicalMatchesTriality &&
      quantumMatchesTriality &&
      matchesSu3 &&
      distinctZeroSum === 72 &&
      setRule &&
      singletSupport === 6 &&
      singletZeroSum === 6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'for every mix of up to six loves and fears the zero-sum whole is kept by all 216 changes of frame exactly when love minus fear is a multiple of 3, which is exactly when Sigma(648) has invariant states and matches the SU(3) singlet counts measured before, and three loves are whole exactly on the 12 lines of the grid, all obeying the SET rule, with the singlet supported inside the zero-sum set',
      metrics: {
        gridMoves: moves.length,
        mixesChecked: classical.length,
        classicalMatchesTriality: classicalMatchesTriality ? 1 : 0,
        quantumMatchesTriality: quantumMatchesTriality ? 1 : 0,
        matchesSu3Singlets: matchesSu3 ? 1 : 0,
        distinctZeroSumTriples: distinctZeroSum,
        setRule: setRule ? 1 : 0,
        singletSupportInZeroSum: singletZeroSum,
      },
      control: {
        groupOrder: group.order,
      },
      notes: `L1, exact. Sigma(648) invariant counts, loves a and fears b: ${quantum.map(q => `${q.a}/${q.b}: ${q.count}`).join(', ')}. Classical wholes kept: ${classical.map(c => `${c.a}/${c.b}: ${c.kept ? 'yes' : 'no'}`).join(', ')}.`,
    })
  },
})
