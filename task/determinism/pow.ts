// A correctly rounded pow, in BigInt, as a MEASURING INSTRUMENT. No experiment imports it.
//
// What it is for. V8 13.6 does not run Math.pow or the ** operator through fdlibm. Behind --use-std-math-pow (on by
// default, `node --v8-options`) it calls the platform C library's pow: Apple's libm on darwin-arm64, glibc on linux
// x86-64. Neither can be restated the way task/determinism/fdlibm.ts restates fdlibm. What can be stated is the exact
// answer: powOracle(x, y) returns the correctly rounded x^y and its MARGIN, the distance from the exact value to the
// nearest rounding midpoint, in units in the last place of the result (0 to 0.5).
//
// The argument it supports. glibc's pow (sysdeps/ieee754/dbl-64/e_pow.c, from Arm's optimized-routines) documents a
// worst-case error of 0.54 ULP. A result within 0.54 ULP of the exact value can be the wrong neighbor only when the
// exact value lies within 0.04 ULP of a midpoint. So where this Mac's pow equals the correctly rounded value AND the
// margin exceeds MARGIN (0.05, a little wider than the bound needs), glibc returns the same double, and that call is
// platform-free. An exact result (a representable x^y) is platform-free under any faithful pow. Every other call is
// undetermined from this machine, and is counted as such.
//
// How it is verified: task/determinism/verify.ts compares this Mac's Math.pow with powOracle on 200,000 inputs.
//
//   import { powOracle } from '@/task/determinism/pow'

export const MARGIN = 0.05

export type PowAnswer = {
  value: number
  // the exact x^y is this double
  exact: boolean
  // distance from the exact x^y to the nearest rounding midpoint, in ULP of value (0.5 when exact)
  margin: number
  // a case C99 Annex F fixes exactly (zero, infinity, NaN, x = 1, y = 0), the same in every conforming libm
  special: boolean
}

const P = 200
const ONE = 1n << BigInt(P)

const dv = new DataView(new ArrayBuffer(8))

// x = m * 2^e with m a 53-bit odd-or-even integer, x finite and nonzero, positive
function decompose(x: number): [bigint, number] {
  dv.setFloat64(0, x)
  const u = dv.getBigUint64(0)
  const exponent = Number((u >> 52n) & 0x7ffn)
  const fraction = u & ((1n << 52n) - 1n)
  const m = exponent === 0 ? fraction : fraction | (1n << 52n)
  return [m, (exponent === 0 ? 1 : exponent) - 1075]
}

const bitLength = (a: bigint): number => (a === 0n ? 0 : a.toString(2).length)

// a positive value known as (m + tail) * 2^e, tail in [0, 1) unknown beyond `sticky` (true when the value is not
// exactly m * 2^e): the correctly rounded double, whether it is exact, and the margin to the nearest midpoint
function round(m: bigint, e: number, sticky: boolean): { value: number; exact: boolean; margin: number } {
  const bits = bitLength(m)
  let shift = bits - 53
  if (e + shift < -1074) {
    shift = -1074 - e
  }
  if (shift <= 0) {
    // m * 2^e is itself representable: only an exact value has no tail
    const value = scale(m, e)
    return { value, exact: !sticky, margin: sticky ? 0.5 : 0.5 }
  }
  const s = BigInt(shift)
  let q = m >> s
  const rest = m & ((1n << s) - 1n)
  // the fraction of an ulp that was cut, to 52 bits
  const fraction = shift > 60 ? Number(rest >> BigInt(shift - 60)) / 2 ** 60 : Number(rest) / 2 ** shift
  const exact = rest === 0n && !sticky
  const half = 1n << (s - 1n)
  if (rest > half || (rest === half && (sticky || (q & 1n) === 1n))) {
    q += 1n
  }
  const margin = exact ? 0.5 : Math.abs(fraction - 0.5)
  return { value: scale(q, e + shift), exact, margin }
}

function scale(m: bigint, e: number): number {
  if (bitLength(m) + e > 1024) {
    return Infinity
  }
  return e >= -1022 ? Number(m) * 2 ** e : Number(m) * 2 ** (e + 600) * 2 ** -600
}

// ---- fixed point at 2^-P ----

// a * b at 2^-P, truncated toward zero (a floor would leave a negative series stuck at -1 forever)
function mul(a: bigint, b: bigint): bigint {
  const p = a * b
  return p >= 0n ? p >> BigInt(P) : -(-p >> BigInt(P))
}

// 2 atanh(s) = ln((1 + s) / (1 - s)), |s| small
function atanh2(s: bigint): bigint {
  const s2 = mul(s, s)
  let term = s
  let sum = 0n
  for (let k = 1n; term !== 0n; k += 2n) {
    sum += term / k
    term = mul(term, s2)
  }
  return 2n * sum
}

