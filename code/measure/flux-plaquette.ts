// THE TRIANGLE PLAQUETTE TERM FOR THE LINK FLUX (E-SPN-0151). code/measure/link-flux holds a Z3 electric flux on every
// link, changed by the charges that cross it, with a cost of one phase per link holding flux (Kogut-Susskind's electric
// term). Its register records every path, so a member tied to a charge walks on the 24-regular tree (E-SPN-0150). This
// module adds the MAGNETIC term on the D4 mesh's smallest closed loops and runs one member tied to a fixed charge under
// it, beside the stringless D4 walk and the tree.
//
// THE LOOPS. Two roots u, v with u . v = 1 close a TRIANGLE x, x + u, x + v (v - u is a root). Per link there are 8
// (the third dock x + b with b . r = 1), per dock 32 (12 links x 8 / 3), in 32 shapes (types) up to translation, two
// per A2 subsystem (16 of them, an "up" and a "down"). Squares (u . v = 0) and rhombi (u . v = +-1) are not new loops:
// a rhombus is two triangles glued on their shared diagonal, and a square is the equator of a 16-cell (the Delaunay
// cell of D4), the sum of the four triangles coning it to an apex (checked exactly, `loopCensus`).
//
// THE FACE SHIFT U_p adds a closed loop to the flux (f_l -> f_l + s_l round the triangle), so Gauss's law is kept on
// every branch, exactly. THE PIECE f(U_p) = lambda I + (1 - lambda) Pi_0 (Pi_0 = (I + U + U^2) / 3, the flat projector)
// for a norm-one lambda of Z[w][1/42]: on a basis register it stays with (1 + 2 lambda) / 3 and shifts once or twice with
// (1 - lambda) / 3 each; its eigenvalues are 1 on the flat combination and lambda on the two curved ones, so f(U_p) =
// exp(-i theta [F_p != 0]) with lambda = e^(-i theta): Kogut-Susskind's magnetic term at angle theta, in the rule's ring.
//
// TWO WAYS TO APPLY IT (code/rule/plaquette-mixer's two readings, carried to D4):
//   KS          every triangle, always. All U_p commute (they are shifts of one abelian register), so the product is
//               ORDER-FREE and covariant under every symmetry of the mesh. It does not keep the empty register: every
//               face leaves it with amplitude (1 + 2 lambda) / 3.
//   controlled  a face acts only when its oriented values are not all equal (E-SPN-0116's control, constant on every
//               U_p orbit). The empty register and the love sea are fixed points. Faces that share a link do not commute
//               (each reads the other's links), so the triangles are split into 8 CLASSES with no shared link inside a
//               class (each class 4 types covering the 12 lines once, `triangleClasses`) and the classes act in a fixed
//               order: a product of unitaries, not covariant under the symmetries that reorder the classes.
//
// THE TIED MEMBER (`TiedFlux`). A fear walked out from a love that never moves (link-flux's words, now any Gauss-legal
// pattern): the one-vibe matrix A on the member's 24 slots, the stream (slot d moves the member along root d and adds
// its flux), the string's phase exp(-i sigma cost), then the magnetic piece. Patterns are interned as they are reached;
// a pattern whose cost passes the box is absorbed and counted. With the magnetic piece off the arithmetic is link-flux
// treeBeat's, term for term.
//
// DETERMINISM: no random numbers. EXACT: the register is integers mod 3, the piece's entries are exact in Z[w][1/42]
// (checked, `pieceExact`); the amplitudes are float measurement. NOTHING MOVES: the piece changes values on the links of
// one face; the stream takes each slot's value one dock along.

import { ROOTS } from '@/code/measure/swap-sector'
import { applyVibe, blackmanHarris } from '@/code/measure/swap-string'
import {
  eisConj,
  eisMul,
  eisNorm,
  eisValue,
  type Eis,
} from '@/code/measure/swap-cone'
import { type RingUnit } from '@/code/rule/swap-mixer'
import {
  linkBase,
  OPPOSITE,
  patternAdd,
  patternHop,
  patternKey,
  rootLink,
  type Pattern,
} from '@/code/measure/link-flux'

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)
const add = (a: readonly number[], b: readonly number[]): number[] =>
  a.map((x, k) => x + b[k]!)
const sub = (a: readonly number[], b: readonly number[]): number[] =>
  a.map((x, k) => x - b[k]!)
const rootOf = (v: readonly number[]): number =>
  ROOTS.findIndex(r => r.every((x, k) => x === v[k]))

