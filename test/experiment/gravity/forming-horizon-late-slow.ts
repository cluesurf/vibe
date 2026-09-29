// Is there a horizon part under the quench (E-GRV-0136, after E-GRV-0132 and 0134)? E-GRV-0134 found a forming headroom
// horizon's spectrum a power law near omega^-1.43 at every C from 13 to 49, its Planck fit about 10 x kappa / 2 pi, and
// its size growing with the number of dock changes: the growth's own quench, each room change a sudden step. The
// HYPOTHESIS under test: Hawking's spectrum comes from the steady exponential redshift of a horizon that already exists,
// independent of how it formed, so (a) out packets read LATE, many 1 / kappa after the horizon settles, and (b) SLOWER
// growth should both strip the quench and leave the horizon's own part.
//
// THE METHOD is E-GRV-0132's linear shadow (code/measure/headroom-bogoliubov) at C 25, r_h 12.5: rooms C - floor(C M
// u(r) / CAP) read at M(t) = M_f min(1, t / t_g), out packets of the flat chain (sigma = T / 2) run back through the
// history and split into positive and negative frequency of the flat chain by exact projection. Two changes, both
// forced by the cost of t_g x 16 and both checked:
//  - EACH PACKET'S DELAY. A packet whose center leaves the room-1 dock (13) at t_g + Delta is placed, at the batch's
//    readout time t_s = t_g + Delta_max + stair(13 -> r_c), at r_c + c0 (Delta_max - Delta): in the flat zone the
//    eikonal time is exactly 1 / c0 a dock, so every delay of a batch runs back in one pass. r_c = the flat radius + 7
//    packet widths, as E-GRV-0134.
//  - THE SPLIT AT t_*, NOT AT t = 0. The rooms beyond the flat radius never change, so once the reflected packet has left
//    the zone the rest of the history (back to t = 0) moves it through flat chain only, which keeps every mode's alpha and
//    beta. The run stops at t_* = t_g - stair(13 -> r_c) - 2048, then goes on back in steps of 1024 (at most 4) until
//    every column's weight in the zone is <= 1e-20, and splits there. What is still in the zone is misread by the flat
//    split: it is split on its own, Z = its N+ + N-, and (2 sqrt(N- Z) + Z) / N- bounds the relative error of N- (K3).
//    tmp/hawk3-probe1 (weights only): at x 16 the 4 T packet leaves 2.5e-9 of its weight in the slow docks at t_*, and
//    it does not drain in 2048 more beats, so the split time cannot make it vanish and the bound is what is gated. The
//    ring then needs to hold only the packets' own run (L 8192), not c0 t_g (65536 at x 16).
//
// DERIVED BEFORE ANY RUN (tmp/hawk3-probe1 sized it and read no Bogoliubov coefficient). kappa 9.1375e-3 (1 / kappa 109
// beats), T 1.4543e-3; the flat radius 313, the packet width c0 / sigma 318 docks, r_c 2536, stair(13 -> 313) 1668
// beats, stair(13 -> r_c) 11294 beats; the final rooms 0 (dock <= 12), 1, 3, 5, 6, 7 ..; dock 12 reaches room 0, the
// wall, at 0.960 t_g.
//  1. THERE IS NO HORIZON PART AT LATE TIME IN THIS MEDIUM. The final lump is a static linear medium: a room-0 dock
//     stops its links, so dock 12 is a reflecting wall, and the redshift in front of it is capped at ln z = ln(C) / 2
//     (E-GRV-0123). A static medium keeps every frequency, so |beta| = 0 for any out packet whose run back never meets
//     a changing room (E-GRV-0134's static lump: 2.5e-24). Hawking's late flux needs the run back to reach the formation
//     at every delay, which needs a redshift e^(kappa Delta) without bound; capped at C^(1/2) it stops after ln(C) / (2
//     kappa) = 176 beats. So a packet leaving Delta late meets the growth only through the part of its time envelope
//     (amplitude e^(-sigma^2 tau^2 / 2)) that is still in the zone before t_g. At Delta = 48 / kappa = 5253 beats the
//     center enters the zone at t_g + 5253 - 1668 = t_g + 3585 = t_g + 2.61 / sigma, and the weight earlier than that
//     is erfc(2.61) / 2 = 1.1e-4. PREDICTED: |beta / alpha|^2 at 48 / kappa is about 1e-4 of its value at Delta = 0,
//     at every t_g and frequency. Hawking's hypothesis predicts a horizon part the same at both delays.
//  2. THE QUENCH PART FALLS WITH t_g AS t_g^-1 TO t_g^-2. Each dock's rate is a staircase in time: a ramp at rate
//     1 / t_g plus a sawtooth of one room a step, the steps at dock r periodic at t_g u(r_h) / (C u(r)) (655 beats at
//     dock 13 at x 1). The ramp is smooth on the scale 1 / omega and makes pairs only through its kinks, beta ~ rate,
//     |beta|^2 ~ t_g^-2. Each sudden step makes pairs with a beta independent of t_g, and steps a period 2 pi / omega
//     or more apart add in power; the packet meets the zone for a fixed time (the center's dwell is 2 x 1668 beats,
//     its envelope 1 / sigma = 1375), so the steps it meets number ~ 1 / t_g, |beta|^2 ~ t_g^-1. The quench part
//     falls between t_g^-1 and t_g^-2, never flattens to a constant. Hawking's hypothesis predicts a floor that does
//     not fall with t_g.
//  3. THE WINDOW IS TOO SHORT TO HOLD A THERMAL PART, AT EVERY t_g. The exponential redshift lasts ln(C) / (2 kappa)
//     = 176 beats; a mode omega can stand on the room-1 dock only below omega_C = 15.56 T (E-GRV-0132). The window holds
//     ln(C) omega / (8 pi^2 T) of the mode's period: 0.530 at 13 T and 0.634 at omega_C. No mode below omega_C sees
//     one whole period of exponential redshift, so no thermal factor e^(-omega / T) can form; that needs ln C >= 8 pi^2
//     T / omega_C, C >= 160 at C = 2 r_h. PREDICTED: the Planck fit at the slowest growth and latest readout is not
//     within 50 percent of kappa / 2 pi, and A2 holds only on its bound.
//
// THE GRID (3 growth times x 2 delays, one cell dropped for cost): t_g = 16384 (E-GRV-0132's), 65536 and 262144, the
// band 4, 7, 10, 13 T; Delta = 0 at all three, Delta = 48 / kappa at x 1 and x 16. The cost (tmp/hawk3-probe1): 19.8 ms a
// chain beat at 16 columns on L 8192, 3.2 ms a replica beat, so the x 4 late cell and the replica through all of x 16
// (5.3e5 beats, 29 minutes) do not fit the budget of about 40 minutes.
//
// GATES, fixed before the first run of this file:
//  A1 at Delta = 0, at every band frequency, |beta / alpha|^2 falls strictly x 1 -> x 4 -> x 16, and the least-squares
//     slope of ln |beta / alpha|^2 on ln t_g over the three lies in [-2.2, -0.8] (derivation 2, with 0.2 each side for
//     the grain of the few steps a packet meets at x 16).
//  A2 at x 16 and Delta = 48 / kappa, the 4-point Planck fit's T / (kappa / 2 pi) within 50 percent of 1 (not at the
//     search's edge), OR the window bound of derivation 3 holds (the window holds under one period at omega_C, computed
//     from the flat modes' omega_C and kappa). Both halves are reported; the bound is predicted to be why it holds.
//  D1 at x 1 and x 16, at every band frequency, |beta / alpha|^2 at 48 / kappa is <= 1e-2 of its value at Delta = 0
//     (derivation 1 predicts 1e-4; a horizon part the same at both delays fails it).
//  A3 the INTEGER rule on a 128 x 2 x 2 replica (lump at 64, plane packet amp 0.1 at r 30) forward and back bit for
//     bit with 0 Gauss violations, through the whole x 1 schedule (t 0 .. t_g + 2048, as E-GRV-0132 P3) and through the
//     last 8192 beats of the x 16 schedule and 2048 after (its wall forms 10486 beats before t_g).
//  R1 x 1, Delta = 0 reproduces E-GRV-0132: each of the four ratios within 1 percent of its record (tmp/hawk-run1.log),
//     and the 4-point Planck fit within 1 percent of the same fit on the four recorded ratios (reported: against 9.596,
//     E-GRV-0132's 7-point fit).
//  S1 the static final lump (the 4 T packet at r_c, run back t_f + 6144 beats as E-GRV-0134): |beta / alpha|^2 <= 1e-20.
//  K2 KG conservation on every packet: |N+ - N- - 1| <= 1e-9.
//  K3 the early split: every column's error bound (2 sqrt(N- Z) + Z) / N- <= 0.05, well under the factors A1 and D1 read.
// Verdict: pass if A1, A2, D1, A3, R1, S1, K2 and K3 all hold; fail otherwise.
// REPORTED: every cell's four ratios and their blueshifts, Planck fits and power laws; the dock changes each run met;
// the split time and the zone weight there; A2's two halves; the delay ratios; the t_g slopes.
//
// FIRST RUN (tmp/hawk3-run1.log, the record, 1858 s, 0.94 GB peak): FAIL on K3 alone; no gate moved.
//  - NO LATE PART (D1 holds, far past the derivation). Read 48 / kappa late, |beta / alpha|^2 is 6.0e-8, 8.7e-8, 6.8e-8,
//    1.8e-7 of the prompt value at x 1 (4, 7, 10, 13 T) and 6.4e-8, 6.9e-8, 1.9e-8, 8.0e-8 at x 16: 1e-10 .. 2e-9 in
//    absolute terms. Derivation 1 said about 1e-4; the fall is three orders deeper, so the envelope estimate is an upper
//    bound, not the value. A horizon part the same at both delays is absent at both growth rates.
//  - SLOWER GROWTH STRIPS THE QUENCH, BUT NOT AS ONE POWER (A1 holds, one slope on the edge). At Delta = 0 and 4 T:
//    3.63e-2, 3.05e-3, 1.89e-3 at x 1, 4, 16; 13 T: 6.51e-3, 1.09e-3, 7.0e-4. Slopes on ln t_g -1.065, -1.014, -0.922,
//    -0.805 (13 T is 0.005 inside the gate's -0.8; K3's error bound could carry it either side, so A1 at 13 T is a knife
//    edge). The two steps differ: x 1 -> x 4 falls 12 times at 4 T (step slope -1.79), x 4 -> x 16 only 1.6 times (-0.34).
//    The ratio tracks the dock changes the run met, 1267 -> 783 (1.6 times) for the second step (x 1's 3016 counts the
//    whole growth, since its split reached t = 0). What sets the x 16 floor is not found here.
//  - AWAY FROM PLANCK, NOT TOWARD IT (A2 holds on its bound only). The power law flattens from -1.457 (x 1) to -0.892
//    (x 4) and -0.873 (x 16); every Planck fit but x 1's sits at the search's 30 T edge (rms 0.13 .. 0.63), x 1 reads
//    9.604 (R1). The window holds 0.634 of a period at omega_C = 15.56 T, the bound derived.
//  - K3 FAILS: the split error bound (2 sqrt(N- Z) + Z) / N- reaches 0.153 (x 16, 48 / kappa, 10 T; 0.069 at x 1, 13 T,
//    whose split is at t = 0 where the ring is flat and the split exact). The bound is loose: R1 reproduces
//    E-GRV-0132's four ratios to 2.8e-4 against a bound of 0.017 .. 0.069 there. It does not reach D1 (factors of 1e7)
//    and moves A1's slopes by at most ln(1.153) / ln 16 = 0.05.
//  - R1 holds (4-point fit 9.604 against the record's 9.598, every ratio within 2.8e-4); S1 holds (2.5e-24, as
//    E-GRV-0134); A3 holds (x 1: 1002 room changes, x 16's end: 14, both bit for bit, 0 Gauss violations, 0 wraps); K2
//    holds (9e-14). Zone weight at the split 3.6e-7, 9.0e-8, 2.0e-8; out packets' tail in the zone 2.5e-22.
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
  smoothPacket,
  stairTime,
} from '@/code/measure/headroom-horizon'
import {
  gaussViolations,
  noWraps,
} from '@/code/measure/varying-depth-light'
import {
  copySpan,
  makeHeadroomSpanMedium,
  makeSpanScratch,
  sameSpan,
  spanBeat,
  spanBeatBack,
} from '@/code/rule/depth-span-light'
import {
  chainBeatBack,
  flatModes,
  kgNorm,
  makeBatch,
  makeUniformChain,
  outPacket,
  setChainRooms,
  setMediumRooms,
  splitFlat,
  weightShare,
  type ChainBatch,
  type Split,
} from '@/code/measure/headroom-bogoliubov'
import {
  planckFit,
  powerLaw,
  type PlanckFit,
} from '@/code/measure/bogoliubov-spectrum'

