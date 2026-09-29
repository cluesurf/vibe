// ONE LIGHT SPEED (E-MTR-0023): why the token's light cone is not the photon's, and the integer token whose is.
//
// THE MISMATCH (E-MTR-0013). The photon is a leapfrog: each beat its field drifts and is forced, 2 - 2 cos omega =
// kappa lambda(k), kappa = 2 / (2D + 1), and on the husk lambda -> (2/3) k^2 (E-FRC-0235), so c_photon^2 = 2 kappa / 3
// = 4 / (3 (2D + 1)). The token is a walk whose stream copies its WHOLE amplitude one dock per beat: with its coin
// off its band is E = k exactly (slope 1 per copy), and with the coin its long-wave c^2 = E0 E'' = (pi/3)/sqrt 3.
// THE STRUCTURAL REASON: the light copies a FRACTION of its field across a link each beat (kappa, set by the column
// depth); the token copies all of it. Two different copies, two light cones.
//
// THE CONDITION (derived before any run). One light cone needs every massless band to have the photon's long-wave
// slope: c_token^2 = 4 / (3 (2D + 1)) at every D.
//   (a) A token that copies its whole amplitude on p of every q beats has c = p / q, rational. c_photon is rational
//       only when 3 (2D + 1) is a perfect square, D = (3 m^2 - 1) / 2 with m odd (D = 1, 13, 37, 73, ...), and a
//       schedule of one copy every T beats would need 4 T^2 = 3 (2D + 1), whose right side is odd: NEVER. So no
//       beat schedule of a whole-amplitude copy gives one light speed for every D.
//   (b) The fix copies the light's own fraction. The LAZY ROOT TOKEN (code/rule/lazy-root-token, a STAND-IN):
//       Q = 9 (2D + 1) ports per dock, the 24 D4 roots copy along their husk shadows and the rest copy nowhere, and
//       the coin reflects about the column's zero-momentum state (Q R = 2J - Q, integer). Szegedy's theorem gives
//       cos E = 1 - L(k) / Q with L the husk Laplacian (the 9 link directions weighted 2, 2, 2, 1 x 6), so
//       c_token^2 = 12 / Q = 12 / (9 (2D + 1)). The photon's husk lambda equals L / 9 at long wavelength (seen
//       in the design probe tmp/sr-probe1.ts to 5e-8 at |k| = 1e-3, disclosed), so c_photon^2 = kappa (2/3) =
//       12 / (9 (2D + 1)) = c_token^2 AT EVERY D. No knob: the 9 is the photon's own lambda / L, the 2D + 1 is the
//       column the light's drift reads.
//   (c) Its group velocity never exceeds c (proof, written before the run): v = |grad L| / (Q sin E), and by
//       Cauchy-Schwarz over the 24 roots (sum_r (u . s_r)^2 = 12 for a unit u) |grad L|^2 <= 12 sum sin^2 =
//       12 (2L - sum (1 - cos)^2) <= 24 L - L^2 / 2, while Q^2 sin^2 E c^2 = 12 (2L - L^2 / Q) = 24 L - 12 L^2 / Q;
//       so v <= c whenever Q >= 24, which Q = 9 (2D + 1) >= 27 always is.
//
// Gates, fixed before the first run:
// S1 the photon on the husk: at |k| = 1e-3 in 13 directions its husk symbol's lambda / |k|^2 is 2/3 and lambda / (L/9)
//    is 1, each within 1e-6 relative
// S2 the whole-copy theorem: over D = 1 .. 100,000 in integers, 0 values of D admit 4 T^2 = 3 (2D + 1), and the D
//    with 3 (2D + 1) a perfect square are exactly the (3 m^2 - 1) / 2, m odd; the locked token's own band (code/rule/
//    locked-token-line's coin) has coin-off slope 1 within 1e-9, E0 E'' = (pi / 3) / sqrt 3 within 1e-6, and its
//    long-wave c differs from the photon's by at least 10 percent at every D = 1 .. 16
// S3 the lazy token's symbol is Szegedy's: at 32 Weyl husk wave vectors, D = 1 .. 4 and phi in {0, 2 pi / 3,
//    2 pi / (2 (2D + 1)^2)}, both phases phi / 2 +- E(k) are in its spectrum within 1e-12 and the other Q - 2
//    eigenvalues lie at +1 or -1 within 1e-9
// S4 one light speed: for D = 1 .. 16 (phi = 0), the token's c read from its spectrum at |k| = 1e-3 in 13
//    directions equals the photon's husk c read from its husk symbol at the same k within 1e-6 relative, and the
//    token's group velocity over |k| in (0, pi] on those 13 directions never exceeds that c by more than 1e-9
// S5 the exact integer rule: on the 4^3 husk torus, D = 1, 2, phase none and omega, three starts (one root port, the
//    coin state, a Weyl superposition), 6 beats forward and 6 back return Q^12 times the start exactly, the norm
//    sum is Q^(2t) times the start's at every beat, and the operator read off the rule (every port at dock 0, one
//    beat, Fourier-transformed at 4 torus wave vectors) equals the symbol within 1e-12
// Reported: the photon's own maximum group velocity by D, the bulk token's depth-direction c, the split-step
// escape inside the model's ring Z[omega][1/6] (only 2D + 1 = 3^j), a coin-state start's flat-band weight.
// Status: pass if S1 .. S5 hold; partial if S1, S3 and S4 hold and S2 or S5 fails; fail otherwise.
//
// Depth L2 (the construction is a STAND-IN token: spinless, its copy direction is a root, not the doublet the spin
// lock of E-SPN-0066 asks for); the condition and the whole-copy theorem are L1.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'
import {
  lazyBeat,
  lazyBeatBack,
  lazyNormSum,
  lazyState,
  lazyStreamMap,
  portCount,
  type LazyPhase,
  type LazySpec,
} from '@/code/rule/lazy-root-token'
import {
  huskLaplacianSymbol,
  huskLightSpeed,
  huskPhotonLambda,
  kappaOf,
  lazyEnergy,
  lazyEnergyFromSpectrum,
  lazyPhases,
  lazySymbol,
  lockedTokenEnergy,
  photonOmega,
  rootLaplacian,
} from '@/code/measure/one-light-speed'

