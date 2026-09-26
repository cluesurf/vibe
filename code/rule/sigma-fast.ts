// A fast kernel for the Sigma(648) link rule of code/rule/sigma-links, bit for bit the same beat.
//
// sigmaBeat in code/rule/sigma-links allocates its move schedule (up to 120 tuples) for every link on every
// beat, reads staples through arrays of tuples and builds closures in every loop move. On the side-6 D4 box
// under the 'wide' family that is several seconds a beat. This file precomputes everything a beat reads:
// the staples as flat Int32Arrays, the eight schedules of (word, center) moves as one Int32Array each, and a
// scratch buffer for the demon stream, and then runs the same moves in the same order with integer indices
// only. Nothing in the rule changes: `fastSigmaBeat` returns a state equal to `sigmaBeat`'s in every array,
// which tmp/sigma-fast-check.ts and the experiments that import this file check on their own runs.
//
// Only the forward beat is here. It covers every switch of the rule (hop, roles, loops, couple, transport,
// priceFlux, priceField, gauss, reflect) and every move family.

import type { HopListener, SigmaLinks, SigmaState } from '@/code/rule/sigma-links'

const DEGREE = 24
// each move is four integers: the words i, j, k (j = -1 for one staple) and the central element
const MOVE_WIDTH = 4

export type SigmaTables = {
  readonly rule: SigmaLinks
  // stapleB[a * staples + i], stapleC[...]: the two other sides of triangle i through direction a
  readonly stapleB: Int32Array
  readonly stapleC: Int32Array
  readonly staples: number
  readonly opposite: Int32Array
  readonly firsts: Int32Array
  // schedule[s] for s = step mod staples: the (i, j, k, center) moves of one link, in order
  readonly schedule: readonly Int32Array[]
  readonly product: Int16Array
  readonly inverse: Int16Array
  readonly level: Int32Array
  // scratch for the demon stream
  readonly old: Int32Array
}

// the tables a fast beat reads, built once per rule
export function makeSigmaTables(rule: SigmaLinks): SigmaTables {
  const staples = (rule.staples[0] ?? []).length
  const stapleB = new Int32Array(DEGREE * staples)
  const stapleC = new Int32Array(DEGREE * staples)

  for (let a = 0; a < DEGREE; a++) {
    const pairs = rule.staples[a] ?? []

    if (pairs.length !== staples) {
      throw new Error('every direction must have the same number of staples')
    }

    pairs.forEach(([b, c], i) => {
      stapleB[a * staples + i] = b
      stapleC[a * staples + i] = c
    })
  }

  const centers = rule.moves === 'one' || rule.moves === 'staples' ? [rule.identity] : [rule.identity, rule.omega, rule.omegaInverse]
  const patterns = rule.moves === 'words' ? [[1, 3]] : rule.moves === 'wide' ? [[1, 3], [2, 5], [1, 2], [3, 4]] : []
  // the schedule of sigma-links' linkMoves(rule, s, 0), one per s mod staples
  const schedule = Array.from({ length: staples }, (_, s) => {
    const words: number[][] =
      rule.moves === 'one'
        ? [[s % staples]]
        : [
            ...Array.from({ length: staples }, (_, i) => [(i + s) % staples]),
            ...patterns.flatMap(([p = 0, q = 0]) => Array.from({ length: staples }, (_, i) => [(i + s) % staples, (i + s + p) % staples, (i + s + q) % staples])),
          ]
    const moveCenters = rule.moves === 'one' ? [rule.identity] : centers
    const flat: number[] = []

    for (const word of words) {
      for (const z of moveCenters) {
        flat.push(word[0] ?? 0, word.length === 3 ? (word[1] ?? 0) : -1, word.length === 3 ? (word[2] ?? 0) : -1, z)
      }
    }

    return Int32Array.from(flat)
  })

  return {
    rule,
    stapleB,
    stapleC,
    staples,
    opposite: Int32Array.from(rule.opposite),
    firsts: Int32Array.from(rule.firsts),
    schedule,
    product: rule.group.product,
    inverse: rule.group.inverse,
    level: rule.level,
    old: new Int32Array(rule.cells * DEGREE),
  }
}

