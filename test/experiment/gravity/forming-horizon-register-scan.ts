// Does the forming horizon's spectrum approach Planck at kappa / 2 pi as the register grows (E-GRV-0134, remaining-pieces
// "a coincidence worth testing")? E-GRV-0132 grew a headroom lump to r_h 12.5 at C 25 and read, by exact projection of
// out packets back to the flat vacuum, |beta / alpha|^2 falling as a power law omega^-1.46 whose Planck fit is 9.60 x
// kappa / 2 pi. It predicted this: a late ray's redshift grows at kappa only for ln(C) / 2 e-folds, ln(C) / (2 kappa)
// beats, which is x = ln(C) / (4 pi) of a thermal time 2 pi / kappa (x = 0.256 at C 25). HYPOTHESIS: the spectrum
// approaches Planck at kappa / 2 pi as x approaches 1, where the window reaches one thermal time.
//
// THE METHOD is E-GRV-0132's linear shadow, unchanged (code/measure/headroom-bogoliubov): the radial chain of the
// headroom light, its rooms C - floor(C M u(r) / CAP) read at M(t) = M_f min(1, t / t_g), out packets of the flat chain
// (frequency weight exp(-(omega - omega0)^2 / (2 sigma^2)), sigma = T / 2) placed in the zone the lump never touches at
// t_f = t_g + the final staircase's eikonal time from dock ceil(r_h) to r_c, run back to t = 0 where the ring is flat,
// and split there mode by mode. No sampling and no fit enters |beta / alpha|^2.
//
// THE SCAN, and how each size is set:
//  - r_h = C / 2 at every C, so k_1 = 1 and the register, not the dock, caps the redshift (E-GRV-0123: k_1 = 1 needs C
//    <= 2 r_h + 1). The headroom medium takes an odd register, so C runs 13, 17, 25, 35, 49 (x = 0.204 .. 0.310).
//  - THE GROWTH RATE IN UNITS OF KAPPA: t_g kappa is held at E-GRV-0132's 16384 x 9.1375e-3 = 149.7, so t_g = 16384
//    kappa(25) / kappa(C) (tmp/hawk2-probe1: 8428, 11089, 16384, 22689 at C 13 .. 35), and dM/dt = M_f / t_g: the
//    formation takes the same number of 1 / kappa at every size; M_f = CAP / u(r_h) is each size's own.
//  - THE BAND IN UNITS OF T: omega0 = 4, 7, 10, 13 T at every size (a subset of E-GRV-0132's seven, all below omega_C =
//    15.4 .. 15.6 T); at C 25 all seven (4, 5.5, .. 13 T) run, to reproduce E-GRV-0132.
//  - THE PACKET'S PLACE: r_c = the flat radius + 7 widths (width c0 / sigma, 163 docks at C 13 up to about 615 at C 49), where the 4 T packet's
//    tail in the zone is 3.3e-23 of its weight (tmp/hawk2-probe1: 1.0e-17 at 6 widths, 3.3e-23 at 7, a floor of 7e-24
//    beyond), not E-GRV-0132's 9.1 widths: in the flat zone the chain is exactly the flat chain, so the place only sets
//    the tail. THE RING: the least power of 2 holding the packet and its trailing tail clear of the zone (r_c + 7 widths
//    + the flat radius) and the leading tail at t = 0 clear of it through the wrap (c0 t_g + 7 widths + the flat
//    radius): L 4096, 8192, 8192, 16384, 16384 (E-GRV-0132 used 16384 at C 25; here 8192).
//  - SCALED DOWN, and said so: C 100 (L 32768, 1.3e5 beats) and C 200 do not fit the budget of about 40 minutes
//    (tmp/hawk2-probe1: 1.2 us a dock-beat at 14 columns, 0.46 at 4, on this machine), so the largest is 49.
//
// GATES, fixed before the first run of this file (tmp/hawk2-probe1 sized the rings, the packets and the cost; it read
// no Bogoliubov coefficient):
//  H1 the 4-point Planck fit's T / (kappa / 2 pi) falls strictly at every step 13 -> 17 -> 25 -> 35 -> 49.
//  H2 the power-law exponent p of ln |beta / alpha|^2 on ln omega (4 points) steepens strictly at every step (p more
//     negative), OR the Planck fit's rms falls strictly at every step. Both are reported.
//  H3 THE EXTRAPOLATION, declared here: least squares of ln(T_fit / (kappa / 2 pi)) = a + b x over the five sizes, x =
//     ln(C) / (4 pi), read at x = 1: exp(a + b) within 30 percent of 1. (Reported only: the same line in T_fit / T
//     itself, and the x where the log line reaches 0.)
//  R1 C 25 reproduces E-GRV-0132: the 7-point Planck fit's T / (kappa / 2 pi) within 1 percent of its 9.596, and each
//     of the seven |beta / alpha|^2 within 1 percent of its recorded value (tmp/hawk-run1.log).
//  S1 the static final lump (t_f + 6144 r_h / 12.5 beats back, the 4 T packet) at C 13, 25, 49: |beta / alpha|^2 <=
//     1e-20, the design floor set by the 7-width tail (3e-23) with three decades of room.
//  K2 KG conservation on every packet: |N+ - N- - 1| <= 1e-9.
// The Planck fit searches 0.3 .. 30 T; a minimum at either end is a bound, not a value, and fails H1, H3 and R1.
// Verdict: pass if H1, H2, H3, R1, S1 and K2 all hold; fail otherwise.
// REPORTED: per size the four ratios, the negative part's blueshift, the dock changes, the fits; at C 25 the 7-point
// fits; the out packets' tail in the zone; the static packet's weight left in the zone.
//
// FIRST RUN (tmp/hawk2-run1.log, the record, 4089 s, 1.7 GB peak; the cost ran 1.7 x the probe's estimate, so the scan
// went over its 40-minute budget and was let finish): FAIL on H1, H2 and H3; no gate moved.
//  - THE SPECTRUM DOES NOT MOVE. Planck T / (kappa / 2 pi) at C 13, 17, 25, 35, 49: 10.37, 10.30, 9.59, 7.78, 10.27 (rms
//    0.023, 0.022, 0.028, 0.018, 0.036). Power-law exponents -1.419, -1.421, -1.458, -1.572, -1.428. C 35 is the one
//    point that leans the predicted way, and C 49 undoes it. Over x = 0.204 .. 0.310 the spectrum's SHAPE is the same
//    within that scatter.
//  - H3: ln(T_fit / T) = 2.551 - 1.129 x (R^2 0.16) reads 4.15 at x = 1; the plain line reads 2.04; the log line would
//    reach 1 only at x 2.26. The fit is weak and the extrapolation is from a third of the way, so this says the trend
//    is not seen here, not that it is absent at x near 1.
//  - WHAT DOES MOVE is the size: |beta / alpha|^2 at 4 T is 1.64e-2, 2.31e-2, 3.63e-2, 4.71e-2, 5.39e-2 as the dock
//    changes grow 710, 1296, 3016, 6312, 13172, and the negative part's blueshift at 4 T rises 3.99 .. 5.00, far under
//    the C the register allows. More quenches, the same spectrum: E-GRV-0132's reading (the quench, not the horizon)
//    holds across the scan.
//  - R1 holds: C 25 on a ring of 8192 and r_c 2536 gives the 7-point fit 9.589 against E-GRV-0132's 9.596, every ratio
//    within 6.9e-4 of the record. S1 holds: the static lump reads 2.5e-25, 2.5e-24, 2.4e-22 (C 49: 1.4e-17 of the
//    packet still in the zone at t_0). K2 holds to 8e-14. Out packets' tail in the zone 2e-23 .. 2.4e-21.
//
// Depth L2: a known construction (Bogoliubov coefficients of a time-dependent linear medium) on E-GRV-0122's exact light
// over a background placed from the rule's linear statics; the room coupling and the growth law are placed by hand, and
// the numbers are the rule's linear shadow (E-GRV-0132: at amplitude 0.1 and R 125 the integer rule is not in that
// limit). DETERMINISM: every start and source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lapseLinks, openMesh } from '@/code/rule/open-husk'
import { stackModes } from '@/code/measure/open-husk'
import { linearFit } from '@/code/measure/regression'
import {
  boxFreeExcess,
  unitProfile,
} from '@/code/measure/horizon-temperature'
import {
  profileKappa,
  roomSpeed,
  stairTime,
} from '@/code/measure/headroom-horizon'
import {
  chainBeatBack,
  flatModes,
  kgNorm,
  makeBatch,
  makeUniformChain,
  outPacket,
  setChainRooms,
  splitFlat,
  weightShare,
  type Split,
} from '@/code/measure/headroom-bogoliubov'
import { planckFit, powerLaw } from '@/code/measure/bogoliubov-spectrum'

