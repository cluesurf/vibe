// Which living-vacuum store patterns can break W(F4) dock by dock and still leave the husk transport isotropic
// (E-RLT-0080 to E-RLT-0082). The rule is the living-pair knit (code/rule/living-pair-knit), unchanged and
// W(F4)-covariant; only the vacuum STATE is chosen here. A pattern is a set of units (dock x, line l, orientation
// tau = +-1): dock x stores tau on line l. It runs the exact period-6 vacuum iff (Z) every dock's beat-1
// occupation momentum is zero and (A) the neutral veto separates the two units that meet
// (code/measure/sparse-living-vacuum, E-RLT-0077).
//
// THE FORM OF (Z) USED HERE, derived. A unit (x, l) sends its love to x - r_l and its fear to x + r_l at beat 0,
// so dock y at beat 1 holds a vibe on the line through y and y + d exactly when the dock y + d stores the line of
// d (d any of the 24 roots). So
//      (Z)  for every dock y:  sum of d over the roots d with lineOf(y + d) = line(d)  =  0.
// A dock whose two neighbors along one line both store that line gets a pair that cancels; three roots of an A2
// triangle cancel too.
//
// WHAT FORCES THE TRANSPORT. The rule is covariant under W(F4) and the D4 translations, so a periodic vacuum's
// long-wave transport tensors are invariant under the LINEAR PARTS of the vacuum's own space group (the affine maps
// x -> g x + t, g in W(F4), that carry the stored pattern to itself, possibly with charge conjugation C, which
// negates every vibe and store and commutes with the rule; transport tensors are C-even). E-RLT-0058 and E-RLT-0063
// say which linear groups force which tensors. This module computes those groups exactly and asks
// code/measure/husk-transport-symmetry of them.
//
// FOUR FACTS PROVED HERE (each also checked by exhaustion in E-RLT-0080):
//  1. LINES MUST APPEAR EQUALLY. If the point group G forces the rank-4 scalars isotropic, every G-orbit of stored
//     lines is a spherical 4-design (its fourth moment is a G-invariant quartic, so a multiple of |k|^4). Among the
//     4,095 nonempty sets of D4 lines only the full set of 12 is a 4-design (designCensus), so every orbit carries
//     all 12 lines, each equally often.
//  2. NO PATTERN STORES A LINE ON EVERY DOCK AND IS FORCED ISOTROPIC. Let the period cell be Q = D4 / Lambda, a
//     finite abelian group, and let G hold -1 and an element g of order 3 that fixes no nonzero VECTOR (so 1 + g + g^2
//     = 0 and every affine image of g has order 3; such a g fixes no line either; 2T and W(F4) both hold one, and
//     E-RLT-0080 checks every forcing group found). An order-3 element that fixes no line but fixes a vector (32 of
//     W(F4)'s 48 line-free ones) does not serve: its affine images can be free. Their affine images on Q, g' = (g, t) and m = (-1, b),
//     commute (the pure translations of the space group are Lambda, trivial on Q). On the odd part of Q, m has
//     exactly one fixed dock (2 x = b has one solution when 2 is invertible), and g' commutes with m, so g' fixes
//     it. On the 2-part, the orbits of <g'> have size 1 or 3 and 3 does not divide a power of 2, so g' fixes a dock
//     there too. So g' fixes a dock of Q, and that dock's line would be fixed by g, which fixes none. The dock must
//     store nothing. (fixedDockCheck verifies the algebra on boxes of side 2 to 8.)
//  3. THE LEAST CELL IS 16 DOCKS. A lattice invariant under 2T (left multiplication by the Hurwitz units) is a
//     left ideal H beta of the Hurwitz order, principal, of index N(beta)^2 / 4 in D4 = H (1 + i): a perfect square.
//     With 12 stored docks (fact 1) and at least one empty (fact 2) the cell has at least 13 docks, so at least 16.
//  4. THE HUB PATTERN MEETS IT. Take Lambda = 2 D4. The 16 classes of D4 / 2 D4 are 0, the 12 classes r + 2 D4 of
//     the lines (r and -r are one class) and 3 classes of norm 4. Store line(r) on every dock of the class of r and
//     nothing on the other 4 classes. Every dock y +- r_l with lineOf = l has y - r_l = y + r_l mod 2 D4, so both
//     neighbors of y along a line store it or neither does: (Z) holds term by term. The stored dock x = h + r is the
//     midpoint of the two HUBS h and h + 2r (h in 2 D4) and stores the line joining them. At beat 1 every vacuum
//     vibe is on a hub (y - r_l = r_l mod 2 D4 forces y = 0 mod 2 D4); a hub is then full (24 vibes, momentum 0),
//     K = -1, the veto refuses all 12 lines and the stream copies every vibe home. The unoriented pattern is kept
//     by all 1,152 elements of W(F4) about a hub, so it forces the scalars through k^4 AND the shear at leading
//     order, the full symmetry of the symmetric knit.
//
// THE ORIENTATION IS A SECOND FIELD. A unit's store sign says which way its love goes, so the vacuum is an
// ORIENTED set of roots rho(x) = tau r_l, rho(x) = +-(x - h). Choosing rho is choosing a direction on every edge of
// the hub graph. No choice uniform in translation keeps the quaternion group Q8 (i H = +-H and j H = +-H force
// i H = j H = -H, and then k H = H, while k^2 = -1 needs k H = -H), so an isotropic vacuum needs a non-uniform
// orientation, found here by orientation search (orbits of units under chosen affine generators, each carrying a
// sign; a unit reached with both signs is a conflict and the group admits no orientation). No lift of W(F4) orients
// the hub pattern on the side-4 box (a long-root reflection with a fixed point fixes a hyperplane holding units along
// its root, which it reverses, and units across it, which it keeps), and 2T with one more element does: a group of
// 576 elements with the 12 short-root reflections and none of the long ones (orientedHub).
//
// NO ROUNDING, NO CONTINUITY: everything here is integer and exact except the forcing reports, which are
// measurements (husk-transport-symmetry evaluates invariant polynomials at deterministic points).

