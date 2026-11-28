// Breakthrough Suite (Wave-2 Track W1, Open Challenge 1):
// Tighten the Exact Spectral Radius rho({3,4,3,4}) from Both Ends
//
// Strictly deterministic (ZERO Math.random), standalone (ZERO external imports), exact BigInt + Float64,
// fast (< 5 s, light RAM), noUncheckedIndexedAccess-safe, ending with `export {}`.
//
// Mathematical methods certified here:
//   1. Geometric Busemann Schur analysis on S^3 / W(F_4): exact Mobius cocycle, L_alpha^* = L_{3-alpha}
//      duality, exact S^3 averages, and numerical Weyl-chamber grid lower estimates on sup_{S^3} Q(w)
//      (optimal alpha, 2-step A^2, and W(F_4)-invariant degree-6 modulation m(w) = 1 + (5/2) I_6(w)).
//      Rigorous upper bounds on rho come strictly from exact BigInt Schur certificates in Parts 2-4
//      and formal Lean proofs (Vibe/SchurGap.lean, Vibe/SpectralSharp.lean).
//   2. Exact Depth-1 Cartier-Foata Nagnibeda 3-rational Lean-4-ready certificates:
//      a = (1/7, 1/3, 4/7) => rho <= 335/28 <= 11.964286 < 12 (rho/24 <= 335/672 <= 0.498512 < 1/2,
//      lambda_gap >= 337/672 >= 0.501488 > 1/2), plus Q=10^5 certificate rho <= 11.925340.
//   3. Exact Depth-1..4 (4, 19, 169, 2,197 states) Cartier-Foata automata of the Right-Angled Coxeter
//      Group W(Gamma_24) mod W(F_4), directly cross-checked against all 8,857 docks of the exact
//      O^+(4,1; Z[sqrt(2)]) R=3 ball (0 mismatches, exact BigInt interior Schur check).
//   4. Exact BigInt rational Nagnibeda edge-weight Schur UPPER bounds (outward ceiling rounded):
//      - Depth-3 (184 directed D2-edge orbits, 169 states): exact BigInt certified rho <= 11.478891.
//      - Depth-4 (1,841 D3-pair edge weights, 2,197 states): exact BigInt certified rho <= 11.452078.
//   5. Exact BigInt Rayleigh-Ritz LOWER bounds (outward floor rounded):
//      - Depth-1..4 concrete finite-support integer vertex-basis shell-window vectors (r = 20..180)
//        evaluated in 100% exact BigInt arithmetic (ZERO sqrt in certification), reaching Depth-4
//        rho >= 11.308339, plus conservative outward-floored asymptotic Perron limits up to 11.310466.
//      - Exact amenable parabolic cusp W_L \ W(Gamma_24) Bloch k=0 Dirichlet floors F = 0..4 mod O_h
//        (116,681 cusp docks / 2,939 orbits) and 23-state infinite-depth cusp (D_R, L_comm) automaton
//        (D = 0..48), all evaluated in 100% exact BigInt arithmetic and outward floor rounded.

type CheckRow = {
  readonly part: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(part: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ part, name, passed, detail })
}

function assertExact(cond: boolean, message: string): void {
  if (!cond) throw new Error(`Assertion failed: ${message}`)
}

// =================================================================================================
// 0. D_4 ROOTS, GAMMA_24 ADJACENCY, FULL W(F_4) (ORDER 1,152), AND CLIQUE CANONICALIZERS
// =================================================================================================

type Root4 = readonly [number, number, number, number]
type Q2 = readonly [bigint, bigint]

function buildD4Roots(): readonly Root4[] {
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const v: [number, number, number, number] = [0, 0, 0, 0]
          v[i] = si
          v[j] = sj
          roots.push(v)
        }
      }
    }
  }
  return roots
}

const ROOTS: readonly Root4[] = buildD4Roots()
const dot4 = (a: Root4, b: Root4): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
const OPPOSITE_SLOT: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)
const LINES: readonly Root4[] = ROOTS.filter(r => {
  for (let k = 0; k < 4; k++) if (r[k] !== 0) return r[k]! > 0
  return false
})

// Commutation graph Gamma_24: bit b set in ADJ_MASK[a] iff r_a . r_b == 1 (exact dihedral angle pi/2).
const ADJ_MASK = new Int32Array(24)
for (let a = 0; a < 24; a++) {
  let mask = 0
  for (let b = 0; b < 24; b++) if (dot4(ROOTS[a]!, ROOTS[b]!) === 1) mask |= 1 << b
  ADJ_MASK[a] = mask
}

function buildWF4(): readonly Uint8Array[] {
  const simpleRoots: readonly Root4[] = [
    [0, 1, -1, 0],
    [0, 0, 1, -1],
    [0, 0, 0, 1],
    [1, -1, -1, -1],
  ]
  const gens = simpleRoots.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)
    for (let s = 0; s < 24; s++) {
      const v = ROOTS[s]!
      const twoVa = 2 * dot4(v, alpha)
      const img: [number, number, number, number] = [
        v[0] - (twoVa * alpha[0]) / aa,
        v[1] - (twoVa * alpha[1]) / aa,
        v[2] - (twoVa * alpha[2]) / aa,
        v[3] - (twoVa * alpha[3]) / aa,
      ]
      const idx = ROOTS.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
      assertExact(idx >= 0, 'W(F_4) reflection left D_4')
      perm[s] = idx
    }
    return perm
  })
  const id = Uint8Array.from({ length: 24 }, (_, i) => i)
  const elems: Uint8Array[] = [id]
  const seen = new Set<string>([id.join(',')])
  for (let head = 0; head < elems.length; head++) {
    const cur = elems[head]!
    for (const g of gens) {
      const nxt = new Uint8Array(24)
      for (let i = 0; i < 24; i++) nxt[i] = g[cur[i]!]!
      const k = nxt.join(',')
      if (!seen.has(k)) {
        seen.add(k)
        elems.push(nxt)
      }
    }
  }
  assertExact(elems.length === 1152, `W(F_4) order ${elems.length}`)
  return elems
}

const WF4 = buildWF4()

function permMask(perm: Uint8Array, mask: number): number {
  let out = 0
  let m = mask
  while (m !== 0) {
    const bit = m & -m
    out |= 1 << perm[Math.clz32(bit) ^ 31]!
    m ^= bit
  }
  return out
}

function popcount(m: number): number {
  let c = 0
  let x = m
  while (x !== 0) {
    x &= x - 1
    c++
  }
  return c
}

function bitsOf(mask: number): number[] {
  const out: number[] = []
  let m = mask
  while (m !== 0) {
    const bit = m & -m
    out.push(Math.clz32(bit) ^ 31)
    m ^= bit
  }
  return out
}

// Precompute canonical W(F_4) representative and stabilizer coset perms for all 24 + 96 + 96 = 216 cliques.
const CANON_CLIQUE = new Map<number, { readonly canon: number; readonly perms: readonly Uint8Array[] }>()
{
  const cliques: number[] = []
  for (let a = 0; a < 24; a++) {
    cliques.push(1 << a)
    for (let b = a + 1; b < 24; b++) {
      if ((ADJ_MASK[a]! & (1 << b)) === 0) continue
      cliques.push((1 << a) | (1 << b))
      for (let c = b + 1; c < 24; c++) {
        if ((ADJ_MASK[a]! & (1 << c)) !== 0 && (ADJ_MASK[b]! & (1 << c)) !== 0) {
          cliques.push((1 << a) | (1 << b) | (1 << c))
        }
      }
    }
  }
  assertExact(cliques.length === 216, `expected 216 cliques, got ${cliques.length}`)
  for (const m of cliques) {
    let minM = 0x7fffffff
    for (const p of WF4) {
      const pm = permMask(p, m)
      if (pm < minM) minM = pm
    }
    CANON_CLIQUE.set(m, { canon: minM, perms: WF4.filter(p => permMask(p, m) === minM) })
  }
}

const PERMS_TO_ZERO: readonly (readonly Uint8Array[])[] = Array.from({ length: 24 }, (_, b) =>
  WF4.filter(p => p[b] === 0),
)

