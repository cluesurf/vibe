// The bounded depth field (E-GRV-0090, 0091): the radion of E-GRV-0079 written on registers that cannot grow. Depth is
// FOUND, not stored (note/project/vibe/roadmap/research/discrete-gravity.md, Part 5c): no register anywhere holds a depth, and a
// column's depth is read by summing steps along a path. A STAND-IN, like the radion: nothing in the model makes the
// depth read any state (E-GRV-0071), so this rule is added by hand; what is tested is whether its physics fits in
// bounded storage.
//
// WHAT IS STORED, and its bound (the husk mesh of code/rule/trit-radion: 9 out-links a dock, weight g = 2 on an axis
// and 1 on a face diagonal, the light's metric):
//  per link  LINE  f in {-1, 0, +1}: the content's lines of force. At every dock, lines out minus lines in equals the
//                  dock's content (love plus fear), exactly, on every beat. Content is not stored by the field at all:
//                  it is the divergence of the lines, and it is the only way the rule reads matter.
//            STEP  F: the depth's gradient in flux units, F = g (x_tail - x_head). A trit (the nearest whole step) and
//                  its fraction carried in L balanced digits of base Q (each in -H .. H), held here as the one integer
//                  F Q^L in the balanced window of 3 Q^L values: |F| <= 3/2 - 1 / (2 Q^L).
//  per dock  RATE  v: the depth's change this beat, the same shape as a step (a trit and L digits).
//            REST  R in -H .. H: the remainder of the one division the rule makes, carried to the next beat.
// Nothing else. The largest register is 3 Q^L values, fixed by the rule, whatever the content or the box.
//
// THE BEAT. With kappa = a / Q, a = 2, Q = 9 (2D + 1) (the radion's, so the depth's waves run at the light's c(D)):
//   v(t+1) = v(t) + kappa (div f - div F(t))           [div: out minus in, at each dock]
//   F(t+1) = F(t) + g (v_tail(t+1) - v_head(t+1))      [on each link]
// In integers (F, v in units of 1 / Q^L): X = a (Q^L div f - div F); w = floor((X + R + H) / Q); R <- X + R - Q w;
// v <- v + w; then F <- F + g (v_tail - v_head). The division's remainder is CARRIED in R, never dropped, so
//   v(t+1) - v(t) = kappa (rho - div F) + (R_t - R_(t+1)) / Q^(L+1)
// exactly: the radion's equation x(t+1) - 2 x(t) + x(t-1) = -kappa A x + kappa rho for x found by summing F / g, up to
// a telescoping remainder under 1 / Q^L per dock per beat (the radion's own bound).
//
// WHY EACH CHOICE.
//  - Steps, not depth: a gradient is bounded where the depth is not (a lump of M sinks the depth by about M / r).
//  - F changes only by a gradient (g times the difference of two docks' rates), so its curl is zero forever: the depth
//    found by summing F / g is the same along every path, exactly, in integers (read by stepDepth, checked on every
//    link). This is what makes "depth by summation" a function and not a choice of path.
//  - Lines carry content: div f = rho exactly, so the radion's source rho . x equals sum f F / g, a sum of local link
//    products (discrete integration by parts), and matter enters the rule only through the links at its dock.
//  - The lines' routing never enters the beat (only div f does), so any routing is the same physics: the routing is
//    bookkeeping, fixed at placement, changed only where a unit of content hops.
//  - A hop of one unit from dock y to a neighbor z adds a unit line from z to y along a path of one or two links
//    (hopPaths): div f moves with the content and nothing else changes, so the hop is local; the path is part of the
//    scheduled event, so the event reverses exactly.
//  - Saturation: a step cannot leave its window. At the edge the register WRAPS (F -> F - 3 when F would pass 3/2): the
//    one reversible rule on a finite register that keeps the beat an addition (a clamp maps two values to one). A wrap
//    is a SLIP: the step drops by three whole steps at once, the curl of F / g around the link becomes +-3 / g, and the
//    depth stops being single valued there (the surface tears). The prediction: a slip happens only where the demanded
//    slope passes 3/2 steps a link, which is near a lump dense enough to fill its lines' capacity: the horizon.
//
// REJECTED, and why:
//  - one integer depth per column with carried fractions (E-GRV-0079): unbounded, the objection this rule answers.
//  - steps as Gauss lines alone with energy their count (tmp/step-pair-probe): the saving grows with separation, the
//    wrong way, because for a trit the count of steps is linear in the flux (an L1 cost, optimal transport), not
//    quadratic (Coulomb).
//  - steps as Gauss lines with the radion's energy but their static part fixed by content at each beat: that is the
//    negative static energy of E-GRV-0076, whose pull acts at once (E-GRV-0077 R).
//  - a clamp at saturation: not reversible. A carried overflow register: grows without bound near a lump.
//  - a Z3 field with its own transverse wave (a second light): it carries spin 1, and its like sources repel
//    (E-GRV-0074); the scalar's rate is the one radiating register.
//
// REVERSIBLE: stepBeatBack is the inverse bit for bit (the lag of every line of the beat is the one value in its window).
// COVARIANT: the beat reads only link classes (axis or diagonal) and the dock's own values, so it commutes with every
// symmetry of the husk mesh (the cubic group), reflections included: v and R are scalars, F reverses with its link.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a unit of content's hop is a scheduled event.

