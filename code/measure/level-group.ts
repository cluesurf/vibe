// A GROUP OF LEVELS READ AS ONE: ITS WEIGHT, CENTROID AND WIDTH FROM ONE AUTOCORRELATION (E-MTR-0033, E-SPN-0215).
//
// A start r has the autocorrelation x_l = <r | G U^l r> = x_0 sum_i o_i e^(i E_i l), o_i its overlap with line i. Below
// the resolution 2 pi / n of n lags, filter diagonalization (code/algebra/linear/filter-diagonalization) splits a group of
// close lines differently at every setting (E-MTR-0032's "multiplet"), so no single line of the group can be followed.
// What can be read without resolving the group is its spectral measure smoothed by a Gaussian of width sigma:
//
//   rho_sigma(E) = (1 / 2 pi) sum_(|l| < n) e^(-sigma^2 l^2 / 2) x_l e^(-i E l) / x_0 = sum_i o_i g_sigma(E - E_i)
//
// (g_sigma the periodic Gaussian; the lag taper is below 1e-12 before the last lag once sigma n > 7.5). Integrated over a
// window [lo, hi] whose edges lie in gaps of the spectrum (several sigma from any line of weight), it gives the group's
// weight W = sum o_i, centroid c = sum o_i E_i / W and second moment, so the group's own width is
// sqrt(var - sigma^2). The centroid is exact for the lines inside the window up to the Gaussian tails across the edges.
//
// WHY THE CENTROID. Restricted to the group, sum o_i E_i / W = <r_P | U-phase | r_P> / <r_P | r_P> with r_P the start
// projected on the group: the start's own diagonal energy there, which no mixing inside the group changes (two levels
// that mix as K grows move apart, but their overlap-weighted mean is the diagonal element). It differs from any one
// line of the group by at most the group's width.
//
// Measurement only (floats). DETERMINISM: no random numbers.

export type Correlation = { re: ArrayLike<number>; im: ArrayLike<number> }

// The lag taper's floor: the read stops where the Gaussian taper falls below it, and refuses a sigma whose taper has not
// reached it by the last lag. 1e-12 is the default every read before E-SPN-0219 used. E-SPN-0219 also reads at 1e-6
// (sigma n >= 5.26 rather than 7.43), witnessed against the full-length fine read of the same correlation: the part of
// the taper the correlation cannot supply is then at most 1e-6 of a lag's weight.
export const TAPER_FLOOR = 1e-12

// rho_sigma(E), normalized by x_0, so that it integrates to 1 over the whole circle
export function broadenedSpectrum(x: Correlation, E: number, sigma: number, floor: number = TAPER_FLOOR): number {
  const n = x.re.length
  let v = x.re[0]! / 2

  for (let l = 1; l < n; l++) {
    const g = Math.exp((-sigma * sigma * l * l) / 2)

    if (g < floor) break
    v += g * (x.re[l]! * Math.cos(E * l) + x.im[l]! * Math.sin(E * l))
  }

  return v / Math.PI / x.re[0]!
}

// the largest lag the taper reaches, and whether the correlation is long enough for it
export const taperReach = (sigma: number, floor: number = TAPER_FLOOR): number =>
  Math.ceil(Math.sqrt((2 * Math.log(1 / floor)) / (sigma * sigma)))

export type GroupMoments = { weight: number; centroid: number; width: number; variance: number }

// weight, centroid and width of the measure inside [lo, hi] (Simpson's rule on a grid of step sigma / 16)
export function groupMoments(input: { x: Correlation; lo: number; hi: number; sigma: number; floor?: number }): GroupMoments {
  const { x, lo, hi, sigma } = input
  const floor = input.floor ?? TAPER_FLOOR

  if (taperReach(sigma, floor) > x.re.length) {
    throw new Error(`groupMoments: sigma ${sigma} needs ${taperReach(sigma, floor)} lags, the correlation has ${x.re.length}`)
  }

  const steps = 2 * Math.ceil(((hi - lo) / (sigma / 16)) / 2)
  const h = (hi - lo) / steps
  let w = 0
  let m1 = 0
  let m2 = 0
  const mid = (lo + hi) / 2

  for (let i = 0; i <= steps; i++) {
    const E = lo + i * h
    const f = broadenedSpectrum(x, E, sigma, floor)
    const s = i === 0 || i === steps ? 1 : i % 2 === 1 ? 4 : 2

    w += s * f
    m1 += s * f * (E - mid)
    m2 += s * f * (E - mid) ** 2
  }

  w *= h / 3
  m1 *= h / 3
  m2 *= h / 3

  const c = m1 / w
  const variance = m2 / w - c * c

  return { weight: w, centroid: mid + c, variance, width: Math.sqrt(Math.max(0, variance - sigma * sigma)) }
}

