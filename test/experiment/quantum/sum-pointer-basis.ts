// A pointer basis from SUM: a token read by a gas of SUM records in the cold vacuum dephases in the role basis
// only, and makes no mana.
//
// E-QTM-0114 coupled a token to a golden gas in the cold vacuum through the fear beat and found no pointer
// basis: all 12 grid-line starts ended in one whole, since the fear beat is a partial swap that replaces a
// token rather than reading it. Here the environment is the same (code/measure/cold-gas-bath, E-QTM-0114's
// fill, knit and record), and every meeting between a kept token and a gas token is a SUM (E-QTM-0127): the
// gas token is opened on its classical role line (the role stabilizer state its point names), SUM acts, and
// the gas token is traced out at once (the collision model; a gas token met twice has lost its memory of
// the first meeting, as in E-QTM-0114). The gas token's classical point is not updated by the SUM.
//
// SUM has an orientation, and it decides what is read: the control's role is copied into the target, and
// the target's tilt into the control's (E-QTM-0127's permutation). So a token that is the control is
// measured in the role basis, and one that is the target is measured in the tilt basis. Two orientations:
//   system: the kept token is always the control (the gas reads it; an assumption, not a rule of the knit)
//   record: the first token of the knit's meeting record is the control (an orientation the knit supplies)
// and two link settings: live (the knit's own grid moves on the crossings) and flat (every crossing the
// identity, E-QTM-0116's flat run).
//
// Predictions, written before the first run:
//   - one SUM with a bath token on a role, diagonal or antidiagonal line erases a token's role coherence
//     (its off-diagonal weight in the role basis) completely, and one on a tilt line leaves it (a phase
//     kick): the channel is all or nothing, so the decoherence rate is the rate of SUM meetings
//   - system orientation, flat links: the 3 role-line starts stay exactly pure, the 9 others end at purity
//     exactly 1/3, so the 12 starts end in 4 distinct wholes (E-QTM-0114: 1)
//   - record orientation: the token is sometimes the target, so the tilt is read too, and every start ends
//     mixed, no pointer basis
//   - live links rotate the role axis between docks, so a dephased token regains role coherence in the next
//     dock's frame
//   - mana: SUM is a Clifford, so no SUM step changes mana, and a trace never raises it; the pair's own
//     fear beats are the only source
//
// Gates, fixed before the first run:
//   G1 the ledger: at every SUM of every run, mana, loves and fears are unchanged, and the control's role
//      distribution is unchanged; no trace raises mana; no link changes mana.
//   G2 the per-meeting channel: a token on each of the 12 lines, one SUM into a bath token on each of the 12
//      lines (144 cases): the off-diagonal weight after is exactly 0 for role, diagonal and antidiagonal bath
//      lines, and exactly its value before for tilt bath lines.
//   G3 the pointer basis: system orientation, flat links, f = 1/8 (at least 5 gas meetings): the role-line
//      starts end at purity exactly 1, every other start at exactly 1/3, and the 12 end in exactly 4
//      distinct wholes.
//   G4 dephasing sticks: system orientation, flat links, at every f with a gas meeting, the tilt-line start's
//      off-diagonal weight is exactly 0 from its first gas meeting to the end, and 2/3 before it.
// Reported: the first-meeting beat and gas meetings per density, the record orientation's control and target
// counts and final purities, the live runs, and the love-fear pair's mana with SUM gas (own meetings the
// color-mode fear beat, as E-QTM-0114) against E-QTM-0114's.
//
// FIRST RUN (2026-09-26, 5.6 s): G1 to G4 pass. Readings added after the first run, gates unchanged: the
// single token's meetings with its own pair partner (a gas token when only one token is kept), the pair's own
// meeting count, and its purity before its first own meeting.
//   - the channel is all or nothing, 144 of 144: the decoherence rate is the SUM meeting rate, and there is
//     no smooth rate law to fit. The tilt start's role coherence is 2/3 until its first SUM and exactly 0
//     after, at every density (first SUM at beat 0 for f <= 1/8, beat 4 at f = 1/4). At f <= 1/32 all 160
//     of the single token's meetings are with its pair partner (f = 1/64 and 1/32 place no gas near it).
//   - system orientation, flat links, f = 1/8, 69 meetings: role starts purity 1, the other 9 exactly 1/3,
//     4 distinct final wholes (E-QTM-0114: 1). The role basis is the pointer basis.
//   - PREDICTION WRONG: the record orientation (the token the target on 25 of 69 meetings) keeps the same
//     pointer basis, role starts pure and 4 distinct wholes. As the target of a bath token on a role line the
//     token's role is shifted by a definite amount (a unitary) and its tilt is copied into the bath token's
//     tilt, which is uniform, so nothing is learned. The basis is set by the bath token's line class (role
//     lines, the convention of E-QTM-0114), not by the orientation.
//   - live links: every start ends at purity 1/3 and all 12 in one whole, both orientations. The links
//     rotate the role axis from dock to dock, so records in each dock's frame read different axes of the
//     start (at f = 1/4 role coherence reappears on 3 beats after a link, and the next SUM erases it).
//   - mana: 0 changes at every SUM (G1). The love-fear pair isolated keeps late mana 0.660 (E-QTM-0114:
//     0.66). With SUM gas at f = 1/16, 1/8, 1/4 its mana is exactly 0 on every beat: its 6, 2 and 0 own
//     meetings make none and it ends at purity 1/9. The fear-beat gas of E-QTM-0114 made 73.4 units of mana
//     at its kernels and left 0.14 to 0.23. A SUM bath makes no magic, and here none survives.
//
// FOURTH RUN (4.1 s), after the shared fear weave changed under this session (E-QTM-0123 frames, E-QTM-0124
// grid-move convention): each kept coordinate now carries its frame and is reflected when its token meets
// with the other sign, and a gas token's role is read as x of its grid index x + 3 y. Every number above
// repeats. No gate was changed.
//
// The flow (the coordinator's question 2): E-QTM-0127 G8 shows the flow update is SUM with the copied vibe
// as control and the flow as record, so by G2 here a vibe opened as a qutrit (a stand-in: the model's vibes
// are never in superposition) would lose all vibe-basis coherence at every beat, with the flow as pointer and
// the vibe distribution untouched. The flow records the vibe, not the role (E-QTM-0127), so it selects no
// role basis.
//
// Depth L2. The husk is not read: SUM and the fear beat act on roles, never on where a vibe is, so every
// number is a role-grid number; the meeting schedule is the bulk knit's (side-3 D4 box).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { carryCoordinate, carryPhaseCoordinate, CONJUGATE_POINT, fearKernels, meetWhole, translatedOf, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { lineKnot } from '@/code/measure/knot-histories'
import { coldGas, type ColdGas } from '@/code/measure/cold-gas-bath'
import { LINE_CLASSES, marginalOne, openToken, permuteTwo, sumPermutation, traceOut } from '@/code/measure/sum-record'