import { radionWeight, type RadionMesh } from '@/code/rule/trit-radion'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type StepRule = {
  readonly depth: number
  readonly a: number
  readonly q: number
  readonly h: number
  readonly levels: number
  // Q^L: one whole step in register units
  readonly unit: number
  // the register's window: `whole` whole steps (3 for a trit), span = whole Q^L values, balanced about 0
  readonly whole: number
  readonly span: number
  readonly top: number
}

// the bounded rule (whole = 3: a trit and its digits), or a wider window for a control (whole odd)
export function stepRule(
  depth: number,
  levels: number,
  whole = 3,
): StepRule {
  const q = 9 * (2 * depth + 1)
  const unit = q ** levels
  const span = whole * unit

  return {
    depth,
    a: 2,
    q,
    h: (q - 1) / 2,
    levels,
    unit,
    whole,
    span,
    top: (span - 1) / 2,
  }
}

export type StepState = {
  // f per link (y * 9 + h, the out-link of dock y along husk direction h)
  readonly line: Int8Array
  // F per link, in units of 1 / Q^L (exact integers)
  readonly step: Float64Array
  // v per dock, in units of 1 / Q^L
  readonly rate: Float64Array
  // R per dock, in -H .. H
  readonly rest: Float64Array
}

export function emptyStep(mesh: RadionMesh): StepState {
  return {
    line: new Int8Array(mesh.docks * 9),
    step: new Float64Array(mesh.docks * 9),
    rate: new Float64Array(mesh.docks),
    rest: new Float64Array(mesh.docks),
  }
}

export function duplicateStep(s: StepState): StepState {
  return {
    line: Int8Array.from(s.line),
    step: Float64Array.from(s.step),
    rate: Float64Array.from(s.rate),
    rest: Float64Array.from(s.rest),
  }
}

export const sameStep = (a: StepState, b: StepState): boolean =>
  a.line.every((v, i) => v === b.line[i]) &&
  a.step.every((v, i) => v === b.step[i]) &&
  a.rate.every((v, i) => v === b.rate[i]) &&
  a.rest.every((v, i) => v === b.rest[i])

// the value v wrapped into the window, and whether it had to wrap
const wrapInto = (rule: StepRule, v: number): number =>
  mod(v + rule.top, rule.span) - rule.top

export type StepTally = { vWraps: number; fWraps: number }

export const newStepTally = (): StepTally => ({ vWraps: 0, fWraps: 0 })

// out = the divergence (out minus in) of a link field, per dock
export function divergence(
  mesh: RadionMesh,
  field: ArrayLike<number>,
  out: Float64Array,
): void {
  out.fill(0)

  for (let y = 0; y < mesh.docks; y++) {
    for (let h = 0; h < 9; h++) {
      const l = y * 9 + h
      const v = field[l]!

      if (v === 0) {
        continue
      }

      out[y] = out[y]! + v
      out[mesh.neighbour[l]!] = out[mesh.neighbour[l]!]! - v
    }
  }
}

export type StepScratch = {
  divLine: Float64Array
  divStep: Float64Array
}

export const stepScratch = (mesh: RadionMesh): StepScratch => ({
  divLine: new Float64Array(mesh.docks),
  divStep: new Float64Array(mesh.docks),
})

