// What it would take: the largest miss at which a mechanism's number for alpha or m_p / m_e could still be
// admitted by the E-MTH-0021 judge, and whether any measured route can reach it.
//
// The judge admits an approximate number only when both nulls fall under 0.01 at the miss t: the named-form
// chance times the candidates tried, M t / (0.1 x) (x the target), and the E-MTH-0010 budget null. So there
// is a largest admissible miss, t* = min(t_named, t_budget):
//   t_named = 0.001 x / M, closed form
//   t_budget the largest t whose budget null is under 0.01, found by bisection in log t (1,000 golden Weyl
//   points a step, then confirmed at 5,000 on both sides of the edge)
// A mechanism whose value is known only to a relative precision worse than t* / x cannot be identified by
// its number, however close it lands; only an exact derivation (a match at the target's own precision) can.
//
// Predictions, written before the run: for alpha^-1 (M = 16) t_named = 8.6e-3, relative 6.3e-5; the budget
// edge is tighter than that, so t* / x is at most 6e-5. For m_p / m_e (M = 4), t_named = 0.46, relative
// 2.5e-4, and the budget is looser there (E-MTH-0022: 4 forms reach it at its own precision), so the budget
// may admit no miss at all: then only a value named in advance and matching at the target's precision counts.
//
// Gates, fixed before the run:
// G1 each edge is an edge: the budget null at 5,000 points is under 0.01 at t_budget and at least 0.01 at
//    2 t_budget, or, if no tolerance down to the target's own precision is under 0.01, that is reported as
//    "no admissible miss" and the gate holds
// G2 the measured routes are named with their relative precision: E-MTH-0023's beta_c (u / beta_c) and the
//    lattice Coulomb coefficient of E-MTH-0020 (its 4e-4 residual); the gate is that each is compared with
//    t* / x and the comparison printed
//
// Depth L1: a property of the instrument, not of the model.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { nullMatchRate } from '@/code/measure/integer-relation'
import { INVERSE_ALPHA, INVERSE_ALPHA_DELTA, PROTON_ELECTRON, PROTON_ELECTRON_DELTA } from '@/code/measure/coupling-candidates'

// E-MTH-0023 first run: relative uncertainty of the bulk critical beta (cited input)
const BETA_C_RELATIVE = 0.021145088405902512 / 0.6355123173066486
// E-MTH-0020 first run: the Coulomb coefficient's residual at column depth 1 and 2
const COULOMB_RELATIVE = 4.2e-4
const EDGE = 0.01

function budgetEdge(x: number, floor: number): { edge: number; below: number; above: number } {
  let lo = Math.log(floor)
  let hi = Math.log(0.01 * x)

  if (nullMatchRate(x, floor, 1000) >= EDGE) {
    return { edge: Number.NaN, below: nullMatchRate(x, floor, 5000), above: Number.NaN }
  }

  for (let step = 0; step < 30; step++) {
    const mid = (lo + hi) / 2

    if (nullMatchRate(x, Math.exp(mid), 1000) < EDGE) {
      lo = mid
    } else {
      hi = mid
    }
  }

  const edge = Math.exp(lo)

  return { edge, below: nullMatchRate(x, edge, 5000), above: nullMatchRate(x, 2 * edge, 5000) }
}

export default experiment({
  id: 'method/admissible-precision',
  code: 'E-MTH-0024',
  title:
    'the admissible miss for a number-only identification of alpha and m_p / m_e under the pre-registered null: none exists, since the E-MTH-0010 budget null is 0.12 and 0.94 at the targets\' own CODATA precision, so only a value named in advance and matching exactly, which no measured route (critical coupling 3.3 percent, Coulomb coefficient 4e-4) approaches, could carry either constant',
  category: 'method',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const targets = [
      { name: 'inverseAlpha', x: INVERSE_ALPHA, delta: INVERSE_ALPHA_DELTA, trials: 16 },
      { name: 'protonElectron', x: PROTON_ELECTRON, delta: PROTON_ELECTRON_DELTA, trials: 4 },
    ]
    const metrics: Record<string, number> = {}
    let edges = true

    for (const t of targets) {
      const named = (0.001 * t.x) / t.trials
      const budget = budgetEdge(t.x, t.delta)
      const star = Number.isFinite(budget.edge) ? Math.min(named, budget.edge) : Number.NaN

      edges = edges && (Number.isNaN(budget.edge) ? budget.below >= EDGE : budget.below < EDGE && budget.above >= EDGE)
      metrics[`${t.name}NamedEdge`] = named
      metrics[`${t.name}BudgetEdge`] = budget.edge
      metrics[`${t.name}BudgetNullAtEdge`] = budget.below
      metrics[`${t.name}BudgetNullAtTwiceEdge`] = budget.above
      metrics[`${t.name}AdmissibleRelative`] = star / t.x
      metrics[`${t.name}BetaCriticalReaches`] = BETA_C_RELATIVE <= star / t.x ? 1 : 0
      metrics[`${t.name}CoulombReaches`] = COULOMB_RELATIVE <= star / t.x ? 1 : 0
    }

    const compared = Number.isFinite(BETA_C_RELATIVE)

    return verdict({
      status: edges && compared ? 'pass' : 'fail',
      claim:
        'no miss is admissible for either constant: the E-MTH-0010 budget null is already 0.12 for alpha^-1 and 0.94 for m_p / m_e at their own CODATA precision (the x^2 branch is loose at large targets), so no approximate value can be admitted however close, and a mechanism\'s number counts only if it was named in advance and matches at the target\'s own precision; the model\'s measured routes (a critical coupling to 3.3 percent, a lattice Coulomb coefficient to 4e-4) are orders of magnitude from that, so either constant needs an exact derivation',
      metrics,
      control: { betaCriticalRelative: BETA_C_RELATIVE, coulombRelative: COULOMB_RELATIVE },
      notes:
        'L1, deterministic (golden Weyl nulls). First run, 2026-09-25, pass on the gates as written (G1 holds by its "no admissible miss" branch, G2 compares both routes), and the predictions were wrong in part: t_named came out as predicted (8.6e-3 for alpha^-1, 0.46 for m_p / m_e) but there is no budget edge at all for EITHER target, not only for m_p / m_e. The budget null at the target\'s own precision is 0.1214 for alpha^-1 (one form reaches it, 8 x^2 = 150,233 - 3 log 2) and 0.944 for m_p / m_e (3 x^2 = 10,114,372 - 3 log 2 and its multiples). This is a limit of the E-MTH-0010 budget, whose x^2 branch widens with the target, not of the model: it cannot certify a searched closed form for either constant, and E-MTH-0021 and 0022 therefore rest on the named-in-advance route. The named-form edge, 6.3e-5 relative for alpha^-1 with 16 trials and 2.5e-4 for m_p / m_e with 4, is what a named candidate carrying its own uncertainty would have to beat, and the budget blocks it anyway; a proof is the only admission.',
    })
  },
})
