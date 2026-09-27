// What a knit's symmetry can force on its coarse response, and what a knit of the committed
// architecture can have as symmetry at all.
//
// A knit is a schedule of beat collisions C_t. A glide symmetry is a coin map p with a tone relabelling
// tau and a time shift k, tau p C_t = C_(t + k) tau p for every beat (code/measure/rule-symmetry-ledger,
// kind 'forward'; k = 0 is an ordinary symmetry). The spatial parts p form a group H of 4 x 4 matrices.
//
// FORCING. H forces every symmetric rank-2 invariant to be isotropic exactly when it acts irreducibly on
// R^4: an invariant subspace gives its projector, a non-isotropic invariant, and conversely Schur's
// lemma leaves only multiples of the identity (the commutant of a real irreducible group is R, C or H,
// and its symmetric members are the reals). The antisymmetric invariants (two-forms, the handedness a
// response can carry) are the antisymmetric members of the commutant: none for real type, one for
// complex type and three for quaternionic type, and in the last two cases all of ONE handedness (a
// complex structure commuting with an irreducible group is self-dual or anti-self-dual).
//
// THE ARCHITECTURE. Every candidate knit here has the committed rule's beat: the twelve lines paired into
// six couples of a matter line and a wire, a calm-moving table on every wire read in index orientation
// (the leading slot is the lower direction index), and one couple whose two lines trade contents slot
// for slot. A coin map p stabilizes such a beat only if it keeps the couples and their roles, carries each
// wire's leading root to eta times the image wire's leading root (eta = +1 with tau the identity, or
// -1 with tau charge conjugation, since reversing a line inverts a calm-moving table and negating the
// tones inverts it back), and fixes the swap couple with its matter line carried the same way.
// beatStabilizerCensus asks, for one element of each conjugacy class of W(F4) and each eta, how many of
// the 665,280 ordered couple partitions with a swap couple it stabilizes.
//
// Why it matters: the time shifts of a glide group form a cyclic group, so its spatial part H has a
// normal subgroup K (the maps that stabilize every beat) with H / K cyclic. If every beat's stabilizer
// has order at most 2, K has order at most 2, a normal subgroup of order 2 is central, and a central
// extension of a cyclic group is abelian. An abelian subgroup of O(4) leaves a plane invariant. So no
// schedule built from such beats, whatever its partitions, walk, swap order or period, can have an
// irreducible glide group.

import { realMatrixRank } from '@/code/algebra/linear/dense'
import { admissibleStabilizers } from '@/code/rule/orbit-knit'

export type Matrix4 = number[][]

export type GlideCandidate = {
  // the beat symmetry k and the glide g, as indices into the permutation list
  k: number
  g: number
  order: number
  commutant: number
  twoForms: { total: number; selfDual: number; antiSelfDual: number }
}

// Every pair (k, g) with k in an admissible conjugacy class (a class some beat can be invariant under),
// g normalizing the cyclic group of k, and <k, g> acting irreducibly on R^4. Such a pair is the
// skeleton of a knit with an irreducible glide group: a k-invariant beat B, and the schedule
// C_t = g^t B g^-t, whose glide group contains <k, g>. The group, its commutant dimension (1 real,
// 2 complex, 4 quaternionic) and its invariant two-forms are returned, smallest group first.
export function irreducibleGlideCandidates(input: {
  matrices: readonly Matrix4[]
  permutations: readonly (readonly number[])[]
  admissible: (index: number) => boolean
  forcedSpread: (group: readonly Matrix4[]) => number
  maxOrder?: number
}): GlideCandidate[] {
  const { matrices, permutations, admissible, forcedSpread } = input
  const maxOrder = input.maxOrder ?? 64
  const index = new Map(permutations.map((p, i) => [p.join(','), i]))
  const composeIndex = (a: number, b: number): number => {
    const pa = permutations[a] ?? []
    const pb = permutations[b] ?? []

    return index.get(pb.map(x => pa[x] ?? 0).join(',')) ?? -1
  }
  const inverseIndex = (a: number): number => {
    const p = permutations[a] ?? []
    const q = new Array<number>(p.length).fill(0)

    p.forEach((x, i) => {
      q[x] = i
    })

    return index.get(q.join(',')) ?? -1
  }
  const identity = permutations.findIndex(p => p.every((x, i) => x === i))
  const seenGroups = new Set<string>()
  const out: GlideCandidate[] = []

  for (let k = 0; k < permutations.length; k++) {
    if (!admissible(k) || k === identity) {
      continue
    }

    // the cyclic group of k
    const cyclic = new Set<number>([identity])

    for (let p = k; !cyclic.has(p); p = composeIndex(k, p)) {
      cyclic.add(p)
    }

    for (let g = 0; g < permutations.length; g++) {
      const conjugate = composeIndex(composeIndex(g, k), inverseIndex(g))

      if (!cyclic.has(conjugate)) {
        continue
      }

      const group = matrixGroupClosure([matrices[k] ?? [], matrices[g] ?? []])

      if (group.length > maxOrder) {
        continue
      }

      const key = group
        .map(m => keyOf(m))
        .sort()
        .join('|')

      if (seenGroups.has(key) || forcedSpread(group) > 1e-9) {
        continue
      }

      seenGroups.add(key)
      out.push({
        k,
        g,
        order: group.length,
        commutant: commutantDimension(group),
        twoForms: invariantTwoForms(group),
      })
    }
  }

  return out.sort((a, b) => a.order - b.order)
}