import { rootsD4 } from '@/code/algebra/group/root-system'
import { boxCellMapDoubled, d4BoxCell, d4BoxCoordinates, d4Coordinates, linearMapOfDoubled } from '@/code/substrate/d4-box'
import { binaryTetrahedralMatrices, LINE_FIRSTS, LINE_OF, OPPOSITE, SIDE, slotPermutationOf } from '@/code/rule/isometric-knit'
import { closure, type GroupTable } from '@/code/measure/color-isotropy-bound'
import { forcedIsotropic, matrixOfPermutation, type Matrix4 } from '@/code/measure/husk-transport-symmetry'

const ROOTS = rootsD4()
const LINE_ROOTS: readonly (readonly number[])[] = LINE_FIRSTS.map(f => ROOTS[f] as number[])

// ---- fact 1: which sets of lines are spherical designs ----

export type DesignCensus = { sets: number; twoDesigns: number; fourDesigns: number; fourDesignSizes: number[]; twoDesignSizes: number[]; frames: number[][] }

// the second moment sum_l r r^T and the fourth moment sum_l (r . k)^4 of a set of lines (one root per line), both
// tested for isotropy in exact integers
export function lineSetMoments(lines: readonly number[]): { two: boolean; four: boolean } {
  const s2 = new Array<number>(16).fill(0)
  const s4 = new Map<string, number>()

  for (const l of lines) {
    const r = LINE_ROOTS[l] as number[]

    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s2[i * 4 + j] = (s2[i * 4 + j] as number) + (r[i] as number) * (r[j] as number)

    for (let a = 0; a < 4; a++) {
      for (let b = a; b < 4; b++) {
        for (let c = b; c < 4; c++) {
          for (let d = c; d < 4; d++) {
            const key = `${a}${b}${c}${d}`

            s4.set(key, (s4.get(key) ?? 0) + (r[a] as number) * (r[b] as number) * (r[c] as number) * (r[d] as number))
          }
        }
      }
    }
  }

  const diagonal = s2[0] as number
  const two = s2.every((v, k) => (k % 5 === 0 ? v === diagonal : v === 0))
  // isotropic quartic c |k|^4: sum r_i^4 = c, sum r_i^2 r_j^2 = c / 3 (the coefficient of k_i^2 k_j^2 is
  // 6 sum r_i^2 r_j^2 and must be 2 c), every other moment 0
  const c = s4.get('0000') ?? 0
  let four = true

  for (const [key, v] of s4) {
    const counts = [0, 0, 0, 0]

    for (const ch of key) counts[Number(ch)] = (counts[Number(ch)] as number) + 1

    const shape = counts.filter(n => n > 0).sort((x, y) => y - x).join('')

    if (shape === '4') four = four && v === c
    else if (shape === '22') four = four && 3 * v === c
    else four = four && v === 0
  }

  return { two, four }
}

export function designCensus(): DesignCensus {
  let twoDesigns = 0
  let fourDesigns = 0
  const fourDesignSizes: number[] = []
  const twoDesignSizes = new Set<number>()
  const frames: number[][] = []

  for (let mask = 1; mask < 4096; mask++) {
    const lines = Array.from({ length: 12 }, (_, l) => l).filter(l => (mask >> l) & 1)
    const m = lineSetMoments(lines)

    if (m.two) {
      twoDesigns++
      twoDesignSizes.add(lines.length)
      if (lines.length === 4) frames.push(lines)
    }

    if (m.four) {
      fourDesigns++
      fourDesignSizes.push(lines.length)
    }
  }

  return { sets: 4095, twoDesigns, fourDesigns, fourDesignSizes, twoDesignSizes: [...twoDesignSizes].sort((a, b) => a - b), frames }
}

// ---- W(F4) as integer data ----

