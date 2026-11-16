// The FINITE QUOTIENT of the {3,4,3,4} honeycomb modulo a prime ideal of Z[sqrt 2] (item vibe-roadmap-honeycomb-0008,
// audit.md section 3.3, note/honeycomb-transfer-radius.md section 6). exact-3434.ts gives the transports k_a = F_a Z as
// exact matrices over Z[sqrt 2]. Reduced modulo (3 + sqrt 2) (residue field F_7, sqrt 2 -> 4) they generate a finite
// group K_7, the image of the frame group K. Its Cayley graph (docks = elements, slot a = right multiplication by k_a)
// is a 24-regular labelled graph with no boundary, the honeycomb's analogue of the periodic box.
//
// THE PIECES, all exact (residues mod p, never floats):
//
// - `schreierSims`: the order of a matrix group over F_p, by a deterministic Schreier-Sims chain on its action on
//   F_p^5 (base points unit vectors, so the action is faithful). Every Schreier generator of every level is sifted, so
//   the order is exact, not a lower bound. Its chain also tests membership.
// - `quotientOrders`: |G_p| (the reflections s0..s4), |K_p| (the 24 transports), |K_p cap H_p| by sifting all 1,152
//   elements of H = W(F4) through K_p's chain, and the normal closure in H of the cusp twists. A unipotent cusp
//   translation u has (u - 1)^3 = 0, so u^p = 1 mod p for p >= 3. A unit translation along the cusp is u = k_a h with
//   phi(u) = h, the twist (exact-cusp.ts), so u^p h^-p = u^p h^-1 lies in K and reduces to h^-1: every twist lies in
//   K_p cap H_p. The label-consistent quotient is therefore |K_p cap H_p| times the cell quotient |G_p| / 1152.
// - `cuspTorus`: the layer of a cusp in K_p. The layer dock n steps along the three axes has frame
//   U(n) = u1^n1 u2^n2 u3^n3 (h1^n1 h2^n2 h3^n3)^-1 (an element of K). It counts the n in [0, 2p)^3 with U(n) = 1 mod p
//   (the kernel lattice, predicted 2p Z^3) and checks that the (2p)^3 frames are distinct.
// - `quotientSystole`: the largest r for which the reduced r-ball equals the exact honeycomb's labelled r-ball. Up to
//   `exactRadius` the two tables are compared entry for entry. Past it, the reduced ball alone decides it: the honeycomb
//   graph is bipartite (every relator of K has even length) with exact shells 1, 24, 456, 8,376, 153,192, so the r-ball
//   embeds exactly when the reduced shells match through r and no reduced edge joins two docks of one shell (an extra
//   edge between shells r - 1 and r would be an odd closed walk of length < 2r + 1, which the shells already rule out).
// - `buildQuotient3434`: the whole Cayley graph as the Mesh the working rule takes (makeVibeWeave on a mesh: degree 24,
//   neighbours facing back by OPPOSITE; lockedTables: the same OPPOSITE label order), refusing above `maxDocks`.
//
// NOTHING MOVES: this file builds tables and counts.

import {
  buildExactBall,
  exactCell,
  reduceMatrix,
  reducedProduct,
  reductionRoot,
  type ExactCell,
  type ExactReduction,
} from '@/code/substrate/coxeter/exact-3434'
import { cuspTranslations } from '@/code/substrate/coxeter/exact-cusp'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { type Mesh } from '@/code/tool/mesh'

const DIM = 5
const ENTRIES = DIM * DIM
const SLOTS = 24

// the exact shells of the honeycomb's ball (E-GMT-0040)
export const EXACT_SHELLS: readonly number[] = [1, 24, 456, 8376, 153192]

type Residues = number[]

function identityResidues(): Residues {
  const m = new Array<number>(ENTRIES).fill(0)

  for (let i = 0; i < DIM; i++) {
    m[i * DIM + i] = 1
  }

  return m
}

const isIdentity = (m: Residues): boolean =>
  m.every((v, e) => v === (e % (DIM + 1) === 0 ? 1 : 0))

function modPow(base: number, exp: number, p: number): number {
  let r = 1
  let b = base % p
  let e = exp

  while (e > 0) {
    if (e & 1) {
      r = (r * b) % p
    }

    b = (b * b) % p
    e >>= 1
  }

  return r
}

