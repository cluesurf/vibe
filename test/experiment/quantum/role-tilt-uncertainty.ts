// Entropic uncertainty for role and tilt: H(role) + H(tilt) >= log 3 on every state the knit reaches, and
// whether the knit saturates it.
//
// A token's role is the line of the role family its point lies on (floor(p / 3)), its tilt the line of the
// tilt family (p mod 3). The two families' basis states are mutually unbiased (any two families of grid
// lines are), so for any positive state of one qutrit Maassen and Uffink (1988) give
//   H(role) + H(tilt) >= log 3,
// and Berta et al. (2010) sharpen it with the von Neumann entropy of the state, >= log 3 + S(rho), and with
// the partner token B as a quantum memory, H(role | B) + H(tilt | B) >= log 3 + S(A | B), which a maximally
// entangled pair meets at 0 >= 0 (Shannon entropies in nats).
//
// A knot's single-token marginal is a weight on 9 points; role and tilt are its line sums. A weight that is
// not a positive state can break the bound: a classical point (weight 1 at one grid point, the point a
// closed token holds) has H(role) = H(tilt) = 0. That is the control.
//
// States: the six Bell histories (code/measure/knot-histories) from all 144 line-product starts at every
// beat, both tokens, and the three other pairs of families beside role and tilt.
//
// Gates, fixed before the first run:
//   G1 H(role) + H(tilt) >= log 3 - 1e-12 on every token of every state.
//   G2 >= log 3 + S(rho) - 1e-9 on every token (S from the token's 3 x 3 density).
//   G3 with memory: H(role | B) + H(tilt | B) >= log 3 + S(A | B) - 1e-9 for the first token of every state
//      of the experiments' own starts.
//   G4 the other five pairs of families obey the same bound as G1.
//   G5 control: the classical point violates G1 (0 < log 3).
// Reported: the smallest excess over log 3 after the first meeting, how many token states meet the bound
// within 1e-12 (saturate), and which states they are (stabilizer states: a line of one family has H = 0 on
// it and log 3 on every other family, so every product line start saturates at beat 0).
//
// Size, set 2026-09-26 before the first run under the speed rules: 120 beats (every history's first two
// meetings fall by beat 21) rather than 480, 6 x 144 x 121 = 104,544 whole states.
// Prediction, written then: G1 to G5 pass, since E-QTM-0112's first run found every knot on these
// histories positive, and the bound is a theorem for positive states; saturation after the first meeting
// is rare, since a meeting that makes a fear leaves the stabilizer states, the only ones that saturate.
//
// FIRST RUN (2026-09-26, 10.5 s): pass, G1 to G5. 209,088 token states, 0 violations of log 3, of log 3 + S
// (worst excess -6e-15, rounding) or on the other five family pairs; 726 memory checks, 0 violations
// (worst -1.3e-14). The saturation prediction was WRONG: 16,311 token states meet log 3 exactly, 9,555 of
// them after the first meeting, 4.6 percent, not rare. Only a pure token on a line of the role or the tilt
// family meets log 3 (H = 0 on one, log 3 on the other), so these are tokens a meeting left in a product
// line state (a meeting fixes every joint point with equal roles) and the Clifford links then carried onto
// a role or tilt line; which starts they are was not recorded. With the partner as memory the smallest
// left side is exactly 0: on the maximally entangled readings (Schmidt 1/3, 1/3, 1/3, E-QTM-0112) the
// partner predicts role and tilt both, the uncertainty vanishes, and the Berta bound
// log 3 + S(A|B) = log 3 - log 3 = 0 is met with equality.
//
// Depth L1 for the bound (a theorem, checked on the knit's states) and L2 for what the knit does with it.
// Substrate-independent: role-grid numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type Whole } from '@/code/rule/fear-weave'
import { advanceKnot, bellHistories, lineKnot, physicalKnot } from '@/code/measure/knot-histories'
import { gridLines, hermitianValues } from '@/code/measure/bell-gates'
import { phasePointOperators, type Operator } from '@/code/measure/grid-weights'
import { roleDensity } from '@/code/measure/role-bell'

const BEATS = 120
const LOG3 = Math.log(3)