const BEATS = 480
const DENSITIES = [0, 1 / 32, 1 / 16, 1 / 8, 1 / 4]
const POINTER_DENSITY = 1 / 8
const OMEGA = (2 * Math.PI) / 3
const TILT_LINE_0 = [0, 3, 6]

type Orientation = 'system' | 'record'

const unitsOf = (w: Whole): bigint => w.weight.reduce((s, x) => s + x, 0n)
const roleShares = (m: readonly bigint[]): bigint[] => [0, 1, 2].map(a => (m[3 * a] ?? 0n) + (m[3 * a + 1] ?? 0n) + (m[3 * a + 2] ?? 0n))
const purityOf = (w: Whole): number => {
  const u = Number(unitsOf(w))

  return 3 ** w.tokens.length * w.weight.reduce((s, x) => s + (Number(x) / u) ** 2, 0)
}
// the role-basis off-diagonal weight of one token, Tr(rho_off^2) = 3 sum (W - P / 3)^2, exact as a ratio
const offDiagonal = (m: readonly bigint[]): { num: bigint; den: bigint } => {
  const p = roleShares(m)
  const u = m.reduce((s, x) => s + x, 0n)
  // (W - P/3) in units of u / 3: 3 W - P
  const num = m.reduce((s, x, i) => s + (3n * x - (p[Math.floor(i / 3)] ?? 0n)) ** 2n, 0n)

  return { num: 3n * num, den: 9n * u * u }
}
const ratio = (r: { num: bigint; den: bigint }): number => Number((r.num * 10n ** 15n) / r.den) / 1e15
const manaOf = (w: Whole): number => {
  const { loves, fears } = wholeLovesAndFears(w)

  return Math.log(Number(((loves + fears) * 10n ** 15n) / (loves - fears)) / 1e15)
}
const key = (w: Whole): string => {
  const u = unitsOf(w)

  return w.weight.map(x => ((x * 10n ** 20n) / u).toString()).join(',')
}

