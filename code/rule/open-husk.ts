// The open husk (E-GRV-0094, 0095): the bounded depth field of code/rule/step-depth with the husk made the boundary of
// a bulk, so the depth's steps, its rates and the content's lines run on down into layers below the husk. A STAND-IN, as
// the radion is: nothing in the model makes the depth read any state (E-GRV-0071), and the bulk geometry here is a
// stated stand-in for the {3,4,3,4}'s, not that mesh.
//
// THE BULK (note/research/vibe/roadmap/discrete-gravity.md, Parts 5c.1 and 5d 1b). Layer 0 is the husk: the periodic
// cubic mesh of side N with code/rule/trit-radion's nine out-links a dock (weight g = 2 on an axis, 1 on a face
// diagonal, the light's metric), unchanged. Layer k is the same nine-link mesh on a torus of side N 2^k (GROW) or
// N / 2^k (SHRINK), and each dock is joined by one VERTICAL link (g = 1, pointing down) to each dock of the next layer
// that it contains or that contains it: horospherical layers of a hyperbolic 4d space cut into cubes (an octree),
// the 3d analogue of the binary tiling of the hyperbolic plane. GROW: every layer has 8 times the docks of the one
// above, a scale factor of 2 a layer, so the curvature length is 1 / ln 2 = 1.44 layer spacings. WHY 8: the
// {3,4,3,4}'s shells grow by 18.28 (E-GMT-0027), a curvature length of 1 / ln(18.28^(1/3)) = 1.03 spacings for a 3d
// boundary; a cube cut in 2 per axis is the nearest subdivision that keeps each layer the same cubic mesh (27, cut in
// 3, gives 0.91 and 27 times the docks a layer). WHY g = 1 on a vertical link: a husk dock then has 8 down-links, a
// vertical conductance of 8 a unit of husk area beside the husk's lateral 6 (the husk mesh's 2 |p|^2 on the axes plus
// 4 |p|^2 on the diagonals), near isotropic at the husk with the smallest integer weight.
// The FLOOR: below the deepest GROW layer, each dock has 8 more down-links to the ground, where the rate is 0 for ever
// and the depth is 0 by definition: the stand-in for the bulk's conformal boundary, where content lines end. Nothing is
// placed there; it is the edge of the finite mesh, and a line or a wave reaches it only by passing every layer.
// SHRINK (layers of 1/8 the docks: the Randall-Sundrum II direction and the {3,4,3,4}'s own, whose outermost shell is
// the husk) has no floor: its bulk is finite and closed, so lines still need sinks.
//
// WHAT IS STORED is exactly code/rule/step-depth's, on every link and dock of husk and bulk: a line trit f and a step F
// (a trit and L balanced base-Q digits) per link, a rate v (the same shape) and a remainder R in -H .. H per dock. The
// ground holds nothing. No register holds a depth or a content: content is div f, the depth is found by summing F / g
// from the ground (or from dock 0 when there is none) along a fixed tree of links.
//
// THE BEAT is code/rule/step-depth's, read on any links: X = a (Q^L div f - div F), w = floor((X + R + H) / Q),
// R <- X + R - Q w, v <- wrap(v + w), then F <- wrap(F + g (v_tail - v_head)) with v_ground = 0. With no bulk layers
// and no floor it is stepBeat bit for bit (the control E-GRV-0094 B0). REVERSIBLE: openBeatBack inverts it bit for bit.
//
// THE WARPED CLOCK (E-GRV-0102, 0103; warpClock below). SHRINK only: a dock of layer k is 2^k husk docks across, and
// its proper time is made to run 2^-k as fast as the husk's, so the lapse falls with depth exactly as the scale grows
// (Randall-Sundrum's warp: space and time rescaled together). THE SCHEDULE: every dock still beats every husk beat, but
// a layer-k dock's one division is by Q 4^k instead of Q, its remainder carried in a window of Q 4^k values
// (-floor(Q 4^k / 2) .. Q 4^k - 1 - floor(Q 4^k / 2)). WHY THIS IS THE CLOCK: with tau = t / 2^k the dock's equation
// d^2 x / d tau^2 = kappa (rho - div F) is d^2 x / dt^2 = (kappa / 4^k)(rho - div F), the same equation read in husk
// beats. WHY NOT a literal tick every 2^k beats: that samples the same equation at the dock's own step but makes the beat
// a multi-rate leapfrog, which has no exactly kept energy; this schedule is one leapfrog with a diagonal inertia, so the
// energy is kept as the one-clock stack's is. Exactly reversible (the remainder is carried, never dropped) and bounded
// (the largest remainder window is Q 4^K). The LINK WEIGHTS ARE UNTOUCHED, so the static field (v = 0: div F = rho,
// F / g a gradient) is the one-clock stack's exactly: the clock enters the waves and not the statics.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a unit of content's hop is a scheduled event.