// a copy of a state, as sigmaBeat makes one
export function copySigmaState(state: SigmaState): SigmaState {
  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role),
    links: Int16Array.from(state.links),
    demon: Int32Array.from(state.demon),
    flux: Int32Array.from(state.flux),
  }
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

// the summed level of the triangles through (x, a) with u in its place
function triangleEnergy(tb: SigmaTables, links: Int16Array, x: number, a: number, u: number): number {
  const { rule, stapleB, stapleC, staples, product, level } = tb
  const order = rule.order
  const nb = rule.neighbour
  const y = nb[x * DEGREE + a] as number
  const base = a * staples

  let total = 0

  for (let i = 0; i < staples; i++) {
    const b = stapleB[base + i] as number
    const c = stapleC[base + i] as number
    const z = nb[y * DEGREE + b] as number
    const inner = product[(links[y * DEGREE + b] as number) * order + u] as number

    total += level[product[(links[z * DEGREE + c] as number) * order + inner] as number] as number
  }

  return total
}

function linkMatter(tb: SigmaTables, state: SigmaState, x: number, d: number, u: number): number {
  const rule = tb.rule
  const y = rule.neighbour[x * DEGREE + d] as number

  if (state.vibe[x] === 0 || state.vibe[y] === 0) {
    return 0
  }

  const p = state.role[x] as number
  const carried = rule.transport ? (rule.act[(rule.quotient[u] as number) * 9 + p] as number) : p

  return carried === state.role[y] ? -rule.kappa : 0
}

function cellMatter(tb: SigmaTables, state: SigmaState, x: number): number {
  if (state.vibe[x] === 0) {
    return 0
  }

  let total = 0

  for (let d = 0; d < DEGREE; d++) {
    total += linkMatter(tb, state, x, d, state.links[x * DEGREE + d] as number)
  }

  return total
}

function fluxAlong(tb: SigmaTables, flux: Int32Array, x: number, d: number): number {
  const o = tb.opposite[d] as number

  return d < o ? (flux[x * DEGREE + d] as number) : -(flux[(tb.rule.neighbour[x * DEGREE + d] as number) * DEGREE + o] as number)
}

function addFlux(tb: SigmaTables, flux: Int32Array, x: number, d: number, amount: number): void {
  const o = tb.opposite[d] as number

  if (d < o) {
    flux[x * DEGREE + d] = (flux[x * DEGREE + d] as number) + amount
  } else {
    const slot = (tb.rule.neighbour[x * DEGREE + d] as number) * DEGREE + o

    flux[slot] = (flux[slot] as number) - amount
  }
}

function pay(tb: SigmaTables, state: SigmaState, slot: number, cost: number): boolean {
  const next = (state.demon[slot] as number) - cost

  if (next < 0 || next > tb.rule.capacity) {
    return false
  }

  state.demon[slot] = next

  return true
}

const tensionOf = (tb: SigmaTables, e: number): number => (mod3(e) !== 0 ? tb.rule.tension : 0)

// scratch for one link's staples: loop[i] = the transport round the other two sides of triangle i, so that
// triangle i's transport with u in the link is loop[i] u, and the staple word of sigma-links is loop[i]^-1
const LOOP = new Int32Array(64)
const WORD = new Int32Array(64)

