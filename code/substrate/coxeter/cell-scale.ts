// Scalable EXACT cell engine for the dodecagrid {5,3,4}, via modular fingerprints (the binary-encoding
// path). The reflection matrices of {5,3,4} have exact entries in {-1,0,1, phi, sqrt2} (from the Cartan
// matrix), so all arithmetic is done EXACTLY modulo two primes where sqrt5 and sqrt2 exist. Every value
// is then a bounded integer, cell dedup is exact (collision-proof with two primes), there is no floating
// point precision wall, and it scales far past the float engine's ~15.5k ceiling.
//
// Structure mirrors the validated float cell-direct engine: each cell is a group-element matrix g, its
// center is g*c0 (c0 = the cell-stabilizer-fixed weight), and its facet neighbors are g*F_i for the 12
// face reflections (H_cell-conjugates of the outer generator). Dedup by the center fingerprint.

// modular arithmetic, all products kept under 2^53 by using primes below 2^26
function modpow(base: number, exp: number, p: number): number {
  let r = 1
  let b = base % p
  let e = exp
  while (e > 0) {
    if (e & 1) r = (r * b) % p
    b = (b * b) % p
    e = Math.floor(e / 2)
  }
  return r
}

function modInv(a: number, p: number): number {
  return modpow(((a % p) + p) % p, p - 2, p)
}

// Tonelli-Shanks modular square root (p prime, returns r with r*r = a mod p, or -1 if none)
function modSqrt(a: number, p: number): number {
  a = ((a % p) + p) % p
  if (a === 0) return 0
  if (modpow(a, (p - 1) / 2, p) !== 1) return -1
  let q = p - 1
  let s = 0
  while (q % 2 === 0) {
    q /= 2
    s++
  }
  if (s === 1) return modpow(a, (p + 1) / 4, p)
  let z = 2
  while (modpow(z, (p - 1) / 2, p) !== p - 1) z++
  let m = s
  let c = modpow(z, q, p)
  let t = modpow(a, q, p)
  let r = modpow(a, (q + 1) / 2, p)
  while (t !== 1) {
    let i = 0
    let tt = t
    while (tt !== 1) {
      tt = (tt * tt) % p
      i++
    }
    let b = c
    for (let j = 0; j < m - i - 1; j++) b = (b * b) % p
    m = i
    c = (b * b) % p
    t = (t * c) % p
    r = (r * b) % p
  }
  return r
}

function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n % 2 === 0) return n === 2
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false
  return true
}

// a prime congruent to 1 mod 40 below target, so 2 and 5 are both quadratic residues
function primeBelow(target: number): number {
  let p = target - ((target - 1) % 40) // largest <= target with p % 40 == 1
  while (p > 2) {
    if (isPrime(p)) return p
    p -= 40
  }
  throw new Error('no prime found')
}

type IMat = Int32Array // 4x4 row-major, entries in [0,p)
type IVec = Int32Array // length 4

function matMulMod(a: IMat, b: IMat, p: number): IMat {
  const out = new Int32Array(16)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    let s = 0
    for (let k = 0; k < 4; k++) s = (s + a[i * 4 + k]! * b[k * 4 + j]!) % p
    out[i * 4 + j] = s
  }
  return out
}

function matVecMod(a: IMat, x: IVec, p: number): IVec {
  const out = new Int32Array(4)
  for (let i = 0; i < 4; i++) {
    let s = 0
    for (let k = 0; k < 4; k++) s = (s + a[i * 4 + k]! * x[k]!) % p
    out[i] = s
  }
  return out
}

function identityMod(): IMat {
  const m = new Int32Array(16)
  for (let i = 0; i < 4; i++) m[i * 4 + i] = 1
  return m
}

const matKey = (m: IMat): string => m.join(',')
const vecKey = (v: IVec): string => v.join(',')