// ln of a fixed-point m in [1, 2)
const LN2 = atanh2(ONE / 3n)
const TABLE = 64
const lnTable: bigint[] = []
for (let j = 0; j <= TABLE; j++) {
  const c = ONE + (ONE * BigInt(j)) / BigInt(TABLE)
  lnTable.push(atanh2(((c - ONE) << BigInt(P)) / (c + ONE)))
}

function lnFixed(m: bigint): bigint {
  const j = Number(((m - ONE) * BigInt(TABLE) + ONE / 2n) >> BigInt(P))
  const c = ONE + (ONE * BigInt(j)) / BigInt(TABLE)
  return lnTable[j]! + atanh2(((m - c) << BigInt(P)) / (m + c))
}

// e^r for a fixed-point |r| <= ln 2 / 2
function expFixed(r: bigint): bigint {
  let term = ONE
  let sum = ONE
  for (let k = 1n; term !== 0n; k++) {
    term = mul(term, r) / k
    sum += term
  }
  return sum
}

// ---- the oracle ----

export function powOracle(x: number, y: number): PowAnswer {
  const special = specialCase(x, y)
  if (special !== undefined) {
    return { value: special, exact: true, margin: 0.5, special: true }
  }
  const negative = x < 0 && isOddInteger(y)
  const ax = Math.abs(x)
  const [m, e] = decompose(ax)
  let out: { value: number; exact: boolean; margin: number }
  if (Number.isInteger(y) && Math.abs(y) <= 64) {
    out = integerPower(m, e, y)
  } else {
    out = generalPower(m, e, y)
  }
  return { value: negative ? -out.value : out.value, exact: out.exact, margin: out.margin, special: false }
}

function isOddInteger(y: number): boolean {
  return Number.isInteger(y) && Math.abs(y) < 2 ** 53 && Math.abs(y % 2) === 1
}

// C99 Annex F, plus V8's two exceptions (NaN for y NaN, NaN for |x| = 1 with y infinite)
function specialCase(x: number, y: number): number | undefined {
  if (Number.isNaN(y)) {
    return NaN
  }
  if (y === 0) {
    return 1
  }
  if (Number.isNaN(x)) {
    return NaN
  }
  if (!Number.isFinite(y)) {
    const ax = Math.abs(x)
    if (ax === 1) {
      return NaN
    }
    return (ax > 1) === y > 0 ? Infinity : 0
  }
  if (x === 1) {
    return 1
  }
  if (x === 0 || !Number.isFinite(x)) {
    // the size is 0 or infinity, and the sign is x's for an odd integer y, else positive
    const big = x === 0 ? y < 0 : y > 0
    const magnitude = big ? Infinity : 0
    const negative = isOddInteger(y) && (Object.is(x, -0) || x === -Infinity)
    return negative ? -magnitude : magnitude
  }
  if (x < 0 && !Number.isInteger(y)) {
    return NaN
  }
  if (y === 1) {
    return x
  }
  return undefined
}

// |x|^n exactly, n a nonzero integer, |n| <= 64
function integerPower(m: bigint, e: number, n: number): { value: number; exact: boolean; margin: number } {
  const k = Math.abs(n)
  const mk = m ** BigInt(k)
  if (n > 0) {
    return round(mk, e * k, false)
  }
  // 2^(-e k) / m^k: a quotient with 64 bits past the 53 the result keeps
  const shift = bitLength(mk) + 120
  const q = (1n << BigInt(shift)) / mk
  const sticky = (1n << BigInt(shift)) % mk !== 0n
  return round(q, -shift - e * k, sticky)
}

// |x|^y through exp(y ln |x|) at 200 bits
function generalPower(m: bigint, e: number, y: number): { value: number; exact: boolean; margin: number } {
  // |x| = (m / 2^(b - 1)) * 2^(e + b - 1), the first factor in [1, 2)
  const b = bitLength(m)
  const mantissa = (m << BigInt(P)) >> BigInt(b - 1)
  const exponent = e + b - 1
  const lnx = lnFixed(mantissa) + BigInt(exponent) * LN2
  // y = ym * 2^ye exactly
  const [ym, ye] = decompose(Math.abs(y))
  let L = ye >= 0 ? (lnx * ym) << BigInt(ye) : (lnx * ym) >> BigInt(-ye)
  if (y < 0) {
    L = -L
  }
  // overflow and underflow, well clear of the boundary
  const lnMax = 710n * ONE
  if (L > lnMax) {
    return { value: Infinity, exact: false, margin: 0.5 }
  }
  if (L < -746n * ONE) {
    return { value: 0, exact: false, margin: 0.5 }
  }
  // L = n ln 2 + r
  const n = (L + (L >= 0n ? LN2 / 2n : -LN2 / 2n)) / LN2
  const r = L - n * LN2
  const er = expFixed(r)
  // a power of y that lands exactly on a double (a square root of a perfect square, say) reads here as a value within
  // 2^-190 of it, and is reported as inexact with a margin near 0.5, which classifies it correctly as platform-free
  return round(er, Number(n) - P, true)
}
