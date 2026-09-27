// THE PLAQUETTE MOVE ON THE ENERGY-LINE REGISTER (E-GRV-0130; note/research/vibe/roadmap/remaining-pieces.md, ideas 2
// and 3c). E-GRV-0127 found the rule's own energy lines keep Gauss exactly but form a tube on the source's husk line,
// 98.8 percent divergence free, so summing them is not the depth. This is the one move that changes a line field's curl
// and never its divergence: take one unit of line around a closed face.
//
// WHAT IS STORED (the husk mesh of code/rule/trit-radion, 9 out-links a dock, g = 2 on an axis and 1 on a diagonal):
//  per link  LINE  E: the energy lines, in units of 1 / Q^L (so one whole line is Q^L), in a balanced window of
//                  `whole` whole lines. The rule's drag adds whole lines to it; the plaquette move adds B around faces.
//  per face  TURN  B: the lines this face takes around itself next beat, same units and window.
//            REST  R in -H .. H: the remainder of the one division, carried to the next beat.
//
// THE FACES. Every husk triangle: for each dock y and each diagonal d = u + v (u, v signed axis steps), the two
// triangles y -> y + u -> y + d and y -> y + v -> y + d, closed back along the diagonal. 12 a dock. Each square face of
// the cube carries both diagonals, so its 4 triangles overlap: the face set is overcomplete, which changes the waves'
// speeds and nothing else (the static field below depends only on which loops close, not on how many).
//
// THE BEAT. With kappa = a / q and M = 2 / g (1 on an axis, 2 on a diagonal):
//   E(t+1) = E(t) + drag(t) + C^T B(t)                      [each face adds its B once around its boundary]
//   B(t+1) = B(t) - kappa C M E(t+1)                        [C: the circulation of M E around a face]
// In integers: X = a (C M E); w = floor((X + R + H) / q); R <- X + R - q w; B <- B - w; exactly step-depth's carry, so
// the remainder is never dropped. This is E-GRV-0090's leapfrog on the OTHER half of the field: step-depth adds a
// gradient (g times a difference of dock rates), which changes the divergence and never the curl; this adds a boundary
// (a face's loop), which changes the curl and never the divergence. Together they would be one vector wave; here the
// divergence half is the drag, fixed by Gauss at every beat, and only the curl half moves.
//
// WHY GAUSS IS EXACT. div C^T = 0 on integers: a face's boundary enters and leaves each of its corners once. So div E(t)
// = div of the dragged lines alone, on every dock and beat, whatever B holds. No tolerance.
//
// THE STATIC FIELD. A fixed point needs C M E = 0 on every face (B stops) and C^T B = 0 (E stops). The triangles
// generate every contractible loop of the husk, so C M E = 0 means M E = 2 grad x + h: E = g grad x (+ g h / 2), the
// same F = g grad x that E-GRV-0090's rule settles to, with div E = the content, plus h, a harmonic part (constant along
// each torus cycle). The harmonic part is the one piece a face cannot change: every face's boundary is contractible, so
// the net lines around each of the torus's three cycles (the winding) is kept by the move and changed only by the drag.
// So the static depth found by summing E / g is 1/r plus a linear tilt set by the winding, which shell means about the
// source cancel on every shell that does not reach the torus's seam.
//
// REVERSIBLE: plaquetteBeatBack is the inverse bit for bit. BOUNDED: every register is in its window; a wrap is counted
// (a slip, as step-depth's). DETERMINISM: nothing is drawn. NOTHING MOVES: each register takes its new value by the
// rule; the drag is the rule's own, read off the values the stream took.

import { radionWeight, type RadionMesh } from '@/code/rule/trit-radion'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type HuskFaces = {
  readonly count: number
  // per face, its 3 boundary links and the sense each is taken in (+1 along the out-link)
  readonly link: Int32Array
  readonly sign: Int8Array
  // the face's first corner
  readonly dock: Int32Array
}

// the signed axis steps of each diagonal (h = 3 .. 8): [axis, sense] of u and of v, d = u + v
const DIAGONAL_PARTS: readonly (readonly [number, number, number, number])[] = [
  [0, 1, 1, 1],
  [0, 1, 1, -1],
  [0, 1, 2, 1],
  [0, 1, 2, -1],
  [1, 1, 2, 1],
  [1, 1, 2, -1],
]

export function huskFaces(mesh: RadionMesh): HuskFaces {
  const [sx, sy, sz] = mesh.sides
  const at = (y: number, axis: number, sense: number): number => {
    const p = [y % sx, Math.floor(y / sx) % sy, Math.floor(y / (sx * sy))]

    p[axis] = mod(p[axis]! + sense, mesh.sides[axis]!)

    return p[0]! + sx * (p[1]! + sy * p[2]!)
  }
  // the link from y one axis step along (axis, sense), with the sense it is taken in
  const step = (y: number, axis: number, sense: number): [number, number] => (sense > 0 ? [y * 9 + axis, 1] : [at(y, axis, -1) * 9 + axis, -1])
  const count = mesh.docks * 12
  const link = new Int32Array(count * 3)
  const sign = new Int8Array(count * 3)
  const dock = new Int32Array(count)
  let f = 0

  if (sz === undefined) throw new Error('huskFaces: three sides')

  for (let y = 0; y < mesh.docks; y++) {
    for (let d = 0; d < 6; d++) {
      const [ua, us, va, vs] = DIAGONAL_PARTS[d]!
      const h = 3 + d

      for (const [a1, s1, a2, s2] of [
        [ua, us, va, vs],
        [va, vs, ua, us],
      ] as const) {
        const first = step(y, a1, s1)
        const second = step(at(y, a1, s1), a2, s2)

        link[f * 3] = first[0]
        sign[f * 3] = first[1]
        link[f * 3 + 1] = second[0]
        sign[f * 3 + 1] = second[1]
        link[f * 3 + 2] = y * 9 + h
        sign[f * 3 + 2] = -1
        dock[f] = y
        f++
      }
    }
  }

  return { count, link, sign, dock }
}