// the {5,3,4} reflection matrices in the simple-root basis, exact entries reduced mod p.
// rows derived from the Cartan matrix C (off-diagonals -phi, -1, -sqrt2):
//   R0 row0 = (-1, phi, 0, 0); R1 row1 = (phi, -1, 1, 0); R2 row2 = (0, 1, -1, sqrt2); R3 row3 = (0,0,sqrt2,-1)
function buildGeneratorsMod(p: number): { R: IMat[]; cartanInvCol3: IVec } {
  const sqrt5 = modSqrt(5, p)
  const sqrt2 = modSqrt(2, p)
  const phi = ((1 + sqrt5) * modInv(2, p)) % p
  const neg = (x: number): number => ((-x % p) + p) % p

  const R: IMat[] = [identityMod(), identityMod(), identityMod(), identityMod()]
  // R0 row 0
  R[0]![0] = neg(1)
  R[0]![1] = phi
  // R1 row 1
  R[1]![4] = phi
  R[1]![5] = neg(1)
  R[1]![6] = 1
  // R2 row 2
  R[2]![9] = 1
  R[2]![10] = neg(1)
  R[2]![11] = sqrt2
  // R3 row 3
  R[3]![14] = sqrt2
  R[3]![15] = neg(1)

  // Cartan matrix mod p and its inverse; the cell center (weight omega_3) = column 3 of C^{-1}
  const C = [
    [2, neg(phi), 0, 0],
    [neg(phi), 2, neg(1), 0],
    [0, neg(1), 2, neg(sqrt2)],
    [0, 0, neg(sqrt2), 2],
  ]
  const cartanInvCol3 = invColumnMod(C, 3, p)
  return { R, cartanInvCol3 }
}

// solve C x = e_col mod p, returning x (a column of C^{-1})
function invColumnMod(C: number[][], col: number, p: number): IVec {
  const n = 4
  const a = C.map((row) => row.map((v) => ((v % p) + p) % p))
  const b = new Array<number>(n).fill(0)
  b[col] = 1
  for (let i = 0; i < n; i++) {
    let piv = i
    while (piv < n && a[piv]![i] === 0) piv++
    if (piv === n) throw new Error('singular Cartan mod p')
    if (piv !== i) {
      ;[a[i], a[piv]] = [a[piv]!, a[i]!]
      ;[b[i], b[piv]] = [b[piv]!, b[i]!]
    }
    const inv = modInv(a[i]![i]!, p)
    for (let j = 0; j < n; j++) a[i]![j] = (a[i]![j]! * inv) % p
    b[i] = (b[i]! * inv) % p
    for (let r = 0; r < n; r++) {
      if (r === i) continue
      const f = a[r]![i]!
      if (f === 0) continue
      for (let j = 0; j < n; j++) a[r]![j] = ((a[r]![j]! - f * a[i]![j]!) % p + p) % p
      b[r] = ((b[r]! - f * b[i]!) % p + p) % p
    }
  }
  return Int32Array.from(b.map((v) => ((v % p) + p) % p))
}

export interface ScaleGraph {
  cellCount: number
  facetCount: number
  offsets: Int32Array
  adj: Int32Array
  hit: boolean
}

