// DOES THE VACUUM PROTECT A CODE? (E-CMP-0019). The ledger row: "quantum error correction, a code the vacuum protects",
// none. The knit is E-FND-0146's adopted classical knit (the coset-union vacuum under the lone bounce collision, exact
// inverse beat), side 8: 6,144 mesh lines of 8 docks.
//
// DERIVED BEFORE THE RUNS.
// 1. THE LINES ARE THE CODE'S QUDITS. A lone change stays on its mesh line (the line law, E-SPN-0098, E-RLT-0091). If
//    that holds for any change confined to a line, the beat never carries an error from one line to another, at any
//    time, and the exact inverse beat pulls a line's error back onto the same line. So a logical trit written on n
//    DIFFERENT lines, one copy each (a repetition code whose physical symbols are lines), keeps its distance n for all
//    time: any error on fewer than n/2 lines, of any size and at any beat, is corrected by pulling the state back to
//    beat 0 with the rule's own inverse and taking the majority of the n copies. Nothing else in the box needs to be
//    known. The vacuum does not spread errors between lines, so it protects the code without any active correction
//    while it runs.
// 2. THE DISTANCE IS EXACT, NOT MORE. An error on a majority of the lines that writes the same wrong value on their
//    copies decodes to that wrong value: the code corrects floor((n - 1)/2) lines and no more.
// 3. THE QUANTUM CODE, ARGUED AND NOT RUN. The same line locality means the rule's beat is a product over lines for a
//    change confined to a line, so any qutrit stabilizer code whose physical qudits are lines (for example the [[5,1,3]]
//    qutrit code) would keep its distance under the free beat. The adopted knit here is classical; the coined working
//    rule's lone vibe carries amplitude along its line (E-QTM-0157), and a quantum run is not made here.
// 4. THE PRICE. The protection is the line law itself, the same fact that stops matter from moving across lines and that
//    observation excludes (E-SPN-0126). A rule that lets matter move across lines (the candidate rule) spreads errors
//    between lines too, so this protection belongs to the adopted knit, not to the candidate.
//
// GATES, fixed before the gate run (probe 2 disclosed below), on all 17 link starts, logical values fear, calm, love,
// codes of n = 3 and n = 5 lines (lines 3, 1000, 2000, 3000, 4000; each copy on the line's first slot at its position
// 0), T = 24 beats, errors injected at beats 0, 5 and 11, each error rewriting 3 trits of a line (two vibes and one store
// trit, at Weyl positions along the line):
//  D1 CORRECTS: with errors on 1 line (n = 3) and on 1 or 2 lines (n = 5), every case decodes to the logical value
//  D2 LINE LOCAL: in every such case the runs with and without the error differ, at every beat after it and after the
//     pull-back, only on the errored lines
//  D3 EXACT DISTANCE (a gate that must fail to decode): an error writing the same wrong value on the copies of a
//     majority of the lines (2 of 3, 3 of 5) at beat 0 decodes to that wrong value, every case
// INSTRUMENT (partial on failure): with no error, 24 beats forward and 24 back return the code state bit for bit.
// CONTROL (partial on failure): C1 the majority reader can fail: decoding a state with 2 of 3 copies rewritten reads
//  the rewritten value (this is D3's reading; the gate there asks for it on every case).
// Verdict: pass if D1 to D3 hold with the instrument; fail if the instrument holds and a gate fails; partial otherwise.
//
// PROBE BEFORE THE GATE RUN, disclosed. tmp/hl-probe2.log (one start): a lone vibe flipped on lines 5, 40 and 77 at beat
// 3 reached no other line in 21 beats forward, nor after the pull-back to beat 0. The gates were written after it.
//
// FIRST RUN (tmp/hl-code-run1.log, 255 s): pass, every gate and the instrument. 2,754 of 2,754 correctable cases decode
// and stay on the errored lines forward and pulled back; 102 of 102 majority errors decode to the written value.
//
// Depth L2: a repetition code over lines, measured on the adopted knit's own dynamics and inverse over 17 starts. A
// CLASSICAL code; the quantum statement is argued (point 3). DETERMINISM: fixed lines, Weyl error positions, the 17
// link starts. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox, twoWay, vacuumState, type ArrowBox } from '@/code/measure/second-law-husk'
import { cloneReduced, type Reduced } from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { GOLDEN } from '@/code/tool/weyl'
import { differingLines, lineSlot, lineStore, meshLineMap, sameState, type MeshLineMap } from '@/code/measure/line-information'

