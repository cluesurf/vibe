// The trade: the candidate knit against the committed and combined knit, property by property, and whether the
// candidate meets the user's adoption condition, "works with everything" (E-RLT-0073).
//
// THE TWO SIDES. The committed knit as it stands after 2026-09-26: the combined knit's H configuration (the head-on
// turn base with the scatter block, unfolded) with the adopted comoving fear beat and the exact kernels, and the
// committed turning weave where a reading was taken only on it. The candidate: the pair-making isometric knit with
// the store that returns the unmade pair's tokens and the neutral veto (code/rule/token-store-knit,
// 'returned-neutral'; E-RLT-0067).
//
// WHERE EACH NUMBER COMES FROM. The candidate's battery, transport and leak rows are computed in this process by
// E-RLT-0070, E-RLT-0071 and E-RLT-0072 (their exported readings, run once per process). The candidate's rule-level
// rows (W(F4), CPT, frame covariance with open tokens, held color, fermion number, states) are E-RLT-0067's registered
// numbers, and the committed side's rows are the registered numbers of the experiment named in each row; both are
// copied as constants with their codes, because rerunning E-RLT-0067 (731 s) and E-FRC-0159 (862 s) here would only
// repeat them.
//
// Gates, fixed before the first run:
//  X  the three measurements this table reads ran to a verdict in this process, and every row has a value on both
//     sides, each with the code of the experiment it comes from
//  C  the adoption condition as E-RLT-0070 registered it: no gate the combined knit H passes fails on the candidate,
//     and every quantum gate passes on it with the fear beat on
// Verdict: pass if X and C hold; fail if X holds and C does not; partial otherwise. The table itself is a reading.
//
// Depth L2 (a summary of L2 measurements). The husk rows are husk readings; every other row is a bulk rule property,
// stated as such.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { candidateBatteryCached } from '@/test/experiment/relativity/candidate-knit-battery'
import { tokenStoreTransportCached } from '@/test/experiment/relativity/token-store-transport'
import { threeBodyLeakCached } from '@/test/experiment/relativity/three-body-leak'

type Row = { property: string; committed: string; candidate: string; source: string; trade: 'gain' | 'loss' | 'same' | 'open' }