export type Peak = { E: number; weight: number }

// the local maxima of rho_sigma in [lo, hi] above `least` of the largest, each with the weight of a lone line there
export function spectralPeaks(input: {
  x: Correlation
  lo: number
  hi: number
  sigma: number
  least?: number
  floor?: number
}): Peak[] {
  const { x, lo, hi, sigma } = input
  const h = sigma / 8
  const vals: [number, number][] = []

  for (let E = lo; E <= hi; E += h) vals.push([E, broadenedSpectrum(x, E, sigma, input.floor)])

  const top = Math.max(...vals.map(v => v[1]))
  const least = (input.least ?? 0.01) * top
  const out: Peak[] = []

  for (let i = 1; i < vals.length - 1; i++) {
    const [E, v] = vals[i]!

    if (v > vals[i - 1]![1] && v >= vals[i + 1]![1] && v > least) {
      // the parabola through the three grid points places the peak between them
      const a = vals[i - 1]![1]
      const c = vals[i + 1]![1]
      const shift = (0.5 * (a - c)) / (a - 2 * v + c)

      out.push({ E: E + shift * h, weight: v * sigma * Math.sqrt(2 * Math.PI) })
    }
  }

  return out
}

// a group of levels: the lowest peak of weight at least `least` in the search range, its window running from `below`
// under it to `edge` of the way up to the next peak of weight at least `next` (or `above` when there is none)
export function groupWindow(input: {
  peaks: readonly Peak[]
  least: number
  next: number
  below: number
  edge: number
  above: number
}): { peak: Peak; lo: number; hi: number; gap: number } | null {
  const sorted = [...input.peaks].sort((a, b) => a.E - b.E)
  const i = sorted.findIndex(p => p.weight >= input.least)

  if (i < 0) return null

  const peak = sorted[i]!
  const up = sorted.slice(i + 1).find(p => p.weight >= input.next)
  const gap = up ? up.E - peak.E : NaN

  return { peak, lo: peak.E - input.below, hi: up ? peak.E + input.edge * gap : peak.E + input.above, gap }
}

// one setting of the group read: the Gaussian width, how far up the gap to the next group the window's top edge sits,
// and the lag taper's floor (TAPER_FLOOR when absent)
export type GroupSetting = { sigma: number; edge: number; floor?: number }

export type GroupRead = GroupMoments & { lo: number; hi: number; peak: number; gap: number }

// the k-th group above `from` (k 0 the lowest group of weight at least `least`) at every setting: the peaks are found at
// each setting's own sigma, the window's lower edge is `below` under the group's peak or, for k > 0, the previous
// group's top edge; the main read is the first setting's, the stability the half-spread of the centroid over settings
export function groupOverSettings(input: {
  x: Correlation
  lo: number
  hi: number
  settings: readonly GroupSetting[]
  least: number
  next: number
  below: number
  above: number
  rank?: number
}): { main: GroupRead | null; reads: (GroupRead | null)[]; half: number } {
  const rank = input.rank ?? 0
  const reads = input.settings.map(s => {
    const peaks = spectralPeaks({ x: input.x, lo: input.lo, hi: input.hi, sigma: s.sigma, least: 0.002, floor: s.floor })
    let floor = input.lo
    let rest = peaks
    let w: ReturnType<typeof groupWindow> = null

    for (let k = 0; k <= rank; k++) {
      w = groupWindow({
        peaks: rest,
        least: k === 0 ? input.least : input.next,
        next: input.next,
        below: input.below,
        edge: s.edge,
        above: input.above,
      })

      if (!w) return null
      if (k < rank) {
        floor = w.hi
        const top = w.hi

        rest = rest.filter(p => p.E > top)
      }
    }

    const lo = rank === 0 ? w!.lo : floor
    const m = groupMoments({ x: input.x, lo, hi: w!.hi, sigma: s.sigma, floor: s.floor })

    return { ...m, lo, hi: w!.hi, peak: w!.peak.E, gap: w!.gap }
  })
  const cs = reads.map(r => r?.centroid ?? NaN)

  return { main: reads[0] ?? null, reads, half: (Math.max(...cs) - Math.min(...cs)) / 2 }
}

// a synthetic correlation of given lines (the instrument's witness): x_l = sum o_i e^(i E_i l), x_0 = 1
export function syntheticCorrelation(lines: readonly { E: number; o: number }[], n: number): { re: number[]; im: number[] } {
  const re = new Array<number>(n).fill(0)
  const im = new Array<number>(n).fill(0)

  for (let l = 0; l < n; l++) {
    for (const { E, o } of lines) {
      re[l]! += o * Math.cos(E * l)
      im[l]! += o * Math.sin(E * l)
    }
  }

  return { re, im }
}
