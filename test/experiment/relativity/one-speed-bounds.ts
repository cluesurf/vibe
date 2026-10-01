// ONE SPEED AS A REGISTER-SIZE LIMIT, PRICED AGAINST THE PUBLISHED BOUNDS (E-RLT-0110, OPEN-LGT-01, ledger B "one light
// speed", decision 6). E-FRC-0261 found that at the husk's balanced split the light cannot share matter's speed exactly:
// the Pell splits (c, r, m) = (8p, 3p, 16q), p^2 - 2q^2 = eps = +-1, miss matter's squared speed by exactly eps / (2q^2).
// If one speed is such a limit, the register m = 16q is a size the model must have, and the tests of a difference
// between the light's speed and the maximal speed of matter fix its least value. This file is that arithmetic.
//
// THE TRANSLATION, derived before any number was computed by code.
// 1. Matter (the register member, and the graviton) moves at c/4 = sqrt 2 / 4 husk docks a beat, so c_m^2 = 1/8. The
//    Pell split's light has kappa = c r / m^2 = 3 p^2 / (32 q^2) and c_L^2 = 2 kappa / 3 = p^2 / (16 q^2). So
//    r_L = c_L^2 / c_m^2 = p^2 / (2 q^2) = 1 + eps / (2 q^2), exactly. eps = +1: light faster than matter. eps = -1:
//    light slower.
// 2. Coleman and Glashow (PRD 59, 116008, 1999) write the light's speed as c with matter's maximal speed 1, and bound
//    1 - c^2 and c_gamma - c_e. In the model 1 - c^2 = 1 - r_L = -eps / (2 q^2), and c_gamma - c_e = sqrt(r_L) - 1.
// 3. The modern air-shower bounds use the isotropic nonbirefringent modified-Maxwell parameter kappa_tr (here kappa_LV):
//    the photon's phase speed is sqrt((1 - kappa_LV) / (1 + kappa_LV)) times the Dirac fermion's maximal speed (Duenkel,
//    Niechciol, Risse 2023, eq. 3). So r_L = (1 - kappa_LV) / (1 + kappa_LV), and kappa_LV = (1 - r_L) / (1 + r_L) =
//    (2 q^2 - p^2) / (2 q^2 + p^2) = -eps / (2 q^2 + p^2), exactly. |kappa_LV| is about 1 / (4 q^2).
// 4. The bounds, every number read in the paper itself this session (not recalled):
//    CG1999 p. 1:  1 - c^2 < 1e-23, from primary cosmic-ray protons up to 1e20 eV (vacuum Cherenkov, light slower).
//    CG1999 p. 1:  |1 - c^2| < 6e-22, atomic spectroscopy, IF the preferred frame is the microwave background's.
//    CG1999 p. 14: c_gamma - c_e < 1e-15, from cosmic photons up to 20 TeV (photon decay, light faster).
//    CG1999 p. 14: c_e - c_gamma < 5e-13, from electrons up to 500 GeV (vacuum Cherenkov).
//    Duenkel, Niechciol, Risse, PRD 104, 015010 (2021), arXiv 2106.01012: kappa_LV > -6e-21 (98% CL), photon decay
//      in ultrahigh-energy air showers (light faster).
//    Duenkel, Niechciol, Risse, PRD 107, 083004 (2023), arXiv 2303.05849, eq. 9: kappa_LV < 3e-20 (98% CL), vacuum
//      Cherenkov of electrons in ultrahigh-energy air showers (light slower); it halves Klinkhamer and Risse 2008 and
//      Klinkhamer and Schreck 2008 (PRD 78, 085026), kappa_LV < 6e-20.
//    Three bound sets, each two-sided: S1 Coleman-Glashow 1999 high energy (proton 1e-23 on the slow side, photon
//    1e-15 and electron 5e-13 on the fast and slow sides); S2 the current air-shower pair (-6e-21 < kappa_LV <
//    3e-20); S3 S2 with CG's atomic 6e-22 on both sides, which holds only if the lattice's frame is the microwave
//    background's. A Pell pair passes a set when it meets every bound of the set on its own side.
// 5. WHAT CAN AND CANNOT FAIL. The register m enters neither alpha nor the stability bound: alpha = sqrt(3 / (2 rho)) /
//    (12 N) is free of kappa and of m (E-FRC-0261 point 5), and stability is kappa lambda <= 3 at kappa near 3/16
//    (E-FRC-0260), which every Pell split meets as it approaches 3/16. The route's falsifier ("the least register
//    contradicts every depth alpha and stability allow") therefore cannot fire on alpha or on D >= 4. The one stated
//    size in the ledger it can meet is OPEN-GRV-11's clock register, e^(4 pi) states (Hawking and Bekenstein), which
//    the ledger already sets against one speed's 8.7e9. That comparison is READ: it is a contradiction only under the
//    reading that one register serves both.
//
// HAND ARITHMETIC, before the run. S2: the slow side needs 3 (2q^2 + p^2) > 1e20, about q > 2.9e9; the fast side
//  needs q > 6.5e9. The Pell q alternate in sign (q = 1 slow, 2 fast, 5 slow, 12 fast, ...), so the least pair is the
//  first slow q above 2.9e9, predicted q = 7,645,370,045, register m about 1.2e11, the light slower than matter by
//  about 1.6e-20 in the squared speed. S1: the fast side passes near q = 1.6e7, so S1's least register is predicted near
//  2.6e8 (a fast-light pair). S3: q above 2.9e10, predicted m about 7e11.
//
// GATES, fixed before the run:
//  A1 IDENTITY: for every Pell pair to q = 1e15, 16 c r - 3 m^2 = 384 eps at (8p, 3p, 16q), r_L - 1 = eps / (2 q^2) and
//     kappa_LV = -eps / (2 q^2 + p^2), as exact rationals (BigInt cross-multiplication).
//  B1 THE PRICE: under S2 a least passing Pell register exists below q = 1e15, and it is found exactly (BigInt
//     comparisons against the bounds as rationals, no float).
//  B2 THE ROUTE'S FALSIFIER: the least S2 register leaves alpha unchanged (alphaCoulomb at kappa of the least pair and
//     of q = 12, N = 23, rho = 3/8, both equal alphaOfBalance within 1e-14 relative) and its kappa is within 1/3 of
//     3/16 (inside the stability margin kappa lambda <= 3 < 4 of E-FRC-0260). B2 FIRES (the limit is ruled out) if
//     either fails.
// VERDICT, fixed before the run: PASS when A1, B1 hold and B2 does not fire: one speed as a register-size limit
//  survives the published bounds, at the price of a least register; FAIL when no Pell register to q = 1e15 passes S2
//  or B2 fires (then one speed must be a law).
// READ, gating nothing: the least register under S1, S2, S3 and on each side; the squared-speed gap at the least S2
//  register; the least register over ALL integer splits at the balance (the squared miss is a nonzero integer over
//  m^2, so at least 1/m^2, a floor reached by x^2 - 128 y^2 = +-1, which E-FRC-0261's family m = 16q does not reach);
//  the ratio of the least S2 register to e^(4 pi), and the best kappa_LV a register of e^(4 pi) can reach.
//
// FIRST RUN 2026-10-01 (tmp/hx-rlt-run1.log, under 1 s, no probe before it): PASS as predicted, no gate moved. A1 40
//  of 40 Pell pairs to q = 1e15. S2's least pair q = 7,645,370,045 (p = 10,812,186,007, eps = -1, the light slower),
//  m = 122,325,920,720, squared gap 8.554e-21, kappa_tr 4.277e-21; the fast side's least m = 295,320,896,832. S1 least
//  m = 255,910,848 (a fast pair; its slow side needs 4.16e12, from the proton bound); S3 least m = 712,967,714,384. B2
//  did not fire: alpha 1/138 at N = 23 at both pairs and reduced. Read: over every split at the balance the floor is m
//  above 4,082,482,905, first met by x^2 - 128 y^2 = 1 at m = 886,731,088,897 (so E-FRC-0261's m = 16q family is not
//  the cheapest on paper, and no split cheaper than 4.1e9 exists); e^(4 pi) = 286,751: its best Pell pair (q = 13,860)
//  gives kappa_tr -1.30e-9, 2.2e11 times past the fast-side bound, and the least register is 4.27e5 times it.
//
// Depth L1: exact arithmetic on E-FRC-0261's identity against published numbers. No rule is run here.
// DETERMINISM: integers only for every gate; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  alphaCoulomb,
  alphaOfBalance,
  pellPairs,
  pellSplit,
} from '@/code/measure/light-split-origin'