// Build the {5,3,4} cell graph up to maxCells, exactly, via modular fingerprints over two primes.
export function buildDodecagrid(input: { maxCells: number }): ScaleGraph {
  const maxCells = input.maxCells
  const p1 = primeBelow(67108837)
  const p2 = primeBelow(66000000)

  const g1 = buildGeneratorsMod(p1)
  const g2 = buildGeneratorsMod(p2)

  // enumerate the cell stabilizer H = <R0,R1,R2> (the dodecahedral group, order 120), mod p1 for keys
  const stab1: IMat[] = [identityMod()]
  const stab2: IMat[] = [identityMod()]
  const stabSeen = new Set<string>([matKey(stab1[0]!)])
  for (let head = 0; head < stab1.length; head++) {
    for (let i = 0; i < 3; i++) {
      const m1 = matMulMod(g1.R[i]!, stab1[head]!, p1)
      const k = matKey(m1)
      if (!stabSeen.has(k)) {
        stabSeen.add(k)
        stab1.push(m1)
        stab2.push(matMulMod(g2.R[i]!, stab2[head]!, p2))
      }
    }
    if (stab1.length > 100000) break
  }

  // face reflections F = distinct { h R3 h^{-1} }, paired across both primes
  const faces1: IMat[] = []
  const faces2: IMat[] = []
  const faceSeen = new Set<string>()
  // the 12 face reflections are the distinct conjugates h R3 h^{-1} over the cell stabilizer
  for (let idx = 0; idx < stab1.length; idx++) {
    const h1 = stab1[idx]!
    const h2 = stab2[idx]!
    const hi1 = matInvMod(h1, p1)
    const hi2 = matInvMod(h2, p2)
    const f1 = matMulMod(matMulMod(h1, g1.R[3]!, p1), hi1, p1)
    const f2 = matMulMod(matMulMod(h2, g2.R[3]!, p2), hi2, p2)
    const k = matKey(f1)
    if (!faceSeen.has(k)) {
      faceSeen.add(k)
      faces1.push(f1)
      faces2.push(f2)
    }
  }

  const c01 = g1.cartanInvCol3
  const c02 = g2.cartanInvCol3

  // BFS the cell graph, fingerprint = (g*c0 mod p1, g*c0 mod p2)
  const cellMat1: IMat[] = [identityMod()]
  const cellMat2: IMat[] = [identityMod()]
  const fp = (v1: IVec, v2: IVec): string => vecKey(v1) + '|' + vecKey(v2)
  const cellKey = new Map<string, number>([[fp(c01, c02), 0]])
  const nbr: number[][] = [[]]
  let hit = false
  for (let head = 0; head < cellMat1.length; head++) {
    const g1m = cellMat1[head]!
    const g2m = cellMat2[head]!
    for (let fi = 0; fi < faces1.length; fi++) {
      const ng1 = matMulMod(g1m, faces1[fi]!, p1)
      const ng2 = matMulMod(g2m, faces2[fi]!, p2)
      const center1 = matVecMod(ng1, c01, p1)
      const center2 = matVecMod(ng2, c02, p2)
      const k = fp(center1, center2)
      let id = cellKey.get(k)
      if (id === undefined) {
        if (cellMat1.length >= maxCells) {
          hit = true
          continue
        }
        id = cellMat1.length
        cellKey.set(k, id)
        cellMat1.push(ng1)
        cellMat2.push(ng2)
        nbr.push([])
      }
      if (id !== head && !nbr[head]!.includes(id)) {
        nbr[head]!.push(id)
        nbr[id]!.push(head)
      }
    }
    if (hit) break
  }

  const n = cellMat1.length
  let facetCount = 0
  for (const a of nbr) facetCount = Math.max(facetCount, a.length)
  const offsets = new Int32Array(n + 1)
  for (let i = 0; i < n; i++) offsets[i + 1] = offsets[i]! + nbr[i]!.length
  const adj = new Int32Array(offsets[n]!)
  let pos = 0
  for (let i = 0; i < n; i++) for (const w of nbr[i]!) adj[pos++] = w

  return { cellCount: n, facetCount, offsets, adj, hit }
}

