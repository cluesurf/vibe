// The spin-statistics mismatch of E-SPN-0067, found and closed: the 2 pi sign of any role cluster is (-1)^N, N the
// model's own fermion number (the doublet count about the turn's center), and it disagrees with the vibe count
// exactly by the number of roles on the scalar line. Locking every role into its doublet (E-SPN-0066: a moving token
// is a spinor by force) removes the line, and then every charge-one cluster is spinorial and its Pauli ground is
// spin one half, whatever role-blind binding holds it.
//
// E-SPN-0067 found that with loves as identical fermions and any binding that does not read the role, the lightest
// Q = 1 level has vibe count 3 (odd) and 2 pi sign +1. The hypothesis handed to this file: the role-blind binding
// is what breaks spin-statistics, because rotation acts on the role while exchange acts on the slot. This file
// tests it exactly, with the representation theory of 2T and of the symmetric groups.
//
// THE ARGUMENT, before any number.
// (1) The 2 pi turn of 2T is R = -P on a role (E-SPN-0051, 0054): -1 on the parity-even doublet D, +1 on the
//     parity-odd line. So R = (-1)^(Pi_D) on one role and R_cluster = (-1)^N on any cluster, N = (loves' doublet
//     count) - (fears' doublet count). The 2 pi sign is the PARITY OF N, an operator identity with no binding in
//     it. The vibe count n - m differs from N by the line count (loves on the line minus fears on the line).
// (2) So E-SPN-0067's mismatch is a love on the line: it counts as a vibe, it is exchanged with sign -1 (the slot
//     rule, E-SPN-0047), and it turns with sign +1. Role-blindness is not the cause: it enters only through the
//     Pauli pairing of a role irrep with its conjugate space, and the unlocked role content offers a line.
// (3) With every role locked into D, N = n - m on every state, so R_cluster = (-1)^(n - m): every Q = 1 state
//     (n - m = 3) is spinorial. D^(x n) holds only Young diagrams of at most two rows (Schur-Weyl on a
//     two-dimensional space), so (3, 0) cannot sit in role [1,1,1] and (4, 1) cannot sit in role [2,1,1]: the
//     E-SPN-0067 grounds are gone.
// (4) Which 2T irrep: for D = natural (x) lambda^k, S_[2,1](D) = det(D) (x) D = lambda^(2k) (x) natural (x) lambda^k
//     = natural, since lambda^3 = 1; S_[2,2](D) = det(D)^2 = lambda^k and conj(D) = natural (x) lambda^(-k), so
//     S_[2,2](D) (x) conj(D) = natural. Both Pauli grounds are the NATURAL doublet whichever doublet D is.
//
// PREDICTIONS, written before this file ran (no probe of these numbers was run).
// P1 The model's order-2 turn is -P exactly, and R_cluster = (-1)^N on every doublet-basis product vector of
//    (1, 1), (2, 0), (3, 0) and (4, 1).
// P2 Unlocked (E-SPN-0067's neutral space): the (3, 0) determinant channel [1,1,1] has N = 2 with weight 1 (one
//    love on the line); every (4, 1) channel of role [2,1,1] has zero weight on odd N; in every channel of either
//    cluster the weight on odd N is 1 when the 2 pi sign is -1 and 0 when it is +1.
// P3 Locked content, by characters: (3, 0): role [3] holds twisted and twistedSquared once each, role [2,1] holds
//    natural once (dimension 8); (4, 1): [4] holds natural once and twisted, twistedSquared twice each, [3,1] holds
//    natural, twisted, twistedSquared once each, [2,2] holds natural once (dimension 32); every entry has 2 pi sign
//    -1; no role irrep of three or more rows. One locked role is one 2T doublet (2 pi sign -1).
// P4 Locked Pauli ground (the lowest spatial irrep whose conjugate role irrep is present): (3, 0) space [2,1] with
//    role [2,1] = natural, in one dimension and in the oscillator shell; (4, 1) in one dimension space [2,2] with
//    role [2,2] = natural; in the oscillator shell a tie at 2 quanta between space [2,2] (natural) and space
//    [2,1,1] (role [3,1]: natural, twisted, twistedSquared); every ground entry 2 pi sign -1.
// P5 One dimension, a second method: among the spatial irreps the lock allows ({[2,1], [1,1,1]} and {[2,2],
//    [2,1,1], [1,1,1,1]}), the ring's lowest (Lanczos, E-SPN-0067's couplings, rings 8 and 6) is [2,1] and [2,2].
// P6 Control: roles locked to the LINE instead give 2 pi sign +1 on every entry (so the sign follows the locked
//    subspace, not the cluster), and the unlocked content reproduces E-SPN-0067's +1 grounds.
//
// Gates, fixed with the predictions: G1 = P1 (1e-12), G2 = P2 (1e-9), G3 = P3 (multiplicities whole to 1e-9),
// G4 = P4, G5 = P5, G6 = P6. Status pass if all hold.
//
// START ENSEMBLE: nothing here reads a link, so every member of the 17-start family gives the same verdict by
// construction. HUSK: a statement about the role, the same on the husk and in the bulk; no husk reading is needed.
//
// Depth L1: representation theory of the model's own turns, plus a known theorem (Lieb-Mattis) checked on a ring.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centralTurnGap, lockedJointContent, numberDistribution, twoPiIdentityGap, type LockedEntry } from '@/code/measure/locked-cluster'
import { conjugate, irrepsOf, jointContent, minimalQuanta, partitionName, ringSectorEnergies } from '@/code/measure/pauli-cluster'