export type CoinData = {
  readonly table: GroupTable
  // per element: the doubled 4 x 4 matrix, the line each line goes to, and the side sign it arrives with
  readonly doubled: readonly (readonly (readonly number[])[])[]
  readonly lineImage: readonly Int8Array[]
  readonly lineSign: readonly Int8Array[]
  readonly order: readonly number[]
  readonly lineFree: readonly boolean[]
  // no nonzero vector of R^4 fixed (for order 3: 1 + g + g^2 = 0)
  readonly vectorFree: readonly boolean[]
}

export function coinData(table: GroupTable): CoinData {
  const n = table.permutations.length
  const doubled = table.permutations.map(p => linearMapOfDoubled(p) ?? [])
  const lineImage = table.permutations.map(p => Int8Array.from(LINE_FIRSTS, f => LINE_OF[p[f] as number] as number))
  const lineSign = table.permutations.map(p => Int8Array.from(LINE_FIRSTS, f => SIDE[p[f] as number] as number))
  const order = Array.from({ length: n }, (_, g) => {
    let x = g
    let k = 1

    while (x !== table.identity) {
      x = table.multiply[g * n + x] as number
      k++
    }

    return k
  })
  const lineFree = lineImage.map(im => im.every((m, l) => m !== l))
  // no fixed nonzero vector: det(2 I - 2 g) != 0, in integers
  const vectorFree = doubled.map(m => integerDeterminant(m.map((row, i) => row.map((x, j) => (i === j ? 2 : 0) - x))) !== 0)

  return { table, doubled, lineImage, lineSign, order, lineFree, vectorFree }
}

export function integerDeterminant(a: readonly (readonly number[])[]): number {
  if (a.length === 1) return (a[0] as number[])[0] as number

  return (a[0] as number[]).reduce((s, x, j) => s + (j % 2 === 0 ? 1 : -1) * x * integerDeterminant(a.slice(1).map(row => row.filter((_, k) => k !== j))), 0)
}

// ---- the forcing census by characters (exact) ----
//
// The dimension of the G-invariant quadratics and quartics on R^4, from the power sums p_k = tr(g^k) (exact: the
// doubled matrices are integers, tr((2g)^k) / 2^k): h_2 = (p1^2 + p2) / 2, h_4 = (p1^4 + 6 p1^2 p2 + 3 p2^2 + 8 p1 p3
// + 6 p4) / 24, averaged over G. G forces the bulk rank-2 scalars when the quadratics are 1-dimensional (|k|^2) and
// the rank-4 scalars when the quartics are 1-dimensional (|k|^4); the bulk forcing implies the husk one.

function powerSums(m2: readonly (readonly number[])[]): number[] {
  const mul = (a: number[][], b: readonly (readonly number[])[]): number[][] => a.map(row => [0, 1, 2, 3].map(j => row.reduce((s, x, k) => s + x * ((b[k] as number[])[j] as number), 0)))
  let power: number[][] = m2.map(r => [...r])
  const sums: number[] = []

  for (let k = 1; k <= 4; k++) {
    sums.push([0, 1, 2, 3].reduce((s, i) => s + ((power[i] as number[])[i] as number), 0) / 2 ** k)
    power = mul(power, m2)
  }

  return sums
}

export type CharacterForcing = { quadratics: number; quartics: number; bulk2: boolean; bulk4: boolean }

export function characterForcing(coins: CoinData, group: readonly number[]): CharacterForcing {
  let h2 = 0
  let h4 = 0

  for (const g of group) {
    const [p1 = 0, p2 = 0, p3 = 0, p4 = 0] = powerSums(coins.doubled[g] as number[][])

    h2 += (p1 * p1 + p2) / 2
    h4 += (p1 ** 4 + 6 * p1 * p1 * p2 + 3 * p2 * p2 + 8 * p1 * p3 + 6 * p4) / 24
  }

  const quadratics = Math.round(h2 / group.length)
  const quartics = Math.round(h4 / group.length)

  return { quadratics, quartics, bulk2: quadratics === 1, bulk4: quartics === 1 }
}

// the husk forcing (E-RLT-0058's test) of a group, and its matrices
export function groupMatrices(coins: CoinData, group: readonly number[]): Matrix4[] {
  return group.map(g => matrixOfPermutation(coins.table.permutations[g] ?? []))
}

export type HuskForcing = { husk2: boolean; husk4: boolean; huskShear2: boolean }

export function huskForcing(coins: CoinData, group: readonly number[]): HuskForcing {
  const matrices = groupMatrices(coins, group)

  return {
    husk2: forcedIsotropic({ group: matrices, kind: 'scalar', degree: 2, husk: true }).forced,
    husk4: forcedIsotropic({ group: matrices, kind: 'scalar', degree: 4, husk: true }).forced,
    huskShear2: forcedIsotropic({ group: matrices, kind: 'transverse', degree: 2, husk: true }).forced,
  }
}