const D0 = 2
const CAP = 1.5
const C = 25
const RH = 12.5
const SIDE = 64
const L = 8192
const TG = 16384
const FACTORS: readonly number[] = [1, 4, 16]
const LATE = 48
// the delays (in 1 / kappa) run at each growth factor
const DELAYS: ReadonlyMap<number, readonly number[]> = new Map([
  [1, [0, LATE]],
  [4, [0]],
  [16, [0, LATE]],
])
const MARGIN = 7
const SIGMA_T = 0.5
const BAND: readonly number[] = [4, 7, 10, 13]
const STOP_EXTRA = 2048
const CHUNK = 1024
const MAX_CHUNKS = 4
const ZONE_STOP = 1e-20
const CONTROL_EXTRA = 6144
// E-GRV-0132's recorded ratios at 4, 7, 10, 13 T (tmp/hawk-run1.log) and its 7-point Planck fit
const E0132_RATIOS: readonly number[] = [
  3.6259633186510425e-2, 1.6507356493299305e-2, 9.636180884919424e-3,
  6.508755411014019e-3,
]
const E0132_PLANCK7 = 9.596341958490175
const PLANCK_GUESS = 3
const A1_SLOPE: readonly [number, number] = [-2.2, -0.8]
const A2_TOLERANCE = 0.5
const D1_BOUND = 1e-2
const R1_TOLERANCE = 0.01
const S1_BOUND = 1e-20
const K2_BOUND = 1e-9
const K3_BOUND = 0.05
const REPLICA = 128
const REPLICA_TAIL = 2048
const REPLICA_LEAD = 8192
const REPLICA_AMP = 0.1
const REPLICA_AT = 30
const REPLICA_WIDTH = 16
const LEVELS = 3

