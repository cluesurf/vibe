// Gravity, the effect: under the occupancy-gated take (E-GRV-0060), does a crowd slow a signal through it, bend a ray
// passing beside it, or draw a dilute test population toward it, read on the husk, and is the effect charge-blind
// (E-GRV-0061)? The optical-metric hope: light crossing a crowded region is slowed, so a ray bends toward matter as
// light does in glass, and a slowing reaching out as 1/r would give 1/r^2 on the husk.
//
// THE RULE, THE CROWD AND THE READERS: code/measure/gated-take (the rule, unchanged from E-GRV-0060) and
// code/measure/gated-crowd (header). In short: side 24, the adopted vacuum, a crowd of husk radius 2 at full depth
// (every slot and store held, energy 48, L = 17) whose counters start at 1, so the rule itself holds it still for beats
// 0 to 15 and it takes first at beat 16; nothing is imposed. Configurations none (no crowd), crowd, flip (every crowd
// trit negated) and old (the crowd under the old knit, no gate). 5 members (link starts integer+0 .. 3 and golden, the
// Weyl phase of every fill the member's index), 32 beats.
//
// WHAT THE RULE ALLOWS, stated before the run: the gate reads only a dock's own counter, and its counter only its own
// energy. Outside docks at or below the threshold take every beat, so outside the crowd (and whatever of it leaks out)
// the gated rule is the old knit, and a paused crowd dock turns its neighbors' vibes back. A ray that never enters a
// crowded dock can be changed only by what the crowd has sent out or turned back.
//
// Gates, fixed before the first run of this file:
//  H1 instrument: on every member, energy and charge exact on every base run and at the end of every twin and blob run
//     of the gated configurations; the none run equal to the old knit on the plain vacuum at every beat (the uniform
//     control: no crowd, no effect); the crowd run 32 beats forward and 32 back returns its start exactly
//  H2 slowing (a): at b = 0 (through the crowd) the signal comes through on every member (arrival at the detector
//     within 32 beats and before the column behind it) and the paired delay, crowd minus none, is positive by at least
//     3 standard errors
//  H3 bending (b): at every b = 3, 4, 5, 6 (rays that never enter the ball) the paired deflection toward the crowd at
//     the detector plane, crowd minus none, is positive by at least 3 standard errors and does not grow with b
//  H4 attraction (c): at every r = 4, 5, 6, 8 the paired blob displacement toward the crowd after 32 beats, crowd minus
//     none (members and axes pooled), is positive by at least 3 standard errors, does not grow with r, and its log-log
//     slope against r lies in [-2.5, -1.5] (1/r^2 on the husk)
//  H5 charge-blind: for the b = 0 delay, every b's deflection and every r's displacement, the paired crowd minus flip is
//     within 3 standard errors of 0 (exactly 0 when its standard error is 0)
// Verdict: pass if all hold; fail if H1 holds and any of H2 to H5 fails; partial if H1 fails.
//
// Reported, not gated: every arrival (detector, behind, back of the source, plane) per configuration and impact; the
// old-knit crowd's readings; the displacements at 16 beats (the crowd still held by its own gate); the energy the ball
// keeps at beat 32; the crowd's takes; outside dock-beats paused and the most energy an outside dock reached.
//
// DISCLOSED: no probe of this file's readings before its first run. The threshold, the crowd and the vacuum occupancy
// come from E-GRV-0060 and its probe (tmp/grv60-probe1.ts). E-GRV-0060 found that a crowd started at rest (counters 0)
// takes on beat 0 and melts from the outside in (it took on 25,345 of 31,680 crowd dock-beats at side 8), which is why
// this crowd starts at counter 1; that choice was made after reading E-GRV-0060 and before any run of this file.
//
// FIRST RUN (tmp/grv0061-run1.log, 1,154 s, the record): fail on H2, H3 and H4, recorded as is, no gate moved. H1 and
// H5 hold (no outside dock was ever paused, the most an outside dock held was 28). H2: at b = 0 the column behind the
// detector differs first (17) on every start, so what reaches the detector (19 to 21) came round the torus; the front
// is back at the source side at beat 7: turned back, not slowed. H3: no bend beside the crowd. H4: its gate reads
// "significant" means at 32 beats (430 to 640 columns), but those numbers are larger than the box and are a reader
// artifact: after the crowd's first take at beat 16 the blob changes how the crowd bursts, and the excess-energy
// centroid (a signed field divided by its small total) is then the burst's, not the blob's. The slope (-0.46) and the
// growth with r fail the gate on their own. The readable window is beats 1 to 16, where the crowd is held by its own
// gate: there the blob is pushed away at r = 4, 5, 6 by 3.5 or more standard errors, as E-GRV-0056 found for a held
// knot. Title written after the run.
//
// Depth L2: husk readings of the gated rule against a no-crowd control, a charge-flipped crowd and the old knit.
// DETERMINISM: link starts and Weyl fills; nothing is drawn. NOTHING MOVES: a slot takes its neighbor's value.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meanError } from '@/code/measure/held-knot'
import { CROWD, CROWD_CONFIGS, crowdSurvey, type CrowdConfig, type CrowdMember, type DriftConfig } from '@/code/measure/gated-crowd'

