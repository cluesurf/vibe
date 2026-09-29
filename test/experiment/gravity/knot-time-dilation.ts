// Gravity as geometry, time dilation: near a static knot on the adopted knit, does anything local run slower, read on
// the husk (E-GRV-0058)? A clock's local period near and far, and a signal's arrival past the knot against the same
// path with no knot (a Shapiro-style delay). The second gravity candidate of the roadmap, after the first (gravity from
// the second law) failed on this knit (E-GRV-0056, E-GRV-0057).
//
// THE KNIT, THE KNOT AND THE READERS: code/measure/knot-time (header). In short: the coset-union vacuum under the lone
// bounce collision, side 24, run with E-GRV-0056's held knot, a husk ball of radius 2 at full depth held by a reflecting
// surface. A STAND-IN for a knot, disclosed as one: the knit cannot bind (E-SPN-0067), so the file imposes the knot.
// Three configurations from one start: NONE (no knot), SURFACE (the held ball with nothing inside: zero content) and
// KNOT (the held ball with a dense lump inside). Knot minus surface is the content's effect, surface minus none the
// surface's.
//
// THE CLOCK. The vacuum's own pair exchange, read per husk column: the column's local period over beats 49 to 72 (of
// 96 run), p <= 24. THE SIGNAL. One love vibe added on a +x axis slot at the source column (-5, b, 0); its arrival is
// the first beat the detector column (5, b, 0) differs from the base run, for b = 0 (the knot on the path), 3, 4, 5, 6
// (paths that clear the ball of radius 2), in the vacuum and in E-GRV-0056's gas (8 of 24 slots per dock, Weyl phase
// = member index). 10 beats is the least possible arrival (no root advances x by more than one column a beat), and the
// way round the torus is 14. The DELAY is the paired arrival difference over the 17 members of the start family.
//
// Gates, fixed before the first run of this file:
//  T1 instrument: on all 17 members, energy and charge exact at every beat of every run; the held ball unchanged after
//     every run; the knot run equal to the surface run outside the ball, slot by slot and line by line, at every beat
//     of every run (the content invisible, E-GRV-0056's theorem checked again); and the no-knot vacuum a clock: every
//     husk column of every member has one and the same local period P0 > 0
//  T2 content dilation (the gravity signature: what a knot HOLDS slows time): on some member a column outside the ball
//     whose local period with the knot exceeds its period with the surface alone, OR at some b the paired content
//     delay (knot minus surface) positive by at least 3 standard errors in the vacuum or the gas
//  T3 a Shapiro-style delay from the surface: in the gas, the paired delay (surface minus none) positive by at least 3
//     standard errors at every b = 3, 4, 5, 6, and not increasing with b
//  T4 a slower clock near the surface: on every member more than half the columns of shell 3 have a local period
//     longer than P0, and every column of shells 9 to 12 keeps P0
// Verdict: pass if all hold; fail if T1 holds and any of T2 to T4 fails; partial if T1 fails.
//
// Reported, not gated: per shell and configuration the columns at P0, longer, shorter, and with no period; the phase of
// the columns at P0 against the no-knot clock (in phase, behind by s beats, or matching at no shift); every arrival
// (vacuum and gas, all three configurations, each b), including b = 0 where the ball blocks the straight path.
//
// DISCLOSED: one probe before this file (tmp/grv58-probe1.ts: side 16, two members, the NO-KNOT vacuum only) timed a
// beat (16 ms at side 16) and found the plain vacuum's whole state back at its start at beat 3 and every column at local
// period 6 (the collision schedule alternates, so the state's period 3 and the schedule's 2 give 6). It read no knot and
// no surface run. The gates above were written after it; P0 is read, not assumed. A smoke run of the code path (side
// 12, two members) printed only T1's instrument booleans.
//
// FIRST RUN (tmp/grv0058-run1.log, 2,321 s, the record): fail on T2, T3 and T4, recorded as is, no gate moved. T1
// holds: P0 = 6 in every column of every no-knot start. The surface and knot clocks read NO period in every column
// of every shell, not a longer one: the vacuum's period is a global coherence that the reflected vacuum pairs break
// along every line through the surface, and by beat 49 the break has reached the far side of the side-24 torus. So
// this clock cannot tell a slower tick from a broken one near a knot; what it shows is that a held surface
// scrambles the vacuum everywhere, not locally. The vacuum ray's no-knot arrival is 10 at b = 0, 4, 6 and 13 at
// b = 3, 5 (the hub vacuum's column classes differ with the row's parity). Title written after the run.
//
// Depth L2: measurements on the adopted knit's own vacuum and gas, read on the husk, against a no-knot control and a
// zero-content control. DETERMINISM: the 17 link starts and Weyl fills; nothing is drawn. NOTHING MOVES: the stream
// copies, and a reflected vibe takes the opposite slot of its own dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meanError } from '@/code/measure/held-knot'
import {
  CONFIGS,
  TIME,
  beatsPerMember,
  knotTimeSurvey,
  shellsOf,
  type Background,
  type Config,
} from '@/code/measure/knot-time'

