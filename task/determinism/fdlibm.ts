// V8's fdlibm (src/base/ieee754.cc), restated in JavaScript, as a MEASURING INSTRUMENT. No experiment imports it.
//
// What it is. Node's Math.sin, cos, tan, asin, acos, atan, atan2, exp, expm1, log, log1p, log2, log10, cbrt, sinh,
// cosh, tanh, asinh, acosh and atanh are V8's C++ port of fdlibm. That C++ is compiled per platform. clang's default
// -ffp-contract=on fuses every `a * b + c` a single source expression writes into one fused multiply-add, and the
// darwin-arm64 node is built that way (a disassembly of node 24.13 shows 13 fused multiply-adds in ieee754::atan, 38 in
// sin, 40 in cos). The x86-64 node targets the baseline ISA, which has no fused multiply-add, so the same source rounds
// twice there. The two builds therefore disagree in the last bit on a fraction of inputs.
//
// This file states every one of those functions twice, chosen by setFused():
//
//   PLAIN  every a * b + c rounded twice: what the x86-64 build computes, and what any JavaScript port computes
//   FUSED  every a * b + c that a single C expression writes, contracted the way clang contracts it (the left operand
//          if it is a product, else the right one) and computed exactly in BigInt: what the arm64 build computes
//
// How it was verified (task/determinism/verify.ts, 200,000 inputs per function, node 24.13.1 on darwin-arm64): the
// FUSED form equals this Mac's Math bit for bit on every input, for every function restated here. The PLAIN form
// reproduces, through the parity replay, the exact values node 24.21 printed on an x86-64 droplet (E-SPN-0178 and
// E-SPN-0179, see note/research/vibe/kernel.md). The restatement is that evidence, not a replacement for Math: nothing
// in code/ or test/ uses it.
//
// Not restated: Math.pow and the ** operator. V8 13.6 runs them through the platform's C library (std::pow, behind
// --use-std-math-pow, on by default), not through fdlibm. task/determinism/pow.ts measures that one instead. Also not
// restated: sin, cos and tan for |x| >= 2^19 pi/2 (fdlibm's __kernel_rem_pio2), which throw RangeError here.
//
//   import { setFused, sin } from '@/task/determinism/fdlibm'

let FUSED = false

export function setFused(fused: boolean): void {
  FUSED = fused
}

// ---- words of a double (every target here is little-endian) ----

const f64 = new Float64Array(1)
const u32 = new Int32Array(f64.buffer)

function high(x: number): number {
  f64[0] = x

  return u32[1]!
}

function low(x: number): number {
  f64[0] = x

  return u32[0]!
}

function fromWords(hi: number, lo: number): number {
  u32[1] = hi
  u32[0] = lo

  return f64[0]!
}

function withLow(x: number, lo: number): number {
  f64[0] = x
  u32[0] = lo

  return f64[0]
}

function withHigh(x: number, hi: number): number {
  f64[0] = x
  u32[1] = hi

  return f64[0]
}

// ---- an exact fused multiply-add, in BigInt ----

const dv = new DataView(new ArrayBuffer(8))

function split(x: number): [bigint, number] {
  dv.setFloat64(0, x)

  const u = dv.getBigUint64(0)
  const negative = u >> 63n === 1n
  const exponent = Number((u >> 52n) & 0x7ffn)
  const fraction = u & ((1n << 52n) - 1n)
  const mantissa = exponent === 0 ? fraction : fraction | (1n << 52n)

  return [negative ? -mantissa : mantissa, (exponent === 0 ? 1 : exponent) - 1075]
}

// m * 2^e, rounded to nearest even, subnormals and overflow included
export function roundBig(m: bigint, e: number): number {
  if (m === 0n) {
    return 0
  }

  const negative = m < 0n

  let a = negative ? -m : m

  const bits = a.toString(2).length

  let shift = bits - 53

  if (e + shift < -1074) {
    shift = -1074 - e
  }

  if (shift > 0) {
    const s = BigInt(shift)

    let q = a >> s

    const rest = a & ((1n << s) - 1n)
    const half = 1n << (s - 1n)

    if (rest > half || (rest === half && (q & 1n) === 1n)) {
      q += 1n
    }

    a = q
    e += shift
  }

  if (a.toString(2).length + e > 1024) {
    return negative ? -Infinity : Infinity
  }

  const out = e >= -1022 ? Number(a) * 2 ** e : Number(a) * 2 ** (e + 600) * 2 ** -600

  return negative ? -out : out
}

export function fmaExact(a: number, b: number, c: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
    return a * b + c
  }

  const [ma, ea] = split(a)
  const [mb, eb] = split(b)
  const [mc, ec] = split(c)
  const ep = ea + eb
  const e = Math.min(ep, ec)
  const sum = ((ma * mb) << BigInt(ep - e)) + (mc << BigInt(ec - e))

  if (sum === 0n) {
    // the sign of an exact zero sum follows IEEE: a * b + c with both terms zero or cancelling
    return a * b + c
  }

  return roundBig(sum, e)
}