const lexLess = (
  a: readonly number[],
  b: readonly number[],
): boolean => {
  for (let k = 0; k < a.length; k++) {
    if (a[k] !== b[k]) {
      return a[k]! < b[k]!
    }
  }

  return false
}

const lineOf = (d: number): number => Math.min(d, OPPOSITE[d]!)

// ---- the triangles ----

// a triangle type: its vertices {0, a, b} with 0 the lexicographically least, walked 0 -> a -> b -> 0; each edge its
// start offset and root; the three lines (a line = the lesser slot of a root and its opposite); its class
export type TriangleType = {
  vertices: number[][]
  edges: { from: number[]; d: number }[]
  lines: number[]
}

const TYPE_KEY = (vs: readonly (readonly number[])[]): string =>
  vs.map(v => v.join(',')).join('|')

// the vertex set {x, x + u, x + v} as (type key, base offset = its least vertex, the shape relative to it)
function shapeOf(vs: readonly (readonly number[])[]): {
  key: string
  base: number[]
  shape: number[][]
} {
  let least = vs[0]!

  for (const v of vs) {
    if (lexLess(v, least)) {
      least = v
    }
  }

  const shape = vs
    .map(v => sub(v, least))
    .sort((p, q) => (lexLess(p, q) ? -1 : lexLess(q, p) ? 1 : 0))

  return { key: TYPE_KEY(shape), base: [...least], shape }
}

export type Triangles = {
  types: TriangleType[]
  // the class of each type (0 .. 7)
  typeClass: Int8Array
  // for each positive-orientation link direction (a line, by its lesser slot), the 8 triangles on a link from y along
  // that root: (type, base offset from y)
  onLine: Map<number, { type: number; offset: number[] }[]>
}

let TRIANGLES: Triangles | null = null

export function triangles(): Triangles {
  if (TRIANGLES) {
    return TRIANGLES
  }

  const byKey = new Map<string, number>()
  const types: TriangleType[] = []

  for (let u = 0; u < 24; u++) {
    for (let v = 0; v < 24; v++) {
      if (dot(ROOTS[u] as number[], ROOTS[v] as number[]) !== 1) {
        continue
      }

      const { key, shape } = shapeOf([
        [0, 0, 0, 0],
        ROOTS[u] as number[],
        ROOTS[v] as number[],
      ])

      if (byKey.has(key)) {
        continue
      }

      const [o, a, b] = shape as [number[], number[], number[]]
      const edges = [
        { from: o, d: rootOf(sub(a, o)) },
        { from: a, d: rootOf(sub(b, a)) },
        { from: b, d: rootOf(sub(o, b)) },
      ]

      if (edges.some(e => e.d < 0)) {
        throw new Error('flux-plaquette: a triangle edge is not a root')
      }

      byKey.set(key, types.length)
      types.push({
        vertices: shape,
        edges,
        lines: edges.map(e => lineOf(e.d)),
      })
    }
  }

  const typeClass = triangleClasses(types)
  const onLine = new Map<number, { type: number; offset: number[] }[]>()

  for (let k = 0; k < 24; k++) {
    if (lineOf(k) !== k) {
      continue
    }

    const r = ROOTS[k] as number[]
    const list: { type: number; offset: number[] }[] = []

    for (let b = 0; b < 24; b++) {
      if (dot(ROOTS[b] as number[], r) !== 1) {
        continue
      }

      const s = shapeOf([[0, 0, 0, 0], r, ROOTS[b] as number[]])

      list.push({ type: byKey.get(s.key)!, offset: s.base })
    }

    onLine.set(k, list)
  }

  TRIANGLES = { types, typeClass, onLine }

  return TRIANGLES
}

// 8 classes of 4 types, the lines of each class disjoint (so no two triangles of one class share a link: two
// translates of one type never share a link, since a type's three lines differ), found by a deterministic search
export function triangleClasses(
  types: readonly TriangleType[],
): Int8Array {
  const cls = new Int8Array(types.length).fill(-1)
  const used: Set<number>[] = Array.from(
    { length: 8 },
    () => new Set<number>(),
  )
  const size = new Int8Array(8)

  const place = (t: number): boolean => {
    if (t === types.length) {
      return true
    }

    const lines = types[t]!.lines

    for (let c = 0; c < 8; c++) {
      if (size[c]! >= 4 || lines.some(l => used[c]!.has(l))) {
        continue
      }

      cls[t] = c
      size[c]!++

      for (const l of lines) {
        used[c]!.add(l)
      }

      if (place(t + 1)) {
        return true
      }

      for (const l of lines) {
        used[c]!.delete(l)
      }

      size[c]!--
      cls[t] = -1
    }

    return false
  }

  if (!place(0)) {
    throw new Error('flux-plaquette: no 8-class split of the triangles')
  }

  return cls
}

