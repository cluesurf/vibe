// Group-equivariant binary scattering for cold knits (E-RLT-0056, E-RLT-0057).
//
// A knit with exact local color keeps, at every dock, the charge, P and the forced line functionals of its
// symmetry group G (P and D o g for g in G, E-RLT-0051); a cold knit also keeps the energy E and the energy
// current P_E. This module builds every two-tone move those laws allow, and fires them as one involution
// that commutes with G and with negating every tone.
//
// THE MOVES.
// - QUADS. Two tones on slots u, v (not a head-on pair) move to w, x. P is kept when e_u + e_v = e_w + e_x,
//   the forced functionals when the two pairs change them alike, so the pairs of slots fall into classes of
//   equal (root sum, functional values). A class of two pairs is one quad. A larger class is split into
//   quads by a perfect matching of its pairs that its stabilizer in G keeps, carried to the other classes of
//   its G-orbit by the group, so the split commutes with G (for Q8 the eight classes of four pairs form one
//   free orbit, so every matching of the representative works). P_E forces the two stores equal: with
//   a e_u + b e_v = c e_w + d e_x, a + b = c + d and e_u, e_v, e_w independent, a = b = c = d, and the two
//   tones must be alike so that which tone lands where does not matter.
// - ROTATIONS. A head-on pair on a line l (any two tones, equal stores, the other line calm) moves to the line
//   h(l) along the slot map h, and back along h^-1, for one fixed element h of W(F4) that commutes with every
//   element of G, squares to +1 or -1 and moves every line: this keeps every line momentum (both lines are
//   head on or calm) and changes only the stress. Only when such an h exists.
// THE FIRING RULE. In a dock, let A be the set of moves that can fire (one pair full as required, the other
// empty). If the moves of A touch disjoint slots, and after firing all of them the set that can fire is A
// again, all of A fires; otherwise nothing does. The rule reads only A, so it is an involution, commutes with
// G (A is carried to A) and with negating every tone.
// LABELS. As in code/rule/cold-quaternion-knit: a quad's tones take their labels along, each to the target of
// its own side (D is kept, so one side-keeping pairing exists); a rotation moves labels by the weight-keeping
// rule on its four slots.

import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
const FIRSTS: number[] = []
const LINE_OF: number[] = []

ROOTS.forEach((_, d) => {
  if (d < (OPPOSITE[d] ?? d)) {
    LINE_OF[d] = FIRSTS.length
    LINE_OF[OPPOSITE[d] ?? d] = FIRSTS.length
    FIRSTS.push(d)
  }
})

const SIDE = ROOTS.map((_, d) => (d < (OPPOSITE[d] ?? d) ? 1 : -1))

export type ScatterMove = {
  readonly kind: 'quad' | 'rotation'
  // the two pairs of slots; a pair's tones go to the other pair's slots in order (a[0] to b[0])
  readonly a: readonly [number, number]
  readonly b: readonly [number, number]
  // whether the two tones must be alike: always for a quad; for a rotation when h^2 = -1, since then the
  // line a move starts from is a choice the group need not keep, and only alike tones make the two
  // orientations agree
  readonly alike: boolean
}

export type ScatterSet = {
  readonly moves: readonly ScatterMove[]
  readonly quads: number
  readonly rotations: number
  // class sizes of the non-head-on pairs: size -> count
  readonly classSizes: readonly (readonly [number, number])[]
}

const pairKey = (u: number, v: number): string => (u < v ? `${u}.${v}` : `${v}.${u}`)