const Q_MAX = 10n ** 15n

type Pair = { p: bigint; q: bigint; sign: bigint }

// one published bound, applied to the Pell pairs on its side, as an exact integer comparison
type Bound = { name: string; side: 'slow' | 'fast'; test: (x: Pair) => boolean }

const pow10 = (k: number): bigint => 10n ** BigInt(k)

// 1 - r_L = 1 / (2 q^2) on the slow side
const slowOneMinusC2 = (limit: bigint, scale: number) => (x: Pair) =>
  // 1 / (2 q^2) < limit / 10^scale  <=>  10^scale < limit * 2 q^2
  pow10(scale) < limit * 2n * x.q * x.q

// kappa_LV = 1 / (2 q^2 + p^2) on the slow side, -1 / (2 q^2 + p^2) on the fast side
const kappaMagnitude = (limit: bigint, scale: number) => (x: Pair) =>
  pow10(scale) < limit * (2n * x.q * x.q + x.p * x.p)

// c_gamma - c_e = sqrt(r_L) - 1 < limit on the fast side: r_L < (1 + limit)^2, r_L = p^2 / (2 q^2)
const fastSpeed = (limit: bigint, scale: number) => (x: Pair) => {
  const one = pow10(scale)

  return x.p * x.p * one * one < 2n * x.q * x.q * (one + limit) ** 2n
}