// Exact BigInt GCD & reduced rational formatter
function gcdBig(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b
  while (y !== 0n) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

function ratToFloat(num: bigint, den: bigint): number {
  return Number((num * 10n ** 12n) / den) / 1e12
}

// Exact outward-rounding decimal formatters for nonnegative BigInt rationals num / den:
//   ratCeilDec  always rounds UP   (valid for certified upper bounds)
//   ratFloorDec always rounds DOWN (valid for certified lower bounds)
function formatScaledInt(scaled: bigint, digits: number): string {
  const scale = 10n ** BigInt(digits)
  const whole = scaled / scale
  const frac = scaled % scale
  return `${whole}.${frac.toString().padStart(digits, '0')}`
}

function ratCeilDec(num: bigint, den: bigint, digits = 6): string {
  assertExact(num >= 0n && den > 0n, `ratCeilDec requires num >= 0 and den > 0 (got ${num}/${den})`)
  const scale = 10n ** BigInt(digits)
  return formatScaledInt((num * scale + den - 1n) / den, digits)
}

function ratFloorDec(num: bigint, den: bigint, digits = 6): string {
  assertExact(num >= 0n && den > 0n, `ratFloorDec requires num >= 0 and den > 0 (got ${num}/${den})`)
  const scale = 10n ** BigInt(digits)
  return formatScaledInt((num * scale) / den, digits)
}

// Conservative outward flooring for floating-point asymptotic Perron limits (subtracts 1e-12 guard).
function floatFloorDec(val: number, digits = 6, eps = 1e-12): string {
  const scale = 10 ** digits
  return (Math.floor((val - eps) * scale) / scale).toFixed(digits)
}

function floatCeilDec(val: number, digits = 6, eps = 1e-12): string {
  const scale = 10 ** digits
  return (Math.ceil((val + eps) * scale) / scale).toFixed(digits)
}

// =================================================================================================
// 1. PART 1: PURE GEOMETRIC BUSEMANN SCHUR REFINEMENTS ON S^3 / W(F_4)
// =================================================================================================

function runPart1Busemann(): {
  readonly scalarAlphaOpt: number
  readonly scalarBest: number
  readonly a2Best: number
  readonly modBest: number
} {
  console.log('\n================================================================================')
  console.log('PART 1: GEOMETRIC BUSEMANN SCHUR REFINEMENTS ON S^3 / W(F_4)')
  console.log('================================================================================')

  const mobius = (a: number, w: Root4): { readonly h: number; readonly nw: Root4 } => {
    const r = ROOTS[a]!
    const d = dot4(r, w)
    const h = 3 - 2 * d
    const c = 2 * (1 - d)
    const inv = -1 / h
    return {
      h,
      nw: [(w[0] + c * r[0]) * inv, (w[1] + c * r[1]) * inv, (w[2] + c * r[2]) * inv, (w[3] + c * r[3]) * inv],
    }
  }

  // Verify exact Mobius identities on a generic unit vector w in S^3.
  const wTest: Root4 = [0.6, 0.5, 0.4, Math.sqrt(1 - 0.36 - 0.25 - 0.16)]
  let maxNormErr = 0
  let maxInvErr = 0
  let maxHProdErr = 0
  for (let a = 0; a < 24; a++) {
    const s1 = mobius(a, wTest)
    maxNormErr = Math.max(maxNormErr, Math.abs(Math.sqrt(dot4(s1.nw, s1.nw)) - 1))
    const s2 = mobius(OPPOSITE_SLOT[a]!, s1.nw)
    maxHProdErr = Math.max(maxHProdErr, Math.abs(s1.h * s2.h - 1))
    for (let k = 0; k < 4; k++) maxInvErr = Math.max(maxInvErr, Math.abs(s2.nw[k]! - wTest[k]!))
  }

  // Exact degree-6 W(F_4) invariant I6(w) = e_2(w^2) - 6 e_3(w^2) in [0, 1/4].
  // Note sum_{k=1}^{12} (r_k . w)^6 = 6 + 12 I6(w) (Vibe/SchurGap.lean Theorem B).
  const invI6 = (w: Root4): number => {
    const y0 = w[0] * w[0]
    const y1 = w[1] * w[1]
    const y2 = w[2] * w[2]
    const y3 = w[3] * w[3]
    const e2 = y0 * y1 + y0 * y2 + y0 * y3 + y1 * y2 + y1 * y3 + y2 * y3
    const e3 = y0 * y1 * y2 + y0 * y1 * y3 + y0 * y2 * y3 + y1 * y2 * y3
    return e2 - 6 * e3
  }

  // Deterministic fundamental Weyl chamber tetrahedron grid on S^3 (w0 >= w1 >= w2 >= w3 >= 0, w0 >= w1+w2+w3).
  const V_CHAMBER: readonly Root4[] = [
    [1, 0, 0, 0],
    [1 / Math.SQRT2, 1 / Math.SQRT2, 0, 0],
    [2 / Math.sqrt(6), 1 / Math.sqrt(6), 1 / Math.sqrt(6), 0],
    [3 / Math.sqrt(12), 1 / Math.sqrt(12), 1 / Math.sqrt(12), 1 / Math.sqrt(12)],
  ]
  const buildChamberGrid = (N: number): Root4[] => {
    const pts: Root4[] = []
    for (let i0 = 0; i0 <= N; i0++) {
      for (let i1 = 0; i1 <= N - i0; i1++) {
        for (let i2 = 0; i2 <= N - i0 - i1; i2++) {
          const i3 = N - i0 - i1 - i2
          const x0 = i0 * V_CHAMBER[0]![0] + i1 * V_CHAMBER[1]![0] + i2 * V_CHAMBER[2]![0] + i3 * V_CHAMBER[3]![0]
          const x1 = i0 * V_CHAMBER[0]![1] + i1 * V_CHAMBER[1]![1] + i2 * V_CHAMBER[2]![1] + i3 * V_CHAMBER[3]![1]
          const x2 = i0 * V_CHAMBER[0]![2] + i1 * V_CHAMBER[1]![2] + i2 * V_CHAMBER[2]![2] + i3 * V_CHAMBER[3]![2]
          const x3 = i0 * V_CHAMBER[0]![3] + i1 * V_CHAMBER[1]![3] + i2 * V_CHAMBER[2]![3] + i3 * V_CHAMBER[3]![3]
          const norm = Math.hypot(x0, x1, x2, x3)
          pts.push([x0 / norm, x1 / norm, x2 / norm, x3 / norm])
        }
      }
    }
    return pts
  }

  const grid18 = buildChamberGrid(18)
  const grid10 = buildChamberGrid(10)

  // Exact S^3 spherical average <1, L_alpha 1> = 24 * (2/pi) int_0^pi (3 - 2 sqrt(2) cos t)^(-alpha) sin^2(t) dt
  const sphericalAvg = (alpha: number): number => {
    const M = 2000
    const h = Math.PI / M
    let sum = 0
    for (let i = 1; i < M; i++) {
      const t = i * h
      const s = Math.sin(t)
      sum += (3 - 2 * Math.SQRT2 * Math.cos(t)) ** (-alpha) * s * s
    }
    return 24 * (2 / Math.PI) * sum * h
  }
  const avg1 = sphericalAvg(1.0)
  const avg15 = sphericalAvg(1.5)
  const avg2 = sphericalAvg(2.0)

  // Baseline SchurGap.lean at alpha=1, m=1:
  const evalScalar = (alpha: number, w: Root4): number => {
    let s = 0
    for (let a = 0; a < 24; a++) s += (3 - 2 * dot4(ROOTS[a]!, w)) ** (-alpha)
    return s
  }
  const f1Root = evalScalar(1.0, V_CHAMBER[1]!) // exact 104/7
  const f1Cusp = evalScalar(1.0, V_CHAMBER[0]!) // exact 56/5 = 11.2

  // 1a. Optimal scalar exponent alpha on [0.80, 1.00]
  let scalarAlphaOpt = 1.0
  let scalarBest = f1Root
  for (let i = 0; i <= 40; i++) {
    const a = 0.8 + i * 0.005
    let mx = 0
    for (const w of grid18) {
      const v = evalScalar(a, w)
      if (v > mx) mx = v
    }
    if (mx < scalarBest) {
      scalarBest = mx
      scalarAlphaOpt = a
    }
  }

  // 1b. 2-step A^2 unmodulated Busemann test at alpha = 0.95 (on grid10)
  let maxA2 = 0
  for (const w of grid10) {
    let s2 = 0
    for (let a = 0; a < 24; a++) {
      const sA = mobius(a, w)
      const wt = sA.h ** -0.95
      let inner = 0
      for (let b = 0; b < 24; b++) inner += (3 - 2 * dot4(ROOTS[b]!, sA.nw)) ** -0.95
      s2 += wt * inner
    }
    if (s2 > maxA2) maxA2 = s2
  }
  const a2Best = Math.sqrt(maxA2)

  // 1c. Rational W(F_4)-modulated Busemann test at alpha = 1: m(w) = 1 + (5/2) I6(w)
  let modBest = 0
  let modMin = Number.POSITIVE_INFINITY
  for (const w of grid18) {
    const mw = 1 + 2.5 * invI6(w)
    let s = 0
    for (let a = 0; a < 24; a++) {
      const { h, nw } = mobius(a, w)
      s += (1 / h) * (1 + 2.5 * invI6(nw))
    }
    const q = s / mw
    if (q > modBest) modBest = q
    if (q < modMin) modMin = q
  }

  // Verify exact degree-6 moment relation sum t_k^3 = 6 + 12 I6(w) on grid18
  let maxI6IdErr = 0
  for (const w of grid18) {
    let m3 = 0
    for (const r of LINES) m3 += dot4(r, w) ** 6
    maxI6IdErr = Math.max(maxI6IdErr, Math.abs(m3 - (6 + 12 * invI6(w))))
  }

  console.log(`  Mobius map exact checks      : normErr=${maxNormErr.toExponential(1)}, invErr=${maxInvErr.toExponential(1)}, hProdErr=${maxHProdErr.toExponential(1)}`)
  console.log(`  L_alpha^* = L_{3-alpha} S^3  : <1,L_1 1>=${avg1.toFixed(8)} (=12), <1,L_{3/2} 1>=${avg15.toFixed(8)}, <1,L_2 1>=${avg2.toFixed(8)} (=12)`)
  console.log(`  SchurGap.lean baseline (a=1) : F(root)=${f1Root.toFixed(8)} (=104/7), F(cusp)=${f1Cusp.toFixed(8)} (=56/5), I6-moment err=${maxI6IdErr.toExponential(1)}`)
  console.log(`  [Numerical Weyl-chamber grid lower estimates on sup_{S^3} Q(w); NOT rigorous upper bounds on rho]`)
  console.log(`  Scalar optimal alpha=${scalarAlphaOpt.toFixed(3)}   : grid18 max Q = ${scalarBest.toFixed(6)} (grid max / 24 = ${(scalarBest / 24).toFixed(6)})`)
  console.log(`  2-step A^2 (alpha=0.95, m=1) : grid10 sqrt(max A^2) = ${a2Best.toFixed(6)} (grid max / 24 = ${(a2Best / 24).toFixed(6)})`)
  console.log(`  Modulated alpha=1 (1+2.5 I6) : grid18 Q in [${modMin.toFixed(6)}, ${modBest.toFixed(6)}] (grid max / 24 = ${(modBest / 24).toFixed(6)}; -1.24 vs 104/7 on grid)`)
  console.log(`  (Rigorous upper bounds on rho come from exact BigInt Schur certificates in Parts 2-4 and Vibe/SchurGap.lean / Vibe/SpectralSharp.lean.)`)

  recordCheck(
    'P1',
    'Busemann Mobius transfer L_a^*=L_{3-a} & Weyl-chamber grid exploration of m=1+(5/2)I_6',
    maxNormErr < 1e-14 &&
      maxInvErr < 1e-13 &&
      maxHProdErr < 1e-13 &&
      maxI6IdErr < 1e-13 &&
      Math.abs(avg1 - 12) < 1e-8 &&
      Math.abs(avg2 - 12) < 1e-8 &&
      Math.abs(f1Root - 104 / 7) < 1e-12 &&
      scalarBest < 14.71 &&
      a2Best < 14.05 &&
      modBest < 13.62,
    `grid18 lower est on sup Q for m=1+2.5*I6: ${modBest.toFixed(6)} (vs exact 104/7=${(104 / 7).toFixed(6)}), grid10 A^2: ${a2Best.toFixed(6)}, <L_{3/2}>=${avg15.toFixed(4)}`,
  )

  return { scalarAlphaOpt, scalarBest, a2Best, modBest }
}

// =================================================================================================
// 2. PART 2: EXACT DEPTH-1 CARTIER-FOATA NAGNIBEDA 3-RATIONAL LEAN-4-READY CERTIFICATE
// =================================================================================================

function runPart2Depth1Certificate(): {
  readonly simpleUpperNum: bigint
  readonly simpleUpperDen: bigint
  readonly sharpUpperNum: bigint
  readonly sharpUpperDen: bigint
  readonly optContUpper: number
} {
  console.log('\n================================================================================')
  console.log('PART 2: EXACT DEPTH-1 CARTIER-FOATA NAGNIBEDA 3-RATIONAL LEAN 4 CERTIFICATES')
  console.log('================================================================================')

  // Exact BigInt evaluation of the 4 row sums for a_1 = p1/q1, a_2 = p2/q2, a_3 = p3/q3:
  //   S_0 = 24 a_1
  //   S_1 = 1/a_1 + 15 a_1 + 8 a_2
  //   S_2 = 2/a_2 + 11 a_1 + 8 a_2 + 3 a_3
  //   S_3 = 3/a_3 + 9 a_1 + 6 a_2 + 6 a_3
  type Rat = readonly [bigint, bigint]
  const addRat = (x: Rat, y: Rat): Rat => {
    const n = x[0] * y[1] + y[0] * x[1]
    const d = x[1] * y[1]
    const g = gcdBig(n, d)
    return [n / g, d / g]
  }
  const mulIntRat = (k: bigint, x: Rat): Rat => {
    const n = k * x[0]
    const g = gcdBig(n, x[1])
    return [n / g, x[1] / g]
  }
  const invRat = (x: Rat): Rat => [x[1], x[0]]
  const evalDepth1Exact = (a1: Rat, a2: Rat, a3: Rat): readonly [Rat, Rat, Rat, Rat] => {
    const s0 = mulIntRat(24n, a1)
    const s1 = addRat(addRat(invRat(a1), mulIntRat(15n, a1)), mulIntRat(8n, a2))
    const s2 = addRat(
      addRat(mulIntRat(2n, invRat(a2)), mulIntRat(11n, a1)),
      addRat(mulIntRat(8n, a2), mulIntRat(3n, a3)),
    )
    const s3 = addRat(
      addRat(mulIntRat(3n, invRat(a3)), mulIntRat(9n, a1)),
      addRat(mulIntRat(6n, a2), mulIntRat(6n, a3)),
    )
    return [s0, s1, s2, s3]
  }
  const maxRat = (arr: readonly Rat[]): Rat =>
    arr.reduce((best, cur) => (cur[0] * best[1] > best[0] * cur[1] ? cur : best))

  // Certificate 2A: Ultra-clean single-digit fractions a = (1/7, 1/3, 4/7) -> EXACT 335/28 < 12!
  const simpleS = evalDepth1Exact([1n, 7n], [1n, 3n], [4n, 7n])
  const simpleMax = maxRat(simpleS)
  assertExact(simpleMax[0] === 335n && simpleMax[1] === 28n, `expected 335/28, got ${simpleMax[0]}/${simpleMax[1]}`)

  // Continuous exact KKT optimum of Depth-1 (3 variables):
  let w1 = 0.4
  let w2 = 0.35
  let w3 = 0.25
  let a1Opt = 0.14
  let a2Opt = 0.33
  let a3Opt = 0.57
  for (let it = 0; it < 3000; it++) {
    a1Opt = 1 / Math.sqrt(15 + 11 * (w2 / w1) + 9 * (w3 / w1))
    a2Opt = Math.sqrt(2 / (8 + 8 * (w1 / w2) + 6 * (w3 / w2)))
    a3Opt = Math.sqrt(3 / (6 + 3 * (w2 / w3)))
    const s1 = 1 / a1Opt + 15 * a1Opt + 8 * a2Opt
    const s2 = 2 / a2Opt + 11 * a1Opt + 8 * a2Opt + 3 * a3Opt
    const s3 = 3 / a3Opt + 9 * a1Opt + 6 * a2Opt + 6 * a3Opt
    const mean = (s1 + s2 + s3) / 3
    w1 *= Math.exp(0.1 * (s1 - mean))
    w2 *= Math.exp(0.1 * (s2 - mean))
    w3 *= Math.exp(0.1 * (s3 - mean))
    const ws = w1 + w2 + w3
    w1 /= ws
    w2 /= ws
    w3 /= ws
  }
  const optContUpper = Math.max(
    24 * a1Opt,
    1 / a1Opt + 15 * a1Opt + 8 * a2Opt,
    2 / a2Opt + 11 * a1Opt + 8 * a2Opt + 3 * a3Opt,
    3 / a3Opt + 9 * a1Opt + 6 * a2Opt + 6 * a3Opt,
  )

  // Certificate 2B: Sharp 5-digit rational certificate Q = 100000 -> hits 11.92522!
  const p1 = BigInt(Math.round(a1Opt * 100000))
  const p2 = BigInt(Math.round(a2Opt * 100000))
  const p3 = BigInt(Math.round(a3Opt * 100000))
  const sharpS = evalDepth1Exact([p1, 100000n], [p2, 100000n], [p3, 100000n])
  const sharpMax = maxRat(sharpS)

  console.log(`  Single-digit Lean 4 cert a = (1/7, 1/3, 4/7):`)
  console.log(
    `    S_0=${simpleS[0][0]}/${simpleS[0][1]}, S_1=${simpleS[1][0]}/${simpleS[1][1]}, S_2=${simpleS[2][0]}/${simpleS[2][1]}, S_3=${simpleS[3][0]}/${simpleS[3][1]}`,
  )
  console.log(
    `    EXACT certified bound: rho <= ${simpleMax[0]}/${simpleMax[1]} <= ${ratCeilDec(simpleMax[0], simpleMax[1], 6)} (8-dec ceil: ${ratCeilDec(simpleMax[0], simpleMax[1], 8)}) < 12`,
  )
  console.log(
    `    Normalized: rho/24 <= 335/672 <= ${ratCeilDec(335n, 672n, 6)} < 1/2 | lambda_gap >= 337/672 >= ${ratFloorDec(337n, 672n, 6)} > 1/2!`,
  )
  console.log(`  Sharp 3-rational cert a = (${p1}/100000, ${p2}/100000, ${p3}/100000):`)
  console.log(
    `    EXACT certified bound: rho <= ${sharpMax[0]}/${sharpMax[1]} <= ${ratCeilDec(sharpMax[0], sharpMax[1], 6)} (8-dec ceil: ${ratCeilDec(sharpMax[0], sharpMax[1], 8)}; rho/24 <= ${ratCeilDec(sharpMax[0], 24n * sharpMax[1], 6)}; KKT cont opt = ${optContUpper.toFixed(8)})`,
  )

  recordCheck(
    'P2',
    'Depth-1 3-rational Nagnibeda Lean 4 certificates: 335/28 (< 12, gap > 1/2) & <= 11.925340',
    simpleMax[0] * 1n < 12n * simpleMax[1] &&
      simpleMax[0] === 335n &&
      simpleMax[1] === 28n &&
      sharpMax[0] * 1000000n <= 11925340n * sharpMax[1],
    `a=(1/7,1/3,4/7) => rho<=335/28<=${ratCeilDec(simpleMax[0], simpleMax[1], 6)} (rho/24<=${ratCeilDec(335n, 672n, 6)}<1/2); sharp Q=10^5 => <=${ratCeilDec(sharpMax[0], sharpMax[1], 6)}`,
  )

  return {
    simpleUpperNum: simpleMax[0],
    simpleUpperDen: simpleMax[1],
    sharpUpperNum: sharpMax[0],
    sharpUpperDen: sharpMax[1],
    optContUpper,
  }
}

// =================================================================================================
// 3. PART 3 & 4: EXACT DEPTH-2, DEPTH-3 (169), DEPTH-4 (2,197) AUTOMATA, BALL-R3 CROSS-CHECK,
//    EXACT BIGINT RATIONAL UPPER BOUNDS, AND RAYLEIGH-RITZ LOWER BOUNDS
// =================================================================================================

type D2State = { readonly c0: number; readonly downs: ReadonlyMap<number, number> }
type D3State = { readonly c0: number; readonly downs2: ReadonlyMap<number, D2State> }
type D4State = { readonly c0: number; readonly downs3: ReadonlyMap<number, D3State> }

function stepD2(state: D2State, b: number): D2State {
  const newC0 = (1 << b) | (state.c0 & ADJ_MASK[b]!)
  const newDowns = new Map<number, number>()
  newDowns.set(b, state.c0)
  for (const a of bitsOf(state.c0 & ADJ_MASK[b]!)) {
    newDowns.set(a, (1 << b) | (state.downs.get(a)! & ADJ_MASK[b]!))
  }
  return { c0: newC0, downs: newDowns }
}

function stepD3(st: D3State, b: number): D3State {
  const newC0 = (1 << b) | (st.c0 & ADJ_MASK[b]!)
  const newDowns2 = new Map<number, D2State>()
  const wDown1 = new Map<number, number>()
  for (const [x, d2x] of st.downs2) wDown1.set(x, d2x.c0)
  newDowns2.set(b, { c0: st.c0, downs: wDown1 })
  for (const a of bitsOf(st.c0 & ADJ_MASK[b]!)) {
    newDowns2.set(a, stepD2(st.downs2.get(a)!, b))
  }
  return { c0: newC0, downs2: newDowns2 }
}

function stepD4(st: D4State, b: number): D4State {
  const newC0 = (1 << b) | (st.c0 & ADJ_MASK[b]!)
  const newDowns3 = new Map<number, D3State>()
  const wDown2 = new Map<number, D2State>()
  for (const [x, d3x] of st.downs3) {
    const dm1 = new Map<number, number>()
    for (const [y, d2y] of d3x.downs2) dm1.set(y, d2y.c0)
    wDown2.set(x, { c0: d3x.c0, downs: dm1 })
  }
  newDowns3.set(b, { c0: st.c0, downs2: wDown2 })
  for (const a of bitsOf(st.c0 & ADJ_MASK[b]!)) {
    newDowns3.set(a, stepD3(st.downs3.get(a)!, b))
  }
  return { c0: newC0, downs3: newDowns3 }
}

function canonD2(state: D2State): string {
  if (state.c0 === 0) return '0'
  const info = CANON_CLIQUE.get(state.c0)!
  const c0Bits = bitsOf(state.c0)
  let best = ''
  for (const p of info.perms) {
    const pairs: [number, number][] = []
    for (const a of c0Bits) pairs.push([p[a]!, permMask(p, state.downs.get(a)!)])
    pairs.sort((x, y) => x[0] - y[0])
    let key = info.canon.toString(36)
    for (const [pa, dm] of pairs) key += ',' + pa.toString(36) + ':' + dm.toString(36)
    if (best === '' || key < best) best = key
  }
  return best
}

function canonD3(st: D3State): string {
  if (st.c0 === 0) return '0'
  const info = CANON_CLIQUE.get(st.c0)!
  const c0Bits = bitsOf(st.c0)
  let best = ''
  for (const p of info.perms) {
    const parts: [number, string][] = []
    for (const a of c0Bits) {
      const d2 = st.downs2.get(a)!
      const pc1 = permMask(p, d2.c0)
      const subPairs: [number, number][] = []
      for (const [x, dm] of d2.downs) subPairs.push([p[x]!, permMask(p, dm)])
      subPairs.sort((u, v) => u[0] - v[0])
      let s = pc1.toString(36)
      for (const [px, dm] of subPairs) s += '.' + px.toString(36) + ':' + dm.toString(36)
      parts.push([p[a]!, s])
    }
    parts.sort((u, v) => u[0] - v[0])
    let key = info.canon.toString(36)
    for (const [pa, s] of parts) key += '|' + pa.toString(36) + '=' + s
    if (best === '' || key < best) best = key
  }
  return best
}

function canonD4(st: D4State): string {
  if (st.c0 === 0) return '0'
  const info = CANON_CLIQUE.get(st.c0)!
  const c0Bits = bitsOf(st.c0)
  let best = ''
  for (const p of info.perms) {
    const parts: [number, string][] = []
    for (const a of c0Bits) {
      const d3 = st.downs3.get(a)!
      const pc1 = permMask(p, d3.c0)
      const subParts: [number, string][] = []
      for (const [x, d2] of d3.downs2) {
        const pc2 = permMask(p, d2.c0)
        const ss: [number, number][] = []
        for (const [y, dm] of d2.downs) ss.push([p[y]!, permMask(p, dm)])
        ss.sort((u, v) => u[0] - v[0])
        let s2 = pc2.toString(36)
        for (const [py, dm] of ss) s2 += '.' + py.toString(36) + ':' + dm.toString(36)
        subParts.push([p[x]!, s2])
      }
      subParts.sort((u, v) => u[0] - v[0])
      let s1 = pc1.toString(36)
      for (const [px, s2] of subParts) s1 += ';' + px.toString(36) + '=' + s2
      parts.push([p[a]!, s1])
    }
    parts.sort((u, v) => u[0] - v[0])
    let key = info.canon.toString(36)
    for (const [pa, s1] of parts) key += '|' + pa.toString(36) + '>' + s1
    if (best === '' || key < best) best = key
  }
  return best
}

function canonD2Edge(d2x: D2State, b: number): string {
  const perms = PERMS_TO_ZERO[b]!
  const c0Bits = bitsOf(d2x.c0)
  let best = ''
  for (const p of perms) {
    const pc0 = permMask(p, d2x.c0)
    const pairs: [number, number][] = []
    for (const a of c0Bits) pairs.push([p[a]!, permMask(p, d2x.downs.get(a)!)])
    pairs.sort((u, v) => u[0] - v[0])
    let key = pc0.toString(36)
    for (const [pa, dm] of pairs) key += ',' + pa.toString(36) + ':' + dm.toString(36)
    if (best === '' || key < best) best = key
  }
  return best
}

// Smooth convex LSE minimax solver with diagonal-Hessian preconditioning & Armijo backtracking.
function solveMinimaxLSE(
  nC: number,
  nV: number,
  Arows: readonly (readonly [number, number])[] [],
  Brows: readonly (readonly [number, number])[] [],
  schedule: readonly (readonly [number, number])[],
): { readonly upper: number; readonly f: Float64Array; readonly dual: number } {
  const x = new Float64Array(nV).fill(Math.log(0.3))
  const d = new Float64Array(nV)
  const expP = new Float64Array(nV)
  const expM = new Float64Array(nV)
  const S = new Float64Array(nC)
  const w = new Float64Array(nC)
  const grad = new Float64Array(nV)
  const diagH = new Float64Array(nV)
  const xTry = new Float64Array(nV)

  const evalAll = (xin: Float64Array, beta: number, needGrad: boolean): { val: number; maxS: number; dual: number } => {
    for (let e = 0; e < nV; e++) {
      expP[e] = Math.exp(xin[e]!)
      expM[e] = 1 / expP[e]!
    }
    let maxS = -1e300
    for (let u = 0; u < nC; u++) {
      let s = 0
      const ar = Arows[u]!
      for (let i = 0; i < ar.length; i++) s += ar[i]![1] * expP[ar[i]![0]]!
      const br = Brows[u]!
      for (let i = 0; i < br.length; i++) s += br[i]![1] * expM[br[i]![0]]!
      S[u] = s
      if (s > maxS) maxS = s
    }
    let sumE = 0
    for (let u = 0; u < nC; u++) {
      const eu = Math.exp(beta * (S[u]! - maxS))
      w[u] = eu
      sumE += eu
    }
    let dual = 0
    if (needGrad) {
      for (let u = 0; u < nC; u++) w[u] = w[u]! / sumE
      grad.fill(0)
      diagH.fill(0)
      const numD = new Float64Array(nV)
      const denD = new Float64Array(nV)
      for (let u = 0; u < nC; u++) {
        const wu = w[u]!
        if (wu < 1e-18) continue
        const ar = Arows[u]!
        for (let i = 0; i < ar.length; i++) {
          const e = ar[i]![0]
          const c = ar[i]![1]
          const term = c * expP[e]!
          grad[e] = grad[e]! + wu * term
          diagH[e] = diagH[e]! + wu * term * (1 + beta * term)
          denD[e] = denD[e]! + wu * c
        }
        const br = Brows[u]!
        for (let i = 0; i < br.length; i++) {
          const e = br[i]![0]
          const c = br[i]![1]
          const term = c * expM[e]!
          grad[e] = grad[e]! - wu * term
          diagH[e] = diagH[e]! + wu * term * (1 + beta * term)
          numD[e] = numD[e]! + wu * c
        }
      }
      for (let e = 0; e < nV; e++) {
        if (numD[e]! > 0 && denD[e]! > 0) dual += 2 * Math.sqrt(numD[e]! * denD[e]!)
      }
    }
    return { val: maxS + Math.log(sumE) / beta, maxS, dual }
  }

  let bestMax = Number.POSITIVE_INFINITY
  const bestX = Float64Array.from(x)
  let bestDual = 0

  for (const [beta, steps] of schedule) {
    for (let it = 0; it < steps; it++) {
      const cur = evalAll(x, beta, true)
      if (cur.maxS < bestMax) {
        bestMax = cur.maxS
        bestX.set(x)
      }
      if (cur.dual > bestDual) bestDual = cur.dual
      let dirDotG = 0
      for (let e = 0; e < nV; e++) {
        const de = -grad[e]! / (diagH[e]! + 1e-4)
        d[e] = de
        dirDotG += grad[e]! * de
      }
      if (-dirDotG < 1e-16) break
      let step = 1.0
      let ok = false
      for (let ls = 0; ls < 18; ls++) {
        for (let e = 0; e < nV; e++) {
          let nx = x[e]! + step * d[e]!
          if (nx < -10) nx = -10
          if (nx > 10) nx = 10
          xTry[e] = nx
        }
        const nxt = evalAll(xTry, beta, false)
        if (nxt.val <= cur.val + 1e-4 * step * dirDotG) {
          x.set(xTry)
          ok = true
          break
        }
        step *= 0.5
      }
      if (!ok) break
    }
  }

  const fOut = new Float64Array(nV)
  for (let e = 0; e < nV; e++) fOut[e] = Math.exp(bestX[e]!)
  let checkMax = 0
  for (let u = 0; u < nC; u++) {
    let s = 0
    for (const [e, c] of Arows[u]!) s += c * fOut[e]!
    for (const [e, c] of Brows[u]!) s += c / fOut[e]!
    if (s > checkMax) checkMax = s
  }
  return { upper: checkMax, f: fOut, dual: bestDual }
}

// Exact BigInt rational certification of ANY reciprocal edge-weight vector f (rounded to p_e / Q):
function certifyExactBigIntUpper(
  nC: number,
  Arows: readonly (readonly [number, number])[] [],
  Brows: readonly (readonly [number, number])[] [],
  fFloat: Float64Array,
  Q: bigint,
): { readonly num: bigint; readonly den: bigint; readonly floatVal: number; readonly pInts: bigint[] } {
  const pInts = Array.from(fFloat, v => BigInt(Math.max(1, Math.round(v * Number(Q)))))
  let maxNum = 0n
  let maxDen = 1n
  for (let u = 0; u < nC; u++) {
    let prodB = 1n
    for (const [e] of Brows[u]!) prodB *= pInts[e]!
    let sumA = 0n
    for (const [e, c] of Arows[u]!) sumA += BigInt(c) * pInts[e]!
    let sumB = 0n
    for (const [e, c] of Brows[u]!) sumB += BigInt(c) * (prodB / pInts[e]!)
    const num = sumA * prodB + Q * Q * sumB
    const den = Q * prodB
    if (num * maxDen > maxNum * den) {
      maxNum = num
      maxDen = den
    }
  }
  const g = gcdBig(maxNum, maxDen)
  const rn = maxNum / g
  const rd = maxDen / g
  return { num: rn, den: rd, floatVal: ratToFloat(rn, rd), pInts }
}

// Asymptotic Perron-Rayleigh-Ritz lower bound AND 100% exact BigInt concrete finite-support lower bound!
function computeAutomatonRR(
  n: number,
  type1: readonly number[],
  trans: readonly ReadonlyMap<number, number>[],
  rStart: number,
  rEnd: number,
): {
  readonly activeCount: number
  readonly lamBall: number
  readonly rhoAsymp: number
  readonly rrFinNum: bigint
  readonly rrFinDen: bigint
  readonly shells0to5: readonly bigint[]
} {
  // Exact BigInt shell counts N(r, u) for r = 0..rEnd (checking exact divisibility by k(v) at EVERY step!)
  const countsBig: bigint[][] = [Array.from({ length: n }, (_, u) => (u === 0 ? 1n : 0n))]
  for (let r = 1; r <= rEnd; r++) {
    const prev = countsBig[r - 1]!
    const cur = new Array<bigint>(n).fill(0n)
    for (let u = 0; u < n; u++) {
      const pu = prev[u]!
      if (pu === 0n) continue
      for (const [v, m] of trans[u]!) cur[v] = cur[v]! + pu * BigInt(m)
    }
    for (let v = 1; v < n; v++) {
      const kv = BigInt(type1[v]!)
      assertExact(cur[v]! % kv === 0n, `Cartier-Foata integrality failed at r=${r}, v=${v}`)
      cur[v] = cur[v]! / kv
    }
    countsBig.push(cur)
  }
  const shells0to5 = countsBig.slice(0, 6).map(row => row.reduce((a, b) => a + b, 0n))

  // Perron vector p on active recurrent states
  let p = new Float64Array(n)
  p[0] = 1
  for (let r = 1; r <= 75; r++) {
    const q = new Float64Array(n)
    for (let u = 0; u < n; u++) {
      const pu = p[u]!
      if (pu === 0) continue
      for (const [v, m] of trans[u]!) q[v] = q[v]! + pu * m
    }
    let s = 0
    for (let v = 1; v < n; v++) {
      q[v] = q[v]! / type1[v]!
      s += q[v]!
    }
    for (let v = 0; v < n; v++) p[v] = q[v]! / s
  }
  let lamBall = 0
  const active: number[] = []
  const idxOf = new Int32Array(n).fill(-1)
  for (let u = 0; u < n; u++) {
    for (const [v, m] of trans[u]!) lamBall += (p[u]! * m) / type1[v]!
    if (p[u]! > 1e-18) {
      idxOf[u] = active.length
      active.push(u)
    }
  }
  const na = active.length

  // Sparse power iteration for lambda_max(B + B^T)
  let eigVec = new Float64Array(na).fill(1 / Math.sqrt(na))
  let rhoAsymp = 0
  for (let it = 0; it < 240; it++) {
    const y = new Float64Array(na)
    for (let iu = 0; iu < na; iu++) {
      const u = active[iu]!
      const sqPu = Math.sqrt(p[u]!)
      for (const [v, m] of trans[u]!) {
        const iv = idxOf[v]!
        if (iv < 0) continue
        const bij = (m / Math.sqrt(lamBall)) * (sqPu / Math.sqrt(p[v]!))
        y[iu] = y[iu]! + bij * eigVec[iv]!
        y[iv] = y[iv]! + bij * eigVec[iu]!
      }
    }
    let rq = 0
    let n2 = 0
    for (let i = 0; i < na; i++) {
      rq += eigVec[i]! * y[i]!
      n2 += y[i]! * y[i]!
    }
    rhoAsymp = rq
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < na; i++) eigVec[i] = y[i]! * inv
  }

  // Concrete finite-support Rayleigh-Ritz certificate on shells r = rStart..rEnd:
  // Construct an EXPLICIT integer vertex-valued function psi(w) = xInt[i][iu] in Z for w in V_{rStart+i, active[iu]}
  // and evaluate BOTH <psi, A psi> and <psi, psi> in 100% EXACT BigInt arithmetic (ZERO Math.sqrt in certification!).
  const L = rEnd - rStart + 1
  const win = new Float64Array(L)
  for (let i = 0; i < L; i++) win[i] = Math.sin((Math.PI * (i + 1)) / (L + 1))

  let refHalf = 0
  for (let iu = 0; iu < na; iu++) {
    const N = countsBig[rEnd]![active[iu]!]!
    if (N > 0n) {
      const h = Math.floor(N.toString(2).length / 2)
      if (h > refHalf) refHalf = h
    }
  }
  const xInt: bigint[][] = Array.from({ length: L }, (_, i) => {
    const r = rStart + i
    const cR = countsBig[r]!
    const wr = win[i]!
    const row = new Array<bigint>(na).fill(0n)
    for (let iu = 0; iu < na; iu++) {
      const N = cR[active[iu]!]!
      if (N === 0n) continue
      const bits = N.toString(2).length
      const half = Math.floor(bits / 2)
      const s = 2 * half - 50
      const mant = s >= 0 ? Number(N >> BigInt(s)) / 2 ** 50 : Number(N) / 2 ** (2 * half)
      const q = BigInt(Math.round(((wr * eigVec[iu]!) / Math.sqrt(mant)) * 1e12))
      row[iu] = q << BigInt(refHalf - half)
    }
    return row
  })

  let rrFinNum = 0n
  let rrFinDen = 0n
  for (let i = 0; i < L; i++) {
    const r = rStart + i
    const cR = countsBig[r]!
    const xR = xInt[i]!
    for (let iu = 0; iu < na; iu++) {
      const cu = cR[active[iu]!]!
      const xu = xR[iu]!
      if (cu === 0n || xu === 0n) continue
      rrFinDen += cu * xu * xu
    }
    if (i < L - 1) {
      const xR1 = xInt[i + 1]!
      for (let iu = 0; iu < na; iu++) {
        const u = active[iu]!
        const cu = cR[u]!
        const xu = xR[iu]!
        if (cu === 0n || xu === 0n) continue
        let inner = 0n
        for (const [v, m] of trans[u]!) {
          const iv = idxOf[v]!
          if (iv < 0) continue
          inner += BigInt(m) * xR1[iv]!
        }
        rrFinNum += cu * xu * inner
      }
    }
  }
  rrFinNum *= 2n
  assertExact(rrFinDen > 0n && rrFinNum > 0n, 'exact BigInt finite RR must be positive')
  return { activeCount: na, lamBall, rhoAsymp, rrFinNum, rrFinDen, shells0to5 }
}

