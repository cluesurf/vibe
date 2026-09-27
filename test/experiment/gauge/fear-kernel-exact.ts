// The continuity on the committed knit's path, replaced (E-FRC-0206): the fear beat's kernels built in exact
// Eisenstein integers, with the angle a trit.
//
// E-MTH-0025 scans the rule layer for continuity. On the committed knit's path (the import closure of
// code/rule/collision, lattice-gas, vibe-weave and combined-knit) it finds no fractional coupling in any step,
// so no threshold counter is needed there: the knit's steps are table lookups, swaps and digit reads. What it
// does find is real numbers in CONSTRUCTION and STARTS: the D4 roots and box basis in half-integer
// coordinates (code/algebra/group/root-system, code/substrate/d4-box, with sqrt, hypot and a 1e-9 rounding
// back to integers), the grid-move start of code/rule/vibe-weave (a golden-ratio Weyl value), and two exact
// integer divisions written with / (code/rule/scatter-weave, code/tool/mesh). And one table the knit's STEP
// runs on is built through continuity: the fear beat's meeting kernels, which code/measure/fear-port builds
// with code/rule/fear-weave fearKernels from the real angle 2 pi / 3, cos and sin, a floating Wigner kernel,
// and a search for a divisor within 1e-9 followed by Math.round. (combined-knit imports fear-weave for a type
// only, so the import closure does not reach it: the table arrives as data. The audit's path is a lower bound
// and this is the case it misses.)
//
// The replacement proposed for each:
// - the fear kernels: every angle the fear beat uses is a cube root of unity, so the angle is a trit and the
//   phase an Eisenstein integer (code/rule/fear-kernel-exact). IMPLEMENTED HERE, the simplest that touches a
//   step's table
// - the D4 roots and box basis: hold them in doubled integer coordinates (every half-integer times 2), or in the
//   integer basis of D4 (the roots +-e_i +-e_j), and invert the box basis by its integer adjugate
// - the grid-move start: an integer Weyl sequence, (i + 1) 40503 mod 2^16 (as code/measure/photon-count-battery)
// - the two divisions: integer quotients of known multiples (a cell index), spelled as such
// None of these is a coupling, so none needs a counter.
//
// Gates, fixed before the run:
// G1 for every like and unlike phase in Z_3 (the real angles 0, 2 pi/3, -2 pi/3 that fear-port uses) and both
//    exchange conventions, 18 cases, the exact tables equal fearKernels's: the same divisors and every one of
//    the 81 x 81 entries of both kernels
// G2 the exact file and its value imports: 0 findings of any kind in the E-MTH-0025 scan
// G3 control: a kernel entry deliberately altered by 1 in one case is caught by the comparison
// Status: pass if G1, G2 and G3 pass, fail otherwise.
//
// Depth L2: an exact derivation of a table the model already uses, checked entry by entry.

import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { importClosure, scanContinuity } from '@/code/check/continuity'
import { fearKernels } from '@/code/rule/fear-weave'
import { exactFearKernels } from '@/code/rule/fear-kernel-exact'

const BASE = resolve(import.meta.dirname, '../../..')

const tableDifferences = (a: readonly (readonly number[])[], b: readonly (readonly number[])[]): number => {
  let n = a.length === b.length ? 0 : 1

  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < (a[r]?.length ?? 0); c++) {
      n += (a[r]?.[c] ?? 0) === (b[r]?.[c] ?? Number.NaN) ? 0 : 1
    }
  }

  return n
}

export default experiment({
  id: 'gauge/fear-kernel-exact',
  code: 'E-FRC-0206',
  title:
    "the fear beat's meeting kernels built in exact Eisenstein integers with the angle a trit, equal entry by entry to the tables fearKernels reaches through cos, sin and a rounding; the other continuity on the committed knit's path is in construction and starts and needs no counter",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const angle = (k: number): number => (k === 0 ? 0 : k === 1 ? (2 * Math.PI) / 3 : (-2 * Math.PI) / 3)

    let cases = 0
    let equal = 0
    let entries = 0
    let caught = 0

    for (const exchanged of [true, false]) {
      for (let like = 0; like < 3; like++) {
        for (let unlike = 0; unlike < 3; unlike++) {
          const floating = fearKernels({ like: angle(like), unlike: angle(unlike), likeExchanged: exchanged })
          const exact = exactFearKernels({ like, unlike, likeExchanged: exchanged })

          cases += 1

          if (!floating) {
            metrics[`g1Missing${exchanged ? 'X' : 'N'}${like}${unlike}`] = 1

            continue
          }

          const differences =
            tableDifferences(exact.like, floating.like) + tableDifferences(exact.unlike, floating.unlike) + (exact.likeDivisor === floating.likeDivisor ? 0 : 1) + (exact.unlikeDivisor === floating.unlikeDivisor ? 0 : 1)

          entries += 2 * 81 * 81
          equal += differences === 0 ? 1 : 0
          metrics[`g1${exchanged ? 'Exchanged' : 'Plain'}Like${like}Unlike${unlike}Differences`] = differences
          metrics[`g1${exchanged ? 'Exchanged' : 'Plain'}Like${like}Unlike${unlike}Divisors`] = exact.likeDivisor * 1000 + exact.unlikeDivisor

          if (exchanged && like === 1 && unlike === 1) {
            const altered = exact.like.map(row => [...row])

            altered[40]![40] = (altered[40]![40] ?? 0) + 1
            caught = tableDifferences(altered, floating.like) > 0 ? 1 : 0
          }
        }
      }
    }

    const closure = importClosure(BASE, ['code/rule/fear-kernel-exact.ts'])
    const findings = [...closure.keys()].flatMap(file => scanContinuity(file, readFileSync(resolve(BASE, file), 'utf8')))
    const gates = { G1: equal === 18 && cases === 18 ? 1 : 0, G2: findings.length === 0 ? 1 : 0, G3: caught }

    metrics['g1Cases'] = cases
    metrics['g1Equal'] = equal
    metrics['g1EntriesCompared'] = entries
    metrics['g2Files'] = closure.size
    metrics['g2Findings'] = findings.length
    metrics['g3AlteredCaught'] = caught

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok
    }

    return verdict({
      status: Object.values(gates).every(x => x === 1) ? 'pass' : 'fail',
      claim:
        "the fear beat's like and unlike kernels, built in Eisenstein integers with each phase a trit, equal fearKernels's floating-and-rounded tables in every divisor and every entry over all 18 phase and exchange cases, with no real number, trig or rounding in the exact file",
      metrics,
      control: { alteredEntryCaught: caught },
      notes: `L2, exact integers, deterministic. First run 2026-09-26 (tmp/frc0206.log, 0.3 s), PASS: all 18 cases (like and unlike phase each a trit, both exchange conventions) give the same divisors and the same 236,196 kernel entries as fearKernels; the divisors are 4 for a like meeting with a phase (1 with none) and 3 for an unlike one with a phase (1 with none), the quarters and thirds fear-weave describes, now as the exact 9 c^2 over the gcd of the traces rather than a search to 1e-9; an entry altered by 1 is caught. The exact file scans clean (1 file, 0 findings). The replacement is not yet wired: code/measure/fear-port still calls fearKernels, and switching it to exactFearKernels (like: 1, unlike: 1, and 2, 2 backward) is a one-line change in a file this agent does not own. Findings in the exact file: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join('; ') || 'none'}.`,
    })
  },
})