// one beat, in place
export function stepBeat(
  mesh: RadionMesh,
  rule: StepRule,
  s: StepState,
  scratch: StepScratch,
  tally?: StepTally,
): void {
  const { a, q, h, unit } = rule

  divergence(mesh, s.line, scratch.divLine)
  divergence(mesh, s.step, scratch.divStep)

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (unit * scratch.divLine[y]! - scratch.divStep[y]!)
    const w = floorDiv(x + s.rest[y]! + h, q)
    const raw = s.rate[y]! + w

    s.rest[y] = x + s.rest[y]! - q * w
    s.rate[y] = wrapInto(rule, raw)

    if (tally && s.rate[y] !== raw) {
      tally.vWraps++
    }
  }

  for (let y = 0; y < mesh.docks; y++) {
    const vy = s.rate[y]!

    for (let k = 0; k < 9; k++) {
      const l = y * 9 + k
      const raw =
        s.step[l]! +
        radionWeight(k) * (vy - s.rate[mesh.neighbour[l]!]!)

      s.step[l] = wrapInto(rule, raw)

      if (tally && s.step[l] !== raw) {
        tally.fWraps++
      }
    }
  }
}

// the inverse of stepBeat
export function stepBeatBack(
  mesh: RadionMesh,
  rule: StepRule,
  s: StepState,
  scratch: StepScratch,
): void {
  const { a, q, h, unit } = rule

  for (let y = 0; y < mesh.docks; y++) {
    const vy = s.rate[y]!

    for (let k = 0; k < 9; k++) {
      const l = y * 9 + k

      s.step[l] = wrapInto(
        rule,
        s.step[l]! -
          radionWeight(k) * (vy - s.rate[mesh.neighbour[l]!]!),
      )
    }
  }

  divergence(mesh, s.line, scratch.divLine)
  divergence(mesh, s.step, scratch.divStep)

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (unit * scratch.divLine[y]! - scratch.divStep[y]!)
    const w = floorDiv(x - s.rest[y]! + h, q)

    s.rest[y] = s.rest[y]! - x + q * w
    s.rate[y] = wrapInto(rule, s.rate[y]! - w)
  }
}

// ---------------------------------------------------------------------------------------------------------
// depth, found by summing steps

export type FoundDepth = {
  // 2 Q^L x per dock (exact integers), x = 0 at dock 0: along an out-link, x_head = x_tail - F / g
  twice: Float64Array
  // links where x_tail - x_head differs from F / g (0 while F has no curl: then the depth is the same along every path)
  curl: number
}

export function stepDepth(
  mesh: RadionMesh,
  step: ArrayLike<number>,
): FoundDepth {
  const [sx, sy, sz] = mesh.sides
  const twice = new Float64Array(mesh.docks)
  // 2 / g times F: 1 on an axis, 2 on a face diagonal
  const along = (y: number, h: number): number =>
    (h < 3 ? 1 : 2) * step[y * 9 + h]!

  // the path: along x from the origin, then along y, then along z (the axis out-links h = 0, 1, 2)
  for (let c = 0; c < sz; c++) {
    for (let b = 0; b < sy; b++) {
      for (let a = 0; a < sx; a++) {
        const y = a + sx * (b + sy * c)

        if (a > 0) {
          twice[y] = twice[y - 1]! - along(y - 1, 0)
        } else if (b > 0) {
          twice[y] = twice[y - sx]! - along(y - sx, 1)
        } else if (c > 0) {
          twice[y] = twice[y - sx * sy]! - along(y - sx * sy, 2)
        }
      }
    }
  }

  let curl = 0

  for (let y = 0; y < mesh.docks; y++) {
    for (let h = 0; h < 9; h++) {
      if (
        twice[y]! - twice[mesh.neighbour[y * 9 + h]!]! !==
        along(y, h)
      ) {
        curl++
      }
    }
  }

  return { twice, curl }
}

// ---------------------------------------------------------------------------------------------------------
// lines: placement and hops

// the docks where lines out minus lines in differ from the content
export function gaussOff(
  mesh: RadionMesh,
  line: Int8Array,
  content: Int32Array,
): number {
  const div = new Float64Array(mesh.docks)

  divergence(mesh, line, div)

  let off = 0

  for (let y = 0; y < mesh.docks; y++) {
    if (div[y] !== content[y]) {
      off++
    }
  }

  return off
}

// the incident links of each dock: [link, +1 if the dock is its tail, -1 if its head]
export function incidence(mesh: RadionMesh): {
  link: Int32Array
  sign: Int8Array
} {
  const link = new Int32Array(mesh.docks * 18)
  const sign = new Int8Array(mesh.docks * 18)
  const fill = new Int32Array(mesh.docks)

  for (let y = 0; y < mesh.docks; y++) {
    for (let h = 0; h < 9; h++) {
      const l = y * 9 + h
      const z = mesh.neighbour[l]!

      link[y * 18 + fill[y]!] = l
      sign[y * 18 + fill[y]!] = 1
      fill[y]!++
      link[z * 18 + fill[z]!] = l
      sign[z * 18 + fill[z]!] = -1
      fill[z]!++
    }
  }

  return { link, sign }
}

