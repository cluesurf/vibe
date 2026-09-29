// WHICH COIN A LINE OF THE LOCKED KNIT ALLOWS (E-SPN-0090): the decisive question for the electron's mass. Under the
// doublet lock a line's first slot is e0 (copied +r), its second e1 (copied -r), and the role's scalar line o rests.
// A vibe has a mass only if its position carries amplitude, which needs a coin mixing e0 and e1. E-RLT-0097 ruled out
// the lazy coin with Schur (a husk line's units act irreducibly on the doublet), and E-SPN-0088 found the knit's lone
// love has no coin. Here the group is COMPUTED, not assumed: every symmetry the knit keeps, as it acts on a line's
// slot space V_l = (e0, e1, o), and the commutant each leaves.
//
// THE THEOREM (derived before the run, each clause gated below).
// (1) Every symmetry of the knit except one acts on a line's two slots by PERMUTATION: W(F4) permutes slots (the line
//     stabilizer keeps r or swaps r and -r), the comoving role frame moves points and never slots, charge
//     conjugation under C is the identity on labels (under C' the swap), and motion reversal is the swap with a
//     conjugation. A permutation representation of {e0, e1} always fixes e0 + e1, so the doublet is REDUCIBLE:
//     1 (+) sign, and o is a second trivial summand. Schur then allows, on V_l, every M = a P+ + b P- (+) c on o, plus
//     a mixing of e0 + e1 with o. Keeping the lock (nothing writes o) leaves exactly alpha P+ + beta P-, P+- the
//     projectors on e0 +- e1, which mixes e0 and e1 whenever alpha != beta. So W(F4), the frames, C and T ALLOW a mass.
// (2) The one symmetry that does not act by permutation is the lattice momentum P = sum of the vibes' roots. The knit
//     keeps it exactly (the stream keeps slots, the collision fixes P on every occupation, the meeting moves points,
//     the pair move trades zero momentum), so e^(i p . P) is a symmetry for every p, with generator diag(1, -1, 0) on
//     V_l. With it the doublet is irreducible (the stabilizer's swap plus the diagonal phases are the O(2) doublet)
//     and the only covariant coin is a scalar on the doublet. So THE MASS IS FORBIDDEN BY MOMENTUM CONSERVATION AND BY
//     NOTHING ELSE. E-RLT-0097's Schur premise is right, but on the knit it is carried by the momentum U(1), not by the
//     W(F4) units; the stand-in's spin units carry it through their half-turn phases diag(-i, i), which on a line is
//     exactly a momentum phase (p . r = -pi / 2). The same U(1) forbids the lazy coin (o holds momentum 0).
// (3) The integer coins: alpha, beta units of Z[w] (six), up to the overall phase six classes, alpha / beta = e^(i theta)
//     with theta a multiple of pi / 3. All are unitary with 2C in Z[w], all are T-symmetric (X conj(C) X = C^-1, since
//     C = c I + d X), all commute with the swap. theta = 0 is the old knit (massless). theta = pi is the pure swap, a
//     permutation (classical) with a flat band: it reverses a vibe every beat, and nothing travels. theta = +-pi/3 and
//     +-2 pi/3 are massive and travel, and have no classical sector (every entry nonzero): cos E = cos(theta/2) cos k
//     about the band's middle, rest gap |theta|, curvature cot(|theta|/2), top speed cos(theta/2). theta = -2 pi/3 is
//     the stand-in token's 2C (gap 2 pi/3, top speed exactly 1/2, E-FRC-0247's number).
// (4) On a whole dock (24 slots, one vibe): W(F4)'s commutant has dimension = its orbitals on slot pairs, one per inner
//     product 2, 1, 0, -1, -2. The lock-keeping ones (each slot into its own line) are I and R (inner 2 and -2), so the
//     family of (1) is the whole lock-keeping covariant dock coin. With the momentum only I is left: dimension 1.
//
// GATES, fixed before the first run.
//  H1 W(F4) closes at 1,152 elements; each of the 12 lines has a stabilizer of 96, 48 keeping r and 48 reversing it
//  H2 without the momentum: on every line the commutant of {stabilizer, frame (identity), C (identity), C' (swap), R
//     (swap)} on V_l has dimension 5, some element mixes e0 and e1, some mixes the doublet with o; restricted to
//     lock-keeping elements (no o entries) the dimension is 3 and includes the swap
//  H3 with the momentum generator: dimension 2 on every line, and no element mixes e0 and e1 or touches o off the
//     diagonal (the doublet is irreducible, the lazy coin gone)
//  H4 the lone-bounce collision keeps P on all 2^24 dock occupations (0 broken)
//  H5 the dock: Burnside's count = 5 = the number of orbitals, with inner products {2, 1, 0, -1, -2}; the one-line
//     orbitals are exactly inner 2 and -2 (so lock-keeping = span(I, R)); with the momentum (diagonal) 1 remains
//  H6 the six integer classes: all unitary (2C 2C^dag = 4 exactly), all T-symmetric, all commute with the swap,
//     exactly one commutes with the momentum (theta = 0), five mix, of which one is classical (theta = pi) and four
//     are not
//  H7 the bands (measurement, 1e-6): theta = 0 gap 0; |theta| = pi/3 gap pi/3, curvature sqrt 3, top speed sqrt 3/2;
//     |theta| = 2 pi/3 gap 2 pi/3, curvature 1/sqrt 3, top speed 1/2; theta = pi gap pi, curvature 0, top speed 0
//  H8 the comparison: the stand-in's spin units keeping each husk axis twirl the doublet swap to 0 (under 1e-12):
//     irreducible, as E-RLT-0097 L9 used; the knit's slot action keeps the swap (H2)
//  Verdict: pass if H1 to H8 hold.
//
// PREDICTIONS: all pass (the theorem). The answer to the decisive question is therefore YES under every discrete
// symmetry the knit keeps, at the price of exact lattice-momentum conservation. E-SPN-0091 puts theta = -2 pi/3 (the
// stand-in's coin, no new number) into the knit and measures what the price costs.
//
// FIRST RUN (3.9 s, tmp/spn90-exp1.log): pass, every gate as predicted, no gate moved. 1,152 elements, stabilizers of
// 96 (48 + 48) on all 12 lines; commutant 5 / lock-keeping 3 / with the momentum 2 on every line; 9,724,864 of the
// 16,777,216 occupations move a slot and 0 change P; dock orbitals 24, 192, 144, 192, 24 pairs at inner products 2,
// 1, 0, -1, -2; bands within 4.6e-7 of the closed forms; the spin units twirl the swap to exactly 0.
//
// Depth L1: exhaustive and exact (group closure, rational elimination, Eisenstein arithmetic, 2^24 occupations); the
// band numbers of H7 and the twirl of H8 are floats (measurement). Bulk identities of the rule: they hold on every
// husk column by being identities of the dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  bandReading,
  coinClasses,
  collisionKeepsMomentum,
  commutant,
  dockOrbitals,
  IDENTITY3,
  labelMatrix,
  lineGroups,
  mixesDoublet,
  mixesRest,
  MOMENTUM,
  spinTwirlOfSwap,
  SWAP,
  weylF4,
} from '@/code/measure/covariant-coin'