// a * b + c, fused or not
function F(a: number, b: number, c: number): number {
  return FUSED ? fmaExact(a, b, c) : a * b + c
}

// ---- atan, atan2 ----

const atanhi = [4.63647609000806093515e-1, 7.85398163397448278999e-1, 9.82793723247329054082e-1, 1.5707963267948965580e0]
const atanlo = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17]
const aT = [
  3.33333333333329318027e-1, -1.99999999998764832476e-1, 1.42857142725034663711e-1, -1.1111110405462355788e-1,
  9.09088713343650656196e-2, -7.69187620504482999495e-2, 6.66107313738753120669e-2, -5.83357013379057348645e-2,
  4.97687799461593236017e-2, -3.6531572744216915527e-2, 1.62858201153657823623e-2,
]

export function atan(x: number): number {
  const hx = high(x)
  const ix = hx & 0x7fffffff

  let id: number

  if (ix >= 0x44100000) {
    if (ix > 0x7ff00000 || (ix === 0x7ff00000 && low(x) !== 0)) {
      return x + x
    }

    return hx > 0 ? atanhi[3]! + atanlo[3]! : -atanhi[3]! - atanlo[3]!
  }

  if (ix < 0x3fdc0000) {
    if (ix < 0x3e400000) {
      return x
    }

    id = -1
  } else {
    x = Math.abs(x)

    if (ix < 0x3ff30000) {
      if (ix < 0x3fe60000) {
        id = 0
        x = F(2.0, x, -1) / (2.0 + x)
      } else {
        id = 1
        x = (x - 1) / (x + 1)
      }
    } else if (ix < 0x40038000) {
      id = 2
      x = (x - 1.5) / F(1.5, x, 1)
    } else {
      id = 3
      x = -1.0 / x
    }
  }

  const z = x * x
  const w = z * z
  const s1 = z * F(w, F(w, F(w, F(w, F(w, aT[10]!, aT[8]!), aT[6]!), aT[4]!), aT[2]!), aT[0]!)
  const s2 = w * F(w, F(w, F(w, F(w, aT[9]!, aT[7]!), aT[5]!), aT[3]!), aT[1]!)

  if (id < 0) {
    return F(-x, s1 + s2, x)
  }

  const r = atanhi[id]! - (F(x, s1 + s2, -atanlo[id]!) - x)

  return hx < 0 ? -r : r
}

const pi_o_4 = 7.8539816339744827900e-1
const pi_o_2 = 1.570796326794896558e0
const pi = 3.141592653589793116e0
const pi_lo = 1.2246467991473532e-16

export function atan2(y: number, x: number): number {
  if (Number.isNaN(x) || Number.isNaN(y)) {
    return x + y
  }

  const hx = high(x)
  const hy = high(y)
  const ix = hx & 0x7fffffff
  const iy = hy & 0x7fffffff

  if (x === 1) {
    return atan(y)
  }

  let m = ((hy >> 31) & 1) | ((hx >> 30) & 2)

  if (y === 0) {
    return m <= 1 ? y : m === 2 ? pi : -pi
  }

  if (x === 0) {
    return hy < 0 ? -pi_o_2 : pi_o_2
  }

  if (ix === 0x7ff00000) {
    if (iy === 0x7ff00000) {
      return [pi_o_4, -pi_o_4, 3.0 * pi_o_4, -3.0 * pi_o_4][m]!
    }

    return [0, -0, pi, -pi][m]!
  }

  if (iy === 0x7ff00000) {
    return hy < 0 ? -pi_o_2 : pi_o_2
  }

  const k = (iy - ix) >> 20

  let z: number

  if (k > 60) {
    z = pi_o_2 + 0.5 * pi_lo
    m &= 1
  } else if (hx < 0 && k < -60) {
    z = 0
  } else {
    z = atan(Math.abs(y / x))
  }

  switch (m) {
    case 0:
      return z
    case 1:
      return -z
    case 2:
      return pi - (z - pi_lo)
    default:
      return z - pi_lo - pi
  }
}

// ---- exp ----

const ln2HI = [6.9314718036912381649e-1, -6.9314718036912381649e-1]
const ln2LO = [1.90821492927058770002e-10, -1.90821492927058770002e-10]
const invln2 = 1.442695040888963387e0
const P1 = 1.66666666666666019037e-1
const P2 = -2.77777777770155933842e-3
const P3 = 6.61375632143793436117e-5
const P4 = -1.6533902205465251539e-6
const P5 = 4.13813679705723846039e-8
const o_threshold = 7.09782712893383973096e2
const u_threshold = -7.4513321910194110842e2
const twom1000 = 9.3326361850321887899e-302
const two1023 = 8.988465674311579539e307