export function inverseResidues(m: Residues, p: number): Residues {
  const a = m.slice()
  const inv = identityResidues()

  for (let col = 0; col < DIM; col++) {
    let pivot = col

    while (pivot < DIM && a[pivot * DIM + col] === 0) {
      pivot++
    }

    if (pivot === DIM) {
      throw new Error('inverseResidues: singular mod p')
    }

    for (let j = 0; j < DIM; j++) {
      const s = a[col * DIM + j]!
      const t = inv[col * DIM + j]!

      a[col * DIM + j] = a[pivot * DIM + j]!
      a[pivot * DIM + j] = s
      inv[col * DIM + j] = inv[pivot * DIM + j]!
      inv[pivot * DIM + j] = t
    }

    const scale = modPow(a[col * DIM + col]!, p - 2, p)

    for (let j = 0; j < DIM; j++) {
      a[col * DIM + j] = (a[col * DIM + j]! * scale) % p
      inv[col * DIM + j] = (inv[col * DIM + j]! * scale) % p
    }

    for (let r = 0; r < DIM; r++) {
      const f = a[r * DIM + col]!

      if (r === col || f === 0) {
        continue
      }

      for (let j = 0; j < DIM; j++) {
        a[r * DIM + j] = (a[r * DIM + j]! + (p - f) * a[col * DIM + j]!) % p
        inv[r * DIM + j] = (inv[r * DIM + j]! + (p - f) * inv[col * DIM + j]!) % p
      }
    }
  }

  return inv
}

// ---- Schreier-Sims on the action of a matrix group on F_p^5 (column vectors, a point is sum x_i p^i) ----

function applyToPoint(g: Residues, point: number, p: number): number {
  const x: number[] = []
  let rest = point

  for (let i = 0; i < DIM; i++) {
    x.push(rest % p)
    rest = Math.floor(rest / p)
  }

  let out = 0
  let place = 1

  for (let i = 0; i < DIM; i++) {
    let s = 0

    for (let k = 0; k < DIM; k++) {
      s += g[i * DIM + k]! * x[k]!
    }

    out += (s % p) * place
    place *= p
  }

  return out
}

type Level = {
  readonly base: number
  readonly gens: Residues[]
  // orbit point -> (t, t^-1) with t base = point
  orbit: Map<number, { t: Residues; ti: Residues }>
}

export type StabilizerChain = {
  readonly prime: number
  readonly order: number
  readonly orbitSizes: number[]
  readonly bases: number[]
  readonly generatorCount: number
  // true when g lies in the group
  contains(g: Residues): boolean
}