type Stat = { mean: number; error: number }

const significant = (x: Stat): boolean => x.mean > 0 && x.mean >= 3 * x.error
const nullish = (x: Stat): boolean => (x.error === 0 ? x.mean === 0 : Math.abs(x.mean) <= 3 * x.error)
const f = (x: Stat): string => `${x.mean.toFixed(3)} +- ${x.error.toFixed(3)}`

export default experiment({
  id: 'gravity/gated-take-crowd',
  code: 'E-GRV-0061',
  title:
    'a crowd under the occupancy-gated take is a mirror, not a lens, fail on H2, H3 and H4: exact and charge-blind (crowd minus flipped 0.000 +- 0.000 on every arrival and deflection), but a signal aimed through it is turned back (the front reaches the source side at beat 7 and the far detector only round the torus, behind column first at 17, detector 19 to 21) instead of coming through slowed; rays beside it are not bent (-0.15 +- 0.24, 0, 0.70 +- 0.86, 0 at b = 3 to 6); a test blob is pushed AWAY while the gate holds the crowd (-16.3 +- 4.7, -12.2 +- 3.6, -5.3 +- 2.2, +2.7 +- 2.2 at r = 4, 5, 6, 8 after 16 beats); after its first take at beat 16 the crowd bursts (it keeps 27 to 29 percent of its energy at beat 32) and the blob readings become the burst, not a pull (slope -0.46)',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const S = CROWD
    const members: CrowdMember[] = crowdSurvey(log)
    const W = S.beats
    const zero = S.impacts.indexOf(0)
    const beside = S.impacts.map((b, i) => ({ b, i })).filter(x => x.b > S.radius)
    const read32 = S.driftReads.indexOf(W)
    const read16 = S.driftReads.indexOf(16)

    // H1
    const g1 = members.every(m => m.exact && m.noneIsOld && m.returns)

    // H2
    const delay = (a: CrowdConfig, b: CrowdConfig, i: number): Stat => meanError(members.map(m => (m.arrival[a][i] as number) - (m.arrival[b][i] as number)))
    const through = members.every(m => (m.arrival.crowd[zero] as number) <= W && (m.arrival.crowd[zero] as number) < (m.behind.crowd[zero] as number))
    const delay0 = delay('crowd', 'none', zero)
    const g2 = through && significant(delay0)

    // H3
    const deflection = (c: CrowdConfig, m: CrowdMember, i: number): number => (S.impacts[i] as number) - (m.planeY[c][i] as number)
    const bend = (a: CrowdConfig, b: CrowdConfig, i: number): Stat => meanError(members.map(m => deflection(a, m, i) - deflection(b, m, i)))
    const bends = beside.map(x => bend('crowd', 'none', x.i))
    const g3 = bends.every(x => Number.isFinite(x.mean) && significant(x)) && bends.every((x, j) => j === 0 || x.mean <= (bends[j - 1] as Stat).mean)

    // H4
    const pull = (a: DriftConfig, b: DriftConfig, read: number, i: number): Stat => meanError(members.flatMap(m => S.axes.map((_, j) => (m.drift[a][read]![i]![j] as number) - (m.drift[b][read]![i]![j] as number))))
    const pulls = S.distances.map((_, i) => pull('crowd', 'none', read32, i))
    let slope = Number.NaN

    if (pulls.every(x => x.mean > 0)) {
      const lx = S.distances.map(r => Math.log(r))
      const ly = pulls.map(x => Math.log(x.mean))
      const mx = lx.reduce((a, b) => a + b, 0) / lx.length
      const my = ly.reduce((a, b) => a + b, 0) / ly.length
      let num = 0
      let den = 0

      for (let i = 0; i < lx.length; i++) {
        num += ((lx[i] as number) - mx) * ((ly[i] as number) - my)
        den += ((lx[i] as number) - mx) ** 2
      }

      slope = num / den
    }

    const g4 = pulls.every(significant) && pulls.every((x, j) => j === 0 || x.mean <= (pulls[j - 1] as Stat).mean) && slope >= -2.5 && slope <= -1.5

    // H5
    const flipDelay = delay('crowd', 'flip', zero)
    const flipBends = beside.map(x => bend('crowd', 'flip', x.i))
    const flipPulls = S.distances.map((_, i) => pull('crowd', 'flip', read32, i))
    const g5 = nullish(flipDelay) && flipBends.every(x => Number.isFinite(x.mean) && nullish(x)) && flipPulls.every(nullish)

    const status = !g1 ? 'partial' : g2 && g3 && g4 && g5 ? 'pass' : 'fail'
    const spread = (xs: number[]): string => {
      const s = [...xs].sort((a, b) => a - b)

      return `${s[0]}/${s[Math.floor(s.length / 2)]}/${s[s.length - 1]}`
    }
    const metrics: Record<string, number> = {
      gate_H1: g1 ? 1 : 0,
      gate_H2: g2 ? 1 : 0,
      gate_H3: g3 ? 1 : 0,
      gate_H4: g4 ? 1 : 0,
      gate_H5: g5 ? 1 : 0,
      throughAtZero: through ? 1 : 0,
      delayZero: delay0.mean,
      delayZeroError: delay0.error,
      pullSlope: slope,
      flipDelayZero: flipDelay.mean,
      retainedMin: Math.min(...members.map(m => m.retained)),
      retainedMax: Math.max(...members.map(m => m.retained)),
      crowdTakes: members.reduce((a, m) => a + m.crowdTakes, 0),
      crowdDockBeats: members.reduce((a, m) => a + m.crowdDockBeats, 0),
      outsidePaused: members.reduce((a, m) => a + m.outsidePaused, 0),
      maxOutsideEnergy: Math.max(...members.map(m => m.maxOutsideEnergy)),
      turnedBack: members.reduce((a, m) => a + m.turned, 0),
    }
    const arrivalNotes: string[] = []

    S.impacts.forEach((b, i) => {
      for (const c of CROWD_CONFIGS) {
        metrics[`arrival_${c}_b${b}_mean`] = members.reduce((a, m) => a + (m.arrival[c][i] as number), 0) / members.length
        arrivalNotes.push(`b${b} ${c}: detector ${spread(members.map(m => m.arrival[c][i] as number))}, behind ${spread(members.map(m => m.behind[c][i] as number))}, back ${spread(members.map(m => m.back[c][i] as number))}, plane ${spread(members.map(m => m.planeBeat[c][i] as number))} y ${members.map(m => (m.planeY[c][i] as number).toFixed(2)).join('/')}`)
      }
    })

    beside.forEach((x, j) => {
      metrics[`bend_b${x.b}`] = (bends[j] as Stat).mean
      metrics[`bendError_b${x.b}`] = (bends[j] as Stat).error
      metrics[`bendFlip_b${x.b}`] = (flipBends[j] as Stat).mean
      metrics[`bendOld_b${x.b}`] = bend('old', 'none', x.i).mean
    })

    S.distances.forEach((r, i) => {
      metrics[`pull_r${r}`] = (pulls[i] as Stat).mean
      metrics[`pullError_r${r}`] = (pulls[i] as Stat).error
      metrics[`pullFlip_r${r}`] = (flipPulls[i] as Stat).mean
      metrics[`pull16_r${r}`] = pull('crowd', 'none', read16, i).mean
      metrics[`pull16Error_r${r}`] = pull('crowd', 'none', read16, i).error
    })

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a crowd (husk radius 2, energy 48, held by its own gate for 16 beats) under the gated take, side 24, ${members.length} starts: through it (b = 0) the signal ${through ? 'comes through' : 'does not come through on every start'}, delay ${f(delay0)}; beside it (b = ${beside.map(x => x.b).join(', ')}) deflection toward it ${bends.map(f).join(', ')}; test-blob pull toward it at r = ${S.distances.join(', ')} after ${W} beats ${pulls.map(f).join(', ')} (slope ${slope.toFixed(2)}); crowd minus flipped: delay ${f(flipDelay)}, deflection ${flipBends.map(f).join(', ')}, pull ${flipPulls.map(f).join(', ')}`,
      metrics,
      control: {
        noneIsOldKnit: members.every(m => m.noneIsOld) ? 1 : 0,
        exact: members.every(m => m.exact) ? 1 : 0,
        returns: members.every(m => m.returns) ? 1 : 0,
      },
      notes: `L2. Gates H1 ${g1}, H2 ${g2}, H3 ${g3}, H4 ${g4}, H5 ${g5}. Arrivals (min/median/max over starts; ${W + 1} = never within ${W}): ${arrivalNotes.join('; ')}. Pull at 16 beats: ${S.distances.map((r, i) => `r${r} ${f(pull('crowd', 'none', read16, i))}`).join(', ')}. Ball energy kept at beat ${W}: ${members.map(m => m.retained.toFixed(3)).join(', ')}. Per member seconds ${members.map(m => m.seconds.toFixed(0)).join(', ')}.`,
    })
  },
})