// room for one more unit of line leaving a dock along an incident link (sign +1: the dock is the tail), with at most
// `capacity` units on a link (1 for the trit)
const room = (
  line: Int8Array,
  l: number,
  sign: number,
  capacity: number,
): boolean => sign * line[l]! < capacity

// lines for a content map: successive augmenting paths, each unit from the nearest dock with content left to the nearest
// with a sink left (breadth first over the links with room, a used link reversible), as tmp/step-field-probe. Gauss's
// law holds exactly when every unit is routed. Not proven the fewest steps. Throws if a unit cannot be routed.
export function placeLines(
  mesh: RadionMesh,
  content: Int32Array,
  capacity = 1,
): Int8Array {
  const line = new Int8Array(mesh.docks * 9)
  const inc = incidence(mesh)
  const supply = Int32Array.from(content)
  const total = content.reduce((s, v) => s + (v > 0 ? v : 0), 0)
  const prev = new Int32Array(mesh.docks)
  const queue = new Int32Array(mesh.docks)

  for (let unit = 0; unit < total; unit++) {
    prev.fill(-2)

    let tail = 0

    for (let y = 0; y < mesh.docks; y++) {
      if (supply[y]! > 0) {
        ;((prev[y] = -1), (queue[tail++] = y))
      }
    }

    let found = -1

    for (let head = 0; head < tail && found < 0; head++) {
      const y = queue[head]!

      for (let k = 0; k < 18; k++) {
        const l = inc.link[y * 18 + k]!
        const sg = inc.sign[y * 18 + k]!

        if (!room(line, l, sg, capacity)) {
          continue
        }

        const z = sg > 0 ? mesh.neighbour[l]! : Math.floor(l / 9)

        if (prev[z] !== -2) {
          continue
        }

        prev[z] = y * 18 + k

        if (supply[z]! < 0) {
          found = z
          break
        }

        queue[tail++] = z
      }
    }

    if (found < 0) {
      throw new Error(
        `placeLines: unit ${unit} of ${total} cannot be routed`,
      )
    }

    let z = found

    while (prev[z] !== -1) {
      const y = Math.floor(prev[z]! / 18)
      const k = prev[z]! % 18

      line[inc.link[y * 18 + k]!] =
        line[inc.link[y * 18 + k]!]! + inc.sign[y * 18 + k]!
      z = y
    }

    supply[z]!--
    supply[found]!++
  }

  return line
}

// a path of links, each with the sign of its line change (+1 adds a unit along the out-link's direction)
export type LinePath = readonly (readonly [number, number])[]

// the candidate paths for a unit line from z to y (a unit of content hopping from dock y to its neighbor z): the direct
// link first, then the two-link detours through each common neighbor in dock order
export function hopPaths(
  mesh: RadionMesh,
  y: number,
  z: number,
): LinePath[] {
  const inc = incidence(mesh)

  const links = (p: number, r: number): [number, number][] => {
    const out: [number, number][] = []

    for (let k = 0; k < 18; k++) {
      const l = inc.link[p * 18 + k]!
      const sg = inc.sign[p * 18 + k]!
      const other = sg > 0 ? mesh.neighbour[l]! : Math.floor(l / 9)

      if (other === r) {
        out.push([l, sg])
      }
    }

    return out
  }

  const paths: LinePath[] = links(z, y).map(e => [e])
  const neighbors = new Set<number>()

  for (let k = 0; k < 18; k++) {
    const l = inc.link[z * 18 + k]!

    neighbors.add(
      inc.sign[z * 18 + k]! > 0
        ? mesh.neighbour[l]!
        : Math.floor(l / 9),
    )
  }

  for (const w of [...neighbors].sort((p, r) => p - r)) {
    if (w === y) {
      continue
    }

    const first = links(z, w)
    const second = links(w, y)

    if (first.length > 0 && second.length > 0) {
      paths.push([first[0]!, second[0]!])
    }
  }

  return paths
}

// the first path whose line change keeps every link within capacity, or -1
export function fittingPath(
  line: Int8Array,
  paths: readonly LinePath[],
  capacity = 1,
): number {
  return paths.findIndex(p =>
    p.every(([l, sg]) => Math.abs(line[l]! + sg) <= capacity),
  )
}

// apply a path's line change (sense +1) or undo it (sense -1): the scheduled event of a unit's hop
export function applyPath(
  line: Int8Array,
  path: LinePath,
  sense: 1 | -1,
): void {
  for (const [l, sg] of path) {
    line[l] = line[l]! + sense * sg
  }
}
