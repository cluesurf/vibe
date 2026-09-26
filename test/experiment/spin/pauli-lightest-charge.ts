// What Pauli's exclusion makes the lightest charge-one cluster: the three loves (3, 0) and the four loves and a
// fear (4, 1), with the loves identical fermions and a binding that does not read the role.
//
// E-SPN-0055 and E-SPN-0060 read the role content of the two smallest Q = 1 clusters: the neutral triple holds a
// twisted doublet (a piece of spin 3/2) and a one-dimensional character, and (4, 1) holds the natural spin one half
// twice. Neither asked which of those states the cluster's LOWEST level holds. A love is a fermion (E-SPN-0047,
// E-SPN-0059), so four (or three) loves must be antisymmetric under every permutation of role and space together.
// A role state in symmetric-group irrep mu therefore pairs only with a spatial state in the conjugate irrep mu^T
// (the fear is a different vibe and is not permuted). Which spatial irrep is lowest is the binding's business, and
// two settings decide it without knowing the binding:
//  - ONE DIMENSION: Lieb and Mattis (1962): for any Hamiltonian that does not read the role, the lowest level of
//    a spatial irrep rises as the Young diagram becomes less symmetric (dominance order)
//  - THREE-DIMENSIONAL OSCILLATOR SHELL: an irrep first appears at the fewest quanta that fit its diagram
//
// PREDICTIONS, written before the file ran (a probe had printed the joint content; see the notes).
// P1 (3, 0): its 3 neutral states are a twisted doublet in the symmetric irrep [3] and a one-dimensional
//    character in the antisymmetric irrep [1,1,1] (the role determinant epsilon, the only role-antisymmetric
//    state of three qutrits, which the translations fix). (4, 1): its 27 states are the E-SPN-0060 content
//    (natural doublet in [2,2]; a one-dimensional character in [2,1,1]; the rest in [4] and [3,1]).
// P2 Pauli: (3, 0)'s role epsilon pairs with the symmetric space [3], the lowest in both settings; (4, 1) can
//    have no role in [1,1,1,1] (four qutrits have no totally antisymmetric state), so its lowest allowed space is
//    [3,1], paired with role [2,1,1], which holds only the one-dimensional character. The natural doublet's role
//    [2,2] pairs with space [2,2]: one quantum higher in the oscillator, and above [3,1] in one dimension.
// P3 So for any role-blind binding, the lowest Pauli-allowed level of both Q = 1 clusters has 2 pi sign +1: a
//    fermion number of 3 (odd) with the rotation sign of a boson. The electron (the natural spin one half) is not
//    the lightest Q = 1 state; in (4, 1) it is the first excited Pauli level in one dimension and ties with role
//    [3,1] in the oscillator.
// P4 Control: if the loves were bosons (role and space both symmetric, or both in the same irrep), the lowest
//    level would pair space [4] with role [4] or [3] with [3], which hold twisted doublets (2 pi sign -1): the +1
//    comes from Pauli, not from the clusters alone.
//
// Gates, fixed before the first run:
// G1 the S3 and S4 tables orthonormal to 1e-12; the joint (2T, S_n) multiplicities whole to 1e-9, summing to rank
//    3 and 27; P1's content read exactly (the 2 pi sign of each 2T irrep read from its character at the -1 turn)
// G2 the oscillator quanta by enumeration: one dimension [3] 0, [2,1] 1, [1,1,1] 3 and [4] 0, [3,1] 1, [2,2] 2,
//    [2,1,1] 3, [1,1,1,1] 6; three dimensions the same except [1,1,1] 2, [2,1,1] 2, [1,1,1,1] 3; and the Pauli
//    ground (the lowest spatial irrep whose conjugate role irrep is present) is [3] for (3, 0) and [3,1] for
//    (4, 1) in both settings
// G3 Lieb-Mattis on the ring, a second method: the lowest level per spatial irrep of 3 identical particles (ring
//    8) and 4 identical plus 1 distinguishable (ring 6), four role-blind couplings with attraction, is ordered
//    [n] < [n-1,1] < ... by dominance with every gap above 1e-6 where attraction acts, and the free control is
//    ordered with ties allowed
// G4 P3: the Pauli ground's role content holds only 2 pi sign +1 irreps for both clusters, and holds no natural
//    doublet; the natural doublet's spatial partner in (4, 1) needs one more oscillator quantum than the Pauli
//    ground and lies above it on the ring at every coupling
// G5 P4, the control: the boson ground's role content (spatial [n] with role [n]) holds a spinorial (2 pi sign -1)
//    irrep for both clusters
//
// START ENSEMBLE: nothing here reads a link, so the verdict is the same on every member of the 17-start family by
// construction (no weave is built).
//
// Depth L1: exact representation theory on the model's own operators plus a known theorem checked on a ring. It
// is a statement about ANY role-blind binding: it does not bind anything (E-SPN-0068, 0069).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { conjugate, irrepsOf, jointContent, minimalQuanta, partitionName, ringSectorEnergies, tableOrthonormalGap, type JointEntry } from '@/code/measure/pauli-cluster'

