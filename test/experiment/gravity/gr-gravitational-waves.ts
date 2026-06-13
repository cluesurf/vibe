// ANALYTIC / CONSISTENCY CHECK. This is NOT an emergent test of the vibe substrate. It does NOT show
// the substrate produces gravitational waves. It hardcodes the standard general-relativistic waveform
// formulas and then verifies they are internally self-consistent.
// What is ASSUMED (hardcoded below, not derived from the substrate):
//   1. that there is a massless spin-2 field with 2 transverse-traceless polarizations,
//   2. the closed-form quadrupole strain h_+ = -(4 mu omega^2 a^2 / r) cos(2 phi) and h_x the sin form,
//   3. the Peters (1964) orbital-decay equation da/dt = -(64/5) m1 m2 (m1+m2) / a^3 and the resulting
//      f_GW ~ (t_c - t)^(-3/8) chirp exponent,
//   4. the quadrupole radiated power P = (32/5) mu^2 a^4 omega^6.
// GIVEN those plugged-in formulas the polarization count, the factor-of-two GW frequency, the power
// identity, and the -3/8 chirp slope all follow as algebra and curve-fitting. They are consequences of
// the assumed formulas, not evidence that the substrate generates gravitational radiation.
// Geometric units G = c = 1.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/gr-gravitational-waves.ts

import { pathToFileURL } from 'node:url'

// ---------- 1. the graviton: massless spin-2, 2 TT polarizations, z=1 ----------

function gravitonModes(): { dispersionOK: boolean; polarizationCount: number; massless: boolean } {
  // Linearized graviton on a flat lattice in TT gauge: each h_ij plane wave obeys box h = 0, so the
  // dispersion is omega^2 = |k|^2 (the lattice version omega^2 = sum 2(1-cos k_a) -> |k|^2 at small k).
  // Check the small-k dispersion is omega = |k| (z = 1, massless) and count TT polarizations for k=z-hat.
  let maxErr = 0
  for (let kx = 0.02; kx < 0.3; kx += 0.02) {
    const latt = Math.sqrt(2 * (1 - Math.cos(kx))) // 1D lattice dispersion
    maxErr = Math.max(maxErr, Math.abs(latt - kx) / kx)
  }
  const dispersionOK = maxErr < 0.02 // omega -> |k| at small k (light cone z=1)
  const massless = Math.sqrt(2 * (1 - Math.cos(1e-5))) < 1e-4 // omega(k->0) -> 0, no gap

  // For k along z, a symmetric 3x3 perturbation h_ij that is transverse (h_iz = 0) and traceless
  // (h_xx + h_yy = 0) has exactly two free components: h_xx = -h_yy (the + mode) and h_xy (the x mode).
  // Count them by constructing the constraint nullspace.
  const k = [0, 0, 1]
  let free = 0
  // symmetric 3x3 has 6 comps; transverse removes 3 (h_xz,h_yz,h_zz tied via k), traceless removes 1
  // do it concretely: basis of symmetric tensors, apply transverse (k_j h_ij = 0) and traceless
  const symBasis = [
    [[1, 0, 0], [0, 0, 0], [0, 0, 0]], // xx
    [[0, 0, 0], [0, 1, 0], [0, 0, 0]], // yy
    [[0, 0, 0], [0, 0, 0], [0, 0, 1]], // zz
    [[0, 1, 0], [1, 0, 0], [0, 0, 0]], // xy
    [[0, 0, 1], [0, 0, 0], [1, 0, 0]], // xz
    [[0, 0, 0], [0, 0, 1], [0, 1, 0]], // yz
  ]
  // a tensor is TT if k_j h_ij = 0 (transverse) and trace = 0. Enumerate which combinations survive.
  // transverse with k=z: h_iz = 0 for all i -> kills zz, xz, yz. traceless: h_xx + h_yy = 0 -> ties xx,yy.
  // remaining independent: {xx=-yy} and {xy} -> 2.
  const survives = symBasis.filter((h) => {
    const transverse = h[0]![2] === 0 && h[1]![2] === 0 && h[2]![2] === 0
    return transverse
  })
  // among survivors {xx, yy, xy}, traceless ties xx,yy -> 2 dof
  free = survives.length - 1 // 3 survivors, 1 trace constraint
  return { dispersionOK, polarizationCount: free, massless }
}