// ---- the loop census (exact) ----
//
// per link: triangles through it; per dock: triangle types; every square (u . v = 0) and rhombus (u . v = +-1) from the
// origin equal, as a Z3 flux pattern, to a sum of triangle boundaries (a rhombus two, a square four round an apex);
// every type's 3 lines distinct; the classes: 8, 4 types each, lines disjoint within a class

export function trianglePattern(
  type: number,
  base: readonly number[],
  times = 1,
): Pattern {
  const t = triangles().types[type]!

  let p: Pattern = []

  for (const e of t.edges) {
    const { link, sign } = rootLink(add(base, e.from), e.d)

    p = patternAdd(p, link, times * sign)
  }

  return p
}

const walkPattern = (steps: readonly number[]): Pattern => {
  let p: Pattern = []
  let x = [0, 0, 0, 0]

  for (const d of steps) {
    const { link, sign } = rootLink(x, d)

    p = patternAdd(p, link, sign)
    x = add(x, ROOTS[d] as number[])
  }

  return p
}

const sumPatterns = (ps: readonly Pattern[]): Pattern => {
  let out: Pattern = []

  for (const p of ps) {
    for (const e of p) {
      out = patternAdd(out, Math.floor(e / 3), e % 3)
    }
  }

  return out
}

// the face with vertex set {a, b, c} (a triangle), as a pattern with multiplicity `times`, or null
function triangleAt(
  a: readonly number[],
  b: readonly number[],
  c: readonly number[],
  times: number,
): Pattern | null {
  const s = shapeOf([a, b, c])
  const t = triangles().types.findIndex(
    x => TYPE_KEY(x.vertices) === s.key,
  )

  return t < 0 ? null : trianglePattern(t, s.base, times)
}

export function loopCensus(): {
  types: number
  perLink: number
  perDock: number
  squares: number
  squaresFilled: number
  rhombi: number
  rhombiFilled: number
  linesDistinct: boolean
  classes: number
  classSizes: number[]
  classesDisjoint: boolean
} {
  const T = triangles()
  const perLink = (T.onLine.get(0) as unknown[]).length
  const everyLine =
    T.onLine.size === 12 &&
    [...T.onLine.values()].every(l => l.length === perLink)
  const same = (p: Pattern, q: Pattern): boolean =>
    patternKey(p) === patternKey(q)

  let squares = 0
  let squaresFilled = 0
  let rhombi = 0
  let rhombiFilled = 0

  for (let u = 0; u < 24; u++) {
    for (let v = 0; v < 24; v++) {
      const ab = dot(ROOTS[u] as number[], ROOTS[v] as number[])

      if (ab === 2 || ab === -2) {
        continue
      }

      const loop = walkPattern([u, v, OPPOSITE[u]!, OPPOSITE[v]!])
      const ru = ROOTS[u] as number[]
      const rv = ROOTS[v] as number[]
      const corners = [[0, 0, 0, 0], ru, add(ru, rv), rv]

      let found = false

      if (ab !== 0) {
        // a rhombus: its two triangles on the diagonal that is a root (0 to u + v when u . v = -1, u to v when +1)
        const [i, j, k, l] = ab === -1 ? [0, 1, 2, 3] : [1, 2, 3, 0]

        for (const s1 of [1, 2]) {
          for (const s2 of [1, 2]) {
            const t1 = triangleAt(
              corners[i]!,
              corners[j]!,
              corners[k]!,
              s1,
            )
            const t2 = triangleAt(
              corners[k]!,
              corners[l]!,
              corners[i]!,
              s2,
            )

            if (t1 && t2 && same(sumPatterns([t1, t2]), loop)) {
              found = true
            }
          }
        }
      } else {
        // a square: the cone of four triangles to an apex joined to all four corners (a 16-cell vertex)
        for (const z of ROOTS) {
          if (found || !corners.every(c => rootOf(sub(z, c)) >= 0)) {
            continue
          }

          for (let m = 0; m < 16 && !found; m++) {
            const parts = [0, 1, 2, 3].map(i =>
              triangleAt(
                corners[i]!,
                corners[(i + 1) % 4]!,
                z,
                ((m >> i) & 1) + 1,
              ),
            )

            if (
              parts.every(p => p !== null) &&
              same(sumPatterns(parts), loop)
            ) {
              found = true
            }
          }
        }
      }

      if (ab === 0) {
        squares++

        if (found) {
          squaresFilled++
        }
      } else {
        rhombi++

        if (found) {
          rhombiFilled++
        }
      }
    }
  }

  const classSizes = Array.from(
    { length: 8 },
    (_, c) => T.typeClass.filter(x => x === c).length,
  )
  const classesDisjoint = classSizes.every((_, c) => {
    const lines = T.types
      .filter((_, t) => T.typeClass[t] === c)
      .flatMap(t => t.lines)

    return new Set(lines).size === lines.length && lines.length === 12
  })

  return {
    types: T.types.length,
    perLink: everyLine ? perLink : -1,
    perDock: (12 * perLink) / 3,
    squares,
    squaresFilled,
    rhombi,
    rhombiFilled,
    linesDistinct: T.types.every(t => new Set(t.lines).size === 3),
    classes: new Set(T.typeClass).size,
    classSizes,
    classesDisjoint,
  }
}