const keyOf = (m: Matrix4): string =>
  m.map(row => row.map(x => Math.round(x * 4)).join(',')).join(';')

function multiply(a: Matrix4, b: Matrix4): Matrix4 {
  return [0, 1, 2, 3].map(i =>
    [0, 1, 2, 3].map(j =>
      [0, 1, 2, 3].reduce((s, k) => s + (a[i]?.[k] ?? 0) * (b[k]?.[j] ?? 0), 0),
    ),
  )
}

// the finite group the matrices generate (entries are multiples of one half here, so a rounded key is
// exact)
export function matrixGroupClosure(generators: readonly Matrix4[]): Matrix4[] {
  const identity = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? 1 : 0)))
  const seen = new Map<string, Matrix4>([[keyOf(identity), identity]])
  const queue: Matrix4[] = [identity]

  while (queue.length > 0) {
    const current = queue.pop() ?? identity

    for (const g of generators) {
      const next = multiply(g, current)
      const k = keyOf(next)

      if (!seen.has(k)) {
        seen.set(k, next)
        queue.push(next)
      }
    }
  }

  return [...seen.values()]
}

// the dimension of the commutant {X : g X = X g for every g}: 1 real, 2 complex, 4 quaternionic when the
// group is irreducible
export function commutantDimension(group: readonly Matrix4[]): number {
  const rows: number[][] = []

  for (const g of group) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        // (g X - X g)_ij as a linear form in the 16 entries of X
        const row = new Array<number>(16).fill(0)

        for (let k = 0; k < 4; k++) {
          row[k * 4 + j] = (row[k * 4 + j] ?? 0) + (g[i]?.[k] ?? 0)
          row[i * 4 + k] = (row[i * 4 + k] ?? 0) - (g[k]?.[j] ?? 0)
        }

        rows.push(row)
      }
    }
  }

  return 16 - realMatrixRank(rows)
}

// the self-dual and anti-self-dual bases of two-forms (epsilon_0123 = +1), matching kernelParts in
// code/measure/coarse-modes
const TWO_FORMS: readonly (readonly [number, number, number][])[] = [
  [[0, 1, 1], [2, 3, 1]],
  [[0, 2, 1], [1, 3, -1]],
  [[0, 3, 1], [1, 2, 1]],
  [[0, 1, 1], [2, 3, -1]],
  [[0, 2, 1], [1, 3, 1]],
  [[0, 3, 1], [1, 2, -1]],
]

function formMatrix(coefficients: readonly number[]): Matrix4 {
  const m = [0, 1, 2, 3].map(() => [0, 0, 0, 0])

  TWO_FORMS.forEach((form, b) => {
    for (const [i, j, s] of form) {
      ;(m[i] as number[])[j] = (m[i]?.[j] ?? 0) + s * (coefficients[b] ?? 0)
      ;(m[j] as number[])[i] = (m[j]?.[i] ?? 0) - s * (coefficients[b] ?? 0)
    }
  })

  return m
}

