// THE SLAB LEAK AS A TWO-PATH EVANESCENT SUM (E-SPN-0198, moving-matter item 0050, key 2 of research/mass-inputs.md).
// Working rule R* with the spinor lift L(s) (decision 0006), half +, K = 0.
//
// THE QUESTION. E-SPN-0197 read the wall pair's leak delta on E-FRC-0267's chiral slab at L = 8 to 20 and it is not
// exp(-L / xi): it falls 40-fold from L 10 to 12, then rises. The slab is periodic in the depth, so wall A and wall B are
// joined through both domains, nW Wilson classes and nP plain classes. If each domain passes a state at pi as z^n
// (complex band structure: Bruno, PRB 52 (1995) 411), the two paths interfere, and a non-monotone delta is a node.
//
// THE READ.
//   BULK SYMBOL (before any asymmetric slab is read): for each set the K = 0 one-cycle operator of a periodic chain is
//   U(z) = sum_m U_m z^m, m = -2 .. 2, read from slabApply; det(U(z) + 1) = 0 solved by a shifted companion; kappa =
//   -ln|z|, q = arg z over the leading roots (every root at the largest |z| < 1)
//   S1  the symbol at the 16 Bloch points z = e^(2 pi i m / 16) reproduces the periodic 16-class chain's spectrum to 1e-10
//   S2  symmetric slabs nW = nP = L / 2, L 8 to 20, reproduce E-SPN-0197's delta to 1e-12 relative
//   B   the symbol's band: no output more than two classes away (exactly 0)
//   R   every leading root is found again from a second shift sigma within 1e-8, and is a root: the least singular value
//       of U(z) + 1 at most 1e-6 (its floor is sqrt(eps) times the norm, since it is read from (U + 1)^dag (U + 1))
//   F   the run's kappa and q equal FROZEN, the values logged before the grid was read, to 1e-9
//   FROZEN PREDICTION (logged 2026-10-08 before the grid was read): delta(nW, nP) = |A_W e^(-kappa_W nW) cos(q_W nW +
//   phi_W) + A_P e^(-kappa_P nP) cos(q_P nP + phi_P)|, A and phi the only fitted numbers. The bulk read found the plain
//   domain's leading set to be two real roots of equal modulus, +|z| and -|z| (q 0 and pi, four-fold each), not one root
//   or a conjugate pair, so the plain path is e^(-kappa_P nP) (a + b (-1)^nP), its two numbers in place of A and phi;
//   the Wilson set's leading root is one real negative root (q pi), whose A cos(pi n + phi) is the single number
//   A cos phi. The brief's literal reading (one plain root, q 0 or q pi alone) is reported as a diagnostic
//   GRID nW, nP each 4 to 12 (81 slabs). FIT on nW + nP <= 16 (45), PREDICT the other 36
// GATES (fixed 2026-10-08 in the brief, before any read): over held-out points whose predicted delta is at least 0.1 of
//   its two-term envelope (each path's summed amplitudes times its e^(-kappa n)),
//   PASS     every one lies within a factor 1.5 of the prediction
//   KILL     more than 20 percent miss by a factor 3 or more (not a few-channel evanescent sum)
//   otherwise PARTIAL. Any instrument (S1, S2, B, R, F) failing leaves the verdict OPEN
//   Reported, never gated: the residual map, each set's second root added (diagnostic, never a regate), and on PASS the
//   Wilson path's envelope A_W e^(-kappa_W n) at n 4 to 40
//
// DETERMINISM: no random numbers. Floats as measurement on the rule's exact pieces.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import {
  bulkBlocks,
  fitPaths,
  leadingPath,
  leakDelta,
  pathModel,
  pathWidth,
  piRoots,
  rootGroups,
  symbolSpectrum,
  type LeakRead,
  type Path,
  type PathFit,
  type PiRoot,
  type RootGroup,
} from '@/code/measure/wall-leak-channels'