import { radionMesh, radionWeight } from '@/code/rule/trit-radion'
import type { StepRule, StepTally } from '@/code/rule/step-depth'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export const GROUND = -1

// link kinds
export const HUSK_LATERAL = 0
export const BULK_LATERAL = 1
export const VERTICAL = 2
export const FLOOR = 3

export type Growth = 'grow' | 'shrink'

export type OpenMesh = {
  readonly side: number
  readonly growth: Growth
  // side and first dock of each layer, 0 (the husk) .. K
  readonly sides: readonly number[]
  readonly offset: readonly number[]
  readonly docks: number
  readonly huskDocks: number
  readonly links: number
  readonly tail: Int32Array
  // GROUND (-1) on a floor link
  readonly head: Int32Array
  readonly weight: Int8Array
  readonly kind: Uint8Array
  // incidence, compressed: the links at dock y are incLink[incStart[y] .. incStart[y + 1]), incSign +1 where y is the tail
  readonly incStart: Int32Array
  readonly incLink: Int32Array
  readonly incSign: Int8Array
  // the tree along which the depth is summed: each dock's link toward the root, and the order docks are reached
  readonly treeLink: Int32Array
  readonly treeOrder: Int32Array
  readonly hasGround: boolean
  // the warped clock (warpClock): per dock, the multiple of Q its one division is by (absent: 1 on every dock)
  readonly inertia?: Int32Array
  // the lapse in the links (lapseLinks): per link and per dock, the layer e whose lapse 2^-e it carries (absent: 0)
  readonly lapse?: {
    readonly link: Uint8Array
    readonly dock: Uint8Array
  }
}

// the warped clock on a shrinking stack: a layer-k dock divides by Q 4^k (its proper time runs 2^-k as fast)
export function warpClock(mesh: OpenMesh): OpenMesh {
  if (mesh.growth !== 'shrink') {
    throw new Error('warpClock: a shrinking stack only')
  }

  const inertia = new Int32Array(mesh.docks)

  mesh.sides.forEach((s, k) =>
    inertia.fill(
      (mesh.side / s) ** 2,
      mesh.offset[k],
      mesh.offset[k]! + s ** 3,
    ),
  )

  return { ...mesh, inertia }
}

// THE LAPSE IN THE LINKS (E-GRV-0105). Randall-Sundrum's action carries the lapse N = 2^-k inside every spatial
// gradient term (sqrt(-g) g^ij), not only in the clock, so on a shrinking stack a layer-k link's weight is its mesh
// weight g times 2^-k and a layer-k dock's inertia is 2^k (warpClock's 4^k clock over the same 2^-k). A VERTICAL link
// from layer k to k + 1 carries its UPPER dock's lapse, 2^-k: the midpoint's 2^-(k + 1/2) is not a ratio of integers.
// HOW IT STAYS IN INTEGERS: a lapsed link stores its step in units 2^e times finer, F~ = 2^e F, so F~ takes the step
// of the unlapsed mesh weight g exactly (F~ <- F~ + g (v_tail - v_head)) and F~ / g is still the depth's difference
// (openDepth unchanged). At a layer-e dock the beat multiplies its equation through by 2^e:
//   v <- v + kappa 2^-e (rho - div F)  =  v + (kappa / 4^e) (2^e rho - sum_links sign F~ 2^(e - e_link)),
// every 2^(e - e_link) a whole number (1, or 2 on the link up to the layer above), and the one division is by Q 4^e,
// warpClock's divisor, its remainder carried in the same window. So the lapse costs no new register, stays exactly
// reversible (openBeatBack), and bounded (a stored step is the unlapsed mesh's step for the same depth difference).
// THE ENERGY (code/measure/open-husk openEnergy): a link's part F~1 F~0 2^-e / g, a dock's kinetic part 2^e v^2 / kappa.
export function lapseLinks(mesh: OpenMesh): OpenMesh {
  const clocked = warpClock(mesh)
  const dock = new Uint8Array(mesh.docks)
  const link = new Uint8Array(mesh.links)

  mesh.sides.forEach((s, k) =>
    dock.fill(k, mesh.offset[k], mesh.offset[k]! + s ** 3),
  )

  // a lateral link is its tail's layer; a vertical link's tail is its upper dock
  for (let m = 0; m < mesh.links; m++) {
    link[m] = dock[mesh.tail[m]!]!
  }

  return { ...clocked, lapse: { link, dock } }
}

