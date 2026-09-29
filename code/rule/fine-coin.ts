// THE FINE COIN (E-SPN-0107): the coin's phase w taken as its n-th part, carried exactly by a bounded count.
//
// WHY THE COIN IS WHAT IT IS. The coin of code/rule/coined-locked-knit is C = alpha P+ + beta P- on a line's doublet
// (P+- the projectors on e0 +- e1), with alpha = 1 and beta = w. E-SPN-0090 found this family is the one W(F4)'s line
// stabilizer, the comoving frame, C and T allow, for ANY beta; what fixed beta = w was exactness in the rule's ring:
// beta / alpha a unit of Z[w], a sixth root of unity, so the least nonzero angle is pi/3 (beta = -w^2) and the working
// coin's is 2 pi/3 (beta = w). The angle theta = arg beta is the walk's full gap, so a lone love's half-gap (its Dirac
// mass in beats) is theta/2 = pi/3: a third of the lattice scale, where tan m and m differ (E-SPN-0106).
//
// THE FINE COIN. beta = zeta = e^(2 pi i/(3n)), so zeta^n = w and n = 1 is the working coin bit for bit. Its entries:
//   a line holding one OPEN vibe    keep (1 + zeta)/2, cross (1 - zeta)/2 (the vibe copied to the line's other slot)
//   a line holding two open vibes   det C = zeta
//   any other line                  untouched
// A lone love's half-gap is pi/(3n), so its inertia tan(pi/(3n)) comes to its rest energy as n grows.
//
// THE CARRIER, A COUNT WITH A CARRY. zeta is not in Z[w] for n >= 3 (n = 2 gives zeta = 1 + w, a unit, E-SPN-0090's
// theta = pi/3 coin). It is carried as the drift cost carries zeta_14 (code/rule/bound-line-pieces): a count u in
// Z_n held with each amplitude, the amplitude being A zeta^u with A in Z[w][1/2]. Written on the count,
// (1 + zeta)/2 is half at u and half at u + 1, (1 - zeta)/2 half at u and minus half at u + 1, and det C one step of u.
// When u reaches n it wraps to 0 and the amplitude takes w (zeta^n = w): a carry, not a rounding. On the free module of
// counts the coin is P+ (x) 1 + P- (x) T, T the step of u with its carry; T is a permutation times a phase, so the
// coin keeps the module's norm exactly, and its inverse is P+ (x) 1 + P- (x) T^(-1) (the step back, a borrow taking
// w^2). The physical amplitude sum_u A_u zeta^u is read as measurement, and it moves by the fine coin itself.
//
// THE FULL-DOCK CORRECTION (E-SPN-0108, `fullDock`). The fine coin gives a line holding two open vibes det C = zeta,
// where the working coin gives w, and that phase (times the meeting's w) is the contact that held E-SPN-0104's level.
// The correction is the diagonal phase
//     D = (w zeta^(-1))^F = zeta^((n - 1) F),   F the number of lines holding two open vibes,
// applied with the coin, so a full line takes zeta (w zeta^(-1)) = w, the working contact, and a lone vibe keeps the
// fine coin. On the count it is n - 1 further steps of u per full line, which with the coin's own step makes n: one
// whole wrap, the amplitude taking w and the count left where it was. So it is exact (a carry in the same count ring),
// diagonal in the configuration (F is read off the occupation), unitary (a phase), undone by D^(-1) (the adjoint's n
// steps back, one borrow taking w^2), and it is 1 on the vacuum and on a lone vibe (F = 0) and at n = 1 (w zeta^(-1)
// = 1). It commutes with the fine coin (the coin keeps every line's occupation) and moves nothing, so the line law
// and the light cone are the fine coin's.
//
// THE STRING SETS THE COIN (E-SPN-0109, `heavy`). A dock whose lines take the heavy coin w in place of zeta: on the count
// a heavy line steps u by n where a fine one steps it by 1, so its keep is half at u and half at u + n (one wrap: (1 +
// w)/2), its cross (1 - w)/2 and a full heavy line's det C one wrap, w. The coins are one family, C(beta) = P+ + beta P-,
// with C(zeta)^n = C(w), so the heavy coin is the fine coin's n-th power on the same count. Which docks are heavy is read
// by the caller from the string's flux trits (bagHeavy below, code/rule/bound-line-pieces bagPositions), which the coin
// never changes: it keeps every dock's occupation and writes no trit. So on each configuration the coin is a fixed
// product of per-dock unitaries (a controlled unitary, the control diagonal and untouched), and its inverse reads the
// same docks and takes each one's adjoint. At n = 1 heavy and fine are one coin.
//
// NOTHING MOVES: the coin copies a vibe to the other slot of its own line on its own dock; the count is a register the
// coin writes. Exact in Z[w][1/2] per count, no float, no rounding, no random number.