// ---- the piece f(U_p), exact ----

// stay (1 + 2 lambda) / 3 and move (1 - lambda) / 3 as Eisenstein numerators over 3 den, and whether the circulant is
// exactly unitary: |stay|^2 + 2 |move|^2 = 1 and stay conj(move) + move conj(stay) + |move|^2 = 0
export function pieceExact(lambda: RingUnit): {
  stay: Eis
  move: Eis
  den: bigint
  unitary: boolean
  stayFloat: [number, number]
  moveFloat: [number, number]
} {
  const num: Eis = [lambda.num[0], lambda.num[1]]
  const d = lambda.den
  const stay: Eis = [d + 2n * num[0], 2n * num[1]]
  const move: Eis = [d - num[0], -num[1]]
  const den = 3n * d
  const norm = eisNorm(stay) + 2n * eisNorm(move) === den * den
  const a = eisMul(stay, eisConj(move))
  const b = eisMul(move, eisConj(stay))
  const c = eisMul(move, eisConj(move))
  const cross = a[0] + b[0] + c[0] === 0n && a[1] + b[1] + c[1] === 0n

  return {
    stay,
    move,
    den,
    unitary: norm && cross,
    stayFloat: eisValue(stay, den),
    moveFloat: eisValue(move, den),
  }
}

// ---- a face on a pattern ----

export type Face = {
  type: number
  base: number[]
  links: number[]
  signs: number[]
  id: string
}

export function faceOf(type: number, base: readonly number[]): Face {
  const t = triangles().types[type]!
  const links: number[] = []
  const signs: number[] = []

  for (const e of t.edges) {
    const { link, sign } = rootLink(add(base, e.from), e.d)

    links.push(link)
    signs.push(sign)
  }

  return {
    type,
    base: [...base],
    links,
    signs,
    id: `${type}@${base.join(',')}`,
  }
}

const fluxOn = (p: Pattern, link: number): number => {
  for (const e of p) {
    if (Math.floor(e / 3) === link) {
      return e % 3
    }
  }

  return 0
}

// the oriented values round the face not all equal
export function faceIsOn(p: Pattern, f: Face): boolean {
  const o = f.links.map(
    (l, i) => (((f.signs[i]! * fluxOn(p, l)) % 3) + 3) % 3,
  )

  return o[0] !== o[1] || o[1] !== o[2]
}

export function faceShift(p: Pattern, f: Face, m: number): Pattern {
  let q = p

  for (let i = 0; i < 3; i++) {
    q = patternAdd(q, f.links[i]!, m * f.signs[i]!)
  }

  return q
}

// the class-c faces touching a pattern's flux (each flux link lies on exactly one triangle of each class)
export function classFaces(p: Pattern, c: number): Face[] {
  const T = triangles()
  const out = new Map<string, Face>()

  for (const e of p) {
    const link = Math.floor(e / 3)
    const k = link % 12
    const y = linkBase(link)
    // the positive root of index k is the one link-flux orients this link along: find its slot
    const slot = positiveSlot(k)

    for (const t of T.onLine.get(lineOf(slot)) as {
      type: number
      offset: number[]
    }[]) {
      if (T.typeClass[t.type] !== c) {
        continue
      }

      const base =
        lineOf(slot) === slot
          ? add(y, t.offset)
          : add(add(y, ROOTS[slot] as number[]), t.offset)
      const f = faceOf(t.type, base)

      out.set(f.id, f)
    }
  }

  return [...out.values()].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  )
}