export default experiment({
  id: 'relativity/candidate-trade-table',
  code: 'E-RLT-0073',
  title:
    'the candidate knit does not work with everything, fail: over 21 properties against the committed and combined knit it gains 6 (all 1,152 coin maps, an energy law, spontaneous rather than explicit breaking, 48 of 48 free lone vibes, the one omega, isotropic husk transport), loses 2 (6 of 14 quantum gates unreadable because its vacuum holds no meeting, no handedness), leaves 3 open (a bounded 82-trit wake, CHSH 2.361 on matter only, 15 of 16 A2 planes split on the hot vacuum), and against H newly fails 10 battery gates and newly passes none',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const battery = candidateBatteryCached()
    const transport = tokenStoreTransportCached()
    const leak = threeBodyLeakCached()
    const b = battery.metrics
    const t = transport.metrics
    const l = leak.metrics
    const n = (x: number | undefined, digits = 0): string => (x === undefined || !Number.isFinite(x) ? 'none read' : digits > 0 ? x.toFixed(digits) : x.toLocaleString('en-US'))
    const periods = (prefix: string): string => [1, 2, 3, 4].map(p => n(b[`${prefix}Period${p}`])).join(', ')
    const rows: Row[] = [
      { property: 'exact symmetry of the rule (coin maps kept)', committed: 'committed {I, -I} (E-RLT-0045); H keeps 2 forward entries, no reflection (E-FRC-0159)', candidate: `${n(b.coinMapsKept)} of 1,152, ${n(b.orientationReversingKept)} of ${n(b.orientationReversing)} orientation-reversing (E-RLT-0067, E-RLT-0070)`, source: 'E-RLT-0045, E-FRC-0159, E-RLT-0067, E-RLT-0070', trade: 'gain' },
      { property: 'CPT', committed: 'yes, mirror phase 23 (E-FRC-0159)', candidate: `yes, collision level (${n(b.hot_cptFailures)} failures in ${n(b.hot_cptCases)}), box level 0 failures (E-RLT-0067)`, source: 'E-FRC-0159, E-RLT-0067, E-RLT-0070', trade: 'same' },
      { property: 'exact reversal', committed: 'yes (E-FRC-0159 box, dock)', candidate: `yes (box ${b.hot_boxReverses ? 'exact' : 'broken'}, E-RLT-0067 with open tokens)`, source: 'E-FRC-0159, E-RLT-0067, E-RLT-0070', trade: 'same' },
      { property: 'charge, momentum', committed: 'kept (H momentum drift 0); lone steering breaks P (HFL drift 35)', candidate: `kept (drift ${n(b.hot_pDrift)})`, source: 'E-FRC-0159, E-RLT-0070', trade: 'same' },
      { property: 'energy law', committed: 'none registered for the turning weave (the vacuum makes vibes, the count is not kept)', candidate: 'E = count + 2 sum |tau| exact (E-RLT-0064, E-RLT-0067)', source: 'E-RLT-0064, E-RLT-0067', trade: 'gain' },
      { property: 'pair creation', committed: 'yes, the period-24 condensate (E-FRC-0143)', candidate: 'yes, from the oriented store (1,994 made, 1,861 unmade in 3,888 dock-beats, E-RLT-0067)', source: 'E-FRC-0143, E-RLT-0067', trade: 'same' },
      { property: 'clocking vacuum', committed: 'period 24, one condensate, 2 lines empty (E-FRC-0143, H)', candidate: `hot vacuum period ${n(b.hot_vacuumPeriod)} (store negates), 3^12 vacua per dock, cold vacuum still (period ${n(b.cold_vacuumPeriod)}) (E-RLT-0069, E-RLT-0070)`, source: 'E-FRC-0143, E-RLT-0069, E-RLT-0070', trade: 'same' },
      { property: 'vacuum symmetry', committed: 'the rule breaks SU(2) explicitly, the vacuum keeps only U(1) (E-FRC-0143)', candidate: 'the rule keeps W(F4); the hot vacuum breaks it spontaneously to the diagram S3 (order 6), a flat band, no Goldstone (E-RLT-0069)', source: 'E-FRC-0143, E-RLT-0069', trade: 'gain' },
      { property: 'free lone vibes on the vacuum', committed: '2 of 48 (the leading ends of the 2 empty lines, E-FRC-0143); travel 9 of 24 at full speed', candidate: `${n((b.hot_straightLoves ?? 0) + (b.hot_straightFears ?? 0))} of 48 straight; travel ${n(b.hot_travelFullSpeed)} of 24 at full speed`, source: 'E-FRC-0143, E-FRC-0159, E-RLT-0070', trade: 'gain' },
      { property: 'dressing of a lone vibe, side 9, per period (trits; vibes)', committed: 'committed love 33, 160, 565, 1,508; H 33, 133, 369, 900 (fear fails its gate, 33 against 27)', candidate: `${periods('hot_side9Love')}; vibes ${periods('hot_side9LoveVibes')} (the store wake)`, source: 'E-FRC-0159, E-RLT-0070', trade: 'open' },
      { property: 'held color', committed: 'no leak on the box (H)', candidate: `0 of 3,888 dock-beats (E-RLT-0067); box leaks ${n(b.hot_boxColorLeaks)}`, source: 'E-FRC-0159, E-RLT-0067, E-RLT-0070', trade: 'same' },
      { property: 'role covariance with open tokens', committed: 'frame change commutes (H, E-SPN-0063)', candidate: '0 whole and 0 classical mismatches over 7 pairs x 480 beats (E-RLT-0067)', source: 'E-SPN-0063, E-RLT-0067', trade: 'same' },
      { property: 'token signs at meetings', committed: '0 flips on dock 0 (H)', candidate: `0 of 308,765 meetings (E-RLT-0067); dock 0: ${n(b.on_dockSignFlips)} flips in ${n(b.on_dockMeetings)} meetings`, source: 'E-FRC-0159, E-RLT-0067, E-RLT-0070', trade: 'same' },
      { property: 'fermion number', committed: '831 of 831 meetings with the comoving beat (E-SPN-0063)', candidate: '126 of 126 (E-RLT-0067)', source: 'E-SPN-0063, E-RLT-0067', trade: 'same' },
      { property: 'one omega (fixed-point-free order-3 coin maps kept)', committed: '0 in every knit of the repo (E-MTH-0012)', candidate: '48 (E-RLT-0064)', source: 'E-MTH-0012, E-RLT-0064', trade: 'gain' },
      { property: 'husk transport', committed: 'anisotropic at leading order; no schedule of the couple architecture restores it (E-RLT-0045, E-RLT-0048)', candidate: `charge ${n(t.candidate_husk_charge_slopeLongestThree, 2)} over the resolved rungs (five-rung fit ${n(t.candidate_husk_charge_exponent, 2)} at the rounding floor), trace ${n(t.candidate_husk_trace_exponent, 2)}, sound ${n(t.candidate_husk_sound_exponent, 2)}, shear ${n(t.candidate_husk_shear_exponent, 2)} (E-RLT-0071)`, source: 'E-RLT-0045, E-RLT-0048, E-RLT-0071', trade: 'gain' },
      { property: 'the hot vacuum in the husk transport of a gas', committed: 'not applicable', candidate: `no leading-order leak from rho 1/64 to 0.7 (the charge anisotropy falls as k^${n(l['rho0p7_oriented_chargeSlopeInK'], 2)} at 0.7); collisions see it at rho^2, the store at order 1 (E-RLT-0072)`, source: 'E-RLT-0072', trade: 'same' },
      { property: 'quantum gates (E-QTM-0109 on E-FRC-0159)', committed: 'H 14 of 14 with the fear beat on', candidate: `${14 - (b.quantumGatesFailingOn ?? 0)} of 14; ${n(b.quantumUnevaluable)} have no vacuum pair to read (the hot vacuum holds no meeting)`, source: 'E-FRC-0159, E-RLT-0070', trade: (b.quantumGatesFailingOn ?? 0) > 0 ? 'loss' : 'same' },
      { property: 'CHSH one beat after the first meeting', committed: 'H 2.552 on the vacuum pair', candidate: `no vacuum pair; on the matter pair ${n(b.on_matterChsh, 3)} (stand-in ${n(b.on_matterChshStandIn, 3)})`, source: 'E-FRC-0159, E-RLT-0070', trade: (b.on_matterChsh ?? 0) > 2 ? 'open' : 'loss' },
      { property: 'handedness (E-FRC-0142)', committed: 'committed 4.12 and 4.73 times self-dual; H 1.00 (already lost)', candidate: `none: all orientation-reversing coin maps kept, lone response self-dual ${n(b.loneResponseSelfDualHot, 3)}, anti-self-dual ${n(b.loneResponseAntiSelfDualHot, 3)}`, source: 'E-FRC-0142, E-FRC-0159, E-RLT-0070', trade: 'loss' },
      { property: 'generations (E-FRC-0140/0141)', committed: 'committed splits all three copies on 16 of 16 A2 planes; H splits 16', candidate: `${n(b.generationPlanesSplit)} of ${n(b.generationPlanes)} planes split on the hot vacuum, ${n(b.generationPlanesSplitCold)} on the cold; ${n(b.generationPlanesKeepingHot)} planes' triality keeps the hot vacuum`, source: 'E-FRC-0141, E-FRC-0159, E-RLT-0070', trade: 'open' },
    ]
    const x = [battery.status, transport.status, leak.status].every(s => ['pass', 'fail', 'partial'].includes(s)) && rows.every(r => r.committed.length > 0 && r.candidate.length > 0 && r.source.length > 0)
    const condition = (b.worksWithEverything ?? 0) === 1
    const status = x ? (condition ? 'pass' : 'fail') : 'partial'
    const count = (trade: Row['trade']): number => rows.filter(r => r.trade === trade).length
    const table = rows.map(r => `${r.property}: committed/combined ${r.committed} | candidate ${r.candidate} [${r.trade}; ${r.source}]`).join(' || ')

    return verdict({
      status,
      claim: `the candidate ${condition ? 'meets' : 'does not meet'} the "works with everything" condition: against the combined knit H it newly fails ${battery.newlyFailing.length} gates (${battery.newlyFailing.join(', ') || 'none'}), ${battery.unevaluable.length} of them quantum gates it cannot evaluate because its vacuum holds no meeting, and newly passes ${battery.newlyPassing.length} (${battery.newlyPassing.join(', ') || 'none'}); over ${rows.length} properties it gains ${count('gain')} (W(F4), energy, spontaneous rather than explicit breaking, free lone vibes, the one omega, isotropic husk transport), loses ${count('loss')} and leaves ${count('open')} open`,
      metrics: {
        worksWithEverything: condition ? 1 : 0,
        rows: rows.length,
        gains: count('gain'),
        losses: count('loss'),
        same: count('same'),
        open: count('open'),
        newlyFailing: battery.newlyFailing.length,
        newlyPassing: battery.newlyPassing.length,
        unevaluable: battery.unevaluable.length,
        seconds: (Date.now() - started) / 1000,
      },
      notes: `L2. Gates: X ${x}, C ${condition}. Statuses read: E-RLT-0070 ${battery.status}, E-RLT-0071 ${transport.status}, E-RLT-0072 ${leak.status}. THE TABLE: ${table}.`,
    })
  },
})