export default experiment({
  id: 'gravity/knot-time-dilation',
  code: 'E-GRV-0058',
  title:
    "no time dilation near a held knot on the adopted knit, fail on T2, T3 and T4: the knot's content changes no clock and delays no signal (0 of every column, 0.000 +- 0.000 at every b in the vacuum and the gas), since the content is invisible outside bit for bit on 384 of 384 beats on 17 of 17 starts; the surface alone does not slow a clock but destroys it, every husk column of shells 3 to 12 on every start (136,425 column readings over 17 starts) losing the vacuum's period 6 (no period up to 24 over beats 49 to 96), where the no-knot vacuum keeps 6 in every column; a signal past the surface is not delayed in the gas (front at the light-cone bound of 10 beats, surface minus none 0.000 +- 0.086 at b = 3 and 4, 0 at 5 and 6), and in the vacuum it arrives one beat EARLY at b = 3 (12 against 13 on every start), 0.47 +- 0.24 late at b = 5, unchanged at b = 4 and 6, and 10.1 beats late only where the ball blocks the straight path (b = 0): a detour and a scrambled vacuum, not a slower clock",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const members = knotTimeSurvey(log)
    const S = TIME
    const shells = shellsOf(S.side)
    const columns = S.side ** 3
    const ballShell = (c: number): boolean => shells[c]! <= S.radius

    // T1
    const p0s = members.map(m => m.period.none[0]!)
    const p0 = p0s[0]!
    const uniform = members.every(m =>
      m.period.none.every(p => p === p0),
    )
    const lockBeats = beatsPerMember(S) / CONFIGS.length
    const g1 =
      p0 > 0 &&
      uniform &&
      members.every(
        m =>
          m.exact &&
          m.knotHeld &&
          m.contentBlind &&
          m.blindBeats === lockBeats,
      )

    // the clock per shell and configuration
    type Tally = {
      atP0: number
      longer: number
      shorter: number
      none: number
      columns: number
    }

    const tally = (c: Config, shell: number): Tally => {
      const t: Tally = {
        atP0: 0,
        longer: 0,
        shorter: 0,
        none: 0,
        columns: 0,
      }

      for (const m of members) {
        for (let x = 0; x < columns; x++) {
          if (shells[x] !== shell) {
            continue
          }

          const p = m.period[c][x]!

          t.columns++

          if (p === 0) {
            t.none++
          } else if (p === p0) {
            t.atP0++
          } else if (p > p0) {
            t.longer++
          } else {
            t.shorter++
          }
        }
      }

      return t
    }

    const phaseTally = (
      c: 'surface' | 'knot',
      shell: number,
    ): Record<string, number> => {
      const out: Record<string, number> = {}

      for (const m of members) {
        for (let x = 0; x < columns; x++) {
          if (shells[x] !== shell) {
            continue
          }

          const s = m.phase[c][x]!
          const key =
            s === -2 ? 'notP0' : s === -1 ? 'noShift' : `s${s}`

          out[key] = (out[key] ?? 0) + 1
        }
      }

      return out
    }

    // T2: the content
    let contentLonger = 0

    for (const m of members) {
      for (let x = 0; x < columns; x++) {
        if (ballShell(x)) {
          continue
        }

        if (m.period.knot[x]! > m.period.surface[x]!) {
          contentLonger++
        }
      }
    }

    const delay = (
      bg: Background,
      a: Config,
      b: Config,
      i: number,
    ): { mean: number; error: number } =>
      meanError(
        members.map(m => m.arrival[bg][a][i]! - m.arrival[bg][b][i]!),
      )
    const contentDelay = (['vacuum', 'gas'] as const).flatMap(bg =>
      S.impacts.map((_, i) => delay(bg, 'knot', 'surface', i)),
    )
    const g2 =
      contentLonger > 0 ||
      contentDelay.some(d => d.mean > 0 && d.mean >= 3 * d.error)

    // T3: the surface's delay in the gas at b = 3 .. 6
    const clear = S.impacts
      .map((b, i) => ({ b, i }))
      .filter(x => x.b > S.radius)
    const surfaceGas = clear.map(x =>
      delay('gas', 'surface', 'none', x.i),
    )
    const g3 =
      surfaceGas.every(d => d.mean > 0 && d.mean >= 3 * d.error) &&
      surfaceGas.every(
        (d, j) =>
          j === 0 ||
          d.mean <= (surfaceGas[j - 1] as { mean: number }).mean,
      )

    // T4: the clock near and far, per member
    const g4 = members.every(m => {
      let near = 0
      let nearLonger = 0
      let farKept = true

      for (let x = 0; x < columns; x++) {
        const sh = shells[x]!
        const p = m.period.surface[x]!

        if (sh === 3) {
          near++

          if (p > p0) {
            nearLonger++
          }
        }

        if (sh >= 9 && sh <= 12 && p !== p0) {
          farKept = false
        }
      }

      return 2 * nearLonger > near && farKept
    })
    const status = !g1 ? 'partial' : g2 && g3 && g4 ? 'pass' : 'fail'
    const f = (x: { mean: number; error: number }): string =>
      `${x.mean.toFixed(3)} +- ${x.error.toFixed(3)}`
    const arrivals = (bg: Background, c: Config, i: number): number[] =>
      members.map(m => m.arrival[bg][c][i]!)

    const spread = (xs: number[]): string => {
      const s = [...xs].sort((a, b) => a - b)

      return `${s[0]}/${s[Math.floor(s.length / 2)]}/${s[s.length - 1]}`
    }

    const metrics: Record<string, number> = {
      gate_T1: g1 ? 1 : 0,
      gate_T2: g2 ? 1 : 0,
      gate_T3: g3 ? 1 : 0,
      gate_T4: g4 ? 1 : 0,
      p0,
      clockUniform: uniform ? 1 : 0,
      contentLongerColumns: contentLonger,
    }
    const clockNotes: string[] = []

    for (const sh of S.shells) {
      for (const c of CONFIGS) {
        const t = tally(c, sh)

        metrics[`clock_${c}_r${sh}_atP0`] = t.atP0
        metrics[`clock_${c}_r${sh}_longer`] = t.longer
        metrics[`clock_${c}_r${sh}_shorter`] = t.shorter
        metrics[`clock_${c}_r${sh}_none`] = t.none
        clockNotes.push(
          `${c} r${sh}: ${t.atP0} at P0, ${t.longer} longer, ${t.shorter} shorter, ${t.none} none of ${t.columns}`,
        )
      }
    }

    const phaseNotes = S.shells.map(
      sh =>
        `r${sh} surface ${JSON.stringify(phaseTally('surface', sh))} knot ${JSON.stringify(phaseTally('knot', sh))}`,
    )
    const arrivalNotes: string[] = []

    for (const bg of ['vacuum', 'gas'] as const) {
      S.impacts.forEach((b, i) => {
        for (const c of CONFIGS) {
          const xs = arrivals(bg, c, i)

          metrics[`arrival_${bg}_${c}_b${b}_mean`] =
            xs.reduce((u, v) => u + v, 0) / xs.length
        }

        metrics[`delay_${bg}_surface_b${b}`] = delay(
          bg,
          'surface',
          'none',
          i,
        ).mean

        metrics[`delayError_${bg}_surface_b${b}`] = delay(
          bg,
          'surface',
          'none',
          i,
        ).error

        metrics[`delay_${bg}_content_b${b}`] = delay(
          bg,
          'knot',
          'surface',
          i,
        ).mean

        arrivalNotes.push(
          `${bg} b${b}: none ${spread(arrivals(bg, 'none', i))}, surface ${spread(arrivals(bg, 'surface', i))}, knot ${spread(arrivals(bg, 'knot', i))} (min/median/max); delay surface-none ${f(delay(bg, 'surface', 'none', i))}, knot-surface ${f(delay(bg, 'knot', 'surface', i))}`,
        )
      })
    }

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `near a held knot (husk radius 2, side 24, 17 starts) the vacuum clock (P0 = ${p0}) and a one-slot signal from (-5, b, 0) to (5, b, 0): content changes ${contentLonger} clock periods and delays the signal by ${contentDelay.map(f).join(', ')} (vacuum then gas, b = ${S.impacts.join(', ')}); the surface delays the gas front by ${surfaceGas.map(f).join(', ')} at b = ${clear.map(x => x.b).join(', ')}; shell 3 surface clock ${JSON.stringify(tally('surface', 3))}`,
      metrics,
      control: {
        noKnotClockUniform: uniform ? 1 : 0,
        contentInvisible: members.every(m => m.contentBlind) ? 1 : 0,
      },
      notes: `L2. Gates T1 ${g1}, T2 ${g2}, T3 ${g3}, T4 ${g4}. P0 per member ${p0s.join(', ')}. Clock by shell: ${clockNotes.join('; ')}. Phase against the no-knot clock: ${phaseNotes.join('; ')}. Arrivals (beats; ${S.signalBeats + 1} = never within ${S.signalBeats}): ${arrivalNotes.join('; ')}. Content-blind beats per member ${members.map(m => m.blindBeats).join(', ')} of ${lockBeats}. Per member seconds ${members.map(m => m.seconds.toFixed(0)).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