// the invariant two-forms F (g F g^T = F for every g): their dimension, and how many are self-dual and
// anti-self-dual
export function invariantTwoForms(group: readonly Matrix4[]): {
  total: number
  selfDual: number
  antiSelfDual: number
} {
  const conditions = (basis: readonly number[]): number[][] => {
    const rows: number[][] = []

    for (const g of group) {
      const images = basis.map(b => {
        const coefficients = new Array<number>(6).fill(0)

        coefficients[b] = 1

        const f = formMatrix(coefficients)
        const gt = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => g[j]?.[i] ?? 0))

        return multiply(multiply(g, f), gt).map((row, i) =>
          row.map((x, j) => x - (f[i]?.[j] ?? 0)),
        )
      })

      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          rows.push(images.map(image => image[i]?.[j] ?? 0))
        }
      }
    }

    return rows
  }
  const nullity = (basis: readonly number[]): number =>
    basis.length - realMatrixRank(conditions(basis))

  return {
    total: nullity([0, 1, 2, 3, 4, 5]),
    selfDual: nullity([0, 1, 2]),
    antiSelfDual: nullity([3, 4, 5]),
  }
}

// the relaxations of the architecture a census can be asked under: 'index' is the committed beat (index
// orientation, one swap couple), 'free' lets every line carry its own orientation (which slot the table
// makes love on), and 'orbit' also lets the swap run on a whole orbit of couples instead of one
// 'headOn' keeps index orientation and one swap couple but gives the swap the head-on turn weave's
// condition (a like pair against a calm line), which reads the same whichever way the lines face, so the
// swap's matter line needs no orientation (the base of the scatter weave); 'headOnOrbit' is 'orbit'
// with that condition
export type Relaxation = 'index' | 'free' | 'orbit' | 'headOn' | 'headOnOrbit'

// The part of a 4 x 4 response a group allows: its average (1 / |H|) sum h M h^T, the projection onto the
// invariants, and what is left, the part the symmetry forbids. For an irreducible group the allowed
// symmetric part is isotropic, and the allowed antisymmetric part lies in the invariant two-forms.
// Returned as norms of the symmetric and antisymmetric pieces, allowed and forbidden, with the allowed
// antisymmetric part split into its self-dual and anti-self-dual halves.
export function allowedAndForbidden(input: {
  group: readonly Matrix4[]
  response: readonly (readonly number[])[]
}): {
  symmetricAllowed: number
  symmetricForbidden: number
  antisymmetricAllowed: number
  antisymmetricForbidden: number
  allowedSelfDual: number
  allowedAntiSelfDual: number
} {
  const { group, response } = input
  const average = [0, 1, 2, 3].map(() => [0, 0, 0, 0])

  for (const h of group) {
    const moved = multiply(
      multiply(h, response.map(row => [...row])),
      [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => h[j]?.[i] ?? 0)),
    )

    moved.forEach((row, i) =>
      row.forEach((x, j) => {
        ;(average[i] as number[])[j] = (average[i]?.[j] ?? 0) + x / group.length
      }),
    )
  }

  const norm = (f: (i: number, j: number) => number): number => {
    let s = 0

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        s += f(i, j) ** 2
      }
    }

    return Math.sqrt(s)
  }
  const sym = (m: readonly (readonly number[])[], i: number, j: number): number =>
    ((m[i]?.[j] ?? 0) + (m[j]?.[i] ?? 0)) / 2
  const anti = (m: readonly (readonly number[])[], i: number, j: number): number =>
    ((m[i]?.[j] ?? 0) - (m[j]?.[i] ?? 0)) / 2
  const f = (i: number, j: number): number => anti(average, i, j)
  const plus = [f(0, 1) + f(2, 3), f(0, 2) - f(1, 3), f(0, 3) + f(1, 2)]
  const minus = [f(0, 1) - f(2, 3), f(0, 2) + f(1, 3), f(0, 3) - f(1, 2)]

  return {
    symmetricAllowed: norm((i, j) => sym(average, i, j)),
    symmetricForbidden: norm((i, j) => sym(response, i, j) - sym(average, i, j)),
    antisymmetricAllowed: norm((i, j) => anti(average, i, j)),
    antisymmetricForbidden: norm(
      (i, j) => anti(response, i, j) - anti(average, i, j),
    ),
    allowedSelfDual: Math.hypot(...plus),
    allowedAntiSelfDual: Math.hypot(...minus),
  }
}