// 2 ^ (the dock's lapse layer less the link's): the whole-number factor of a lapsed link's step at one of its docks
const lapseFactor = (mesh: OpenMesh, y: number, m: number): number =>
  mesh.lapse ? 2 ** (mesh.lapse.dock[y]! - mesh.lapse.link[m]!) : 1

// div F as the beat reads it: out minus in at each dock, each lapsed step times 2^(e_dock - e_link) (openDivergence
// without a lapse)
export function openStepDivergence(
  mesh: OpenMesh,
  step: ArrayLike<number>,
  out: Float64Array,
): void {
  if (!mesh.lapse) {
    return openDivergence(mesh, step, out)
  }

  out.fill(0)

  const { tail, head } = mesh

  for (let m = 0; m < mesh.links; m++) {
    const v = step[m]!

    if (v === 0) {
      continue
    }

    out[tail[m]!] = out[tail[m]!]! + v * lapseFactor(mesh, tail[m]!, m)

    if (head[m]! >= 0) {
      out[head[m]!] =
        out[head[m]!]! - v * lapseFactor(mesh, head[m]!, m)
    }
  }
}

// the content's multiplier in the beat at dock y: 2^e on a lapsed dock, 1 otherwise
const contentFactor = (mesh: OpenMesh, y: number): number =>
  mesh.lapse ? 2 ** mesh.lapse.dock[y]! : 1

// the divisor of dock y's one division, and the low end of its remainder's window (for an odd divisor, the balanced
// window -H .. H of code/rule/step-depth)
export const openDivisor = (
  mesh: OpenMesh,
  rule: StepRule,
  y: number,
): number => (mesh.inertia ? rule.q * mesh.inertia[y]! : rule.q)
export const openRestLow = (divisor: number): number =>
  Math.floor(divisor / 2)

// the dock of layer k at (a, b, c)
export const layerDock = (
  mesh: OpenMesh,
  k: number,
  a: number,
  b: number,
  c: number,
): number => {
  const s = mesh.sides[k]!

  return mesh.offset[k]! + mod(a, s) + s * mod(b, s) + s * s * mod(c, s)
}

export const layerOf = (mesh: OpenMesh, y: number): number => {
  let k = 0

  while (k + 1 < mesh.sides.length && y >= mesh.offset[k + 1]!) {
    k++
  }

  return k
}