export function exp(x: number): number {
  let hx = high(x)

  const xsb = (hx >>> 31) & 1

  hx &= 0x7fffffff

  let hi = 0
  let lo = 0
  let k = 0

  if (hx >= 0x40862e42) {
    if (hx >= 0x7ff00000) {
      if (((hx & 0xfffff) | low(x)) !== 0) {
        return x + x
      }

      return xsb === 0 ? x : 0
    }

    if (x > o_threshold) {
      return Infinity
    }

    if (x < u_threshold) {
      return 0
    }
  }

  if (hx > 0x3fd62e42) {
    if (hx < 0x3ff0a2b2) {
      if (x === 1) {
        return 2.718281828459045
      }

      hi = x - ln2HI[xsb]!
      lo = ln2LO[xsb]!
      k = 1 - xsb - xsb
    } else {
      k = Math.trunc(F(invln2, x, xsb ? -0.5 : 0.5))

      const t = k

      hi = F(-t, ln2HI[0]!, x)
      lo = t * ln2LO[0]!
    }

    x = hi - lo
  } else if (hx < 0x3e300000) {
    return 1 + x
  } else {
    k = 0
  }

  const t = x * x
  const twopk = k >= -1021 ? fromWords(0x3ff00000 + (k << 20), 0) : fromWords(0x3ff00000 + ((k + 1000) << 20), 0)
  const c = F(-t, F(t, F(t, F(t, F(t, P5, P4), P3), P2), P1), x)

  if (k === 0) {
    return 1 - ((x * c) / (c - 2.0) - x)
  }

  const y = 1 - (lo - (x * c) / (2.0 - c) - hi)

  if (k >= -1021) {
    return k === 1024 ? y * 2.0 * two1023 : y * twopk
  }

  return y * twopk * twom1000
}

// ---- expm1 ----

const Q1 = -3.33333333333331316428e-2
const Q2 = 1.58730158725481460165e-3
const Q3 = -7.93650757867487942473e-5
const Q4 = 4.00821782732936239552e-6
const Q5 = -2.01099218183624371326e-7
const ln2_hi = 6.9314718036912381649e-1
const ln2_lo = 1.90821492927058770002e-10

export function expm1(x: number): number {
  let hx = high(x)

  const xsb = hx & 0x80000000

  hx &= 0x7fffffff

  let hi: number
  let lo: number
  let c = 0
  let k: number

  if (hx >= 0x4043687a) {
    if (hx >= 0x40862e42) {
      if (hx >= 0x7ff00000) {
        if (((hx & 0xfffff) | low(x)) !== 0) {
          return x + x
        }

        return xsb === 0 ? x : -1.0
      }

      if (x > o_threshold) {
        return Infinity
      }
    }

    if (xsb !== 0) {
      return -1
    }
  }

  if (hx > 0x3fd62e42) {
    if (hx < 0x3ff0a2b2) {
      if (xsb === 0) {
        hi = x - ln2_hi
        lo = ln2_lo
        k = 1
      } else {
        hi = x + ln2_hi
        lo = -ln2_lo
        k = -1
      }
    } else {
      k = Math.trunc(F(invln2, x, xsb === 0 ? 0.5 : -0.5))

      const t = k

      hi = F(-t, ln2_hi, x)
      lo = t * ln2_lo
    }

    x = hi - lo
    c = hi - x - lo
  } else if (hx < 0x3c900000) {
    return x
  } else {
    k = 0
  }

  const hfx = 0.5 * x
  const hxs = x * hfx
  const r1 = F(hxs, F(hxs, F(hxs, F(hxs, F(hxs, Q5, Q4), Q3), Q2), Q1), 1)

  let t = F(-r1, hfx, 3.0)
  let e = hxs * ((r1 - t) / F(-x, t, 6.0))

  if (k === 0) {
    return x - F(x, e, -hxs)
  }

  const twopk = fromWords(0x3ff00000 + (k << 20), 0)

  e = F(x, e - c, -c)
  e -= hxs

  if (k === -1) {
    return F(0.5, x - e, -0.5)
  }

  if (k === 1) {
    if (x < -0.25) {
      return -2.0 * (e - (x + 0.5))
    }

    return F(2.0, x - e, 1)
  }

  let y: number

  if (k <= -2 || k > 56) {
    y = 1 - (e - x)
    y = k === 1024 ? y * 2.0 * 8.98846567431158e307 : y * twopk

    return y - 1
  }

  if (k < 20) {
    t = fromWords(0x3ff00000 - (0x200000 >> k), 0)
    y = t - (e - x)
    y = y * twopk
  } else {
    t = fromWords((0x3ff - k) << 20, 0)
    y = x - (e + t)
    y += 1
    y = y * twopk
  }

  return y
}

// ---- log, log1p, log2, log10 ----

const Lg1 = 6.666666666666735130e-1
const Lg2 = 3.999999999940941908e-1
const Lg3 = 2.857142874366239149e-1
const Lg4 = 2.222219843214978396e-1
const Lg5 = 1.818357216161805012e-1
const Lg6 = 1.531383769920937332e-1
const Lg7 = 1.479819860511658591e-1
const two54 = 1.8014398509481984e16