// A deterministic Schreier-Sims chain. Every Schreier generator t_{sq}^-1 s t_q of every level sifts to 1 when it
// returns, so the order is exact.
export function schreierSims(generators: Residues[], prime: number): StabilizerChain {
  const p = prime
  const levels: Level[] = []
  const unitPoint = (i: number): number => p ** i

  const levelGens = (i: number): Residues[] => levels.slice(i).flatMap(l => l.gens)

  const rebuildOrbit = (i: number): void => {
    const level = levels[i]!
    const gens = levelGens(i)
    const one = identityResidues()
    const orbit = new Map<number, { t: Residues; ti: Residues }>([
      [level.base, { t: one, ti: one }],
    ])
    const queue = [level.base]

    for (let head = 0; head < queue.length; head++) {
      const q = queue[head]!
      const { t } = orbit.get(q)!

      for (const s of gens) {
        const sq = applyToPoint(s, q, p)

        if (!orbit.has(sq)) {
          const st = reducedProduct(s, t, p)

          orbit.set(sq, { t: st, ti: inverseResidues(st, p) })
          queue.push(sq)
        }
      }
    }

    level.orbit = orbit
  }

  const sift = (g: Residues, from: number): { residue: Residues; level: number } => {
    let h = g

    for (let i = from; i < levels.length; i++) {
      const level = levels[i]!
      const entry = level.orbit.get(applyToPoint(h, level.base, p))

      if (!entry) {
        return { residue: h, level: i }
      }

      h = reducedProduct(entry.ti, h, p)
    }

    return { residue: h, level: levels.length }
  }

  const add = (g: Residues, at: number): void => {
    if (at === levels.length) {
      let base = -1

      for (let i = 0; i < DIM && base < 0; i++) {
        if (applyToPoint(g, unitPoint(i), p) !== unitPoint(i)) {
          base = unitPoint(i)
        }
      }

      levels.push({ base, gens: [], orbit: new Map() })
    }

    levels[at]!.gens.push(g)

    for (let i = 0; i <= at; i++) {
      rebuildOrbit(i)
    }
  }

  const offer = (g: Residues, from: number): number => {
    const { residue, level } = sift(g, from)

    if (level === levels.length && isIdentity(residue)) {
      return -1
    }

    add(residue, level)

    return level
  }

  for (const g of generators) {
    offer(g, 0)
  }

  // warm up with random products (deterministic seed), so the verification below adds few generators
  let seed = 0x2545f491
  const random = (n: number): number => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0

    return seed % n
  }
  const pool = generators.slice()

  if (pool.length > 0) {
    for (let k = 0; k < 400; k++) {
      const i = random(pool.length)
      const j = random(pool.length)

      if (i !== j) {
        pool[i] = reducedProduct(pool[i]!, pool[j]!, p)
      }

      offer(pool[i]!, 0)
    }
  }

  // verification: every Schreier generator of every level, deepest first
  let i = levels.length - 1

  while (i >= 0) {
    const level = levels[i]!
    const gens = levelGens(i)
    let restartAt = -1

    for (const [q, { t }] of level.orbit) {
      for (const s of gens) {
        const target = level.orbit.get(applyToPoint(s, q, p))!
        const h = reducedProduct(target.ti, reducedProduct(s, t, p), p)
        const at = offer(h, i + 1)

        if (at >= 0) {
          restartAt = at
          break
        }
      }

      if (restartAt >= 0) {
        break
      }
    }

    i = restartAt >= 0 ? Math.max(restartAt, i) : i - 1
  }

  const orbitSizes = levels.map(l => l.orbit.size)

  return {
    prime: p,
    order: orbitSizes.reduce((a, b) => a * b, 1),
    orbitSizes,
    bases: levels.map(l => l.base),
    generatorCount: levels.reduce((s, l) => s + l.gens.length, 0),
    contains(g) {
      const { residue, level } = sift(g, 0)

      return level === levels.length && isIdentity(residue)
    },
  }
}

// |O(5, q)| = 2 q^4 (q^2 - 1)(q^4 - 1), the bound |G_p| must divide
export const orthogonalOrder = (q: number): number =>
  2 * q ** 4 * (q ** 2 - 1) * (q ** 4 - 1)

// ---- the orders ----

export type QuotientOrders = {
  readonly prime: number
  readonly sqrtTwo: number
  readonly groupOrder: number
  readonly frameOrder: number
  readonly frameMeetsCell: number
  readonly twistClosure: number
  // every twist lies in K_p (the prediction from u^p = 1)
  readonly twistsInFrames: boolean
  // u^p = 1 mod p on every axis
  readonly unipotentPeriod: boolean
  readonly cellQuotient: number
  readonly chains: { group: StabilizerChain; frames: StabilizerChain }
}