const SIDE = 8
const BLOCK = 4
const BEATS = 24
const CODE_LINES: readonly number[] = [3, 1000, 2000, 3000, 4000]
const VALUES: readonly number[] = [-1, 0, 1]
const ERROR_BEATS: readonly number[] = [0, 5, 11]

const next = (v: number): number => (v === 1 ? -1 : v + 1)

// the code state: the vacuum with the logical value on each code line's copy slot
function encode(vac: Reduced, map: MeshLineMap, lines: readonly number[], v: number): Reduced {
  const s = cloneReduced(vac)

  for (const id of lines) {
    const k = lineSlot(map, id, 0)

    s.vibe[k] = v
    s.point[k] = 0
  }

  return s
}

// an error rewriting 3 trits of line id: two vibes (first and second slot) and one store trit, at Weyl positions
function hurt(s: Reduced, map: MeshLineMap, id: number, salt: number): void {
  const len = (map.docks[id] as number[]).length
  const at = (j: number): number => Math.floor(((salt + j) * GOLDEN) % 1 * len)
  const a = lineSlot(map, id, at(1))
  const b = lineSlot(map, id, at(2), true)
  const c = lineStore(map, id, at(3))

  s.vibe[a] = next(s.vibe[a] as number)
  s.vibe[b] = next(s.vibe[b] as number)
  s.store[c] = next(s.store[c] as number)
}

// the error-free code's states after each beat 1..T (the clean run, shared by every trial of one code)
function cleanTrack(box: ArrowBox, code: Reduced): Reduced[] {
  const r = twoWay(box, code)
  const out: Reduced[] = []

  for (let t = 0; t < BEATS; t++) {
    r.forward()
    out.push(cloneReduced(r.state()))
  }

  return out
}

// run T beats with the error injected before beat tError on the given lines, pull back to 0, and read; the clean run
// pulled back is the code itself (the beat is a bijection, checked by the instrument)
function trial(box: ArrowBox, map: MeshLineMap, code: Reduced, clean: readonly Reduced[], lines: readonly number[], errored: readonly number[], tError: number, salt: number): { decoded: number; local: boolean } {
  const hit = twoWay(box, code)
  const allowed = new Set(errored)
  let local = true

  for (let t = 0; t < BEATS; t++) {
    if (t === tError) for (const [i, id] of errored.entries()) hurt(hit.state(), map, id, salt + 7 * i)

    hit.forward()

    if (t >= tError) for (const id of differingLines(map, clean[t] as Reduced, hit.state())) local = local && allowed.has(id)
  }

  for (let t = 0; t < BEATS; t++) hit.backward()

  for (const id of differingLines(map, code, hit.state())) local = local && allowed.has(id)

  return { decoded: majority(hit.state(), map, lines), local }
}

// the majority of the copies (ties read as NaN)
function majority(s: Reduced, map: MeshLineMap, lines: readonly number[]): number {
  const votes = new Map<number, number>()

  for (const id of lines) {
    const v = s.vibe[lineSlot(map, id, 0)] as number

    votes.set(v, (votes.get(v) ?? 0) + 1)
  }

  const [best, count] = [...votes.entries()].sort((a, b) => b[1] - a[1])[0] as [number, number]

  return count * 2 > lines.length ? best : NaN
}