// error: the bound (2 sqrt(N- Z) + Z) / N- on the relative error of N- from the zone's share Z at the split
type Column = {
  omega: number
  split: Split
  ratio: number
  conservation: number
  error: number
}
type Cell = {
  factor: number
  delay: number
  cols: Column[]
  planck: PlanckFit
  power: { exponent: number; residual: number }
}
type Run = {
  factor: number
  tg: number
  start: number
  split: number
  beats: number
  quenches: number
  zone: number
}

export default experiment({
  id: 'gravity/forming-horizon-late-slow',
  code: 'E-GRV-0136',
  title:
    "a forming headroom horizon has no late part and no thermal part, and slower growth strips the quench, fail on K3 (the early split's error bound): at C 25, out packets at 4 .. 13 T read 48 / kappa after the lump settles give |beta / alpha|^2 1.9e-8 .. 1.8e-7 of the prompt value at t_g x 1 and x 16 (derived: about 1e-4, from the packet's envelope; a Hawking part would give 1), because the capped redshift makes the settled lump a static reflecting wall; growing 4 and 16 times slower drops the prompt 4 T value 3.63e-2, 3.05e-3, 1.89e-3 (slopes on ln t_g -1.06 .. -0.80, the 13 T one on the gate's edge), tracking the dock changes the packet meets (3016, 1267, 783), and the spectrum flattens (power law -1.46, -0.89, -0.87; Planck fits at the 30 T edge), away from Planck, not toward it; the window holds 0.634 of a period at omega_C, so no thermal part can form below C about 160; x 1 reproduces E-GRV-0132 to 2.8e-4, the static lump reads 2.5e-24, the integer rule reverses bit for bit through both schedules; the split's error bound reaches 0.153 (gate 0.05) though R1 shows it about 250 times loose",
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
    const pk = profileKappa(profile, RH, c0)
    const kappa = pk.kappa
    const T = kappa / (2 * Math.PI)
    const unit = (r: number): number =>
      profile.at(Math.max(r, profile.first))
    const mFinal = CAP / profile.at(RH)

    const roomAt = (m: number, r: number): number => {
      const e = m * unit(r)

      return e >= CAP ? 0 : C - Math.floor((C * e) / CAP)
    }

    const finalRoom = (r: number): number => roomAt(mFinal, r)
    const inner = Math.ceil(RH)

    let flatFrom = inner

    for (let r = inner; r < L / 2; r++) {
      if (finalRoom(r) < C) {
        flatFrom = r + 1
      }
    }

    const width = c0 / (SIGMA_T * T)
    const rc = Math.round(flatFrom + MARGIN * width)
    const stair = Math.round(stairTime(finalRoom, C, c0, inner, rc))
    const xc = L / 2
    const dist = (x: number): number =>
      Math.min(Math.abs(x - xc), L - Math.abs(x - xc))
    const chain = makeUniformChain(L, D0, C)
    const modes = flatModes(chain)
    const lambdaTop = 2 * (1 - Math.cos(modes.top))
    const omegaC = Math.acos(1 - lambdaTop / (2 * C * C))
    const windowBeats = Math.log(C) / (2 * kappa)
    const windowPeriods = (windowBeats * omegaC) / (2 * Math.PI)

    log(
      `kappa ${kappa} T ${T} flat ${flatFrom} r_c ${rc} stair ${stair} omega_C ${omegaC / T} T, window ${windowBeats} beats = ${windowPeriods} periods at omega_C`,
    )

    const near: number[] = []

    for (let x = 0; x < L; x++) {
      if (dist(x) < flatFrom) {
        near.push(x)
      }
    }

    const nearUnit = near.map(x => unit(dist(x)))
    const rooms = new Int32Array(L).fill(C)
    const inZone = (x: number): boolean => dist(x) < flatFrom
    const zoneWeight = (b: ChainBatch, n: number): number =>
      Math.max(
        ...Array.from({ length: n }, (_, i) =>
          weightShare(chain, b, 2 * i, 2 * i + 1, inZone),
        ),
      )

    // the zone's share of column i, split on its own: Z = its N+ + N-, the size of what the flat split may misread
    const zonePart = (b: ChainBatch, i: number): number => {
      const z = makeBatch(chain, 2)

      for (let l = 0; l < chain.links; l++) {
        if (!inZone(Math.floor(l / 9))) {
          continue
        }

        for (let c = 0; c < 2; c++) {
          z.a[l * 2 + c] = b.a[l * b.width + 2 * i + c]!
          z.y[l * 2 + c] = b.y[l * b.width + 2 * i + c]!
        }
      }

      const s = splitFlat(chain, modes, z, 0, 1)

      return s.positive + s.negative
    }

    const split = (
      b: ChainBatch,
      omegas: readonly number[],
    ): Column[] =>
      omegas.map((omega, i) => {
        const s = splitFlat(chain, modes, b, 2 * i, 2 * i + 1)
        const z = zonePart(b, i)

        return {
          omega,
          split: s,
          ratio: s.negative / s.positive,
          conservation: Math.abs(s.positive - s.negative - 1),
          error: (2 * Math.sqrt(s.negative * z) + z) / s.negative,
        }
      })

    // THE GRID: one batch per growth time, every delay of it in one pass
    const cells: Cell[] = []
    const runs: Run[] = []

    let outTail = 0
    let outNorm = 0

    for (const factor of FACTORS) {
      const tg = TG * factor
      const delays = DELAYS.get(factor)!
      const delayBeats = delays.map(d => Math.round(d / kappa))
      const most = Math.max(...delayBeats)
      const start = tg + most + stair
      const packets = delays.flatMap((_, j) =>
        BAND.map(w => ({
          j,
          omega: w * T,
          center: rc + c0 * (most - delayBeats[j]!),
        })),
      )
      const b = makeBatch(chain, 2 * packets.length)

      packets.forEach((p, i) =>
        outPacket(
          chain,
          modes,
          b,
          2 * i,
          2 * i + 1,
          p.omega,
          SIGMA_T * T,
          xc + p.center,
        ),
      )
      outTail = Math.max(outTail, zoneWeight(b, packets.length))
      outNorm = Math.max(
        outNorm,
        ...packets.map((_, i) =>
          Math.abs(kgNorm(chain, b, 2 * i, 2 * i + 1) - 1),
        ),
      )

      const massAt = (t: number): number => mFinal * Math.min(1, t / tg)

      let quenches = 0
      let t = start

      const back = (until: number): void => {
        for (; t > until; t--) {
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

          if (changed) {
            quenches += setChainRooms(chain, x => rooms[x]!)
          }

          chainBeatBack(chain, b)
        }
      }

      back(Math.max(0, tg - stair - STOP_EXTRA))

      let zone = zoneWeight(b, packets.length)

      for (
        let n = 0;
        n < MAX_CHUNKS && zone > ZONE_STOP && t > 0;
        n++
      ) {
        back(Math.max(0, t - CHUNK))
        zone = zoneWeight(b, packets.length)
      }

      log(
        `x ${factor}: t_g ${tg}, run back ${start} -> ${t}, ${quenches} dock changes, zone weight at the split ${zone.toExponential(2)}`,
      )

      const all = split(
        b,
        packets.map(p => p.omega),
      )

      runs.push({
        factor,
        tg,
        start,
        split: t,
        beats: start - t,
        quenches,
        zone,
      })

      delays.forEach((delay, j) => {
        const cols = all.filter((_, i) => packets[i]!.j === j)

        cells.push({
          factor,
          delay,
          cols,
          planck: planckFit(
            cols.map(c => c.omega),
            cols.map(c => c.ratio),
            PLANCK_GUESS * T,
          ),
          power: powerLaw(
            cols.map(c => c.omega),
            cols.map(c => c.ratio),
          ),
        })

        log(
          `  x ${factor} delay ${delay} / kappa: ${cols.map(c => c.ratio.toExponential(3)).join(' ')}`,
        )
      })

      rooms.fill(C)
      setChainRooms(chain, () => C)
    }

    // THE STATIC CONTROL: the final lump throughout, the 4 T packet at r_c, run back t_f + 6144 beats
    for (const x of near) {
      rooms[x] = finalRoom(dist(x))
    }

    setChainRooms(chain, x => rooms[x]!)

    const still = makeBatch(chain, 2)

    outPacket(
      chain,
      modes,
      still,
      0,
      1,
      BAND[0]! * T,
      SIGMA_T * T,
      xc + rc,
    )

    for (let t = TG + stair + CONTROL_EXTRA; t >= 1; t--) {
      chainBeatBack(chain, still)
    }

    const staticLeft = zoneWeight(still, 1)

    rooms.fill(C)
    setChainRooms(chain, () => C)

    const staticCol = split(still, [BAND[0]! * T])[0]!

    log(
      `static: ${staticCol.ratio.toExponential(3)}, left in the zone ${staticLeft.toExponential(2)}`,
    )

    // THE REPLICA: the integer rule through the x 1 schedule and the end of the x 16 schedule, forward and back
    const rcx = REPLICA / 2
    const rdist = (x: number): number =>
      Math.min(Math.abs(x - rcx), REPLICA - Math.abs(x - rcx))

    const replica = (
      tg: number,
      from: number,
      to: number,
    ): {
      reversed: boolean
      gauss: number
      wraps: number
      changes: number
    } => {
      const repRoom =
        (t: number) =>
        (x: number): number =>
          roomAt(mFinal * Math.min(1, t / tg), rdist(x))
      const rep = makeHeadroomSpanMedium(
        [REPLICA, 2, 2],
        D0,
        C,
        repRoom(from),
      )
      const begin = smoothPacket(
        rep,
        LEVELS,
        rcx + REPLICA_AT,
        REPLICA_AMP,
        REPLICA_WIDTH,
      )
      const s = copySpan(begin)
      const scratch = makeSpanScratch(rep, LEVELS)
      const wraps = noWraps()

      let last = Array.from({ length: REPLICA }, (_, x) =>
        repRoom(from)(x),
      ).join(',')
      let changes = 0
      let gauss = 0

      const set = (t: number): void => {
        const f = repRoom(t)
        const key = Array.from({ length: REPLICA }, (_, x) =>
          f(x),
        ).join(',')

        if (key !== last) {
          setMediumRooms(rep, f)
          last = key
          changes++
        }
      }

      for (let t = from + 1; t <= to; t++) {
        set(t)
        spanBeat(rep, s, scratch, LEVELS, wraps)
        gauss += gaussViolations(rep, s)
      }

      for (let t = to; t > from; t--) {
        set(t)
        spanBeatBack(rep, s, scratch, LEVELS)
      }

      return {
        reversed: sameSpan(s, begin),
        gauss,
        wraps: wraps.angle + wraps.field + wraps.potential,
        changes,
      }
    }

    const rep1 = replica(TG, 0, TG + REPLICA_TAIL)
    const tg16 = TG * FACTORS[FACTORS.length - 1]!
    const rep16 = replica(
      tg16,
      tg16 - REPLICA_LEAD,
      tg16 + REPLICA_TAIL,
    )

    log(
      `replica x 1: reversed ${rep1.reversed}, gauss ${rep1.gauss}, ${rep1.changes} room changes; x 16 end: reversed ${rep16.reversed}, gauss ${rep16.gauss}, ${rep16.changes} room changes`,
    )

    // THE GATES
    const cellAt = (factor: number, delay: number): Cell =>
      cells.find(c => c.factor === factor && c.delay === delay)!
    const slopes = BAND.map((_, i) => {
      const xs = FACTORS.map(f => Math.log(TG * f))
      const ys = FACTORS.map(f => Math.log(cellAt(f, 0).cols[i]!.ratio))

      return linearFit({ xs, ys }).slope
    })
    const falls = BAND.every((_, i) =>
      FACTORS.slice(1).every(
        (f, k) =>
          cellAt(f, 0).cols[i]!.ratio <
          cellAt(FACTORS[k]!, 0).cols[i]!.ratio,
      ),
    )
    const a1 =
      falls && slopes.every(s => s >= A1_SLOPE[0] && s <= A1_SLOPE[1])
    const slowLate = cellAt(tg16 / TG, LATE)
    const a2Thermal =
      !slowLate.planck.edge &&
      Math.abs(slowLate.planck.temperature / T - 1) <= A2_TOLERANCE
    const a2Bound = windowPeriods < 1
    const a2 = a2Thermal || a2Bound
    const lateRatios = [1, tg16 / TG].flatMap(f =>
      BAND.map(
        (_, i) =>
          cellAt(f, LATE).cols[i]!.ratio / cellAt(f, 0).cols[i]!.ratio,
      ),
    )
    const d1 = lateRatios.every(r => r <= D1_BOUND)
    const a3 =
      rep1.reversed &&
      rep1.gauss === 0 &&
      rep16.reversed &&
      rep16.gauss === 0
    const ref = cellAt(1, 0)
    const refFit = planckFit(
      BAND.map(w => w * T),
      E0132_RATIOS,
      PLANCK_GUESS * T,
    )
    const r1 =
      !ref.planck.edge &&
      Math.abs(ref.planck.temperature / refFit.temperature - 1) <=
        R1_TOLERANCE &&
      ref.cols.every(
        (c, i) =>
          Math.abs(c.ratio / E0132_RATIOS[i]! - 1) <= R1_TOLERANCE,
      )
    const s1 = staticCol.ratio <= S1_BOUND
    const k2 =
      cells.every(c =>
        c.cols.every(col => col.conservation <= K2_BOUND),
      ) && staticCol.conservation <= K2_BOUND
    const worstError = Math.max(
      ...cells.flatMap(c => c.cols.map(col => col.error)),
    )
    const k3 = worstError <= K3_BOUND
    const status =
      a1 && a2 && d1 && a3 && r1 && s1 && k2 && k3 ? 'pass' : 'fail'

    // REPORTED
    for (const r of runs) {
      const key = `x${r.factor}`

      metrics[`${key}_tg`] = r.tg
      metrics[`${key}_start`] = r.start
      metrics[`${key}_split`] = r.split
      metrics[`${key}_beats`] = r.beats
      metrics[`${key}_quenches`] = r.quenches
      metrics[`${key}_zoneAtSplit`] = r.zone
    }

    for (const c of cells) {
      const key = `x${c.factor}_d${c.delay}`

      metrics[`${key}_planckTOverT`] = c.planck.temperature / T
      metrics[`${key}_planckResidual`] = c.planck.residual
      metrics[`${key}_planckAtEdge`] = c.planck.edge ? 1 : 0
      metrics[`${key}_exponent`] = c.power.exponent
      metrics[`${key}_powerResidual`] = c.power.residual

      for (const col of c.cols) {
        const w = `${key}_w${(col.omega / T).toFixed(0)}`

        metrics[`${w}_ratio`] = col.ratio
        metrics[`${w}_blueshift`] =
          col.split.negativeMeanOmega / col.omega
        metrics[`${w}_conservation`] = col.conservation
        metrics[`${w}_splitError`] = col.error
      }

      lines.push(
        `x ${c.factor} (t_g ${TG * c.factor}), delay ${c.delay} / kappa: |beta/alpha|^2 ${c.cols.map(col => `${(col.omega / T).toFixed(0)} T ${col.ratio.toExponential(3)} (blueshift ${(col.split.negativeMeanOmega / col.omega).toFixed(2)})`).join(', ')}; Planck T ${(c.planck.temperature / T).toFixed(3)} x kappa / 2 pi rms ${c.planck.residual.toFixed(3)}${c.planck.edge ? ' (at the edge)' : ''}; power law ${c.power.exponent.toFixed(3)} rms ${c.power.residual.toFixed(3)}`,
      )
    }

    BAND.forEach((w, i) => (metrics[`a1_slope_w${w}`] = slopes[i]!))
    ;[1, tg16 / TG].forEach((f, k) =>
      BAND.forEach(
        (w, i) =>
          (metrics[`d1_x${f}_w${w}`] =
            lateRatios[k * BAND.length + i]!),
      ),
    )

    metrics.kappa = kappa
    metrics.T = T
    metrics.flatFrom = flatFrom
    metrics.rc = rc
    metrics.stair = stair
    metrics.omegaCOverT = omegaC / T
    metrics.windowBeats = windowBeats
    metrics.windowPeriodsAtOmegaC = windowPeriods
    metrics.outTail = outTail
    metrics.outNormError = outNorm
    metrics.gate_A1 = a1 ? 1 : 0
    metrics.gate_A1_falls = falls ? 1 : 0
    metrics.gate_A2 = a2 ? 1 : 0
    metrics.gate_A2_thermal = a2Thermal ? 1 : 0
    metrics.gate_A2_bound = a2Bound ? 1 : 0
    metrics.gate_D1 = d1 ? 1 : 0
    metrics.gate_A3 = a3 ? 1 : 0
    metrics.control_R1 = r1 ? 1 : 0
    metrics.control_S1 = s1 ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.control_K3 = k3 ? 1 : 0
    metrics.k3_worstError = worstError
    metrics.r1_planck4 = ref.planck.temperature / T
    metrics.r1_planck4Record = refFit.temperature / T
    metrics.r1_planck7Record = E0132_PLANCK7
    metrics.r1_worstRatio = Math.max(
      ...ref.cols.map((c, i) =>
        Math.abs(c.ratio / E0132_RATIOS[i]! - 1),
      ),
    )
    metrics.staticRatio = staticCol.ratio
    metrics.staticLeftInZone = staticLeft
    metrics.staticConservation = staticCol.conservation
    metrics.replica1_reversed = rep1.reversed ? 1 : 0
    metrics.replica1_gauss = rep1.gauss
    metrics.replica1_wraps = rep1.wraps
    metrics.replica1_changes = rep1.changes
    metrics.replica16_reversed = rep16.reversed ? 1 : 0
    metrics.replica16_gauss = rep16.gauss
    metrics.replica16_wraps = rep16.wraps
    metrics.replica16_changes = rep16.changes
    metrics.seconds = (Date.now() - started) / 1000

    const at4 = FACTORS.map(f =>
      cellAt(f, 0).cols[0]!.ratio.toExponential(2),
    ).join(', ')

    return verdict({
      status,
      claim: `C 25, r_h 12.5, out packets at ${BAND.join(', ')} T split by exact projection: at 4 T, |beta/alpha|^2 ${at4} at t_g x ${FACTORS.join(', ')}; slopes on ln t_g ${slopes.map(s => s.toFixed(2)).join(', ')}; read 48 / kappa late, ${lateRatios.map(r => r.toExponential(1)).join(', ')} of the prompt value (x 1 then x 16); slowest and latest Planck fit ${(slowLate.planck.temperature / T).toFixed(2)} x kappa / 2 pi; the window holds ${windowPeriods.toFixed(3)} of a period at omega_C; x 1 reproduces E-GRV-0132 to ${metrics.r1_worstRatio.toExponential(1)}; static ${staticCol.ratio.toExponential(1)}`,
      metrics,
      control: {
        r1Worst: metrics.r1_worstRatio,
        staticRatio: staticCol.ratio,
        zoneWorst: Math.max(...runs.map(r => r.zone)),
      },
      notes: `L2. A1 ${a1} (falls ${falls}, slopes ${slopes.map(s => s.toFixed(3)).join(', ')}), A2 ${a2} (thermal ${a2Thermal}, bound ${a2Bound}: ${windowPeriods.toFixed(4)} periods at omega_C ${(omegaC / T).toFixed(2)} T), D1 ${d1}, A3 ${a3}, R1 ${r1} (4-point ${(ref.planck.temperature / T).toFixed(3)} against the record's ${(refFit.temperature / T).toFixed(3)}), S1 ${s1}, K2 ${k2}, K3 ${k3} (worst split error bound ${worstError.toExponential(2)}).${runs.map(r => `x ${r.factor}: run back ${r.start} -> ${r.split}, ${r.quenches} dock changes, zone weight at the split ${r.zone.toExponential(2)}`).join('; ')}. ${lines.join('. ')}. Static lump ${staticCol.ratio.toExponential(2)}, left in the zone ${staticLeft.toExponential(2)}. Replica x 1: ${rep1.changes} room changes, reversed ${rep1.reversed}, ${rep1.gauss} Gauss violations, ${rep1.wraps} wraps; x 16 end: ${rep16.changes} room changes, reversed ${rep16.reversed}, ${rep16.gauss} Gauss violations, ${rep16.wraps} wraps.`,
    })
  },
})
