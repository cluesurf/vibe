// The joint Kac-warp factorization check: y_i = A * kappa_i * lambda^(-d_i/2) with
// integer depths d_i and kappa_i required to fit inside the MEASURED Kac band
// (0.086 to 0.179, ratio 2.08). Compute required prefactors for candidate integer depth
// assignments and test which fit.
const LAMBDA = 18.278
const V = 246000
const MASSES = { e: 0.51099895, mu: 105.6583755, tau: 1776.86 }
const KAC_MIN = 0.0864
const KAC_MAX = 0.179
const BAND = KAC_MAX / KAC_MIN

const yuk = (m: number): number => (Math.SQRT2 * m) / V
const ys = [yuk(MASSES.e), yuk(MASSES.mu), yuk(MASSES.tau)]
console.log('Yukawas:', ys.map(y => y.toExponential(3)).join(' '))
console.log('exact depths (log_lambda^{1/2} of 1/y):', ys.map(y => (-2 * Math.log(y) / Math.log(LAMBDA)).toFixed(2)).join(' '))
console.log('Kac band ratio:', BAND.toFixed(2))

const test = (d: number[]): void => {
  const pre = ys.map((y, i) => y * Math.pow(LAMBDA, d[i]! / 2))
  const ratio = Math.max(...pre) / Math.min(...pre)
  console.log(`depths (${d.join(',')}): prefactors ${pre.map(p => p.toFixed(3)).join(' ')} spread=${ratio.toFixed(2)} ${ratio <= BAND ? 'FITS IN KAC BAND' : 'exceeds band'}`)
}

// nearest integers and neighbors
test([9, 5, 3])
test([8, 5, 3])
test([9, 6, 3])
test([9, 5, 4])
test([10, 5, 3])
test([9, 4, 3])
test([8, 4, 2])
test([10, 6, 4])
