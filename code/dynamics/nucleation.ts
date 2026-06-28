// Deterministic nucleation: the critical-nucleus threshold behind abiogenesis. A self-reinforcing region (a
// droplet of the +1 phase in a -1 background) on a 2D grid, evolving by a deterministic majority rule with a
// small bias toward the self phase. Surface tension shrinks small droplets (high curvature, the edge cells lack
// enough same-phase neighbors) while large droplets grow. So there is a critical seed size: below it the pattern
// dies, above it a self-maintaining region nucleates and fills. That threshold is the abiogenesis transition,
// the first self-maintaining pattern crossing the repair-beats-decay line. Reused by the experiment, kept thin.

// a square grid with a -1 background, +1 inside a centered disk of the given radius
function seedDroplet(side: number, radius: number): Int8Array {
  const grid = new Int8Array(side * side).fill(-1)
  const c = (side - 1) / 2

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      if ((x - c) ** 2 + (y - c) ** 2 <= radius * radius) {
        grid[y * side + x] = 1
      }
    }
  }

  return grid
}

// the +1 fraction of the radius-R neighbourhood (excluding self), with a -1 background outside the grid
function plusFraction(
  grid: Int8Array,
  side: number,
  x: number,
  y: number,
  radius: number,
): number {
  let count = 0
  let total = 0

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) {
        continue
      }

      total++

      const nx = x + dx
      const ny = y + dy

      if (
        nx >= 0 &&
        nx < side &&
        ny >= 0 &&
        ny < side &&
        grid[ny * side + nx] === 1
      ) {
        count++
      }
    }
  }

  return total > 0 ? count / total : 0
}

// one synchronous beat with HYSTERESIS (surface tension): a +1 cell stays +1 only while its neighbourhood is at
// least `stay` plus, a -1 cell turns +1 only when its neighbourhood reaches `grow` plus, with stay < grow. A
// droplet's boundary has a curvature deficit of order 1/radius, so small droplets fall below `stay` and shrink
// while large ones hold and spread, giving a critical nucleus.
function step(
  grid: Int8Array,
  side: number,
  radius: number,
  stay: number,
  grow: number,
): Int8Array {
  const next = new Int8Array(side * side)

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const f = plusFraction(grid, side, x, y, radius)
      const isPlus = grid[y * side + x] === 1
      const becomes = isPlus ? f >= stay : f >= grow
      next[y * side + x] = (becomes ? 1 : -1)
    }
  }

  return next
}

function plusCount(grid: Int8Array): number {
  let count = 0

  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 1) {
      count++
    }
  }

  return count
}

// run the droplet from a seed radius and return the final +1 fraction (1 means the self phase took over, 0 means
// it died out)
export function nucleate(input: {
  side: number
  seedRadius: number
  neighborRadius: number
  stay: number
  grow: number
  beats: number
}): {
  initialFraction: number
  finalFraction: number
  survived: boolean
} {
  let grid = seedDroplet(input.side, input.seedRadius)

  const initialFraction = plusCount(grid) / grid.length

  for (let b = 0; b < input.beats; b++) {
    grid = step(
      grid,
      input.side,
      input.neighborRadius,
      input.stay,
      input.grow,
    )
  }

  const finalFraction = plusCount(grid) / grid.length

  return {
    initialFraction,
    finalFraction,
    // survived: the self-maintaining region held at least most of its seed mass rather than dying out
    survived:
      finalFraction > 0.5 * initialFraction && finalFraction > 0.005,
  }
}
