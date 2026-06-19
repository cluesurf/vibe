// EXACT, geometry-free cell navigation for ANY regular tessellation, by modular integer arithmetic, the
// rank-general version of the verified {5,3,4} engine in cell-scale.ts. The reflection matrices of a Coxeter
// group have entries built from -2cos(pi/m) for each diagram label m. The key identity is that
// 2cos(pi/m) = zeta + zeta^-1 for a primitive 2m-th root of unity zeta, so if we work modulo a prime p with
// p = 1 mod 2m, that root of unity (hence every cos(pi/m)) is an exact integer mod p. Choosing
// p = 1 mod lcm(2*labels) makes EVERY label exact at once, with no per-label surd, so the engine covers the
// whole zoo, {5,4}, {6,4}, {7,3} (cos(pi/7), a cubic irrational, handled by the 14th root of unity), {5,3,4},
// and beyond. Two such primes make cell identity collision-proof, there is no floating-point precision wall,
// and stepping across a face and back is exactly symmetric (a reflection is an involution). See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

function modpow(base: number, exp: number, p: number): number {
  let r = 1
  let b = ((base % p) + p) % p
  let e = exp
  while (e > 0) {
    if (e & 1) {
      r = (r * b) % p
    }
    b = (b * b) % p
    e = Math.floor(e / 2)
  }
  return r
}

function modInv(a: number, p: number): number {
  return modpow(((a % p) + p) % p, p - 2, p)
}

function isPrime(n: number): boolean {
  if (n < 2) {
    return false
  }
  if (n % 2 === 0) {
    return n === 2
  }
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) {
      return false
    }
  }
  return true
}

// the distinct prime factors of n (for primitive-root testing)
function primeFactors(n: number): number[] {
  const out: number[] = []
  let m = n
  for (let d = 2; d * d <= m; d++) {
    if (m % d === 0) {
      out.push(d)
      while (m % d === 0) {
        m /= d
      }
    }
  }
  if (m > 1) {
    out.push(m)
  }
  return out
}

// a prime p = 1 mod modulus, at most target, so the modulus-th roots of unity exist mod p
function primeBelow(target: number, modulus: number): number {
  let p = target - ((((target - 1) % modulus) + modulus) % modulus)
  while (p > 2) {
    if (isPrime(p)) {
      return p
    }
    p -= modulus
  }
  throw new Error(`no prime = 1 mod ${modulus} found`)
}

// a primitive order-th root of unity mod p (p must be 1 mod order). Found by raising successive bases to
// (p-1)/order and checking the result actually has order exactly `order`.
function rootOfUnity(order: number, p: number): number {
  const exp = (p - 1) / order
  const factors = primeFactors(order)
  for (let base = 2; base < p; base++) {
    const candidate = modpow(base, exp, p)
    if (candidate === 1) {
      continue
    }
    let primitive = true
    for (const q of factors) {
      if (modpow(candidate, order / q, p) === 1) {
        primitive = false
        break
      }
    }
    if (primitive) {
      return candidate
    }
  }
  throw new Error(`no primitive ${order}-th root of unity mod ${p}`)
}

type Mat = number[] // n*n row-major, entries in [0,p)
type Vec = number[] // length n

function identity(n: number): Mat {
  const m = new Array<number>(n * n).fill(0)
  for (let i = 0; i < n; i++) {
    m[i * n + i] = 1
  }
  return m
}

function matMul(a: Mat, b: Mat, n: number, p: number): Mat {
  const out = new Array<number>(n * n).fill(0)
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const aik = a[i * n + k]!
      if (aik === 0) {
        continue
      }
      for (let j = 0; j < n; j++) {
        out[i * n + j] = (out[i * n + j]! + aik * b[k * n + j]!) % p
      }
    }
  }
  return out
}

function matVec(a: Mat, x: Vec, n: number, p: number): Vec {
  const out = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    let s = 0
    for (let j = 0; j < n; j++) {
      s = (s + a[i * n + j]! * x[j]!) % p
    }
    out[i] = s
  }
  return out
}