export function log(x: number): number {
  let hx = high(x)

  const lx = low(x)

  let k = 0

  if (hx < 0x00100000) {
    if (((hx & 0x7fffffff) | lx) === 0) {
      return -Infinity
    }

    if (hx < 0) {
      return NaN
    }

    k -= 54
    x *= two54
    hx = high(x)
  }

  if (hx >= 0x7ff00000) {
    return x + x
  }

  k += (hx >> 20) - 1023
  hx &= 0x000fffff

  const i0 = (hx + 0x95f64) & 0x100000

  x = fromWords(hx | (i0 ^ 0x3ff00000), low(x))
  k += i0 >> 20

  const f = x - 1.0
  const dk = k

  if ((0x000fffff & (2 + hx)) < 3) {
    if (f === 0) {
      return k === 0 ? 0 : F(dk, ln2_hi, dk * ln2_lo)
    }

    const R = f * f * F(-0.3333333333333333, f, 0.5)

    return k === 0 ? f - R : F(dk, ln2_hi, -(R - dk * ln2_lo - f))
  }

  const s = f / (2.0 + f)
  const z = s * s

  let i = hx - 0x6147a

  const w = z * z
  const j = 0x6b851 - hx
  const t1 = w * F(w, F(w, Lg6, Lg4), Lg2)
  const t2 = z * F(w, F(w, F(w, Lg7, Lg5), Lg3), Lg1)

  i |= j

  const R = t2 + t1

  if (i > 0) {
    const hfsq = 0.5 * f * f

    if (k === 0) {
      return f - F(-s, hfsq + R, hfsq)
    }

    return F(dk, ln2_hi, -(hfsq - F(s, hfsq + R, dk * ln2_lo) - f))
  }

  if (k === 0) {
    return F(-s, f - R, f)
  }

  return F(dk, ln2_hi, -(F(s, f - R, -(dk * ln2_lo)) - f))
}

export function log1p(x: number): number {
  const hx = high(x)
  const ax = hx & 0x7fffffff

  let k = 1
  let f = 0
  let hu = 0
  let c = 0

  if (hx < 0x3fda827a) {
    if (ax >= 0x3ff00000) {
      return x === -1 ? -Infinity : NaN
    }

    if (ax < 0x3e200000) {
      if (ax < 0x3c900000) {
        return x
      }

      return F(-(x * x), 0.5, x)
    }

    if (hx > 0 || hx <= (0xbfd2bec4 | 0)) {
      k = 0
      f = x
      hu = 1
    }
  }

  if (hx >= 0x7ff00000) {
    return x + x
  }

  if (k !== 0) {
    let u: number

    if (hx < 0x43400000) {
      u = 1.0 + x
      hu = high(u)
      k = (hu >> 20) - 1023
      c = k > 0 ? 1.0 - (u - x) : x - (u - 1.0)
      c /= u
    } else {
      u = x
      hu = high(u)
      k = (hu >> 20) - 1023
      c = 0
    }

    hu &= 0x000fffff

    if (hu < 0x6a09e) {
      u = withHigh(u, hu | 0x3ff00000)
    } else {
      k += 1
      u = withHigh(u, hu | 0x3fe00000)
      hu = (0x00100000 - hu) >> 2
    }

    f = u - 1.0
  }

  const hfsq = 0.5 * f * f

  if (hu === 0) {
    if (f === 0) {
      if (k === 0) {
        return 0
      }

      c = F(k, ln2_lo, c)

      return F(k, ln2_hi, c)
    }

    const R = hfsq * F(-0.6666666666666666, f, 1.0)

    if (k === 0) {
      return f - R
    }

    return F(k, ln2_hi, -(R - F(k, ln2_lo, c) - f))
  }

  const s = f / (2.0 + f)
  const z = s * s
  const R = z * F(z, F(z, F(z, F(z, F(z, F(z, Lg7, Lg6), Lg5), Lg4), Lg3), Lg2), Lg1)

  if (k === 0) {
    return f - F(-s, hfsq + R, hfsq)
  }

  return F(k, ln2_hi, -(hfsq - F(s, hfsq + R, F(k, ln2_lo, c)) - f))
}

// FreeBSD's k_log1p: log(1 + f) - f + f * f / 2, for f in [sqrt(2) / 2 - 1, sqrt(2) - 1]
function kLog1p(f: number): number {
  const s = f / (2.0 + f)
  const z = s * s
  const w = z * z
  const t1 = w * F(w, F(w, Lg6, Lg4), Lg2)
  const t2 = z * F(w, F(w, F(w, Lg7, Lg5), Lg3), Lg1)
  const R = t2 + t1
  const hfsq = 0.5 * f * f

  return s * (hfsq + R)
}

const ivln2hi = 1.44269504072144627571e0
const ivln2lo = 1.67517131648865118353e-10