const shannon = (p: readonly number[]): number => -p.reduce((s, x) => (x > 1e-300 ? s + x * Math.log(x) : s), 0)
const vonNeumann = (values: readonly number[]): number => shannon(values.map(v => Math.max(0, v)))

// a family's outcome distribution from a token's 9-point marginal
function familyDistribution(marginal: readonly number[], family: readonly (readonly number[])[]): number[] {
  return family.map(line => line.reduce((s, p) => s + (marginal[p] ?? 0), 0))
}

// the 3 x 3 density of one token from its 9-point marginal
function tokenDensity(marginal: readonly number[]): Operator {
  const points = phasePointOperators(1)
  const rho: Operator = { n: 3, re: new Float64Array(9), im: new Float64Array(9) }

  marginal.forEach((w, x) => {
    const a = points[x]!

    for (let k = 0; k < 9; k++) {
      rho.re[k] = (rho.re[k] ?? 0) + w * (a.re[k] ?? 0)
      rho.im[k] = (rho.im[k] ?? 0) + w * (a.im[k] ?? 0)
    }
  })

  return rho
}

// H(X | B) for the first token measured in a family, the second kept quantum:
// S(sum_x |x><x| (x) rho_B|x) - S(rho_B), with rho_B|x the partner's sub-normalized state on outcome x
function conditionalEntropy(weight: readonly number[], family: readonly (readonly number[])[]): number {
  const points = phasePointOperators(1)
  const partner = (restrict: (x: number) => boolean): number[] => {
    const m = new Array<number>(9).fill(0)

    for (let x = 0; x < 9; x++) {
      if (!restrict(x)) {
        continue
      }

      for (let y = 0; y < 9; y++) {
        m[y] = (m[y] ?? 0) + (weight[x * 9 + y] ?? 0)
      }
    }

    return m
  }
  const densityOf = (m: readonly number[]): Operator => {
    const rho: Operator = { n: 3, re: new Float64Array(9), im: new Float64Array(9) }

    m.forEach((w, y) => {
      const a = points[y]!

      for (let k = 0; k < 9; k++) {
        rho.re[k] = (rho.re[k] ?? 0) + w * (a.re[k] ?? 0)
        rho.im[k] = (rho.im[k] ?? 0) + w * (a.im[k] ?? 0)
      }
    })

    return rho
  }
  const joint = family.flatMap(line => hermitianValues(densityOf(partner(x => line.includes(x)))))
  const b = hermitianValues(densityOf(partner(() => true)))

  return vonNeumann(joint) - vonNeumann(b)
}