// ---- fact 2: the fixed dock of an order-3 line-free element ----
//
// On the box of side L (cells = D4 / L D4 in basis coordinates), the affine map x -> g x + t has a fixed dock iff t
// lies in the image D of 1 - g. It commutes with an affine -1, x -> -x + b, iff 2 t = b - g b, i.e. 2 t in D. The
// claim of fact 2 is that every t with 2 t in D lies in D. Returned: the translations giving a free map at all, and
// those among the commuting ones (the claim says 0).

export type FixedDock = { side: number; translations: number; free: number; freeCommuting: number }

export function fixedDockCheck(coins: CoinData, g: number, side: number): FixedDock {
  const cells = side ** 4
  const map = boxCellMapDoubled({ doubled: coins.doubled[g] as number[][], side })

  if (!map) throw new Error(`element ${g} does not act on the side-${side} box`)

  const inImage = new Uint8Array(cells)

  for (let x = 0; x < cells; x++) {
    const a = d4BoxCoordinates({ cell: x, side })
    const b = d4BoxCoordinates({ cell: map[x] as number, side })

    inImage[d4BoxCell({ coordinates: a.map((v, k) => v - (b[k] as number)), side })] = 1
  }

  let free = 0
  let freeCommuting = 0

  for (let t = 0; t < cells; t++) {
    if (inImage[t] === 1) continue

    free++

    const c = d4BoxCoordinates({ cell: t, side })

    if (inImage[d4BoxCell({ coordinates: c.map(v => 2 * v), side })] === 1) freeCommuting++
  }

  return { side, translations: cells, free, freeCommuting }
}

// ---- fact 3: the indices of the invariant sublattices ----
//
// The submodules of D4 / L D4 generated by the orbit of one vector under a group (given as cell maps of the side-L
// box), and, when `pairs`, the sums of two of them; returned: the distinct indices L^4 / |M|.

export function invariantIndices(maps: readonly (readonly number[])[], side: number, pairs: boolean): number[] {
  const cells = side ** 4
  const coords = Array.from({ length: cells }, (_, x) => d4BoxCoordinates({ cell: x, side }))
  const add = (a: number, b: number): number => d4BoxCell({ coordinates: (coords[a] as number[]).map((v, k) => v + ((coords[b] as number[])[k] as number)), side })
  const span = (gens: readonly number[]): Uint8Array => {
    const inM = new Uint8Array(cells)
    const queue = [0]

    inM[0] = 1

    while (queue.length > 0) {
      const x = queue.pop() as number

      for (const g of gens) {
        const y = add(x, g)

        if (inM[y] === 0) {
          inM[y] = 1
          queue.push(y)
        }
      }
    }

    return inM
  }
  const seen = new Map<string, { gens: number[]; size: number }>()

  for (let v = 0; v < cells; v++) {
    const orbit = [...new Set(maps.map(m => m[v] as number))]
    const inM = span(orbit)
    const members: number[] = []

    for (let x = 0; x < cells; x++) if (inM[x] === 1) members.push(x)

    const key = members.join(',')

    if (!seen.has(key)) seen.set(key, { gens: orbit, size: members.length })
  }

  const indices = new Set<number>([...seen.values()].map(m => cells / m.size))

  if (pairs) {
    const list = [...seen.values()]

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const inM = span([...(list[i] as { gens: number[] }).gens, ...(list[j] as { gens: number[] }).gens])
        let size = 0

        for (let x = 0; x < cells; x++) size += inM[x] as number

        indices.add(cells / size)
      }
    }
  }

  return [...indices].sort((a, b) => a - b)
}

// ---- the hub pattern and its orientation ----

// the class of every dock mod 2 D4 (4 bits: the basis coordinates mod 2; the side must be even), and the line of
// each class that holds a root (-1 for 0 and the three norm-4 classes)
export function classLines(): Int8Array {
  const out = new Int8Array(16).fill(-1)

  ROOTS.forEach((r, d) => {
    const c = d4Coordinates(r)
    const key = c.reduce((s, v, k) => s + ((((v % 2) + 2) % 2) << k), 0)

    out[key] = LINE_OF[d] as number
  })

  return out
}

export function dockClass(x: number, side: number, hub: readonly number[]): number {
  const c = d4BoxCoordinates({ cell: x, side })

  return c.reduce((s, v, k) => s + (((((v - (hub[k] as number)) % 2) + 2) % 2) << k), 0)
}

// the unoriented hub pattern: per dock, its stored line or -1 (hub given in basis coordinates)
export function hubLines(side: number, hub: readonly number[]): Int8Array {
  if (side % 2 !== 0) throw new Error('the hub pattern needs an even side')

  const lines = classLines()

  return Int8Array.from({ length: side ** 4 }, (_, x) => lines[dockClass(x, side, hub)] as number)
}