// the layered mesh: `layers` bulk layers below a husk of side `side`; `floor` down-links a deepest dock (GROW only)
export function openMesh(
  side: number,
  layers: number,
  growth: Growth,
  floor = 8,
): OpenMesh {
  const sides: number[] = []
  const offset: number[] = []

  let docks = 0

  for (let k = 0; k <= layers; k++) {
    const s = growth === 'grow' ? side * 2 ** k : side / 2 ** k

    if (!Number.isInteger(s) || s < 3) {
      throw new Error(`openMesh: layer ${k} has side ${s}`)
    }

    sides.push(s)
    offset.push(docks)
    docks += s ** 3
  }

  const floors =
    growth === 'grow' && layers >= 0 ? floor * sides[layers]! ** 3 : 0
  const verticals = sides
    .slice(0, layers)
    .reduce(
      (n, s, k) =>
        n + (growth === 'grow' ? 8 * s ** 3 : sides[k]! ** 3),
      0,
    )
  const links = docks * 9 + verticals + floors
  const tail = new Int32Array(links)
  const head = new Int32Array(links)
  const weight = new Int8Array(links)
  const kind = new Uint8Array(links)

  // laterals: link y * 9 + h, as code/rule/trit-radion's out-links, in every layer
  for (let k = 0; k <= layers; k++) {
    const s = sides[k]!
    const lateral = radionMesh([s, s, s])

    for (let i = 0; i < s ** 3; i++) {
      const y = offset[k]! + i

      for (let h = 0; h < 9; h++) {
        const l = y * 9 + h

        tail[l] = y
        head[l] = offset[k]! + lateral.neighbour[i * 9 + h]!
        weight[l] = radionWeight(h)
        kind[l] = k === 0 ? HUSK_LATERAL : BULK_LATERAL
      }
    }
  }

  let l = docks * 9

  const coords = (k: number, i: number): [number, number, number] => {
    const s = sides[k]!

    return [i % s, Math.floor(i / s) % s, Math.floor(i / (s * s))]
  }

  for (let k = 0; k < layers; k++) {
    for (let i = 0; i < sides[k]! ** 3; i++) {
      const y = offset[k]! + i
      const [a, b, c] = coords(k, i)

      if (growth === 'grow') {
        for (let n = 0; n < 8; n++) {
          tail[l] = y
          head[l] =
            offset[k + 1]! +
            (2 * a + (n & 1)) +
            sides[k + 1]! *
              (2 * b +
                ((n >> 1) & 1) +
                sides[k + 1]! * (2 * c + ((n >> 2) & 1)))
          weight[l] = 1
          kind[l] = VERTICAL
          l++
        }
      } else {
        tail[l] = y
        head[l] =
          offset[k + 1]! +
          (a >> 1) +
          sides[k + 1]! * ((b >> 1) + sides[k + 1]! * (c >> 1))
        weight[l] = 1
        kind[l] = VERTICAL
        l++
      }
    }
  }

  if (floors > 0) {
    for (let i = 0; i < sides[layers]! ** 3; i++) {
      for (let n = 0; n < floor; n++) {
        tail[l] = offset[layers]! + i
        head[l] = GROUND
        weight[l] = 1
        kind[l] = FLOOR
        l++
      }
    }
  }

  // incidence
  const degree = new Int32Array(docks + 1)

  for (let m = 0; m < links; m++) {
    degree[tail[m]!]!++

    if (head[m]! >= 0) {
      degree[head[m]!]!++
    }
  }

  const incStart = new Int32Array(docks + 1)

  for (let y = 0; y < docks; y++) {
    incStart[y + 1] = incStart[y]! + degree[y]!
  }

  const fill = Int32Array.from(incStart.subarray(0, docks))
  const incLink = new Int32Array(incStart[docks]!)
  const incSign = new Int8Array(incStart[docks]!)

  for (let m = 0; m < links; m++) {
    incLink[fill[tail[m]!]!] = m
    incSign[fill[tail[m]!]!] = 1
    fill[tail[m]!]!++

    if (head[m]! >= 0) {
      incLink[fill[head[m]!]!] = m
      incSign[fill[head[m]!]!] = -1
      fill[head[m]!]!++
    }
  }

  // the summation tree: breadth first from the ground (every floor link's tail first) or from dock 0
  const hasGround = floors > 0
  const treeLink = new Int32Array(docks).fill(-2)
  const treeOrder = new Int32Array(docks)

  let n = 0

  if (hasGround) {
    for (let m = links - floors; m < links; m++) {
      if (treeLink[tail[m]!] !== -2) {
        continue
      }

      treeLink[tail[m]!] = m
      treeOrder[n++] = tail[m]!
    }
  } else {
    treeLink[0] = -1
    treeOrder[n++] = 0
  }

  for (let i = 0; i < n; i++) {
    const y = treeOrder[i]!

    for (let j = incStart[y]!; j < incStart[y + 1]!; j++) {
      const m = incLink[j]!
      const z = incSign[j]! > 0 ? head[m]! : tail[m]!

      if (z < 0 || treeLink[z] !== -2) {
        continue
      }

      treeLink[z] = m
      treeOrder[n++] = z
    }
  }

  if (n !== docks) {
    throw new Error('openMesh: not connected')
  }

  return {
    side,
    growth,
    sides,
    offset,
    docks,
    huskDocks: side ** 3,
    links,
    tail,
    head,
    weight,
    kind,
    incStart,
    incLink,
    incSign,
    treeLink,
    treeOrder,
    hasGround,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the state and the beat

export type OpenState = {
  readonly line: Int8Array
  readonly step: Float64Array
  readonly rate: Float64Array
  readonly rest: Float64Array
}

export const emptyOpen = (mesh: OpenMesh): OpenState => ({
  line: new Int8Array(mesh.links),
  step: new Float64Array(mesh.links),
  rate: new Float64Array(mesh.docks),
  rest: new Float64Array(mesh.docks),
})

export const duplicateOpen = (s: OpenState): OpenState => ({
  line: Int8Array.from(s.line),
  step: Float64Array.from(s.step),
  rate: Float64Array.from(s.rate),
  rest: Float64Array.from(s.rest),
})

const sameArray = (
  a: ArrayLike<number>,
  b: ArrayLike<number>,
): boolean => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

export const sameOpen = (a: OpenState, b: OpenState): boolean =>
  sameArray(a.line, b.line) &&
  sameArray(a.step, b.step) &&
  sameArray(a.rate, b.rate) &&
  sameArray(a.rest, b.rest)

// out minus in at each dock (a floor link's ground end is not a dock)
export function openDivergence(
  mesh: OpenMesh,
  field: ArrayLike<number>,
  out: Float64Array,
): void {
  out.fill(0)

  const { tail, head } = mesh

  for (let m = 0; m < mesh.links; m++) {
    const v = field[m]!

    if (v === 0) {
      continue
    }

    out[tail[m]!] = out[tail[m]!]! + v

    if (head[m]! >= 0) {
      out[head[m]!] = out[head[m]!]! - v
    }
  }
}

export type OpenScratch = {
  divLine: Float64Array
  divStep: Float64Array
}

export const openScratch = (mesh: OpenMesh): OpenScratch => ({
  divLine: new Float64Array(mesh.docks),
  divStep: new Float64Array(mesh.docks),
})

const wrapInto = (rule: StepRule, v: number): number =>
  mod(v + rule.top, rule.span) - rule.top

export function openBeat(
  mesh: OpenMesh,
  rule: StepRule,
  s: OpenState,
  scratch: OpenScratch,
  tally?: StepTally,
): void {
  const { a, q, h, unit } = rule

  openDivergence(mesh, s.line, scratch.divLine)
  openStepDivergence(mesh, s.step, scratch.divStep)

  const inertia = mesh.inertia

  for (let y = 0; y < mesh.docks; y++) {
    const x =
      a *
      (unit * contentFactor(mesh, y) * scratch.divLine[y]! -
        scratch.divStep[y]!)
    const qy = inertia ? q * inertia[y]! : q
    const w = floorDiv(
      x + s.rest[y]! + (inertia ? openRestLow(qy) : h),
      qy,
    )
    const raw = s.rate[y]! + w

    s.rest[y] = x + s.rest[y]! - qy * w
    s.rate[y] = wrapInto(rule, raw)

    if (tally && s.rate[y] !== raw) {
      tally.vWraps++
    }
  }

  const { tail, head, weight } = mesh

  for (let m = 0; m < mesh.links; m++) {
    const z = head[m]!
    const raw =
      s.step[m]! +
      weight[m]! * (s.rate[tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))

    s.step[m] = wrapInto(rule, raw)

    if (tally && s.step[m] !== raw) {
      tally.fWraps++
    }
  }
}

export function openBeatBack(
  mesh: OpenMesh,
  rule: StepRule,
  s: OpenState,
  scratch: OpenScratch,
): void {
  const { a, q, h, unit } = rule
  const { tail, head, weight } = mesh

  for (let m = 0; m < mesh.links; m++) {
    const z = head[m]!

    s.step[m] = wrapInto(
      rule,
      s.step[m]! -
        weight[m]! * (s.rate[tail[m]!]! - (z >= 0 ? s.rate[z]! : 0)),
    )
  }

  openDivergence(mesh, s.line, scratch.divLine)
  openStepDivergence(mesh, s.step, scratch.divStep)

  const inertia = mesh.inertia

  for (let y = 0; y < mesh.docks; y++) {
    const x =
      a *
      (unit * contentFactor(mesh, y) * scratch.divLine[y]! -
        scratch.divStep[y]!)
    const qy = inertia ? q * inertia[y]! : q
    // the one w that puts the old remainder back in its window (q - 1 - h = h for an odd q)
    const w = floorDiv(
      x - s.rest[y]! + (inertia ? qy - 1 - openRestLow(qy) : h),
      qy,
    )

    s.rest[y] = s.rest[y]! - x + qy * w
    s.rate[y] = wrapInto(rule, s.rate[y]! - w)
  }
}

// ---------------------------------------------------------------------------------------------------------
// depth, found by summing steps from the ground

export type OpenDepth = {
  // 2 x per dock in the step's units (exact integers when the steps are): along a link, x_tail - x_head = F / g, x = 0
  // at the ground (or at dock 0 with no ground)
  twice: Float64Array
  // links where x_tail - x_head differs from F / g
  curl: number
}

export function openDepth(
  mesh: OpenMesh,
  step: ArrayLike<number>,
): OpenDepth {
  const twice = new Float64Array(mesh.docks)
  const along = (m: number): number => (2 / mesh.weight[m]!) * step[m]!
  const at = (y: number): number => (y >= 0 ? twice[y]! : 0)

  for (let i = 0; i < mesh.docks; i++) {
    const y = mesh.treeOrder[i]!
    const m = mesh.treeLink[y]!

    if (m < 0) {
      continue
    }

    // y is the tail: x_y = x_head + F / g; y is the head: x_y = x_tail - F / g
    twice[y] =
      mesh.tail[m] === y
        ? at(mesh.head[m]!) + along(m)
        : at(mesh.tail[m]!) - along(m)
  }

  let curl = 0

  for (let m = 0; m < mesh.links; m++) {
    if (twice[mesh.tail[m]!]! - at(mesh.head[m]!) !== along(m)) {
      curl++
    }
  }

  return { twice, curl }
}

// ---------------------------------------------------------------------------------------------------------
// lines

// docks where lines out minus lines in differ from the content (content zero off the husk unless given)
export function openGaussOff(
  mesh: OpenMesh,
  line: Int8Array,
  content: Int32Array,
  div = new Float64Array(mesh.docks),
): number {
  openDivergence(mesh, line, div)

  let off = 0

  for (let y = 0; y < mesh.docks; y++) {
    if (div[y] !== content[y]) {
      off++
    }
  }

  return off
}

// the far end of link m seen from a dock with sign sg (GROUND for a floor link's head)
const across = (mesh: OpenMesh, m: number, sg: number): number =>
  sg > 0 ? mesh.head[m]! : mesh.tail[m]!

// which links a line may use (every link when absent): huskOnly keeps content's lines on the husk's lateral links
export type LinkAllow = (m: number) => boolean

export const huskOnly =
  (mesh: OpenMesh): LinkAllow =>
  (m: number): boolean =>
    mesh.kind[m] === HUSK_LATERAL

// one unit of line from `from` to the nearest (breadth first over allowed links with room) dock of negative supply or
// the ground; applied to `line` if found. `stamp` / `prev` are scratch of mesh.docks entries, `mark` a fresh stamp value.
function routeUnit(
  mesh: OpenMesh,
  line: Int8Array,
  supply: Int32Array,
  sources: readonly number[],
  capacity: number,
  stamp: Int32Array,
  prev: Int32Array,
  queue: Int32Array,
  mark: number,
  allow?: LinkAllow,
): number {
  let tail = 0

  for (const y of sources) {
    ;((stamp[y] = mark), (prev[y] = -1), (queue[tail++] = y))
  }

  let found = -2
  let foundAt = -1
  let foundLink = -1

  for (let at = 0; at < tail && found === -2; at++) {
    const y = queue[at]!

    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      const m = mesh.incLink[j]!
      const sg = mesh.incSign[j]!

      if (sg * line[m]! >= capacity || (allow && !allow(m))) {
        continue
      }

      const z = across(mesh, m, sg)

      if (z === GROUND) {
        found = GROUND
        foundAt = y
        foundLink = j
        break
      }

      if (stamp[z] === mark) {
        continue
      }

      stamp[z] = mark
      prev[z] = j

      if (supply[z]! < 0) {
        found = z
        break
      }

      queue[tail++] = z
    }
  }

  if (found === -2) {
    return -2
  }

  let z = found === GROUND ? foundAt : found

  if (found === GROUND) {
    line[mesh.incLink[foundLink]!] =
      line[mesh.incLink[foundLink]!]! + mesh.incSign[foundLink]!
  }

  while (prev[z] !== -1) {
    const j = prev[z]!
    const m = mesh.incLink[j]!

    line[m] = line[m]! + mesh.incSign[j]!
    z = across(mesh, m, -mesh.incSign[j]!)
  }

  if (found !== GROUND) {
    supply[found]!++
  }

  return z
}

// lines for a content map: each unit from the docks with content left to the nearest dock with a sink left or to the
// ground (successive augmenting paths, one line a link, over the allowed links only when `allow` is given). Gauss's law
// holds exactly when every unit is routed. Throws if one cannot be.
export function placeOpenLines(
  mesh: OpenMesh,
  content: Int32Array,
  capacity = 1,
  allow?: LinkAllow,
): Int8Array {
  const line = new Int8Array(mesh.links)
  const supply = Int32Array.from(content)
  const stamp = new Int32Array(mesh.docks)
  const prev = new Int32Array(mesh.docks)
  const queue = new Int32Array(mesh.docks)
  const total = content.reduce((s, v) => s + (v > 0 ? v : 0), 0)

  let mark = 0

  for (let unit = 0; unit < total; unit++) {
    const sources: number[] = []

    for (let y = 0; y < mesh.docks; y++) {
      if (supply[y]! > 0) {
        sources.push(y)
      }
    }

    const from = routeUnit(
      mesh,
      line,
      supply,
      sources,
      capacity,
      stamp,
      prev,
      queue,
      ++mark,
      allow,
    )

    if (from === -2) {
      throw new Error(
        `placeOpenLines: unit ${unit} of ${total} cannot be routed`,
      )
    }

    supply[from]!--
  }

  return line
}

// the densest lump the lines allow, with its lines ending in the bulk: M units placed one at a time on the husk dock
// nearest `order[0]` (the order given, nearest first) that can still send a unit line to the ground, and routed there.
// A dock that cannot send one never can again (a maximum flow's residual reach only shrinks as flow is added from
// elsewhere), so the docks are tried in order once each.
export function compressOpen(
  mesh: OpenMesh,
  order: readonly number[],
  m: number,
  capacity = 1,
): { content: Int32Array; line: Int8Array } {
  const line = new Int8Array(mesh.links)
  const content = new Int32Array(mesh.docks)
  const supply = new Int32Array(mesh.docks)
  const stamp = new Int32Array(mesh.docks)
  const prev = new Int32Array(mesh.docks)
  const queue = new Int32Array(mesh.docks)

  let at = 0
  let mark = 0

  for (let unit = 0; unit < m; unit++) {
    for (;;) {
      if (at >= order.length) {
        throw new Error(
          `compressOpen: unit ${unit} of ${m} has nowhere to go`,
        )
      }

      const y = order[at]!

      if (
        routeUnit(
          mesh,
          line,
          supply,
          [y],
          capacity,
          stamp,
          prev,
          queue,
          ++mark,
        ) !== -2
      ) {
        content[y]!++
        break
      }

      at++
    }
  }

  return { content, line }
}

// a path of links, each with the sign of its line change
export type OpenPath = readonly (readonly [number, number])[]

// the candidate paths for a unit line from z to y (a unit hopping from y to its neighbor z): the direct links first,
// then the two-link detours through each common neighbor in dock order (code/rule/step-depth hopPaths, on any links, or
// on the allowed links only when `allow` is given)
export function openHopPaths(
  mesh: OpenMesh,
  y: number,
  z: number,
  allow?: LinkAllow,
): OpenPath[] {
  const links = (p: number, r: number): [number, number][] => {
    const out: [number, number][] = []

    for (let j = mesh.incStart[p]!; j < mesh.incStart[p + 1]!; j++) {
      if (
        across(mesh, mesh.incLink[j]!, mesh.incSign[j]!) === r &&
        (!allow || allow(mesh.incLink[j]!))
      ) {
        out.push([mesh.incLink[j]!, mesh.incSign[j]!])
      }
    }

    return out
  }

  const paths: OpenPath[] = links(z, y).map(e => [e])
  const neighbors = new Set<number>()

  for (let j = mesh.incStart[z]!; j < mesh.incStart[z + 1]!; j++) {
    const w = across(mesh, mesh.incLink[j]!, mesh.incSign[j]!)

    if (w >= 0) {
      neighbors.add(w)
    }
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

export const openFittingPath = (
  line: Int8Array,
  paths: readonly OpenPath[],
  capacity = 1,
): number =>
  paths.findIndex(p =>
    p.every(([l, sg]) => Math.abs(line[l]! + sg) <= capacity),
  )

export function applyOpenPath(
  line: Int8Array,
  path: OpenPath,
  sense: 1 | -1,
): void {
  for (const [l, sg] of path) {
    line[l] = line[l]! + sense * sg
  }
}