function reflectLink(tb: SigmaTables, state: SigmaState, x: number, a: number, s: number): number {
  const { rule, product, inverse, level, stapleB, stapleC, staples } = tb
  const order = rule.order
  const nb = rule.neighbour
  const links = state.links
  const moves = tb.schedule[s % staples] as Int32Array
  const slot = x * DEGREE + a
  const y = nb[slot] as number
  const back = y * DEGREE + (tb.opposite[a] as number)
  const matter = state.vibe[x] !== 0 && state.vibe[y] !== 0

  // the staples do not change while this link makes its moves, so they are read once
  for (let i = 0; i < staples; i++) {
    const b = stapleB[a * staples + i] as number
    const c = stapleC[a * staples + i] as number
    const z = nb[y * DEGREE + b] as number
    const loop = product[(links[z * DEGREE + c] as number) * order + (links[y * DEGREE + b] as number)] as number

    LOOP[i] = loop
    WORD[i] = inverse[loop] as number
  }

  const energyOf = (u: number): number => {
    let total = 0

    for (let i = 0; i < staples; i++) {
      total += level[product[(LOOP[i] as number) * order + u] as number] as number
    }

    return total
  }

  let u = links[slot] as number
  let energyU = energyOf(u)
  let moved = 0

  for (let m = 0; m < moves.length; m += MOVE_WIDTH) {
    const i = moves[m] as number
    const j = moves[m + 1] as number
    const k = moves[m + 2] as number
    const center = moves[m + 3] as number
    const vi = WORD[i] as number
    const v = j < 0 ? vi : (product[vi * order + (product[(inverse[WORD[j] as number] as number) * order + (WORD[k] as number)] as number)] as number)
    const next = product[center * order + (product[v * order + (product[(inverse[u] as number) * order + v] as number)] as number)] as number

    if (next === u) {
      continue
    }

    const energyNext = energyOf(next)
    const change = energyNext - energyU + (matter ? linkMatter(tb, state, x, a, next) - linkMatter(tb, state, x, a, u) : 0)

    if (!pay(tb, state, slot, change)) {
      continue
    }

    links[slot] = next
    links[back] = inverse[next] as number
    u = next
    energyU = energyNext
    moved++
  }

  return moved
}

function pathLevel3(tb: SigmaTables, links: Int16Array, x: number, a: number, b: number, c: number): number {
  const { rule, product } = tb
  const nb = rule.neighbour
  const order = rule.order
  const y = nb[x * DEGREE + a] as number
  const z = nb[y * DEGREE + b] as number

  let g = product[(links[x * DEGREE + a] as number) * order + rule.identity] as number

  g = product[(links[y * DEGREE + b] as number) * order + g] as number
  g = product[(links[z * DEGREE + c] as number) * order + g] as number

  return tb.level[g] as number
}

function loopLocal(tb: SigmaTables, links: Int16Array, x: number, a: number, y: number, b: number, z: number, c: number): number {
  return (
    triangleEnergy(tb, links, x, a, links[x * DEGREE + a] as number) +
    triangleEnergy(tb, links, y, b, links[y * DEGREE + b] as number) +
    triangleEnergy(tb, links, z, c, links[z * DEGREE + c] as number) -
    2 * pathLevel3(tb, links, x, a, b, c)
  )
}

function multiplyLeg(tb: SigmaTables, links: Int16Array, m: number, from: number, d: number): void {
  const g = tb.product[m * tb.rule.order + (links[from * DEGREE + d] as number)] as number

  links[from * DEGREE + d] = g
  links[(tb.rule.neighbour[from * DEGREE + d] as number) * DEGREE + (tb.opposite[d] as number)] = tb.inverse[g] as number
}

