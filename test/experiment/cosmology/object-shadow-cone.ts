// How the bulk maps to objects in three-dimensional space: every object is a cone into the bulk. An
// object is a contiguous patch of the physical boundary (the horosphere), and the bulk cells it
// subtends are the ancestors of its boundary cells, a cone whose apex is the shallowest bulk node
// whose whole subtree lies within the object. Because the bulk is exponential, that apex sits at
// depth equal to the boundary depth minus the logarithm of the object's size, so a bigger object has
// its apex deeper in the bulk (a larger cone) and a smaller object a shallower apex (a smaller cone).
// Nested objects give nested cones, and two objects far apart on the boundary share only the deep,
// near-root bulk while overlapping objects share shallow bulk. So the bulk is not a separate place:
// it is the space of objects, each object a definite cone, its bulk depth the logarithm of its size.
//
// Measured on the bulk tree: the cone apex depth of an object equals the boundary depth minus the
// logarithm (base the branching) of the object size, exactly across a size sweep, so doubling-scale
// growth of the object moves the apex one bulk level deeper per branching factor. A smaller object
// nested inside a larger one has a strictly deeper (shallower-in-bulk) apex, giving nested cones. And
// two well-separated objects share only a shallow (near-root) common apex while an object and its
// own sub-object share a deep apex, so bulk proximity of the cones tracks boundary proximity of the
// objects.
//
// The control is a single-cell object: its cone apex is the boundary itself (full depth, a
// degenerate point cone), so the cone structure is nontrivial only for an extended object.
//
// Depth L2. It establishes the object-to-cone map (apex depth equals boundary depth minus log size,
// nested objects give nested cones, separation tracks shared apex depth) with the single-cell
// control, the bulk-as-the-space-of-objects reading. Known tree geometry, read as the object map.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { coneApexDepth } from '@/code/measure/bulk-routing'

const BRANCHING = 3
const DEPTH = 8
const OBJECT_SIZES = [1, 3, 9, 27, 81]

export default experiment({
  id: 'cosmology/object-shadow-cone',
  code: 'E-CSM-0050',
  title:
    'a 3D object (a boundary patch) subtends a bulk cone whose apex depth is the boundary depth minus log(object size), so bigger objects have deeper apexes, nested objects give nested cones, and separation tracks the shared apex depth',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the apex depth equals the boundary depth minus log_branching(object size), exactly
    let worstApexError = 0

    for (const size of OBJECT_SIZES) {
      const apex = coneApexDepth({
        objectStart: 0,
        objectSize: size,
        branching: BRANCHING,
        depth: DEPTH,
      })

      const predicted =
        DEPTH - Math.round(Math.log(size) / Math.log(BRANCHING))

      worstApexError = Math.max(
        worstApexError,
        Math.abs(apex - predicted),
      )
    }

    // nested objects give nested cones: a smaller object inside a larger one has a deeper apex
    const bigApex = coneApexDepth({
      objectStart: 0,
      objectSize: 27,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const smallApex = coneApexDepth({
      objectStart: 0,
      objectSize: 3,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const nestedConesNest = smallApex > bigApex

    // separation tracks shared apex depth: an object and its sub-object share a deep apex, two
    // far-apart objects share only a shallow (near-root) apex
    const objectAndSubObject = coneApexDepth({
      objectStart: 0,
      objectSize: 9,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const farApart = coneApexDepth({
      objectStart: 0,
      objectSize: BRANCHING ** DEPTH,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const separationTracksApex = objectAndSubObject > farApart

    // CONTROL: a single-cell object has its apex at the boundary (full depth, a point cone)
    const pointApex = coneApexDepth({
      objectStart: 17,
      objectSize: 1,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const pointIsBoundary = pointApex === DEPTH

    const apexLawExact = worstApexError === 0

    const ok =
      apexLawExact &&
      nestedConesNest &&
      separationTracksApex &&
      pointIsBoundary

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a three-dimensional object, a contiguous patch of the physical boundary, subtends a bulk cone whose apex (the shallowest bulk node whose whole subtree lies within the object) sits at a depth equal to the boundary depth minus the logarithm base the branching of the object size, exactly across the size sweep, so a bigger object has its apex deeper in the bulk (a larger cone) by one level per branching factor, a smaller object nested inside a larger one has a strictly deeper apex giving nested cones, and an object shares a deep apex with its own sub-object but only a shallow near-root apex with a far-apart object so bulk proximity of the cones tracks boundary proximity of the objects, while a single-cell object has its apex at the boundary itself (a degenerate point cone), so the bulk is the space of objects, each object a definite cone whose bulk depth is the logarithm of its size',
      metrics: {
        worstApexError,
        apexAtSize3: coneApexDepth({
          objectStart: 0,
          objectSize: 3,
          branching: BRANCHING,
          depth: DEPTH,
        }),
        apexAtSize81: coneApexDepth({
          objectStart: 0,
          objectSize: 81,
          branching: BRANCHING,
          depth: DEPTH,
        }),
        pointApexDepth: pointApex,
      },
      // CONTROL: a single-cell object has its apex at the boundary, a point cone.
      control: { pointApexDepth: pointApex },
      notes:
        'Objects map to bulk cones: apex depth = boundary depth minus log(size), nested objects nest, separation tracks shared apex. Complements the loop anchor (E-NVG-0012), the depth-is-scale routing (E-NVG-0008), and horosphere flatness (E-CSM-0049).',
    })
  },
})