type RunResult = {
  final: Whole
  gasMeetings: number
  // of the gas meetings, those with the other token of the love-fear pair (a single kept token's partner)
  partnerMeetings: number
  ownMeetings: number
  // the beat of the pair's first own meeting and the pair's purity just before it
  firstOwn?: { beat: number; purity: number }
  firstGasBeat: number
  asControl: number
  asTarget: number
  purity: number[]
  off: { num: bigint; den: bigint }[]
  mana: number[]
  ledgerBad: number
  manaAtOwn: number
  manaAtTraces: number
  linkRoleChanges: number
}

function runBath(input: { gas: ColdGas; keep: readonly number[]; start: Whole; orientation: Orientation; flat: boolean }): RunResult {
  const { gas, keep, start, orientation, flat } = input
  const sum = sumPermutation()
  const kernels = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })!
  const coordinate = new Map(keep.map((t, i) => [t, i]))
  const hidden = Int8Array.from(gas.point)
  let whole = start
  // each kept coordinate's frame, the sign it is written in (E-QTM-0123): 0 until its first meeting, then
  // the sign it met with; a coordinate whose token meets with the other sign is reflected first
  const frame = new Array<number>(keep.length).fill(0)
  const align = (c: number, sign: number): void => {
    if ((frame[c] ?? 0) !== 0 && frame[c] !== sign) {
      whole = carryPhaseCoordinate(whole, c, CONJUGATE_POINT)
    }

    frame[c] = sign
  }
  const out: RunResult = {
    final: start,
    gasMeetings: 0,
    partnerMeetings: 0,
    ownMeetings: 0,
    firstGasBeat: -1,
    asControl: 0,
    asTarget: 0,
    purity: [],
    off: [],
    mana: [],
    ledgerBad: 0,
    manaAtOwn: 0,
    manaAtTraces: 0,
    linkRoleChanges: 0,
  }

  gas.records.forEach((record, t) => {
    record.meetings.forEach(([ta, tb], m) => {
      const ca = coordinate.get(ta)
      const cb = coordinate.get(tb)
      const [sa, sb] = record.signs?.[m] ?? [1, 1]

      if (ca !== undefined && cb !== undefined) {
        align(ca, sa)
        align(cb, sb)

        const before = manaOf(whole)

        out.firstOwn = out.firstOwn ?? { beat: t, purity: purityOf(whole) }

        // the comoving fear beat (adopted 2026-09-26): each kernel read about the two coordinates' own points
        const [c0, c1] = sa === sb || sa > 0 ? [ca, cb] : [cb, ca]
        const kernel = translatedOf(sa === sb ? kernels.like : kernels.unlike, whole.own?.[c0] ?? 0, whole.own?.[c1] ?? 0)

        whole = meetWhole({ whole, a: c0, b: c1, kernel4: kernel, divisor: sa === sb ? kernels.likeDivisor : kernels.unlikeDivisor, fixed: false })!
        out.manaAtOwn += manaOf(whole) - before
        out.ownMeetings++

        return
      }

      if (ca === undefined && cb === undefined) {
        return
      }

      const c = (ca ?? cb) as number
      const other = ca !== undefined ? tb : ta

      align(c, ca !== undefined ? sa : sb)

      const control = orientation === 'system' || ca !== undefined
      const k = whole.tokens.length
      // the hidden point is a grid index x + 3 y with x the role (fear-weave's GRID_OF_PHASE, E-QTM-0124)
      const role = (hidden[other] ?? 0) % 3
      const opened = openToken(whole, -1, [3 * role, 3 * role + 1, 3 * role + 2])
      const met = control ? permuteTwo(opened, c, k, sum) : permuteTwo(opened, k, c, sum)
      const lf0 = wholeLovesAndFears(opened)
      const lf1 = wholeLovesAndFears(met)
      const controlCoordinate = control ? c : k
      const roleKept =
        roleShares(marginalOne(opened, controlCoordinate)).every((x, a) => x === roleShares(marginalOne(met, controlCoordinate))[a])
      const traced = traceOut(met, k)
      const manaMet = manaOf(met)
      const manaTraced = manaOf(traced)

      out.ledgerBad += lf0.loves === lf1.loves && lf0.fears === lf1.fears && Math.abs(manaOf(opened) - manaMet) < 1e-12 && roleKept ? 0 : 1
      out.ledgerBad += manaTraced > manaMet + 1e-12 ? 1 : 0
      out.manaAtTraces += manaTraced - manaMet
      out.gasMeetings++
      out.partnerMeetings += gas.pair.includes(other) ? 1 : 0
      out.firstGasBeat = out.firstGasBeat < 0 ? t : out.firstGasBeat
      out.asControl += control ? 1 : 0
      out.asTarget += control ? 0 : 1
      whole = traced
    })

    for (const [tk, g] of record.crossings) {
      const act = gas.weave.moves.act[flat ? gas.weave.moves.identity : g] ?? []
      const c = coordinate.get(tk)

      if (c === undefined) {
        hidden[tk] = act[hidden[tk] ?? 0] ?? 0
      } else if (!flat && g !== gas.weave.moves.identity) {
        const before = manaOf(whole)
        const rolesBefore = roleShares(marginalOne(whole, c))

        // a crossing carries the coordinate's own point with its weights (the comoving beat, 2026-09-26)
        whole = carryCoordinate(whole, c, act)
        out.ledgerBad += Math.abs(manaOf(whole) - before) > 1e-12 ? 1 : 0
        out.linkRoleChanges += roleShares(marginalOne(whole, c)).every((x, a) => x === rolesBefore[a]) ? 0 : 1
      }
    }

    out.purity.push(purityOf(whole))
    out.mana.push(manaOf(whole))

    if (keep.length === 1) {
      out.off.push(offDiagonal(marginalOne(whole, 0)))
    }
  })

  out.final = whole

  return out
}