const COUPLINGS: readonly (readonly [number, number])[] = [
  [0, -2],
  [-1, -2],
  [-3, -3],
  [-1, 0],
]

type Cluster = { roles: number; antiroles: number }

const CLUSTERS: readonly Cluster[] = [
  { roles: 3, antiroles: 0 },
  { roles: 4, antiroles: 1 },
]

const text = (entries: readonly LockedEntry[]): string => entries.map(e => `${e.spin} (2 pi ${e.twoPiSign > 0 ? '+' : '-'}) x ${partitionName(e.partition)}${e.multiplicity > 1 ? ` x ${e.multiplicity}` : ''}`).join(', ')

// the predicted locked content, as "spin|partition" -> multiplicity
const PREDICTED: Record<string, Record<string, number>> = {
  '3,0': { 'twisted|[3]': 1, 'twistedSquared|[3]': 1, 'natural|[2,1]': 1 },
  '4,1': { 'natural|[4]': 1, 'twisted|[4]': 2, 'twistedSquared|[4]': 2, 'natural|[3,1]': 1, 'twisted|[3,1]': 1, 'twistedSquared|[3,1]': 1, 'natural|[2,2]': 1 },
}

export default experiment({
  id: 'spin/locked-spin-statistics',
  code: 'E-SPN-0071',
  title: 'the spin-statistics mismatch is a love on the scalar line: the 2 pi sign of any role cluster is (-1)^N, N the doublet count (the model\'s fermion number), which differs from the vibe count by the line count; with every role locked into its doublet, as a moving token must be, every charge-one cluster is spinorial and its Pauli ground under any role-blind binding is the natural spin one half',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // ---- G1 ----
    const central = centralTurnGap()
    const identities = [
      { roles: 1, antiroles: 1 },
      { roles: 2, antiroles: 0 },
      ...CLUSTERS,
    ].map(c => ({ ...c, ...twoPiIdentityGap(c) }))
    const g1 = central.gap < 1e-12 && identities.every(i => i.gap < 1e-12)

    // ---- G2 ----
    const numbers = CLUSTERS.map(c => numberDistribution(c))
    const oddWeight = (w: Map<number, number>): number => [...w.entries()].reduce((s, [n, x]) => s + (Math.abs(n) % 2 === 1 ? x : 0), 0)
    const det30 = numbers[0]!.filter(ch => ch.partition === '[1,1,1]')
    const ground41 = numbers[1]!.filter(ch => ch.partition === '[2,1,1]')
    const parityMatches = numbers.every(list => list.every(ch => Math.abs(oddWeight(ch.weights) - (ch.twoPiSign < 0 ? 1 : 0)) < 1e-9))
    const g2 =
      det30.length > 0 &&
      det30.every(ch => Math.abs((ch.weights.get(2) ?? 0) - 1) < 1e-9) &&
      ground41.length > 0 &&
      ground41.every(ch => oddWeight(ch.weights) < 1e-9) &&
      parityMatches

    // ---- G3 ----
    const locked = CLUSTERS.map(c => lockedJointContent(c))
    const contentMatches = (entries: readonly LockedEntry[], key: string): boolean => {
      const want = PREDICTED[key] ?? {}
      const got = Object.fromEntries(entries.map(e => [`${e.spin}|${partitionName(e.partition)}`, e.multiplicity]))

      return Object.keys(want).length === Object.keys(got).length && Object.entries(want).every(([k, v]) => got[k] === v)
    }
    const oneRole = lockedJointContent({ roles: 3, antiroles: 0 }).single
    const g3 =
      locked.every(l => l.wholeGap < 1e-9) &&
      locked[0]!.dimension === 8 &&
      locked[1]!.dimension === 32 &&
      contentMatches(locked[0]!.entries, '3,0') &&
      contentMatches(locked[1]!.entries, '4,1') &&
      locked.every(l => l.entries.every(e => e.twoPiSign < 0 && e.partition.length <= 2)) &&
      oneRole.length === 1 &&
      oneRole[0]!.multiplicity === 1

    // ---- G4: the locked Pauli grounds ----
    const quanta = { 1: [3, 4].map(n => minimalQuanta({ n, dimension: 1, maxQuanta: 6 })), 3: [3, 4].map(n => minimalQuanta({ n, dimension: 3, maxQuanta: 3 })) }
    const groundsOf = (entries: readonly LockedEntry[], n: number, order: Map<string, number>): { space: string; role: string; entries: LockedEntry[] }[] => {
      const present = new Set(entries.map(e => partitionName(e.partition)))
      const allowed = irrepsOf(n)
        .map(i => ({ space: partitionName(i.partition), role: partitionName(conjugate(i.partition)) }))
        .filter(x => present.has(x.role))
      const best = Math.min(...allowed.map(x => order.get(x.space) ?? 99))

      return allowed.filter(x => (order.get(x.space) ?? 99) === best).map(x => ({ ...x, entries: entries.filter(e => partitionName(e.partition) === x.role) }))
    }
    const grounds = ([1, 3] as const).map(d => CLUSTERS.map((c, i) => groundsOf(locked[i]!.entries, c.roles, quanta[d][i]!)))
    const names = (g: { entries: LockedEntry[] }): string => g.entries.map(e => `${e.spin}${e.multiplicity > 1 ? `x${e.multiplicity}` : ''}`).sort().join('+')
    const g30 = (d: 0 | 1): boolean => grounds[d]![0]!.length === 1 && grounds[d]![0]![0]!.space === '[2,1]' && names(grounds[d]![0]![0]!) === 'natural'
    const g41oneD = grounds[0]![1]!.length === 1 && grounds[0]![1]![0]!.space === '[2,2]' && names(grounds[0]![1]![0]!) === 'natural'
    const tie = grounds[1]![1]!
    const g41threeD =
      tie.length === 2 &&
      tie.some(g => g.space === '[2,2]' && names(g) === 'natural') &&
      tie.some(g => g.space === '[2,1,1]' && g.role === '[3,1]' && names(g) === 'natural+twisted+twistedSquared')
    const g4 = g30(0) && g30(1) && g41oneD && g41threeD && grounds.flat(2).every(g => g.entries.every(e => e.twoPiSign < 0))

    // ---- G5: Lieb-Mattis on the ring among the allowed spatial irreps ----
    const rings = [
      ...[-1, -3].map(like => ({ n: 3, like, unlike: 0, ...ringSectorEnergies({ ring: 8, identical: 3, extra: 0, hop: 1, like, unlike: 0 }) })),
      ...COUPLINGS.map(([like, unlike]) => ({ n: 4, like, unlike, ...ringSectorEnergies({ ring: 6, identical: 4, extra: 1, hop: 1, like, unlike }) })),
    ]
    const allowed = { 3: ['[2,1]', '[1,1,1]'], 4: ['[2,2]', '[2,1,1]', '[1,1,1,1]'] } as const
    const lowestAllowed = rings.map(r => {
      const list = allowed[r.n as 3 | 4].map(k => ({ k, e: r.energies.get(k) ?? Number.NaN }))
      const sorted = [...list].sort((a, b) => a.e - b.e)

      return { ...r, lowest: sorted[0]!.k, gap: sorted[1]!.e - sorted[0]!.e }
    })
    const g5 = lowestAllowed.every(r => r.lowest === (r.n === 3 ? '[2,1]' : '[2,2]') && r.gap > 1e-6)

    // ---- G6: controls ----
    const lineLocked = CLUSTERS.map(c => lockedJointContent({ ...c, subspace: 'line' }))
    const lineAllEven = lineLocked.every(l => l.entries.length > 0 && l.entries.every(e => e.twoPiSign > 0))
    const unlocked = CLUSTERS.map(c => jointContent(c))
    const unlockedGround30 = unlocked[0]!.entries.filter(e => partitionName(e.partition) === '[1,1,1]')
    const unlockedGround41 = unlocked[1]!.entries.filter(e => partitionName(e.partition) === '[2,1,1]')
    const g6 = lineAllEven && unlockedGround30.length > 0 && unlockedGround30.every(e => e.twoPiSign > 0) && unlockedGround41.length > 0 && unlockedGround41.every(e => e.twoPiSign > 0)

    const ok = g1 && g2 && g3 && g4 && g5 && g6
    const weightText = (w: Map<number, number>): string =>
      [...w.entries()]
        .filter(([, x]) => x > 1e-9)
        .sort((a, b) => a[0] - b[0])
        .map(([n, x]) => `N ${n}: ${x.toFixed(4)}`)
        .join(', ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the model's 2 pi turn is -P (gap ${central.gap.toExponential(1)}), and on every doublet-basis product vector of (1, 1), (2, 0), (3, 0), (4, 1) the cluster's 2 pi turn is (-1)^N with N the doublet count (worst ${Math.max(...identities.map(i => i.gap)).toExponential(1)}, ${identities.reduce((s, i) => s + i.vectors, 0)} vectors); unlocked, the (3, 0) determinant holds ${weightText(det30[0]?.weights ?? new Map())} (one love on the line) and the (4, 1) [2,1,1] ground holds ${ground41.map(ch => `${ch.spin}: ${weightText(ch.weights)}`).join('; ')}, so E-SPN-0067's mismatch is the line count, and in every channel the odd-N weight is 1 exactly when the 2 pi sign is -1; one locked role is ${oneRole.map(s => s.spin).join(', ')}, and locked, (3, 0) holds ${text(locked[0]!.entries)} and (4, 1) holds ${text(locked[1]!.entries)}, every entry spinorial; the locked Pauli ground is space ${grounds[0]![0]![0]?.space} with ${names(grounds[0]![0]![0]!)} for (3, 0) in one and three dimensions, and for (4, 1) space ${grounds[0]![1]![0]?.space} with ${names(grounds[0]![1]![0]!)} in one dimension and a tie of ${tie.map(g => `space ${g.space} (${names(g)})`).join(' and ')} in the oscillator shell; on the ring the lowest allowed irrep is [2,1] and [2,2] at every coupling (smallest gap ${Math.min(...lowestAllowed.map(r => r.gap)).toFixed(4)}); locked to the line instead, every entry has 2 pi sign +1`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        gate_G6: g6 ? 1 : 0,
        centralTurnGap: central.gap,
        twoPiIdentityWorst: Math.max(...identities.map(i => i.gap)),
        twoPiIdentityVectors: identities.reduce((s, i) => s + i.vectors, 0),
        lockedWholeGap: Math.max(...locked.map(l => l.wholeGap)),
        lockedDimension30: locked[0]!.dimension,
        lockedDimension41: locked[1]!.dimension,
        ...Object.fromEntries(numbers.flatMap((list, i) => list.flatMap(ch => [...ch.weights.entries()].filter(([, x]) => x > 1e-12).map(([n, x]) => [`unlocked${i === 0 ? '30' : '41'}_${ch.spin}_${ch.partition}_N${n}`, x])))),
        ...Object.fromEntries(locked.flatMap((l, i) => l.entries.map(e => [`locked${i === 0 ? '30' : '41'}_${e.spin}_${partitionName(e.partition)}`, e.multiplicity]))),
        ...Object.fromEntries(lowestAllowed.map((r, i) => [`ringLowestAllowedGap${i}_n${r.n}_like${r.like}_unlike${r.unlike}`, r.gap])),
      },
      control: {
        lineLockedAllEven: lineAllEven ? 1 : 0,
        ...Object.fromEntries(lineLocked.flatMap((l, i) => l.entries.map(e => [`line${i === 0 ? '30' : '41'}_${e.spin}_${partitionName(e.partition)}`, e.multiplicity]))),
        unlockedGroundTwoPiPlus: unlockedGround30.every(e => e.twoPiSign > 0) && unlockedGround41.every(e => e.twoPiSign > 0) ? 1 : 0,
      },
      notes: `L1. Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}, G6 ${g6}. Unlocked N distributions per channel: ${numbers.map((list, i) => `${i === 0 ? '(3, 0)' : '(4, 1)'}: ${list.map(ch => `${ch.spin} ${ch.partition} (2 pi ${ch.twoPiSign > 0 ? '+' : '-'}, dim ${ch.dimension}) ${weightText(ch.weights)}`).join('; ')}`).join(' | ')}. Ring energies of the allowed irreps: ${lowestAllowed.map(r => `(n ${r.n}, like ${r.like}, unlike ${r.unlike}) ${allowed[r.n as 3 | 4].map(k => `${k} ${(r.energies.get(k) ?? Number.NaN).toFixed(4)}`).join(', ')}`).join('; ')}. MEANING: the hypothesis handed to this file is refined, not confirmed as worded. Role-blind binding is innocent: with the lock, a role-blind binding gives a spinorial Pauli ground (G4, G5). What breaks spin-statistics in E-SPN-0067 is the scalar line: a love there is exchanged as a fermion by the slot rule but turns as a boson, so a cluster's 2 pi sign is the parity of its doublet count N, and N differs from the vibe count by the line count. The lock (a moving token cannot stream the line, E-SPN-0066) makes N the vibe count on every state, and then rotation and exchange agree for every cluster, bound or not. The locked Pauli ground of both charge-one clusters is the natural doublet, the 2T restriction of spin one half, for a structural reason: every doublet D of 2T is natural (x) lambda^k, and the determinant factors that Pauli forces carry lambda^(3k) = 1. Scope: the locked space is the cluster at one common own point; clusters whose tokens hold different own points add an orbital-like label that this file does not treat, and the identity R = (-1)^N (G1) holds there too, so the spinorial 2 pi sign does not depend on it; the spin value (one half rather than three halves) does.`,
    })
  },
})