const D0 = 2
const CAP = 1.5
const SIDE = 64
const SIZES: readonly number[] = [13, 17, 25, 35, 49]
const STATIC: readonly number[] = [13, 25, 49]
const REFERENCE_C = 25
const REFERENCE_RH = 12.5
const REFERENCE_TG = 16384
const CONTROL_EXTRA = 6144
const MARGIN = 7
const SIGMA_T = 0.5
const BAND: readonly number[] = [4, 7, 10, 13]
const BAND7: readonly number[] = [4, 5.5, 7, 8.5, 10, 11.5, 13]
const CONTROL: readonly number[] = [4]
// E-GRV-0132's recorded run (tmp/hawk-run1.log): the seven ratios at BAND7 and the Planck fit's T / (kappa / 2 pi)
const E0132_RATIOS: readonly number[] = [
  3.6259633186510425e-2, 2.340534787872972e-2, 1.6507356493299305e-2,
  1.2445648754580402e-2, 9.636180884919424e-3, 7.815572003964093e-3,
  6.508755411014019e-3,
]
const E0132_PLANCK = 9.596341958490175
const H3_TOLERANCE = 0.3
const R1_TOLERANCE = 0.01
const S1_BOUND = 1e-20
const K2_BOUND = 1e-9
// the Planck fit searches T over a decade each side of 3 T (0.3 .. 30 T); a minimum at either end is a bound, and fails
// the gates that read it
const PLANCK_GUESS = 3