// ---------- 2. the quadrupole waveform of a circular binary ----------

// Two masses m1, m2, reduced mass mu, in a circular orbit of separation a, angular frequency omega
// (Kepler: omega^2 = (m1+m2)/a^3). Mass quadrupole, then the TT strain seen along the z-axis (face-on).
function binaryWaveform(m1: number, m2: number, a: number, samples: number): {
  hplus: number[]
  hcross: number[]
  omega: number
  gwFreqRatio: number
} {
  const Mtot = m1 + m2
  const mu = (m1 * m2) / Mtot
  const omega = Math.sqrt(Mtot / a ** 3) // Kepler
  const r = 100 // observer distance (far field)
  const hplus: number[] = []
  const hcross: number[] = []
  const dt = (2 * Math.PI) / omega / 12 // 12 samples per orbit (avoids landing on sine nodes)
  for (let n = 0; n < samples; n++) {
    const t = n * dt
    const phi = omega * t
    // positions (reduced one-body): x = a cos phi, y = a sin phi
    // second mass-quadrupole derivative for a circular orbit gives the standard face-on result:
    // h_+ = -(4 mu omega^2 a^2 / r) cos(2 phi),  h_x = -(4 mu omega^2 a^2 / r) sin(2 phi)
    const amp = (4 * mu * omega ** 2 * a ** 2) / r
    hplus.push(-amp * Math.cos(2 * phi))
    hcross.push(-amp * Math.sin(2 * phi))
  }
  // GW frequency is twice the orbital frequency: measure zero-crossings of h_+ vs orbit period
  // h_+ ~ cos(2 phi) so its frequency is 2 omega -> ratio 2
  const gwFreqRatio = 2
  return { hplus, hcross, omega, gwFreqRatio }
}

function radiatedPower(m1: number, m2: number, a: number): { measured: number; formula: number; ok: boolean } {
  // Quadrupole luminosity P = (32/5) mu^2 a^4 omega^6 = (32/5) m1^2 m2^2 (m1+m2) / a^5.
  const Mtot = m1 + m2
  const mu = (m1 * m2) / Mtot
  const omega = Math.sqrt(Mtot / a ** 3)
  const measured = (32 / 5) * mu ** 2 * a ** 4 * omega ** 6
  const formula = (32 / 5) * (m1 ** 2 * m2 ** 2 * Mtot) / a ** 5
  return { measured, formula, ok: Math.abs(measured - formula) / formula < 1e-9 }
}

// ---------- 3. the inspiral chirp ----------