// A reversal symmetry of a knit (the kind CPT is) conjugates every glide into a glide with the opposite
// time shift. For a knit whose glide group is <k> extended by g (g the glide of one step, <k> the maps
// that fix every beat), a reversal's coin part q must therefore normalize <k> and carry g into
// g^-1 <k>. This counts the coin maps that do: zero means no knit with that glide group can have CPT,
// whatever its tables, beats or tone maps.
export function reversalPartners(input: {
  permutations: readonly (readonly number[])[]
  k: readonly number[]
  g: readonly number[]
}): number {
  const { permutations, k, g } = input
  const compose = (a: readonly number[], b: readonly number[]): number[] =>
    b.map(x => a[x] ?? x)
  const inverse = (p: readonly number[]): number[] => {
    const q = new Array<number>(p.length).fill(0)

    p.forEach((x, i) => {
      q[x] = i
    })

    return q
  }
  const same = (a: readonly number[], b: readonly number[]): boolean =>
    a.every((x, i) => x === b[i])
  const identity = k.map((_, i) => i)
  const powers: number[][] = [identity]

  for (let p = [...k]; !same(p, identity); p = compose(k, p)) {
    powers.push(p)
  }

  const gInverse = inverse(g)

  return permutations.filter(q => {
    const qi = inverse(q)
    const carriedG = compose(compose(q, g), qi)
    const carriedK = compose(compose(q, k), qi)

    return (
      powers.some(p => same(carriedK, p)) &&
      powers.some(p => same(carriedG, compose(gInverse, p)))
    )
  }).length
}

// the conjugacy class of every permutation in the list (the list a group), numbered in order of first
// appearance, and the first member of each class
export function conjugacyClasses(permutations: readonly (readonly number[])[]): {
  classOf: Int32Array
  representatives: number[]
} {
  const index = new Map(permutations.map((p, i) => [p.join(','), i]))
  const classOf = new Int32Array(permutations.length).fill(-1)
  const representatives: number[] = []

  permutations.forEach((p, i) => {
    if ((classOf[i] ?? -1) >= 0) {
      return
    }

    const c = representatives.length

    representatives.push(i)

    for (const g of permutations) {
      const gi = new Array<number>(g.length).fill(0)

      g.forEach((x, j) => {
        gi[x] = j
      })

      const j = index.get(gi.map(x => g[p[x] ?? 0] ?? 0).join(','))

      if (j !== undefined) {
        classOf[j] = c
      }
    }
  })

  return { classOf, representatives }
}

// PERIOD GROUPS. A palindromic schedule trades the glide for a reversal: its symmetries are glides
// (s_(t+k) = h s_t h^-1) and reversals (s_(m-t) = q s_t q^-1 with every beat CT-symmetric, N b N = b^-1,
// so R = N q carries the dynamics to its reverse). Two reversals compose to a glide, and a reversal
// composed with itself is a shift of zero, so R^2 = q^2 (tones: N^2, the identity) must fix every beat
// with no charge conjugation. A glide and a reversal together force q g q^-1 into g^-1 K (reversalPartners).
//
// reversalGroupCandidates: every group <k, q> with k an admissible beat symmetry of sign eta (it fixes a
// beat with charge conjugation when eta = -1), q normalizing <k>, q^2 a power k^a of k with eta^a = +1
// (so R^2 fixes every beat as a plain map), and <k, q> irreducible. Each is the skeleton of a CPT
// palindrome whose period group is irreducible without any glide: the first half any k-invariant beats,
// the second half their q-conjugates in reverse order.
export function reversalGroupCandidates(input: {
  matrices: readonly Matrix4[]
  permutations: readonly (readonly number[])[]
  admissibleEta: (index: number) => readonly number[]
  forcedSpread: (group: readonly Matrix4[]) => number
}): { k: number; q: number; eta: number; order: number; commutant: number }[] {
  const { matrices, permutations, admissibleEta, forcedSpread } = input
  const index = new Map(permutations.map((p, i) => [p.join(','), i]))
  const compose = (a: number, b: number): number => {
    const pa = permutations[a] ?? []
    const pb = permutations[b] ?? []

    return index.get(pb.map(x => pa[x] ?? 0).join(',')) ?? -1
  }
  const inverseOf = (a: number): number => {
    const p = permutations[a] ?? []
    const q = new Array<number>(p.length).fill(0)

    p.forEach((x, i) => {
      q[x] = i
    })

    return index.get(q.join(',')) ?? -1
  }
  const identity = permutations.findIndex(p => p.every((x, i) => x === i))
  const out: { k: number; q: number; eta: number; order: number; commutant: number }[] = []
  const seen = new Set<string>()

  for (let k = 0; k < permutations.length; k++) {
    for (const eta of admissibleEta(k)) {
      // the powers of k with their sign
      const powers: { element: number; sign: number }[] = [{ element: identity, sign: 1 }]

      for (let p = k, s = eta; p !== identity; p = compose(k, p), s *= eta) {
        powers.push({ element: p, sign: s })
      }

      const members = new Set(powers.map(x => x.element))

      for (let q = 0; q < permutations.length; q++) {
        if (!members.has(compose(compose(q, k), inverseOf(q)))) {
          continue
        }

        const square = compose(q, q)
        const power = powers.find(x => x.element === square)

        if (!power || power.sign !== 1) {
          continue
        }

        const group = matrixGroupClosure([matrices[k] ?? [], matrices[q] ?? []])
        const key = group.map(m => keyOf(m)).sort().join('|')

        if (seen.has(key) || forcedSpread(group) > 1e-9) {
          continue
        }

        seen.add(key)
        out.push({ k, q, eta, order: group.length, commutant: commutantDimension(group) })
      }
    }
  }

  return out
}