// Exact O^+(4,1; Z[sqrt(2)]) R=3 ball (8,857 docks) for direct zero-assumption cross-check!
function buildExactBallR3(): {
  readonly nDocks: number
  readonly radius: Int32Array
  readonly neighbors: readonly Int32Array[]
} {
  const DIM5 = [0, 1, 2, 3, 4] as const
  const Q2_ZERO: Q2 = [0n, 0n]
  const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
  const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
  const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
  const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
  const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 =>
    u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
  const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
  const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] => m.map(r => dotQ2(r, v))
  const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
    a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))
  const TWICE_GRAM: readonly (readonly Q2[])[] = DIM5.map(i =>
    DIM5.map(j => {
      if (i === j) return [2n, 0n] as const
      if (Math.abs(i - j) === 1) return Math.min(i, j) % 2 === 0 ? ([-1n, 0n] as const) : ([0n, -1n] as const)
      return Q2_ZERO
    }),
  )
  const twiceForm = (u: readonly Q2[], v: readonly Q2[]): Q2 => dotQ2(u, matVecQ2(TWICE_GRAM, v))
  const reflect5 = (normal: readonly Q2[]): Q2[][] => {
    const dual = matVecQ2(TWICE_GRAM, normal)
    return EYE5.map((row, i) => row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))))
  }
  const BASE_CENTER: readonly Q2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]
  const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
    DIM5.map(j => [
      (j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n),
      j === 4 ? 2n * BASE_CENTER[i]![1] : 0n,
    ]),
  )
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seenN = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of stabGens) {
      const next = matVecQ2(g, n)
      const key = vecKeyQ2(next)
      if (!seenN.has(key)) {
        seenN.add(key)
        facetNormals.push(next)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint => (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const orthoBasis: number[] = []
  for (let f = 0; f < 24 && orthoBasis.length < 4; f++) {
    if (orthoBasis.every(prev => facetDot(f, prev) === 0n)) orthoBasis.push(f)
  }
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = orthoBasis.map(o => Number(facetDot(f, o)))
    return [(c0! + c1!) / 2, (c0! - c1!) / 2, (c2! + c3!) / 2, (c2! - c3!) / 2]
  })
  const transports = ROOTS.map(root => {
    const fIdx = facetRoots.findIndex(fr => fr.every((v, i) => v === root[i]))
    return matMulQ2(reflect5(facetNormals[fIdx]!), CENTRAL_INVERSION)
  })

  const frames: (readonly (readonly Q2[])[])[] = [EYE5]
  const centerToId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
  const neighbors: Int32Array[] = [new Int32Array(24).fill(-1)]
  const radiusList: number[] = [0]

  for (let d = 0; d < frames.length; d++) {
    const r = radiusList[d]!
    if (r >= 3) continue
    const frame = frames[d]!
    for (let s = 0; s < 24; s++) {
      if (neighbors[d]![s]! >= 0) continue
      const nf = matMulQ2(frame, transports[s]!)
      const cKey = vecKeyQ2(matVecQ2(nf, BASE_CENTER))
      let nid = centerToId.get(cKey)
      if (nid === undefined) {
        nid = frames.length
        centerToId.set(cKey, nid)
        frames.push(nf)
        radiusList.push(r + 1)
        neighbors.push(new Int32Array(24).fill(-1))
      }
      neighbors[d]![s] = nid
      neighbors[nid]![OPPOSITE_SLOT[s]!] = d
    }
  }
  assertExact(frames.length === 8857, `expected 8857 docks in R=3 ball, got ${frames.length}`)
  return { nDocks: frames.length, radius: Int32Array.from(radiusList), neighbors }
}

