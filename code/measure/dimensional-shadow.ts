import { rootsD4, vectorKey } from '@/code/algebra/group/root-system'

// How a three-dimensional observer sees the four-dimensional substrate. The base carries 24
// directions, the D4 root system (the 24-cell). A 3D observer is one who has singled out a
// preferred fourth axis (the substrate arrow, the same direction that selects the three fermion
// families) and reads only the three transverse coordinates as spatial. Projecting the 24
// directions onto the transverse 3-space (dropping the fourth coordinate) sorts them cleanly: the
// directions with no fourth component land on the twelve D3 roots (the cuboctahedron, the
// face-centred-cubic kissing shell, ordinary 3D space), and the directions with a fourth component
// collapse in pairs onto the six coordinate axes, each axis carrying a two-valued internal label
// (the sign of the hidden fourth coordinate). So 24 = 12 spatial + 6 axes x 2 internal: the fourth
// dimension survives to the 3D observer not as a spatial direction but as an internal two-state
// degree of freedom sitting on the octahedral axes.

// The transverse shadow of a 4-vector: its first three coordinates.
export function transverseShadow(vector: readonly number[]): number[] {
  return [vector[0]!, vector[1]!, vector[2]!]
}

// Group the 24 D4 directions by their transverse (3D) shadow, returning for each distinct shadow
// the multiset of fourth-coordinate values that project onto it.
export function shadowClasses(): Map<string, number[]> {
  const classes = new Map<string, number[]>()

  for (const root of rootsD4()) {
    const key = vectorKey(transverseShadow(root))
    const existing = classes.get(key) ?? []
    existing.push(root[3]!)
    classes.set(key, existing)
  }

  return classes
}

// The census of the shadow: how many distinct shadows are pure spatial D3 roots (fourth coordinate
// zero, appearing once), how many are octahedral axes carrying a hidden two-valued fourth label,
// and how many are anything else.
export function shadowCensus(): {
  spatialD3: number
  internalDoubledAxes: number
  other: number
} {
  let spatialD3 = 0
  let internalDoubledAxes = 0
  let other = 0

  for (const [key, fourthValues] of shadowClasses()) {
    const shadow = key.split(',').map(Number)
    const normSquared =
      shadow[0]! * shadow[0]! +
      shadow[1]! * shadow[1]! +
      shadow[2]! * shadow[2]!

    const isPureSpatial =
      normSquared === 2 &&
      fourthValues.length === 1 &&
      fourthValues[0] === 0

    const isDoubledAxis =
      normSquared === 1 &&
      fourthValues.length === 2 &&
      fourthValues.includes(1) &&
      fourthValues.includes(-1)

    if (isPureSpatial) {
      spatialD3++
    } else if (isDoubledAxis) {
      internalDoubledAxes++
    } else {
      other++
    }
  }

  return { spatialD3, internalDoubledAxes, other }
}

// The control: project along a generic (non-lattice) direction. With no alignment to the lattice
// the 24 roots produce 24 distinct shadows and no degeneracy, so the clean 12 + 6x2 split is a
// property of the preferred axis, not of projecting in general. Returns the number of distinct
// shadows under the orthogonal projection off a generic unit direction.
export function genericProjectionShadowCount(
  direction: readonly number[],
): number {
  const magnitude = Math.sqrt(
    direction.reduce(
      (sum, component) => sum + component * component,
      0,
    ),
  )

  const unit = direction.map(component => component / magnitude)

  const shadows = new Set<string>()

  for (const root of rootsD4()) {
    const dot = root.reduce(
      (sum, component, i) => sum + component * unit[i]!,
      0,
    )

    const projected = root.map(
      (component, i) => component - dot * unit[i]!,
    )

    shadows.add(
      projected.map(component => component.toFixed(6)).join(','),
    )
  }

  return shadows.size
}
