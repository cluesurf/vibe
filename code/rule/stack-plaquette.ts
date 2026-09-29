// THE PLAQUETTE MOVE ON THE SHRINKING STACK (E-GRV-0133). code/rule/line-plaquette's move, one unit of line taken once
// around a closed face, run on every face of code/rule/open-husk's shrinking stack instead of the husk's alone: the husk
// is the boundary of the bulk, so a husk line's curl can pass into the bulk through the faces that hold vertical links.
//
// THE FACES, in this order (the husk's first, so a stack of no layers IS line-plaquette's face set, bit for bit):
//  HUSK      every husk triangle, code/rule/line-plaquette huskFaces on layer 0, 12 a dock.
//  LAYER     the same 12 triangles a dock on every bulk layer k = 1 .. K, on that layer's own links.
//  VERTICAL  one face per lateral link of layers 0 .. K - 1. The link runs y -> z on layer k; each end has its one
//            vertical link down to the layer-(k+1) dock that contains it, P(y) and P(z). The face is the loop
//              y -> z (the lateral link), z -> P(z) (z's vertical), P(z) -> P(y) (the layer-(k+1) link between them,
//              absent when P(z) = P(y)), P(y) -> y (y's vertical, taken up).
//            A quad where the lateral link crosses a parent's edge, a triangle where it does not. P(z) - P(y) is one
//            step in each axis at most (a unit step halves to 0 or 1), always one of the nine out-links of one of the
//            two parents, so the loop closes on the stack's own links.
// WHY THESE GENERATE EVERY CONTRACTIBLE LOOP: any loop of the stack can be pushed one layer down, link by link, through
// the vertical faces (each lateral link of layer k is homologous to its parents' link on layer k + 1 plus two
// verticals), until it lies in the deepest layer, where the layer triangles generate every contractible loop
// (line-plaquette's header). The winding that is left is the husk torus's three cycles, each carried down to the same
// cycle of the layer below: H1 of the stack is Z^3, the husk's, and no face changes it.
//
// THE BEAT is line-plaquette's with the stack's metric M = 2 / g on every link (g = 2 on an axis, 1 on a diagonal, 1 on
// a vertical, code/rule/open-husk's weights, the one-clock stack of E-GRV-0100 with no lapse):
//   E(t+1) = E(t) + drag(t) + C^T B(t)        B(t+1) = B(t) - (a / q) C M E(t+1)
// in integers with each face's remainder carried (the same carry as line-plaquette), every register in a balanced window
// of `whole` whole lines, a wrap counted. The drag lands on husk links only (content lives on the husk).
//
// GAUSS: C^T B has no divergence at any dock of husk or bulk (a face's boundary enters and leaves each corner once), so
// the stack divergence of E equals the drag's at every dock and beat, exactly: the content on husk docks, 0 on bulk
// docks. The husk's OWN divergence (husk lateral links only) is NOT kept: it differs from the content by the lines down
// the husk's verticals, which the vertical faces move.
//
// THE STATIC FIELD: B stops when C M E = 0 on every face, so M E = 2 grad x + h over the whole stack: E = g grad x with
// stack divergence the content, the static field of E-GRV-0100's stack (its zero mode keeps 1/r on the husk), plus h,
// the harmonic winding no face can change. Summing the husk's lateral lines gives x on the husk.
//
// REVERSIBLE: stackPlaquetteBeatBack is the inverse bit for bit. BOUNDED: every register is in its window, a wrap
// counted. DETERMINISM: nothing is drawn. NOTHING MOVES: each register takes its new value by the rule.

import { VERTICAL, type OpenMesh } from '@/code/rule/open-husk'
import {
  huskFaces,
  type PlaquetteRule,
  type PlaquetteTally,
} from '@/code/rule/line-plaquette'
import { radionMesh } from '@/code/rule/trit-radion'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export const FACE_HUSK = 0
export const FACE_LAYER = 1
export const FACE_VERTICAL = 2