// a store (cells x 12) from per-dock lines and per-dock signs
export function storeOf(lines: Int8Array, signs: Int8Array): Int8Array {
  const store = new Int8Array(lines.length * 12)

  lines.forEach((l, x) => {
    if (l >= 0) store[x * 12 + l] = signs[x] as number
  })

  return store
}

// ---- affine maps on the box ----

export type BoxMaps = {
  readonly side: number
  readonly cells: number
  readonly coords: readonly (readonly number[])[]
  // per W(F4) element, its dock map (linear, about the origin)
  readonly linear: readonly Int32Array[]
}

export function boxMaps(coins: CoinData, side: number): BoxMaps {
  const cells = side ** 4
  const coords = Array.from({ length: cells }, (_, x) => d4BoxCoordinates({ cell: x, side }))
  const linear = coins.doubled.map((m, g) => {
    const map = boxCellMapDoubled({ doubled: m as number[][], side })

    if (!map) throw new Error(`element ${g} does not act on the side-${side} box`)

    return Int32Array.from(map)
  })

  return { side, cells, coords, linear }
}

export function translate(box: BoxMaps, x: number, t: readonly number[]): number {
  return d4BoxCell({ coordinates: (box.coords[x] as number[]).map((v, k) => v + (t[k] as number)), side: box.side })
}

// the translation (basis coordinates) that makes g fix the dock with coordinates h: t = h - g h
export function centerShift(box: BoxMaps, g: number, h: readonly number[]): number[] {
  const x = d4BoxCell({ coordinates: h, side: box.side })
  const gx = (box.coords[(box.linear[g] as Int32Array)[x] as number] as number[]).map(v => v)

  return h.map((v, k) => v - (gx[k] as number))
}

// an affine generator: dock map, line image, arriving side sign and a charge-conjugation sign c
export type AffineGenerator = { readonly name: string; readonly map: Int32Array; readonly lineImage: Int8Array; readonly lineSign: Int8Array; readonly c: number }

export function pointGenerator(coins: CoinData, box: BoxMaps, g: number, hub: readonly number[], c: number): AffineGenerator {
  const t = centerShift(box, g, hub)
  const lin = box.linear[g] as Int32Array
  const map = Int32Array.from({ length: box.cells }, (_, x) => translate(box, lin[x] as number, t))

  return { name: `g${g}${c < 0 ? 'C' : ''}`, map, lineImage: coins.lineImage[g] as Int8Array, lineSign: coins.lineSign[g] as Int8Array, c }
}

export function translationGenerator(coins: CoinData, box: BoxMaps, t: readonly number[], c: number): AffineGenerator {
  const identity = coins.table.identity
  const map = Int32Array.from({ length: box.cells }, (_, x) => translate(box, x, t))

  return { name: `t${t.join('')}${c < 0 ? 'C' : ''}`, map, lineImage: coins.lineImage[identity] as Int8Array, lineSign: coins.lineSign[identity] as Int8Array, c }
}

export type Orientation = { ok: boolean; conflicts: number; orbits: number; signs: Int8Array }

// Orient the units of an unoriented pattern so every generator carries the orientation to itself: each orbit of
// units gets +1 on its least unit and the generators carry the sign; a unit reached with both signs is a conflict
export function orientPattern(lines: Int8Array, generators: readonly AffineGenerator[]): Orientation {
  const cells = lines.length
  const signs = new Int8Array(cells)
  let conflicts = 0
  let orbits = 0

  for (let x0 = 0; x0 < cells; x0++) {
    if ((lines[x0] as number) < 0 || signs[x0] !== 0) continue

    orbits++
    signs[x0] = 1

    const queue = [x0]

    while (queue.length > 0) {
      const x = queue.pop() as number
      const l = lines[x] as number
      const s = signs[x] as number

      for (const gen of generators) {
        const y = gen.map[x] as number
        const m = gen.lineImage[l] as number

        if (lines[y] !== m) {
          conflicts++
          continue
        }

        const image = gen.c * (gen.lineSign[l] as number) * s

        if (signs[y] === 0) {
          signs[y] = image
          queue.push(y)
        } else if (signs[y] !== image) {
          conflicts++
        }
      }
    }
  }

  return { ok: conflicts === 0, conflicts, orbits, signs }
}

// ---- the symmetry of a stored pattern ----

export type PatternSymmetry = {
  // (g, t, c) triples that carry the store to itself
  readonly elements: number
  // the W(F4) elements that occur as linear parts, with and without charge conjugation
  readonly pointGroup: number[]
  readonly withoutC: number[]
  // the pure translations (with c = +1) that keep it
  readonly translations: number
}

