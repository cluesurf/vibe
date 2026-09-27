// EVERY VIBE MIXER CASCADES (E-SPN-0099). step-back.md asked whether the frame mixer's move rate is a dial between a
// frozen and a scrambled vacuum, with a critical rate the rule fixes. The ring allows three covariant line mixers,
// U = I + (alpha - 1) Q with alpha a sixth root of unity, moving a lone vibe with probability 7 |alpha - 1|^2 / 64:
// 7/64 (alpha = w), 21/64 (alpha = omega) and 28/64 (alpha = -1, G). A prediction was written before any scan: growth
// 1 a beat near 21/64 (G's 1.35 fold scaled by the rate). Here the mixer runs at 7 N / 64 for N = 0 to 6
// (code/measure/full-key-paths keyedMix, N = 4 is G; 2, 5 and 6 are off the ring and only draw the curve), with the
// thresholded G on the 'bounce' contact and the lifted mixer Gamma(G) (E-SPN-0097) on both contacts.
//
// PROBES before this file, disclosed (all on the registered key, which on side 16 does not depend on the beat,
// E-MTH-0029): tmp/rate-probe1 (one path: growth 1.263, 1.326, 1.370, 1.421 at 21, 28, 35, 42 / 64; at 7/64 and
// 14/64 the mixer NEVER FIRED on that path's key, so those rates were not read); tmp/contact-chaos-probe (no mixer: a
// wake of 4, cycling; G on 'pass' 575,174 at beat 64, about 1.33 a beat; G on 'bounce' 35,048, about 1.15);
// tmp/open-relay-probe (what multiplies is LONE FRAMES, the frames G acts on: 2, 23, 286, 1,440, 7,089, 24,886 at
// beats 1, 17, 29, 35, 41, 47 on 'pass'); tmp/lift-wake-probe (Gamma(G) moves the unseeded vacuum 1,373,895 times on
// 'pass' and fills the box); tmp/wake-probe1 and 2 (G's wake exponential, not a front). The gates below are those
// findings, read before this file, re-read on the full-period key (fullPathKey) over SIX paths (key offsets
// pathOffset(0..5), an integer Weyl sequence), so that the low rates are actually read: a rerun of disclosed
// findings, not predictions.
//
// GATES (side 16, Born path, coin on, veto 'none', one lone love at the center dock's slot 0, 64 beats; the wake is the
// trits apart from the unseeded run on the same key and mixer; growth a beat is tmp/rate-probe1's: the geometric mean
// ratio over the beats where the wake lies between 100 and a twentieth of the slots).
//  C1 no mixer is quiet: the wake stays at or under 100 on every path, on 'pass' and 'bounce'.
//  C2 every rate from 7/64 to 42/64 fires: the mixer moves at least once in the seeded run on every path.
//  C3 every rate from 7/64 to 42/64 scrambles on 'pass': the wake at beat 64 is above a twentieth of the slots on
//     every path.
//  C4 the omega prediction fails: at 21/64 the growth is above 1.1 on every path where it is read.
//  C5 the growth rises with the rate: the mean over paths increases from 21/64 to 42/64.
//  C6 'bounce' slows G but does not stop it: G's wake on 'bounce' passes 1,000 by beat 64 on every path, and its mean
//     growth is below 'pass''s.
//  C7 Gamma(G) scrambles on both contacts (wake at beat 64 above a twentieth of the slots, three paths each).
//  C8 the relay is lone frames: in G's run on 'pass', lone frames at beat 47 are at least 100 times those at beat 1 on
//     every path.
//  CONTROL: the old key (oldPathKey) reproduces tmp/rate-probe1's never-fired rates (0 moves at 7/64 and 14/64 and a
//     wake equal to the no-mixer wake at every beat) and tmp/contact-chaos-probe's 575,174 for G at beat 64.
//  Verdict: pass if C1 to C8 hold and the control reproduces; partial if only the control fails; fail otherwise.
//
// RUN (tmp/fk-mixer-cascade.log, 449 s): pass on every gate and the control. What did NOT carry over from the probes:
// G on 'bounce' is not a steady 1.15 a beat held near 35,000 trits; on every full-key path it grows 1.25 to 1.27 a beat
// and scrambles the box (462,115 to 525,334 at beat 64). The registered key's frozen record had slowed it. The low
// rates, never read before, cascade like the rest: there is no quiet phase below 21/64.
//
// Depth L2: a known kind of reading (a scrambling rate) on the rule's own runs. DETERMINISM: no random numbers; paths
// are integer Weyl offsets of the key. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { tritsApart, type LockedFresh } from '@/code/measure/doublet-locked-readings'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration, type Configuration } from '@/code/rule/doublet-locked-knit'
import { loneFrames } from '@/code/rule/coined-locked-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { fullPathKey, keyedRunner, oldPathKey, pathOffset, wakeGrowth, type KeyedMix, type PathKey } from '@/code/measure/full-key-paths'