// the slot of positive root k (link-flux's ordering: the roots whose first nonzero coordinate is positive, in slot order)
const POSITIVE_SLOTS: readonly number[] = ROOTS.map((r, d) => ({
  d,
  first: r.find(x => x !== 0)!,
}))
  .filter(x => x.first > 0)
  .map(x => x.d)
const positiveSlot = (k: number): number => POSITIVE_SLOTS[k]!

// ---- one member tied to a fixed charge ----

export type Magnetic =
  | { kind: 'off' }
  | {
      kind: 'controlled'
      stay: [number, number]
      move: [number, number]
    }
  | {
      kind: 'ks'
      stay: [number, number]
      move: [number, number]
      faces: Face[]
    }

export class TiedFlux {
  readonly maxCost: number
  readonly table: Float64Array
  sigma: number
  magnetic: Magnetic
  patterns: Pattern[] = []
  where: number[][] = []
  cost: number[] = []
  index = new Map<string, number>()
  hop: Int32Array[] = []
  mix: ({
    to: Int32Array
    code: Int8Array
    moved: Int8Array
  } | null)[][] = []

  constructor(
    shape: { c: [number, number]; beta: [number, number] },
    sigma: number,
    magnetic: Magnetic,
    maxCost: number,
  ) {
    this.table = Float64Array.from([
      shape.c[0],
      shape.c[1],
      shape.beta[0],
      shape.beta[1],
    ])
    this.sigma = sigma
    this.magnetic = magnetic
    this.maxCost = maxCost
  }

  get size(): number {
    return this.patterns.length
  }

  // the index of a pattern with the member at x, interned; -1 past the box
  intern(p: Pattern, x: readonly number[]): number {
    if (p.length > this.maxCost) {
      return -1
    }

    const k = patternKey(p)
    const hit = this.index.get(k)

    if (hit !== undefined) {
      return hit
    }

    this.index.set(k, this.patterns.length)
    this.patterns.push(p)
    this.where.push([...x])
    this.cost.push(p.length)
    this.hop.push(new Int32Array(24).fill(-2))
    this.mix.push(new Array(8).fill(null))

    return this.patterns.length - 1
  }

  hopTarget(i: number, d: number): number {
    const h = this.hop[i]!

    if (h[d]! === -2) {
      h[d] = this.intern(
        patternHop(this.patterns[i]!, this.where[i]!, d, -1),
        add(this.where[i]!, ROOTS[d] as number[]),
      )
    }

    return h[d]!
  }

  // the class-c branches of pattern i: targets (-1 past the box), the number of faces that stayed and moved
  mixTargets(
    i: number,
    c: number,
    faces?: readonly Face[],
  ): { to: Int32Array; code: Int8Array; moved: Int8Array } {
    const row = this.mix[i] as ({
      to: Int32Array
      code: Int8Array
      moved: Int8Array
    } | null)[]
    const hit = row[c]

    if (hit && !faces) {
      return hit
    }

    const p = this.patterns[i]!
    const on = faces
      ? faces.filter(f => triangles().typeClass[f.type] === c)
      : classFaces(p, c).filter(f => faceIsOn(p, f))
    const n = on.length
    const count = 3 ** n
    const to = new Int32Array(count)
    const code = new Int8Array(count)
    const moved = new Int8Array(count)

    for (let m = 0; m < count; m++) {
      let q = p
      let r = m
      let mv = 0

      for (let j = 0; j < n; j++) {
        const s = r % 3

        r = Math.floor(r / 3)

        if (s !== 0) {
          q = faceShift(q, on[j]!, s)
          mv++
        }
      }

      to[m] = this.intern(q, this.where[i]!)
      code[m] = n
      moved[m] = mv
    }

    const out = { to, code, moved }

    if (!faces) {
      row[c] = out
    }

    return out
  }