export default experiment({
  id: 'spin/covariant-coin-theorem',
  code: 'E-SPN-0090',
  title:
    "which coin a line of the doublet-locked knit allows: every symmetry the knit keeps, computed on a line's slot space (e0, e1, o), acts by permutation except the lattice momentum, so the doublet is reducible (1 + sign) under W(F4)'s line stabilizer, the comoving frame, C and T, and a coin alpha P+ + beta P- mixing e0 and e1 is covariant, integer in Z[w] and T-symmetric; the momentum U(1) alone makes the doublet irreducible and forbids it, so a mass costs exact lattice-momentum conservation and nothing else",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const group = weylF4()
    const lines = lineGroups(group)

    // ---- H1 ----
    const h1 =
      group.length === 1152 &&
      lines.length === 12 &&
      lines.every(
        l => l.order === 96 && l.keep === 48 && l.reverse === 48,
      )

    // ---- H2, H3 ----
    const perLine = lines.map(lg => {
      const mats = [
        ...new Map(
          lg.elements.map(g => {
            const m = labelMatrix(g, lg)

            return [JSON.stringify(m), m] as const
          }),
        ).values(),
      ]
      // the frame and C act as the identity, C' and R as the swap
      const discrete = [...mats, IDENTITY3, SWAP]
      const without = commutant(discrete, 3)
      const lockKeeping = without.basis.filter(m => !mixesRest(m))
      // the lock-keeping sub-commutant: the commutant of the group together with the projector onto the doublet
      const doubletProjector = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ]
      const keeping = commutant([...discrete, doubletProjector], 3)
      const withMomentum = commutant([...discrete, MOMENTUM], 3)

      return {
        line: lg.line,
        images: mats.length,
        dimWithout: without.dimension,
        mixesDoubletWithout: without.basis.some(mixesDoublet),
        mixesRestWithout: without.basis.some(mixesRest),
        dimKeeping: keeping.dimension,
        keepingHasSwap: keeping.basis.some(m => mixesDoublet(m)),
        lockKeepingListed: lockKeeping.length,
        dimWith: withMomentum.dimension,
        mixesDoubletWith: withMomentum.basis.some(mixesDoublet),
        mixesRestWith: withMomentum.basis.some(mixesRest),
      }
    })
    const h2 = perLine.every(
      r =>
        r.dimWithout === 5 &&
        r.mixesDoubletWithout &&
        r.mixesRestWithout &&
        r.dimKeeping === 3 &&
        r.keepingHasSwap,
    )
    const h3 = perLine.every(
      r => r.dimWith === 2 && !r.mixesDoubletWith && !r.mixesRestWith,
    )

    // ---- H4 ----
    const mom = collisionKeepsMomentum()
    const h4 = mom.broken === 0 && mom.acting > 0

    // ---- H5 ----
    const dock = dockOrbitals(group)
    const inners = dock.orbitals.map(o => o.inner)
    const h5 =
      dock.burnside === 5 &&
      dock.orbitals.length === 5 &&
      [2, 1, 0, -1, -2].every(v => inners.includes(v)) &&
      dock.orbitals.find(o => o.inner === 2)?.pairs === 24 &&
      dock.orbitals.find(o => o.inner === -2)?.pairs === 24

    // ---- H6 ----
    const classes = coinClasses()
    const h6 =
      classes.length === 6 &&
      classes.every(
        c => c.unitary && c.timeSymmetric && c.commutesSwap,
      ) &&
      classes.filter(c => c.commutesMomentum).length === 1 &&
      classes.find(c => c.commutesMomentum)?.theta === 0 &&
      classes.filter(c => c.mixes).length === 5 &&
      classes.filter(c => c.mixes && c.classical).length === 1 &&
      classes.find(c => c.mixes && c.classical)?.theta === 3 &&
      classes.filter(c => c.mixes && !c.classical).length === 4

    // ---- H7 ----
    const bands = classes.map(c => ({
      theta: c.theta,
      ...bandReading(c.theta),
    }))

    const want = (
      t: number,
    ): { gap: number; curvature: number; topSpeed: number } => {
      const a = Math.abs(t)

      if (a === 0) {
        return { gap: 0, curvature: 0, topSpeed: 1 }
      }

      if (a === 1) {
        return {
          gap: Math.PI / 3,
          curvature: Math.sqrt(3),
          topSpeed: Math.sqrt(3) / 2,
        }
      }

      if (a === 2) {
        return {
          gap: (2 * Math.PI) / 3,
          curvature: 1 / Math.sqrt(3),
          topSpeed: 0.5,
        }
      }

      return { gap: Math.PI, curvature: 0, topSpeed: 0 }
    }

    const bandMiss = bands.map(b => {
      const w = want(b.theta)

      // theta = 0 is the massless line: gap 0 and speed 1 read; its curvature is 0 away from the crossing
      return Math.max(
        Math.abs(b.gap - w.gap),
        b.theta === 0
          ? 0
          : Math.abs(Math.abs(b.curvature) - w.curvature),
        Math.abs(b.topSpeed - w.topSpeed),
      )
    })
    const h7 = bandMiss.every(m => m < 1e-6)

    // ---- H8 ----
    const twirls = [0, 1, 2].map(axis => spinTwirlOfSwap(axis))
    const h8 = twirls.every(t => t < 1e-12)

    const ok = h1 && h2 && h3 && h4 && h5 && h6 && h7 && h8
    const massive = classes.filter(c => c.mixes && !c.classical)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `W(F4) closes at ${group.length}; each line's stabilizer has ${lines[0]!.order} elements (${lines[0]!.keep} keep r, ${lines[0]!.reverse} reverse it), acting on (e0, e1, o) by permutation; with the frame, C, C' and T the commutant on every line has dimension ${[...new Set(perLine.map(r => r.dimWithout))].join(', ')} and holds the swap of e0 and e1 (lock-keeping: ${[...new Set(perLine.map(r => r.dimKeeping))].join(', ')}, alpha P+ + beta P-), so the doublet is reducible and a mixing coin is covariant; adding the lattice momentum's generator leaves dimension ${[...new Set(perLine.map(r => r.dimWith))].join(', ')} with no mixing, and the collision keeps the momentum on all ${mom.occupations.toLocaleString('en-US')} occupations (${mom.broken} broken): the mass is forbidden by momentum conservation and by nothing else; the dock's covariant commutant is ${dock.burnside}-dimensional (inner products ${inners.join(', ')}), lock-keeping span(I, R), 1 with the momentum; the six integer coins are all unitary, T-symmetric and swap-covariant, ${massive.length} massive and travelling (theta = ${massive.map(c => `${c.theta} pi/3`).join(', ')}), one classical flat (theta = pi); the stand-in's spin units twirl the swap to ${Math.max(...twirls).toExponential(1)}`,
      metrics: {
        gate_H1: h1 ? 1 : 0,
        gate_H2: h2 ? 1 : 0,
        gate_H3: h3 ? 1 : 0,
        gate_H4: h4 ? 1 : 0,
        gate_H5: h5 ? 1 : 0,
        gate_H6: h6 ? 1 : 0,
        gate_H7: h7 ? 1 : 0,
        gate_H8: h8 ? 1 : 0,
        groupOrder: group.length,
        lineStabilizer: lines[0]!.order,
        commutantWithout: Math.max(...perLine.map(r => r.dimWithout)),
        commutantLockKeeping: Math.max(
          ...perLine.map(r => r.dimKeeping),
        ),
        commutantWithMomentum: Math.max(...perLine.map(r => r.dimWith)),
        occupations: mom.occupations,
        occupationsActing: mom.acting,
        momentumBroken: mom.broken,
        dockCommutant: dock.burnside,
        coinClasses: classes.length,
        massiveClasses: massive.length,
        bandMissWorst: Math.max(...bandMiss),
        spinTwirlWorst: Math.max(...twirls),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        stabilizerLabelImages: Math.max(...perLine.map(r => r.images)),
      },
      notes: `L1. Gates H1 ${h1}, H2 ${h2}, H3 ${h3}, H4 ${h4}, H5 ${h5}, H6 ${h6}, H7 ${h7}, H8 ${h8}. Per line (commutant without the momentum / lock-keeping / with it): ${perLine.map(r => `${r.line}: ${r.dimWithout}/${r.dimKeeping}/${r.dimWith}`).join(', ')}. Dock orbitals (inner product: ordered pairs): ${dock.orbitals.map(o => `${o.inner}: ${o.pairs}`).join(', ')}. Coin classes (theta in pi/3; 2C = [[alpha + beta, alpha - beta], ...] in Z[w] as a + b w): ${classes.map(c => `${c.theta}: 2C diag (${c.twoC[0]![0]!.join(',')}) off (${c.twoC[0]![1]!.join(',')}), unitary ${c.unitary}, T ${c.timeSymmetric}, momentum ${c.commutesMomentum}, classical ${c.classical}`).join('; ')}. Bands: ${bands.map(b => `theta ${b.theta}: gap ${b.gap.toFixed(9)}, curvature ${b.curvature.toFixed(9)}, top speed ${b.topSpeed.toFixed(9)}`).join('; ')}. Spin-unit twirls of the swap by husk axis: ${twirls.map(t => t.toExponential(1)).join(', ')}. Collision: ${mom.acting.toLocaleString('en-US')} of ${mom.occupations.toLocaleString('en-US')} occupations move a slot, 0 of them change P.`,
    })
  },
})