export function log2(x: number): number {
  let hx = high(x)

  const lx = low(x)

  let k = 0

  if (hx < 0x00100000) {
    if (((hx & 0x7fffffff) | lx) === 0) {
      return -Infinity
    }

    if (hx < 0) {
      return NaN
    }

    k -= 54
    x *= two54
    hx = high(x)
  }

  if (hx >= 0x7ff00000) {
    return x + x
  }

  if (hx === 0x3ff00000 && lx === 0) {
    return 0
  }

  k += (hx >> 20) - 1023
  hx &= 0x000fffff

  const i = (hx + 0x95f64) & 0x100000

  x = withHigh(x, hx | (i ^ 0x3ff00000))
  k += i >> 20

  const y = k
  const f = x - 1.0
  const hfsq = 0.5 * f * f
  const r = kLog1p(f)
  const hi = withLow(f - hfsq, 0)
  const lo = f - hi - hfsq + r

  let valHi = hi * ivln2hi
  let valLo = F(lo + hi, ivln2lo, lo * ivln2hi)

  const w = y + valHi

  valLo += y - w + valHi
  valHi = w

  return valLo + valHi
}

// V8's log10 is the original fdlibm e_log10.c (ivln10 * log(x)), not FreeBSD's later k_log1p form, which disagreed
// with this Mac's Math.log10 on about 1 input in 10
const ivln10 = 4.34294481903251816668e-1
const log10_2hi = 3.01029995663611771306e-1
const log10_2lo = 3.69423907715893078616e-13

export function log10(x: number): number {
  let hx = high(x)
  let lx = low(x)
  let k = 0

  if (hx < 0x00100000) {
    if (((hx & 0x7fffffff) | lx) === 0) {
      return -Infinity
    }

    if (hx < 0) {
      return NaN
    }

    k -= 54
    x *= two54
    hx = high(x)
    lx = low(x)
  }

  if (hx >= 0x7ff00000) {
    return x + x
  }

  if (hx === 0x3ff00000 && lx === 0) {
    return 0
  }

  k += (hx >> 20) - 1023

  const i = (k & 0x80000000) >>> 31

  hx = (hx & 0x000fffff) | ((0x3ff - i) << 20)

  const y = k + i

  x = fromWords(hx, lx)

  const z = F(y, log10_2lo, ivln10 * log(x))

  return F(y, log10_2hi, z)
}

// ---- sin, cos, tan ----

const S1 = -1.66666666666666324348e-1
const S2 = 8.33333333332248946124e-3
const S3 = -1.98412698298579493134e-4
const S4 = 2.75573137070700676789e-6
const S5 = -2.50507602534068634195e-8
const S6 = 1.58969099521155010221e-10

function kernelSin(x: number, y: number, iy: number): number {
  const ix = high(x) & 0x7fffffff

  if (ix < 0x3e400000 && Math.trunc(x) === 0) {
    return x
  }

  const z = x * x
  const v = z * x
  const r = F(z, F(z, F(z, F(z, S6, S5), S4), S3), S2)

  if (iy === 0) {
    return F(v, F(z, r, S1), x)
  }

  return x - F(-v, S1, F(z, F(0.5, y, -(v * r)), -y))
}

const C1 = 4.16666666666666019037e-2
const C2 = -1.38888888888741095749e-3
const C3 = 2.48015872894767294178e-5
const C4 = -2.75573143513906633035e-7
const C5 = 2.0875723212981748279e-9
const C6 = -1.13596475577881948265e-11

function kernelCos(x: number, y: number): number {
  const ix = high(x) & 0x7fffffff

  if (ix < 0x3e400000 && Math.trunc(x) === 0) {
    return 1
  }

  const z = x * x
  const r = z * F(z, F(z, F(z, F(z, F(z, C6, C5), C4), C3), C2), C1)

  if (ix < 0x3fd33333) {
    return 1 - F(0.5, z, -F(z, r, -(x * y)))
  }

  const qx = ix > 0x3fe90000 ? 0.28125 : fromWords(ix - 0x00200000, 0)
  const iz = F(0.5, z, -qx)
  const a = 1 - qx

  return a - (iz - F(z, r, -(x * y)))
}

const T = [
  3.33333333333334091986e-1, 1.33333333333201242699e-1, 5.39682539762260521377e-2, 2.18694882948595424599e-2,
  8.86323982359930005737e-3, 3.59207910759131235356e-3, 1.45620945432529025516e-3, 5.88041240820264096874e-4,
  2.46463134818469906812e-4, 7.817944429395570923e-5, 7.14072491382608190305e-5, -1.85586374855275456654e-5,
  2.59073051863633712884e-5,
]
const pio4 = 7.85398163397448278999e-1
const pio4lo = 3.06161699786838301793e-17

