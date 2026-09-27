// Stand-in atoms on the husk: one fixed stand-in nucleus of charge Z at the center dock of a periodic husk
// box, Z stand-in electrons in their own Fermi-Amaldi mean field (code/measure/standin-chemistry), a chosen
// number of stand-ins per orbital. Used by E-MTR-0010 (shells), E-MTR-0011 (screening) and E-MTR-0012 (the
// role as the label). Everything here is a STAND-IN: the electrons are charged fear-walk tokens and the
// nucleus a fixed husk charge.
//
// An orbital is labeled by its character about the nucleus: odd under inversion is p, even with most of its
// norm in the spherical average is s, even without is d (no f is reached below Z = 30 at these capacities).
// Its n counts the orbitals of that l below it: n = l + 1 + floor(count / (2 l + 1)). The cubic husk splits
// a d level into e_g (2) and t_2g (3); both count toward the same 3d. Ionization energies are Koopmans':
// minus the highest occupied level, in stand-in Rydbergs.

import { makeGrid, makePoisson, orbitalCharacter, selfConsistent, standinUnits, type MeanField, type Point, type Scf } from '@/code/measure/standin-chemistry'

const S_SHARE = 0.5
const LABELS = ['s', 'p', 'd'] as const

export type AtomBox = { readonly side: number; readonly a0: number }

export const ATOM_BOX: AtomBox = { side: 32, a0: 3 }

export const centerOf = (box: AtomBox): Point => [box.side / 2, box.side / 2, box.side / 2]

export type Shell = { readonly name: string; readonly l: number; readonly n: number }

// the (n, l) label of each orbital of an atom, in energy order
export function labelOrbitals(box: AtomBox, orbitals: readonly Float64Array[]): Shell[] {
  const seen = [0, 0, 0]

  return orbitals.map(v => {
    const c = orbitalCharacter(box.side, centerOf(box), v)
    const l = c.parity < 0 ? 1 : c.sFraction > S_SHARE ? 0 : 2
    const n = l + 1 + Math.floor((seen[l] ?? 0) / (2 * l + 1))

    seen[l] = (seen[l] ?? 0) + 1

    return { name: `${n}${LABELS[l]}`, l, n }
  })
}

export type Atom = {
  readonly z: number
  readonly electrons: number
  readonly scf: Scf
  readonly shells: Shell[]
  // the shells holding stand-ins, in energy order
  readonly occupied: string[]
  // the highest occupied orbital, its level over Ry and its shell
  readonly top: number
  readonly ionization: number
  readonly outer: Shell
}

export function atom(input: { box: AtomBox; z: number; electrons?: number; capacity: number; field?: MeanField; start?: readonly Float64Array[] }): Atom {
  const { box, z, capacity } = input
  const electrons = input.electrons ?? z
  const grid = makeGrid(box.side)
  const poisson = makePoisson(box.side)
  const units = standinUnits(box.a0)
  const scf = selfConsistent({
    grid,
    poisson,
    units,
    nuclei: [{ at: centerOf(box), charge: z }],
    electrons,
    capacity,
    field: input.field ?? 'fermi-amaldi',
    spare: 3,
    buffer: 4,
    start: input.start,
    degenerate: 1e-6,
  })
  const shells = labelOrbitals(box, scf.orbitals)
  const occupiedIndex = scf.occupations.map((f, j) => (f > 1e-9 ? j : -1)).filter(j => j >= 0)
  const top = Math.max(...occupiedIndex)

  return {
    z,
    electrons,
    scf,
    shells,
    occupied: [...new Set(occupiedIndex.map(j => shells[j]?.name ?? '?'))],
    top,
    ionization: -(scf.values[top] ?? 0) / units.rydberg,
    outer: shells[top] ?? { name: '?', l: -1, n: 0 },
  }
}

// the neutral atoms of the listed Z with `capacity` stand-ins per orbital, each started from the one before
export function atomSeries(input: { box: AtomBox; charges: readonly number[]; capacity: number }): Atom[] {
  const rows: Atom[] = []

  let start: Float64Array[] | undefined

  for (const z of input.charges) {
    const row = atom({ box: input.box, z, capacity: input.capacity, start })

    start = row.scf.block
    rows.push(row)
  }

  return rows
}

// the order in which shells first hold a stand-in as Z grows
export function fillingOrder(rows: readonly Atom[]): string[] {
  const order: string[] = []

  for (const row of rows) {
    for (const shell of row.occupied) {
      if (!order.includes(shell)) {
        order.push(shell)
      }
    }
  }

  return order
}

// is the ionization energy at Z above both neighbors (only the next one at Z = 1)? Both must be computed
export function isLocalMaximum(rows: readonly Atom[], z: number): boolean {
  const at = (x: number): number | undefined => rows.find(r => r.z === x)?.ionization
  const here = at(z)
  const next = at(z + 1)
  const previous = z === 1 ? Number.NEGATIVE_INFINITY : at(z - 1)

  return here !== undefined && next !== undefined && previous !== undefined && here > next && here > previous
}

// the Z of the local maxima of the ionization energy over [from, to], largest first, on a contiguous series.
// The first atom of the series counts as a maximum when it beats the next one
export function closures(rows: readonly Atom[], from: number, to: number): number[] {
  const at = (z: number): number => rows.find(r => r.z === z)?.ionization ?? Number.NaN
  const first = rows[0]?.z ?? 1
  const maxima: { z: number; value: number }[] = []

  for (let z = from; z <= to; z++) {
    const left = z > first ? at(z - 1) : Number.NEGATIVE_INFINITY

    if (at(z) > left && at(z) > at(z + 1)) {
      maxima.push({ z, value: at(z) })
    }
  }

  return maxima.sort((a, b) => b.value - a.value).map(m => m.z)
}