const SIDE = 16
const BEATS = 64
const PATHS = 6
const LIFT_PATHS = 3
const RATES = [0, 1, 2, 3, 4, 5, 6] as const
const QUIET = 100
const OMEGA = 3
const G = 4
const RELAY_FROM = 1
const RELAY_TO = 47
const RELAY_FACTOR = 100
const BOUNCE_FLOOR = 1000
const OMEGA_GROWTH = 1.1
const PROBE_G_PASS = 575174

type Run = { wake: number[]; moves: number; lone: number[]; growth: number }

function wakeRun(f: LockedFresh, vacuum: Configuration, start: Configuration, key: PathKey, mix: KeyedMix): Run {
  const a = keyedRunner(f.tables, vacuum, { key, mix })
  const b = keyedRunner(f.tables, start, { key, mix })
  const wake: number[] = []
  const lone: number[] = []

  for (let t = 0; t < BEATS; t++) {
    a.beat()
    b.beat()
    wake.push(tritsApart(b.state(), a.state()))
    lone.push(mix === G ? loneFrames(f.cells, b.state()).length : 0)
  }

  return { wake, moves: b.mixed(), lone, growth: wakeGrowth(wake, QUIET, (f.cells * 24) / 20) }
}

const mean = (xs: number[]): number => {
  const ys = xs.filter(x => !Number.isNaN(x))

  return ys.length ? ys.reduce((s, x) => s + x, 0) / ys.length : Number.NaN
}