// how a dock's two string links set its coin (E-SPN-0109), each link read as "carries nonzero flux":
//   touch   heavy when either link carries flux (a love's own string touches it)
//   inside  heavy when both links carry flux (the dock strictly inside the string)
//   rim     heavy unless both links carry flux (the mirror: light inside the string, heavy at its ends and beyond)
export type Bag = 'touch' | 'inside' | 'rim'

export function bagHeavy(
  bag: Bag,
  left: boolean,
  right: boolean,
): boolean {
  if (bag === 'touch') {
    return left || right
  }

  if (bag === 'inside') {
    return left && right
  }

  return !(left && right)
}

import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { LINE_SECONDS } from '@/code/rule/coined-locked-knit'
import {
  cloneConfiguration,
  times,
  type Branch,
} from '@/code/rule/doublet-locked-knit'

const copyBranch = (b: Branch): Branch => ({
  ...cloneConfiguration(b),
  a: b.a,
  b: b.b,
  k: b.k,
})

// the count u + step taken into [0, n), the amplitude taking w for every wrap up and w^2 for every wrap down
export function carry(
  b: Branch,
  u: number,
  step: number,
  n: number,
): number {
  let v = u + step

  while (v >= n) {
    v -= n
    times(b, 0n, 1n)
  }

  while (v < 0) {
    v += n
    times(b, -1n, -1n)
  }

  return v
}

// the fine coin (or its adjoint) on one branch at count u: the branches it becomes, each with its count; with
// `fullDock` the full-dock correction D is taken with it (a full line steps u by n, one wrap, in place of 1); every
// line on a dock in `heavy` (E-SPN-0109) takes the heavy coin w, n steps in place of 1
export function fineCoinBranch(
  cells: number,
  br: Branch,
  u: number,
  n: number,
  adjoint: boolean,
  fullDock = false,
  heavy?: ReadonlySet<number>,
): { b: Branch; u: number }[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`fine-coin: n must be a positive integer, got ${n}`)
  }

  const dir = adjoint ? -1 : 1
  const halves: { from: number; to: number; step: number }[] = []

  let fullSteps = 0

  for (let x = 0; x < cells; x++) {
    const base = x * 24
    const step = heavy?.has(x) ? n : 1

    for (let l = 0; l < 12; l++) {
      const i = base + LINE_FIRSTS[l]!
      const j = base + LINE_SECONDS[l]!
      const hi = br.vibe[i] !== 0
      const hj = br.vibe[j] !== 0

      if (hi && hj) {
        if (br.open[i] && br.open[j]) {
          fullSteps += fullDock ? n : step
        }

        continue
      }

      if (hi && br.open[i]) {
        halves.push({ from: i, to: j, step })
      } else if (hj && br.open[j]) {
        halves.push({ from: j, to: i, step })
      }
    }
  }

  if (halves.length > 10) {
    throw new Error(
      `fine-coin: ${halves.length} half-full open lines in one branch, over the guard 10`,
    )
  }

  const out: { b: Branch; u: number }[] = []

  // per half-full line two bits: crossed, and stepped (the zeta term, or w on a heavy dock)
  for (let mask = 0; mask < 1 << (2 * halves.length); mask++) {
    const b = copyBranch(br)

    let steps = fullSteps
    let negative = false

    halves.forEach((h, m) => {
      const crossed = (mask >> (2 * m)) & 1
      const stepped = (mask >> (2 * m + 1)) & 1

      if (crossed) {
        b.vibe[h.to] = b.vibe[h.from]!
        b.point[h.to] = b.point[h.from]!
        b.open[h.to] = b.open[h.from]!
        b.vibe[h.from] = 0
        b.point[h.from] = 0
        b.open[h.from] = 0
      }

      if (stepped) {
        steps += h.step

        if (crossed) {
          negative = !negative
        }
      }
    })

    if (negative) {
      b.a = -b.a
      b.b = -b.b
    }

    b.k += halves.length
    out.push({ b, u: carry(b, u, dir * steps, n) })
  }

  return out
}