export function quotientOrders(
  reduce: ExactReduction,
  cell: ExactCell = exactCell(),
): QuotientOrders {
  const p = reduce.prime
  const reflections = cell.reflections.map(m => reduceMatrix(m, reduce))
  const transports = cell.transports.map(m => reduceMatrix(m, reduce))
  const group = schreierSims(reflections, p)
  const frames = schreierSims(transports, p)
  const cellElements = cell.stabilizer.map(h => reduceMatrix(h, reduce))
  const frameMeetsCell = cellElements.filter(h => frames.contains(h)).length

  const axes = cuspTranslations(cell).axes
  const twists = axes.map(a => reduceMatrix(a.twist, reduce))
  const unipotentPeriod = axes.every(a => {
    let u = identityResidues()
    const step = reduceMatrix(a.translation, reduce)

    for (let k = 0; k < p; k++) {
      u = reducedProduct(u, step, p)
    }

    return isIdentity(u)
  })

  // the normal closure of the twists in H, by closing their conjugates under products
  const keyOf = (m: Residues): string => m.join(',')
  const inverses = cellElements.map(h => inverseResidues(h, p))
  const closure = new Map<string, Residues>()
  const queue: Residues[] = []
  const push = (m: Residues): void => {
    const key = keyOf(m)

    if (!closure.has(key)) {
      closure.set(key, m)
      queue.push(m)
    }
  }

  push(identityResidues())

  const conjugates: Residues[] = []

  for (const t of twists) {
    cellElements.forEach((h, i) => {
      conjugates.push(reducedProduct(reducedProduct(h, t, p), inverses[i]!, p))
    })
  }

  for (let head = 0; head < queue.length; head++) {
    for (const c of conjugates) {
      push(reducedProduct(queue[head]!, c, p))
    }
  }

  return {
    prime: p,
    sqrtTwo: reductionRoot(reduce),
    groupOrder: group.order,
    frameOrder: frames.order,
    frameMeetsCell,
    twistClosure: closure.size,
    twistsInFrames: twists.every(t => frames.contains(t)),
    unipotentPeriod,
    cellQuotient: group.order / cellElements.length,
    chains: { group, frames },
  }
}

// ---- the cusp torus ----

export type CuspTorus = {
  // n in [0, 2p)^3 with U(n) = 1 mod p, n != 0
  readonly kernel: number[][]
  // the smallest n > 0 with U(n e_j) = 1 on each axis
  readonly axisPeriods: number[]
  // the (2p)^3 frames U(n) are distinct elements of K_p
  readonly distinct: boolean
  readonly side: number
  readonly layerDocks: number
}

export function cuspTorus(
  reduce: ExactReduction,
  cell: ExactCell = exactCell(),
): CuspTorus {
  const p = reduce.prime
  const side = 2 * p
  const axes = cuspTranslations(cell).axes
  const u = axes.map(a => reduceMatrix(a.translation, reduce))
  const h = axes.map(a => reduceMatrix(a.twist, reduce))
  const powers = (m: Residues): Residues[] => {
    const out = [identityResidues()]

    for (let k = 1; k < side; k++) {
      out.push(reducedProduct(out[k - 1]!, m, p))
    }

    return out
  }
  const uPow = u.map(powers)
  const hPow = h.map(powers)
  const seen = new Set<string>()
  const kernel: number[][] = []
  let distinct = true

  for (let a = 0; a < side; a++) {
    for (let b = 0; b < side; b++) {
      for (let c = 0; c < side; c++) {
        const n = [a, b, c]
        const translation = n.reduce(
          (m, e, j) => reducedProduct(m, uPow[j]![e]!, p),
          identityResidues(),
        )
        const twist = n.reduce(
          (m, e, j) => reducedProduct(m, hPow[j]![e]!, p),
          identityResidues(),
        )
        const frame = reducedProduct(translation, inverseResidues(twist, p), p)
        const key = frame.join(',')

        distinct &&= !seen.has(key)
        seen.add(key)

        if (isIdentity(frame) && (a | b | c) !== 0) {
          kernel.push(n)
        }
      }
    }
  }

  const axisPeriods = [0, 1, 2].map(j => {
    for (let k = 1; k <= side; k++) {
      const frame = reducedProduct(
        uPow[j]![k % side]!,
        inverseResidues(hPow[j]![k % side]!, p),
        p,
      )

      if (k === side || isIdentity(frame)) {
        return k
      }
    }

    return side
  })

  return { kernel, axisPeriods, distinct, side, layerDocks: seen.size }
}

// ---- the systole ----

export type QuotientSystole = {
  // the largest r <= maxRadius whose reduced r-ball equals the honeycomb's labelled r-ball
  readonly systole: number
  readonly reducedShells: number[]
  // per radius: whether the tables matched the exact ball (r <= exactRadius), the shells matched, and the edges that
  // join two docks of one shell
  readonly rows: { radius: number; tablesEqual: boolean | null; shellsEqual: boolean; sameShellEdges: number }[]
}