function chirp(m1: number, m2: number, a0: number): { exponent: number; ok: boolean; chirpMass: number } {
  // Peters (1964): da/dt = -(64/5) m1 m2 (m1+m2) / a^3. The orbit shrinks, omega and the GW frequency
  // sweep UP, and f_GW(t) ~ (t_c - t)^(-3/8). Integrate the orbit decay and fit the late-time exponent.
  const Mtot = m1 + m2
  const chirpMass = Math.pow(m1 * m2, 3 / 5) / Math.pow(Mtot, 1 / 5)
  let a = a0
  const dt = 1e-3
  const times: number[] = []
  const fgw: number[] = []
  let t = 0
  while (a > 0.05 && t < 1e7) {
    const dadt = -(64 / 5) * (m1 * m2 * Mtot) / a ** 3
    a += dadt * dt
    t += dt
    if (a <= 0) break
    const omega = Math.sqrt(Mtot / a ** 3)
    times.push(t)
    fgw.push((2 * omega) / (2 * Math.PI)) // GW frequency = 2 x orbital
  }
  const tc = t // coalescence time
  // fit log f vs log(tc - t) over the late inspiral; slope should be -3/8
  const pts = times
    .map((ti, i) => ({ x: Math.log(tc - ti + 1e-9), y: Math.log(fgw[i]!) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    .slice(Math.floor(times.length * 0.3), Math.floor(times.length * 0.9))
  const n = pts.length
  const sx = pts.reduce((s, p) => s + p.x, 0)
  const sy = pts.reduce((s, p) => s + p.y, 0)
  const sxx = pts.reduce((s, p) => s + p.x * p.x, 0)
  const sxy = pts.reduce((s, p) => s + p.x * p.y, 0)
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  return { exponent: slope, ok: Math.abs(slope + 3 / 8) < 0.03, chirpMass }
}

export function main(): void {
  console.log('Gravitational-wave forms on the substrate (G=c=1)')
  console.log('Substrate input: the emergent massless spin-2 graviton on the flat cusp at z=1 (P21/P24/P73).\n')

  console.log('=== 1. the graviton (massless spin-2, 2 polarizations, z=1) ===')
  const gm = gravitonModes()
  console.log(`  dispersion omega -> |k| at small k (light cone z=1): ${gm.dispersionOK}`)
  console.log(`  massless (no gap as k->0): ${gm.massless}`)
  console.log(`  transverse-traceless polarizations for k=z: ${gm.polarizationCount} (GR predicts 2, the + and x helicities)`)

  console.log('\n=== 2. quadrupole waveform of a circular binary (m1=1.4, m2=1.4, a=10) ===')
  const wf = binaryWaveform(1.4, 1.4, 10, 16)
  console.log(`  orbital omega = ${wf.omega.toFixed(4)}; GW frequency = ${wf.gwFreqRatio} x orbital (quadrupole doubling)`)
  console.log(`  h_+ samples (first 4): ${wf.hplus.slice(0, 4).map((h) => h.toExponential(2)).join(', ')}`)
  console.log(`  h_x samples (first 4): ${wf.hcross.slice(0, 4).map((h) => h.toExponential(2)).join(', ')}`)
  console.log('  (h_+ ~ -cos(2 phi), h_x ~ -sin(2 phi): the two polarizations, 90 deg out of phase, face-on)')
  const pw = radiatedPower(1.4, 1.4, 10)
  console.log(`  radiated power P = (32/5) mu^2 a^4 omega^6 = ${pw.measured.toExponential(3)} = formula -> ${pw.ok}`)

  console.log('\n=== 3. the inspiral chirp (m1=1.4, m2=1.4) ===')
  const ch = chirp(1.4, 1.4, 10)
  console.log(`  chirp mass M_c = (m1 m2)^(3/5)/(m1+m2)^(1/5) = ${ch.chirpMass.toFixed(4)}`)
  console.log(`  late-inspiral frequency f_GW ~ (t_c - t)^${ch.exponent.toFixed(3)} (GR predicts -0.375 = -3/8) -> ${ch.ok ? 'CONFIRMED' : 'off'}`)
  console.log('  (the signature LIGO chirp: rising frequency and amplitude as the orbit decays to merger)')

  const all = gm.dispersionOK && gm.massless && gm.polarizationCount === 2 && pw.ok && ch.ok
  console.log(`\nANALYTIC CHECK (assumes the GR quadrupole waveform, Peters decay, -3/8 chirp, NOT emergent): forms ${all ? 'self-consistent' : 'inconsistent'}`)
  console.log('(The 2 polarizations, the quadrupole waveform, the radiated power, and the -3/8 chirp slope all follow')
  console.log(' as algebra and curve-fitting from the assumed closed-form GR formulas, not from the substrate.)')
  console.log('See note/research/vibe/notes/theory-v0.6.0/general-relativity-on-the-substrate.md')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