// `unoriented`: compare only which lines are stored, not their signs (the line pattern's own symmetry)
export function patternSymmetry(coins: CoinData, box: BoxMaps, store: Int8Array, unoriented = false): PatternSymmetry {
  const cells = box.cells
  const units: number[] = []

  for (let i = 0; i < store.length; i++) if (store[i] !== 0) units.push(i)

  if (units.length === 0) throw new Error('an empty store')

  const first = units[0] as number
  const x0 = Math.floor(first / 12)
  const l0 = first % 12
  const tau0 = store[first] as number
  const point = new Set<number>()
  const plain = new Set<number>()
  let elements = 0
  let translations = 0

  for (let g = 0; g < coins.table.permutations.length; g++) {
    const lin = box.linear[g] as Int32Array
    const li = coins.lineImage[g] as Int8Array
    const ls = coins.lineSign[g] as Int8Array
    const m0 = li[l0] as number
    const gx0 = box.coords[lin[x0] as number] as number[]

    for (let y = 0; y < cells; y++) {
      const target = store[y * 12 + m0] as number

      if (target === 0) continue

      const c = unoriented ? 1 : target * (ls[l0] as number) * tau0
      const yc = box.coords[y] as number[]
      const t = yc.map((v, k) => v - (gx0[k] as number))
      let holds = true

      for (let i = 0; i < units.length && holds; i++) {
        const u = units[i] as number
        const x = Math.floor(u / 12)
        const l = u % 12
        const image = translate(box, lin[x] as number, t)
        const there = store[image * 12 + (li[l] as number)] as number

        holds = unoriented ? there !== 0 : there === c * (ls[l] as number) * (store[u] as number)
      }

      if (holds) {
        elements++
        point.add(g)
        if (c === 1) plain.add(g)
        if (g === coins.table.identity && c === 1) translations++
      }
    }
  }

  return { elements, pointGroup: [...point].sort((a, b) => a - b), withoutC: [...plain].sort((a, b) => a - b), translations }
}

// ---- condition (Z) on a per-dock store ----

// the docks where (Z) fails: the occupation momentum a dock holds at beat 1
export function momentumFailures(store: Int8Array, side: number, neighbour: (x: number, d: number) => number): number {
  const cells = side ** 4
  let bad = 0

  for (let y = 0; y < cells; y++) {
    const p = [0, 0, 0, 0]

    for (let d = 0; d < 24; d++) {
      const z = neighbour(y, d)

      if (store[z * 12 + (LINE_OF[d] as number)] !== 0) {
        const r = ROOTS[d] as number[]

        for (let k = 0; k < 4; k++) p[k] = (p[k] as number) + (r[k] as number)
      }
    }

    bad += p.some(v => v !== 0) ? 1 : 0
  }

  return bad
}

// ---- the oriented hub vacuum ----
//
// The orientation used by E-RLT-0080 to E-RLT-0082, derived by search and then fixed: on the side-4 box (period
// 4 D4), the hub pattern about hub 0, oriented so that 2T (left multiplication by the Hurwitz units) about hub 0
// and ONE more element g carry the orientation to itself with no charge conjugation. g is the least element (in
// the group table's order) for which the group <2T, g> has order 576 and the orientation has no conflict; every
// orbit of units gets +1 on its least unit. On any side divisible by 4 the store is this one repeated, with the
// hub moved to `hub`.

export function binaryTetrahedralIndices(table: GroupTable): number[] {
  const indexOf = new Map(table.permutations.map((p, i) => [p.join(','), i]))

  return binaryTetrahedralMatrices()
    .map(m => indexOf.get(Array.from(slotPermutationOf(m) ?? []).join(',')) ?? -1)
    .sort((a, b) => a - b)
}

export type OrientedHub = {
  readonly twoT: number[]
  readonly extra: number
  readonly group: number[]
  // per dock of the side-4 box: its line (-1 for none) and its store sign (0 for none)
  readonly lines: Int8Array
  readonly signs: Int8Array
  readonly orbits: number
}

let ORIENTED: OrientedHub | undefined

export function orientedHub(coins: CoinData): OrientedHub {
  if (ORIENTED) return ORIENTED

  const table = coins.table
  const twoT = binaryTetrahedralIndices(table)
  const box = boxMaps(coins, 4)
  const lines = hubLines(4, [0, 0, 0, 0])
  const hub = [0, 0, 0, 0]
  const base = twoT.map(g => pointGenerator(coins, box, g, hub, 1))

  for (let g = 0; g < table.permutations.length; g++) {
    if (twoT.includes(g)) continue

    const group = closure(table, [...twoT, g])

    if (group.length !== 576) continue

    const o = orientPattern(lines, [...base, pointGenerator(coins, box, g, hub, 1)])

    if (!o.ok) continue

    ORIENTED = { twoT, extra: g, group, lines, signs: o.signs, orbits: o.orbits }

    return ORIENTED
  }

  throw new Error('no oriented hub vacuum of order 576')
}