// c_e - c_gamma = 1 - sqrt(r_L) < limit on the slow side: r_L > (1 - limit)^2
const slowSpeed = (limit: bigint, scale: number) => (x: Pair) => {
  const one = pow10(scale)

  return x.p * x.p * one * one > 2n * x.q * x.q * (one - limit) ** 2n
}

const S1: Bound[] = [
  { name: 'CG proton 1 - c^2 < 1e-23', side: 'slow', test: slowOneMinusC2(1n, 23) },
  { name: 'CG electron c_e - c_gamma < 5e-13', side: 'slow', test: slowSpeed(5n, 13) },
  { name: 'CG photon c_gamma - c_e < 1e-15', side: 'fast', test: fastSpeed(1n, 15) },
]
const S2: Bound[] = [
  { name: 'DNR 2023 kappa < 3e-20', side: 'slow', test: kappaMagnitude(3n, 20) },
  { name: 'DNR 2021 kappa > -6e-21', side: 'fast', test: kappaMagnitude(6n, 21) },
]
const ATOMIC = slowOneMinusC2(6n, 22)
const S3: Bound[] = [
  ...S2,
  { name: 'CG atomic |1 - c^2| < 6e-22 (slow)', side: 'slow', test: ATOMIC },
  { name: 'CG atomic |1 - c^2| < 6e-22 (fast)', side: 'fast', test: ATOMIC },
]

const sideOf = (x: Pair): 'slow' | 'fast' => (x.sign > 0n ? 'fast' : 'slow')

function passes(x: Pair, set: Bound[]): boolean {
  return set.filter(b => b.side === sideOf(x)).every(b => b.test(x))
}

function least(
  pairs: Pair[],
  set: Bound[],
  side?: 'slow' | 'fast',
): Pair | undefined {
  return pairs.find(
    x => (side === undefined || sideOf(x) === side) && passes(x, set),
  )
}

// over every integer split (8t, 3t, m) at the balance, kappa_LV = (m^2 - 128 t^2) / (m^2 + 128 t^2). The smallest
// nonzero numerator is 1, on the slow side only (m^2 - 128 t^2 = 1 is Pell's x^2 - 128 y^2 = 1, while 128 t^2 - m^2 = 1
// would need an odd square congruent to -1 mod 8). Slow side: kappa_LV = 1 / (2 m^2 - 1) < 3e-20 needs about
// m^2 > 1e20 / 6; this is the least m with m^2 > 10^scale / limit
function generalFloor(limit: bigint, scale: number): bigint {
  const target = pow10(scale) / limit

  let m = BigInt(Math.floor(Math.sqrt(Number(target))))

  while (m > 0n && (m - 1n) * (m - 1n) > target) {
    m -= 1n
  }

  while (m * m <= target) {
    m += 1n
  }

  return m
}

// the fundamental solution of x^2 - 128 y^2 = 1 and its powers, to read where the 1 / m^2 floor is actually met
function pell128(mMax: bigint): bigint[] {
  // fundamental: x = 577, y = 51 (577^2 - 128 * 51^2 = 332929 - 332928 = 1)
  const out: bigint[] = []

  let x = 577n
  let y = 51n

  while (x <= mMax) {
    out.push(x)
    ;[x, y] = [577n * x + 128n * 51n * y, 51n * x + 577n * y]
  }

  return out
}