export default experiment({
  id: 'quantum/role-tilt-uncertainty',
  code: 'E-QTM-0115',
  title:
    'entropic uncertainty for role and tilt on every state the six Bell histories reach: H(role) + H(tilt) >= log 3, and >= log 3 + S, hold on every token, with the partner as memory the bound falls to log 3 + S(A|B) and holds, the knit saturates it only on stabilizer states, and a classical grid point breaks it',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const histories = bellHistories(BEATS)
    const { lines, families } = gridLines()
    const roleFamily = families.findIndex(f => f.every(l => l.every(p => Math.floor(p / 3) === Math.floor((l[0] ?? 0) / 3))))
    const tiltFamily = families.findIndex(f => f.every(l => l.every(p => p % 3 === (l[0] ?? 0) % 3)))
    const role = families[roleFamily] ?? []
    const tilt = families[tiltFamily] ?? []
    let tokens = 0
    let g1 = 0
    let g2 = 0
    let g4 = 0
    let saturating = 0
    let saturatingAfterMeeting = 0
    let minExcessAfterMeeting = Number.POSITIVE_INFINITY
    let minSharpExcess = Number.POSITIVE_INFINITY
    let memoryChecks = 0
    let memoryViolations = 0
    let memoryMinExcess = Number.POSITIVE_INFINITY
    let memoryMinLeft = Number.POSITIVE_INFINITY

    for (const h of histories) {
      const first = h.records.findIndex(r => r.meetings.length > 0)

      for (const a of lines) {
        for (const b of lines) {
          const own = a.every(p => Math.floor(p / 3) === h.start[0]) && b.every(p => Math.floor(p / 3) === h.start[1])
          let w: Whole = lineKnot(h.tokens, a, b)

          for (let t = -1; t < BEATS; t++) {
            if (t >= 0) {
              w = advanceKnot(h, w, h.records[t]!)
            }

            const p = physicalKnot(h, w)
            const units = Number(p.weight.reduce((s, x) => s + x, 0n))
            const weight = p.weight.map(x => Number(x) / units)

            for (const side of [0, 1] as const) {
              const m = new Array<number>(9).fill(0)

              weight.forEach((x, i) => {
                const q = side === 0 ? Math.floor(i / 9) : i % 9

                m[q] = (m[q] ?? 0) + x
              })

              const sum = shannon(familyDistribution(m, role)) + shannon(familyDistribution(m, tilt))
              const s = vonNeumann(hermitianValues(tokenDensity(m)))

              tokens++
              g1 += sum >= LOG3 - 1e-12 ? 0 : 1
              g2 += sum >= LOG3 + s - 1e-9 ? 0 : 1
              minSharpExcess = Math.min(minSharpExcess, sum - LOG3 - s)

              if (Math.abs(sum - LOG3) < 1e-12) {
                saturating++
                saturatingAfterMeeting += t > first ? 1 : 0
              }

              if (t > first) {
                minExcessAfterMeeting = Math.min(minExcessAfterMeeting, sum - LOG3)
              }

              for (let i = 0; i < families.length; i++) {
                for (let j = i + 1; j < families.length; j++) {
                  if ((i === roleFamily && j === tiltFamily) || (j === roleFamily && i === tiltFamily)) {
                    continue
                  }

                  const other = shannon(familyDistribution(m, families[i] ?? [])) + shannon(familyDistribution(m, families[j] ?? []))

                  g4 += other >= LOG3 - 1e-12 ? 0 : 1
                }
              }
            }

            // with the partner as quantum memory, own starts only
            if (own) {
              const rho = roleDensity(p)
              const joint = vonNeumann(hermitianValues(rho))
              const partnerMarginal = new Array<number>(9).fill(0)

              weight.forEach((x, i) => {
                partnerMarginal[i % 9] = (partnerMarginal[i % 9] ?? 0) + x
              })

              const sB = vonNeumann(hermitianValues(tokenDensity(partnerMarginal)))
              const left = conditionalEntropy(weight, role) + conditionalEntropy(weight, tilt)
              const right = LOG3 + joint - sB

              memoryChecks++
              memoryViolations += left >= right - 1e-9 ? 0 : 1
              memoryMinExcess = Math.min(memoryMinExcess, left - right)
              memoryMinLeft = Math.min(memoryMinLeft, left)
            }
          }
        }
      }
    }

    // the control: a classical grid point
    const point = new Array<number>(9).fill(0)

    point[4] = 1

    const controlSum = shannon(familyDistribution(point, role)) + shannon(familyDistribution(point, tilt))
    const gates = {
      G1: tokens > 0 && g1 === 0,
      G2: g2 === 0,
      G3: memoryChecks > 0 && memoryViolations === 0,
      G4: g4 === 0,
      G5: controlSum < LOG3 - 1e-9,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on every token of every state the six Bell histories reach from all 144 line-product starts, H(role) + H(tilt) is at least log 3 and at least log 3 + S, the other five pairs of grid families obey the same bound, and with the partner as memory the sum is at least log 3 + S(A|B); a classical grid point reads 0 + 0',
      metrics: {
        tokenStates: tokens,
        violationsMaassenUffink: g1,
        violationsWithEntropy: g2,
        violationsOtherFamilies: g4,
        saturatingTokenStates: saturating,
        saturatingAfterFirstMeeting: saturatingAfterMeeting,
        minExcessOverLog3AfterFirstMeeting: minExcessAfterMeeting,
        minExcessOverLog3PlusS: minSharpExcess,
        memoryChecks,
        memoryViolations,
        memoryMinExcess,
        memoryMinLeftSide: memoryMinLeft,
        log3: LOG3,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: { classicalPointRoleTilt: controlSum },
      notes:
        'Shannon entropies of exact knot shares in nats; von Neumann entropies from floating-point eigenvalues. The bound is a theorem for positive states (E-QTM-0112 measures positivity on these histories), so G1 to G4 are L1 checks that the knit\'s states are states; the saturation counts are what the knit does. The control shows the bound is not a property of a weight array.',
    })
  },
})