// Optimized build: same exact {5,3,4} cell graph, but flat typed arrays throughout (a typed
// open-addressing hash keyed by packed fingerprints, flat matrices, flat neighbor lists), so it scales
// roughly ten times further than the string-map version (tens of millions of cells). Verified to match
// buildDodecagrid exactly at small N.
export function buildDodecagridFast(input: { maxCells: number }): ScaleGraph {
  const maxCells = input.maxCells
  const p1 = primeBelow(67108837)
  const p2 = primeBelow(66000000)
  const g1 = buildGeneratorsMod(p1)
  const g2 = buildGeneratorsMod(p2)

  // cell stabilizer H = <R0,R1,R2> and the face reflections (small, one-time, reuse the simple path)
  const stab1: IMat[] = [identityMod()]
  const stab2: IMat[] = [identityMod()]
  const stabSeen = new Set<string>([matKey(stab1[0]!)])
  for (let head = 0; head < stab1.length; head++) {
    for (let i = 0; i < 3; i++) {
      const m1 = matMulMod(g1.R[i]!, stab1[head]!, p1)
      const k = matKey(m1)
      if (!stabSeen.has(k)) {
        stabSeen.add(k)
        stab1.push(m1)
        stab2.push(matMulMod(g2.R[i]!, stab2[head]!, p2))
      }
    }
    if (stab1.length > 100000) break
  }
  const faces1: IMat[] = []
  const faces2: IMat[] = []
  const faceSeen = new Set<string>()
  for (let idx = 0; idx < stab1.length; idx++) {
    const f1 = matMulMod(matMulMod(stab1[idx]!, g1.R[3]!, p1), matInvMod(stab1[idx]!, p1), p1)
    const f2 = matMulMod(matMulMod(stab2[idx]!, g2.R[3]!, p2), matInvMod(stab2[idx]!, p2), p2)
    const k = matKey(f1)
    if (!faceSeen.has(k)) {
      faceSeen.add(k)
      faces1.push(f1)
      faces2.push(f2)
    }
  }
  const F = faces1.length
  const c01 = g1.cartanInvCol3
  const c02 = g2.cartanInvCol3

  // flat storage
  const mat1 = new Int32Array(maxCells * 16)
  const mat2 = new Int32Array(maxCells * 16)
  const fpStore = new Int32Array(maxCells * 8)
  const nbrFlat = new Int32Array(maxCells * 12).fill(-1)
  const deg = new Int32Array(maxCells)
  let hashSize = 8
  while (hashSize < maxCells * 2.5) hashSize *= 2
  const mask = hashSize - 1
  const hash = new Int32Array(hashSize) // 0 = empty, else cell index + 1

  const tmp1 = new Int32Array(16)
  const tmp2 = new Int32Array(16)
  const fpTmp = new Int32Array(8)

  const mulInto = (aF: Int32Array, aOff: number, b: IMat, p: number, out: Int32Array): void => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      let s = 0
      for (let k = 0; k < 4; k++) s = (s + aF[aOff + i * 4 + k]! * b[k * 4 + j]!) % p
      out[i * 4 + j] = s
    }
  }
  const centerInto = (m: Int32Array, c: IVec, p: number, out: Int32Array, outOff: number): void => {
    for (let i = 0; i < 4; i++) {
      let s = 0
      for (let k = 0; k < 4; k++) s = (s + m[i * 4 + k]! * c[k]!) % p
      out[outOff + i] = s
    }
  }
  const hashFp = (fp: Int32Array, off: number): number => {
    let h = 0
    for (let k = 0; k < 8; k++) h = (Math.imul(h, 0x9e3779b1) + fp[off + k]!) | 0
    return h >>> 0
  }
  const fpEqual = (off: number): boolean => {
    for (let k = 0; k < 8; k++) if (fpStore[off + k] !== fpTmp[k]) return false
    return true
  }

  // seed cell 0 = identity
  for (let i = 0; i < 16; i++) {
    mat1[i] = i % 5 === 0 ? 1 : 0
    mat2[i] = i % 5 === 0 ? 1 : 0
  }
  centerInto(mat1, c01, p1, fpStore, 0)
  centerInto(mat2, c02, p2, fpStore, 4)
  hash[hashFp(fpStore, 0) & mask] = 1
  let count = 1
  let hit = false

  for (let head = 0; head < count; head++) {
    const h1 = head * 16
    const h2 = head * 16
    for (let fi = 0; fi < F; fi++) {
      mulInto(mat1, h1, faces1[fi]!, p1, tmp1)
      mulInto(mat2, h2, faces2[fi]!, p2, tmp2)
      centerInto(tmp1, c01, p1, fpTmp, 0)
      centerInto(tmp2, c02, p2, fpTmp, 4)
      // lookup
      let slot = hashFp(fpTmp, 0) & mask
      let id = -1
      while (hash[slot] !== 0) {
        const cand = hash[slot]! - 1
        if (fpEqual(cand * 8)) {
          id = cand
          break
        }
        slot = (slot + 1) & mask
      }
      if (id === -1) {
        if (count >= maxCells) {
          hit = true
          continue
        }
        id = count++
        for (let k = 0; k < 16; k++) {
          mat1[id * 16 + k] = tmp1[k]!
          mat2[id * 16 + k] = tmp2[k]!
        }
        for (let k = 0; k < 8; k++) fpStore[id * 8 + k] = fpTmp[k]!
        hash[slot] = id + 1
      }
      if (id !== head) {
        // add id to head's neighbors if not present
        let found = false
        const hb = head * 12
        for (let k = 0; k < deg[head]!; k++) if (nbrFlat[hb + k] === id) {
          found = true
          break
        }
        if (!found && deg[head]! < 12 && deg[id]! < 12) {
          nbrFlat[hb + deg[head]!] = id
          deg[head]!++
          nbrFlat[id * 12 + deg[id]!] = head
          deg[id]!++
        }
      }
    }
    if (hit) break
  }

  const n = count
  let facetCount = 0
  for (let i = 0; i < n; i++) if (deg[i]! > facetCount) facetCount = deg[i]!
  const offsets = new Int32Array(n + 1)
  for (let i = 0; i < n; i++) offsets[i + 1] = offsets[i]! + deg[i]!
  const adj = new Int32Array(offsets[n]!)
  let pos = 0
  for (let i = 0; i < n; i++) for (let k = 0; k < deg[i]!; k++) adj[pos++] = nbrFlat[i * 12 + k]!

  return { cellCount: n, facetCount, offsets, adj, hit }
}