// every quad and rotation for a group (root permutations) and its forced functionals (rows on the 12 line
// momenta, lines in rootsD4 order of first slots)
export function scatterMoves(input: { group: readonly (readonly number[])[]; forms: readonly (readonly number[])[]; rotation?: readonly number[] }): ScatterSet {
  const { group, forms } = input
  const classes = new Map<string, [number, number][]>()

  for (let u = 0; u < 24; u++) {
    for (let v = u + 1; v < 24; v++) {
      if (OPPOSITE[u] === v) continue

      const dn = new Array<number>(12).fill(0)

      dn[LINE_OF[u] ?? 0] = (dn[LINE_OF[u] ?? 0] ?? 0) + (SIDE[u] ?? 0)
      dn[LINE_OF[v] ?? 0] = (dn[LINE_OF[v] ?? 0] ?? 0) + (SIDE[v] ?? 0)

      const sum = [0, 1, 2, 3].map(k => (ROOTS[u]?.[k] ?? 0) + (ROOTS[v]?.[k] ?? 0))
      const values = forms.map(r => Math.round(1e6 * r.reduce((a, c, l) => a + c * (dn[l] ?? 0), 0)))
      const key = `${sum.join(',')}|${values.join(',')}`

      classes.set(key, [...(classes.get(key) ?? []), [u, v]])
    }
  }

  const sizes = new Map<number, number>()
  const moves: ScatterMove[] = []
  const done = new Set<string>()
  const classOfPair = new Map<string, string>()

  for (const [key, members] of classes) {
    sizes.set(members.length, (sizes.get(members.length) ?? 0) + 1)

    for (const [u, v] of members) classOfPair.set(pairKey(u, v), key)
  }

  const image = (g: readonly number[], p: readonly [number, number]): [number, number] => [g[p[0]] ?? 0, g[p[1]] ?? 0]

  for (const [key, members] of classes) {
    if (members.length < 2 || done.has(key)) continue

    if (members.length % 2 !== 0) continue

    // the class's stabilizer, and a perfect matching of its pairs it keeps
    const keys = members.map(([u, v]) => pairKey(u, v))
    const stab = group.filter(g => members.every(p => classOfPair.get(pairKey(...image(g, p))) === key))
    const matchings = perfectMatchings(members.length)
    const kept = matchings.find(m =>
      stab.every(g =>
        m.every(([i, j]) => {
          const gi = keys.indexOf(pairKey(...image(g, members[i] ?? [0, 0])))
          const gj = keys.indexOf(pairKey(...image(g, members[j] ?? [0, 0])))

          return m.some(([c, d]) => (c === gi && d === gj) || (c === gj && d === gi))
        }),
      ),
    )

    if (!kept) continue

    // carry the matching over the class's orbit
    for (const g of group) {
      const target = classOfPair.get(pairKey(...image(g, members[0] ?? [0, 0])))

      if (!target || done.has(target)) continue

      done.add(target)

      for (const [i, j] of kept) {
        moves.push({ kind: 'quad', a: image(g, members[i] ?? [0, 0]), b: image(g, members[j] ?? [0, 0]), alike: true })
      }
    }
  }

  const quads = moves.length
  const h = input.rotation

  if (h) {
    const seen = new Set<number>()
    const involution = h.every((x, d) => (h[x] ?? 0) === d)

    for (let l = 0; l < 12; l++) {
      const d = FIRSTS[l] ?? 0
      const target = LINE_OF[h[d] ?? 0] ?? 0

      if (seen.has(l) || target === l) continue

      seen.add(l)
      seen.add(target)
      moves.push({ kind: 'rotation', a: [d, OPPOSITE[d] ?? 0], b: [h[d] ?? 0, h[OPPOSITE[d] ?? 0] ?? 0], alike: !involution })
    }
  }

  return { moves, quads, rotations: moves.length - quads, classSizes: [...sizes].sort((x, y) => x[0] - y[0]) }
}

function perfectMatchings(n: number): [number, number][][] {
  const out: [number, number][][] = []
  const walk = (rest: number[], acc: [number, number][]): void => {
    if (rest.length === 0) {
      out.push(acc)
      return
    }

    const [a, ...others] = rest

    others.forEach((b, i) => walk(others.filter((_, j) => j !== i), [...acc, [a ?? 0, b]]))
  }

  walk(Array.from({ length: n }, (_, i) => i), [])

  return out
}