function loopMove(tb: SigmaTables, state: SigmaState, x: number, a: number, type: number): boolean {
  const rule = tb.rule
  const i = type % tb.staples
  const b = tb.stapleB[a * tb.staples + i] as number
  const c = tb.stapleC[a * tb.staples + i] as number
  const y = rule.neighbour[x * DEGREE + a] as number
  const z = rule.neighbour[y * DEGREE + b] as number
  const flux = state.flux
  const links = state.links
  const step = ((fluxAlong(tb, flux, x, a) % 2) + 2) % 2 === 0 ? 1 : -1
  const e1 = fluxAlong(tb, flux, x, a)
  const e2 = fluxAlong(tb, flux, y, b)
  const e3 = fluxAlong(tb, flux, z, c)
  const change =
    tensionOf(tb, e1 + step) - tensionOf(tb, e1) + tensionOf(tb, e2 + step) - tensionOf(tb, e2) + tensionOf(tb, e3 + step) - tensionOf(tb, e3)
  const factor =
    rule.couple === 'center'
      ? step > 0
        ? rule.omega
        : rule.omegaInverse
      : rule.couple === 'fixed'
        ? step > 0
          ? rule.fixedElement
          : (tb.inverse[rule.fixedElement] as number)
        : rule.identity

  let field = 0

  if (factor !== rule.identity) {
    const before = loopLocal(tb, links, x, a, y, b, z, c)

    multiplyLeg(tb, links, factor, x, a)
    multiplyLeg(tb, links, factor, y, b)
    multiplyLeg(tb, links, factor, z, c)
    field = loopLocal(tb, links, x, a, y, b, z, c) - before
  }

  if (!pay(tb, state, x * DEGREE + a, (rule.priceFlux ? change : 0) + (rule.priceField ? field : 0))) {
    if (factor !== rule.identity) {
      const undo = tb.inverse[factor] as number

      multiplyLeg(tb, links, undo, x, a)
      multiplyLeg(tb, links, undo, y, b)
      multiplyLeg(tb, links, undo, z, c)
    }

    return false
  }

  addFlux(tb, flux, x, a, step)
  addFlux(tb, flux, y, b, step)
  addFlux(tb, flux, z, c, step)

  return true
}

function reflectRole(tb: SigmaTables, state: SigmaState, x: number, d: number): boolean {
  const rule = tb.rule
  const y = rule.neighbour[x * DEGREE + d] as number

  if (state.vibe[x] === 0 || state.vibe[y] === 0 || x === y) {
    return false
  }

  const back = state.links[y * DEGREE + (tb.opposite[d] as number)] as number
  const q = rule.transport ? (rule.act[(rule.quotient[back] as number) * 9 + (state.role[y] as number)] as number) : (state.role[y] as number)
  const p = state.role[x] as number
  const next = mod3(2 * (q % 3) - (p % 3)) + 3 * mod3(2 * Math.floor(q / 3) - Math.floor(p / 3))

  if (next === p) {
    return false
  }

  const before = cellMatter(tb, state, x)

  state.role[x] = next

  const after = cellMatter(tb, state, x)
  const o = tb.opposite[d] as number
  const slot = d < o ? x * DEGREE + d : y * DEGREE + o

  if (!pay(tb, state, slot, after - before)) {
    state.role[x] = p

    return false
  }

  return true
}

function hop(tb: SigmaTables, state: SigmaState, x: number, a: number, onHop?: HopListener): boolean {
  const rule = tb.rule
  const y = rule.neighbour[x * DEGREE + a] as number
  const vx = state.vibe[x] as number
  const vy = state.vibe[y] as number

  if ((vx === 0) === (vy === 0) || x === y) {
    return false
  }

  const from = vx !== 0 ? x : y
  const to = vx !== 0 ? y : x
  const d = vx !== 0 ? a : (tb.opposite[a] as number)
  const via = state.links[from * DEGREE + d] as number
  const v = state.vibe[from] as number
  const p = state.role[from] as number
  const e = fluxAlong(tb, state.flux, from, d)
  const moved = rule.gauss ? e - v : e
  const before = cellMatter(tb, state, from)

  state.vibe[from] = 0
  state.role[from] = 0
  state.vibe[to] = v
  state.role[to] = rule.transport ? (rule.act[(rule.quotient[via] as number) * 9 + p] as number) : p

  const after = cellMatter(tb, state, to)
  const tension = rule.priceFlux ? tensionOf(tb, moved) - tensionOf(tb, e) : 0
  const shift = mod3(moved - e)
  const twisted =
    rule.couple === 'center' && shift !== 0 ? (tb.product[(shift === 1 ? rule.omega : rule.omegaInverse) * rule.order + via] as number) : via
  const field =
    twisted !== via && rule.priceField ? triangleEnergy(tb, state.links, from, d, twisted) - triangleEnergy(tb, state.links, from, d, via) : 0

  if (!pay(tb, state, x * DEGREE + a, after - before + tension + field)) {
    state.vibe[to] = 0
    state.role[to] = 0
    state.vibe[from] = v
    state.role[from] = p

    return false
  }

  addFlux(tb, state.flux, from, d, moved - e)
  state.links[from * DEGREE + d] = twisted
  state.links[to * DEGREE + (tb.opposite[d] as number)] = tb.inverse[twisted] as number
  onHop?.(from, to, d)

  return true
}