// The general period group of a CPT schedule: K the maps that fix every beat (from an admissible beat
// symmetry k of sign eta, or trivial), a glide g of one step normalizing K, and a reversal q normalizing
// K with q g q^-1 in g^-1 K+ (a reversal carries the glide to its inverse, up to a member of K+, the
// beat symmetries that act with the plain tone map, since one that negates the tones maps each beat to
// its inverse and not to itself) and q^2 in K+ (a reversal squared is a shift of zero). Both g and q
// must also keep the signs of K's members (the sign is how a member fixes the beats, plainly or with
// charge conjugation, and a map that changed it would carry a beat to one the member fixes the other
// way). With several base beats, a schedule with exactly these
// symmetries can be built for any such triple (the beats of a motif transported by g, their reverses by
// q), so the question is purely one of groups. The problem is invariant under conjugation, so k runs over
// one representative per class. Returns every irreducible H = <K, g, q> found, with its Schur type.
// `withGlide: false` asks the palindrome alone (g the identity).
export function periodGroupCandidates(input: {
  matrices: readonly Matrix4[]
  permutations: readonly (readonly number[])[]
  // admissible classes and their signs; the trivial K is always tried
  admissible: readonly { representative: number; eta: number }[]
  forcedSpread: (group: readonly Matrix4[]) => number
  withGlide?: boolean
  // whole beat-stabilizer groups to try as K besides the cyclic ones, as [permutation index, sign] lists
  stabilizers?: readonly (readonly (readonly [number, number])[])[]
}): { k: number; eta: number; g: number; q: number; order: number; commutant: number }[] {
  const { matrices, permutations, forcedSpread } = input
  const withGlide = input.withGlide ?? true
  const index = new Map(permutations.map((p, i) => [p.join(','), i]))
  const compose = (a: number, b: number): number => {
    const pa = permutations[a] ?? []
    const pb = permutations[b] ?? []

    return index.get(pb.map(x => pa[x] ?? 0).join(',')) ?? -1
  }
  const inverseOf = (a: number): number => {
    const p = permutations[a] ?? []
    const q = new Array<number>(p.length).fill(0)

    p.forEach((x, i) => {
      q[x] = i
    })

    return index.get(q.join(',')) ?? -1
  }
  const identity = permutations.findIndex(p => p.every((x, i) => x === i))
  const { representatives } = conjugacyClasses(permutations)
  // every K to try, as its members with their signs, and one member to report it by
  const cyclic = (k: number, eta: number): [number, number][] => {
    const powers: [number, number][] = [[identity, 1]]

    for (let p = k, s = eta; p !== identity; p = compose(k, p), s *= eta) {
      powers.push([p, s])
    }

    return powers
  }
  const options: { k: number; eta: number; members: readonly (readonly [number, number])[] }[] = [
    { k: identity, eta: 1, members: [[identity, 1]] },
    ...input.admissible.map(a => ({
      k: a.representative,
      eta: a.eta,
      members: cyclic(a.representative, a.eta),
    })),
    ...(input.stabilizers ?? []).map(members => ({
      k: members.find(([e]) => e !== identity)?.[0] ?? identity,
      eta: members.find(([e]) => e !== identity)?.[1] ?? 1,
      members,
    })),
  ]
  const out: { k: number; eta: number; g: number; q: number; order: number; commutant: number }[] = []
  const seen = new Set<string>()

  for (const { k, eta, members: list } of options) {
    const members = new Set(list.map(([e]) => e))
    const plain = new Set(list.filter(([, s]) => s === 1).map(([e]) => e))
    const signOf = new Map(list.map(([e, s]) => [e, s]))
    // a glide or reversal must carry K onto itself AND keep each member's sign: the member it lands on
    // fixes the carried beat the way the original fixes the beat it came from
    const normalizes = (x: number): boolean =>
      [...members].every(m => {
        const image = compose(compose(x, m), inverseOf(x))

        return members.has(image) && signOf.get(image) === signOf.get(m)
      })
    const normalizer = permutations.map((_, i) => i).filter(normalizes)
    // when every member of K is central (the identity, the point inversion) the problem is
    // conjugation-invariant in g, so one glide per class suffices
    const central = [...members].every(m => {
      const p = permutations[m] ?? []

      return permutations.every(h => {
        const hp = h.map(x => p[x] ?? x)
        const ph = p.map(x => h[x] ?? x)

        return hp.every((x, i) => x === ph[i])
      })
    })
    const glides = !withGlide ? [identity] : central ? representatives : normalizer

    for (const g of glides) {
      const gInverse = inverseOf(g)

      for (const q of normalizer) {
        // the reversal carries the glide to its inverse times a beat symmetry that acts with the plain
        // tone map: one that negates maps each beat to its inverse, not to itself
        const carried = compose(compose(q, g), inverseOf(q))

        if (![...plain].some(m => compose(gInverse, m) === carried)) {
          continue
        }

        if (!plain.has(compose(q, q))) {
          continue
        }

        const group = matrixGroupClosure([
          ...[...members].map(m => matrices[m] ?? []),
          matrices[g] ?? [],
          matrices[q] ?? [],
        ])
        const key = group.map(m => keyOf(m)).sort().join('|')

        if (seen.has(key) || forcedSpread(group) > 1e-9) {
          continue
        }

        seen.add(key)
        out.push({ k, eta, g, q, order: group.length, commutant: commutantDimension(group) })
      }
    }
  }

  return out
}