// elements h of W(F4) (root permutations) commuting with every element of the group, with h^2 = +-1 and no
// line fixed: the rotation maps
export function rotationMaps(input: { permutations: readonly (readonly number[])[]; group: readonly (readonly number[])[] }): number[][] {
  const out: number[][] = []

  for (const h of input.permutations) {
    const square = h.map(d => h[d] ?? 0)
    const plus = square.every((x, d) => x === d)
    const minus = square.every((x, d) => x === OPPOSITE[d])

    if (!plus && !minus) continue
    if (!input.group.every(g => g.every((_, d) => (g[h[d] ?? 0] ?? 0) === (h[g[d] ?? 0] ?? 0)))) continue
    if (!FIRSTS.every((d, l) => (LINE_OF[h[d] ?? 0] ?? 0) !== l)) continue

    out.push([...h])
  }

  // the involutions (h^2 = 1) first, which carry any two tones
  return [...out.filter(h => h.every((x, d) => (h[x] ?? 0) === d)), ...out.filter(h => !h.every((x, d) => (h[x] ?? 0) === d))]
}

export type LabelledArrays = {
  vibe: Int8Array
  store: Int32Array
  counter: Int32Array
  role: Int8Array | undefined
  token: Int32Array | undefined
}

export type ScatterMeeting = { readonly tokens: readonly [number, number]; readonly signs: readonly [number, number]; readonly kind: 'quad' | 'rotation' }

// written without inner closures: it runs for every move of every dock of every beat
function canFire(m: ScatterMove, a: LabelledArrays, base: number): 0 | 1 | -1 {
  const v = a.vibe
  const s = a.store
  const a0 = base + m.a[0]
  const a1 = base + m.a[1]
  const b0 = base + m.b[0]
  const b1 = base + m.b[1]
  const va0 = v[a0] ?? 0
  const va1 = v[a1] ?? 0
  const vb0 = v[b0] ?? 0
  const vb1 = v[b1] ?? 0

  if (vb0 === 0 && vb1 === 0) {
    if (va0 !== 0 && va1 !== 0 && s[a0] === s[a1] && (!m.alike || va0 === va1)) return 1

    return 0
  }

  if (va0 === 0 && va1 === 0 && vb0 !== 0 && vb1 !== 0 && s[b0] === s[b1] && (!m.alike || vb0 === vb1)) return -1

  return 0
}

const weightOf = (tone: number, d: number): number => (tone !== 0 ? tone : (SIDE[d] ?? 1))

function swapLabels(a: LabelledArrays, i: number, j: number): void {
  if (a.role) {
    const r = a.role[i] ?? 0

    a.role[i] = a.role[j] ?? 0
    a.role[j] = r
  }

  if (a.token) {
    const r = a.token[i] ?? 0

    a.token[i] = a.token[j] ?? 0
    a.token[j] = r
  }
}

function apply(m: ScatterMove, direction: 1 | -1, a: LabelledArrays, base: number): void {
  const from = direction === 1 ? m.a : m.b
  const to = direction === 1 ? m.b : m.a
  const tones = [a.vibe[base + from[0]] ?? 0, a.vibe[base + from[1]] ?? 0]
  const store = a.store[base + from[0]] ?? 0

  if (m.kind === 'quad') {
    const straight = SIDE[from[0]] === SIDE[to[0]] && SIDE[from[1]] === SIDE[to[1]]
    const into = straight ? [to[0], to[1]] : [to[1], to[0]]

    for (let k = 0; k < 2; k++) {
      const f = from[k] ?? 0
      const t = into[k] ?? f

      a.vibe[base + f] = 0
      a.store[base + f] = 0
      a.vibe[base + t] = tones[k] ?? 0
      a.store[base + t] = store
      swapLabels(a, base + f, base + t)
    }

    return
  }

  // a rotation: tones along the slot map, labels by the weight-keeping rule on the four slots
  const slots = [from[0], from[1], to[0], to[1]]
  const before = slots.map(d => a.vibe[base + d] ?? 0)

  a.vibe[base + from[0]] = 0
  a.vibe[base + from[1]] = 0
  a.store[base + from[0]] = 0
  a.store[base + from[1]] = 0
  a.vibe[base + to[0]] = tones[0] ?? 0
  a.vibe[base + to[1]] = tones[1] ?? 0
  a.store[base + to[0]] = store
  a.store[base + to[1]] = store

  const down: number[] = []
  const up: number[] = []

  slots.forEach((d, i) => {
    const w0 = weightOf(before[i] ?? 0, d)
    const w1 = weightOf(a.vibe[base + d] ?? 0, d)

    if (w0 === 1 && w1 === -1) down.push(base + d)
    if (w0 === -1 && w1 === 1) up.push(base + d)
  })

  down.forEach((i, k) => swapLabels(a, i, up[k] ?? i))
}