  // one beat on amplitudes re/im (24 per pattern, grown to the current size); returns the new arrays and the weight
  // absorbed past the box
  beat(
    re: Float64Array,
    im: Float64Array,
  ): { re: Float64Array; im: Float64Array; lost: number } {
    const n0 = this.size
    const tr = new Float64Array(24)
    const ti = new Float64Array(24)

    let ore = new Float64Array(Math.max(n0, 1) * 24)
    let oim = new Float64Array(Math.max(n0, 1) * 24)
    let lost = 0

    const grow = (need: number): void => {
      if (need * 24 <= ore.length) {
        return
      }

      const len = Math.max(need * 24, ore.length * 2)
      const a = new Float64Array(len)
      const b = new Float64Array(len)

      a.set(ore)
      b.set(oim)
      ore = a
      oim = b
    }

    // a state shorter than the interned patterns holds zero on the rest
    const held = Math.min(n0, Math.floor(re.length / 24))

    for (let w = 0; w < held; w++) {
      let empty = true

      for (let d = 0; d < 24; d++) {
        if (re[w * 24 + d] !== 0 || im[w * 24 + d] !== 0) {
          empty = false
          break
        }
      }

      if (empty) {
        continue
      }

      applyVibe(this.table, 0, re, im, w * 24, 1, tr, ti, 0, 1)

      for (let d = 0; d < 24; d++) {
        const x = tr[d]!
        const y = ti[d]!
        const t = this.hopTarget(w, d)

        if (t < 0) {
          lost += x * x + y * y
          continue
        }

        grow(this.size)

        // link-flux treeBeat's arithmetic, term for term
        const ph = -this.sigma * this.cost[t]!
        const c = Math.cos(ph)
        const sn = Math.sin(ph)

        ore[t * 24 + d] = ore[t * 24 + d]! + x * c - y * sn
        oim[t * 24 + d] = oim[t * 24 + d]! + x * sn + y * c
      }
    }

    if (this.magnetic.kind === 'off') {
      return { re: ore, im: oim, lost }
    }

    const { stay, move } = this.magnetic
    const faces =
      this.magnetic.kind === 'ks' ? this.magnetic.faces : undefined

    const pw = (n: number, mv: number): [number, number] => {
      let a: [number, number] = [1, 0]

      for (let j = 0; j < n - mv; j++) {
        a = [
          a[0] * stay[0] - a[1] * stay[1],
          a[0] * stay[1] + a[1] * stay[0],
        ]
      }

      for (let j = 0; j < mv; j++) {
        a = [
          a[0] * move[0] - a[1] * move[1],
          a[0] * move[1] + a[1] * move[0],
        ]
      }

      return a
    }

    // the weight a class sends past the box: its norm drop (branches past the box are dropped before they interfere)
    const norm = (a: Float64Array, b: Float64Array): number => {
      let s = 0

      for (let k = 0; k < a.length; k++) {
        s += a[k]! ** 2 + b[k]! ** 2
      }

      return s
    }

    for (let c = 0; c < 8; c++) {
      const before = norm(ore, oim)
      const n1 = this.size

      let nre = new Float64Array(Math.max(n1, 1) * 24)
      let nim = new Float64Array(Math.max(n1, 1) * 24)

      for (let w = 0; w < n1; w++) {
        if (w * 24 >= ore.length) {
          break
        }

        let empty = true

        for (let d = 0; d < 24; d++) {
          if (ore[w * 24 + d] !== 0 || oim[w * 24 + d] !== 0) {
            empty = false
            break
          }
        }

        if (empty) {
          continue
        }

        const br = this.mixTargets(w, c, faces)

        for (let m = 0; m < br.to.length; m++) {
          const [ar, ai] = pw(br.code[m]!, br.moved[m]!)
          const t = br.to[m]!

          if (t < 0) {
            continue
          }

          if ((t + 1) * 24 > nre.length) {
            const len = Math.max((t + 1) * 24, nre.length * 2)
            const a = new Float64Array(len)
            const b = new Float64Array(len)

            a.set(nre)
            b.set(nim)
            nre = a
            nim = b
          }

          for (let d = 0; d < 24; d++) {
            const x = ore[w * 24 + d]!
            const y = oim[w * 24 + d]!

            nre[t * 24 + d] = nre[t * 24 + d]! + ar * x - ai * y
            nim[t * 24 + d] = nim[t * 24 + d]! + ar * y + ai * x
          }
        }
      }

      ore = nre
      oim = nim
      lost += before - norm(ore, oim)
    }

    return { re: ore, im: oim, lost }
  }
}

// the member's position distribution (by dock key) of a TiedFlux state
export function tiedPositions(
  s: TiedFlux,
  re: Float64Array,
  im: Float64Array,
): Map<string, number> {
  const out = new Map<string, number>()

  for (let i = 0; i < s.size && i * 24 < re.length; i++) {
    let w = 0

    for (let d = 0; d < 24; d++) {
      w += re[i * 24 + d]! ** 2 + im[i * 24 + d]! ** 2
    }

    if (w === 0) {
      continue
    }

    const k = s.where[i]!.join(',')

    out.set(k, (out.get(k) ?? 0) + w)
  }

  return out
}