export const DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [-1, 1, 1],
]

const unit = (d: readonly number[], s: number): number[] => {
  const n = Math.hypot(...d)

  return d.map(x => (x * s) / n)
}

const isSquare = (n: number): boolean => {
  const r = Math.round(Math.sqrt(n))

  return r * r === n
}

function exactRuleCheck(
  depth: number,
  phase: LazyPhase,
): { reverse: number; norm: number; symbolGap: number } {
  const spec: LazySpec = { side: 4, depth, phase }
  const Q = portCount(depth)
  const map = lazyStreamMap(spec)
  const q = BigInt(Q)
  const starts = [
    [{ dock: [1, 2, 3], port: 5, a: 1n, b: 0n }],
    Array.from({ length: Q }, (_, p) => ({
      dock: [0, 0, 0],
      port: p,
      a: 1n,
      b: 0n,
    })),
    Array.from({ length: 12 }, (_, i) => ({
      dock: [
        Math.floor(weyl(3 * i + 1, GOLDEN) * 4),
        Math.floor(weyl(3 * i + 2, GOLDEN) * 4),
        Math.floor(weyl(3 * i + 3, GOLDEN) * 4),
      ],
      port: Math.floor(weyl(i + 1, SILVER) * Q),
      a: BigInt(Math.floor(weyl(i + 7, GOLDEN) * 7) - 3),
      b: BigInt(Math.floor(weyl(i + 7, SILVER) * 7) - 3),
    })),
  ]

  let reverse = 0
  let norm = 0

  for (const start of starts) {
    const s = lazyState(spec, start)
    const a0 = s.a.slice()
    const b0 = s.b.slice()
    const n0 = lazyNormSum(s)

    let scale = 1n

    for (let t = 0; t < 6; t++) {
      lazyBeat(s, map)
      scale *= q * q

      if (lazyNormSum(s) !== n0 * scale) {
        norm++
      }
    }

    for (let t = 0; t < 6; t++) {
      lazyBeatBack(s, map)
    }

    const back = q ** 12n

    for (let i = 0; i < a0.length; i++) {
      if (s.a[i] !== a0[i]! * back || s.b[i] !== b0[i]! * back) {
        reverse++
        break
      }
    }
  }

  // the operator read off the rule: image of |0, col> after one beat, Fourier-transformed
  const w = { re: -0.5, im: Math.sqrt(3) / 2 }
  const ks = [
    [0, 0, 0],
    [Math.PI / 2, 0, 0],
    [Math.PI / 2, Math.PI, -Math.PI / 2],
    [Math.PI, Math.PI / 2, Math.PI / 2],
  ]

  let symbolGap = 0

  const images: { a: bigint[]; b: bigint[] }[] = []

  for (let col = 0; col < Q; col++) {
    const s = lazyState(spec, [
      { dock: [0, 0, 0], port: col, a: 1n, b: 0n },
    ])

    lazyBeat(s, map)
    images.push({ a: s.a, b: s.b })
  }

  for (const k of ks) {
    const sym = lazySymbol(
      Q,
      phase === 'none' ? 0 : (2 * Math.PI) / 3,
      k,
    )

    for (let col = 0; col < Q; col++) {
      const img = images[col]!

      for (let row = 0; row < Q; row++) {
        let re = 0
        let im = 0

        for (let z = 0; z < 4; z++) {
          for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
              const i = (x + 4 * (y + 4 * z)) * Q + row
              const va = Number(img.a[i]!) / Q
              const vb = Number(img.b[i]!) / Q

              if (va === 0 && vb === 0) {
                continue
              }

              const vr = va + vb * w.re
              const vi = vb * w.im
              // displacement on the torus, centered
              const dx = x > 2 ? x - 4 : x
              const dy = y > 2 ? y - 4 : y
              const dz = z > 2 ? z - 4 : z
              const t = -(k[0]! * dx + k[1]! * dy + k[2]! * dz)

              re += vr * Math.cos(t) - vi * Math.sin(t)
              im += vr * Math.sin(t) + vi * Math.cos(t)
            }
          }
        }

        symbolGap = Math.max(
          symbolGap,
          Math.hypot(
            re - sym.re[row * Q + col]!,
            im - sym.im[row * Q + col]!,
          ),
        )
      }
    }
  }

  return { reverse, norm, symbolGap }
}