// errors placed on e of the code's lines, every choice of e lines
function subsets(lines: readonly number[], e: number): number[][] {
  if (e === 0) return [[]]
  if (lines.length < e) return []

  const [head, ...rest] = lines as [number, ...number[]]

  return [...subsets(rest, e - 1).map(s => [head, ...s]), ...subsets(rest, e)]
}

export default experiment({
  id: 'computation/line-code',
  code: 'E-CMP-0019',
  title:
    'the adopted knit protects a code, pass (classical): a trit written once on each of n mesh lines is a repetition code whose symbols are lines, and because a change never leaves its line the beat never carries an error between lines, so pulling back with the rule own inverse and taking the majority corrects any error on fewer than n/2 lines at any beat; on 17 link starts, 3 logical values, n = 3 and 5, errors of 3 trits at beats 0, 5 and 11, every case decodes and every difference stays on the errored lines, forward and pulled back, while an error on a majority decodes wrong (distance exact); the quantum code over lines is argued, not run, and the protection is the line law itself, which the candidate rule removes',
  category: 'computation',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const members = startFamily(16)
    let cases = 0
    let correct = 0
    let localCases = 0
    let majorityCases = 0
    let majorityWrong = 0
    let returns = true

    for (const [mi, member] of members.entries()) {
      const box = withStart(member, () => arrowBox(SIDE, BLOCK))
      const map = meshLineMap(box)
      const vac = vacuumState(box)

      for (const n of [3, 5]) {
        const lines = CODE_LINES.slice(0, n)

        for (const v of VALUES) {
          const code = encode(vac, map, lines, v)

          // instrument: no error, forward and back
          const r = twoWay(box, code)

          for (let t = 0; t < BEATS; t++) r.forward()
          for (let t = 0; t < BEATS; t++) r.backward()

          returns = returns && sameState(r.state(), code)

          const clean = cleanTrack(box, code)

          for (let e = 1; 2 * e < n; e++) {
            for (const errored of subsets(lines, e)) {
              for (const tError of ERROR_BEATS) {
                const out = trial(box, map, code, clean, lines, errored, tError, mi * 101 + tError)

                cases++
                if (out.decoded === v) correct++
                if (out.local) localCases++
              }
            }
          }

          // D3: a majority of the copies rewritten to one wrong value at beat 0
          const w = next(v)
          const hurtMajority = cloneReduced(code)

          for (const id of lines.slice(0, (n + 1) / 2)) hurtMajority.vibe[lineSlot(map, id, 0)] = w

          const m = twoWay(box, hurtMajority)

          for (let t = 0; t < BEATS; t++) m.forward()
          for (let t = 0; t < BEATS; t++) m.backward()

          majorityCases++
          if (majority(m.state(), map, lines) === w) majorityWrong++
        }
      }
    }

    const D1 = correct === cases
    const D2 = localCases === cases
    const D3 = majorityWrong === majorityCases
    const instrument = returns
    const C1 = D3
    const status = !instrument || !C1 ? 'partial' : D1 && D2 && D3 ? 'pass' : 'fail'
    const flag = (b: boolean): number => (b ? 1 : 0)
    const metrics: Record<string, number> = {
      D1: flag(D1),
      D2: flag(D2),
      D3: flag(D3),
      instrument: flag(instrument),
      C1: flag(C1),
      starts: members.length,
      cases,
      correct,
      localCases,
      majorityCases,
      majorityWrong,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `on ${members.length} link starts, n = 3 and 5, values fear, calm, love, errors of 3 trits on fewer than n/2 lines at beats ${ERROR_BEATS.join(', ')}: D1 ${D1} (${correct} of ${cases} decode); D2 ${D2} (${localCases} of ${cases} stay on the errored lines, forward and pulled back); D3 ${D3} (${majorityWrong} of ${majorityCases} majority errors decode to the written value); instrument ${instrument} (forward and back bit for bit with no error)`,
      metrics,
      control: { C1: flag(C1), instrument: flag(instrument) },
      notes: `L2. Code lines ${CODE_LINES.join(', ')}; copies on each line's first slot at position 0. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