// the oriented hub store on a box whose side is divisible by 4, hub at the given basis coordinates
export function orientedHubStore(coins: CoinData, side: number, hub: readonly number[]): Int8Array {
  if (side % 4 !== 0) throw new Error('the oriented hub vacuum has period 4 D4: the side must be divisible by 4')

  const o = orientedHub(coins)
  const cells = side ** 4
  const store = new Int8Array(cells * 12)

  for (let x = 0; x < cells; x++) {
    const c = d4BoxCoordinates({ cell: x, side })
    const y = d4BoxCell({ coordinates: c.map((v, k) => v - (hub[k] as number)), side: 4 })
    const l = o.lines[y] as number

    if (l >= 0) store[x * 12 + l] = o.signs[y] as number
  }

  return store
}

// the unoriented or uniformly oriented store of a translation-invariant line set (every dock stores `lines` with +1)
export function uniformStore(cells: number, lines: readonly number[]): Int8Array {
  const store = new Int8Array(cells * 12)

  for (let x = 0; x < cells; x++) for (const l of lines) store[x * 12 + l] = 1

  return store
}

// ---- can the orientation keep all of W(F4)? ----
//
// Every lift of W(F4) into the hub pattern's space group on the side-L box: two generators of W(F4) about hub 0,
// each followed by any translation in 2 D4 / L D4 (the twist) and each with or without charge conjugation, and
// optionally the four translations 2 b_k with any signs. Returned: how many of these orient the hub pattern with no
// conflict. (By hand: a lift must fix no unit it reverses; the reflection in a long root r fixes the hyperplane
// x . r = 2k, which holds units on lines along r and across r, which it reverses and keeps respectively.)
export function liftSearch(coins: CoinData, side: number): { tried: number; oriented: number; leastConflicts: number } {
  const table = coins.table
  const box = boxMaps(coins, side)
  const lines = hubLines(side, [0, 0, 0, 0])
  const all = Array.from({ length: table.permutations.length }, (_, i) => i)
  let pair: [number, number] = [0, 0]

  search: for (const a of all) {
    for (const b of all) {
      if (closure(table, [a, b]).length === all.length) {
        pair = [a, b]
        break search
      }
    }
  }

  const twists: number[][] = []

  for (let bits = 0; bits < 16; bits++) twists.push([0, 1, 2, 3].map(k => ((bits >> k) & 1) * 2))

  const lifted = (g: number, t: readonly number[], c: number): AffineGenerator => {
    const base = pointGenerator(coins, box, g, [0, 0, 0, 0], c)

    return { ...base, map: Int32Array.from(base.map, x => translate(box, x, t)) }
  }
  let tried = 0
  let oriented = 0
  let leastConflicts = Infinity

  for (let ta = 0; ta < 16; ta++) {
    for (let tb = 0; tb < 16; tb++) {
      for (let cs = 0; cs < 4; cs++) {
        for (let extra = -1; extra < 16; extra++) {
          const gens: AffineGenerator[] = [lifted(pair[0], twists[ta] as number[], cs & 1 ? -1 : 1), lifted(pair[1], twists[tb] as number[], cs & 2 ? -1 : 1)]

          if (extra >= 0) for (let k = 0; k < 4; k++) gens.push(translationGenerator(coins, box, [0, 1, 2, 3].map(j => (j === k ? 2 : 0)), (extra >> k) & 1 ? -1 : 1))

          const o = orientPattern(lines, gens)

          tried++
          oriented += o.ok ? 1 : 0
          leastConflicts = Math.min(leastConflicts, o.conflicts)
        }
      }
    }
  }

  return { tried, oriented, leastConflicts }
}

// ---- chain patterns: one antipodal pair per dock at beat 1, under 2T ----
//
// A CHAIN is the orbit of a dock under +- 2 r_l: units on line l spaced two roots apart, whose midpoints each receive
// the two neighbors' vacuum vibes at beat 1 (the one-line vacuum is the pattern where every dock is a unit of one
// line-0 chain). A pattern of chains keeps (Z) term by term; when no two chains share a unit dock or a midpoint,
// every dock receives at most one antipodal pair at beat 1, as on the one-line vacuum. chainPattern takes the 2T
// orbits of chains on the side-L box (2T about dock 0, period L D4), drops any orbit that overlaps itself or holds a
// dock -1 fixes (2T has no sign character, so -1 would reverse that unit), and returns the heaviest set of pairwise
// compatible orbits (branch and bound, exact within its node budget), oriented under 2T.

export type ChainPattern = { chains: number; orbits: number; usable: number; chosen: number; units: number; nodes: number; exact: boolean; lines: Int8Array; orientation: Orientation }