function runParts3And4Hierarchy(): {
  readonly d1LowerAsymp: number
  readonly d1FinNum: bigint
  readonly d1FinDen: bigint
  readonly d2LowerAsymp: number
  readonly d2FinNum: bigint
  readonly d2FinDen: bigint
  readonly d3LowerAsymp: number
  readonly d3FinNum: bigint
  readonly d3FinDen: bigint
  readonly d3UpperNum: bigint
  readonly d3UpperDen: bigint
  readonly d4LowerAsymp: number
  readonly d4FinNum: bigint
  readonly d4FinDen: bigint
  readonly d4UpperNum: bigint
  readonly d4UpperDen: bigint
} {
  console.log('\n================================================================================')
  console.log('PARTS 3 & 4: EXACT DEPTH-1..4 CARTIER-FOATA BOUNDS + R=3 BALL CROSS-CHECK')
  console.log('================================================================================')

  const EXPECTED_SHELLS = [1n, 24n, 456n, 8376n, 153192n, 2800344n] as const

  // --- Depth 1 (4 states: |D(w)| in {0, 1, 2, 3}) ---
  const d1Trans: readonly ReadonlyMap<number, number>[] = [
    new Map([[1, 24]]),
    new Map([[1, 15], [2, 8]]),
    new Map([[1, 11], [2, 8], [3, 3]]),
    new Map([[1, 9], [2, 6], [3, 6]]),
  ]
  const d1RR = computeAutomatonRR(4, [0, 1, 2, 3], d1Trans, 20, 180)

  // --- Depth 2 (19 states) ---
  const d2States: D2State[] = [{ c0: 0, downs: new Map() }]
  const d2KeyToId = new Map<string, number>([['0', 0]])
  const d2Trans: Map<number, number>[] = []
  for (let u = 0; u < d2States.length; u++) {
    const st = d2States[u]!
    const row = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD2(st, b)
      const k = canonD2(nxt)
      let v = d2KeyToId.get(k)
      if (v === undefined) {
        v = d2States.length
        d2KeyToId.set(k, v)
        d2States.push(nxt)
      }
      row.set(v, (row.get(v) ?? 0) + 1)
    }
    d2Trans.push(row)
  }
  assertExact(d2States.length === 19, `expected 19 D2 states, got ${d2States.length}`)
  const d2RR = computeAutomatonRR(
    d2States.length,
    d2States.map(s => popcount(s.c0)),
    d2Trans,
    20,
    180,
  )

  // --- Depth 3 (169 states) ---
  const d3States: D3State[] = [{ c0: 0, downs2: new Map() }]
  const d3KeyToId = new Map<string, number>([['0', 0]])
  const d3Trans: Map<number, number>[] = []
  for (let u = 0; u < d3States.length; u++) {
    const st = d3States[u]!
    const row = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD3(st, b)
      const k = canonD3(nxt)
      let v = d3KeyToId.get(k)
      if (v === undefined) {
        v = d3States.length
        d3KeyToId.set(k, v)
        d3States.push(nxt)
      }
      row.set(v, (row.get(v) ?? 0) + 1)
    }
    d3Trans.push(row)
  }
  assertExact(d3States.length === 169, `expected 169 D3 states, got ${d3States.length}`)
  const d3RR = computeAutomatonRR(
    d3States.length,
    d3States.map(s => popcount(s.c0)),
    d3Trans,
    20,
    180,
  )

  // Depth-3 Directed D2-Edge Orbit Nagnibeda Upper Bound (184 vars, exact BigInt Q = 100,000)
  const dirKeyToId = new Map<string, number>()
  const getDirId = (d2x: D2State, b: number): number => {
    const k = canonD2Edge(d2x, b)
    let id = dirKeyToId.get(k)
    if (id === undefined) {
      id = dirKeyToId.size
      dirKeyToId.set(k, id)
    }
    return id
  }
  const Adir: [number, number][][] = []
  const Bdir: [number, number][][] = []
  for (let u = 0; u < d3States.length; u++) {
    const st = d3States[u]!
    const d2uMap = new Map<number, number>()
    for (const [a, d2a] of st.downs2) d2uMap.set(a, d2a.c0)
    const d2u: D2State = { c0: st.c0, downs: d2uMap }
    const upMap = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const eid = getDirId(d2u, b)
      upMap.set(eid, (upMap.get(eid) ?? 0) + 1)
    }
    const downMap = new Map<number, number>()
    for (const [a, d2a] of st.downs2) {
      const eid = getDirId(d2a, a)
      downMap.set(eid, (downMap.get(eid) ?? 0) + 1)
    }
    Adir.push([...upMap.entries()])
    Bdir.push([...downMap.entries()])
  }
  assertExact(dirKeyToId.size === 184, `expected 184 D2 directed edges, got ${dirKeyToId.size}`)
  const d3Sol = solveMinimaxLSE(d3States.length, dirKeyToId.size, Adir, Bdir, [
    [5, 180],
    [25, 260],
    [120, 380],
    [600, 520],
    [3000, 680],
    [18000, 800],
  ])
  const d3Cert = certifyExactBigIntUpper(d3States.length, Adir, Bdir, d3Sol.f, 100000n)

  // --- Depth 4 (2,197 states) ---
  const d4States: D4State[] = [{ c0: 0, downs3: new Map() }]
  const d4KeyToId = new Map<string, number>([['0', 0]])
  const d4Trans: Map<number, number>[] = []
  for (let u = 0; u < d4States.length; u++) {
    const st = d4States[u]!
    const row = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD4(st, b)
      const k = canonD4(nxt)
      let v = d4KeyToId.get(k)
      if (v === undefined) {
        v = d4States.length
        d4KeyToId.set(k, v)
        d4States.push(nxt)
      }
      row.set(v, (row.get(v) ?? 0) + 1)
    }
    d4Trans.push(row)
  }
  assertExact(d4States.length === 2197, `expected 2197 D4 states, got ${d4States.length}`)
  const d4RR = computeAutomatonRR(
    d4States.length,
    d4States.map(s => popcount(s.c0)),
    d4Trans,
    20,
    180,
  )

  // Depth-4 D3-Pair Edge-Weight Nagnibeda Upper Bound (1,841 vars, exact BigInt Q = 100,000)
  const d3OfD4 = d4States.map(st => {
    const dm2 = new Map<number, D2State>()
    for (const [a, d3a] of st.downs3) {
      const dm1 = new Map<number, number>()
      for (const [x, d2x] of d3a.downs2) dm1.set(x, d2x.c0)
      dm2.set(a, { c0: d3a.c0, downs: dm1 })
    }
    return d3KeyToId.get(canonD3({ c0: st.c0, downs2: dm2 }))!
  })
  const pairToId = new Map<string, number>()
  const getPairId = (u3: number, v3: number): number => {
    const k = `${u3},${v3}`
    let id = pairToId.get(k)
    if (id === undefined) {
      id = pairToId.size
      pairToId.set(k, id)
    }
    return id
  }
  const Apair4: [number, number][][] = []
  const Bpair4: [number, number][][] = []
  for (let u = 0; u < d4States.length; u++) {
    const u3 = d3OfD4[u]!
    const upMap = new Map<number, number>()
    for (const [v, m] of d4Trans[u]!) {
      const eid = getPairId(u3, d3OfD4[v]!)
      upMap.set(eid, (upMap.get(eid) ?? 0) + m)
    }
    const downMap = new Map<number, number>()
    for (const d3a of d4States[u]!.downs3.values()) {
      const a3 = d3KeyToId.get(canonD3(d3a))!
      const eid = getPairId(a3, u3)
      downMap.set(eid, (downMap.get(eid) ?? 0) + 1)
    }
    Apair4.push([...upMap.entries()])
    Bpair4.push([...downMap.entries()])
  }
  assertExact(pairToId.size === 1841, `expected 1841 D3-pair edges, got ${pairToId.size}`)
  const d4Sol = solveMinimaxLSE(d4States.length, pairToId.size, Apair4, Bpair4, [
    [4, 80],
    [16, 120],
    [64, 180],
    [250, 260],
    [1000, 320],
    [4000, 380],
    [15000, 320],
  ])
  const d4Cert = certifyExactBigIntUpper(d4States.length, Apair4, Bpair4, d4Sol.f, 100000n)

  // --- DIRECT ZERO-ASSUMPTION CROSS-CHECK ON ALL 8,857 DOCKS OF EXACT O^+(4,1; Z[sqrt(2)]) R=3 BALL ---
  const ball = buildExactBallR3()
  const racgLetter = (r: number, slot: number): number => ((r & 1) === 0 ? slot : OPPOSITE_SLOT[slot]!)
  const ballD1 = new Int32Array(ball.nDocks)
  for (let d = 0; d < ball.nDocks; d++) {
    const rd = ball.radius[d]!
    if (rd === 0) continue
    let mask = 0
    const nb = ball.neighbors[d]!
    for (let s = 0; s < 24; s++) {
      const t = nb[s]!
      if (t >= 0 && ball.radius[t] === rd - 1) mask |= 1 << racgLetter(rd - 1, OPPOSITE_SLOT[s]!)
    }
    ballD1[d] = mask
  }
  const ballD2: D2State[] = []
  for (let d = 0; d < ball.nDocks; d++) {
    const rd = ball.radius[d]!
    const dm = new Map<number, number>()
    if (rd > 0) {
      const nb = ball.neighbors[d]!
      for (let s = 0; s < 24; s++) {
        const t = nb[s]!
        if (t >= 0 && ball.radius[t] === rd - 1) dm.set(racgLetter(rd - 1, OPPOSITE_SLOT[s]!), ballD1[t]!)
      }
    }
    ballD2.push({ c0: ballD1[d]!, downs: dm })
  }
  const ballD3: D3State[] = []
  const ballD3Id = new Int32Array(ball.nDocks)
  let unknownD3 = 0
  for (let d = 0; d < ball.nDocks; d++) {
    const rd = ball.radius[d]!
    const dm2 = new Map<number, D2State>()
    if (rd > 0) {
      const nb = ball.neighbors[d]!
      for (let s = 0; s < 24; s++) {
        const t = nb[s]!
        if (t >= 0 && ball.radius[t] === rd - 1) dm2.set(racgLetter(rd - 1, OPPOSITE_SLOT[s]!), ballD2[t]!)
      }
    }
    const st3: D3State = { c0: ballD1[d]!, downs2: dm2 }
    ballD3.push(st3)
    const id = d3KeyToId.get(canonD3(st3))
    if (id === undefined) {
      unknownD3++
      ballD3Id[d] = -1
    } else {
      ballD3Id[d] = id
    }
  }
  const ballD4Id = new Int32Array(ball.nDocks)
  let unknownD4 = 0
  for (let d = 0; d < ball.nDocks; d++) {
    const rd = ball.radius[d]!
    const dm3 = new Map<number, D3State>()
    if (rd > 0) {
      const nb = ball.neighbors[d]!
      for (let s = 0; s < 24; s++) {
        const t = nb[s]!
        if (t >= 0 && ball.radius[t] === rd - 1) dm3.set(racgLetter(rd - 1, OPPOSITE_SLOT[s]!), ballD3[t]!)
      }
    }
    const id = d4KeyToId.get(canonD4({ c0: ballD1[d]!, downs3: dm3 }))
    if (id === undefined) {
      unknownD4++
      ballD4Id[d] = -1
    } else {
      ballD4Id[d] = id
    }
  }
  // Exact D4 histogram match against automaton counts for r = 0, 1, 2, 3!
  const ballD4Hist = Array.from({ length: 4 }, () => new Int32Array(d4States.length))
  for (let d = 0; d < ball.nDocks; d++) {
    const id = ballD4Id[d]!
    if (id >= 0) ballD4Hist[ball.radius[d]!]![id] = ballD4Hist[ball.radius[d]!]![id]! + 1
  }
  let histMismatchesD4 = 0
  let curB = new Array<bigint>(d4States.length).fill(0n)
  curB[0] = 1n
  for (let r = 0; r <= 3; r++) {
    for (let u = 0; u < d4States.length; u++) {
      if (BigInt(ballD4Hist[r]![u]!) !== curB[u]!) histMismatchesD4++
    }
    if (r < 3) {
      const nxt = new Array<bigint>(d4States.length).fill(0n)
      for (let u = 0; u < d4States.length; u++) {
        if (curB[u] === 0n) continue
        for (const [v, m] of d4Trans[u]!) nxt[v] = nxt[v]! + curB[u]! * BigInt(m)
      }
      for (let v = 1; v < d4States.length; v++) nxt[v] = nxt[v]! / BigInt(popcount(d4States[v]!.c0))
      curB = nxt
    }
  }
  // Direct edge-weight Schur row sums on all interior docks (r <= 2) in EXACT BigInt arithmetic!
  let ballMaxNum = 0n
  let ballMaxDen = 1n
  const Q4 = 100000n
  for (let d = 0; d < ball.nDocks; d++) {
    const rd = ball.radius[d]!
    if (rd > 2) continue
    const nb = ball.neighbors[d]!
    const downP: bigint[] = []
    let sumA = 0n
    for (let s = 0; s < 24; s++) {
      const t = nb[s]!
      if (ball.radius[t] === rd + 1) {
        const eid = getPairId(ballD3Id[d]!, ballD3Id[t]!)
        sumA += d4Cert.pInts[eid]!
      } else {
        const eid = getPairId(ballD3Id[t]!, ballD3Id[d]!)
        downP.push(d4Cert.pInts[eid]!)
      }
    }
    let prodB = 1n
    for (const pVal of downP) prodB *= pVal
    let sumB = 0n
    for (const pVal of downP) sumB += prodB / pVal
    const num = sumA * prodB + Q4 * Q4 * sumB
    const den = Q4 * prodB
    if (num * ballMaxDen > ballMaxNum * den) {
      ballMaxNum = num
      ballMaxDen = den
    }
  }

  const shellsMatch =
    d1RR.shells0to5.every((v, i) => v === EXPECTED_SHELLS[i]) &&
    d2RR.shells0to5.every((v, i) => v === EXPECTED_SHELLS[i]) &&
    d3RR.shells0to5.every((v, i) => v === EXPECTED_SHELLS[i]) &&
    d4RR.shells0to5.every((v, i) => v === EXPECTED_SHELLS[i])

  console.log(`  Exact O^+(4,1; Z[sqrt(2)]) R=3 ball (8,857 docks) direct cross-check:`)
  console.log(
    `    unknownD3=${unknownD3}, unknownD4=${unknownD4}, D4 hist mismatches (r=0..3)=${histMismatchesD4}, exact BigInt max interior Schur sum <= ${ratCeilDec(ballMaxNum, ballMaxDen, 6)} <= ${ratCeilDec(d4Cert.num, d4Cert.den, 6)}`,
  )
  console.log(
    `  Depth-1 (    4 states,    3 active): RR asymp >= ${floatFloorDec(d1RR.rhoAsymp, 6)} | EXACT BigInt finite (r=20..180) >= ${ratFloorDec(d1RR.rrFinNum, d1RR.rrFinDen, 6)} (8-dec: ${ratFloorDec(d1RR.rrFinNum, d1RR.rrFinDen, 8)})`,
  )
  console.log(
    `  Depth-2 (   19 states,   17 active): RR asymp >= ${floatFloorDec(d2RR.rhoAsymp, 6)} | EXACT BigInt finite (r=20..180) >= ${ratFloorDec(d2RR.rrFinNum, d2RR.rrFinDen, 6)} (8-dec: ${ratFloorDec(d2RR.rrFinNum, d2RR.rrFinDen, 8)})`,
  )
  console.log(
    `  Depth-3 (  169 states,  163 active): RR asymp >= ${floatFloorDec(d3RR.rhoAsymp, 6)} | EXACT BigInt finite >= ${ratFloorDec(d3RR.rrFinNum, d3RR.rrFinDen, 6)} | EXACT BigInt upper (184 vars) <= ${ratCeilDec(d3Cert.num, d3Cert.den, 6)} (8-dec: ${ratCeilDec(d3Cert.num, d3Cert.den, 8)}, dual ${d3Sol.dual.toFixed(6)})`,
  )
  console.log(
    `  Depth-4 (2,197 states, 2,166 active): RR asymp >= ${floatFloorDec(d4RR.rhoAsymp, 6)} | EXACT BigInt finite >= ${ratFloorDec(d4RR.rrFinNum, d4RR.rrFinDen, 6)} (8-dec: ${ratFloorDec(d4RR.rrFinNum, d4RR.rrFinDen, 8)}) | EXACT BigInt upper (1,841 vars) <= ${ratCeilDec(d4Cert.num, d4Cert.den, 6)} (8-dec: ${ratCeilDec(d4Cert.num, d4Cert.den, 8)}, dual ${d4Sol.dual.toFixed(6)})`,
  )

  recordCheck(
    'P3',
    'Depth-1..4 Cartier-Foata automata exact shell sums & 0-mismatch R=3 ball (8,857 docks) check',
    shellsMatch &&
      unknownD3 === 0 &&
      unknownD4 === 0 &&
      histMismatchesD4 === 0 &&
      ballMaxNum * d4Cert.den <= d4Cert.num * ballMaxDen,
    `shells=1,24,456,8376,153192,2800344; ballR3 unknown=0/0, histErr=0, exact BigInt maxRowSum<=${ratCeilDec(ballMaxNum, ballMaxDen, 6)}`,
  )

  const d4FinLo6 = ratFloorDec(d4RR.rrFinNum, d4RR.rrFinDen, 6)
  const d4AsympLo6 = floatFloorDec(d4RR.rhoAsymp, 6)
  const d4UpHi6 = ratCeilDec(d4Cert.num, d4Cert.den, 6)

  recordCheck(
    'P4',
    'Exact BigInt Nagnibeda upper bounds (D3 <= 11.478891, D4 <= 11.452078) & BigInt finite RR',
    d3Cert.num * 1000000n <= 11478891n * d3Cert.den &&
      d4Cert.num * 1000000n <= 11452078n * d4Cert.den &&
      d4RR.rrFinNum * d4Cert.den < d4Cert.num * d4RR.rrFinDen &&
      d4RR.rrFinNum * 1000000n >= 11308339n * d4RR.rrFinDen &&
      d4RR.rhoAsymp - 1e-12 >= 11.310466,
    `OUTWARD-ROUNDED BRACKETS: concrete BigInt [${d4FinLo6}, ${d4UpHi6}], asymp [${d4AsympLo6}, ${d4UpHi6}]`,
  )

  return {
    d1LowerAsymp: d1RR.rhoAsymp,
    d1FinNum: d1RR.rrFinNum,
    d1FinDen: d1RR.rrFinDen,
    d2LowerAsymp: d2RR.rhoAsymp,
    d2FinNum: d2RR.rrFinNum,
    d2FinDen: d2RR.rrFinDen,
    d3LowerAsymp: d3RR.rhoAsymp,
    d3FinNum: d3RR.rrFinNum,
    d3FinDen: d3RR.rrFinDen,
    d3UpperNum: d3Cert.num,
    d3UpperDen: d3Cert.den,
    d4LowerAsymp: d4RR.rhoAsymp,
    d4FinNum: d4RR.rrFinNum,
    d4FinDen: d4RR.rrFinDen,
    d4UpperNum: d4Cert.num,
    d4UpperDen: d4Cert.den,
  }
}