// M = 2 / g: 1 on an axis, 2 on a diagonal
export const lineMetric = (h: number): number => 2 / radionWeight(h)

// out = C M E, the circulation of M E around every face
export function faceCurl(faces: HuskFaces, line: ArrayLike<number>, out: Float64Array): void {
  for (let f = 0; f < faces.count; f++) {
    let c = 0

    for (let j = 0; j < 3; j++) {
      const l = faces.link[f * 3 + j]!

      c += faces.sign[f * 3 + j]! * lineMetric(l % 9) * line[l]!
    }

    out[f] = c
  }
}

// out += sense C^T B: each face takes its value once around its boundary
export function addBoundary(faces: HuskFaces, face: ArrayLike<number>, out: Float64Array, sense: 1 | -1): void {
  for (let f = 0; f < faces.count; f++) {
    const b = face[f]!

    if (b === 0) continue
    for (let j = 0; j < 3; j++) out[faces.link[f * 3 + j]!]! += sense * faces.sign[f * 3 + j]! * b
  }
}

export type PlaquetteRule = { readonly a: number; readonly q: number; readonly h: number; readonly unit: number; readonly whole: number; readonly span: number; readonly top: number }

// kappa = a / q (q odd), one whole line = q^levels register units, windows of `whole` whole lines (odd)
export function plaquetteRule(a: number, q: number, levels: number, whole: number): PlaquetteRule {
  if (q % 2 === 0 || whole % 2 === 0) throw new Error('plaquetteRule: q and whole are odd')

  const unit = q ** levels
  const span = whole * unit

  return { a, q, h: (q - 1) / 2, unit, whole, span, top: (span - 1) / 2 }
}

export type PlaquetteState = { readonly line: Float64Array; readonly face: Float64Array; readonly rest: Float64Array }

export const emptyPlaquette = (mesh: RadionMesh, faces: HuskFaces): PlaquetteState => ({ line: new Float64Array(mesh.docks * 9), face: new Float64Array(faces.count), rest: new Float64Array(faces.count) })

export const duplicatePlaquette = (s: PlaquetteState): PlaquetteState => ({ line: Float64Array.from(s.line), face: Float64Array.from(s.face), rest: Float64Array.from(s.rest) })

export const samePlaquette = (a: PlaquetteState, b: PlaquetteState): boolean => a.line.every((v, i) => v === b.line[i]) && a.face.every((v, i) => v === b.face[i]) && a.rest.every((v, i) => v === b.rest[i])

const wrapInto = (rule: PlaquetteRule, v: number): number => mod(v + rule.top, rule.span) - rule.top

export type PlaquetteTally = { lineWraps: number; faceWraps: number }

export type PlaquetteScratch = { sum: Float64Array; curl: Float64Array }

export const plaquetteScratch = (mesh: RadionMesh, faces: HuskFaces): PlaquetteScratch => ({ sum: new Float64Array(mesh.docks * 9), curl: new Float64Array(faces.count) })

// one beat in place: the drag (whole-number register units per link) and the move, then the turns. `moving` false is
// the control: the drag alone, no face ever turns
export function plaquetteBeat(faces: HuskFaces, rule: PlaquetteRule, s: PlaquetteState, drag: ArrayLike<number>, scratch: PlaquetteScratch, tally: PlaquetteTally, moving = true): void {
  const { sum, curl } = scratch

  sum.fill(0)
  if (moving) addBoundary(faces, s.face, sum, 1)

  for (let l = 0; l < s.line.length; l++) {
    const raw = s.line[l]! + drag[l]! + sum[l]!

    s.line[l] = wrapInto(rule, raw)
    if (s.line[l] !== raw) tally.lineWraps++
  }

  if (!moving) return
  faceCurl(faces, s.line, curl)

  for (let f = 0; f < faces.count; f++) {
    const x = rule.a * curl[f]!
    const w = floorDiv(x + s.rest[f]! + rule.h, rule.q)
    const raw = s.face[f]! - w

    s.rest[f] = x + s.rest[f]! - rule.q * w
    s.face[f] = wrapInto(rule, raw)
    if (s.face[f] !== raw) tally.faceWraps++
  }
}

// the inverse of plaquetteBeat with the same drag
export function plaquetteBeatBack(faces: HuskFaces, rule: PlaquetteRule, s: PlaquetteState, drag: ArrayLike<number>, scratch: PlaquetteScratch, moving = true): void {
  const { sum, curl } = scratch

  if (moving) {
    faceCurl(faces, s.line, curl)

    for (let f = 0; f < faces.count; f++) {
      const x = rule.a * curl[f]!
      const w = floorDiv(x - s.rest[f]! + rule.h, rule.q)

      s.rest[f] = s.rest[f]! - x + rule.q * w
      s.face[f] = wrapInto(rule, s.face[f]! + w)
    }
  }

  sum.fill(0)
  if (moving) addBoundary(faces, s.face, sum, 1)
  for (let l = 0; l < s.line.length; l++) s.line[l] = wrapInto(rule, s.line[l]! - drag[l]! - sum[l]!)
}