// Build a long thin SLIVER (a geodesic tube) of the {5,3,4}, exactly. A ball has tiny diameter (~log N),
// useless for measuring transport. A tube along a geodesic axis can be arbitrarily LONG with bounded
// width, giving many spatial layers. We walk straight by alternating two opposite face reflections
// (T = Fa*Fb is a hyperbolic translation), generate the spine, and add `width` layers of wall around it.
// Returns the tube graph plus `position` = the 1D spine coordinate of each cell.
export function buildSliver(input: { length: number; width?: number }): {
  cellCount: number
  spineLength: number
  facetCount: number
  offsets: Int32Array
  adj: Int32Array
  position: Int32Array
} {
  const L = input.length
  const width = input.width ?? 1
  const p1 = primeBelow(67108837)
  const p2 = primeBelow(66000000)
  const g1 = buildGeneratorsMod(p1)
  const g2 = buildGeneratorsMod(p2)

  // the 12 face reflections (distinct conjugates h R3 h^{-1} over the cell stabilizer H = <R0,R1,R2>)
  const stab1: IMat[] = [identityMod()]
  const stab2: IMat[] = [identityMod()]
  const stabSeen = new Set<string>([matKey(stab1[0]!)])
  for (let head = 0; head < stab1.length; head++) {
    for (let i = 0; i < 3; i++) {
      const m1 = matMulMod(g1.R[i]!, stab1[head]!, p1)
      const k = matKey(m1)
      if (!stabSeen.has(k)) {
        stabSeen.add(k)
        stab1.push(m1)
        stab2.push(matMulMod(g2.R[i]!, stab2[head]!, p2))
      }
    }
    if (stab1.length > 100000) break
  }
  const faces1: IMat[] = []
  const faces2: IMat[] = []
  const faceSeen = new Set<string>()
  for (let idx = 0; idx < stab1.length; idx++) {
    const f1 = matMulMod(matMulMod(stab1[idx]!, g1.R[3]!, p1), matInvMod(stab1[idx]!, p1), p1)
    const f2 = matMulMod(matMulMod(stab2[idx]!, g2.R[3]!, p2), matInvMod(stab2[idx]!, p2), p2)
    const k = matKey(f1)
    if (!faceSeen.has(k)) {
      faceSeen.add(k)
      faces1.push(f1)
      faces2.push(f2)
    }
  }
  const F = faces1.length
  const c01 = g1.cartanInvCol3
  const c02 = g2.cartanInvCol3
  const fp = (m1: IMat, m2: IMat): string => vecKey(matVecMod(m1, c01, p1)) + '|' + vecKey(matVecMod(m2, c02, p2))

  // find two faces whose alternating walk is a geodesic (stays all-distinct) for the full length
  const walkLen = (a: number, b: number): number => {
    let M1 = identityMod()
    let M2 = identityMod()
    const seen = new Set<string>([fp(M1, M2)])
    for (let t = 0; t < 2 * L; t++) {
      const even = t % 2 === 0
      M1 = matMulMod(M1, even ? faces1[a]! : faces1[b]!, p1)
      M2 = matMulMod(M2, even ? faces2[a]! : faces2[b]!, p2)
      const k = fp(M1, M2)
      if (seen.has(k)) return seen.size
      seen.add(k)
    }
    return seen.size
  }
  let ba = 0
  let bb = 1
  let best = 0
  for (let a = 0; a < F && best < 2 * L; a++) for (let b = 0; b < F; b++) {
    if (a === b) continue
    const d = walkLen(a, b)
    if (d > best) {
      best = d
      ba = a
      bb = b
    }
    if (best >= 2 * L) break
  }

  // collect cells: the spine, then `width` layers of wall around it
  const cellM1: IMat[] = []
  const cellM2: IMat[] = []
  const pos: number[] = []
  const index = new Map<string, number>()
  const add = (m1: IMat, m2: IMat, p: number): number => {
    const k = fp(m1, m2)
    let id = index.get(k)
    if (id === undefined) {
      id = cellM1.length
      index.set(k, id)
      cellM1.push(m1)
      cellM2.push(m2)
      pos.push(p)
    }
    return id
  }
  let M1 = identityMod()
  let M2 = identityMod()
  add(M1, M2, 0)
  for (let t = 0; t < best - 1; t++) {
    const even = t % 2 === 0
    M1 = matMulMod(M1, even ? faces1[ba]! : faces1[bb]!, p1)
    M2 = matMulMod(M2, even ? faces2[ba]! : faces2[bb]!, p2)
    add(M1, M2, t + 1)
  }
  const spineLength = cellM1.length
  let layerStart = 0
  let layerEnd = cellM1.length
  for (let w = 0; w < width; w++) {
    for (let i = layerStart; i < layerEnd; i++) {
      for (let m = 0; m < F; m++) add(matMulMod(cellM1[i]!, faces1[m]!, p1), matMulMod(cellM2[i]!, faces2[m]!, p2), pos[i]!)
    }
    layerStart = layerEnd
    layerEnd = cellM1.length
  }

  // adjacency among collected cells (face-neighbors that are present)
  const n = cellM1.length
  const nbr: number[][] = Array.from({ length: n }, () => [])
  for (let i = 0; i < n; i++) for (let m = 0; m < F; m++) {
    const k = fp(matMulMod(cellM1[i]!, faces1[m]!, p1), matMulMod(cellM2[i]!, faces2[m]!, p2))
    const j = index.get(k)
    if (j !== undefined && j !== i && !nbr[i]!.includes(j)) nbr[i]!.push(j)
  }
  let facetCount = 0
  for (const a of nbr) if (a.length > facetCount) facetCount = a.length
  const offsets = new Int32Array(n + 1)
  for (let i = 0; i < n; i++) offsets[i + 1] = offsets[i]! + nbr[i]!.length
  const adj = new Int32Array(offsets[n]!)
  let q = 0
  for (let i = 0; i < n; i++) for (const w of nbr[i]!) adj[q++] = w
  const position = Int32Array.from(pos)

  return { cellCount: n, spineLength, facetCount, offsets, adj, position }
}