// the weight by cost (number of links holding flux)
export function tiedCostProfile(
  s: TiedFlux,
  re: Float64Array,
  im: Float64Array,
): number[] {
  const out = new Array<number>(s.maxCost + 1).fill(0)

  for (let i = 0; i < s.size && i * 24 < re.length; i++) {
    let w = 0

    for (let d = 0; d < 24; d++) {
      w += re[i * 24 + d]! ** 2 + im[i * 24 + d]! ** 2
    }

    out[s.cost[i]!]! += w
  }

  return out
}

// the member's reduced state: Gauss fixes the member's dock from the pattern, so the state traced over the register is
// block-diagonal in the dock, one 24 x 24 block (re, im interleaved) per dock
export function tiedBlocks(
  s: TiedFlux,
  re: Float64Array,
  im: Float64Array,
): Map<string, Float64Array> {
  const out = new Map<string, Float64Array>()

  for (let i = 0; i < s.size && i * 24 < re.length; i++) {
    let any = false

    for (let d = 0; d < 24; d++) {
      if (re[i * 24 + d] !== 0 || im[i * 24 + d] !== 0) {
        any = true
      }
    }

    if (!any) {
      continue
    }

    const k = s.where[i]!.join(',')

    let b = out.get(k)

    if (!b) {
      b = new Float64Array(1152)
      out.set(k, b)
    }

    for (let a = 0; a < 24; a++) {
      const ar = re[i * 24 + a]!
      const ai = im[i * 24 + a]!

      for (let c = 0; c < 24; c++) {
        const cr = re[i * 24 + c]!
        const ci = im[i * 24 + c]!

        b[(a * 24 + c) * 2] = b[(a * 24 + c) * 2]! + ar * cr + ai * ci
        b[(a * 24 + c) * 2 + 1] =
          b[(a * 24 + c) * 2 + 1]! + ai * cr - ar * ci
      }
    }
  }

  return out
}

// the largest entry gap between two reduced states
export function blockGap(
  a: Map<string, Float64Array>,
  b: Map<string, Float64Array>,
): number {
  let gap = 0

  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(k)
    const y = b.get(k)

    for (let j = 0; j < 1152; j++) {
      gap = Math.max(gap, Math.abs((x ? x[j]! : 0) - (y ? y[j]! : 0)))
    }
  }

  return gap
}

// ---- the stringless D4 walk (the reference: every path to a dock interferes) ----

// (`phase`, optional: cos and sin per point, the string's phase exp(-i sigma V(x)) of the dock reached, a cost read from
// the positions: the "light member in a linear well" reference, not a local string)
export function d4Walk(
  table: Float64Array,
  step: Int32Array,
  points: number,
  re: Float64Array,
  im: Float64Array,
  phase?: Float64Array,
): { re: Float64Array; im: Float64Array; lost: number } {
  const ore = new Float64Array(points * 24)
  const oim = new Float64Array(points * 24)
  const tr = new Float64Array(24)
  const ti = new Float64Array(24)

  let lost = 0

  for (let p = 0; p < points; p++) {
    applyVibe(table, 0, re, im, p * 24, 1, tr, ti, 0, 1)

    for (let d = 0; d < 24; d++) {
      const x = tr[d]!
      const y = ti[d]!
      const t = step[p * 24 + d]!

      if (x === 0 && y === 0) {
        continue
      }

      if (t < 0) {
        lost += x * x + y * y
        continue
      }

      if (phase) {
        const c = phase[2 * t]!
        const s = phase[2 * t + 1]!

        ore[t * 24 + d] = ore[t * 24 + d]! + x * c - y * s
        oim[t * 24 + d] = oim[t * 24 + d]! + x * s + y * c
      } else {
        ore[t * 24 + d] = ore[t * 24 + d]! + x
        oim[t * 24 + d] = oim[t * 24 + d]! + y
      }
    }
  }

  return { re: ore, im: oim, lost }
}

// ---- spectral readings of a beat given as a closure (a state may grow as patterns are interned) ----

export type Beat = (
  re: Float64Array,
  im: Float64Array,
) => { re: Float64Array; im: Float64Array; lost: number }

