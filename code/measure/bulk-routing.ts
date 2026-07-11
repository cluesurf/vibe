// Routing through the bulk as movement through renormalization scale. The substrate's hyperbolic
// bulk grows exponentially outward: the number of cells at radius r rises like b to the r for a
// branching b (the {3,4,3,4} warp factor is exactly this exponential growth). Coarsely the bulk is
// a balanced b-ary tree, the root the deepest coarse-grained cell and the leaves the boundary
// (the finest, physical layer). Two boundary cells route to each other by going up to their common
// ancestor and back down, and the depth of that common ancestor is the coarse-graining level at
// which the two cells first become indistinguishable: the renormalization scale where they merge.
// Because the tree is exponential, two leaves at boundary separation s merge at bulk penetration
// log_b(s) below the boundary, so the bulk depth a route reaches is the logarithm of the boundary
// separation, the holographic statement that bulk depth is renormalization scale, made an exact
// routing law. The flat control (a chain, no bulk) routes in linear separation, no logarithmic
// compression.

// A leaf's base-b address: `depth` digits, the path of child-ordinals from the root. Leaf index
// runs 0 .. b^depth - 1.
function leafAddress(input: {
  leaf: number
  branching: number
  depth: number
}): number[] {
  const { leaf, branching, depth } = input
  const address: number[] = []

  let remaining = leaf

  for (let level = 0; level < depth; level++) {
    address.unshift(remaining % branching)
    remaining = Math.floor(remaining / branching)
  }

  return address
}

// The depth (from the root) of the common ancestor of two leaves: the length of the common prefix
// of their addresses.
export function commonAncestorDepth(input: {
  leafA: number
  leafB: number
  branching: number
  depth: number
}): number {
  const { leafA, leafB, branching, depth } = input
  const addressA = leafAddress({ leaf: leafA, branching, depth })
  const addressB = leafAddress({ leaf: leafB, branching, depth })

  let common = 0

  while (common < depth && addressA[common] === addressB[common]) {
    common++
  }

  return common
}

// The bulk penetration of the route between two leaves: how far below the boundary (toward the
// root) the route dives, which is the renormalization scale at which the two merge. Equals
// depth - commonAncestorDepth.
export function bulkPenetration(input: {
  leafA: number
  leafB: number
  branching: number
  depth: number
}): number {
  return input.depth - commonAncestorDepth(input)
}

// The address-route length between two leaves on the tree: up to the common ancestor then down,
// twice the bulk penetration.
export function treeRouteLength(input: {
  leafA: number
  leafB: number
  branching: number
  depth: number
}): number {
  return 2 * bulkPenetration(input)
}

// The flat control: a one-dimensional chain of the same boundary cells has no bulk, so the route
// between two cells at index separation s is just s hops, linear, with no logarithmic shortcut.
export function chainRouteLength(separation: number): number {
  return separation
}

// The physical accessibility of the bulk shortcut. A signal between two cusp cells at cusp
// separation s can travel two ways, both at one hop per beat. Along the cusp it takes s beats
// (the flat physical distance). Through the bulk it dives to the merge depth log_b(s), crosses a
// short chord where the two branches have converged, and climbs back: about 2 log_b(s) + 1 beats.
// Because the tree is exponential the bulk route is logarithmic, so beyond a break-even separation
// it wins by an unbounded margin. The bulk route is itself the graph geodesic (its beat count is
// the true shortest-path length), so it never violates any light cone: what looks like
// nonlocality on the cusp is only that the cusp distance is not the geodesic distance.

// The beats a signal takes along the flat cusp: the cusp separation itself.
export function cuspTravelBeats(separation: number): number {
  return separation
}

// The beats a signal takes through the bulk: twice the merge depth plus the short chord at the
// merge level.
export function bulkTravelBeats(input: {
  separation: number
  branching: number
}): number {
  const { separation, branching } = input
  const depth = Math.ceil(Math.log(separation) / Math.log(branching))

  return 2 * depth + 1
}

// The break-even cusp separation: the smallest separation at which the bulk route beats the cusp
// route.
export function breakEvenSeparation(input: {
  branching: number
  maximum: number
}): number {
  const { branching, maximum } = input

  for (let s = 2; s <= maximum; s++) {
    if (
      bulkTravelBeats({ separation: s, branching }) < cuspTravelBeats(s)
    )
      return s
  }

  return -1
}

// A boundary loop as an anchor for a bulk region. A closed walk between two boundary leaves and back
// encloses a definite bulk region: the subtree under their common ancestor, which is the contiguous
// block of leaves sharing that ancestor's address prefix. So a loop pins down an object (a region of
// the boundary and its bulk interior), and two loops around disjoint boundary arcs enclose disjoint
// subtrees. The enclosed block for the loop between leaves a and b, on a tree of the given branching
// and depth.
export function enclosedRegion(input: {
  leafA: number
  leafB: number
  branching: number
  depth: number
}): { start: number; size: number } {
  const { leafA, branching, depth } = input
  const ancestor = commonAncestorDepth(input)

  // the shared prefix fixes the top `ancestor` address digits; the enclosed block is every leaf with
  // that prefix, a contiguous run of branching^(depth - ancestor) leaves
  const digits: number[] = []

  let remaining = leafA

  for (let level = depth - 1; level >= 0; level--) {
    digits[level] = remaining % branching
    remaining = Math.floor(remaining / branching)
  }

  let start = 0

  for (let level = 0; level < ancestor; level++)
    start = start * branching + digits[level]!

  const size = branching ** (depth - ancestor)

  return { start: start * size, size }
}

// The bulk cone of a three-dimensional object. An object is a contiguous block of `objectSize`
// boundary cells; the bulk cells it subtends are the ancestors of its leaves, and the shallowest
// node whose whole subtree lies inside the object (the cone apex) sits at depth
// depth - log_branching(objectSize). So a bigger object has a shallower (deeper into the bulk) apex,
// and nested objects give nested cones. Returns the apex depth.
export function coneApexDepth(input: {
  objectStart: number
  objectSize: number
  branching: number
  depth: number
}): number {
  const { objectStart, objectSize, branching, depth } = input

  return commonAncestorDepth({
    leafA: objectStart,
    leafB: objectStart + objectSize - 1,
    branching,
    depth,
  })
}