function matInv(m: Mat, n: number, p: number): Mat {
  const a = m.slice()
  const inv = identity(n)
  for (let col = 0; col < n; col++) {
    let piv = col
    while (piv < n && a[piv * n + col] === 0) {
      piv++
    }
    if (piv === n) {
      throw new Error('singular matrix mod p')
    }
    if (piv !== col) {
      for (let j = 0; j < n; j++) {
        ;[a[col * n + j], a[piv * n + j]] = [
          a[piv * n + j]!,
          a[col * n + j]!,
        ]
        ;[inv[col * n + j], inv[piv * n + j]] = [
          inv[piv * n + j]!,
          inv[col * n + j]!,
        ]
      }
    }
    const ip = modInv(a[col * n + col]!, p)
    for (let j = 0; j < n; j++) {
      a[col * n + j] = (a[col * n + j]! * ip) % p
      inv[col * n + j] = (inv[col * n + j]! * ip) % p
    }
    for (let r = 0; r < n; r++) {
      if (r === col) {
        continue
      }
      const f = a[r * n + col]!
      if (f === 0) {
        continue
      }
      for (let j = 0; j < n; j++) {
        a[r * n + j] =
          (((a[r * n + j]! - f * a[col * n + j]!) % p) + p) % p
        inv[r * n + j] =
          (((inv[r * n + j]! - f * inv[col * n + j]!) % p) + p) % p
      }
    }
  }
  return inv
}

// -2cos(pi/m) mod p, exact for ANY label m via the root-of-unity identity 2cos(pi/m) = zeta + zeta^-1 for a
// primitive 2m-th root of unity zeta (m=7 and other non-quadratic labels included). p must be 1 mod 2m.
function offDiagonal(m: number, p: number): number {
  const zeta = rootOfUnity(2 * m, p)
  const value = (zeta + modInv(zeta, p)) % p // = 2cos(pi/m) mod p
  return ((-value % p) + p) % p
}

// the least common multiple of 2*label over a symbol, the modulus a prime must satisfy (p = 1 mod L) so every
// label's root of unity exists mod p at once
function rootModulus(symbol: number[]): number {
  const gcd = (a: number, b: number): number =>
    b === 0 ? a : gcd(b, a % b)
  let lcm = 1
  for (const m of symbol) {
    lcm = (lcm / gcd(lcm, 2 * m)) * (2 * m)
  }
  return lcm
}

export interface ExactEngine {
  readonly rank: number
  readonly faceCount: number
  readonly origin: Mat
  // the facet neighbors of a cell, reached across each face (a reflection, so stepping back across the same
  // face returns home, exactly symmetric)
  neighbors(cell: Mat): Mat[]
  // the exact identity fingerprint of a cell (its center over the two primes), collision-proof
  fingerprint(cell: Mat): string
}