type Column = {
  omega: number
  split: Split
  ratio: number
  conservation: number
}
type Size = {
  C: number
  rh: number
  x: number
  L: number
  tg: number
  tf: number
  rc: number
  flatFrom: number
  T: number
  kappa: number
  quenches: number
  cols: Column[]
  outTail: number
  outNorm: number
  planck: { temperature: number; residual: number; edge: boolean }
  power: { exponent: number; residual: number }
  staticRatio: number
  staticLeft: number
  staticConservation: number
}

const pow2AtLeast = (n: number): number => 2 ** Math.ceil(Math.log2(n))

export default experiment({
  id: 'gravity/forming-horizon-register-scan',
  code: 'E-GRV-0134',
  title:
    "a forming headroom horizon's spectrum does not move toward Planck as the register grows, fail on H1, H2 and H3: lumps grown to r_h = C / 2 at t_g kappa 149.7 (E-GRV-0132's rate) at C 13, 17, 25, 35, 49 (ln C / 4 pi 0.204 .. 0.310) give Planck fits of T 10.37, 10.30, 9.59, 7.78, 10.27 x kappa / 2 pi (rms 0.018 .. 0.036) and power laws omega^-1.42, -1.42, -1.46, -1.57, -1.43: flat within the scatter, not falling; ln(T_fit / T) on ln C / 4 pi (R^2 0.16) extrapolates to 4.15 at 1; |beta / alpha|^2 at 4 T rises 1.6e-2 .. 5.4e-2 with the dock changes (710 .. 13172); C 25 reproduces E-GRV-0132 (7-point fit 9.589 against 9.596, every ratio within 0.07 percent) on a ring half the size; the static lump reads 2.5e-25 .. 2.4e-22; KG conserved to 8e-14; C 100 and 200 did not fit the budget",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const lines: string[] = []

    const mesh = lapseLinks(openMesh(SIDE, 1, 'shrink'))
    const sm = stackModes(mesh.sides, 'lapse_upper')
    const profile = unitProfile(boxFreeExcess(mesh, sm), sm)
    const c0 = roomSpeed(D0)
    const kappaRef = profileKappa(profile, REFERENCE_RH, c0).kappa
    const unit = (r: number): number =>
      profile.at(Math.max(r, profile.first))
    const sizes: Size[] = []

    let ref7:
      | {
          planck: number
          residual: number
          ratios: number[]
          edge: boolean
        }
      | undefined

    for (const C of SIZES) {
      const rh = C / 2
      const mFinal = CAP / profile.at(rh)
      const pk = profileKappa(profile, rh, c0)
      const T = pk.kappa / (2 * Math.PI)
      const tg = Math.round((REFERENCE_TG * kappaRef) / pk.kappa)

      const roomAt = (m: number, r: number): number => {
        const e = m * unit(r)

        return e >= CAP ? 0 : C - Math.floor((C * e) / CAP)
      }

      const finalRoom = (r: number): number => roomAt(mFinal, r)

      let flatFrom = Math.ceil(rh)

      for (let r = Math.ceil(rh); r < 200000; r++) {
        if (finalRoom(r) < C) {
          flatFrom = r + 1
        }
      }

      const width = c0 / (SIGMA_T * T)
      const rc = Math.round(flatFrom + MARGIN * width)
      const inner = Math.ceil(rh)
      const tf = tg + Math.round(stairTime(finalRoom, C, c0, inner, rc))
      const L = pow2AtLeast(
        Math.max(
          rc + MARGIN * width + flatFrom,
          c0 * tg + MARGIN * width + flatFrom,
        ),
      )
      const massAt = (t: number): number => mFinal * Math.min(1, t / tg)

      log(
        `C ${C}: r_h ${rh} M ${mFinal.toFixed(2)} kappa ${pk.kappa.toExponential(4)} T ${T.toExponential(4)} t_g ${tg} flat ${flatFrom} r_c ${rc} t_f ${tf} L ${L}`,
      )

      const xc = L / 2
      const dist = (x: number): number =>
        Math.min(Math.abs(x - xc), L - Math.abs(x - xc))
      const chain = makeUniformChain(L, D0, C)
      const modes = flatModes(chain)
      const near: number[] = []

      for (let x = 0; x < L; x++) {
        if (dist(x) < flatFrom) {
          near.push(x)
        }
      }

      const nearUnit = near.map(x => unit(dist(x)))
      const rooms = new Int32Array(L).fill(C)

      const roomsAt = (t: number): boolean => {
        const m = massAt(t)

        let changed = false

        for (let i = 0; i < near.length; i++) {
          const x = near[i]!
          const e = m * nearUnit[i]!
          const k = e >= CAP ? 0 : C - Math.floor((C * e) / CAP)

          if (k !== rooms[x]) {
            rooms[x] = k
            changed = true
          }
        }

        return changed
      }

      const runBack = (
        b: ReturnType<typeof makeBatch>,
        grow: boolean,
        beats: number,
      ): number => {
        let quenches = 0

        if (!grow) {
          for (const x of near) {
            rooms[x] = finalRoom(dist(x))
          }

          setChainRooms(chain, x => rooms[x]!)
        }

        for (let t = beats; t >= 1; t--) {
          if (grow && roomsAt(t)) {
            quenches += setChainRooms(chain, x => rooms[x]!)
          }

          chainBeatBack(chain, b)

          if (t % 20000 === 0) {
            log(`  C ${C} back at ${t}`)
          }
        }

        rooms.fill(C)
        setChainRooms(chain, () => C)

        return quenches
      }

      const split = (
        b: ReturnType<typeof makeBatch>,
        omegas: readonly number[],
      ): Column[] =>
        omegas.map((omega, i) => {
          const s = splitFlat(chain, modes, b, 2 * i, 2 * i + 1)

          return {
            omega,
            split: s,
            ratio: s.negative / s.positive,
            conservation: Math.abs(s.positive - s.negative - 1),
          }
        })

      // THE GROWTH
      const band = C === REFERENCE_C ? BAND7 : BAND
      const omegas = band.map(w => w * T)
      const grow = makeBatch(chain, 2 * omegas.length)

      omegas.forEach((w, i) =>
        outPacket(
          chain,
          modes,
          grow,
          2 * i,
          2 * i + 1,
          w,
          SIGMA_T * T,
          xc + rc,
        ),
      )

      const outTail = Math.max(
        ...omegas.map((_, i) =>
          weightShare(
            chain,
            grow,
            2 * i,
            2 * i + 1,
            x => dist(x) < flatFrom,
          ),
        ),
      )
      const outNorm = Math.max(
        ...omegas.map((_, i) =>
          Math.abs(kgNorm(chain, grow, 2 * i, 2 * i + 1) - 1),
        ),
      )
      const quenches = runBack(grow, true, tf)
      const all = split(grow, omegas)
      const cols = all.filter(c =>
        BAND.some(w => Math.abs(c.omega - w * T) < 1e-12 * T),
      )
      const planck = planckFit(
        cols.map(c => c.omega),
        cols.map(c => c.ratio),
        PLANCK_GUESS * T,
      )
      const power = powerLaw(
        cols.map(c => c.omega),
        cols.map(c => c.ratio),
      )

      if (C === REFERENCE_C) {
        const f7 = planckFit(
          all.map(c => c.omega),
          all.map(c => c.ratio),
          PLANCK_GUESS * T,
        )

        ref7 = {
          planck: f7.temperature / T,
          residual: f7.residual,
          ratios: all.map(c => c.ratio),
          edge: f7.edge,
        }
      }

      log(
        `C ${C} growth: ${quenches} dock changes, ratios ${cols.map(c => c.ratio.toExponential(3)).join(' ')}, Planck ${(planck.temperature / T).toFixed(3)} rms ${planck.residual.toFixed(3)}, p ${power.exponent.toFixed(3)}`,
      )

      // THE STATIC CONTROL
      let staticRatio = NaN
      let staticLeft = NaN
      let staticConservation = NaN

      if (STATIC.includes(C)) {
        const cw = CONTROL.map(w => w * T)
        const still = makeBatch(chain, 2 * cw.length)

        cw.forEach((w, i) =>
          outPacket(
            chain,
            modes,
            still,
            2 * i,
            2 * i + 1,
            w,
            SIGMA_T * T,
            xc + rc,
          ),
        )

        runBack(
          still,
          false,
          tf + Math.round((CONTROL_EXTRA * rh) / REFERENCE_RH),
        )

        staticLeft = Math.max(
          ...cw.map((_, i) =>
            weightShare(
              chain,
              still,
              2 * i,
              2 * i + 1,
              x => dist(x) < flatFrom,
            ),
          ),
        )

        const sc = split(still, cw)

        staticRatio = Math.max(...sc.map(c => c.ratio))
        staticConservation = Math.max(...sc.map(c => c.conservation))
        log(
          `C ${C} static: ${staticRatio.toExponential(3)}, left in the zone ${staticLeft.toExponential(2)}`,
        )
      }

      sizes.push({
        C,
        rh,
        x: Math.log(C) / (4 * Math.PI),
        L,
        tg,
        tf,
        rc,
        flatFrom,
        T,
        kappa: pk.kappa,
        quenches,
        cols: all,
        outTail,
        outNorm,
        planck: {
          temperature: planck.temperature / T,
          residual: planck.residual,
          edge: planck.edge,
        },
        power,
        staticRatio,
        staticLeft,
        staticConservation,
      })
    }

    // THE GATES
    const steps = sizes.slice(1).map((s, i) => [sizes[i]!, s] as const)
    const noEdge = sizes.every(s => !s.planck.edge)
    const h1 =
      noEdge &&
      steps.every(
        ([a, b]) => b.planck.temperature < a.planck.temperature,
      )
    const steeper = steps.every(
      ([a, b]) => b.power.exponent < a.power.exponent,
    )
    const tighter = steps.every(
      ([a, b]) => b.planck.residual < a.planck.residual,
    )
    const h2 = steeper || tighter
    const logLine = linearFit({
      xs: sizes.map(s => s.x),
      ys: sizes.map(s => Math.log(s.planck.temperature)),
    })
    const atOne = Math.exp(logLine.intercept + logLine.slope)
    const h3 = noEdge && Math.abs(atOne - 1) <= H3_TOLERANCE
    const plainLine = linearFit({
      xs: sizes.map(s => s.x),
      ys: sizes.map(s => s.planck.temperature),
    })
    const plainAtOne = plainLine.intercept + plainLine.slope
    const logZero = -logLine.intercept / logLine.slope
    const r1 =
      ref7 !== undefined &&
      !ref7.edge &&
      Math.abs(ref7.planck / E0132_PLANCK - 1) <= R1_TOLERANCE &&
      ref7.ratios.every(
        (r, i) => Math.abs(r / E0132_RATIOS[i]! - 1) <= R1_TOLERANCE,
      )
    const statics = sizes.filter(s => STATIC.includes(s.C))
    const s1 =
      statics.length === STATIC.length &&
      statics.every(s => s.staticRatio <= S1_BOUND)
    const k2 =
      sizes.every(s => s.cols.every(c => c.conservation <= K2_BOUND)) &&
      statics.every(s => s.staticConservation <= K2_BOUND)
    const status = h1 && h2 && h3 && r1 && s1 && k2 ? 'pass' : 'fail'

    // REPORTED
    for (const s of sizes) {
      const key = `C${s.C}`

      metrics[`${key}_x`] = s.x
      metrics[`${key}_L`] = s.L
      metrics[`${key}_tg`] = s.tg
      metrics[`${key}_tf`] = s.tf
      metrics[`${key}_rc`] = s.rc
      metrics[`${key}_flatFrom`] = s.flatFrom
      metrics[`${key}_kappa`] = s.kappa
      metrics[`${key}_T`] = s.T
      metrics[`${key}_quenches`] = s.quenches
      metrics[`${key}_planckTOverT`] = s.planck.temperature
      metrics[`${key}_planckResidual`] = s.planck.residual
      metrics[`${key}_planckAtEdge`] = s.planck.edge ? 1 : 0
      metrics[`${key}_exponent`] = s.power.exponent
      metrics[`${key}_powerResidual`] = s.power.residual
      metrics[`${key}_outTail`] = s.outTail
      metrics[`${key}_outNormError`] = s.outNorm

      for (const c of s.cols) {
        const w = `${key}_w${(c.omega / s.T).toFixed(2)}`

        metrics[`${w}_ratio`] = c.ratio
        metrics[`${w}_blueshift`] = c.split.negativeMeanOmega / c.omega
        metrics[`${w}_conservation`] = c.conservation
      }

      if (STATIC.includes(s.C)) {
        metrics[`${key}_staticRatio`] = s.staticRatio
        metrics[`${key}_staticLeftInZone`] = s.staticLeft
        metrics[`${key}_staticConservation`] = s.staticConservation
      }

      lines.push(
        `C ${s.C} (x ${s.x.toFixed(3)}, r_h ${s.rh}, L ${s.L}, t_g ${s.tg}, ${s.quenches} dock changes): |beta/alpha|^2 ${s.cols
          .filter(c =>
            BAND.some(w => Math.abs(c.omega - w * s.T) < 1e-12 * s.T),
          )
          .map(
            c =>
              `${(c.omega / s.T).toFixed(0)} T ${c.ratio.toExponential(3)} (blueshift ${(c.split.negativeMeanOmega / c.omega).toFixed(2)})`,
          )
          .join(
            ', ',
          )}; Planck T ${s.planck.temperature.toFixed(3)} x kappa / 2 pi rms ${s.planck.residual.toFixed(3)}; power law ${s.power.exponent.toFixed(3)} rms ${s.power.residual.toFixed(3)}${STATIC.includes(s.C) ? `; static ${s.staticRatio.toExponential(2)}, left in the zone ${s.staticLeft.toExponential(2)}` : ''}`,
      )
    }

    metrics.gate_H1 = h1 ? 1 : 0
    metrics.gate_H2 = h2 ? 1 : 0
    metrics.gate_H2_steeper = steeper ? 1 : 0
    metrics.gate_H2_tighter = tighter ? 1 : 0
    metrics.gate_H3 = h3 ? 1 : 0
    metrics.control_R1 = r1 ? 1 : 0
    metrics.control_S1 = s1 ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.h3_logIntercept = logLine.intercept
    metrics.h3_logSlope = logLine.slope
    metrics.h3_logR2 = logLine.r2
    metrics.h3_atOne = atOne
    metrics.h3_plainAtOne = plainAtOne
    metrics.h3_logZeroAt = logZero
    metrics.r1_planck7 = ref7?.planck ?? NaN
    metrics.r1_residual7 = ref7?.residual ?? NaN
    metrics.r1_worstRatio = ref7
      ? Math.max(
          ...ref7.ratios.map((r, i) =>
            Math.abs(r / E0132_RATIOS[i]! - 1),
          ),
        )
      : NaN
    metrics.seconds = (Date.now() - started) / 1000

    const table = sizes
      .map(s => `${s.C}: ${s.planck.temperature.toFixed(2)}`)
      .join(', ')

    return verdict({
      status,
      claim: `a lump grown to r_h = C / 2 at t_g kappa = ${(REFERENCE_TG * kappaRef).toFixed(1)}, out packets at ${BAND.join(', ')} T back to the flat vacuum: Planck T / (kappa / 2 pi) by C ${table}; power-law exponent ${sizes.map(s => s.power.exponent.toFixed(2)).join(', ')}; ln(T_fit / T) on ln C / 4 pi reaches ${atOne.toFixed(2)} at 1; C 25's 7-point fit ${ref7?.planck.toFixed(3)} against E-GRV-0132's ${E0132_PLANCK.toFixed(3)}; static lump ${statics.map(s => s.staticRatio.toExponential(1)).join(', ')}`,
      metrics,
      control: {
        r1Planck7: ref7?.planck ?? NaN,
        staticWorst: Math.max(...statics.map(s => s.staticRatio)),
      },
      notes: `L2. H1 ${h1}, H2 ${h2} (steeper ${steeper}, rms falling ${tighter}), H3 ${h3} (log line ${logLine.intercept.toFixed(3)} + ${logLine.slope.toFixed(3)} x, R^2 ${logLine.r2.toFixed(4)}, ${atOne.toFixed(3)} at x = 1; the plain line gives ${plainAtOne.toFixed(3)}; the log line reaches 1 at x ${logZero.toFixed(3)}), R1 ${r1}, S1 ${s1}, K2 ${k2}. ${lines.join('. ')}.`,
    })
  },
})