// Every subgroup (with its members' signs) of the given signed groups: the closures of every subset of
// up to four members, which reaches every subgroup of a group of order 16 or less (none needs more than
// four generators). A schedule's common beat symmetry can be any subgroup of a beat's stabilizer, since
// it is an intersection over beats. Returned deduplicated, the trivial group left out.
export function signedSubgroups(input: {
  groups: readonly (readonly (readonly [number, number])[])[]
  permutations: readonly (readonly number[])[]
}): [number, number][][] {
  const { groups, permutations } = input
  const index = new Map(permutations.map((p, i) => [p.join(','), i]))
  const compose = (a: number, b: number): number => {
    const pa = permutations[a] ?? []
    const pb = permutations[b] ?? []

    return index.get(pb.map(x => pa[x] ?? 0).join(',')) ?? -1
  }
  const identity = permutations.findIndex(p => p.every((x, i) => x === i))
  const out = new Map<string, [number, number][]>()

  for (const group of groups) {
    const members = group.filter(([e]) => e !== identity)
    const subsets: (readonly (readonly [number, number])[])[] = []
    const pick = (start: number, chosen: (readonly [number, number])[]): void => {
      if (chosen.length > 0) {
        subsets.push(chosen)
      }

      if (chosen.length === 4) {
        return
      }

      for (let i = start; i < members.length; i++) {
        pick(i + 1, [...chosen, members[i] ?? [identity, 1]])
      }
    }

    pick(0, [])

    for (const generators of subsets) {
      const sign = new Map<number, number>([[identity, 1]])
      const queue = [identity]

      while (queue.length > 0) {
        const x = queue.pop() ?? identity

        for (const [g, s] of generators) {
          const y = compose(g, x)

          if (!sign.has(y)) {
            sign.set(y, s * (sign.get(x) ?? 1))
            queue.push(y)
          }
        }
      }

      const list = [...sign.entries()]

      out.set(list.map(([e, s]) => `${e}:${s}`).sort().join(','), list)
    }
  }

  return [...out.values()].filter(list => list.length > 1)
}