export default experiment({
  id: 'spin/wall-leak-channels',
  code: 'E-SPN-0198',
  title:
    "The chiral slab's wall-pair leak as a two-path evanescent sum: each domain's decay kappa and wave number q at quasienergy pi from its bulk symbol alone (complex band structure), frozen, then tested on 81 asymmetric slabs (Wilson width and plain width 4 to 12 each), fit on 45 and predicted on 36",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return wallLeakChannelsRun()
  },
})

const flag = (b: boolean): number => (b ? 1 : 0)

// E-SPN-0197's delta (tmp/gwall.log metrics, half +), the S2 reference
export const DELTA_0197: Readonly<Record<number, number>> = {
  8: 0.02440643997837634,
  10: 0.004885833789936357,
  12: 0.00012195960805134776,
  14: 0.00022168595472078534,
  16: 0.00031780028996032417,
  18: 0.00022191209647077803,
  20: 0.0000734984393811592,
}

// each set's leading roots, frozen in the project log before the grid was read
export const FROZEN: Readonly<Record<'wilson' | 'plain', { kappa: number; qs: number[] }>> = {
  wilson: { kappa: 0.8627238544013857, qs: [Math.PI] },
  plain: { kappa: 0.9707309943038691, qs: [0, Math.PI] },
}

const SIGMAS: readonly [number, number][] = [
  [0.6 * Math.cos(0.3), 0.6 * Math.sin(0.3)],
  [0.8 * Math.cos(-1.1), 0.8 * Math.sin(-1.1)],
]

export const G = {
  s1: 1e-10,
  s2: 1e-12,
  band: 0,
  shift: 1e-8,
  root: 1e-6,
  frozen: 1e-9,
  live: 0.1,
  pass: 1.5,
  miss: 3,
  killShare: 0.2,
}

export type SetRead = {
  name: 'wilson' | 'plain'
  outside: number
  s1: number
  groups: RootGroup[]
  leading: PiRoot[]
  path: Path
  shiftGap: number
  witness: number
  finite: number
  inside: number
}

export function bulkRead(): SetRead[] {
  const cs = chiralSlab(8)
  const { sR, dR } = cs.ranges[0]!

  return (['wilson', 'plain'] as const).map(name => {
    const side = name === 'wilson' ? 0 : 1
    const set = cs.sets[0]![side === 0 ? 1 : 0]!
    const b = bulkBlocks(set)
    const s1 = symbolSpectrum(set, b, 16, sR, dR)
    const [r1, r2] = SIGMAS.map(sigma => piRoots(b, sigma))
    const groups = rootGroups(r1!.roots)
    const path = leadingPath(groups, side)
    const leading = r1!.roots.filter(r => r.abs < 1 - 1e-9 && Math.abs(r.abs - groups[0]!.abs) < 1e-6)
    const dist = (a: PiRoot, c: PiRoot): number => Math.hypot(a.z[0] - c.z[0], a.z[1] - c.z[1])
    const shiftGap = Math.max(...leading.map(r => Math.min(...r2!.roots.map(x => dist(r, x)))))

    return {
      name,
      outside: b.outside,
      s1,
      groups,
      leading,
      path,
      shiftGap,
      witness: Math.max(...leading.map(r => r.witness)),
      finite: r1!.roots.length,
      inside: r1!.roots.filter(r => r.abs < 1).length,
    }
  })
}

export const GRID: readonly number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12]
export const FIT_SUM = 16

export type Row = LeakRead & { fit: boolean; predicted: number; envelope: number; ratio: number; live: boolean }

export type Scored = { fit: PathFit; rows: Row[]; live: number; within: number; misses: number }

const factor = (r: Row): number => Math.max(r.ratio, 1 / r.ratio)

export function score(reads: readonly LeakRead[], paths: readonly Path[]): Scored {
  const fit = fitPaths(reads.filter(r => r.nW + r.nP <= FIT_SUM), paths)
  const rows: Row[] = reads.map(r => {
    const m = pathModel(fit, paths, r)

    return {
      ...r,
      fit: r.nW + r.nP <= FIT_SUM,
      predicted: m.value,
      envelope: m.envelope,
      ratio: r.delta / m.value,
      live: m.value >= G.live * m.envelope,
    }
  })
  const live = rows.filter(r => !r.fit && r.live)

  return {
    fit,
    rows,
    live: live.length,
    within: live.filter(r => factor(r) <= G.pass).length,
    misses: live.filter(r => factor(r) >= G.miss).length,
  }
}