export default experiment({
  id: 'quantum/sum-pointer-basis',
  code: 'E-QTM-0128',
  title:
    'a pointer basis from SUM: a token read by a gas of SUM records in the cold vacuum dephases in the role basis only, all or nothing at each meeting, the role starts stay pure while every other start ends at purity 1/3, and SUM makes no mana; which basis is read is set by the orientation of the SUM, and live links rotate it',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const sum = sumPermutation()
    const lines = LINE_CLASSES.flatMap(c => c.lines.map(line => ({ c: c.name, line })))

    // G2: the per-meeting channel
    let channelBad = 0

    for (const s of lines) {
      for (const b of lines) {
        const token: Whole = { tokens: [0], weight: Array.from({ length: 9 }, (_, p) => (s.line.includes(p) ? 1n : 0n)) }
        const before = offDiagonal(marginalOne(openToken(token, -1, b.line), 0))
        const after = offDiagonal(marginalOne(permuteTwo(openToken(token, -1, b.line), 0, 1, sum), 0))
        const erased = after.num === 0n
        const kept = after.num * before.den === before.num * after.den

        channelBad += (b.c === 'tilt' ? kept : erased) ? 0 : 1
      }
    }

    const per: Record<string, number> = {}
    let ledgerBad = 0
    let sticks = true
    let pointer = { ok: false, distinct: -1 }

    for (const f of DENSITIES) {
      const gas = coldGas({ f, beats: BEATS })
      const [pa] = gas.pair
      const tag = `f${Math.round(f * 64)}of64`
      const tiltStart: Whole = { tokens: [pa], weight: Array.from({ length: 9 }, (_, p) => (TILT_LINE_0.includes(p) ? 1n : 0n)) }

      for (const flat of [true, false]) {
        const r = runBath({ gas, keep: [pa], start: tiltStart, orientation: 'system', flat })
        const name = `${tag}_${flat ? 'flat' : 'live'}`

        ledgerBad += r.ledgerBad
        per[`${name}_gasMeetings`] = r.gasMeetings
        per[`${name}_partnerMeetings`] = r.partnerMeetings
        per[`${name}_firstGasBeat`] = r.firstGasBeat
        per[`${name}_offDiagonalFinal`] = ratio(r.off[r.off.length - 1] ?? { num: 0n, den: 1n })
        per[`${name}_purityFinal`] = r.purity[r.purity.length - 1] ?? -1
        per[`${name}_beatsWithRoleCoherenceAfterFirstMeeting`] = r.firstGasBeat < 0 ? 0 : r.off.slice(r.firstGasBeat).filter(o => o.num !== 0n).length
        per[`${name}_linkRoleChanges`] = r.linkRoleChanges

        if (flat && r.gasMeetings > 0) {
          sticks =
            sticks &&
            r.off.every((o, t) => (t >= r.firstGasBeat ? o.num === 0n : o.num * 3n === 2n * o.den))
        }
      }

      // the pointer basis at f = 1/8, both orientations and both link settings
      if (f === POINTER_DENSITY) {
        for (const orientation of ['system', 'record'] as const) {
          for (const flat of [true, false]) {
            const runs = lines.map(l => runBath({ gas, keep: [pa], start: { tokens: [pa], weight: Array.from({ length: 9 }, (_, p) => (l.line.includes(p) ? 1n : 0n)) }, orientation, flat }))
            const name = `pointer_${orientation}_${flat ? 'flat' : 'live'}`
            const distinct = new Set(runs.map(r => key(r.final))).size

            runs.forEach(r => {
              ledgerBad += r.ledgerBad
            })
            LINE_CLASSES.forEach((c, k) => {
              const family = runs.slice(3 * k, 3 * k + 3)

              per[`${name}_${c.name}MeanFinalPurity`] = family.reduce((s, r) => s + (r.purity[r.purity.length - 1] ?? 0), 0) / 3
            })
            per[`${name}_distinctFinalWholes`] = distinct
            per[`${name}_gasMeetings`] = runs[0]?.gasMeetings ?? -1
            per[`${name}_asControl`] = runs[0]?.asControl ?? -1
            per[`${name}_asTarget`] = runs[0]?.asTarget ?? -1

            if (orientation === 'system' && flat) {
              const roleStarts = runs.slice(0, 3)
              const others = runs.slice(3)

              pointer = {
                ok:
                  (runs[0]?.gasMeetings ?? 0) >= 5 &&
                  roleStarts.every(r => Math.abs((r.purity[r.purity.length - 1] ?? 0) - 1) < 1e-12) &&
                  others.every(r => Math.abs((r.purity[r.purity.length - 1] ?? 0) - 1 / 3) < 1e-12) &&
                  distinct === 4,
                distinct,
              }
            }
          }
        }
      }

      // the love-fear pair with SUM gas and its own fear beat, live links (E-QTM-0114's pair)
      if (f === 0 || f >= 1 / 16) {
        const r = runBath({ gas, keep: [...gas.pair], start: lineKnot([...gas.pair], [0, 1, 2], [0, 1, 2]), orientation: 'system', flat: false })

        ledgerBad += r.ledgerBad
        per[`pair_${tag}_gasMeetings`] = r.gasMeetings
        per[`pair_${tag}_ownMeetings`] = r.ownMeetings
        per[`pair_${tag}_firstGasBeat`] = r.firstGasBeat
        per[`pair_${tag}_firstOwnMeetingBeat`] = r.firstOwn?.beat ?? -1
        per[`pair_${tag}_purityBeforeFirstOwnMeeting`] = r.firstOwn?.purity ?? -1
        per[`pair_${tag}_manaMax`] = Math.max(...r.mana)
        per[`pair_${tag}_manaLate`] = r.mana.slice(-48).reduce((a, b) => a + b, 0) / 48
        per[`pair_${tag}_manaMadeAtOwnMeetings`] = r.manaAtOwn
        per[`pair_${tag}_manaLostAtTraces`] = r.manaAtTraces
        per[`pair_${tag}_purityFinal`] = r.purity[r.purity.length - 1] ?? -1
        per[`pair_${tag}_lastBeatWithMana`] = r.mana.reduce((last, m, t) => (m > 1e-12 ? t : last), -1)
      }
    }

    const gates = {
      G1: ledgerBad === 0,
      G2: channelBad === 0,
      G3: pointer.ok,
      G4: sticks,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a SUM meeting with a bath token on a role line erases a token\'s role coherence completely (144 of 144 line pairs: role, diagonal and antidiagonal bath lines erase, tilt bath lines keep), so the rate is the SUM meeting rate; in the cold vacuum gas on flat links the 3 role starts stay exactly pure and the 9 others end at exactly 1/3 after 69 meetings, 4 distinct wholes where the fear-beat gas left 1, with either orientation of the SUM, since the bath token\'s line class sets the basis; live links rotate the role axis dock to dock and every start ends mixed; SUM never changes mana, and with a SUM gas the love-fear pair makes none at all (mana 0 on every beat at f = 1/16 to 1/4, against 0.66 isolated)',
      metrics: {
        channelCases: lines.length * lines.length,
        channelBad,
        ledgerBad,
        ...per,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat (the pair's own meetings read about the own points, crossings and frame rewrites carrying them; the gas meeting is SUM and is unchanged): status pass as before; the isolated pair's mana max 0.9856 -> 1.0170, late mana 0.6603 -> 0.6144. " + ('L2, exact BigInt wholes, golden and silver Weyl fills (code/measure/cold-gas-bath, E-QTM-0114\'s environment), no random numbers. The gas token is opened on its role line at a SUM and traced at once (the collision model); its classical point is not updated. A fear of the pair is stored at the reflected point (color mode), so a SUM on it acts on the conjugate representation: it still reads the role.'),
    })
  },
})