// the beat shape each relaxation of the census stands for, as code/rule/orbit-knit enumerates it
export const RELAXATION_SHAPE: Record<
  Relaxation,
  { orientation: 'index' | 'all'; fixedSwap: boolean; condition: 'loneAway' | 'headOn' }
> = {
  index: { orientation: 'index', fixedSwap: true, condition: 'loneAway' },
  headOn: { orientation: 'index', fixedSwap: true, condition: 'headOn' },
  free: { orientation: 'all', fixedSwap: true, condition: 'loneAway' },
  orbit: { orientation: 'all', fixedSwap: false, condition: 'loneAway' },
  headOnOrbit: { orientation: 'all', fixedSwap: false, condition: 'headOn' },
}

// The whole period-group search for one relaxation: the census's admissible classes, every beat their
// representatives leave invariant under every orientation, the distinct full stabilizers of those beats,
// every subgroup of them, and every period group <K, g, q> built on any of them (and on the cyclic K of
// each admissible class) that acts irreducibly, with a glide and without.
export function periodGroupSearch(input: {
  relaxation: Relaxation
  permutations: readonly (readonly number[])[]
  matrices: readonly Matrix4[]
  opposite: readonly number[]
  forcedSpread: (group: readonly Matrix4[]) => number
  traceOf: (permutation: readonly number[]) => number
  orderOf: (permutation: readonly number[]) => number
}): {
  admissibleClasses: number
  beats: number
  stabilizers: number
  largestStabilizer: number
  subgroups: number
  palindromeGroups: number
  glideGroups: number
} {
  const { relaxation, permutations, matrices, opposite, forcedSpread } = input
  const { representatives } = conjugacyClasses(permutations)
  const rows = beatStabilizerCensus({
    permutations,
    opposite,
    relaxation,
    traceOf: input.traceOf,
    orderOf: input.orderOf,
  }).filter(r => r.invariantBeats > 0)
  const classes = [...new Set(rows.map(r => r.classIndex))]
  const { stabilizers, beats } = admissibleStabilizers({
    representatives: classes.map(c => representatives[c] ?? 0),
    permutations,
    opposite,
    shape: RELAXATION_SHAPE[relaxation],
  })
  const subgroups = signedSubgroups({ groups: stabilizers, permutations })
  const cyclic = rows.map(r => ({ representative: representatives[r.classIndex] ?? 0, eta: r.eta }))
  const count = (withGlide: boolean): number =>
    periodGroupCandidates({
      matrices,
      permutations,
      admissible: cyclic,
      stabilizers: subgroups,
      forcedSpread,
      withGlide,
    }).length

  return {
    admissibleClasses: classes.length,
    beats,
    stabilizers: stabilizers.length,
    largestStabilizer: Math.max(1, ...stabilizers.map(s => s.length)),
    subgroups: subgroups.length,
    palindromeGroups: count(false),
    glideGroups: count(true),
  }
}

// Which scattering sets a coin map carries to themselves. A scattering [u, v, w, x] exchanges u with w
// and v with x, so it is read as the unordered pair of unordered slot pairs {{u, w}, {v, x}}; a set is
// carried to itself when every scattering's image is in the set. Returns the indices of the invariant sets.
export function invariantScatterSets(input: {
  permutation: readonly number[]
  sets: readonly (readonly (readonly [number, number, number, number])[])[]
}): number[] {
  const { permutation, sets } = input
  const keyOf4 = (s: readonly number[]): string => {
    const a = [s[0] ?? 0, s[2] ?? 0].sort((x, y) => x - y).join('-')
    const b = [s[1] ?? 0, s[3] ?? 0].sort((x, y) => x - y).join('-')

    return [a, b].sort().join('|')
  }

  return sets
    .map((set, i) => {
      const keys = new Set(set.map(keyOf4))
      const carried = set.every(s =>
        keys.has(keyOf4(s.map(d => permutation[d] ?? d))),
      )

      return carried ? i : -1
    })
    .filter(i => i >= 0)
}

export type CensusRow = {
  classIndex: number
  order: number
  trace: number
  eta: number
  compatibleLines: number
  invariantBeats: number
}