const COUPLINGS: readonly (readonly [number, number])[] = [
  [0, -2],
  [-1, -2],
  [-3, -3],
  [-1, 0],
]

const QUANTA_1D: Record<string, number> = { '[3]': 0, '[2,1]': 1, '[1,1,1]': 3, '[4]': 0, '[3,1]': 1, '[2,2]': 2, '[2,1,1]': 3, '[1,1,1,1]': 6 }
const QUANTA_3D: Record<string, number> = { '[3]': 0, '[2,1]': 1, '[1,1,1]': 2, '[4]': 0, '[3,1]': 1, '[2,2]': 2, '[2,1,1]': 2, '[1,1,1,1]': 3 }

type Cluster = { roles: number; antiroles: number }

const CLUSTERS: readonly Cluster[] = [
  { roles: 3, antiroles: 0 },
  { roles: 4, antiroles: 1 },
]

const describe = (entries: readonly JointEntry[]): string => entries.map(e => `${e.spin} (2 pi ${e.twoPiSign > 0 ? '+' : '-'}) x ${partitionName(e.partition)}${e.multiplicity > 1 ? ` x ${e.multiplicity}` : ''}`).join(', ')

export default experiment({
  id: 'spin/pauli-lightest-charge',
  code: 'E-SPN-0067',
  title:
    'Pauli fixes the lightest charge-one cluster, and it is not spin one half: with the loves identical fermions and any binding that does not read the role, a role state of symmetric-group irrep mu pairs only with space mu^T; four qutrits have no antisymmetric state, so (4, 1) is lowest in space [3,1] with role [2,1,1], which holds only a one-dimensional character (2 pi sign +1), and (3, 0) is lowest in space [3] with the role determinant (+1); the natural doublet of (4, 1) sits in role and space [2,2], one oscillator quantum higher and above [3,1] on a ring at every coupling (Lieb-Mattis, checked by Lanczos): the lightest Q = 1 state has odd fermion number and the rotation sign of a boson',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // G1
    const tableGap = Math.max(tableOrthonormalGap(3), tableOrthonormalGap(4))
    const contents = CLUSTERS.map(c => ({ ...c, ...jointContent(c) }))
    const has = (entries: readonly JointEntry[], spin: string, partition: string, multiplicity: number): boolean => entries.some(e => e.spin === spin && partitionName(e.partition) === partition && e.multiplicity === multiplicity)
    const three = contents[0]!
    const five = contents[1]!
    const content30 =
      three.entries.length === 2 &&
      three.entries.some(e => e.spinDimension === 2 && e.twoPiSign < 0 && e.spin.startsWith('twisted') && partitionName(e.partition) === '[3]' && e.multiplicity === 1) &&
      three.entries.some(e => e.spinDimension === 1 && partitionName(e.partition) === '[1,1,1]' && e.multiplicity === 1)
    const content41 =
      has(five.entries, 'natural', '[2,2]', 1) &&
      five.entries.filter(e => partitionName(e.partition) === '[2,1,1]').every(e => e.spinDimension === 1) &&
      five.entries.some(e => partitionName(e.partition) === '[2,1,1]') &&
      five.entries.every(e => partitionName(e.partition) !== '[1,1,1,1]')
    const dimensionSum = (entries: readonly JointEntry[]): number =>
      entries.reduce((s, e) => s + e.spinDimension * e.multiplicity * (irrepsOf(e.partition.reduce((a, b) => a + b, 0)).find(i => partitionName(i.partition) === partitionName(e.partition))?.dimension ?? 0), 0)
    const g1 =
      tableGap < 1e-12 &&
      contents.every(c => c.wholeGap < 1e-9) &&
      Math.abs(three.rank - 3) < 1e-9 &&
      Math.abs(five.rank - 27) < 1e-9 &&
      dimensionSum(three.entries) === 3 &&
      dimensionSum(five.entries) === 27 &&
      content30 &&
      content41

    // G2: quanta and the Pauli ground in both settings
    const quanta = { 1: [3, 4].map(n => minimalQuanta({ n, dimension: 1, maxQuanta: 6 })), 3: [3, 4].map(n => minimalQuanta({ n, dimension: 3, maxQuanta: 3 })) }
    const quantaMatch = (d: 1 | 3, table: Record<string, number>): boolean => quanta[d].every(q => [...q.entries()].every(([k, v]) => table[k] === v) && q.size === (q === quanta[d][0] ? 3 : 5))
    // the Pauli ground: of the spatial irreps whose conjugate is present in the role content, the one of fewest quanta
    const pauliGround = (c: (typeof contents)[number], order: Map<string, number>): { space: string; role: string; entries: JointEntry[] } => {
      const present = new Set(c.entries.map(e => partitionName(e.partition)))
      const allowed = irrepsOf(c.roles)
        .map(i => ({ space: partitionName(i.partition), role: partitionName(conjugate(i.partition)) }))
        .filter(x => present.has(x.role))
        .sort((a, b) => (order.get(a.space) ?? 99) - (order.get(b.space) ?? 99))
      const best = allowed[0] ?? { space: '', role: '' }

      return { ...best, entries: c.entries.filter(e => partitionName(e.partition) === best.role) }
    }
    const grounds = ([1, 3] as const).map(d => contents.map((c, i) => pauliGround(c, quanta[d][i]!)))
    const g2 =
      quantaMatch(1, QUANTA_1D) &&
      quantaMatch(3, QUANTA_3D) &&
      grounds.every(g => g[0]?.space === '[3]' && g[0]?.role === '[1,1,1]' && g[1]?.space === '[3,1]' && g[1]?.role === '[2,1,1]')

    // G3: Lieb-Mattis on the ring
    const orderOf = (n: number): string[] => irrepsOf(n).map(i => partitionName(i.partition))
    const rings = [
      ...COUPLINGS.map(([like, unlike]) => ({ n: 4, like, unlike, ...ringSectorEnergies({ ring: 6, identical: 4, extra: 1, hop: 1, like, unlike }) })),
      ...[-1, -3].map(like => ({ n: 3, like, unlike: 0, ...ringSectorEnergies({ ring: 8, identical: 3, extra: 0, hop: 1, like, unlike: 0 }) })),
    ]
    const free = ringSectorEnergies({ ring: 6, identical: 4, extra: 1, hop: 1, like: 0, unlike: 0 })
    const ordered = (energies: Map<string, number>, n: number, strict: number): boolean => {
      const e = orderOf(n).map(k => energies.get(k) ?? Number.NaN)

      return e.every((x, i) => i === 0 || x - (e[i - 1] as number) > strict)
    }
    const g3 = rings.every(r => ordered(r.energies, r.n, 1e-6)) && ordered(free.energies, 4, -1e-9)

    // G4
    const noNatural = (entries: readonly JointEntry[]): boolean => entries.every(e => e.spin !== 'natural')
    const allEven = (entries: readonly JointEntry[]): boolean => entries.length > 0 && entries.every(e => e.twoPiSign > 0)
    const naturalAbove = rings.filter(r => r.n === 4).every(r => (r.energies.get('[2,2]') ?? Number.NaN) > (r.energies.get('[3,1]') ?? Number.NaN) + 1e-6)
    const naturalQuantaAbove = ([1, 3] as const).every(d => (quanta[d][1]?.get('[2,2]') ?? 0) === (quanta[d][1]?.get('[3,1]') ?? 0) + 1)
    const g4 = grounds.every(g => g.every(x => allEven(x.entries) && noNatural(x.entries))) && naturalAbove && naturalQuantaAbove

    // G5: bosons pair space [n] with role [n]
    const bosonGround = contents.map(c => c.entries.filter(e => e.partition.length === 1))
    const g5 = bosonGround.every(entries => entries.some(e => e.twoPiSign < 0))

    const ok = g1 && g2 && g3 && g4 && g5
    const gaps = rings.filter(r => r.n === 4).map(r => (r.energies.get('[2,2]') ?? 0) - (r.energies.get('[3,1]') ?? 0))
    const fmt = (energies: Map<string, number>): string => [...energies.entries()].map(([k, v]) => `${k} ${v.toFixed(4)}`).join(', ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `(3, 0): ${describe(three.entries)}; (4, 1): ${describe(five.entries)}; with the loves identical fermions a role irrep pairs with its conjugate space, so the Pauli ground is space ${grounds[0]?.[0]?.space} with role ${grounds[0]?.[0]?.role} (${describe(grounds[0]?.[0]?.entries ?? [])}) for (3, 0) and space ${grounds[0]?.[1]?.space} with role ${grounds[0]?.[1]?.role} (${describe(grounds[0]?.[1]?.entries ?? [])}) for (4, 1), in one dimension and in the oscillator shell alike; the natural doublet's space [2,2] needs ${quanta[3][1]?.get('[2,2]')} quanta against ${quanta[3][1]?.get('[3,1]')} and lies ${gaps.map(g => g.toFixed(3)).join(', ')} hops above [3,1] on a ring of 6 at the four couplings; Lieb-Mattis order held on every ring (${rings.length} coupling sets, Lanczos); bosonic loves would be lowest with a spinorial role: the lightest Q = 1 level has fermion number 3 and 2 pi sign +1`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        tableOrthonormalGap: tableGap,
        rank30: three.rank,
        rank41: five.rank,
        wholeGap: Math.max(three.wholeGap, five.wholeGap),
        ...Object.fromEntries(five.entries.map(e => [`content41_${e.spin}_${partitionName(e.partition)}`, e.multiplicity])),
        ...Object.fromEntries(three.entries.map(e => [`content30_${e.spin}_${partitionName(e.partition)}`, e.multiplicity])),
        ...Object.fromEntries(([1, 3] as const).flatMap(d => quanta[d].flatMap((q, i) => [...q.entries()].map(([k, v]) => [`quanta${d}d_n${i + 3}_${k}`, v])))),
        ...Object.fromEntries(rings.flatMap((r, i) => [...r.energies.entries()].map(([k, v]) => [`ring${i}_n${r.n}_like${r.like}_unlike${r.unlike}_${k}`, v]))),
        ...Object.fromEntries(gaps.map((g, i) => [`naturalAboveGround_coupling${i}`, g])),
      },
      control: {
        ...Object.fromEntries([...free.energies.entries()].map(([k, v]) => [`free_${k}`, v])),
        bosonGroundSpinorial30: bosonGround[0]?.some(e => e.twoPiSign < 0) ? 1 : 0,
        bosonGroundSpinorial41: bosonGround[1]?.some(e => e.twoPiSign < 0) ? 1 : 0,
      },
      notes: `L1. Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}. DISCLOSED: a probe (tmp/mb-probe-pauli.ts) printed the joint content, the quanta and the ring energies before this file was written, so P1 and G2's numbers are readings, not blind predictions; what was predicted before any probe is the argument (Pauli pairs mu with mu^T, and four qutrits have no antisymmetric state, so (4, 1) cannot sit in space [4]). The ring's free control ties [2,2] with [2,1,1] (${fmt(free.energies)}), which is why G3 allows ties there. Ring energies: ${rings.map(r => `(n ${r.n}, like ${r.like}, unlike ${r.unlike}) ${fmt(r.energies)}`).join('; ')}. MEANING: under Pauli, with the role as the loves' only internal label and a binding that does not read it, the lightest charge-one cluster is not an electron. Its role is a one-dimensional 2T character, so its 2 pi sign is +1, while its fermion number (loves minus fears, 3 or 4 - 1) is odd: exchange and rotation disagree, the E-SPN-0054 split between the exchange sign and the 2 pi sign, now at the level of the lightest charged state. The electron-like natural doublet of (4, 1) is an excited Pauli level, the first one in one dimension. What could change this: (1) a binding that reads the role strongly enough to lower role [2,2] below role [2,1,1] by more than the orbital gap; the fear beat's meetings do read the role (E-SPN-0069), so this is open; (2) the role of a MOVING love is locked into the doublet about its own point (E-SPN-0066), which removes the scalar line and changes the counting (not done here: the neutral space is defined with the full qutrit). The (3, 0) statement reaches the rishon model's spin problem from the other side: there three T rishons antisymmetric in hypercolor are spin 3/2 in an s wave; here the role is color and spin in one qutrit, so antisymmetry in the role forces the determinant, a spin singlet.`,
    })
  },
})