function kernelTan(x: number, y: number, iy: number): number {
  const hx = high(x)
  const ix = hx & 0x7fffffff

  if (ix < 0x3e300000 && Math.trunc(x) === 0) {
    if ((ix | low(x) | (iy + 1)) === 0) {
      return 1 / Math.abs(x)
    }

    if (iy === 1) {
      return x
    }

    const w0 = x + y
    const z0 = withLow(w0, 0)
    const v0 = y - (z0 - x)
    const a0 = -1 / w0
    const t0 = withLow(a0, 0)
    const s0 = F(t0, z0, 1)

    return F(a0, F(t0, v0, s0), t0)
  }

  if (ix >= 0x3fe59428) {
    if (hx < 0) {
      x = -x
      y = -y
    }

    const z0 = pio4 - x
    const w0 = pio4lo - y

    x = z0 + w0
    y = 0.0
  }

  const z = x * x

  let w = z * z
  let r = F(w, F(w, F(w, F(w, F(w, T[11]!, T[9]!), T[7]!), T[5]!), T[3]!), T[1]!)
  let v = z * F(w, F(w, F(w, F(w, F(w, T[12]!, T[10]!), T[8]!), T[6]!), T[4]!), T[2]!)

  const s = z * x

  r = F(z, F(s, r + v, y), y)
  r = F(T[0]!, s, r)
  w = x + r

  if (ix >= 0x3fe59428) {
    v = iy

    return (1 - ((hx >> 30) & 2)) * (v - 2.0 * (x - ((w * w) / (w + v) - r)))
  }

  if (iy === 1) {
    return w
  }

  const z1 = withLow(w, 0)
  const v1 = r - (z1 - x)
  const a1 = -1.0 / w
  const t1 = withLow(a1, 0)
  const s1 = F(t1, z1, 1.0)

  return F(a1, F(t1, v1, s1), t1)
}

const invpio2 = 6.36619772367581382433e-1
const pio2_1 = 1.57079632673412561417e0
const pio2_1t = 6.07710050650619224932e-11
const pio2_2 = 6.0771005063039659766e-11
const pio2_2t = 2.02226624879595063154e-21
const pio2_3 = 2.0222662487111664558e-21
const pio2_3t = 8.47842766036889956997e-32

// the reduction x = n pi/2 + y0 + y1, returned through these three
let remN = 0
let remY0 = 0
let remY1 = 0

function remPio2(x: number): void {
  const hx = high(x)
  const ix = hx & 0x7fffffff

  if (ix < 0x4002d97c) {
    if (hx > 0) {
      let z = x - pio2_1

      remN = 1

      if (ix !== 0x3ff921fb) {
        remY0 = z - pio2_1t
        remY1 = z - remY0 - pio2_1t

        return
      }

      z -= pio2_2
      remY0 = z - pio2_2t
      remY1 = z - remY0 - pio2_2t

      return
    }

    let z = x + pio2_1

    remN = -1

    if (ix !== 0x3ff921fb) {
      remY0 = z + pio2_1t
      remY1 = z - remY0 + pio2_1t

      return
    }

    z += pio2_2
    remY0 = z + pio2_2t
    remY1 = z - remY0 + pio2_2t

    return
  }

  if (ix > 0x413921fb) {
    throw new RangeError('remPio2: |x| >= 2^19 pi/2 is not restated (fdlibm __kernel_rem_pio2)')
  }

  let t = Math.abs(x)

  const n = Math.trunc(F(t, invpio2, 0.5))
  const fn = n

  let r = F(-fn, pio2_1, t)
  let w = fn * pio2_1t

  const j = ix >> 20

  let y0 = r - w
  let i = j - ((high(y0) >> 20) & 0x7ff)

  if (i > 16) {
    t = r
    w = fn * pio2_2
    r = t - w
    w = F(fn, pio2_2t, -(t - r - w))
    y0 = r - w
    i = j - ((high(y0) >> 20) & 0x7ff)

    if (i > 49) {
      t = r
      w = fn * pio2_3
      r = t - w
      w = F(fn, pio2_3t, -(t - r - w))
      y0 = r - w
    }
  }

  const y1 = r - y0 - w

  if (hx < 0) {
    remN = -n
    remY0 = -y0
    remY1 = -y1
  } else {
    remN = n
    remY0 = y0
    remY1 = y1
  }
}

export function sin(x: number): number {
  const ix = high(x) & 0x7fffffff

  if (ix <= 0x3fe921fb) {
    return kernelSin(x, 0, 0)
  }

  if (ix >= 0x7ff00000) {
    return x - x
  }

  remPio2(x)

  switch (remN & 3) {
    case 0:
      return kernelSin(remY0, remY1, 1)
    case 1:
      return kernelCos(remY0, remY1)
    case 2:
      return -kernelSin(remY0, remY1, 1)
    default:
      return -kernelCos(remY0, remY1)
  }
}

export function cos(x: number): number {
  const ix = high(x) & 0x7fffffff

  if (ix <= 0x3fe921fb) {
    return kernelCos(x, 0)
  }

  if (ix >= 0x7ff00000) {
    return x - x
  }

  remPio2(x)

  switch (remN & 3) {
    case 0:
      return kernelCos(remY0, remY1)
    case 1:
      return -kernelSin(remY0, remY1, 1)
    case 2:
      return -kernelCos(remY0, remY1)
    default:
      return kernelSin(remY0, remY1, 1)
  }
}

