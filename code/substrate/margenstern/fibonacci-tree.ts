// The standard Fibonacci tree of the pentagrid/heptagrid, navigated by PURE ADDRESS ARITHMETIC, no geometry.
// This is the heart of Margenstern's result, a tile's father, sons, and depth are computed from its Zeckendorf
// coordinate by short, local string surgery, so a finite machine navigates an infinite, undrawable plane.
//
// The two rules everything rests on (Vol I, Ch 3):
//   - FATHER: write a node's Fibonacci word as z(m) followed by two digits e1 e0. Then father = m + e1. So you
//     strip the last two digits and add back the high one. (The root, node 1, has no father.)
//   - CONTINUATOR (the preferred son): its word is the node's word with "00" appended, so continuator(n) is the
//     integer value of z(n) + "00". Every node has exactly one.
// From these, a node's sons are CONSECUTIVE integers around the continuator (a 3-node has {c-1, c, c+1}, a
// 2-node has {c, c+1}), and the per-level node counts grow 1, 3, 8, 21, 55 (the golden ratio squared). See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md and the splitting-method notes.

import {
  toZeckendorf,
  fromZeckendorf,
} from '@/code/substrate/margenstern/zeckendorf'

// the father of a node, by stripping the last two Fibonacci digits and adding back the high one (root -> 0)
export function father(node: number): number {
  if (node <= 1) {
    return 0
  }
  const z = toZeckendorf(node)
  const stripped = z.length <= 2 ? '' : z.slice(0, -2)
  const m = stripped === '' ? 0 : fromZeckendorf(stripped)
  const high = z[z.length - 2] === '1' ? 1 : 0
  return m + high
}

// the continuator (preferred son), the child whose Fibonacci word is this node's word with "00" appended
export function continuator(node: number): number {
  return fromZeckendorf(toZeckendorf(node) + '00')
}

// a node is a 3-node (white) if it has three sons, else a 2-node (black). A 3-node is exactly one whose
// continuator has a left sibling that is also its child, i.e. father(continuator - 1) is the node itself.
export function nodeType(node: number): 2 | 3 {
  const c = continuator(node)
  return c > 1 && father(c - 1) === node ? 3 : 2
}

// the sons of a node, consecutive integers around the continuator, leftmost first
export function sons(node: number): number[] {
  const c = continuator(node)
  return nodeType(node) === 3 ? [c - 1, c, c + 1] : [c, c + 1]
}

// the depth (distance to the root) of a node, by walking fathers
export function depth(node: number): number {
  let d = 0
  let cur = node
  while (cur > 1) {
    cur = father(cur)
    d++
  }
  return d
}

// the path of node numbers from a node up to the root
export function pathToRoot(node: number): number[] {
  const path: number[] = [node]
  let cur = node
  while (cur > 1) {
    cur = father(cur)
    path.push(cur)
  }
  return path
}

// a quasi-geodesic route between two tiles by pure arithmetic (Vol I, Theorem 4), up from the first to the
// common ancestor, then down to the second. Every step is a father/son tree edge, hence a true tiling edge, so
// this is a valid walk and is near-shortest. No geometry, no stored graph.
export function route(from: number, to: number): number[] {
  const up = pathToRoot(from) // [from, ..., 1]
  const down = pathToRoot(to) // [to, ..., 1]
  const depthOnUp = new Map<number, number>()
  up.forEach((node, index) => depthOnUp.set(node, index))
  // the common ancestor is the first node of `down` that also lies on `up`
  let ancestorIndexInDown = down.length - 1
  for (let i = 0; i < down.length; i++) {
    if (depthOnUp.has(down[i]!)) {
      ancestorIndexInDown = i
      break
    }
  }
  const ancestor = down[ancestorIndexInDown]!
  const upPart = up.slice(0, depthOnUp.get(ancestor)! + 1) // from -> ... -> ancestor
  const downPart = down.slice(0, ancestorIndexInDown).reverse() // ancestor's child -> ... -> to
  return [...upPart, ...downPart]
}