// build an exact modular engine for a regular symbol with quadratic-surd labels
export function makeExactEngine(symbol: number[]): ExactEngine {
  const n = symbol.length + 1 // number of mirrors
  const modulus = rootModulus(symbol) // p = 1 mod L makes every label's root of unity exist mod p
  const p1 = primeBelow(67108864, modulus)
  const p2 = primeBelow(66060288, modulus)

  function generators(p: number): {
    reflections: Mat[]
    center: Vec
    faces: Mat[]
  } {
    const neg = (x: number): number => ((-x % p) + p) % p
    // the Cartan matrix, 2 on the diagonal, -2cos(pi/label) on the path off-diagonals
    const cartan: number[][] = Array.from({ length: n }, () =>
      new Array<number>(n).fill(0),
    )
    for (let i = 0; i < n; i++) {
      cartan[i]![i] = 2
    }
    for (let i = 0; i < n - 1; i++) {
      const off = offDiagonal(symbol[i]!, p)
      cartan[i]![i + 1] = off
      cartan[i + 1]![i] = off
    }
    // reflection i: identity with row i replaced by e_i - cartan_row_i
    const reflections: Mat[] = []
    for (let i = 0; i < n; i++) {
      const r = identity(n)
      for (let j = 0; j < n; j++) {
        r[i * n + j] =
          ((((i === j ? 1 : 0) - cartan[i]![j]!) % p) + p) % p
      }
      reflections.push(r)
    }
    // the cell center, the weight fixed by the cell stabilizer (the first n-1 mirrors) = last column of C^{-1}
    const cartanFlat = cartan.flat().map(v => ((v % p) + p) % p)
    const cartanInv = matInv(cartanFlat, n, p)
    const center: Vec = []
    for (let i = 0; i < n; i++) {
      center.push(cartanInv[i * n + (n - 1)]!)
    }
    // the face reflections, the H-orbit of the outer generator (the distinct conjugates h R_last h^{-1})
    const stab: Mat[] = [identity(n)]
    const stabSeen = new Set<string>([stab[0]!.join(',')])
    for (let head = 0; head < stab.length; head++) {
      for (let i = 0; i < n - 1; i++) {
        const g = matMul(reflections[i]!, stab[head]!, n, p)
        const k = g.join(',')
        if (!stabSeen.has(k)) {
          stabSeen.add(k)
          stab.push(g)
        }
      }
      if (stab.length > 100000) {
        break
      }
    }
    const faces: Mat[] = []
    const faceSeen = new Set<string>()
    for (const h of stab) {
      const f = matMul(
        matMul(h, reflections[n - 1]!, n, p),
        matInv(h, n, p),
        n,
        p,
      )
      const k = f.join(',')
      if (!faceSeen.has(k)) {
        faceSeen.add(k)
        faces.push(f)
      }
    }
    return { reflections, center, faces }
  }

  const g1 = generators(p1)
  const g2 = generators(p2)
  // pair the two primes by interleaving each matrix, so a cell is one Mat of length 2*n*n
  const pair = (a: Mat, b: Mat): Mat => [...a, ...b]
  const faces = g1.faces.map((f, i) => pair(f, g2.faces[i]!))
  const half = n * n

  function step(cell: Mat, faceIndex: number): Mat {
    const a = cell.slice(0, half)
    const b = cell.slice(half)
    const f = faces[faceIndex]!
    return pair(
      matMul(a, f.slice(0, half), n, p1),
      matMul(b, f.slice(half), n, p2),
    )
  }

  return {
    rank: n,
    faceCount: faces.length,
    origin: pair(identity(n), identity(n)),
    neighbors: (cell: Mat): Mat[] => faces.map((_, i) => step(cell, i)),
    fingerprint: (cell: Mat): string => {
      const a = cell.slice(0, half)
      const b = cell.slice(half)
      return (
        matVec(a, g1.center, n, p1).join(',') +
        '|' +
        matVec(b, g2.center, n, p2).join(',')
      )
    },
  }
}

// build the exact cell graph by BFS over the engine's on-demand neighbors, deduplicated by exact fingerprint.
// Geometry-free (pure modular integers), and symmetric by construction. Returns adjacency + cell count.
export function buildTilingExact(input: {
  symbol: number[]
  maxCells: number
}): {
  cellCount: number
  neighbors: number[][]
  facetCount: number
} {
  const engine = makeExactEngine(input.symbol)
  const cells: number[][] = [engine.origin]
  const idOf = new Map<string, number>([
    [engine.fingerprint(engine.origin), 0],
  ])
  const neighbors: number[][] = [[]]
  let hit = false
  for (let head = 0; head < cells.length; head++) {
    for (const nc of engine.neighbors(cells[head]!)) {
      const k = engine.fingerprint(nc)
      let id = idOf.get(k)
      if (id === undefined) {
        if (cells.length >= input.maxCells) {
          hit = true
          continue
        }
        id = cells.length
        idOf.set(k, id)
        cells.push(nc)
        neighbors.push([])
      }
      if (id !== head && !neighbors[head]!.includes(id)) {
        neighbors[head]!.push(id)
        neighbors[id]!.push(head)
      }
    }
    if (hit) {
      break
    }
  }
  let facetCount = 0
  for (const row of neighbors) {
    facetCount = Math.max(facetCount, row.length)
  }
  return { cellCount: cells.length, neighbors, facetCount }
}