const sci = (v: bigint | number): string =>
  Number(v).toExponential(3)

export function oneSpeedBoundsRun(): Verdict {
  const started = Date.now()
  const pairs = pellPairs(Q_MAX)

  // ---- A1 ----
  let identities = 0

  for (const x of pairs) {
    const split = pellSplit(x)
    const eps = x.sign
    const lhs = 16n * split.c * split.r - 3n * split.m * split.m
    // r_L - 1 = (p^2 - 2 q^2) / (2 q^2) = eps / (2 q^2)
    const rMinusOne = x.p * x.p - 2n * x.q * x.q === eps
    // kappa_LV = (2q^2 - p^2) / (2q^2 + p^2) = -eps / (2q^2 + p^2)
    const kappa = 2n * x.q * x.q - x.p * x.p === -eps

    if (lhs === 384n * eps && rMinusOne && kappa && (eps === 1n || eps === -1n)) {
      identities++
    }
  }

  const a1 = identities === pairs.length && pairs.length > 0

  // ---- B1 ----
  const s2 = least(pairs, S2)
  const b1 = s2 !== undefined

  // ---- B2 ----
  const kappaOf = (x: Pair): number =>
    (3 * Number(x.p) ** 2) / (32 * Number(x.q) ** 2)
  const twelve = pairs.find(x => x.q === 12n)!
  const n = 23
  const reference = alphaOfBalance(n, 3 / 8)
  const alphaLeast = s2 ? alphaCoulomb(n, 3 / 8, kappaOf(s2)) : NaN
  const alphaTwelve = alphaCoulomb(n, 3 / 8, kappaOf(twelve))
  const alphaFree =
    Math.abs(alphaLeast / reference - 1) < 1e-14 &&
    Math.abs(alphaTwelve / reference - 1) < 1e-14
  const stable = s2 ? Math.abs(kappaOf(s2) / (3 / 16) - 1) < 1 / 3 : false
  const b2Fires = !(alphaFree && stable)

  const status = a1 && b1 && !b2Fires ? 'pass' : a1 ? 'fail' : 'partial'

  // ---- READ ----
  const s1 = least(pairs, S1)
  const s3 = least(pairs, S3)
  const s2slow = least(pairs, S2, 'slow')
  const s2fast = least(pairs, S2, 'fast')
  const s1slow = least(pairs, S1, 'slow')
  const s1fast = least(pairs, S1, 'fast')
  const reg = (x: Pair | undefined): bigint => (x ? 16n * x.q : -1n)
  const gapS2 = s2 ? 1 / (2 * Number(s2.q) ** 2) : NaN
  const kappaS2 = s2 ? -Number(s2.sign) / (2 * Number(s2.q) ** 2 + Number(s2.p) ** 2) : NaN
  // the floor over every split at the balance, on S2's slow side: 1 / (2 m^2) < 3e-20, m^2 > 1e20 / 6
  const floorS2 = generalFloor(6n, 20)
  const floorPell128 = pell128(10n ** 16n).find(m => m >= floorS2)
  const clock = Math.exp(4 * Math.PI)
  const clockQ = BigInt(Math.floor(clock / 16))
  const clockPair = [...pairs].reverse().find(x => x.q <= clockQ)!
  const clockKappa =
    -Number(clockPair.sign) /
    (2 * Number(clockPair.q) ** 2 + Number(clockPair.p) ** 2)

  const metrics: Record<string, number> = {
    gate_A1: a1 ? 1 : 0,
    gate_B1: b1 ? 1 : 0,
    gate_B2_fires: b2Fires ? 1 : 0,
    pellPairs: pairs.length,
    identities,
    leastQ_S2: Number(s2?.q ?? -1),
    leastP_S2: Number(s2?.p ?? -1),
    leastSign_S2: Number(s2?.sign ?? 0),
    leastRegister_S2: Number(reg(s2)),
    leastRegister_S2_slow: Number(reg(s2slow)),
    leastRegister_S2_fast: Number(reg(s2fast)),
    leastRegister_S1: Number(reg(s1)),
    leastRegister_S1_slow: Number(reg(s1slow)),
    leastRegister_S1_fast: Number(reg(s1fast)),
    leastRegister_S3: Number(reg(s3)),
    squaredGap_S2: gapS2,
    kappaLV_S2: kappaS2,
    alphaLeast,
    alphaTwelve,
    alphaReference: reference,
    kappaLeast: s2 ? kappaOf(s2) : NaN,
    floorRegisterAnySplit_S2: Number(floorS2),
    floorPell128_S2: Number(floorPell128 ?? -1n),
    clockStates: clock,
    clockRegisterBestPellQ: Number(clockPair.q),
    clockRegisterBestKappaLV: clockKappa,
    leastOverClock_S2: Number(reg(s2)) / clock,
    seconds: (Date.now() - started) / 1000,
  }

  return verdict({
    status,
    claim: `one light speed as a register-size limit survives the published bounds at a price: E-FRC-0261's Pell splits (8p, 3p, 16q) give the light c_L^2 / c_m^2 = 1 + eps / (2 q^2) exactly (${identities} of ${pairs.length} pairs to q = 1e15), so the modified-Maxwell parameter is kappa = -eps / (2 q^2 + p^2); the current air-shower bounds -6e-21 < kappa < 3e-20 (Duenkel, Niechciol, Risse 2021, 2023, 98% CL) first pass at q = ${s2?.q}, a register m = 16q = ${reg(s2)} (${sci(reg(s2))}), with the light slower than matter by ${sci(gapS2)} in the squared speed (kappa ${sci(kappaS2)}); the fast side alone needs m = ${sci(reg(s2fast))}; Coleman and Glashow's 1999 high-energy bounds allow m = ${sci(reg(s1))}, and adding their atomic bound (which assumes the microwave background's frame) m = ${sci(reg(s3))}; m enters neither alpha nor the stability margin, so the route's falsifier cannot fire, and the one size it meets is the clock register: the least register is ${(Number(reg(s2)) / clock).toExponential(2)} times e^(4 pi), and a register of e^(4 pi) states misses the bound by kappa ${sci(clockKappa)}`,
    metrics,
    control: {
      alphaFreeOfRegister: alphaFree ? 1 : 0,
      kappaWithinStability: stable ? 1 : 0,
    },
    notes: `L1. Gates A1 ${a1}, B1 ${b1}, B2 fires ${b2Fires}. Least Pell registers (q, sign, m): S2 ${s2?.q} ${s2?.sign} ${reg(s2)}; S2 slow ${reg(s2slow)}, fast ${reg(s2fast)}; S1 ${reg(s1)} (slow ${reg(s1slow)}, fast ${reg(s1fast)}); S3 ${reg(s3)}. Bounds used, read in the papers: ${[...S1, ...S2].map(b => `${b.name} (${b.side})`).join('; ')}; CG atomic |1 - c^2| < 6e-22 in S3 only. Alpha at N = 23, rho = 3/8: ${alphaLeast} at the least S2 pair, ${alphaTwelve} at q = 12, ${reference} reduced. Over every integer split (8t, 3t, m) at the balance the slow side's least numerator is 1, so S2 needs m above ${floorS2} at least, met first by x^2 - 128 y^2 = 1 at m = ${floorPell128} (read, not gated, and the drifts s, f of such splits are not checked here). e^(4 pi) = ${clock.toFixed(1)}: its best Pell pair has q = ${clockPair.q}, kappa ${sci(clockKappa)}. ${((Date.now() - started) / 1000).toFixed(2)} s.`,
  })
}

export default experiment({
  id: 'relativity/one-speed-bounds',
  code: 'E-RLT-0110',
  title:
    'one light speed as a register-size limit survives the published Lorentz-violation bounds at a price, pass: the Pell splits of E-FRC-0261 give the light c_L^2 / c_m^2 = 1 + eps / (2 q^2) exactly, so kappa_tr = -eps / (2 q^2 + p^2); the air-shower bounds -6e-21 < kappa < 3e-20 (Duenkel, Niechciol, Risse 2021, 2023) first pass at q = 7,645,370,045, a register m = 1.22e11 with the light slower by 8.6e-21 in the squared speed (the fast side alone needs 2.95e11; the 1999 Coleman-Glashow high-energy bounds allow 2.6e8, and with their atomic bound 7.1e11); m enters neither alpha nor stability, so the falsifier of the route cannot fire, but the least register is 4.3e5 times the e^(4 pi) clock register, which misses the bounds by kappa 1.3e-9',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run: oneSpeedBoundsRun,
})
