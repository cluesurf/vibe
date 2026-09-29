// The clock horizon (E-GRV-0111, 0112): the torn husk of code/rule/horizon-husk with its horizon joined by a bound on the
// CLOCK instead of the FIELD (note/research/vibe/roadmap/discrete-gravity.md, "Why sqrt(M), and the fix: bound the clock,
// not the field"). A STAND-IN, as the torn husk is: nothing in the model makes the depth read any state (E-GRV-0071).
//
// THE CRITERION. E-GRV-0108 joins a husk dock to the horizon when all 18 of its husk links carry a content line: a bound
// on the step (the field), whose edge is where M over an area reaches the window, r_h ~ sqrt(M). Here the bound is on
// the DEPTH that sets the dock's clock. In E-FRC-0257's minimal coupling a column's metric count is q_m = 2 D_m + 1,
// with D_m its metric depth, and the rest rate runs as q_m^(-1/2). Let the metric depth be the found depth's EXCESS
// over a reference, D_m = D_0 + e, held in a bounded register that saturates at D_0 + CAP. Where e reaches CAP the
// register is full: the clock can run no slower, it stops, and the dock joins the horizon. Its husk links then tear as
// in E-GRV-0108 (hold their step), so its whole flux goes down its one vertical link into the bulk.
//  - e is FOUND, never stored: the depth is summed from the steps over the live links (horizonDepth, the same sum the
//    torn husk already makes), e_y = x_y - x_ref. The comparison is exact: 2 x is a whole number of register units, so
//    e_y >= CAP is 2 x_y - 2 x_ref >= 2 CAP Q^L, integers against an integer (CAP a multiple of 1 / 2).
//  - THE REFERENCE is one stated dock (clockHorizonRule's `reference`, dock 0 by default: the root the sum starts from,
//    which the experiments put at the husk corner, the dock farthest from the lump). In a finite closed box there is no
//    infinity to read against, so the excess over the reference is the excess over infinity less the lump's own depth
//    at the reference (about k M / r_ref): the radius law bends from r ~ M as r_h approaches r_ref.
//  - WHY r_h ~ M (derived): outside a lump the found depth is x(r) = k M / r (the husk's 1/(24 pi r) and the stack's
//    zero mode, k = w_0 / (4 pi) with w_0 = 16/31 of the husk's 1/6 at long range, E-GRV-0100), so e = CAP at
//    r_h = k M / CAP (less the reference's share): linear in M, with no nonlinear field added. The register's bound
//    supplies the stop.
//  - WHY NO SLIP (derived): the step at r_h on an axis link (g = 2) is 2 k M / r_h^2 = 2 CAP / r_h = 2 CAP^2 / (k M),
//    falling as 1 / M: a large lump's horizon edge sits far inside the trit window, where E-GRV-0108's field criterion
//    put it at the window's edge by construction.
//  - WHEN IT IS READ. The depth changes every beat, so the criterion is read after every beat (and after every event):
//    the beat, then clockJoin. A dock that has joined STAYS (a torn link rejoined would carry a held step that is not
//    the difference of its docks' depths, a curl), and the beat that set a bit records it, so undoing that beat clears
//    it (code/measure/horizon-husk growthRun, `clockJoin`). Between joins the beat is the torn husk's, one fixed linear
//    map, exactly reversible, its energy exactly kept.
// WHAT IS STORED beyond code/rule/horizon-husk's: nothing a beat reads. The metric register's value is the found excess
// (read, never held); the horizon is its one bit a husk dock, set when the register fills. The cap is fixed by the rule,
// not by a lump.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule.

import type { OpenMesh, OpenState } from '@/code/rule/open-husk'
import {
  horizonDepth,
  type HorizonRule,
  type TornTest,
} from '@/code/rule/horizon-husk'

export type ClockHorizonRule = HorizonRule & {
  // the metric register's cap on the found depth's excess, in whole steps (a multiple of 1 / 2)
  readonly cap: number
  // 2 CAP Q^L: the cap in the units of horizonDepth's `twice`
  readonly capTwice: number
  // the dock the excess is read against
  readonly reference: number
}

export function clockHorizonRule(
  rule: HorizonRule,
  cap: number,
  reference = 0,
): ClockHorizonRule {
  const capTwice = 2 * cap * rule.unit

  if (!Number.isInteger(2 * cap) || cap <= 0) {
    throw new Error(
      'clockHorizonRule: the cap is a positive multiple of 1 / 2',
    )
  }

  return { ...rule, cap, capTwice, reference }
}

// the found depth's excess over the reference, 2 e per dock in register units (exact integers), read over the live links
export function foundExcess(
  mesh: OpenMesh,
  rule: ClockHorizonRule,
  step: ArrayLike<number>,
  horizon: Uint8Array,
  torn?: TornTest,
): Float64Array {
  const d = horizonDepth(mesh, step, horizon, torn)
  const ref = d.twice[rule.reference]!

  return d.twice.map(t => t - ref)
}

// the read after a beat: every husk dock off the horizon whose metric register is full (e >= CAP) joins; returns the
// docks that joined (the record that undoing the beat clears, code/rule/horizon-husk leaveHorizon)
export function clockJoin(
  mesh: OpenMesh,
  rule: ClockHorizonRule,
  s: OpenState,
  horizon: Uint8Array,
  torn?: TornTest,
): number[] {
  const excess = foundExcess(mesh, rule, s.step, horizon, torn)
  const joined: number[] = []

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (
      !horizon[y] &&
      y !== rule.reference &&
      excess[y]! >= rule.capTwice
    ) {
      horizon[y] = 1
      joined.push(y)
    }
  }

  return joined
}
