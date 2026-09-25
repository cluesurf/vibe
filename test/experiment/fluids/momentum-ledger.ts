// Where the committed rule breaks momentum, piece by piece, and which momentum-like quantity it keeps.
//
// E-FLD-0020 found the committed turning weave conserves charge and not momentum. This books every piece
// of its collision. The rule is run through code/rule/momentum-weave's spec form, which is first checked
// bit for bit against turningWeave (the pair table and the bind table) on every beat, and whose ledger
// books, per act of each piece, the change of two momenta, both exact integer 4-vectors over the D4 roots:
// - the particle momentum P = sum over slots of |tone| times the slot's root (every tone a unit mover,
//   the momentum of a lattice gas);
// - the charge current J = sum over slots of tone times the slot's root (E-FLD-0020's "momentum along x").
// Pieces: on the five plain couples of a beat the wire's table, split by transition (create from calm,
// flip, annihilate to calm, hop of a lone tone to the other slot, inert), and on the swap couple the first
// exchange (out), the table, and the second exchange (back). Streaming moves no momentum.
//
// Measured on a dense hash state (side 5, 48 beats, two schedule periods), on the empty vacuum and on the
// vacuum with one love: the ledger closes exactly (the pieces' booked change equals the state's change on
// every beat), and which pieces move P and J.
//
// Then which integer quantities the rule could keep at all: the changes every piece can make on every
// couple state, every couple and every beat, are rows of Z^12 (in line momenta N_L, P = sum N_L e_L), and
// the Smith form of their span lists every exact linear invariant and every residue invariant
// (code/measure/integer-lattice). The same on P itself (Z^4), which asks whether any residue of P
// (a lattice momentum mod a sublattice) survives, and on J.
//
// Controls: the hop-free bind table under the same schedule, which the lattice analysis says keeps one
// exact line invariant the committed rule does not (the sum of all N_L), checked on a run; and the
// momentum weave (E-FLD-0022's member), whose ledger must book zero P on every piece, so the ledger can
// say no.
//
// Depth L2: an exact accounting of a constructed rule, with a control that keeps what the rule breaks.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { turningWeave } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { latticeQuotient } from '@/code/measure/integer-lattice'
import {
  BIND_SPEC,
  COMMITTED_SPEC,
  coupleChanges,
  type Ledger,
  lineCurrent,
  lineMomenta,
  lineMomentum,
  momentumOf,
  momentumWeave,
  MOMENTUM_WEAVE,
  type MomentumWeaveSpec,
} from '@/code/rule/momentum-weave'

const SIDE = 5
const BEATS = 48
const PERIOD = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2
const P_PIECES = ['bare:hop', 'swap:hop', 'swap:out', 'swap:back']
const PAIR_PIECES = ['create', 'flip', 'annihilate']

const MESH = d4BoxMesh({ side: SIDE })
const OPPOSITE = meshOpposites(MESH)