export type StackFaces = {
  readonly count: number
  // face f's links are link[start[f] .. start[f + 1]), each with its sense (+1 along the link)
  readonly start: Int32Array
  readonly link: Int32Array
  readonly sign: Int8Array
  // the face's first corner, its kind, and the layer of that corner
  readonly dock: Int32Array
  readonly kind: Uint8Array
  readonly layer: Uint8Array
  // M = 2 / g per link
  readonly metric: Float64Array
}

// the stack's faces (a stack of no layers gives line-plaquette's husk faces, in the same order)
export function stackFaces(mesh: OpenMesh): StackFaces {
  if (mesh.growth !== 'shrink' || mesh.lapse || mesh.inertia) {
    throw new Error('stackFaces: the one-clock shrinking stack only')
  }

  const K = mesh.sides.length - 1
  const links: number[] = []
  const signs: number[] = []
  const start: number[] = [0]
  const dock: number[] = []
  const kind: number[] = []
  const layer: number[] = []

  const push = (
    ls: readonly (readonly [number, number])[],
    y: number,
    k: number,
    what: number,
  ): void => {
    for (const [l, s] of ls) {
      links.push(l)
      signs.push(s)
    }

    start.push(links.length)
    dock.push(y)
    kind.push(what)
    layer.push(k)
  }

  // the husk's triangles, then every layer's
  for (let k = 0; k <= K; k++) {
    const s = mesh.sides[k]!
    const f = huskFaces(radionMesh([s, s, s]))
    const base = mesh.offset[k]!

    for (let q = 0; q < f.count; q++) {
      const ls: [number, number][] = []

      for (let j = 0; j < 3; j++) {
        ls.push([base * 9 + f.link[q * 3 + j]!, f.sign[q * 3 + j]!])
      }

      push(ls, base + f.dock[q]!, k, k === 0 ? FACE_HUSK : FACE_LAYER)
    }
  }

  // each dock's vertical link (a shrinking stack: one down-link a dock above the deepest layer)
  const down = new Int32Array(mesh.docks).fill(-1)

  for (let m = 0; m < mesh.links; m++) {
    if (mesh.kind[m] === VERTICAL) {
      down[mesh.tail[m]!] = m
    }
  }

  // the one link between two docks of one layer, with the sense it is taken from `from` to `to`
  const between = (from: number, to: number): [number, number] => {
    const found: [number, number][] = []

    for (let h = 0; h < 9; h++) {
      if (mesh.head[from * 9 + h] === to) {
        found.push([from * 9 + h, 1])
      }

      if (mesh.head[to * 9 + h] === from) {
        found.push([to * 9 + h, -1])
      }
    }

    if (found.length !== 1) {
      throw new Error(
        `stackFaces: ${found.length} links between ${from} and ${to}`,
      )
    }

    return found[0]!
  }

  for (let k = 0; k < K; k++) {
    for (
      let y = mesh.offset[k]!;
      y < mesh.offset[k]! + mesh.sides[k]! ** 3;
      y++
    ) {
      for (let h = 0; h < 9; h++) {
        const m = y * 9 + h
        const z = mesh.head[m]!
        const vy = down[y]!
        const vz = down[z]!
        const py = mesh.head[vy]!
        const pz = mesh.head[vz]!
        const ls: [number, number][] = [
          [m, 1],
          [vz, 1],
        ]

        if (pz !== py) {
          ls.push(between(pz, py))
        }

        ls.push([vy, -1])
        push(ls, y, k, FACE_VERTICAL)
      }
    }
  }

  return {
    count: dock.length,
    start: Int32Array.from(start),
    link: Int32Array.from(links),
    sign: Int8Array.from(signs),
    dock: Int32Array.from(dock),
    kind: Uint8Array.from(kind),
    layer: Uint8Array.from(layer),
    metric: Float64Array.from(mesh.weight, g => 2 / g),
  }
}

// out = C M E, the circulation of M E around every face
export function stackFaceCurl(
  faces: StackFaces,
  line: ArrayLike<number>,
  out: Float64Array,
): void {
  const { start, link, sign, metric } = faces

  for (let f = 0; f < faces.count; f++) {
    let c = 0

    for (let j = start[f]!; j < start[f + 1]!; j++) {
      c += sign[j]! * metric[link[j]!]! * line[link[j]!]!
    }

    out[f] = c
  }
}