// =================================================================================================
// 5. PART 5: EXACT AMENABLE PARABOLIC CUSP W_L \ W(Gamma_24) BLOCH k=0 LOWER BOUNDS (F=0..4 & AUTO)
// =================================================================================================

function runPart5CuspBloch(): {
  readonly cuspF3Num: bigint
  readonly cuspF3Den: bigint
  readonly cuspF4Num: bigint
  readonly cuspF4Den: bigint
  readonly cuspAutoNum: bigint
  readonly cuspAutoDen: bigint
} {
  console.log('\n================================================================================')
  console.log('PART 5: EXACT AMENABLE CUSP W_L \\ W(Gamma_24) BLOCH k=0 DIRICHLET & AUTOMATON')
  console.log('================================================================================')

  const LAYER_SLOTS: number[] = []
  let LAYER_MASK = 0
  for (let a = 0; a < 24; a++) {
    if (ROOTS[a]![0] === 1) {
      LAYER_SLOTS.push(a)
      LAYER_MASK |= 1 << a
    }
  }
  const OH_STAB = WF4.filter(p => {
    for (const a of LAYER_SLOTS) if (((1 << p[a]!) & LAYER_MASK) === 0) return false
    return true
  })
  assertExact(LAYER_SLOTS.length === 6 && OH_STAB.length === 48, 'cusp layer/O_h mismatch')

  const renormalizeCF = (blocksIn: readonly number[]): number[] => {
    const out: number[] = []
    for (const blk of blocksIn) {
      for (const b of bitsOf(blk)) {
        let pos = out.length
        while (pos > 0) {
          const prev = out[pos - 1]!
          if ((prev & ADJ_MASK[b]!) === prev) pos--
          else break
        }
        if (pos === out.length) out.push(1 << b)
        else out[pos] = out[pos]! | (1 << b)
      }
    }
    return out.filter(m => m !== 0)
  }

  const stepCuspCF = (blocks: readonly number[], b: number): { readonly kind: 'loop' | 'up' | 'down'; readonly next: number[] } => {
    let pos = blocks.length
    while (pos > 0) {
      const prev = blocks[pos - 1]!
      if ((prev & (1 << b)) !== 0) {
        const copy = blocks.slice()
        copy[pos - 1] = prev ^ (1 << b)
        return { kind: 'down', next: renormalizeCF(copy) }
      }
      if ((prev & ADJ_MASK[b]!) === prev) pos--
      else break
    }
    if (pos === 0 && (LAYER_MASK & (1 << b)) !== 0) return { kind: 'loop', next: blocks.slice() }
    const copy = blocks.slice()
    if (pos === copy.length) copy.push(1 << b)
    else copy[pos] = copy[pos]! | (1 << b)
    return { kind: 'up', next: copy }
  }

  const canonCuspOrbit = (blocks: readonly number[]): string => {
    if (blocks.length === 0) return ''
    let best = ''
    for (const p of OH_STAB) {
      let k = ''
      for (let i = 0; i < blocks.length; i++) {
        if (i > 0) k += ','
        k += permMask(p, blocks[i]!).toString(36)
      }
      if (best === '' || k < best) best = k
    }
    return best
  }

  const calcOrbitSize = (blocks: readonly number[]): number => {
    const seen = new Set<string>()
    for (const p of OH_STAB) {
      let k = ''
      for (let i = 0; i < blocks.length; i++) {
        if (i > 0) k += ','
        k += permMask(p, blocks[i]!).toString(36)
      }
      seen.add(k)
    }
    return seen.size
  }

  const F_MAX = 4
  const reps: number[][] = [[]]
  const depths: number[] = [0]
  const keyToId = new Map<string, number>([['', 0]])
  const adj: Map<number, number>[] = []
  const orbitSize: number[] = [1]

  for (let u = 0; u < reps.length; u++) {
    const blk = reps[u]!
    const du = depths[u]!
    const row = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      const st = stepCuspCF(blk, b)
      if (st.kind === 'up' && du === F_MAX) continue
      const k = canonCuspOrbit(st.next)
      let v = keyToId.get(k)
      if (v === undefined) {
        v = reps.length
        keyToId.set(k, v)
        reps.push(st.next)
        depths.push(du + 1)
        orbitSize.push(calcOrbitSize(st.next))
      }
      row.set(v, (row.get(v) ?? 0) + 1)
    }
    adj.push(row)
  }

  const shellCounts = [0, 0, 0, 0, 0]
  const orbitCounts = [0, 0, 0, 0, 0]
  for (let u = 0; u < reps.length; u++) {
    const d = depths[u]!
    shellCounts[d] = shellCounts[d]! + orbitSize[u]!
    orbitCounts[d] = orbitCounts[d]! + 1
  }
  const expCusp = [1, 18, 330, 6034, 110298] as const
  const cuspShellsOk = shellCounts.every((v, i) => v === expCusp[i])

  let asymErr = 0
  for (let u = 0; u < reps.length; u++) {
    for (const [v, m] of adj[u]!) {
      if (orbitSize[u]! * m !== orbitSize[v]! * (adj[v]!.get(u) ?? 0)) asymErr++
    }
  }

  const rhoByFRat: { readonly num: bigint; readonly den: bigint }[] = []
  for (let F = 0; F <= F_MAX; F++) {
    const keep: number[] = []
    const mapIdx = new Int32Array(reps.length).fill(-1)
    for (let u = 0; u < reps.length; u++) {
      if (depths[u]! <= F) {
        mapIdx[u] = keep.length
        keep.push(u)
      }
    }
    const m = keep.length
    const sEdges: [number, number, number][] = []
    for (let iu = 0; iu < m; iu++) {
      const u = keep[iu]!
      const su = Math.sqrt(orbitSize[u]!)
      for (const [v, mult] of adj[u]!) {
        const iv = mapIdx[v]!
        if (iv >= 0) sEdges.push([iu, iv, (mult * su) / Math.sqrt(orbitSize[v]!)])
      }
    }
    let x = new Float64Array(m).fill(1 / Math.sqrt(m))
    for (let it = 0; it < 350; it++) {
      const y = new Float64Array(m)
      for (const [iu, iv, val] of sEdges) y[iu] = y[iu]! + val * x[iv]!
      let n2 = 0
      for (let i = 0; i < m; i++) n2 += y[i]! * y[i]!
      const inv = 1 / Math.sqrt(n2)
      for (let i = 0; i < m; i++) x[i] = y[i]! * inv
    }
    // Exact BigInt Rayleigh-Ritz evaluation on the finite coset graph Dirichlet floor F (vertex amplitudes psi_u in Z):
    const xInt = new Array<bigint>(m)
    for (let iu = 0; iu < m; iu++) {
      xInt[iu] = BigInt(Math.round((x[iu]! / Math.sqrt(orbitSize[keep[iu]!]!)) * 1e11))
    }
    let numBig = 0n
    let denBig = 0n
    for (let iu = 0; iu < m; iu++) {
      const u = keep[iu]!
      const orbBig = BigInt(orbitSize[u]!)
      const xu = xInt[iu]!
      denBig += orbBig * xu * xu
      let inner = 0n
      for (const [v, mult] of adj[u]!) {
        const iv = mapIdx[v]!
        if (iv >= 0) inner += BigInt(mult) * xInt[iv]!
      }
      numBig += orbBig * xu * inner
    }
    assertExact(denBig > 0n && numBig > 0n, `Cusp F=${F} BigInt RR positive`)
    rhoByFRat.push({ num: numBig, den: denBig })
    const totDocks = shellCounts.slice(0, F + 1).reduce((a, b) => a + b, 0)
    console.log(
      `  Cusp Dirichlet F=${F} (${String(totDocks).padStart(6)} docks, ${String(m).padStart(4)} O_h orbits): EXACT BigInt rho_F >= ${ratFloorDec(numBig, denBig, 6)} (8-dec: ${ratFloorDec(numBig, denBig, 8)})`,
    )
  }

  // 23-state infinite-depth Cusp (D_R, L_comm) automaton mod O_h (D = 0..48)
  type CuspSt = { readonly dr: number; readonly lc: number }
  const canonC = (st: CuspSt): string => {
    let best = ''
    for (const p of OH_STAB) {
      const k = `${permMask(p, st.dr).toString(36)}:${permMask(p, st.lc).toString(36)}`
      if (best === '' || k < best) best = k
    }
    return best
  }
  const cStates: CuspSt[] = [{ dr: 0, lc: LAYER_MASK }]
  const cMap = new Map<string, number>([[canonC(cStates[0]!), 0]])
  const cTrans: Map<number, number>[] = []
  const cLoops: number[] = []
  for (let u = 0; u < cStates.length; u++) {
    const st = cStates[u]!
    const row = new Map<number, number>()
    let lp = 0
    for (let b = 0; b < 24; b++) {
      if ((st.dr & (1 << b)) !== 0) continue
      if ((st.lc & (1 << b)) !== 0) {
        lp++
        continue
      }
      const nxt: CuspSt = { dr: (1 << b) | (st.dr & ADJ_MASK[b]!), lc: st.lc & ADJ_MASK[b]! }
      const k = canonC(nxt)
      let v = cMap.get(k)
      if (v === undefined) {
        v = cStates.length
        cMap.set(k, v)
        cStates.push(nxt)
      }
      row.set(v, (row.get(v) ?? 0) + 1)
    }
    cTrans.push(row)
    cLoops.push(lp)
  }
  const nc = cStates.length
  const kOfC = cStates.map(s => popcount(s.dr))
  const D_MAX = 48
  const cCounts: bigint[][] = [Array.from({ length: nc }, (_, i) => (i === 0 ? 1n : 0n))]
  for (let d = 1; d <= D_MAX; d++) {
    const prev = cCounts[d - 1]!
    const cur = new Array<bigint>(nc).fill(0n)
    for (let u = 0; u < nc; u++) {
      if (prev[u] === 0n) continue
      for (const [v, m] of cTrans[u]!) cur[v] = cur[v]! + prev[u]! * BigInt(m)
    }
    for (let v = 1; v < nc; v++) {
      const kv = BigInt(kOfC[v]!)
      assertExact(cur[v]! % kv === 0n, `Cusp auto integrality fail d=${d} v=${v}`)
      cur[v] = cur[v]! / kv
    }
    cCounts.push(cur)
  }
  const nodes: { d: number; u: number }[] = []
  const nodeIdx = new Map<string, number>()
  for (let d = 0; d <= D_MAX; d++) {
    for (let u = 0; u < nc; u++) {
      if (cCounts[d]![u]! > 0n) {
        nodeIdx.set(`${d},${u}`, nodes.length)
        nodes.push({ d, u })
      }
    }
  }
  const mN = nodes.length
  const cEdges: [number, number, number][] = []
  const SCALE = 10n ** 12n
  for (let i = 0; i < mN; i++) {
    const nd = nodes[i]!
    if (cLoops[nd.u]! > 0) cEdges.push([i, i, cLoops[nd.u]!])
    if (nd.d < D_MAX) {
      const cu = cCounts[nd.d]![nd.u]!
      for (const [v, mult] of cTrans[nd.u]!) {
        const j = nodeIdx.get(`${nd.d + 1},${v}`)
        if (j === undefined) continue
        const cv = cCounts[nd.d + 1]![v]!
        const val = mult * Math.sqrt(Number((cu * SCALE) / cv) / 1e12)
        cEdges.push([i, j, val])
        cEdges.push([j, i, val])
      }
    }
  }
  let x = new Float64Array(mN).fill(1 / Math.sqrt(mN))
  for (let it = 0; it < 500; it++) {
    const y = new Float64Array(mN)
    for (const [i, j, val] of cEdges) y[i] = y[i]! + val * x[j]!
    let n2 = 0
    for (let i = 0; i < mN; i++) n2 += y[i]! * y[i]!
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < mN; i++) x[i] = y[i]! * inv
  }

  // Exact BigInt Rayleigh-Ritz evaluation on the finite D=0..48 cusp (D_R, L_comm) coset strata:
  let refHalfC = 0
  for (let i = 0; i < mN; i++) {
    const nd = nodes[i]!
    const N = cCounts[nd.d]![nd.u]!
    const h = Math.floor(N.toString(2).length / 2)
    if (h > refHalfC) refHalfC = h
  }
  const cXInt = new Array<bigint>(mN)
  for (let i = 0; i < mN; i++) {
    const nd = nodes[i]!
    const N = cCounts[nd.d]![nd.u]!
    const bits = N.toString(2).length
    const half = Math.floor(bits / 2)
    const s = 2 * half - 50
    const mant = s >= 0 ? Number(N >> BigInt(s)) / 2 ** 50 : Number(N) / 2 ** (2 * half)
    const q = BigInt(Math.round((x[i]! / Math.sqrt(mant)) * 1e12))
    cXInt[i] = q << BigInt(refHalfC - half)
  }
  let cuspAutoNum = 0n
  let cuspAutoDen = 0n
  for (let i = 0; i < mN; i++) {
    const nd = nodes[i]!
    const cu = cCounts[nd.d]![nd.u]!
    const xi = cXInt[i]!
    const cuXi2 = cu * xi * xi
    cuspAutoDen += cuXi2
    if (cLoops[nd.u]! > 0) cuspAutoNum += cuXi2 * BigInt(cLoops[nd.u]!)
    if (nd.d < D_MAX) {
      let inner = 0n
      for (const [v, mult] of cTrans[nd.u]!) {
        const j = nodeIdx.get(`${nd.d + 1},${v}`)
        if (j !== undefined) inner += BigInt(mult) * cXInt[j]!
      }
      cuspAutoNum += 2n * cu * xi * inner
    }
  }
  assertExact(cuspAutoDen > 0n && cuspAutoNum > 0n, 'Cusp auto BigInt RR positive')
  console.log(
    `  Cusp (D_R, L_comm) automaton (${nc} states, D=0..${D_MAX}, ${mN} strata): EXACT BigInt rho >= ${ratFloorDec(cuspAutoNum, cuspAutoDen, 6)} (8-dec: ${ratFloorDec(cuspAutoNum, cuspAutoDen, 8)})`,
  )

  const f3 = rhoByFRat[3]!
  const f4 = rhoByFRat[4]!
  recordCheck(
    'P5',
    'Exact BigInt amenable cusp W_L\\W Bloch k=0 Dirichlet F=0..4 (116,681 docks) & (D_R,L_comm) automaton',
    cuspShellsOk &&
      asymErr === 0 &&
      f3.num * 1000000n >= 10125183n * f3.den &&
      f4.num * 1000000n >= 10459739n * f4.den &&
      cuspAutoNum * 1000000n >= 11073445n * cuspAutoDen,
    `N_0..4=[${shellCounts.join(',')}], symErr=0, F=3:>=${ratFloorDec(f3.num, f3.den, 6)}, F=4:>=${ratFloorDec(f4.num, f4.den, 6)}, auto(D=48):>=${ratFloorDec(cuspAutoNum, cuspAutoDen, 6)}`,
  )

  return {
    cuspF3Num: f3.num,
    cuspF3Den: f3.den,
    cuspF4Num: f4.num,
    cuspF4Den: f4.den,
    cuspAutoNum,
    cuspAutoDen,
  }
}