// matrix inverse mod p via Gauss-Jordan (4x4)
function matInvMod(m: IMat, p: number): IMat {
  const a: number[][] = []
  for (let i = 0; i < 4; i++) {
    const row: number[] = []
    for (let j = 0; j < 4; j++) row.push(m[i * 4 + j]!)
    for (let j = 0; j < 4; j++) row.push(i === j ? 1 : 0)
    a.push(row)
  }
  for (let i = 0; i < 4; i++) {
    let piv = i
    while (piv < 4 && a[piv]![i] === 0) piv++
    if (piv === 4) throw new Error('singular matrix mod p')
    if (piv !== i) [a[i], a[piv]] = [a[piv]!, a[i]!]
    const inv = modInv(a[i]![i]!, p)
    for (let j = 0; j < 8; j++) a[i]![j] = (a[i]![j]! * inv) % p
    for (let r = 0; r < 4; r++) {
      if (r === i) continue
      const f = a[r]![i]!
      if (f === 0) continue
      for (let j = 0; j < 8; j++) a[r]![j] = ((a[r]![j]! - f * a[i]![j]!) % p + p) % p
    }
  }
  const out = new Int32Array(16)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) out[i * 4 + j] = a[i]![j + 4]!
  return out
}

// A LAZY engine for {5,3,4}, the seed of the WebGPU lazy path (note/plan/vibe-webgpu-billion-cell-sim.md).
// Given a cell's group matrices (mod the two primes), it computes the 12 neighbor matrices and the cell's
// identity fingerprint ON DEMAND, with NO stored adjacency graph. Correctness is verified against
// buildDodecagrid in P183. Honest note, carrying the 4x4 matrix is not itself a memory win (it is bigger
// than a 12-neighbor list), the memory win comes from compact FORMULA addressing (the plan's Stage 1). This
// proves the on-demand neighbor MECHANISM that the shader port builds on.
export interface LazyCell {
  g1: Int32Array
  g2: Int32Array
}
export interface LazyEngine {
  origin: LazyCell
  faceCount: number
  neighbors: (cell: LazyCell) => LazyCell[]
  fingerprint: (cell: LazyCell) => string
}