export default experiment({
  id: 'spin/mixer-cascade',
  code: 'E-SPN-0099',
  title:
    "every vibe mixer cascades, at every move rate, and the omega mixer is not critical, pass: on six full-key paths (side 16, 'pass', 64 beats) the frame mixer at 7N/64 fires at every rate (the 7/64 and 14/64 the registered key never fired on now move 27,977 times or more) and every rate from 7/64 up scrambles the box on every path, with growth a beat rising 1.276, 1.350, 1.382, 1.419, 1.456, 1.473 from 7/64 to 42/64 (21/64 is 1.382, not 1); no mixer holds a wake of at most 27; G on 'bounce' grows slower (1.264 against 1.419) but on the full key it also scrambles (462,115 or more at beat 64, where the registered key's one path read 35,048); Gamma(G) scrambles on both contacts; lone frames in G's wake grow from 2 to 54,263 or more by beat 47; the old key reproduces the probes (7/64 and 14/64 never fire, G 575,174)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const center = centerOf(SIDE)
    const fresh = (contact: CollisionKind): { f: LockedFresh; vacuum: Configuration; start: Configuration } => {
      const f = contactFresh(SIDE, contact, center)
      const vacuum = wordVacuum(f, f.store)
      const start = cloneConfiguration(vacuum)

      start.vibe[center * 24] = 1
      start.open[center * 24] = 1

      return { f, vacuum, start }
    }
    const pass = fresh('pass')
    const scrambled = (pass.f.cells * 24) / 20
    const keys = Array.from({ length: PATHS }, (_, k) => fullPathKey(pathOffset(k)))
    const onPass = RATES.map(n => keys.map(key => wakeRun(pass.f, pass.vacuum, pass.start, key, n)))
    const oldPass = [0, 1, 2, G].map(n => ({ n, run: wakeRun(pass.f, pass.vacuum, pass.start, oldPathKey(pass.f.cells), n) }))
    const liftPass = keys.slice(0, LIFT_PATHS).map(key => wakeRun(pass.f, pass.vacuum, pass.start, key, 'lift'))
    const bounce = fresh('bounce')
    const onBounce = [0, G].map(n => keys.map(key => wakeRun(bounce.f, bounce.vacuum, bounce.start, key, n)))
    const liftBounce = keys.slice(0, LIFT_PATHS).map(key => wakeRun(bounce.f, bounce.vacuum, bounce.start, key, 'lift'))

    const last = (r: Run): number => r.wake[BEATS - 1] as number
    const gC1 = [...onPass[0]!, ...onBounce[0]!].every(r => Math.max(...r.wake) <= QUIET)
    const gC2 = RATES.slice(1).every(n => onPass[n]!.every(r => r.moves > 0))
    const gC3 = RATES.slice(1).every(n => onPass[n]!.every(r => last(r) > scrambled))
    const gC4 = onPass[OMEGA]!.filter(r => !Number.isNaN(r.growth)).every(r => r.growth > OMEGA_GROWTH) && onPass[OMEGA]!.some(r => !Number.isNaN(r.growth))
    const means = RATES.map(n => mean(onPass[n]!.map(r => r.growth)))
    const gC5 = [3, 4, 5].every(n => (means[n + 1] as number) > (means[n] as number))
    const bounceMean = mean(onBounce[1]!.map(r => r.growth))
    const gC6 = onBounce[1]!.every(r => last(r) > BOUNCE_FLOOR) && bounceMean < (means[G] as number)
    const gC7 = [...liftPass, ...liftBounce].every(r => last(r) > scrambled)
    const gC8 = onPass[G]!.every(r => (r.lone[RELAY_TO - 1] as number) >= RELAY_FACTOR * Math.max(1, r.lone[RELAY_FROM - 1] as number))
    const oldNone = oldPass.find(o => o.n === 0)!.run
    const controlQuietRates = oldPass.filter(o => o.n === 1 || o.n === 2).every(o => o.run.moves === 0 && o.run.wake.every((w, t) => w === oldNone.wake[t]))
    const controlG = last(oldPass.find(o => o.n === G)!.run) === PROBE_G_PASS
    const gates = [gC1, gC2, gC3, gC4, gC5, gC6, gC7, gC8]
    const status = !gates.every(Boolean) ? 'fail' : controlQuietRates && controlG ? 'pass' : 'partial'
    const metrics: Record<string, number> = {}

    gates.forEach((g, i) => (metrics[`gate_C${i + 1}`] = g ? 1 : 0))
    metrics.paths = PATHS
    metrics.scrambledAbove = scrambled

    for (const n of RATES) {
      const runs = onPass[n]!

      metrics[`rate${7 * n}_meanGrowth`] = means[n] as number
      metrics[`rate${7 * n}_leastWake64`] = Math.min(...runs.map(last))
      metrics[`rate${7 * n}_mostWake64`] = Math.max(...runs.map(last))
      metrics[`rate${7 * n}_leastMoves`] = Math.min(...runs.map(r => r.moves))
    }

    metrics.bounceNoneMaxWake = Math.max(...onBounce[0]!.flatMap(r => r.wake))
    metrics.bounceG_meanGrowth = bounceMean
    metrics.bounceG_leastWake64 = Math.min(...onBounce[1]!.map(last))
    metrics.liftPass_leastWake64 = Math.min(...liftPass.map(last))
    metrics.liftBounce_leastWake64 = Math.min(...liftBounce.map(last))
    metrics.relayLeastLoneAt47 = Math.min(...onPass[G]!.map(r => r.lone[RELAY_TO - 1] as number))
    metrics.controlQuietRates = controlQuietRates ? 1 : 0
    metrics.controlG = controlG ? 1 : 0
    metrics.seconds = (Date.now() - t0) / 1000

    const g4 = (x: number): string => (Number.isNaN(x) ? 'none' : x.toFixed(4))
    const rateLine = (n: number): string => `${7 * n}/64: growth ${onPass[n]!.map(r => g4(r.growth)).join(' ')}, wake at 64 ${onPass[n]!.map(last).join(' ')}, moves ${onPass[n]!.map(r => r.moves).join(' ')}`

    return verdict({
      status,
      claim: `the frame mixer at 7N/64 on six full-key paths (side ${SIDE}, 'pass', ${BEATS} beats): mean growth a beat ${RATES.map(n => `${7 * n}/64 ${g4(means[n] as number)}`).join(', ')}; every rate from 7/64 fires on every path (least moves ${RATES.slice(1).map(n => metrics[`rate${7 * n}_leastMoves`]).join('/')}) and scrambles ${gC3 ? 'on every path' : 'NOT on every path'} (least wake at 64 ${RATES.slice(1).map(n => metrics[`rate${7 * n}_leastWake64`]).join('/')} against ${scrambled}); no mixer stays at or under ${Math.max(...onPass[0]!.flatMap(r => r.wake), metrics.bounceNoneMaxWake!)}; G on 'bounce' grows ${g4(bounceMean)} a beat against ${g4(means[G] as number)} on 'pass'; Gamma(G) reaches ${metrics.liftPass_leastWake64} ('pass') and ${metrics.liftBounce_leastWake64} ('bounce') or more; lone frames in G's wake reach ${metrics.relayLeastLoneAt47} or more by beat ${RELAY_TO}`,
      metrics,
      control: { oldNeverFiredAt7And14: controlQuietRates ? 1 : 0, oldGWake64: last(oldPass.find(o => o.n === G)!.run), oldRate7Moves: oldPass.find(o => o.n === 1)!.run.moves, oldRate14Moves: oldPass.find(o => o.n === 2)!.run.moves },
      notes: `L2. Gates ${gates.map((g, i) => `C${i + 1} ${g}`).join(', ')}; control (old key: 7/64 and 14/64 never fire and equal the no-mixer wake ${controlQuietRates}; G ${controlG}). Per rate on 'pass', per path: ${RATES.map(rateLine).join(' | ')}. 'bounce': no mixer max ${metrics.bounceNoneMaxWake}; G growth ${onBounce[1]!.map(r => g4(r.growth)).join(' ')}, wake at 64 ${onBounce[1]!.map(last).join(' ')}. Gamma(G) wake at 64: 'pass' ${liftPass.map(last).join(' ')}, 'bounce' ${liftBounce.map(last).join(' ')}; Gamma(G) moves in the seeded run ${liftPass.map(r => r.moves).join(' ')} / ${liftBounce.map(r => r.moves).join(' ')}. G on 'pass', path 0, lone frames per beat: ${onPass[G]![0]!.lone.join(' ')}. G on 'pass', path 0, wake per beat: ${onPass[G]![0]!.wake.join(' ')}. Old key growth per rate 0/7/14/28: ${oldPass.map(o => g4(o.run.growth)).join(' ')}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