// out += C^T B: each face takes its value once around its boundary
export function addStackBoundary(
  faces: StackFaces,
  face: ArrayLike<number>,
  out: Float64Array,
): void {
  const { start, link, sign } = faces

  for (let f = 0; f < faces.count; f++) {
    const b = face[f]!

    if (b === 0) {
      continue
    }

    for (let j = start[f]!; j < start[f + 1]!; j++) {
      out[link[j]!] = out[link[j]!]! + sign[j]! * b
    }
  }
}

export type StackPlaquetteState = {
  readonly line: Float64Array
  readonly face: Float64Array
  readonly rest: Float64Array
}

export const emptyStackPlaquette = (
  mesh: OpenMesh,
  faces: StackFaces,
): StackPlaquetteState => ({
  line: new Float64Array(mesh.links),
  face: new Float64Array(faces.count),
  rest: new Float64Array(faces.count),
})

export const duplicateStackPlaquette = (
  s: StackPlaquetteState,
): StackPlaquetteState => ({
  line: Float64Array.from(s.line),
  face: Float64Array.from(s.face),
  rest: Float64Array.from(s.rest),
})

const sameArray = (
  a: ArrayLike<number>,
  b: ArrayLike<number>,
): boolean => {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

export const sameStackPlaquette = (
  a: StackPlaquetteState,
  b: StackPlaquetteState,
): boolean =>
  sameArray(a.line, b.line) &&
  sameArray(a.face, b.face) &&
  sameArray(a.rest, b.rest)

const wrapInto = (rule: PlaquetteRule, v: number): number =>
  mod(v + rule.top, rule.span) - rule.top

export type StackPlaquetteScratch = {
  sum: Float64Array
  curl: Float64Array
}

export const stackPlaquetteScratch = (
  mesh: OpenMesh,
  faces: StackFaces,
): StackPlaquetteScratch => ({
  sum: new Float64Array(mesh.links),
  curl: new Float64Array(faces.count),
})

// one beat in place; `drag` is whole register units per stack link (zero off the husk)
export function stackPlaquetteBeat(
  faces: StackFaces,
  rule: PlaquetteRule,
  s: StackPlaquetteState,
  drag: ArrayLike<number>,
  scratch: StackPlaquetteScratch,
  tally: PlaquetteTally,
): void {
  const { sum, curl } = scratch

  sum.fill(0)
  addStackBoundary(faces, s.face, sum)

  for (let l = 0; l < s.line.length; l++) {
    const raw = s.line[l]! + drag[l]! + sum[l]!

    s.line[l] = wrapInto(rule, raw)

    if (s.line[l] !== raw) {
      tally.lineWraps++
    }
  }

  stackFaceCurl(faces, s.line, curl)

  for (let f = 0; f < faces.count; f++) {
    const x = rule.a * curl[f]!
    const w = floorDiv(x + s.rest[f]! + rule.h, rule.q)
    const raw = s.face[f]! - w

    s.rest[f] = x + s.rest[f]! - rule.q * w
    s.face[f] = wrapInto(rule, raw)

    if (s.face[f] !== raw) {
      tally.faceWraps++
    }
  }
}

// the inverse of stackPlaquetteBeat with the same drag
export function stackPlaquetteBeatBack(
  faces: StackFaces,
  rule: PlaquetteRule,
  s: StackPlaquetteState,
  drag: ArrayLike<number>,
  scratch: StackPlaquetteScratch,
): void {
  const { sum, curl } = scratch

  stackFaceCurl(faces, s.line, curl)

  for (let f = 0; f < faces.count; f++) {
    const x = rule.a * curl[f]!
    const w = floorDiv(x - s.rest[f]! + rule.h, rule.q)

    s.rest[f] = s.rest[f]! - x + rule.q * w
    s.face[f] = wrapInto(rule, s.face[f]! + w)
  }

  sum.fill(0)
  addStackBoundary(faces, s.face, sum)

  for (let l = 0; l < s.line.length; l++) {
    s.line[l] = wrapInto(rule, s.line[l]! - drag[l]! - sum[l]!)
  }
}
