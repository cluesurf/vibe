// Sarkar embedding of a tree into the Poincare disk, and the same recursive placement in the Euclidean plane,
// for the tree-embedding-distortion data-structure experiment. Hyperbolic space embeds trees with distortion
// approaching 1, the Euclidean plane cannot, because hyperbolic circles have exponential circumference and so
// fit a node's children at large angular separation, where Euclidean circles crowd them. Reference, Sarkar
// 2011, "Low Distortion Delaunay Embedding of Trees in Hyperbolic Plane".

type Complex = [number, number]

const cAdd = (a: Complex, b: Complex): Complex => [
  a[0] + b[0],
  a[1] + b[1],
]

const cSub = (a: Complex, b: Complex): Complex => [
  a[0] - b[0],
  a[1] - b[1],
]

const cMul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const cConj = (a: Complex): Complex => [a[0], -a[1]]
const cAbs = (a: Complex): number => Math.hypot(a[0], a[1])

const cDiv = (a: Complex, b: Complex): Complex => {
  const d = b[0] * b[0] + b[1] * b[1]
  const n = cMul(a, cConj(b))

  return [n[0] / d, n[1] / d]
}

const cFromPolar = (radius: number, angle: number): Complex => [
  radius * Math.cos(angle),
  radius * Math.sin(angle),
]

// the Mobius map sending the point a to the origin (an isometry of the disk)
const mobiusToOrigin = (a: Complex, z: Complex): Complex =>
  cDiv(cSub(z, a), cSub([1, 0], cMul(cConj(a), z)))

// the inverse, sending the origin to a
const mobiusFromOrigin = (a: Complex, z: Complex): Complex =>
  cDiv(cAdd(z, a), cAdd([1, 0], cMul(cConj(a), z)))

// the hyperbolic distance between two disk points
export function hyperbolicDistance(z: Complex, w: Complex): number {
  return (
    2 * Math.atanh(Math.min(0.999999999, cAbs(mobiusToOrigin(z, w))))
  )
}

// A complete b-ary tree of the given depth: parents, children, and the tree (hop) distance between all pairs.
export function completeTree(input: {
  branching: number
  depth: number
}): {
  size: number
  parent: number[]
  children: number[][]
} {
  const parent: number[] = [-1]
  const children: number[][] = [[]]

  let frontier = [0]

  for (let level = 0; level < input.depth; level++) {
    const next: number[] = []

    for (const node of frontier) {
      for (let c = 0; c < input.branching; c++) {
        const id = parent.length

        parent.push(node)
        children.push([])
        children[node]!.push(id)
        next.push(id)
      }
    }

    frontier = next
  }

  return { size: parent.length, parent, children }
}

// the tree (hop) distance between two nodes, via their lowest common ancestor
export function treeDistance(
  parent: number[],
  depth: number[],
  u: number,
  v: number,
): number {
  let a = u
  let b = v
  let steps = 0

  while (depth[a]! > depth[b]!) {
    a = parent[a]!
    steps += 1
  }

  while (depth[b]! > depth[a]!) {
    b = parent[b]!
    steps += 1
  }

  while (a !== b) {
    a = parent[a]!
    b = parent[b]!
    steps += 2
  }

  return steps
}

// Embed the tree's nodes either in the Poincare disk (hyperbolic isometries) or in the Euclidean plane (the
// same recursive fan-out, but Euclidean translation), with a fixed edge length. Returns the node coordinates.
export function embedTree(input: {
  parent: number[]
  children: number[][]
  edge: number // hyperbolic edge length
  hyperbolic: boolean
}): { coords: Complex[]; depth: number[] } {
  const size = input.parent.length
  const coords: Complex[] = new Array(size).fill([0, 0])
  const depth: number[] = new Array(size).fill(0)
  const radius = Math.tanh(input.edge / 2) // Poincare radius of a point at hyperbolic distance `edge` from 0

  coords[0] = [0, 0]

  // place children of each node, spreading them evenly in the cone facing away from the parent. parentDir is
  // the angle (in this node's local frame) pointing back to the parent, undefined for the root.
  const place = (node: number, parentDir: number | undefined): void => {
    const kids = input.children[node]!

    if (kids.length === 0) return

    const here = coords[node]!
    const n = kids.length
    // the root spreads its children over the full circle, an interior node over the cone away from its parent
    const baseAngle = parentDir === undefined ? 0 : parentDir + Math.PI
    const cone =
      parentDir === undefined
        ? (2 * Math.PI * (n - 1)) / n
        : (2 * Math.PI * n) / (n + 1)

    kids.forEach((kid, index) => {
      const angle =
        n === 1
          ? baseAngle
          : baseAngle +
            (cone * (index - (n - 1) / 2)) /
              Math.max(1, n - (parentDir === undefined ? 0 : 1))

      const local = cFromPolar(radius, angle)

      coords[kid] = input.hyperbolic
        ? mobiusFromOrigin(here, local)
        : cAdd(here, cFromPolar(input.edge, angle))
      depth[kid] = depth[node]! + 1
      place(kid, angle + Math.PI) // the direction back to `here` in the child's frame
    })
  }

  place(0, undefined)

  return { coords, depth }
}

// The worst-case distortion of an embedding versus the tree distances: the maximum over all pairs of the ratio
// of embedded distance to tree distance and its inverse, after the best uniform scale. 1 is perfect.
export function embeddingDistortion(input: {
  coords: Complex[]
  depth: number[]
  parent: number[]
  hyperbolic: boolean
}): number {
  const size = input.coords.length
  const pairs: { embedded: number; tree: number }[] = []

  for (let u = 0; u < size; u++) {
    for (let v = u + 1; v < size; v++) {
      const tree = treeDistance(input.parent, input.depth, u, v)
      const embedded = input.hyperbolic
        ? hyperbolicDistance(input.coords[u]!, input.coords[v]!)
        : cAbs(cSub(input.coords[u]!, input.coords[v]!))

      pairs.push({ embedded, tree })
    }
  }

  // best uniform scale, minimize the worst ratio by matching the median ratio
  const ratios = pairs
    .map(p => p.embedded / p.tree)
    .sort((a, b) => a - b)

  const scale = ratios[Math.floor(ratios.length / 2)]!

  let worst = 1

  for (const p of pairs) {
    const scaled = p.embedded / scale
    const ratio = Math.max(scaled / p.tree, p.tree / scaled)

    if (ratio > worst) worst = ratio
  }

  return worst
}