function dense(): Will {
  const will = makeWill(MESH)

  for (let i = 0; i < will.data.length; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    will.data[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
  }

  return will
}

function loneLove(): Will {
  const will = makeWill(MESH)

  will.data[d4BoxCell({ coordinates: [2, 2, 2, 2], side: SIDE }) * 24 + 5] = 1

  return will
}

const size = (v: readonly number[]): number => v.reduce((s, x) => s + Math.abs(x), 0)
const drift = (a: readonly number[], b: readonly number[]): number => Math.max(...a.map((x, k) => Math.abs(x - (b[k] ?? 0))))

// run a member with its ledger, checking that the booked change closes on every beat
function booked(spec: MomentumWeaveSpec, start: Will) {
  const ledger: Ledger = new Map()
  const run = momentumWeave({ spec, opposite: OPPOSITE, ledger })
  const first = momentumOf(start.data)
  const lineSums: number[] = []

  let will = start
  let closes = true
  let pDrift = 0
  let jDrift = 0
  let periodP: number[] = []

  for (let t = 0; t < BEATS; t++) {
    const before = momentumOf(will.data)
    const earlier = new Map([...ledger].map(([k, v]) => [k, [...v.p]]))

    will = beat(will, run(t))

    const after = momentumOf(will.data)
    const change = [0, 1, 2, 3].map(axis => [...ledger].reduce((s, [k, v]) => s + (v.p[axis] ?? 0) - (earlier.get(k)?.[axis] ?? 0), 0))

    closes = closes && change.every((x, axis) => x === (after.p[axis] ?? 0) - (before.p[axis] ?? 0))
    pDrift = Math.max(pDrift, drift(after.p, first.p))
    jDrift = Math.max(jDrift, drift(after.j, first.j))
    lineSums.push(lineMomenta(will.data, OPPOSITE).reduce((s, x) => s + x, 0))

    if (t === PERIOD - 1) {
      periodP = after.p
    }
  }

  const last = momentumOf(will.data)

  return {
    ledger,
    closes,
    pDrift,
    jDrift,
    periodDrift: drift(last.p, periodP),
    lineSumDrift: Math.max(...lineSums.map(x => Math.abs(x - (lineSums[0] ?? 0)))),
  }
}

const entry = (ledger: Ledger, piece: string) => ledger.get(piece) ?? { count: 0, moved: 0, p: [0, 0, 0, 0], j: [0, 0, 0, 0], pSize: 0, jSize: 0 }

export default experiment({
  id: 'fluids/momentum-ledger',
  code: 'E-FLD-0021',
  title:
    'the committed rule breaks the particle momentum in exactly two places, the hop of a lone tone on a wire (a reversal, 2 roots per act, 96 percent of the broken momentum on a dense state) and the palindromic exchange (a turn of a lone tone between the couple\'s lines), while the create, flip and annihilate of the pair clock move no particle momentum and all of the charge current; no residue of either momentum survives (the Smith form of every possible change leaves only charge parity), and removing the hop leaves one exact line invariant, the sum of the twelve line momenta',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the spec form is the committed rule (and its bind form), bit for bit
    const identical = (['pair', 'bind'] as const).map(table => {
      const reference = turningWeave({ opposite: OPPOSITE, table })
      const mine = momentumWeave({ spec: table === 'pair' ? COMMITTED_SPEC : BIND_SPEC, opposite: OPPOSITE })

      let a = dense()
      let b = dense()
      let same = true

      for (let t = 0; t < BEATS; t++) {
        a = beat(a, reference(t))
        b = beat(b, mine(t))
        same = same && a.data.every((x, i) => x === b.data[i])
      }

      return same
    })

    const committed = booked(COMMITTED_SPEC, dense())
    const vacuum = booked(COMMITTED_SPEC, makeWill(MESH))
    const lone = booked(COMMITTED_SPEC, loneLove())
    const bind = booked(BIND_SPEC, dense())
    const control = booked(MOMENTUM_WEAVE, dense())

    const pieces = [...committed.ledger.keys()].sort()
    const movingP = pieces.filter(k => entry(committed.ledger, k).pSize > 0)
    const cellBeats = MESH.cellCount * BEATS
    const totalP = pieces.reduce((s, k) => s + entry(committed.ledger, k).pSize, 0)
    const hopP = entry(committed.ledger, 'bare:hop').pSize + entry(committed.ledger, 'swap:hop').pSize
    const pairPieces = pieces.filter(k => PAIR_PIECES.some(p => k.endsWith(`:${p}`)))
    const pairKeepsP = pairPieces.every(k => entry(committed.ledger, k).pSize === 0)
    const pairMovesJ = pairPieces.every(k => entry(committed.ledger, k).jSize > 0)
    // every hop moves exactly two roots (L1 size 4), a reversal of one unit mover
    const hopIsReversal = ['bare:hop', 'swap:hop'].every(k => entry(committed.ledger, k).pSize === 4 * entry(committed.ledger, k).count)
    const controlZero = [...control.ledger.values()].every(e => e.pSize === 0)

    // which quantities could be kept at all
    const d4 = latticeQuotient(rootsD4(), 4)
    const lineRoot = rootsD4().filter((_, d) => d < (OPPOSITE[d] ?? d))
    const toVector = (row: number[]): number[] => [0, 1, 2, 3].map(axis => row.reduce((s, n, L) => s + n * (lineRoot[L]?.[axis] ?? 0), 0))
    const analysis = (spec: MomentumWeaveSpec) => {
      const pRows = coupleChanges(spec, lineMomentum)
      const jRows = coupleChanges(spec, lineCurrent)

      return {
        pLine: latticeQuotient(pRows, 12),
        pVector: latticeQuotient(pRows.map(toVector), 4),
        jLine: latticeQuotient(jRows, 12),
        jVector: latticeQuotient(jRows.map(toVector), 4),
        allOnesKept: pRows.every(r => r.reduce((s, x) => s + x, 0) === 0),
      }
    }
    const committedQ = analysis(COMMITTED_SPEC)
    const bindQ = analysis(BIND_SPEC)
    const sameAs = (q: { rank: number; torsion: number[] }, r: { rank: number; torsion: number[] }): boolean =>
      q.rank === r.rank && q.torsion.join(',') === r.torsion.join(',')
    // the committed rule keeps no residue of P or J beyond what every D4 vector already has (the index-2
    // parity of D4 in Z^4), and in line space nothing beyond one Z_2, which is the parity of the tone
    // count and so of the charge
    const nothingKept =
      committedQ.pLine.free === 0 &&
      committedQ.pLine.torsion.join(',') === '2' &&
      committedQ.jLine.free === 0 &&
      sameAs(committedQ.pVector, d4) &&
      sameAs(committedQ.jVector, d4)

    const ok =
      identical.every(Boolean) &&
      [committed, vacuum, lone, bind, control].every(r => r.closes) &&
      committed.pDrift > 0 &&
      committed.jDrift > 0 &&
      movingP.join(',') === [...P_PIECES].sort().join(',') &&
      pairKeepsP &&
      pairMovesJ &&
      hopIsReversal &&
      vacuum.pDrift === 0 &&
      vacuum.jDrift > 0 &&
      lone.pDrift > 0 &&
      committed.periodDrift > 0 &&
      nothingKept &&
      bindQ.pLine.free === 1 &&
      bindQ.allOnesKept &&
      !committedQ.allOnesKept &&
      bind.lineSumDrift === 0 &&
      committed.lineSumDrift > 0 &&
      bind.pDrift > 0 &&
      control.pDrift === 0 &&
      controlZero

    const perPiece: Record<string, number> = {}

    for (const k of pieces) {
      const e = entry(committed.ledger, k)
      const tag = k.replace(':', '_')

      perPiece[`${tag}_perCellBeat`] = e.count / cellBeats
      perPiece[`${tag}_pSizePerCellBeat`] = e.pSize / cellBeats
      perPiece[`${tag}_jSizePerCellBeat`] = e.jSize / cellBeats
    }

    for (const k of [...lone.ledger.keys()].sort()) {
      const e = entry(lone.ledger, k)

      if (e.pSize > 0) {
        perPiece[`lone_${k.replace(':', '_')}_acts`] = e.count
      }
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the spec form equals turningWeave bit for bit; its ledger closes exactly; the only pieces that move particle momentum are the hop (every act a reversal of one unit mover) and the two exchanges of the swap couple, while create, flip and annihilate move none of it and all move charge current; the empty vacuum keeps P exactly and not J; no integer residue of P or J survives the committed rule beyond charge parity; the hop-free bind table keeps the sum of the twelve line momenta exactly (checked on a run) where the committed rule does not; and the momentum weave books zero particle momentum on every piece',
      metrics: {
        identicalPair: identical[0] ? 1 : 0,
        identicalBind: identical[1] ? 1 : 0,
        ledgerCloses: committed.closes ? 1 : 0,
        denseMomentumDrift: committed.pDrift,
        denseCurrentDrift: committed.jDrift,
        densePeriodMomentumDrift: committed.periodDrift,
        hopShareOfBrokenMomentum: hopP / totalP,
        brokenMomentumPerCellBeat: totalP / cellBeats,
        vacuumMomentumDrift: vacuum.pDrift,
        vacuumCurrentDrift: vacuum.jDrift,
        loneLoveMomentumDrift: lone.pDrift,
        committedLineRank: committedQ.pLine.rank,
        committedLineTorsion: committedQ.pLine.torsion.reduce((s, x) => s * x, 1),
        committedVectorRank: committedQ.pVector.rank,
        committedVectorTorsion: committedQ.pVector.torsion.reduce((s, x) => s * x, 1),
        committedCurrentLineRank: committedQ.jLine.rank,
        committedCurrentVectorTorsion: committedQ.jVector.torsion.reduce((s, x) => s * x, 1),
        d4IndexInZ4: d4.torsion.reduce((s, x) => s * x, 1),
        bindLineRank: bindQ.pLine.rank,
        bindLineFree: bindQ.pLine.free,
        bindVectorRank: bindQ.pVector.rank,
        bindLineSumDrift: bind.lineSumDrift,
        committedLineSumDrift: committed.lineSumDrift,
        bindMomentumDrift: bind.pDrift,
        ...perPiece,
      },
      control: {
        momentumWeaveMomentumDrift: control.pDrift,
        momentumWeaveBookedMomentum: [...control.ledger.values()].reduce((s, e) => s + e.pSize, 0),
        momentumWeaveCurrentDrift: control.jDrift,
      },
      notes:
        'L2, exact integers, no random numbers. Units: a P or J size is the L1 norm of the booked 4-vector change (a reversed unit mover on a root moves 4). The ledger decomposes the collision; streaming moves nothing. The create-flip-annihilate cycle of the pair clock makes and unmakes a love and a fear moving head on along one line, which carries no particle momentum (the two movers cancel) and charge current 2 roots, so it is the whole of the charge current\'s change in the vacuum and none of the particle momentum\'s. The hop turns a lone tone around on its line and is where most particle momentum goes. The palindromic exchange turns a lone tone from one line of the couple to the other (with the hop inside it, from the line\'s away slot to the wire\'s first slot), a change of direction by 60 or 120 degrees. The lattice analysis is exact over every couple state, every couple and every beat of a period: the committed rule leaves no exact linear or residue invariant of P or J beyond charge parity, so there is no lattice momentum mod a sublattice and no coarser conserved momentum to find. Without the hop (the bind table) exactly one line invariant appears, the sum of the twelve line momenta (tones moving in the twelve first directions minus tones moving in the twelve second ones), which is not a component of P. E-FLD-0022 asks which rules of the family keep P, and E-FLD-0023 runs the acceptance battery on the one it selects.',
    })
  },
})