// the scattering involution on one dock; meetings are read in the forward sense (the tokens on the moving
// tones before the move going forward, after it going backward)
const ACTIVE = new Int32Array(256)
const DIRECTION = new Int8Array(256)

export function scatterDock(set: ScatterSet, a: LabelledArrays, base: number, forward: boolean, meetings?: ScatterMeeting[], tally?: { fired: number; blocked: number }): void {
  const moves = set.moves
  let count = 0
  let used = 0
  let overlap = false

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i]

    if (!m) continue

    const f = canFire(m, a, base)

    if (f === 0) continue

    ACTIVE[count] = i
    DIRECTION[count] = f
    count++

    const bits = (1 << m.a[0]) | (1 << m.a[1]) | (1 << m.b[0]) | (1 << m.b[1])

    if ((used & bits) !== 0) overlap = true

    used |= bits
  }

  if (count === 0) return

  if (overlap) {
    if (tally) tally.blocked++

    return
  }

  const active: [number, 1 | -1][] = []

  for (let k = 0; k < count; k++) active.push([ACTIVE[k] ?? 0, (DIRECTION[k] ?? 1) as 1 | -1])

  const snapshot = { vibe: a.vibe.slice(base, base + 24), store: a.store.slice(base, base + 24), role: a.role?.slice(base, base + 24), token: a.token?.slice(base, base + 24) }
  const moving: { tokens: [number, number]; signs: [number, number]; kind: 'quad' | 'rotation' }[] = []

  for (const [i, f] of active) {
    const m = moves[i]

    if (!m) continue

    const from = f === 1 ? m.a : m.b

    if (forward && a.token) {
      moving.push({ tokens: [a.token[base + from[0]] ?? 0, a.token[base + from[1]] ?? 0], signs: [a.vibe[base + from[0]] ?? 0, a.vibe[base + from[1]] ?? 0], kind: m.kind })
    }

    apply(m, f, a, base)
  }

  // the set that can fire afterwards must be the same moves, reversed
  let again = 0
  let same = true

  for (let i = 0; i < moves.length && same; i++) {
    const m = moves[i]

    if (!m) continue

    const f = canFire(m, a, base)

    if (f === 0) continue

    again++

    let found = false

    for (const [j, g] of active) if (j === i && g === -f) found = true

    same = found
  }

  same = same && again === active.length

  if (!same) {
    a.vibe.set(snapshot.vibe, base)
    a.store.set(snapshot.store, base)
    if (a.role && snapshot.role) a.role.set(snapshot.role, base)
    if (a.token && snapshot.token) a.token.set(snapshot.token, base)
    if (tally) tally.blocked++

    return
  }

  if (tally) tally.fired += active.length

  if (!meetings || !a.token) return

  if (forward) {
    meetings.push(...moving)
    return
  }

  // going backward, the forward-sense tones are where the moves put them now
  for (const [i, f] of active) {
    const m = set.moves[i]

    if (!m) continue

    const to = f === 1 ? m.b : m.a

    meetings.push({ tokens: [a.token[base + to[0]] ?? 0, a.token[base + to[1]] ?? 0], signs: [a.vibe[base + to[0]] ?? 0, a.vibe[base + to[1]] ?? 0], kind: m.kind })
  }
}