export function quotientSystole(
  reduce: ExactReduction,
  maxRadius: number,
  exactRadius: number,
  cell: ExactCell = exactCell(),
): QuotientSystole {
  const reduced = buildExactBall({ radius: maxRadius, reduce, cell })
  const rows: QuotientSystole['rows'] = []
  let systole = -1

  for (let r = 0; r <= maxRadius; r++) {
    const shellsEqual = reduced.shells
      .slice(0, r + 1)
      .every((n, d) => n === EXACT_SHELLS[d])
    let sameShellEdges = 0

    for (let c = 0; c < reduced.cells; c++) {
      if (reduced.distance[c]! > r) {
        continue
      }

      for (let k = 0; k < SLOTS; k++) {
        const y = reduced.table[c * SLOTS + k]!

        if (y >= 0 && reduced.distance[y]! === reduced.distance[c]!) {
          sameShellEdges++
        }
      }
    }

    let tablesEqual: boolean | null = null

    if (r <= exactRadius) {
      const exact = buildExactBall({ radius: r, cell })
      const small = buildExactBall({ radius: r, reduce, cell })

      tablesEqual =
        exact.table.length === small.table.length &&
        exact.table.every((v, i) => v === small.table[i])
    }

    const ok = shellsEqual && sameShellEdges === 0 && tablesEqual !== false

    if (ok && systole === r - 1) {
      systole = r
    }

    rows.push({ radius: r, tablesEqual, shellsEqual, sameShellEdges })
  }

  return { systole, reducedShells: reduced.shells, rows }
}

// ---- the quotient as a mesh ----

export type Quotient3434 = {
  readonly mesh: Mesh
  readonly cells: number
  readonly table: Int32Array
  readonly prime: number
  readonly gates: { returnsExactly: boolean; oppositeIsKnitOpposite: boolean; noSelfLoops: boolean }
}

// The whole Cayley graph of K_p, breadth-first from the identity, slot by slot in rootsD4() order. Refuses (throws)
// when the group has more than maxDocks elements.
export function buildQuotient3434(input: {
  reduce: ExactReduction
  maxDocks: number
  cell?: ExactCell
}): Quotient3434 {
  const cell = input.cell ?? exactCell()
  const p = input.reduce.prime
  const transports = cell.transports.map(m => reduceMatrix(m, input.reduce))
  const order = schreierSims(transports, p).order

  if (order > input.maxDocks) {
    throw new Error(
      `buildQuotient3434: |K_${p}| = ${order} docks exceeds maxDocks ${input.maxDocks}`,
    )
  }

  const one = identityResidues()
  const frames: Residues[] = [one]
  const index = new Map<string, number>([[one.join(','), 0]])
  const table = new Int32Array(order * SLOTS)

  for (let head = 0; head < frames.length; head++) {
    const g = frames[head]!

    for (let k = 0; k < SLOTS; k++) {
      const next = reducedProduct(g, transports[k]!, p)
      const key = next.join(',')
      let id = index.get(key)

      if (id === undefined) {
        id = frames.length
        index.set(key, id)
        frames.push(next)
      }

      table[head * SLOTS + k] = id
    }
  }

  let returnsExactly = frames.length === order
  let noSelfLoops = true

  for (let c = 0; c < frames.length; c++) {
    for (let k = 0; k < SLOTS; k++) {
      const y = table[c * SLOTS + k]!

      returnsExactly &&= table[y * SLOTS + OPPOSITE[k]!] === c
      noSelfLoops &&= y !== c
    }
  }

  const oppositeIsKnitOpposite = cell.opposite.every((o, k) => o === OPPOSITE[k])
  const gates = { returnsExactly, oppositeIsKnitOpposite, noSelfLoops }
  const failed = Object.entries(gates).filter(([, ok]) => !ok)

  if (failed.length > 0) {
    throw new Error(`buildQuotient3434: fails ${failed.map(([n]) => n).join(', ')}`)
  }

  return {
    mesh: {
      id: `quotient-3434-mod-${p}-${reductionRoot(input.reduce)}`,
      degree: SLOTS,
      cellCount: frames.length,
      neighbour(c, direction) {
        return table[c * SLOTS + direction] ?? -1
      },
      opposite(direction) {
        return OPPOSITE[direction] ?? direction
      },
    },
    cells: frames.length,
    table,
    prime: p,
    gates,
  }
}