export function innerOf(
  ar: Float64Array,
  ai: Float64Array,
  br: Float64Array,
  bi: Float64Array,
): [number, number] {
  const n = Math.min(ar.length, br.length)

  let r = 0
  let i = 0

  for (let k = 0; k < n; k++) {
    r += ar[k]! * br[k]! + ai[k]! * bi[k]!
    i += ar[k]! * bi[k]! - ai[k]! * br[k]!
  }

  return [r, i]
}

// c_t = <psi|U^t psi> for t < T, the weight absorbed, and the Hann-windowed density on a grid of the per-beat phase
export function beatSpectrum(
  beat: Beat,
  re0: Float64Array,
  im0: Float64Array,
  T: number,
  grid: number,
): { phase: number[]; density: number[]; absorbed: number } {
  let re = Float64Array.from(re0)
  let im = Float64Array.from(im0)

  const auto: [number, number][] = []

  let absorbed = 0

  for (let t = 0; t < T; t++) {
    if (t > 0) {
      const r = beat(re, im)

      re = r.re
      im = r.im
      absorbed += r.lost
    }

    auto.push(innerOf(re0, im0, re, im))
  }

  const phase: number[] = []
  const density: number[] = []

  for (let g = 0; g < grid; g++) {
    const ph = -Math.PI + (2 * Math.PI * (g + 1)) / grid

    let d = 0

    for (let t = 0; t < T; t++) {
      const w = 0.5 + 0.5 * Math.cos((Math.PI * t) / T)
      const [a, b] = auto[t]!

      d +=
        (t === 0 ? 1 : 2) *
        w *
        (a * Math.cos(ph * t) + b * Math.sin(ph * t))
    }

    phase.push(ph)
    density.push(d / (2 * Math.PI))
  }

  return { phase, density, absorbed }
}

// the Blackman-Harris filter at a per-beat phase over S beats, normalized, then lambda = <v|U v>, its phase, the
// residual |U v - lambda v| and the weight the read beat absorbs
export function beatLevel(
  beat: Beat,
  re0: Float64Array,
  im0: Float64Array,
  phase: number,
  S: number,
  passes: number,
): {
  re: Float64Array
  im: Float64Array
  lambda: [number, number]
  phase: number
  residual: number
  lost: number
} {
  let sr = Float64Array.from(re0)
  let si = Float64Array.from(im0)
  let out = {
    re: sr,
    im: si,
    lambda: [0, 0] as [number, number],
    phase,
    residual: NaN,
    lost: 0,
  }

  for (let pass = 0; pass < passes; pass++) {
    let vr = new Float64Array(sr.length)
    let vi = new Float64Array(sr.length)
    let xr = Float64Array.from(sr)
    let xi = Float64Array.from(si)

    for (let t = 0; t < S; t++) {
      if (t > 0) {
        const r = beat(xr, xi)

        xr = r.re
        xi = r.im
      }

      if (xr.length > vr.length) {
        const a = new Float64Array(xr.length)
        const b = new Float64Array(xr.length)

        a.set(vr)
        b.set(vi)
        vr = a
        vi = b
      }

      const w = blackmanHarris(t, S)
      const c = Math.cos(-out.phase * t) * w
      const s = Math.sin(-out.phase * t) * w

      for (let k = 0; k < xr.length; k++) {
        const a = xr[k]!
        const b = xi[k]!

        if (a === 0 && b === 0) {
          continue
        }

        vr[k] = vr[k]! + a * c - b * s
        vi[k] = vi[k]! + a * s + b * c
      }
    }

    const n = Math.sqrt(innerOf(vr, vi, vr, vi)[0])

    for (let k = 0; k < vr.length; k++) {
      vr[k] = vr[k]! / n
      vi[k] = vi[k]! / n
    }

    const u = beat(vr, vi)
    const lam = innerOf(vr, vi, u.re, u.im)

    let res = 0

    for (let k = 0; k < u.re.length; k++) {
      const a = k < vr.length ? vr[k]! : 0
      const b = k < vi.length ? vi[k]! : 0
      const er = u.re[k]! - (lam[0] * a - lam[1] * b)
      const ei = u.im[k]! - (lam[0] * b + lam[1] * a)

      res += er * er + ei * ei
    }

    out = {
      re: vr,
      im: vi,
      lambda: lam,
      phase: Math.atan2(lam[1], lam[0]),
      residual: Math.sqrt(res),
      lost: u.lost,
    }
    sr = vr
    si = vi
  }

  return out
}