// =================================================================================================
// MAIN RUNNER
// =================================================================================================

function main(): void {
  const t0 = performance.now()
  const p1 = runPart1Busemann()
  const p2 = runPart2Depth1Certificate()
  const p34 = runParts3And4Hierarchy()
  const p5 = runPart5CuspBloch()

  const elapsedSec = (performance.now() - t0) / 1000
  const oldWidth = 104 / 7 - 11.013439
  const finLo = ratFloorDec(p34.d4FinNum, p34.d4FinDen, 6)
  const asympLo = floatFloorDec(p34.d4LowerAsymp, 6)
  const upHi = ratCeilDec(p34.d4UpperNum, p34.d4UpperDen, 6)
  const newFinWidth = Number(upHi) - Number(finLo)
  const newAsympWidth = Number(upHi) - Number(asympLo)

  const rho24FinLo = ratFloorDec(p34.d4FinNum, 24n * p34.d4FinDen, 6)
  const rho24AsympLo = floatFloorDec(p34.d4LowerAsymp / 24, 6)
  const rho24UpHi = ratCeilDec(p34.d4UpperNum, 24n * p34.d4UpperDen, 6)

  const gapLo = ratFloorDec(24n * p34.d4UpperDen - p34.d4UpperNum, 24n * p34.d4UpperDen, 6)
  const gapFinHi = ratCeilDec(24n * p34.d4FinDen - p34.d4FinNum, 24n * p34.d4FinDen, 6)
  const gapAsympHi = floatCeilDec(1 - p34.d4LowerAsymp / 24, 6)

  const rawGapLo = ratFloorDec(24n * p34.d4UpperDen - p34.d4UpperNum, p34.d4UpperDen, 6)
  const rawGapFinHi = ratCeilDec(24n * p34.d4FinDen - p34.d4FinNum, p34.d4FinDen, 6)
  const rawGapAsympHi = floatCeilDec(24 - p34.d4LowerAsymp, 6)

  console.log('\n================================================================================')
  console.log('BREAKTHROUGH SUITE (W1): FINAL OUTWARD-ROUNDED CERTIFIED SPECTRAL RADIUS SUMMARY')
  console.log('================================================================================')
  console.log(`  OLD certified bracket  : [11.013439, 14.857143]  (width = ${oldWidth.toFixed(6)}, rho/24 in [0.458893, 0.619048])`)
  console.log(`  NEW concrete (BigInt)  : [${finLo}, ${upHi}]  (width <= ${newFinWidth.toFixed(6)}, ${(oldWidth / newFinWidth).toFixed(1)}x tighter!)`)
  console.log(`  NEW asymptotic bracket : [${asympLo}, ${upHi}]  (width <= ${newAsympWidth.toFixed(6)}, ${(oldWidth / newAsympWidth).toFixed(1)}x tighter!)`)
  console.log(`  NEW rho/24 (BigInt)    : [${rho24FinLo}, ${rho24UpHi}] | asymp: [${rho24AsympLo}, ${rho24UpHi}] (< 1/2!)`)
  console.log(`  NEW lambda_gap         : concrete [${gapLo}, ${gapFinHi}] | asymp: [${gapLo}, ${gapAsympHi}] (> 1/2!)`)
  console.log(`  NEW raw gap (24 - rho) : concrete [${rawGapLo}, ${rawGapFinHi}] | asymp: [${rawGapLo}, ${rawGapAsympHi}]`)
  console.log(`  Lean-4 3-rat cert      : a=(1/7, 1/3, 4/7) => rho <= ${p2.simpleUpperNum}/${p2.simpleUpperDen} <= ${ratCeilDec(p2.simpleUpperNum, p2.simpleUpperDen, 6)} (< 12, rho/24 <= ${ratCeilDec(335n, 672n, 6)} < 1/2)`)
  console.log(`  Cusp BigInt lowers     : F=3 >= ${ratFloorDec(p5.cuspF3Num, p5.cuspF3Den, 6)} | F=4 >= ${ratFloorDec(p5.cuspF4Num, p5.cuspF4Den, 6)} | auto(D=48) >= ${ratFloorDec(p5.cuspAutoNum, p5.cuspAutoDen, 6)}`)
  console.log(`  Busemann grid estimate : grid18 sup Q >= ${p1.modBest.toFixed(6)} for m=1+(5/2)I_6 (numerical lower est on sup Q; NOT a rigorous upper bound)`)
  console.log('--------------------------------------------------------------------------------')
  let allPassed = true
  for (const c of CHECKS) {
    if (!c.passed) allPassed = false
    console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.part.padEnd(3)} | ${c.name}`)
    console.log(`         ${c.detail}`)
  }
  console.log('================================================================================')
  console.log(`OVERALL: ${CHECKS.filter(c => c.passed).length}/${CHECKS.length} CHECKS PASSED (runtime: ${elapsedSec.toFixed(3)} s)`)
  if (!allPassed) process.exit(1)
}

main()

export {}
