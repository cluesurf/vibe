// A test wave for the depth arena (E-GRV-0088, 0089): a scalar field on the husk whose inertia, stiffness and rest term
// read its column's depth. A STAND-IN for matter: the bulk vibes the model has move one dock a beat whatever the depth,
// so nothing in the model makes matter read a column's depth yet (E-GRV-0071). Its CLOCK form is what "a deeper column
// takes more beats to cross" means when applied to matter by the same machinery that applies it to the husk light.
//
// THE FIELD. X on every husk dock, an integer in a fixed unit (the amplitude is its scale), run by
//   Q_y (X_(t+1) - 2 X_t + X_(t-1)) = - a (A X)_t - m_y X_t + (R_t - R_(t+1))          (1)
// with A the husk Laplacian of code/rule/trit-radion (the light's link metric: g = 2 on an axis, 1 on a face
// diagonal), q_y = 2 D_y + 1 the counter range of the column's D trits (code/rule/trit-column), q0 = 2 D0 + 1, and
// three forms:
//   clock    Q = 9 q,    a = 2,       m_y = m      the light's own rule: its kick divides by q, so the inertia is the
//                                                 column's count, the stiffness reads no depth, and the rest term
//                                                 does not read depth. Waves run at sqrt(6 a / Q) = c(D), the husk
//                                                 light's speed; the rest rate sqrt(m / 9q) falls as q^(-1/2)
//   column   Q = 9 q,    a = 2,       m_y = m q    the control: the rest term counts the column as the inertia does,
//                                                 so the rest rate sqrt(m / 9) is the same at every depth
//   metric   Q = 9 q^2,  a = 2 q0,    m_y = m q    the positive control: exactly the scalar wave of the isotropic
//                                                 metric ds^2 = -(q0 / q) dt^2 + (q / q0) dx^2 (for a static metric
//                                                 with g_tt = -N^2 and g_xx = a^2 the wave equation is
//                                                 -(a^3 / N) X'' + div(N a grad X) - mu^2 N a^3 X = 0, and N^2 = q0 / q,
//                                                 a^2 = q / q0 give inertia (q / q0)^2, stiffness 1, rest term
//                                                 mu^2 q / q0), the time and space parts equal as in general
//                                                 relativity's weak field. Waves run at c0 q0 / q; the rest rate
//                                                 sqrt(m / 9q) falls as q^(-1/2), as the clock form's does
//
// THE INTEGER RULE (no rounding: the one division's remainder is CARRIED). With H_y = (Q_y - 1) / 2 (Q_y odd) and R_y in
// -H_y .. H_y, per dock:  s = - a (A X)_y - m_y X_y + R_y,  K = floor((s + H_y) / Q_y),  R_y <- s - Q_y K,
// X_y <- 2 X_y - X_lag,y + K. Summed, (1) holds EXACTLY: the carried remainder is a forcing of at most one unit of X
// a beat whose sum over any run telescopes, so nothing is dropped. Each dock divides by its own Q_y and every term is
// in the one unit of X, so a varying depth needs no seam (unlike the light's counters, code/measure/varying-depth-
// light item 1).
//
// REVERSIBLE: given X_(t+1), X_t and R_(t+1), Q_y X_(t-1) - R_t = s' where s' = - a (A X_t)_y - m_y X_t,y - R_(t+1),y
// - Q_y (X_(t+1) - 2 X_t) is known, and -R_t lies in a window of Q_y integers, so X_(t-1) and R_t are the unique
// quotient and remainder. beatBack is the inverse, checked bit for bit by the callers.
//
// THE INVARIANT (measurement: code/measure/depth-arena) E = sum_y Q_y (X1 - X0)^2 / 2 + a X1 . A X0 / 2 +
// sum_y m_y X1 X0 / 2 over two successive beats, kept by (1) up to the carried forcing.
//
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { laplacian, type RadionMesh } from '@/code/rule/trit-radion'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type WaveForm = 'clock' | 'column' | 'metric'

export type ClockWaveRule = {
  readonly form: WaveForm
  // per dock: the inertia Q, its half window, and the rest term
  readonly inertia: Int32Array
  readonly half: Int32Array
  readonly rest: Int32Array
  readonly a: number
}

// the rule on a depth map, with rest parameter m and reference depth d0
export function clockWaveRule(mesh: RadionMesh, depth: (dock: number) => number, m: number, form: WaveForm, d0: number): ClockWaveRule {
  const inertia = new Int32Array(mesh.docks)
  const half = new Int32Array(mesh.docks)
  const rest = new Int32Array(mesh.docks)
  const q0 = 2 * d0 + 1

  for (let y = 0; y < mesh.docks; y++) {
    const q = 2 * depth(y) + 1
    const big = form === 'metric' ? 9 * q * q : 9 * q

    inertia[y] = big
    half[y] = (big - 1) / 2
    rest[y] = form === 'clock' ? m : m * q
  }

  return { form, inertia, half, rest, a: form === 'metric' ? 2 * q0 : 2 }
}

export type ClockWaveState = { readonly now: Int32Array; readonly lag: Int32Array; readonly rest: Int32Array }

export const emptyClockWave = (mesh: RadionMesh): ClockWaveState => ({ now: new Int32Array(mesh.docks), lag: new Int32Array(mesh.docks), rest: new Int32Array(mesh.docks) })

export const sameClockWave = (u: ClockWaveState, v: ClockWaveState): boolean => u.now.every((x, i) => x === v.now[i]) && u.lag.every((x, i) => x === v.lag[i]) && u.rest.every((x, i) => x === v.rest[i])

export const clockWaveFrom = (s: ClockWaveState): ClockWaveState => ({ now: Int32Array.from(s.now), lag: Int32Array.from(s.lag), rest: Int32Array.from(s.rest) })

// one beat, in place
export function clockWaveBeat(mesh: RadionMesh, rule: ClockWaveRule, s: ClockWaveState, lap: Int32Array): void {
  laplacian(mesh, s.now, lap)

  for (let y = 0; y < mesh.docks; y++) {
    const q = rule.inertia[y]!
    const sum = -rule.a * lap[y]! - rule.rest[y]! * s.now[y]! + s.rest[y]!
    const k = floorDiv(sum + rule.half[y]!, q)

    s.rest[y] = sum - q * k

    const next = 2 * s.now[y]! - s.lag[y]! + k

    s.lag[y] = s.now[y]!
    s.now[y] = next
  }
}

// the inverse beat
export function clockWaveBeatBack(mesh: RadionMesh, rule: ClockWaveRule, s: ClockWaveState, lap: Int32Array): void {
  laplacian(mesh, s.lag, lap)

  for (let y = 0; y < mesh.docks; y++) {
    const q = rule.inertia[y]!
    const known = -rule.a * lap[y]! - rule.rest[y]! * s.lag[y]! - s.rest[y]! - q * (s.now[y]! - 2 * s.lag[y]!)
    const prev = floorDiv(known + rule.half[y]!, q)

    s.rest[y] = q * prev - known
    s.now[y] = s.lag[y]!
    s.lag[y] = prev
  }
}