export function tan(x: number): number {
  const ix = high(x) & 0x7fffffff

  if (ix <= 0x3fe921fb) {
    return kernelTan(x, 0, 1)
  }

  if (ix >= 0x7ff00000) {
    return x - x
  }

  remPio2(x)

  return kernelTan(remY0, remY1, 1 - ((remN & 1) << 1))
}

// ---- asin, acos ----

const pio2_hi = 1.570796326794896558e0
const pio2_lo = 6.12323399573676603587e-17
const pio4_hi = 7.85398163397448278999e-1
const pS0 = 1.66666666666666657415e-1
const pS1 = -3.25565818622400915405e-1
const pS2 = 2.01212532134862925881e-1
const pS3 = -4.00555345006794114027e-2
const pS4 = 7.91534994289814532176e-4
const pS5 = 3.4793310759602116757e-5
const qS1 = -2.40339491173441421878e0
const qS2 = 2.02094576023350569471e0
const qS3 = -6.8828397160545329303e-1
const qS4 = 7.70381505559019352791e-2

function asinP(t: number): number {
  return t * F(t, F(t, F(t, F(t, F(t, pS5, pS4), pS3), pS2), pS1), pS0)
}

function asinQ(t: number): number {
  return F(t, F(t, F(t, F(t, qS4, qS3), qS2), qS1), 1)
}

export function asin(x: number): number {
  const hx = high(x)
  const ix = hx & 0x7fffffff

  let t = 0

  if (ix >= 0x3ff00000) {
    if (((ix - 0x3ff00000) | low(x)) === 0) {
      return F(x, pio2_hi, x * pio2_lo)
    }

    return NaN
  } else if (ix < 0x3fe00000) {
    if (ix < 0x3e400000) {
      return x
    }

    t = x * x

    const w = asinP(t) / asinQ(t)

    return F(x, w, x)
  }

  const w0 = 1 - Math.abs(x)

  t = w0 * 0.5

  let p = asinP(t)
  let q = asinQ(t)

  const s = Math.sqrt(t)

  if (ix >= 0x3fef3333) {
    const w = p / q

    t = pio2_hi - F(2.0, F(s, w, s), -pio2_lo)
  } else {
    const w = withLow(s, 0)
    const c = F(-w, w, t) / (s + w)
    const r = p / q

    p = F(2.0 * s, r, -F(-2.0, c, pio2_lo))
    q = F(-2.0, w, pio4_hi)
    t = pio4_hi - (p - q)
  }

  return hx > 0 ? t : -t
}

export function acos(x: number): number {
  const hx = high(x)
  const ix = hx & 0x7fffffff

  if (ix >= 0x3ff00000) {
    if (((ix - 0x3ff00000) | low(x)) === 0) {
      return hx > 0 ? 0 : pi + 2.0 * pio2_lo
    }

    return NaN
  }

  if (ix < 0x3fe00000) {
    if (ix <= 0x3c600000) {
      return pio2_hi + pio2_lo
    }

    const z = x * x
    const r = asinP(z) / asinQ(z)

    return pio2_hi - (x - F(-x, r, pio2_lo))
  }

  if (hx < 0) {
    const z = (1 + x) * 0.5
    const p = asinP(z)
    const q = asinQ(z)
    const s = Math.sqrt(z)
    const r = p / q
    const w = F(r, s, -pio2_lo)

    return F(-2.0, s + w, pi)
  }

  const z = (1 - x) * 0.5
  const s = Math.sqrt(z)
  const df = withLow(s, 0)
  const c = F(-df, df, z) / (s + df)
  const p = asinP(z)
  const q = asinQ(z)
  const r = p / q
  const w = F(r, s, c)

  return 2.0 * (df + w)
}

// ---- sinh, cosh, tanh ----

const KSINH_OVERFLOW = 710.4758600739439
const TWO_M28 = 3.725290298461914e-9
const LOG_MAXD = 709.7822265625

export function sinh(x: number): number {
  const h = x < 0 ? -0.5 : 0.5
  const ax = Math.abs(x)

  if (ax < 22) {
    if (ax < TWO_M28) {
      return x
    }

    const t = expm1(ax)

    if (ax < 1) {
      return h * F(2.0, t, -((t * t) / (t + 1.0)))
    }

    return h * (t + t / (t + 1.0))
  }

  if (ax < LOG_MAXD) {
    return h * exp(ax)
  }

  if (ax <= KSINH_OVERFLOW) {
    const w = exp(0.5 * ax)
    const t = h * w

    return t * w
  }

  return x * 1.0e307
}

const KCOSH_OVERFLOW = 710.4758600739439