// one forward beat, IN PLACE on `state` (copy it first with copySigmaState if the old one is still wanted):
// the same moves in the same order as sigmaBeat, so the result equals sigmaBeat's
export function fastSigmaBeat(tb: SigmaTables, state: SigmaState, t: number, onHop?: HopListener): SigmaState {
  const rule = tb.rule
  const cells = rule.cells
  const firsts = tb.firsts

  if (rule.reflect) {
    for (let k = 0; k < firsts.length; k++) {
      const a = firsts[k] as number

      for (let x = 0; x < cells; x++) {
        reflectLink(tb, state, x, a, t + k)
      }
    }
  }

  if (rule.loops) {
    for (let k = 0; k < firsts.length; k++) {
      const a = firsts[k] as number

      for (let x = 0; x < cells; x++) {
        loopMove(tb, state, x, a, t + k)
      }
    }
  }

  if (rule.roles) {
    for (let x = 0; x < cells; x++) {
      if (state.vibe[x] === 0) {
        continue
      }

      for (let d = 0; d < DEGREE; d++) {
        reflectRole(tb, state, x, d)
      }
    }
  }

  if (rule.hop) {
    for (let x = 0; x < cells; x++) {
      for (let k = 0; k < firsts.length; k++) {
        hop(tb, state, x, firsts[k] as number, onHop)
      }
    }
  }

  const old = tb.old

  old.set(state.demon)

  for (let x = 0; x < cells; x++) {
    for (let k = 0; k < firsts.length; k++) {
      const a = firsts[k] as number

      state.demon[(rule.neighbour[x * DEGREE + a] as number) * DEGREE + a] = old[x * DEGREE + a] as number
    }
  }

  return state
}

// the field energy, as sigmaFieldEnergy
export function fastFieldEnergy(tb: SigmaTables, links: Int16Array): number {
  let total = 0

  for (let x = 0; x < tb.rule.cells; x++) {
    for (let k = 0; k < tb.firsts.length; k++) {
      const a = tb.firsts[k] as number

      total += triangleEnergy(tb, links, x, a, links[x * DEGREE + a] as number)
    }
  }

  return total / 3
}

// the heat-assisted drain of sigma-links' coolSigmaLinks, on the fast beat: the same start
export function fastCoolSigmaLinks(
  tb: SigmaTables,
  links: Int16Array,
  input: { drain: number; cycles: number; fill: number; beats: number; empties: number },
): { state: SigmaState; beats: number } {
  const rule = tb.rule
  const golden = (Math.sqrt(5) - 1) / 2
  const s: SigmaState = {
    vibe: new Int8Array(rule.cells),
    role: new Int8Array(rule.cells),
    links,
    demon: new Int32Array(rule.cells * DEGREE),
    flux: new Int32Array(rule.cells * DEGREE),
  }

  let t = 0

  const empty = (n: number): void => {
    for (let k = 0; k < n; k++) {
      fastSigmaBeat(tb, s, t++)
      s.demon.fill(0)
    }
  }

  empty(input.drain)

  for (let c = 0; c < input.cycles; c++) {
    for (let x = 0; x < rule.cells; x++) {
      rule.firsts.forEach((a, k) => {
        s.demon[x * DEGREE + a] = ((x * 12 + k) * golden) % 1 < input.fill ? rule.capacity : 0
      })
    }

    for (let k = 0; k < input.beats; k++) {
      fastSigmaBeat(tb, s, t++)
    }

    empty(input.empties)
  }

  return { state: s, beats: t }
}