// For a representative of every conjugacy class of the given coin permutations (the central ones, the
// identity and the point inversion, excluded) and each eta, the number of ordered couple partitions with
// a swap couple that the element stabilizes in the sense of the header.
//
// Under 'free' a line L is compatible with h and eta when the orientation can be carried round L's orbit
// consistently: h^l (l the orbit length) maps L to itself, and it must act on L as eta^l. Under 'orbit'
// the swap may run on any h-orbit of couples whose matter lines are all compatible, the matter and the
// wire of each carried together, so a swap couple need not be fixed.
export function beatStabilizerCensus(input: {
  permutations: readonly (readonly number[])[]
  opposite: readonly number[]
  traceOf: (permutation: readonly number[]) => number
  orderOf: (permutation: readonly number[]) => number
  relaxation?: Relaxation
}): CensusRow[] {
  const { permutations, opposite } = input
  const relaxation = input.relaxation ?? 'index'
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

  const lineOf = new Array<number>(opposite.length).fill(-1)

  lines.forEach(([a, b], l) => {
    lineOf[a] = l
    lineOf[b] = l
  })

  const { representatives } = conjugacyClasses(permutations)

  // every perfect matching of the 12 lines
  const matchings: [number, number][][] = []
  const build = (rest: readonly number[], acc: [number, number][]): void => {
    if (rest.length === 0) {
      matchings.push(acc)

      return
    }

    const [a, ...others] = rest

    others.forEach((b, i) => {
      build(
        others.filter((_, j) => j !== i),
        [...acc, [a ?? 0, b]],
      )
    })
  }

  build(
    Array.from({ length: lines.length }, (_, i) => i),
    [],
  )

  const rows: CensusRow[] = []

  representatives.forEach((r, classIndex) => {
    const h = permutations[r] ?? []
    const central =
      h.every((x, i) => x === i) || h.every((x, i) => x === opposite[i])

    if (central) {
      return
    }

    const lineImage = lines.map(([a]) => lineOf[h[a] ?? 0] ?? 0)

    for (const eta of [1, -1]) {
      const compatible = lines.map(([a], l) => {
        if (relaxation === 'index' || relaxation === 'headOn') {
          const image = h[a] ?? 0
          const lead = lines[lineImage[l] ?? 0]?.[0] ?? 0

          return eta === 1 ? image === lead : image === opposite[lead]
        }

        // carry the leading root round the line's orbit and read the sign it returns with
        let root = a
        let length = 0

        do {
          root = h[root] ?? root
          length++
        } while (lineOf[root] !== l)

        const sign = root === a ? 1 : -1

        return sign === eta ** length
      })
      let invariantBeats = 0

      for (const m of matchings) {
        const partner = new Array<number>(lines.length).fill(-1)

        for (const [a, b] of m) {
          partner[a] = b
          partner[b] = a
        }

        if (
          !m.every(
            ([a, b]) => partner[lineImage[a] ?? 0] === lineImage[b],
          )
        ) {
          continue
        }

        for (let mask = 0; mask < 1 << m.length; mask++) {
          const wires = m.map(([a, b], k) => ((mask >> k) & 1 ? b : a))
          const matters = m.map(([a, b], k) => ((mask >> k) & 1 ? a : b))
          const isWire = new Array<boolean>(lines.length).fill(false)

          wires.forEach(w => {
            isWire[w] = true
          })

          if (
            !wires.every(
              w => compatible[w] && isWire[lineImage[w] ?? 0],
            )
          ) {
            continue
          }

          const orientedSwap =
            relaxation === 'index' || relaxation === 'free' || relaxation === 'orbit'
          const orbitSwap = relaxation === 'orbit' || relaxation === 'headOnOrbit'
          const swapOk = m.some(
            (_, k) =>
              (!orientedSwap || compatible[matters[k] ?? 0]) &&
              (orbitSwap ||
                (lineImage[wires[k] ?? 0] === wires[k] &&
                  lineImage[matters[k] ?? 0] === matters[k])),
          )

          if (swapOk) {
            invariantBeats++
          }
        }
      }

      rows.push({
        classIndex,
        order: input.orderOf(h),
        trace: input.traceOf(h),
        eta,
        compatibleLines: compatible.filter(Boolean).length,
        invariantBeats,
      })
    }
  })

  return rows
}