export function symmetricRead(): { L: number; delta: number; rel: number }[] {
  return Object.keys(DELTA_0197)
    .map(Number)
    .map(L => {
      const r = leakDelta(L / 2, L / 2)

      return { L, delta: r.delta, rel: Math.abs(r.delta - DELTA_0197[L]!) / DELTA_0197[L]! }
    })
}

export function gridRead(): LeakRead[] {
  return GRID.flatMap(nW => GRID.map(nP => leakDelta(nW, nP)))
}

export function leakVerdict(
  sets: readonly SetRead[],
  symmetric: readonly { L: number; delta: number; rel: number }[],
  reads: readonly LeakRead[],
): Verdict {
  const W = sets.find(s => s.name === 'wilson')!
  const P = sets.find(s => s.name === 'plain')!
  const main = score(reads, [W.path, P.path])
  const held = main.rows.filter(r => !r.fit)
  const frozenGap = Math.max(
    ...sets.map(s => {
      const f = FROZEN[s.name]

      return f.qs.length === s.path.qs.length
        ? Math.max(Math.abs(s.path.kappa - f.kappa), ...s.path.qs.map((q, k) => Math.abs(q - f.qs[k]!)))
        : Infinity
    }),
  )
  const ins = {
    s1: sets.every(s => s.s1 <= G.s1),
    s2: symmetric.every(s => s.rel <= G.s2),
    band: sets.every(s => s.outside <= G.band),
    roots: sets.every(s => s.shiftGap <= G.shift && s.witness <= G.root),
    frozen: frozenGap <= G.frozen,
  }
  const instruments = ins.s1 && ins.s2 && ins.band && ins.roots && ins.frozen
  const pass = main.live > 0 && main.within === main.live
  const kill = main.misses > G.killShare * main.live
  const status: Verdict['status'] = !instruments ? 'open' : pass ? 'pass' : kill ? 'fail' : 'partial'
  // diagnostics, never gated: the brief's literal plain path (one q), and each set's second root added
  const second = (s: SetRead): Path | undefined => {
    const g = s.groups.find(x => Math.abs(x.abs - s.groups[0]!.abs) >= 1e-6 && x.abs > 1e-2)

    return g ? { kappa: g.kappa, qs: [g.q], side: s.path.side } : undefined
  }
  const diagnostics = [
    { name: 'plain q 0 alone', paths: [W.path, { ...P.path, qs: [0] }] },
    { name: 'plain q pi alone', paths: [W.path, { ...P.path, qs: [Math.PI] }] },
    { name: 'wilson second root added', paths: [W.path, P.path, second(W)].filter((p): p is Path => !!p) },
    { name: 'plain second root added', paths: [W.path, P.path, second(P)].filter((p): p is Path => !!p) },
  ]
    .filter(d => d.paths.length >= 2)
    .map(d => ({ ...d, s: score(reads, d.paths) }))
  const e = (x: number, d = 3): string => x.toExponential(d)
  const setText = (s: SetRead): string =>
    `${s.name}: band ${e(s.outside, 1)}, S1 ${e(s.s1, 1)}, ${s.finite} finite roots (${s.inside} inside), leading |z| ${s.groups[0]!.abs.toFixed(10)} (kappa ${s.path.kappa.toFixed(10)}) at q ${s.path.qs.map(q => q.toFixed(8)).join(', ')} (${s.leading.length} roots), witness ${e(s.witness, 1)}, shift gap ${e(s.shiftGap, 1)}; next groups ${s.groups
      .slice(1, 4)
      .map(g => `|z| ${g.abs.toFixed(6)} q ${g.q.toFixed(6)} x${g.count}${g.conjugate ? ' conj' : ''}`)
      .join(', ')}`
  const residualMap = held
    .map(r => `(${r.nW},${r.nP}) ${e(r.delta, 2)}/${e(r.predicted, 2)}${r.live ? '' : ' dead'}`)
    .join('; ')
  const AW = main.fit.amplitudes[0]!
  const envelopeW = Array.from({ length: 37 }, (_, k) => k + 4).map(n => [n, AW * Math.exp(-W.path.kappa * n)] as const)
  const diagText = diagnostics
    .map(d => `${d.name} (${d.paths.reduce((s, p) => s + pathWidth(p), 0)} numbers): rms log ${d.s.fit.rmsLog.toFixed(3)}, live ${d.s.live}, within ${d.s.within}, miss ${d.s.misses}`)
    .join('; ')

  return verdict({
    status,
    claim: `${status.toUpperCase()}: instruments S1 ${ins.s1}, S2 ${ins.s2} (worst ${e(Math.max(...symmetric.map(s => s.rel)), 1)}), band ${ins.band}, roots ${ins.roots}, frozen ${ins.frozen} (${e(frozenGap, 1)}). Bulk: ${setText(W)}; ${setText(P)}. Fit (${main.rows.filter(r => r.fit).length} points, nW + nP <= ${FIT_SUM}, ${main.fit.x.length} numbers): coefficients ${main.fit.x.map(x => e(x)).join(', ')}, amplitude W ${e(AW)}, P ${e(main.fit.amplitudes[1]!)}, rms log ${main.fit.rmsLog.toFixed(3)}. Held-out ${held.length}, live ${main.live}: within x${G.pass} ${main.within}, miss x${G.miss} ${main.misses}. PASS ${pass}, KILL ${kill}. Held-out delta/predicted: ${residualMap}. Diagnostics: ${diagText}.${pass ? ` Wilson path envelope A_W e^(-kappa_W n): ${envelopeW.filter(([n]) => n % 4 === 0).map(([n, v]) => `n ${n} ${e(v, 2)}`).join(', ')}.` : ''}`,
    metrics: {
      kappaW: W.path.kappa,
      kappaP: P.path.kappa,
      amplitudeW: AW,
      amplitudeP: main.fit.amplitudes[1]!,
      rmsLog: main.fit.rmsLog,
      held: held.length,
      live: main.live,
      within: main.within,
      misses: main.misses,
      pass: flag(pass),
      kill: flag(kill),
      ...Object.fromEntries(main.fit.x.map((x, k) => [`coefficient_${k}`, x])),
      ...Object.fromEntries(main.rows.map(r => [`delta_${r.nW}_${r.nP}`, r.delta])),
      ...Object.fromEntries(main.rows.map(r => [`predicted_${r.nW}_${r.nP}`, r.predicted])),
      ...Object.fromEntries(envelopeW.map(([n, v]) => [`envW_${n}`, v])),
    },
    control: {
      instruments: flag(instruments),
      s1Wilson: W.s1,
      s1Plain: P.s1,
      s2Worst: Math.max(...symmetric.map(s => s.rel)),
      bandWilson: W.outside,
      bandPlain: P.outside,
      shiftWilson: W.shiftGap,
      shiftPlain: P.shiftGap,
      rootWilson: W.witness,
      rootPlain: P.witness,
      frozenGap,
      worstInGap: Math.max(...reads.map(r => r.inGap)),
      leastInGap: Math.min(...reads.map(r => r.inGap)),
      worstLeak: Math.max(...reads.map(r => r.leak)),
      ...Object.fromEntries(diagnostics.flatMap((d, k) => [[`diag${k}Within`, d.s.within], [`diag${k}Misses`, d.s.misses], [`diag${k}Live`, d.s.live]])),
    },
    notes: `L2. R* with L(s), half +, K = 0. The symbol's convention: psi_c = z^c phi, so |z| < 1 decays toward larger c; the roots come in pairs z, 1 / conj(z) (U unitary on the circle), so kappa is read once. The plain path's two equal-modulus real roots replace the brief's one-root form (logged as a deviation before the grid was read).`,
  })
}

export function wallLeakChannelsRun(): Verdict {
  return leakVerdict(bulkRead(), symmetricRead(), gridRead())
}