export function makeLazyEngine(): LazyEngine {
  const p1 = primeBelow(67108837)
  const p2 = primeBelow(66000000)
  const gen1 = buildGeneratorsMod(p1)
  const gen2 = buildGeneratorsMod(p2)

  // cell stabilizer H = <R0,R1,R2> (order 120), used to derive the 12 face reflections
  const stab1: IMat[] = [identityMod()]
  const stab2: IMat[] = [identityMod()]
  const stabSeen = new Set<string>([matKey(stab1[0]!)])
  for (let head = 0; head < stab1.length; head++) {
    for (let i = 0; i < 3; i++) {
      const m1 = matMulMod(gen1.R[i]!, stab1[head]!, p1)
      const k = matKey(m1)
      if (!stabSeen.has(k)) {
        stabSeen.add(k)
        stab1.push(m1)
        stab2.push(matMulMod(gen2.R[i]!, stab2[head]!, p2))
      }
    }
    if (stab1.length > 100000) break
  }

  // the 12 face reflections = distinct conjugates h R3 h^{-1}, paired across both primes
  const faces1: IMat[] = []
  const faces2: IMat[] = []
  const faceSeen = new Set<string>()
  for (let idx = 0; idx < stab1.length; idx++) {
    const h1 = stab1[idx]!
    const f1 = matMulMod(matMulMod(h1, gen1.R[3]!, p1), matInvMod(h1, p1), p1)
    const k = matKey(f1)
    if (!faceSeen.has(k)) {
      faceSeen.add(k)
      faces1.push(f1)
      const h2 = stab2[idx]!
      faces2.push(matMulMod(matMulMod(h2, gen2.R[3]!, p2), matInvMod(h2, p2), p2))
    }
  }

  const c01 = gen1.cartanInvCol3
  const c02 = gen2.cartanInvCol3

  return {
    origin: { g1: identityMod(), g2: identityMod() },
    faceCount: faces1.length,
    neighbors: (cell: LazyCell): LazyCell[] => {
      const out: LazyCell[] = []
      for (let i = 0; i < faces1.length; i++) {
        out.push({ g1: matMulMod(cell.g1, faces1[i]!, p1), g2: matMulMod(cell.g2, faces2[i]!, p2) })
      }
      return out
    },
    fingerprint: (cell: LazyCell): string =>
      vecKey(matVecMod(cell.g1, c01, p1)) + '|' + vecKey(matVecMod(cell.g2, c02, p2)),
  }
}