export function chainPattern(coins: CoinData, side: number, budget = 2_000_000): ChainPattern {
  const table = coins.table
  const twoT = binaryTetrahedralIndices(table)
  const box = boxMaps(coins, side)
  const cells = box.cells
  const minus = box.linear[table.minus] as Int32Array
  const r2 = LINE_FIRSTS.map(f => d4Coordinates((ROOTS[f] as number[]).map(v => 2 * v)))
  const r1 = LINE_FIRSTS.map(f => d4Coordinates(ROOTS[f] as number[]))
  const chainOf = new Int32Array(cells * 12).fill(-1)
  const chains: { line: number; units: number[]; mids: number[] }[] = []

  for (let l = 0; l < 12; l++) {
    for (let x = 0; x < cells; x++) {
      if (chainOf[x * 12 + l] !== -1) continue

      const units: number[] = []
      let y = x

      do {
        chainOf[y * 12 + l] = chains.length
        units.push(y)
        y = translate(box, y, r2[l] as number[])
      } while (y !== x)

      chains.push({ line: l, units, mids: [...new Set(units.map(u => translate(box, u, r1[l] as number[])))] })
    }
  }

  const image = (c: number, g: number): number => {
    const ch = chains[c] as { line: number; units: number[] }

    return chainOf[((box.linear[g] as Int32Array)[ch.units[0] as number] as number) * 12 + (coins.lineImage[g]?.[ch.line] as number)] as number
  }
  const seen = new Uint8Array(chains.length)
  const orbits: { members: number[]; units: Set<number>; mids: Set<number>; ok: boolean }[] = []

  for (let c = 0; c < chains.length; c++) {
    if (seen[c] === 1) continue

    const members = [...new Set(twoT.map(g => image(c, g)))]
    const units = new Set<number>()
    const mids = new Set<number>()
    let ok = true

    for (const m of members) {
      seen[m] = 1

      for (const u of chains[m]?.units ?? []) {
        if (units.has(u) || minus[u] === u) ok = false
        units.add(u)
      }

      for (const u of chains[m]?.mids ?? []) {
        if (mids.has(u)) ok = false
        mids.add(u)
      }
    }

    orbits.push({ members, units, mids, ok })
  }

  const usable = orbits.filter(o => o.ok)
  const clash = usable.map(a =>
    usable.map(b => a !== b && ([...a.units].some(u => b.units.has(u)) || [...a.mids].some(u => b.mids.has(u)))),
  )
  const weight = usable.map(o => o.units.size)
  const order = usable.map((_, k) => k).sort((a, b) => (weight[b] as number) - (weight[a] as number) || a - b)
  let best: number[] = []
  let bestWeight = 0
  let nodes = 0
  const search = (k: number, chosen: number[], w: number, remaining: number): void => {
    nodes++

    if (nodes > budget) return

    if (w > bestWeight) {
      bestWeight = w
      best = [...chosen]
    }

    if (k >= order.length || w + remaining <= bestWeight) return

    const i = order[k] as number
    const rest = remaining - (weight[i] as number)

    if (chosen.every(j => !clash[i]?.[j])) search(k + 1, [...chosen, i], w + (weight[i] as number), rest)

    search(k + 1, chosen, w, rest)
  }

  search(0, [], 0, weight.reduce((s, x) => s + x, 0))

  const lines = new Int8Array(cells).fill(-1)

  for (const k of best) for (const c of usable[k]?.members ?? []) for (const u of chains[c]?.units ?? []) lines[u] = chains[c]?.line as number

  const orientation = orientPattern(lines, twoT.map(g => pointGenerator(coins, box, g, [0, 0, 0, 0], 1)))

  return { chains: chains.length, orbits: orbits.length, usable: usable.length, chosen: best.length, units: bestWeight, nodes, exact: nodes <= budget, lines, orientation }
}

// a side-L store repeated on a box whose side is a multiple of L
export function tileStore(store: Int8Array, side: number, bigSide: number): Int8Array {
  const out = new Int8Array(bigSide ** 4 * 12)

  for (let x = 0; x < bigSide ** 4; x++) {
    const y = d4BoxCell({ coordinates: d4BoxCoordinates({ cell: x, side: bigSide }), side })

    for (let l = 0; l < 12; l++) out[x * 12 + l] = store[y * 12 + l] as number
  }

  return out
}

// ---- uniform orientations and the quaternion group ----
//
// A translation-invariant orientation of all 12 lines is one root per line (a half-set H of the roots). The count of
// half-sets that every element of a group carries to H or to -H (the second with charge conjugation).
export function halfSetsKept(coins: CoinData, group: readonly number[]): number {
  let kept = 0

  for (let mask = 0; mask < 4096; mask++) {
    const sign = (l: number): number => ((mask >> l) & 1 ? -1 : 1)
    const ok = group.every(g => {
      const li = coins.lineImage[g] as Int8Array
      const ls = coins.lineSign[g] as Int8Array
      const ratio = new Set<number>()

      for (let l = 0; l < 12; l++) ratio.add(sign(li[l] as number) * (ls[l] as number) * sign(l))

      return ratio.size === 1
    })

    kept += ok ? 1 : 0
  }

  return kept
}

// the determinant of a W(F4) element (from its doubled matrix, det(2M) / 16) and whether it is a reflection
export function determinantOf(coins: CoinData, g: number): number {
  return integerDeterminant(coins.doubled[g] as number[][]) / 16
}

// the opposite of a slot (re-exported for the experiments' checks)
export const OPPOSITE_SLOT = OPPOSITE