export default experiment({
  id: 'matter/one-light-speed',
  code: 'E-MTR-0023',
  title:
    "one light speed: a token that copies its whole amplitude has a light cone the photon's leapfrog never shares at every depth (no beat schedule can match sqrt(4 / (3 (2D + 1)))), and a lazy root token, a STAND-IN whose coin reflects about the column's zero-momentum state over 9 (2D + 1) ports with the 24 roots copying, has the photon's husk light speed at every D by Szegedy's theorem, with no knob",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const metrics: Record<string, number> = {}
    const h = 1e-3

    // ---- S1: the photon on the husk ----
    let s1Two = 0
    let s1Nine = 0

    for (const d of DIRECTIONS) {
      const k = unit(d, h)
      const lam = huskPhotonLambda(k)

      s1Two = Math.max(s1Two, Math.abs(lam / (h * h) / (2 / 3) - 1))
      s1Nine = Math.max(
        s1Nine,
        Math.abs(lam / (huskLaplacianSymbol(k) / 9) - 1),
      )
    }

    metrics.photonLambdaOverK2Gap = s1Two
    metrics.photonLambdaOverLaplacianNinthGap = s1Nine

    const s1 = s1Two <= 1e-6 && s1Nine <= 1e-6

    log('s1')

    // ---- S2: the whole-copy theorem ----
    let scheduleHits = 0
    let squareHits = 0
    let squareMismatch = 0
    let splitStepHits = 0

    for (let D = 1; D <= 100000; D++) {
      const N = 2 * D + 1

      if ((3 * N) % 4 === 0 && isSquare((3 * N) / 4)) {
        scheduleHits++
      }

      const sq = isSquare(3 * N)
      const m = Math.sqrt((2 * D + 1) / 3)
      const predicted = Number.isInteger(m) && m % 2 === 1

      if (sq) {
        squareHits++
      }

      if (sq !== predicted) {
        squareMismatch++
      }

      let r = N

      while (r % 3 === 0) {
        r /= 3
      }

      if (r === 1) {
        splitStepHits++
      }
    }

    metrics.scheduleSolutions = scheduleHits
    metrics.rationalPhotonSpeedDepths = squareHits
    metrics.rationalDepthFormulaMismatches = squareMismatch
    metrics.splitStepRingDepths = splitStepHits

    const eps = 1e-4
    const coinOffSlope = lockedTokenEnergy(eps, false) / eps
    const E0 = lockedTokenEnergy(0, true)
    const curvature = (2 * (lockedTokenEnergy(1e-3, true) - E0)) / 1e-6
    const lockedC2 = E0 * curvature

    let lockedMaxGroup = 0

    for (let j = 1; j < 2000; j++) {
      const k = (Math.PI * j) / 2000
      const g =
        (lockedTokenEnergy(k + 1e-6, true) -
          lockedTokenEnergy(k - 1e-6, true)) /
        2e-6

      lockedMaxGroup = Math.max(lockedMaxGroup, g)
    }

    let lockedPhotonNearest = Infinity

    for (let D = 1; D <= 16; D++) {
      lockedPhotonNearest = Math.min(
        lockedPhotonNearest,
        Math.abs(Math.sqrt(lockedC2) / huskLightSpeed(D) - 1),
      )
    }

    metrics.lockedCoinOffSlope = coinOffSlope
    metrics.lockedRestEnergy = E0
    metrics.lockedC2 = lockedC2
    metrics.lockedC = Math.sqrt(lockedC2)
    metrics.lockedMaxGroupVelocity = lockedMaxGroup
    metrics.lockedOverPhotonNearestGap = lockedPhotonNearest

    const s2 =
      scheduleHits === 0 &&
      squareMismatch === 0 &&
      Math.abs(coinOffSlope - 1) <= 1e-9 &&
      Math.abs(lockedC2 - Math.PI / 3 / Math.sqrt(3)) <= 1e-6 &&
      Math.abs(lockedMaxGroup - 0.5) <= 1e-6 &&
      lockedPhotonNearest >= 0.1

    log('s2')

    // ---- S3: the lazy token's symbol ----
    let s3Band = 0
    let s3Flat = 0
    let s3Count = 0

    for (let D = 1; D <= 4; D++) {
      const N = 2 * D + 1
      const Q = portCount(D)

      for (const phi of [
        0,
        (2 * Math.PI) / 3,
        (2 * Math.PI) / (2 * N * N),
      ]) {
        for (let s = 0; s < 32; s++) {
          const k = [0, 1, 2].map(
            j => 2 * Math.PI * (weyl(3 * s + j + 1, GOLDEN) - 0.5),
          )
          const ph = lazyPhases(Q, phi, k)
          const E = lazyEnergy(Q, phi, k)
          const want = [phi / 2 + E, phi / 2 - E]
          const used = new Set<number>()

          for (const w of want) {
            let best = -1
            let gap = Infinity

            ph.forEach((p, i) => {
              if (used.has(i)) {
                return
              }

              const g = Math.abs(
                Math.atan2(Math.sin(p - w), Math.cos(p - w)),
              )

              if (g < gap) {
                gap = g
                best = i
              }
            })

            used.add(best)
            s3Band = Math.max(s3Band, gap)
          }

          ph.forEach((p, i) => {
            if (used.has(i)) {
              return
            }

            s3Flat = Math.max(s3Flat, Math.abs(Math.sin(p)))
          })
          s3Count++
        }
      }
    }

    metrics.symbolBandGap = s3Band
    metrics.symbolFlatGap = s3Flat
    metrics.symbolCases = s3Count

    const s3 = s3Band <= 1e-12 && s3Flat <= 1e-9

    log('s3')

    // ---- S4: one light speed ----
    let s4Speed = 0
    let s4Group = 0

    const photonMaxGroup: number[] = []
    const tokenMaxGroup: number[] = []
    // the photon's lambda on a grid of |k| per direction (lambda does not depend on D)
    const grid = 120
    const lamGrid = DIRECTIONS.map(d =>
      Array.from({ length: grid + 1 }, (_, j) =>
        [-1e-5, 0, 1e-5].map(dd =>
          j === 0
            ? 0
            : huskPhotonLambda(unit(d, (Math.PI * j) / grid + dd)),
        ),
      ),
    )

    log('s4 grid')

    for (let D = 1; D <= 16; D++) {
      const Q = portCount(D)
      const kappa = kappaOf(D)

      let worst = 0
      let pmax = 0
      let tmax = 0

      for (const [di, d] of DIRECTIONS.entries()) {
        const k = unit(d, h)
        const cPhoton = photonOmega(kappa, huskPhotonLambda(k)) / h
        const cToken = lazyEnergyFromSpectrum(Q, 0, k) / h

        worst = Math.max(worst, Math.abs(cToken / cPhoton - 1))

        const c = huskLightSpeed(D)

        for (let j = 1; j <= grid; j++) {
          const s = (Math.PI * j) / grid
          const tg =
            (lazyEnergy(Q, 0, unit(d, s + 1e-5)) -
              lazyEnergy(Q, 0, unit(d, s - 1e-5))) /
            2e-5
          const row = lamGrid[di]![j]!
          const pg =
            (photonOmega(kappa, row[2]!) -
              photonOmega(kappa, row[0]!)) /
            2e-5

          tmax = Math.max(tmax, tg)
          pmax = Math.max(pmax, pg)
          s4Group = Math.max(s4Group, tg / c - 1)
        }
      }

      s4Speed = Math.max(s4Speed, worst)
      photonMaxGroup.push(pmax)
      tokenMaxGroup.push(tmax)
      metrics[`c_D${D}`] = huskLightSpeed(D)
      metrics[`tokenOverPhotonGap_D${D}`] = worst
      metrics[`photonMaxGroup_D${D}`] = pmax
      metrics[`tokenMaxGroup_D${D}`] = tmax
    }

    metrics.speedGapWorst = s4Speed
    metrics.tokenGroupExcessWorst = s4Group

    const s4 = s4Speed <= 1e-6 && s4Group <= 1e-9

    log('s4')

    // ---- S5: the exact integer rule ----
    const exact = [1, 2].flatMap(D =>
      (['none', 'omega'] as LazyPhase[]).map(phase => ({
        D,
        phase,
        ...exactRuleCheck(D, phase),
      })),
    )
    const s5 = exact.every(
      e => e.reverse === 0 && e.norm === 0 && e.symbolGap <= 1e-12,
    )

    for (const e of exact) {
      metrics[`exactReverseMismatch_D${e.D}_${e.phase}`] = e.reverse
      metrics[`exactNormMismatch_D${e.D}_${e.phase}`] = e.norm
      metrics[`exactSymbolGap_D${e.D}_${e.phase}`] = e.symbolGap
    }

    log('s5')

    // ---- reported ----
    // the bulk token along the depth: the same 12 / Q
    const bulkDepth = [1, 4, 16].map(D => {
      const Q = portCount(D)

      return (
        Math.acos(1 - rootLaplacian([0, 0, 0, h]) / Q) /
        h /
        huskLightSpeed(D)
      )
    })

    metrics.bulkDepthOverHusk_D1 = bulkDepth[0]!
    metrics.bulkDepthOverHusk_D4 = bulkDepth[1]!
    metrics.bulkDepthOverHusk_D16 = bulkDepth[2]!

    // a coin-state start's weight on the flat bands: zero by Szegedy (the coin state lies in span(a, S a))
    let flatWeight = 0

    for (let s = 0; s < 8; s++) {
      const k = [0, 1, 2].map(
        j => 2 * Math.PI * (weyl(3 * s + j + 101, SILVER) - 0.5),
      )
      const Q = portCount(2)
      const W = lazySymbol(Q, 0, k)
      // W^2 a - (2 cos E) W a + a = 0 on the dispersive span; its residual is the flat weight's witness
      const a = new Float64Array(Q).fill(1 / Math.sqrt(Q))

      const apply = (
        vr: Float64Array,
        vi: Float64Array,
      ): [Float64Array, Float64Array] => {
        const or = new Float64Array(Q)
        const oi = new Float64Array(Q)

        for (let r = 0; r < Q; r++) {
          for (let c = 0; c < Q; c++) {
            or[r] =
              or[r]! +
              W.re[r * Q + c]! * vr[c]! -
              W.im[r * Q + c]! * vi[c]!

            oi[r] =
              oi[r]! +
              W.re[r * Q + c]! * vi[c]! +
              W.im[r * Q + c]! * vr[c]!
          }
        }

        return [or, oi]
      }

      const [w1r, w1i] = apply(a, new Float64Array(Q))
      const [w2r, w2i] = apply(w1r, w1i)
      const twoCos = 2 * Math.cos(lazyEnergy(Q, 0, k))

      let res = 0

      for (let r = 0; r < Q; r++) {
        res +=
          (w2r[r]! - twoCos * w1r[r]! + a[r]!) ** 2 +
          (w2i[r]! - twoCos * w1i[r]!) ** 2
      }

      flatWeight = Math.max(flatWeight, Math.sqrt(res))
    }

    metrics.coinStartFlatWitness = flatWeight

    const status =
      s1 && s2 && s3 && s4 && s5
        ? 'pass'
        : s1 && s3 && s4
          ? 'partial'
          : 'fail'

    for (const [g, ok] of Object.entries({
      S1: s1,
      S2: s2,
      S3: s3,
      S4: s4,
      S5: s5,
    })) {
      metrics[`gate${g}`] = ok ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `husk first: the photon's husk lambda is (2/3) k^2 = L / 9 at long wavelength (gaps ${s1Two.toExponential(1)}, ${s1Nine.toExponential(1)} in 13 directions), so c_photon^2 = 4 / (3 (2D + 1)); a token that copies its whole amplitude has slope 1 per copy (the locked token: coin off ${coinOffSlope.toFixed(9)}, with its coin c = ${Math.sqrt(lockedC2).toFixed(4)} and top group velocity ${lockedMaxGroup.toFixed(4)}, at least ${(100 * lockedPhotonNearest).toFixed(0)} percent off the photon at every D = 1 to 16), and no beat schedule can fix it: over D = 1 to 100,000 a one-copy-in-T schedule matches ${scheduleHits} times and a rational speed exists only at the ${squareHits} depths (3 m^2 - 1) / 2; the lazy root token (a STAND-IN: 9 (2D + 1) ports, the 24 roots copy, a coin reflecting about the column's zero-momentum state, integer) is Szegedy's walk (bands to ${s3Band.toExponential(1)}, flat rest to ${s3Flat.toExponential(1)}, ${s3Count} cases) and its light speed equals the photon's husk light speed at every D = 1 to 16 (worst ${s4Speed.toExponential(1)} over 13 directions), its group velocity never above it (excess ${s4Group.toExponential(1)}); the exact rule is reversible and norm-keeping and is its symbol (${exact.map(e => `${e.reverse}/${e.norm}/${e.symbolGap.toExponential(1)}`).join(', ')})`,
      metrics,
      control: {
        lockedTokenC: Math.sqrt(lockedC2),
        photonC_D16: huskLightSpeed(16),
        splitStepRingDepths: splitStepHits,
      },
      notes: `L2 (the lazy root token is a STAND-IN; the condition and the whole-copy theorem are L1). Gates S1 ${s1}, S2 ${s2}, S3 ${s3}, S4 ${s4}, S5 ${s5}. FIRST RUN 2026-09-26 (tmp/sr-mtr23-run1.log, 6.7 s): PASS on every gate, no gate moved; the record run differs from it only in this sentence. The photon's top group velocity at D = 1 was larger than the design probe had seen on the axis and body diagonal (1.03 to 1.05 of c there): over the 13 directions it reaches 1.11 docks per beat, faster than the stream copies, because kappa lambda approaches the leapfrog's edge 4 at kappa = 2/3. HUSK FIRST: c = sqrt(4 / (3 (2D + 1))) is ${[1, 2, 4, 16].map(D => `${huskLightSpeed(D).toFixed(5)} at D = ${D}`).join(', ')}; the token reads the same to ${s4Speed.toExponential(1)}. BULK: the token's speed along the depth is ${bulkDepth.map(x => x.toFixed(9)).join(', ')} of the husk c at D = 1, 4, 16 (the 24 roots have second moment 12 in all four directions). THE PHOTON'S OWN TOP GROUP VELOCITY (reported): ${photonMaxGroup
        .map(
          (v, i) =>
            `D ${i + 1} ${(v / huskLightSpeed(i + 1)).toFixed(4)} c`,
        )
        .slice(0, 6)
        .join(
          ', ',
        )}, ...: at D = 1 (kappa = 2/3) the leapfrog's short waves outrun its own long-wave c (seen in tmp/sr-probe1.ts before this file, disclosed), from D = 2 its top group velocity is its long-wave c; the token's is c at every D (${tokenMaxGroup
        .map((v, i) => (v / huskLightSpeed(i + 1)).toFixed(6))
        .slice(0, 4)
        .join(
          ', ',
        )}, ...). THE SPLIT-STEP ESCAPE: a whole-copy walk with a turning coin between half copies has massless slope |C_00|, and in the model's ring Z[omega][1/6] |C_00|^2 = 4 / (3 (2D + 1)) needs 2D + 1 a power of 3 (${splitStepHits} depths up to 100,000): not every D either. THE COIN'S RING: Q R has entries 2 - Q and 2 (or 1 + omega), so the rule lives in Z[omega][1/(6 (2D + 1))], the ring the light's force step already uses (its column DFT divides by 2D + 1). A coin-state start has no flat-band weight (Cayley-Hamilton witness ${flatWeight.toExponential(1)}): started in the column's zero-momentum state the token is all band. What is not here: spin. The copy direction is a root port, not the doublet (E-SPN-0066 says a covariant moving token is a spinor), so this settles the speed, not the electron; a doublet-locked lazy token is the next build.`,
    })
  },
})