export function cosh(x: number): number {
  const ix = high(x) & 0x7fffffff

  if (ix < 0x3fd62e43) {
    const t = expm1(Math.abs(x))
    const w = 1 + t

    if (ix < 0x3c800000) {
      return w
    }

    return 1 + (t * t) / (w + w)
  }

  if (ix < 0x40360000) {
    const t = exp(Math.abs(x))

    return F(0.5, t, 0.5 / t)
  }

  if (ix < 0x40862e42) {
    return 0.5 * exp(Math.abs(x))
  }

  if (Math.abs(x) <= KCOSH_OVERFLOW) {
    const w = exp(0.5 * Math.abs(x))
    const t = 0.5 * w

    return t * w
  }

  if (ix >= 0x7ff00000) {
    return x * x
  }

  return Infinity
}

export function tanh(x: number): number {
  const jx = high(x)
  const ix = jx & 0x7fffffff

  let z: number

  if (ix >= 0x7ff00000) {
    return jx >= 0 ? 1 / x + 1 : 1 / x - 1
  }

  if (ix < 0x40360000) {
    if (ix < 0x3e300000) {
      return x
    }

    if (ix >= 0x3ff00000) {
      const t = expm1(2 * Math.abs(x))

      z = 1 - 2 / (t + 2)
    } else {
      const t = expm1(-2 * Math.abs(x))

      z = -t / (t + 2)
    }
  } else {
    z = 1
  }

  return jx >= 0 ? z : -z
}

// ---- asinh, acosh, atanh ----

const ln2 = 6.93147180559945286227e-1

export function asinh(x: number): number {
  const hx = high(x)
  const ix = hx & 0x7fffffff

  let w: number

  if (ix >= 0x7ff00000) {
    return x + x
  }

  if (ix < 0x3e300000) {
    return x
  }

  if (ix > 0x41b00000) {
    w = log(Math.abs(x)) + ln2
  } else if (ix > 0x40000000) {
    const t = Math.abs(x)

    w = log(F(2.0, t, 1 / (Math.sqrt(F(x, x, 1)) + t)))
  } else {
    const t = x * x

    w = log1p(Math.abs(x) + t / (1 + Math.sqrt(1 + t)))
  }

  return hx > 0 ? w : -w
}

export function acosh(x: number): number {
  const hx = high(x)
  const lx = low(x)

  if (hx < 0x3ff00000) {
    return NaN
  } else if (hx >= 0x41b00000) {
    if (hx >= 0x7ff00000) {
      return x + x
    }

    return log(x) + ln2
  } else if (((hx - 0x3ff00000) | lx) === 0) {
    return 0
  } else if (hx > 0x40000000) {
    const t = x * x

    return log(F(2.0, x, -(1 / (x + Math.sqrt(t - 1)))))
  }

  const t = x - 1

  return log1p(t + Math.sqrt(F(2.0, t, t * t)))
}

export function atanh(x: number): number {
  const hx = high(x)
  const lx = low(x)
  const ix = hx & 0x7fffffff

  if ((ix | ((lx | -lx) >>> 31)) > 0x3ff00000) {
    return NaN
  }

  if (ix === 0x3ff00000) {
    return x > 0 ? Infinity : -Infinity
  }

  if (ix < 0x3e300000) {
    return x
  }

  x = withHigh(x, ix)

  let t: number

  if (ix < 0x3fe00000) {
    t = x + x
    t = 0.5 * log1p(t + (t * x) / (1 - x))
  } else {
    t = 0.5 * log1p((x + x) / (1 - x))
  }

  return hx >= 0 ? t : -t
}

// ---- cbrt ----

const B1 = 715094163
const B2 = 696219795
const CP0 = 1.87595182427177009643
const CP1 = -1.88497979543377169875
const CP2 = 1.62142972010535446614
const CP3 = -0.758397934778766047437
const CP4 = 0.145996192886612446982

const big64 = new BigUint64Array(f64.buffer)

export function cbrt(x: number): number {
  let hx = high(x)

  const lo = low(x)
  const sign = hx & 0x80000000

  hx ^= sign

  if (hx >= 0x7ff00000) {
    return x + x
  }

  let t: number

  if (hx < 0x00100000) {
    if ((hx | lo) === 0) {
      return x
    }

    t = 18014398509481984 * x

    const hi = high(t)

    t = fromWords(sign | (Math.trunc((hi & 0x7fffffff) / 3) + B2), 0)
  } else {
    t = fromWords(sign | (Math.trunc(hx / 3) + B1), 0)
  }

  let r = t * t * (t / x)

  t = t * F((r * r) * r, F(r, CP4, CP3), F(r, F(r, CP2, CP1), CP0))
  f64[0] = t
  big64[0] = (big64[0]! + 0x80000000n) & 0xffffffffc0000000n
  t = f64[0]!

  const s = t * t

  r = x / s

  const w = t + t

  r = (r - t) / (w + r)

  return F(t, r, t)
}

// every function restated here, by its Math name
export const RESTATED = {
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  atan2,
  exp,
  expm1,
  log,
  log1p,
  log2,
  log10,
  cbrt,
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh,
} as const
