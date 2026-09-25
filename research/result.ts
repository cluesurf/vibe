// The results, each by its code, R-<arena>-<NNNN>. Each stands alone: a reader can meet one without
// accepting any other.
//
// Every number is from a run of the named experiment at seed 1 on this branch, or quoted from
// note/experiment/gauge/strong-force.md where the reference says "strong-force note". `checks`
// are what `pnpm result reproduce <code>` holds each verdict to, so a record cannot drift from
// the code without the reproduce command saying so.
//
// The claim is in standard terms. The program's own words appear only in `program`, which
// every projection prints last.

import type { Criterion, Gate, Result } from './type'

const PUBLIC =
  'the experiment files and `pnpm result reproduce` are public'

const NOT_RUN = 'the systematic literature pass has not been run'

const NO_SKEPTIC = 'no one outside the program has reviewed it'

const NOT_REPRODUCED = 'no one outside the program has rerun it'

// A reproduction fails the same criteria for the same reasons.
function reproductionGate(overrides: Partial<Gate>): Gate {
  const base: Gate = {
    prior_art_reviewed: { mark: 'fail', reason: NOT_RUN },
    novel: {
      mark: 'fail',
      reason:
        'it reproduces published values, which is the point of it',
    },
    derived: {
      mark: 'fail',
      reason:
        'rests on imported methods and on none of the five assumptions',
    },
    quantitative: { mark: 'pass', reason: 'every row is a number' },
    differentiating: {
      mark: 'fail',
      reason: 'it matches standard physics by construction',
    },
    falsifiable: {
      mark: 'fail',
      reason:
        'no observation of nature bears on the program through it',
    },
    auditable: { mark: 'pass', reason: PUBLIC },
    skeptic_reviewed: { mark: 'fail', reason: NO_SKEPTIC },
    independently_reproduced: { mark: 'fail', reason: NOT_REPRODUCED },
    interesting: {
      mark: 'unknown',
      reason: 'not yet asked of anyone in the field',
    },
  }

  return { ...base, ...overrides }
}

// A measurement of the committed rule.
function measurementGate(overrides: Partial<Gate>): Gate {
  const base: Gate = {
    prior_art_reviewed: { mark: 'fail', reason: NOT_RUN },
    novel: {
      mark: 'pass',
      reason: 'a measurement of a rule no one else has studied',
    },
    derived: {
      mark: 'pass',
      reason:
        'run through the committed rule, by exhaustive enumeration',
    },
    quantitative: { mark: 'pass', reason: 'exact integers' },
    differentiating: {
      mark: 'fail',
      reason:
        'it differs from nature against the program, which is not a prediction',
    },
    falsifiable: {
      mark: 'fail',
      reason: 'decided by computation about a rule, not by observation',
    },
    auditable: { mark: 'pass', reason: PUBLIC },
    skeptic_reviewed: { mark: 'fail', reason: NO_SKEPTIC },
    independently_reproduced: { mark: 'fail', reason: NOT_REPRODUCED },
    interesting: {
      mark: 'pass',
      reason: 'as evidence the program reports against itself',
    },
  }

  return { ...base, ...overrides }
}

const FIRST = {
  version: '1.0.0',
  date: '2026-09-25',
  change: 'first record',
}

const NO_OUTPUTS = {
  technical_note: null,
  one_page: null,
  browser_run: null,
  video: null,
}

const QCD_IMPORTS = ['I1', 'I2']

export const RESULTS: Result[] = [
  {
    code: 'R-FRC-0001',
    title:
      'SU(3) lattice gauge theory rebuilt from scratch, against published values',
    subject: 'lattice gauge theory',
    sentence:
      'An independent lattice code reproduces the standard quenched and dynamical SU(3) results, each against a published value or a computed control, with every pull within $2\\sigma$.',
    claim:
      'A lattice gauge theory code written from scratch reproduces, at $\\beta = 5.7$ to $5.9$, confinement, the gluon and color count, the static potential and the Sommer scale, the scalar glueball, the deconfinement transition, chiral symmetry breaking, the pion as a Goldstone boson, and string breaking by dynamical quarks.',
    headline: {
      value: '5 of 5',
      label: 'quantities with a published error within 2σ',
    },
    category: 'reproduction',
    status: ['simulated'],
    depth: 'L2',
    audience: 'lattice gauge theorists, computational physics',
    question:
      'Does an independent codebase get known strong-force physics right, with controls that could fail?',
    answer:
      'Yes. Thirteen experiments rebuild the standard SU(3) results, and every quantity with a published error lands within $2\\sigma$ of it.',
    importance:
      'It checks the measuring apparatus before anything it says about new physics is read. It says nothing about the program itself, which rests on none of the same assumptions.',
    limits: [
      'nothing about the committed rule. It rests on none of the five assumptions',
      'one or two couplings in 4D. Only 3D SU(2) is extrapolated to the continuum',
      '$T_c r_0$ uses the published $r_0/a$ at the measured $\\beta_c$, not an independently measured $r_0$',
      'the $J$ parameter and $m_N/m_\\rho$ (E-FRC-0091) are printed but not gated. 12 configurations cannot decide them',
    ],
    equations: [
      'Wilson action: $S = \\beta \\sum_P \\left(1 - \\tfrac{1}{N}\\operatorname{Re}\\operatorname{Tr} U_P\\right)$',
      'Creutz ratio, which levels off at the string tension under an area law: $\\chi(R,T) = -\\ln \\dfrac{W(R,T)\\,W(R-1,T-1)}{W(R,T-1)\\,W(R-1,T)}$',
      'Sommer scale: $r_0^2 F(r_0) = 1.65$',
      'pull (D1): $(\\text{measured} - \\text{published})/\\sigma$',
    ],
    measurements: [
      {
        quantity:
          'Creutz ratio $\\chi(3,3)/\\chi(2,2)$, SU(3) at $\\beta = 5.7$',
        measured: '0.76 ± 0.03 (area law)',
        reference:
          'U(1) 0.32 and weak-coupling SU(3) 0.36, both Coulombic (strong-force note)',
        code: 'E-FRC-0080',
      },
      {
        quantity:
          'gauge fields by equipartition, colors, cubic invariant',
        measured: '8.006 fields, N = 3.010, 0.2497',
        reference:
          'predicted 8, 3, 1/4. SU(2) 3.017 and U(1) 1.007 fields (run)',
        code: 'E-FRC-0081',
      },
      {
        quantity:
          'string tension and Coulomb coefficient, $\\beta = 5.7$',
        measured: '$\\sigma a^2$ = 0.125 ± 0.021, $e$ = 0.34 ± 0.05',
        reference:
          '$e$ against $\\pi/12 = 0.262$, pull 1.7. Photon $\\sigma$ = 0.0002 ± 0.0006 (strong-force note)',
        code: 'E-FRC-0087',
      },
      {
        quantity: 'Sommer scale $r_0/a$ at $\\beta = 5.7$',
        measured: '3.23 ± 0.21',
        reference: 'Necco-Sommer 2.94, pull 1.4 (strong-force note)',
        code: 'E-FRC-0088',
      },
      {
        quantity: 'scalar glueball $m r_0$',
        measured: '4.05 ± 0.50',
        reference:
          'continuum 4.21 ± 0.11, Morningstar and Peardon (package gauge readme)',
        code: 'E-FRC-0089',
      },
      {
        quantity:
          '3D SU(2) $\\sqrt{\\sigma}/g^2$, extrapolated to the continuum',
        measured: '0.332 ± 0.06',
        reference:
          'continuum 0.3353, Teper, pull -0.06 (strong-force note)',
        code: 'E-FRC-0007',
      },
      {
        quantity: 'deconfinement $\\beta_c$, $N_t = 2$, $8^3$ box',
        measured: 'bracket [5.1000, 5.1625]',
        reference:
          'published 5.09. Center-sector phase error 0.0009. Confined loop volume ratio 1.533 against 1.540 (run)',
        code: 'E-FRC-0082',
      },
      {
        quantity:
          'deconfinement $\\beta_c$, $N_t = 4$, infinite volume',
        measured: '5.6865 ± 0.0093',
        reference:
          'published 5.6925. $T_c r_0$ = 0.712 against the published $N_t = 4$ value 0.722, about 281 MeV (run)',
        code: 'E-FRC-0098',
      },
      {
        quantity:
          'chiral condensate $\\Sigma(0)$, below and above $T_c$',
        measured: '0.286 ± 0.028 below, 0.00014 above',
        reference:
          'the estimator reproduces the free condensate to 3.6e-14 (strong-force note)',
        code: 'E-FRC-0086',
      },
      {
        quantity: '$d \\ln m_\\pi / d \\ln m_q$',
        measured: 'near 0.44',
        reference:
          'Goldstone expects 0.5. Gluons off 0.97 (strong-force note)',
        code: 'E-FRC-0084',
      },
      {
        quantity: 'Polyakov loop with dynamical quarks, 4^3 and 6^3',
        measured:
          '$\\operatorname{Re} P$ = 0.412 and 0.394, $\\ln\\det$ = −60 under a center rotation',
        reference:
          'quenched falls 1.79 against 1.84 for zero. Hopping expansion agrees to 0.06 percent (strong-force note)',
        code: 'E-FRC-0090',
      },
    ],
    figure: {
      form: 'pulls',
      caption:
        'Reproduction. Every quantity with a published value and error, as (measured − published) / σ. No fitted parameters. All five lie within 2σ.',
      rows: [
        {
          label: '3D SU(2) string tension',
          pull: -0.06,
          source: 'E-FRC-0007',
        },
        {
          label: 'Coulomb coefficient against π/12',
          pull: 1.7,
          source: 'E-FRC-0087',
        },
        {
          label: 'Sommer scale r₀/a, β = 5.7',
          pull: 1.4,
          source: 'E-FRC-0088',
        },
        {
          label: 'scalar glueball m r₀',
          pull: -0.32,
          source: 'E-FRC-0089',
        },
        {
          label: 'critical β, deconfinement at Nₜ = 4',
          pull: -0.65,
          source: 'E-FRC-0098',
        },
      ],
    },
    comparison: {
      standard:
        'the published lattice values: Necco-Sommer, Morningstar-Peardon, Teper, the SU(3) thermodynamics literature',
      vibe: 'the same values within $2\\sigma$, from an independent codebase',
      difference: 'none, by design',
    },
    closest: [
      {
        work: 'Wilson 1974. Creutz 1980',
        established:
          'confinement in lattice gauge theory, and its Monte Carlo study',
        difference: 'none in the physics',
      },
      {
        work: 'Necco and Sommer 2002. Morningstar and Peardon 1999. Teper 1998',
        established: 'the reference values used here',
        difference:
          'none in the physics. One seeded codebase with a stated control per claim',
      },
    ],
    literature: null,
    gate: reproductionGate({
      interesting: {
        mark: 'unknown',
        reason: 'as a tool, possibly. As physics, no',
      },
    }),
    failure: [
      'a rerun at seed 1 that gives a different number: the code is not reproducible',
      'a pull beyond $3\\sigma$ at a second lattice spacing: a bug, or a match that held at one spacing by luck',
      'a control (U(1), gluons off, the free quark) failing its exact value: the estimator is wrong',
    ],
    novelty: 'known',
    free_parameters: 0,
    fitted: false,
    known_before: true,
    falsified_by:
      'a reproduction failure, or a pull beyond $3\\sigma$ at a second spacing',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: [],
    experiments: [
      {
        code: 'E-FRC-0080',
        file: 'test/experiment/gauge/su3-area-law.ts',
        depends: QCD_IMPORTS,
      },
      {
        code: 'E-FRC-0081',
        file: 'test/experiment/gauge/gluon-count.ts',
        depends: QCD_IMPORTS,
      },
      {
        code: 'E-FRC-0087',
        file: 'test/experiment/gauge/static-quarks.ts',
        depends: QCD_IMPORTS,
      },
      {
        code: 'E-FRC-0088',
        file: 'test/experiment/gauge/static-quarks.ts',
        depends: QCD_IMPORTS,
      },
      {
        code: 'E-FRC-0089',
        file: 'test/experiment/gauge/static-quarks.ts',
        depends: QCD_IMPORTS,
      },
      {
        code: 'E-FRC-0007',
        file: 'test/experiment/gauge/confinement.ts',
        depends: QCD_IMPORTS,
      },
      {
        code: 'E-FRC-0082',
        file: 'test/experiment/gauge/su3-deconfinement.ts',
        depends: QCD_IMPORTS,
      },
      {
        code: 'E-FRC-0098',
        file: 'test/experiment/gauge/su3-deconfinement.ts',
        depends: QCD_IMPORTS,
      },
      {
        code: 'E-FRC-0086',
        file: 'test/experiment/gauge/chiral-condensate.ts',
        depends: [...QCD_IMPORTS, 'I3'],
      },
      {
        code: 'E-FRC-0084',
        file: 'test/experiment/gauge/quenched-hadrons.ts',
        depends: [...QCD_IMPORTS, 'I3'],
      },
      {
        code: 'E-FRC-0085',
        file: 'test/experiment/gauge/quenched-hadrons.ts',
        depends: [...QCD_IMPORTS, 'I3'],
      },
      {
        code: 'E-FRC-0091',
        file: 'test/experiment/gauge/quenched-hadrons.ts',
        depends: [...QCD_IMPORTS, 'I3'],
      },
      {
        code: 'E-FRC-0090',
        file: 'test/experiment/gauge/dynamical-quarks.ts',
        depends: [...QCD_IMPORTS, 'I3'],
      },
    ],
    checks: [
      {
        code: 'E-FRC-0080',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0081',
        metric: 'su3FieldCount',
        from: 'metrics',
        expected: 8,
        tolerance: 0.1,
      },
      {
        code: 'E-FRC-0081',
        metric: 'colors',
        from: 'metrics',
        expected: 3,
        tolerance: 0.1,
      },
      {
        code: 'E-FRC-0081',
        metric: 'su3ThirdCumulant',
        from: 'metrics',
        expected: 0.25,
        tolerance: 0.01,
      },
      {
        code: 'E-FRC-0081',
        metric: 'su2FieldCount',
        from: 'control',
        expected: 3,
        tolerance: 0.1,
      },
      {
        code: 'E-FRC-0087',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0088',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0089',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0007',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0082',
        metric: 'criticalBetaLow',
        from: 'metrics',
        expected: 5.1,
        tolerance: 0.0001,
      },
      {
        code: 'E-FRC-0082',
        metric: 'criticalBetaHigh',
        from: 'metrics',
        expected: 5.1625,
        tolerance: 0.0001,
      },
      {
        code: 'E-FRC-0098',
        metric: 'criticalBetaInfiniteVolume',
        from: 'metrics',
        expected: 5.6865,
        tolerance: 0.0001,
      },
      {
        code: 'E-FRC-0098',
        metric: 'tcR0',
        from: 'metrics',
        expected: 0.7118,
        tolerance: 0.0001,
      },
      {
        code: 'E-FRC-0098',
        metric: 'publishedCriticalBeta',
        from: 'control',
        expected: 5.6925,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0086',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0084',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0085',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0091',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0090',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
    ],
    notes: ['note/experiment/gauge/strong-force.md'],
    problem: 'OP-10',
    candidate: null,
    paper:
      'planned paper 1, the testbed paper, as its central result family',
    program:
      'The strong-force arc of the vibe program (v1.5.0). It checks the measuring apparatus. It does not test the committed rule, which is R-FRC-0003.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-FRC-0002',
    title:
      'Deterministic reversible SU(3) dynamics reproduces the thermal ensemble, with no random numbers',
    subject: 'statistical mechanics',
    sentence:
      'Hamiltonian SU(3) dynamics that draws no random number thermalizes, and matches the random heatbath at the coupling its own Gauss-law temperature predicts.',
    claim:
      'Hamiltonian SU(3) gauge dynamics, integrated with a fourth-order symmetric scheme from a fixed plane-wave start and drawing no random number, thermalizes, and at the coupling predicted by its kinetic temperature counted over the degrees of freedom the Gauss law leaves free, it matches the heatbath ensemble on the plaquette and the area-law Creutz ratio.',
    headline: {
      value: '0.5504',
      label: "plaquette, against the heatbath's 0.5497",
    },
    category: 'reproduction',
    status: ['simulated'],
    depth: 'L2',
    audience:
      "statistical physics, microcanonical lattice gauge theory, 't Hooft's cellular-automaton interpretation, reversible computing",
    question:
      'Does thermal lattice physics need random numbers, or does deterministic reversible dynamics reach the same ensemble?',
    answer:
      "It reaches the same ensemble. The kurtosis goes from 1.5 to 2.997, the eight colors equipartition to 0.0005, and the plaquette and Creutz ratio match the heatbath at the predicted $\\beta' = 5.699$.",
    importance:
      'A sampler is a shortcut, not a necessity. The Gauss-law temperature count is what makes the prediction right: the naive count is excluded at $306\\sigma$.',
    limits: [
      'the dynamics is Hamiltonian SU(3), not the committed rule. The rule carries no SU(3) (R-FRC-0003)',
      'one structured start',
      'the $\\mathbb{Z}_3$ automaton (E-FRC-0099) freezes at low energy, the known Q2R non-ergodicity, and needs a kinetic variable there',
    ],
    equations: [
      'Wilson coupling: $\\beta = 2N/g^2$',
      "$\\beta'$ is predicted from the kinetic temperature, with the degrees of freedom counted after the Gauss-law constraints are removed. The exact count is in the experiment file",
    ],
    measurements: [
      {
        quantity: 'momentum kurtosis',
        measured: '1.5 at the start, 2.997 after',
        reference: '3 for a thermal Gaussian (strong-force note)',
        code: 'E-FRC-0092',
      },
      {
        quantity: 'share of kinetic energy per color',
        measured: '1/8 each, to 0.0005',
        reference:
          'equipartition. An abelian start never reaches the charged colors (strong-force note)',
        code: 'E-FRC-0092',
      },
      {
        quantity: "predicted coupling $\\beta'$",
        measured: '5.699',
        reference:
          'the naive temperature count is excluded at $306\\sigma$ (strong-force note)',
        code: 'E-FRC-0092',
      },
      {
        quantity:
          "plaquette, deterministic against heatbath at $\\beta'$",
        measured: '0.5504',
        reference: '0.5497 (strong-force note)',
        code: 'E-FRC-0092',
      },
      {
        quantity:
          'Creutz ratio $\\chi(2,2)$, deterministic against heatbath',
        measured: '0.369',
        reference: '0.371 (strong-force note)',
        code: 'E-FRC-0092',
      },
      {
        quantity:
          '$\\mathbb{Z}_3$ reversible automaton, hot-phase area exponent',
        measured: '2.0014 ± 0.0090',
        reference:
          'heatbath 2.0015 at effective $\\beta$ = 0.5602. Energy drift 0 (run)',
        code: 'E-FRC-0099',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Reproduction. Deterministic reversible dynamics against the random heatbath at the same coupling. No fitted parameters: the coupling is predicted, not tuned.',
      measured: 'deterministic, no random numbers',
      control: 'heatbath Monte Carlo',
      rows: [
        { label: 'plaquette', measured: 0.5504, control: 0.5497 },
        {
          label: 'Creutz ratio χ(2,2)',
          measured: 0.369,
          control: 0.371,
        },
        {
          label: 'ℤ₃ area exponent',
          measured: 2.0014,
          control: 2.0015,
        },
      ],
    },
    comparison: {
      standard: 'equilibrium reached by sampling the Boltzmann weight',
      vibe: 'the same equilibrium from deterministic reversible dynamics',
      difference:
        'none in the equilibrium. The difference is in what reaching it needs',
    },
    closest: [
      {
        work: 'Callaway and Rahman 1982',
        established:
          'microcanonical lattice gauge theory by molecular dynamics',
        difference:
          'the thermalization is theirs. The Gauss-law temperature count and the fourth-order integrator removing a 0.9 percent bias are the stated additions',
      },
      {
        work: 'Vichniac 1984. Pomeau 1984',
        established:
          'Q2R, a reversible energy-conserving cellular automaton',
        difference: 'E-FRC-0099 is its Z3 form on links',
      },
    ],
    literature: null,
    gate: reproductionGate({
      novel: {
        mark: 'unknown',
        reason:
          'microcanonical gauge dynamics is established. Whether the Gauss-law count has been stated this way is not searched',
      },
      interesting: {
        mark: 'unknown',
        reason:
          'to the question of randomness at the base, plausibly. Not yet asked',
      },
    }),
    failure: [
      'a deterministic and a heatbath plaquette that disagree beyond their errors at a second coupling',
      'the Gauss-law temperature failing where the naive one passes',
      'a dependence on the step size at fourth order',
    ],
    novelty: 'uncertain',
    free_parameters: 0,
    fitted: false,
    known_before: true,
    falsified_by:
      'a disagreement with the heatbath at a second coupling',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: [],
    experiments: [
      {
        code: 'E-FRC-0092',
        file: 'test/experiment/gauge/deterministic-thermalization.ts',
        depends: ['I1', 'I4'],
      },
      {
        code: 'E-FRC-0099',
        file: 'test/experiment/gauge/center-automaton.ts',
        depends: ['I2'],
      },
    ],
    checks: [
      {
        code: 'E-FRC-0092',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0099',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
    ],
    notes: ['note/experiment/gauge/strong-force.md'],
    problem: 'OP-03',
    candidate: null,
    paper: 'planned paper 1, the testbed paper',
    program:
      'The program asks for no randomness at the base. This shows thermal physics does not need it, in a model the rule has not yet produced.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-FRC-0003',
    title: 'The committed rule does not carry SU(3) color',
    subject: 'symmetry',
    sentence:
      'A deterministic reversible lattice gas on the {3,4,3,4} honeycomb keeps 2 of the 9 generators of U(3), and no symmetry of order three, at any scale tested.',
    claim:
      'A deterministic reversible charge-conserving lattice gas on the {3,4,3,4} honeycomb, with ternary values per direction and a fixed pair-collision table, keeps exactly 2 of the 9 generators of U(3) (the charge and the overall phase), keeps no element of order three among 995,328 candidate symmetries, has no collision block joining three lines, and recovers none of it under coarse-graining.',
    headline: {
      value: '2 of 9',
      label: 'generators of U(3) kept by the rule',
    },
    category: 'measurement',
    status: ['negative', 'derived'],
    depth: 'L3 and L2',
    audience:
      'anyone judging whether the program reports against itself',
    question:
      'Does the committed rule carry the symmetry of the strong force?',
    answer:
      'No. It keeps the charge U(1) and the phase and nothing else of U(3), no $\\mathbb{Z}_3$ and no $S_3$, and coarse-graining brings none of it back.',
    importance:
      'The program measured the absence of the strong force in its own rule, exactly, and named what would have to be added. Adding a sixth ingredient is not emergence.',
    limits: [
      'the committed rule only. A different rule, or a sixth ingredient, is not excluded',
      'coarse variables other than block populations, spread three-tone starts, and windows beyond 8 beats are untested',
      'time-reversed and cell-dependent symmetries are excluded by design',
    ],
    equations: [
      'the commutant of the rule in $\\mathfrak{u}(3)$, over all 24 beats: $\\dim\\{X \\in \\mathfrak{u}(3) : [X, B_t] = 0,\\ t = 1, \\dots, 24\\} = 2$',
      'L1 (Schur-Weyl): the U(3)-covariant maps on two lines are spanned by the identity and the swap, $\\operatorname{End}_{U(3)}(\\mathbb{C}^3 \\otimes \\mathbb{C}^3) = \\operatorname{span}\\{1, P\\}$',
    ],
    measurements: [
      {
        quantity:
          '$\\mathfrak{u}(3)$ generators commuting with all 24 beats',
        measured: '2 of 9',
        reference: 'identity and swap maps keep 9 (run)',
        code: 'E-FRC-0093',
      },
      {
        quantity:
          'tone relabellings ($S_3$ on each line end) commuting with the rule, sides 3 and 5',
        measured: '1 of 36, the identity',
        reference: 'pure streaming keeps 36 (run)',
        code: 'E-FRC-0093',
      },
      {
        quantity: 'zero-sum triangles inside one interaction block',
        measured: '0 of 32',
        reference: 'a whole-cell collision puts 32 of 32 inside (run)',
        code: 'E-FRC-0094',
      },
      {
        quantity: 'exact symmetries of the 24-beat schedule',
        measured: '1 of 995,328, none of order three',
        reference:
          'streaming keeps 1,152, 640 of order divisible by three. The previous knit 12 (run)',
        code: 'E-FRC-0095',
      },
      {
        quantity:
          'breaking kept at the whole-mesh scale, relabellings that move 0',
        measured: '84 to 88 percent',
        reference: 'streaming 0 at every scale (registry)',
        code: 'E-FRC-0096',
      },
      {
        quantity:
          'third tones closing a triangle that produce a joint effect within 8 beats',
        measured: '0 of 32',
        reference:
          'other third tones 57 of 672. Sticky reflection couples every triple (registry)',
        code: 'E-FRC-0097',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Measurement. What the committed rule keeps, against a control that keeps everything. Each row is scaled to its own control.',
      measured: 'the committed rule',
      control: 'control: streaming, or a whole-cell collision',
      rows: [
        { label: '𝔲(3) generators kept', measured: 2, control: 9 },
        { label: 'tone relabellings kept', measured: 1, control: 36 },
        { label: 'triangles inside a block', measured: 0, control: 32 },
        {
          label: 'exact schedule symmetries',
          measured: 1,
          control: 1152,
        },
      ],
    },
    comparison: {
      standard:
        'QCD has an exact SU(3) color symmetry with a three-line vertex',
      vibe: 'the rule keeps U(1) charge and the phase, and nothing of SU(3)',
      difference:
        'a difference against the program: the rule does not produce what nature has',
    },
    closest: [
      {
        work: 'Schur-Weyl duality',
        established:
          'the only U(3)-covariant maps on two lines are the identity and the swap',
        difference: 'standard. The measurement applies it to one rule',
      },
      {
        work: 'Dixon. Furey',
        established: 'color from the octonions, algebraically',
        difference:
          'those are algebraic. This asks whether a dynamics carries it, and finds that it does not',
      },
    ],
    literature: null,
    gate: measurementGate({}),
    failure: [
      'a symmetry of order three that the enumeration of 995,328 candidates missed',
      'a coarse variable other than block populations (currents, correlations) showing an S3 at long distance',
      'the block decomposition failing to reproduce the collision on some state, which would void E-FRC-0094',
    ],
    novelty: 'apparently_new',
    free_parameters: 0,
    fitted: false,
    known_before: false,
    falsified_by:
      'a counterexample: an order-three symmetry of the committed schedule',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: ['R-FND-0001', 'L1'],
    experiments: [
      {
        code: 'E-FRC-0093',
        file: 'test/experiment/gauge/rule-tone-symmetry.ts',
        depends: ['A1', 'A2', 'A3', 'A4', 'A5', 'L1'],
      },
      {
        code: 'E-FRC-0094',
        file: 'test/experiment/gauge/rule-no-triplet-vertex.ts',
        depends: ['A1', 'A2', 'A3'],
      },
      {
        code: 'E-FRC-0095',
        file: 'test/experiment/gauge/rule-coin-symmetry.ts',
        depends: ['A1', 'A2', 'A3'],
      },
      {
        code: 'E-FRC-0096',
        file: 'test/experiment/gauge/rule-coarse-tone-symmetry.ts',
        depends: ['A1', 'A2', 'A3', 'A4', 'A5'],
      },
      {
        code: 'E-FRC-0097',
        file: 'test/experiment/gauge/rule-triangle-coupling.ts',
        depends: ['A1', 'A2', 'A3', 'A4', 'A5'],
      },
    ],
    checks: [
      {
        code: 'E-FRC-0093',
        metric: 'wholeRuleAlgebraDimension',
        from: 'metrics',
        expected: 2,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0093',
        metric: 'commutingRelabellingsSide3',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0093',
        metric: 'commutingRelabellingsSide5',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0093',
        metric: 'identityAlgebraDimension',
        from: 'control',
        expected: 9,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0093',
        metric: 'streamingCommutingRelabellings',
        from: 'control',
        expected: 36,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0094',
        metric: 'trianglesInsideCommittedBlocks',
        from: 'metrics',
        expected: 0,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0094',
        metric: 'stickyReflectTrianglesInside',
        from: 'control',
        expected: 32,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0095',
        metric: 'candidatesTested',
        from: 'metrics',
        expected: 995328,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0095',
        metric: 'committedSymmetries',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0095',
        metric: 'committedOrderThreeOrMultiple',
        from: 'metrics',
        expected: 0,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0095',
        metric: 'streamingSymmetries',
        from: 'control',
        expected: 1152,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0096',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0097',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
    ],
    notes: ['note/experiment/gauge/su3-from-the-rule.md'],
    problem: 'OP-02',
    candidate: null,
    paper:
      'the framework paper, as its central negative, and the testbed paper, as the reason its QCD is L2',
    program:
      'The knit, run on the D4 mesh, does not carry color. It would take a sixth thing: a three-line vertex on the coin triangles, a tone with amplitudes, and a clock compatible with U(3).',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-FND-0001',
    title: 'The committed rule has no amplitudes',
    subject: 'quantum foundations',
    sentence:
      'The same lattice gas has no quantum single-particle sector: a seeded defect never spreads, and two defects add exactly as sets.',
    claim:
      'The lattice gas has no quantum single-particle sector: its empty state is a global period-three oscillation, a single seeded value is a classical defect of at most two slots that never spreads, and two defects evolve as the exact union of their separate evolutions with zero cross term, while a coined Dirac walk seeded the same way spreads and interferes.',
    headline: {
      value: '0',
      label:
        'cross term between two defects, against 0.357 for a quantum walk',
    },
    category: 'measurement',
    status: ['negative'],
    depth: 'L2',
    audience:
      "quantum foundations, 't Hooft's cellular-automaton interpretation, quantum walks",
    question:
      'Does the committed rule have a quantum sector of its own?',
    answer:
      "No. Its values are integers that add as sets. Thirteen quantum results that were cited as the rule's own dynamics ran a hand-written walk instead.",
    importance:
      'This is the measurement that regraded the quantum arena. Until a layer carrying amplitudes is built on the rule, every walk result is a result about the walk.',
    limits: [
      'the bare rule only. A middle layer carrying amplitudes is not excluded, only not built',
      'side 8 is even, so the mesh is two disconnected lattices and the run covers one component of 2,048 cells',
    ],
    equations: [
      'the empty state under the pair table, period 3: $(0,0) \\to (+1,-1) \\to (-1,+1) \\to (0,0)$',
      'occupation numbers are nonnegative integers, $n \\in \\mathbb{Z}_{\\ge 0}$, so there is no cross term: $n_{a \\cup b} = n_a + n_b$ exactly, where a walk has $|\\psi_a + \\psi_b|^2 \\ne |\\psi_a|^2 + |\\psi_b|^2$',
    ],
    measurements: [
      {
        quantity: 'period of the empty state',
        measured: '3 beats, every slot nonzero at beats 1 and 2',
        reference: 'a coined walk vacuum stays zero (run)',
        code: 'E-FND-0080',
      },
      {
        quantity: 'defect size over 4 beats',
        measured: '2 slots, radius 2',
        reference: 'the walk spreads to 5 sites (run)',
        code: 'E-FND-0080',
      },
      {
        quantity: 'two-defect cross term',
        measured: '0 slots of overlap, exact union',
        reference: 'the walk cross term 0.3573 (run)',
        code: 'E-FND-0080',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Measurement. A seeded defect under the committed rule against a coined Dirac walk, after 4 beats.',
      measured: 'the committed rule',
      control: 'coined Dirac walk',
      rows: [
        {
          label: 'spread after 4 beats',
          measured: 2,
          control: 5,
          unit: 'sites',
        },
        { label: 'two-seed cross term', measured: 0, control: 0.3573 },
      ],
    },
    comparison: {
      standard: 'quantum mechanics: amplitudes superpose and interfere',
      vibe: 'the rule: integer occupations that add as sets',
      difference: 'a difference against the program',
    },
    closest: [
      {
        work: "'t Hooft 2016, The Cellular Automaton Interpretation of Quantum Mechanics",
        established:
          'a program that also starts from a deterministic automaton',
        difference:
          'this measures one specific rule and finds no quantum sector in it',
      },
      {
        work: 'Strauch 2006. Kurzynski 2008',
        established: 'coined walks and the Dirac equation',
        difference:
          'the walk physics is theirs. The finding is that the rule is not a walk',
      },
    ],
    literature: null,
    gate: measurementGate({
      quantitative: {
        mark: 'pass',
        reason: 'exact integers and one control number',
      },
      interesting: {
        mark: 'pass',
        reason: 'as the reason the quantum arena was regraded',
      },
    }),
    failure: [
      'a coarse-grained quantity over many slots or beats that superposes, built on the rule. That would answer this result, not refute it',
      'a defect that spreads beyond two slots on an odd-sided mesh',
    ],
    novelty: 'apparently_new',
    free_parameters: 0,
    fitted: false,
    known_before: false,
    falsified_by:
      'a counterexample: a seeded state whose difference from the vacuum spreads',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: [],
    experiments: [
      {
        code: 'E-FND-0080',
        file: 'test/experiment/foundations/rule-has-no-amplitudes.ts',
        depends: ['A1', 'A2', 'A3', 'A4', 'A5', 'I6'],
      },
    ],
    checks: [
      {
        code: 'E-FND-0080',
        metric: 'vacuumPeriod',
        from: 'metrics',
        expected: 3,
        tolerance: 0,
      },
      {
        code: 'E-FND-0080',
        metric: 'maxDefectSlots',
        from: 'metrics',
        expected: 2,
        tolerance: 0,
      },
      {
        code: 'E-FND-0080',
        metric: 'defectOverlapSlots',
        from: 'metrics',
        expected: 0,
        tolerance: 0,
      },
      {
        code: 'E-FND-0080',
        metric: 'unionExact',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FND-0080',
        metric: 'chargeConserved',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FND-0080',
        metric: 'walkCrossTerm',
        from: 'control',
        expected: 0.3573,
        tolerance: 0.0001,
      },
    ],
    notes: [],
    problem: 'OP-01',
    candidate: null,
    paper: 'the framework paper, in place of its quantum section',
    program:
      'A tone is a classical defect riding on a vacuum that flashes with period three. Every walk result is a result about the walk until a layer between the tones and amplitudes is built.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-MMR-0001',
    title:
      'Search radius that does not grow with memory size on {3,4,3,4}',
    subject: 'network geometry',
    sentence:
      'On the {3,4,3,4} honeycomb the radius a spreading search needs stays at 3 as the memory quadruples, while on a cubic lattice it grows from 12 to 21.',
    claim:
      'On the {3,4,3,4} honeycomb the coverage radius of a breadth-first spread stays at 3 from 750 to 3,000 cells, while on a flat cubic lattice it grows from 12 to 21. Across four other hyperbolic tilings, coverage radius falls and growth rises with curvature.',
    headline: {
      value: '0',
      label:
        'growth in search radius as the memory quadruples, against 9 on a cubic lattice',
    },
    category: 'reproduction',
    status: ['simulated'],
    depth: 'L3',
    audience:
      'network science, associative memory, hyperbolic embeddings',
    question:
      'Does lookup cost on the {3,4,3,4} honeycomb stay flat as the memory grows?',
    answer:
      'At the two sizes measured, yes: the radius stays 3 while a cubic lattice goes from 12 to 21.',
    importance:
      'Exponential volume growth makes lookup logarithmic. It is the property the program leans on for memory, measured on its own mesh.',
    limits: [
      'two sizes only, so no logarithmic fit is made',
      'the curvature ladder (E-MMR-0002) runs {5,3,4} to {5,3,3,5} and leaves {3,4,3,4} out',
      'the ladder claim fails at half size: at 600 cells the cubic radius ties the least-curved one. Its measured floor is about 1,000 cells',
    ],
    equations: [
      'coverage radius (D3) at $N$ and $4N$ cells, and its change $\\Delta r = r(4N) - r(N)$',
      'with exponential growth $r \\sim \\log_\\lambda N$, so $\\Delta r \\approx \\log_\\lambda 4$. On a cubic lattice $r \\sim N^{1/3}$, so $\\Delta r$ grows with $N$',
    ],
    measurements: [
      {
        quantity: 'coverage radius, {3,4,3,4}, 750 to 3,000 cells',
        measured: '3 to 3',
        reference: 'cubic 12 to 21 (run)',
        code: 'E-MMR-0013',
      },
      {
        quantity: 'growth ratio, least to most curved of four tilings',
        measured: '1.662 to 2.158',
        reference: 'cubic 1.122 (run)',
        code: 'E-MMR-0002',
      },
      {
        quantity: 'coverage radius, least to most curved',
        measured: '11 to 8',
        reference: 'cubic 18 (run)',
        code: 'E-MMR-0002',
      },
    ],
    figure: {
      form: 'pairs',
      caption: 'Reproduction. Coverage radius at 750 and 3,000 cells.',
      measured: '{3,4,3,4}',
      control: 'flat cubic lattice',
      rows: [
        { label: 'radius at 750 cells', measured: 3, control: 12 },
        { label: 'radius at 3,000 cells', measured: 3, control: 21 },
      ],
    },
    comparison: {
      standard:
        'search on a graph with exponential growth takes a logarithmic radius',
      vibe: 'the same, on {3,4,3,4}',
      difference: 'none in kind',
    },
    closest: [
      {
        work: 'Krioukov, Papadopoulos, Kitsak, Vahdat and Boguna 2010, Hyperbolic geometry of complex networks',
        established: 'the general property',
        difference: 'this is one tiling',
      },
      {
        work: 'Nickel and Kiela 2017, Poincare embeddings for learning hierarchical representations',
        established:
          'hierarchies embed efficiently in hyperbolic space',
        difference: 'embedding, not search. The same geometric reason',
      },
    ],
    literature: null,
    gate: reproductionGate({
      derived: {
        mark: 'fail',
        reason:
          'uses the geometry of the honeycomb, not the rule, and the curvature ladder leaves {3,4,3,4} out',
      },
      falsifiable: {
        mark: 'fail',
        reason: 'geometry, decided by counting',
      },
    }),
    failure: [
      'the {3,4,3,4} radius growing at a third and fourth size',
      'the curvature ladder failing at its stated size, as it does at half size',
    ],
    novelty: 'known',
    free_parameters: 0,
    fitted: false,
    known_before: true,
    falsified_by:
      'a reproduction at more sizes showing polynomial growth',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: [],
    experiments: [
      {
        code: 'E-MMR-0013',
        file: 'test/experiment/associative/search-latency.ts',
        depends: ['A1', 'D3', 'I5'],
      },
      {
        code: 'E-MMR-0002',
        file: 'test/experiment/associative/capacity-vs-curvature.ts',
        depends: ['D3', 'I5'],
      },
    ],
    checks: [
      {
        code: 'E-MMR-0013',
        metric: 'bulkDelta',
        from: 'metrics',
        expected: 0,
        tolerance: 0,
      },
      {
        code: 'E-MMR-0013',
        metric: 'cubicDelta',
        from: 'metrics',
        expected: 9,
        tolerance: 0,
      },
      {
        code: 'E-MMR-0002',
        metric: 'mostCurvedCoverageRadius',
        from: 'metrics',
        expected: 8,
        tolerance: 0,
      },
      {
        code: 'E-MMR-0002',
        metric: 'cubicCoverageRadius',
        from: 'control',
        expected: 18,
        tolerance: 0,
      },
    ],
    notes: [],
    problem: 'OP-04',
    candidate: null,
    paper: 'planned paper 2, the hyperbolic substrate',
    program:
      'Memory in the bulk: the reason the program stores in hyperbolic space rather than flat space.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-NVG-0001',
    title: 'Greedy routing with stretch 1.002 on a hyperbolic tiling',
    subject: 'network geometry',
    sentence:
      'On the {5,4} hyperbolic tiling, greedy descent in hyperbolic coordinates delivers every one of 2,541 pairs with mean stretch 1.002.',
    claim:
      'On the {5,4} hyperbolic tiling of the plane, greedy descent in hyperbolic coordinates delivers all 2,541 tested pairs with mean stretch 1.002 against the shortest path, while the same descent on scrambled coordinates delivers 3.4 percent.',
    headline: {
      value: '100%',
      label:
        'of 2,541 pairs delivered, against 3.4 percent with scrambled coordinates',
    },
    category: 'reproduction',
    status: ['simulated'],
    depth: 'L2',
    audience:
      'network science, hyperbolic random graphs, greedy routing',
    question:
      'Can a walker with only local information reach any address on a hyperbolic tiling?',
    answer:
      'On {5,4}, yes, with mean stretch 1.002. On the {3,4,3,4} honeycomb it has not been run.',
    importance:
      'The program uses greedy routing as the way a self moves. The {3,4,3,4} version is the one that would count.',
    limits: [
      'the experiment builds a two-dimensional {5,4} tiling of at most 2,500 vertices, not the {3,4,3,4} honeycomb. Its catalog substrate label is wrong',
      'one size',
    ],
    equations: [
      'mean stretch over the tested pairs: $\\bar{s} = \\dfrac{1}{|P|} \\sum_{(u,v) \\in P} \\dfrac{\\ell_{\\text{greedy}}(u,v)}{d(u,v)}$',
      'a greedy step moves to the neighbour closest to the target in hyperbolic distance, using only the current cell, its neighbours and the target',
    ],
    measurements: [
      {
        quantity: 'delivery, greedy in hyperbolic coordinates',
        measured: '100 percent of 2,541 pairs',
        reference: 'scrambled coordinates 3.4 percent (run)',
        code: 'E-NVG-0010',
      },
      {
        quantity: 'mean stretch',
        measured: '1.002',
        reference: 'pass below 1.1 (run)',
        code: 'E-NVG-0010',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Reproduction. Pairs delivered by greedy routing on {5,4}, true coordinates against scrambled.',
      measured: 'hyperbolic coordinates',
      control: 'scrambled coordinates',
      rows: [
        {
          label: 'pairs delivered',
          measured: 100,
          control: 3.4,
          unit: 'percent',
        },
      ],
    },
    comparison: {
      standard:
        'greedy routing succeeds on hyperbolic embeddings (Kleinberg 2007)',
      vibe: 'the same, on {5,4}',
      difference: 'none',
    },
    closest: [
      {
        work: 'Kleinberg 2007, Geometric routing using hyperbolic space',
        established:
          'every connected graph has a greedy embedding in the hyperbolic plane',
        difference: 'none',
      },
      {
        work: 'Boguna, Papadopoulos and Krioukov 2010, Sustaining the Internet with hyperbolic mapping',
        established:
          'greedy routing on real networks in hyperbolic coordinates',
        difference: 'none in kind',
      },
    ],
    literature: null,
    gate: reproductionGate({
      derived: {
        mark: 'fail',
        reason:
          'runs on the {5,4} plane tiling, not {3,4,3,4}, although the catalog labels it 3434',
      },
      interesting: { mark: 'fail', reason: 'established since 2007' },
    }),
    failure: ['stretch rising with size once it is run on {3,4,3,4}'],
    novelty: 'known',
    free_parameters: 0,
    fitted: false,
    known_before: true,
    falsified_by:
      'a run on {3,4,3,4} at growing size with stretch that grows',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: [],
    experiments: [
      {
        code: 'E-NVG-0010',
        file: 'test/experiment/addressing/greedy-walkway.ts',
        depends: ['I5'],
      },
    ],
    checks: [
      {
        code: 'E-NVG-0010',
        metric: 'pairsTested',
        from: 'metrics',
        expected: 2541,
        tolerance: 0,
      },
      {
        code: 'E-NVG-0010',
        metric: 'hyperbolicSuccessPercent',
        from: 'metrics',
        expected: 100,
        tolerance: 0,
      },
      {
        code: 'E-NVG-0010',
        metric: 'meanStretch',
        from: 'metrics',
        expected: 1.002,
        tolerance: 0.001,
      },
      {
        code: 'E-NVG-0010',
        metric: 'scrambledSuccessPercent',
        from: 'control',
        expected: 3.4,
        tolerance: 0.05,
      },
    ],
    notes: [],
    problem: 'OP-04',
    candidate: null,
    paper:
      'planned paper 2, once it runs on {3,4,3,4} with finite-size scaling',
    program:
      'The walkway a self can follow with only local information.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-HLG-0001',
    title: 'The outer shell holds 94.5 percent of the ball',
    subject: 'geometry',
    sentence:
      'In the {3,4,3,4} honeycomb the outermost shell of a ball holds 0.9453 of it, exactly $(\\lambda - 1)/\\lambda$ for the measured growth factor $\\lambda$.',
    claim:
      'In the {3,4,3,4} honeycomb, through shell 4, the outermost shell of a ball holds a constant 0.9453 of the ball, equal to $(\\lambda - 1)/\\lambda$ for the growth factor $\\lambda = 18.278$, while in a flat four-dimensional lattice the fraction falls to 0.2467 by radius 14.',
    headline: {
      value: '94.5%',
      label: 'of the ball in its outermost shell',
    },
    category: 'measurement',
    status: ['simulated'],
    depth: 'L2',
    audience: 'mathematical physics, geometric group theory',
    question:
      'How much of a ball in the {3,4,3,4} honeycomb is surface?',
    answer:
      'Almost all of it: 0.9453, fixed by the growth factor, where a flat lattice tends to none.',
    importance:
      'The program reads the surface as physical space and the interior as wiring. This is the number behind that picture.',
    limits: [
      'five shells, 170,000 cells',
      'a property of the geometry, not of the rule running on it',
    ],
    equations: [
      'boundary share (D2): $\\dfrac{|S_r|}{|B_r|}$, with $S_r$ the shell at radius $r$ and $B_r$ the ball',
      'L4: if $|S_r| \\sim \\lambda^r$, then $\\dfrac{|S_r|}{|B_r|} \\to \\dfrac{\\lambda - 1}{\\lambda} = \\dfrac{17.278}{18.278} = 0.9453$',
      'the growth factor is exactly the largest root of $x^3 - 21x^2 + 51x - 23$ (E-FND-0043)',
    ],
    measurements: [
      {
        quantity: 'boundary share, {3,4,3,4}, shells 0 to 4',
        measured: '0.9453',
        reference: 'predicted $(\\lambda - 1)/\\lambda$ = 0.9453 (run)',
        code: 'E-HLG-0032',
      },
      {
        quantity: 'recovered growth factor',
        measured: '18.296',
        reference: '$\\lambda$ = 18.278 (run)',
        code: 'E-HLG-0032',
      },
      {
        quantity: 'boundary share, flat 4D lattice',
        measured: '0.5981 at radius 4, 0.2467 at radius 14',
        reference: 'falls toward 0 (run)',
        code: 'E-HLG-0032',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Measurement. Share of a ball in its outermost shell. No fitted parameters: λ is counted.',
      measured: '{3,4,3,4}',
      control: 'flat 4D lattice, radius 14',
      rows: [
        { label: 'boundary share', measured: 0.9453, control: 0.2467 },
      ],
    },
    comparison: {
      standard:
        'any non-amenable graph has a boundary share bounded away from zero',
      vibe: 'the exact figure for {3,4,3,4}',
      difference: 'none in kind',
    },
    closest: [
      {
        work: 'non-amenable graphs and the Cheeger constant',
        established:
          'a positive boundary share for every hyperbolic tiling',
        difference:
          'the property is standard. The number is specific to this honeycomb',
      },
    ],
    literature: null,
    gate: measurementGate({
      novel: {
        mark: 'fail',
        reason:
          'follows from the growth factor by L4, a standard property',
      },
      derived: {
        mark: 'pass',
        reason: 'a property of the committed geometry, A1',
      },
      quantitative: { mark: 'pass', reason: 'an exact ratio' },
      differentiating: {
        mark: 'fail',
        reason: 'no comparison with nature',
      },
      falsifiable: {
        mark: 'fail',
        reason: 'geometry, decided by counting',
      },
      interesting: {
        mark: 'unknown',
        reason: 'a small exact number. Not yet asked',
      },
    }),
    failure: [
      'the shell counts departing from the exact growth factor at larger radius',
    ],
    novelty: 'known',
    free_parameters: 0,
    fitted: false,
    known_before: false,
    falsified_by:
      'a mathematical counterexample: a shell count off the growth factor',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: ['L4'],
    experiments: [
      {
        code: 'E-HLG-0032',
        file: 'test/experiment/holography/holography-is-derived.ts',
        depends: ['A1', 'D2'],
      },
    ],
    checks: [
      {
        code: 'E-HLG-0032',
        metric: 'deepBoundaryFraction',
        from: 'metrics',
        expected: 0.9453,
        tolerance: 0.0001,
      },
      {
        code: 'E-HLG-0032',
        metric: 'predictedFraction',
        from: 'metrics',
        expected: 0.9453,
        tolerance: 0.0001,
      },
      {
        code: 'E-HLG-0032',
        metric: 'shellsExact',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-HLG-0032',
        metric: 'flatFractionFar',
        from: 'control',
        expected: 0.2467,
        tolerance: 0.0001,
      },
    ],
    notes: [],
    problem: null,
    candidate: null,
    paper: 'planned paper 2, the hyperbolic substrate',
    program:
      'Almost all of the mesh sits at the skin. Physical space is the canopy, the bulk is the branches.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-FND-0002',
    title: 'Dimension eight, pinched from above and below',
    subject: 'mathematical physics',
    sentence:
      'Two standard theorems bound one dimension from both sides, and only eight survives: composition algebras stop at eight, and triality exists only at eight.',
    claim:
      'Normed division algebras exist only in dimensions 1, 2, 4 and 8 (Hurwitz), and among the $D_n$ Lie algebras only $D_4$, whose vector is eight-dimensional, has an outer automorphism of order three (triality), while vector and half-spinor dimensions agree only at $n = 8$.',
    headline: {
      value: '8',
      label: 'the one dimension both bounds allow',
    },
    category: 'explanation',
    status: ['derived'],
    depth: 'L1',
    audience: 'mathematical physics, division algebras and octonions',
    question:
      'Which parts of the choice of dimension eight are theorems, and which are choices?',
    answer:
      'The ceiling and the floor are theorems. The step from eight to the {3,4,3,4} honeycomb, over the flat {3,4,3,3}, is a stated choice.',
    importance:
      'The program chooses the 24-cell and ternary values partly by this argument, so it marks exactly where the theorems end.',
    limits: [
      'no machine-checked proof of the pinch: the formal kernel checks the norm is multiplicative for the complex numbers, quaternions and octonions, and the pinch itself only as integer spot checks',
      'the converse of Hurwitz, that no other composition algebra exists, is not a checked proof',
      'the step from dimension eight to {3,4,3,4} is argued, and the hyperbolic tiling over the flat {3,4,3,3} is stated as a premise (E-FND-0043)',
    ],
    equations: [
      'L2 (Hurwitz): a normed division algebra $A$ over $\\mathbb{R}$ has $\\dim A \\in \\{1, 2, 4, 8\\}$',
      'L3: $|\\operatorname{Out}(D_4)| = |S_3| = 6$, and $|\\operatorname{Out}(D_n)| = 2$ for $n \\ne 4$',
      'vector equals half-spinor: $n = 2^{n/2 - 1}$ holds for even $n$ only at $n = 8$',
    ],
    measurements: [
      {
        quantity: 'outer automorphism order, $D_2$ to $D_5$',
        measured: '$D_4$: 6',
        reference: '$D_2$, $D_3$, $D_5$ and the $A$ series: 2 (run)',
        code: 'E-FND-0050',
      },
      {
        quantity: 'even dimensions with vector = half-spinor',
        measured: 'one, $n = 8$',
        reference: '$n = 10$: vector 10, spinor 16 (run)',
        code: 'E-FND-0033',
      },
      {
        quantity: 'non-associative octonion triples',
        measured: '28 of 35',
        reference: 'the forced ladder, 7 of 7 rungs (run)',
        code: 'E-FND-0043',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Explanation. Order of the outer automorphism group: triality exists only at D₄.',
      measured: 'D₄, dimension 8',
      control: 'D₅, dimension 10',
      rows: [{ label: 'order of Out', measured: 6, control: 2 }],
    },
    comparison: {
      standard: 'Hurwitz 1898 and triality are established mathematics',
      vibe: 'uses them to pinch the dimension at eight',
      difference: 'none in the mathematics',
    },
    closest: [
      {
        work: 'Hurwitz 1898. Baez 2002, The Octonions',
        established: 'the composition algebras and triality',
        difference: 'none. The mathematics is theirs',
      },
      {
        work: 'Furey. Boyle. Dixon',
        established: 'Standard Model structure from the octonions',
        difference:
          'the same starting point. The program adds a dynamics',
      },
    ],
    literature: null,
    gate: {
      prior_art_reviewed: { mark: 'fail', reason: NOT_RUN },
      novel: { mark: 'fail', reason: 'established mathematics' },
      derived: {
        mark: 'unknown',
        reason:
          'it motivates the assumptions rather than following from them',
      },
      quantitative: { mark: 'pass', reason: 'integers' },
      differentiating: {
        mark: 'fail',
        reason: 'no comparison with nature',
      },
      falsifiable: { mark: 'fail', reason: 'mathematics' },
      auditable: { mark: 'pass', reason: PUBLIC },
      skeptic_reviewed: { mark: 'fail', reason: NO_SKEPTIC },
      independently_reproduced: {
        mark: 'fail',
        reason: NOT_REPRODUCED,
      },
      interesting: { mark: 'unknown', reason: 'not yet asked' },
    },
    failure: [
      'a step of the chain from the pinch to the choice of {3,4,3,4} that is a choice where the text says forced',
    ],
    novelty: 'known',
    free_parameters: 0,
    fitted: false,
    known_before: true,
    falsified_by:
      'a hidden assumption in the chain from eight to the honeycomb',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: ['L2', 'L3'],
    experiments: [
      {
        code: 'E-FND-0050',
        file: 'test/experiment/foundations/triality-forces-eight.ts',
        depends: ['L3'],
      },
      {
        code: 'E-FND-0033',
        file: 'test/experiment/foundations/monism-forces-eight.ts',
        depends: ['I7'],
      },
      {
        code: 'E-FND-0043',
        file: 'test/experiment/foundations/forced-derivation-ladder.ts',
        depends: ['L2', 'L3', 'A1', 'A2'],
      },
    ],
    checks: [
      {
        code: 'E-FND-0050',
        metric: 'd4OuterOrder',
        from: 'metrics',
        expected: 6,
        tolerance: 0,
      },
      {
        code: 'E-FND-0050',
        metric: 'trialityRankCount',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FND-0050',
        metric: 'd5OuterOrder',
        from: 'control',
        expected: 2,
        tolerance: 0,
      },
      {
        code: 'E-FND-0033',
        metric: 'selfDualDimensionsFound',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FND-0033',
        metric: 'theDimension',
        from: 'metrics',
        expected: 8,
        tolerance: 0,
      },
      {
        code: 'E-FND-0043',
        metric: 'octonionNonassociativeTriples',
        from: 'metrics',
        expected: 28,
        tolerance: 0,
      },
      {
        code: 'E-FND-0043',
        metric: 'lawSurvivors',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
    ],
    notes: [],
    problem: 'OP-09',
    candidate: null,
    paper: 'the framework paper',
    program:
      'The vise: one substance forces eight from below, composition caps it at eight from above.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-FRC-0004',
    title:
      'The running of the coupling scales with the gluon color charge',
    subject: 'lattice gauge theory',
    sentence:
      'Adjoint and fundamental sources feel the coupling run at the same rate in SU(2), SU(3) and SU(4), which excludes running set by the source charge.',
    claim:
      'In Wilson loops the effective coupling grows with distance at $\\alpha + \\kappa C_A$, with $\\kappa$ the same from SU(2), SU(3) and SU(4), and adjoint and fundamental sources rising at the same rate, which excludes a running proportional to the source charge.',
    headline: {
      value: '0.997',
      label:
        'adjoint over fundamental rate in SU(3), against 2.25 for source-charge running',
    },
    category: 'reproduction',
    status: ['simulated'],
    depth: 'L2',
    audience: 'lattice gauge theory, teaching',
    question:
      'Does the running come from the gluons or from the source?',
    answer:
      'From the gluons: two representations rise at the same rate, and the source-charge alternative is excluded.',
    importance:
      'Separating $C_A$ from $C_F$ needs two representations. It is a clean check that the running comes from the gluons.',
    limits: [
      'nothing about the committed rule',
      'one coupling per group',
    ],
    equations: [
      'the force ratio $\\chi(2,2)/\\chi(1,1)$ rises with $g^2$ at $\\alpha + \\kappa C_A$, with $\\alpha$ the color-blind lattice artifact of the compact action',
      'the Casimirs: $C_A = N$ for the adjoint, $C_F = \\dfrac{N^2 - 1}{2N}$ for the fundamental, so a source-charge running would give an adjoint over fundamental ratio of $C_A/C_F = \\dfrac{2N^2}{N^2 - 1}$, which is $8/3$, $9/4$ and $32/15$ for $N = 2, 3, 4$',
      'the tree level computed exactly, not fitted: $\\rho_0 = 0.28713$',
    ],
    measurements: [
      {
        quantity: '$\\kappa$, SU(2) / SU(3) / SU(4)',
        measured: '0.0245 ± 0.0036 / 0.0213 ± 0.0032 / 0.0220 ± 0.0028',
        reference: 'largest pairwise pull 0.65 (run)',
        code: 'E-FRC-0083',
      },
      {
        quantity: 'adjoint over fundamental rate',
        measured: '1.008, 0.997, 0.982',
        reference:
          'source-charge running predicts 2.67, 2.25, 2.13, excluded at $6.47\\sigma$ combined (run)',
        code: 'E-FRC-0083',
      },
      {
        quantity: 'U(1) extrapolation',
        measured: '0.2860 ± 0.0013',
        reference: 'exact tree level 0.28713, pull -0.88 (run)',
        code: 'E-FRC-0083',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Reproduction. Adjoint over fundamental running rate, against a running set by the source charge.',
      measured: 'measured',
      control: 'if the running followed the source charge',
      rows: [
        { label: 'SU(2)', measured: 1.008, control: 2.67 },
        { label: 'SU(3)', measured: 0.997, control: 2.25 },
        { label: 'SU(4)', measured: 0.982, control: 2.13 },
      ],
    },
    comparison: {
      standard: 'the beta function is proportional to $C_A$',
      vibe: 'the same, measured',
      difference: 'none',
    },
    closest: [
      {
        work: 'Bali 2000, Casimir scaling of SU(3) static potentials',
        established:
          'the static potential scales with the source Casimir',
        difference:
          'the rate comparison across three groups is the stated check',
      },
    ],
    literature: null,
    gate: reproductionGate({
      interesting: {
        mark: 'unknown',
        reason: 'as teaching, plausibly',
      },
    }),
    failure: [
      '$\\kappa$ differing between groups beyond $3\\sigma$',
      'the adjoint rate matching the source-charge line',
    ],
    novelty: 'known',
    free_parameters: 0,
    fitted: false,
    known_before: true,
    falsified_by: 'a reproduction failure',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: [],
    experiments: [
      {
        code: 'E-FRC-0083',
        file: 'test/experiment/gauge/asymptotic-freedom.ts',
        depends: QCD_IMPORTS,
      },
    ],
    checks: [
      {
        code: 'E-FRC-0083',
        metric: 'status',
        from: 'status',
        expected: 'pass',
        tolerance: 0,
      },
      {
        code: 'E-FRC-0083',
        metric: 'adjointOverFundamentalSu3',
        from: 'metrics',
        expected: 0.9968,
        tolerance: 0.0001,
      },
      {
        code: 'E-FRC-0083',
        metric: 'combinedSourceChargePull',
        from: 'metrics',
        expected: 6.468,
        tolerance: 0.001,
      },
      {
        code: 'E-FRC-0083',
        metric: 'treeLevelRatio',
        from: 'metrics',
        expected: 0.28713,
        tolerance: 0.00001,
      },
      {
        code: 'E-FRC-0083',
        metric: 'u1ExtrapolatedToZero',
        from: 'control',
        expected: 0.286,
        tolerance: 0.0001,
      },
    ],
    notes: ['note/experiment/gauge/strong-force.md'],
    problem: 'OP-10',
    candidate: null,
    paper: 'planned paper 1, the testbed paper',
    program: 'Part of the strong-force arc, beside R-FRC-0001.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-FRC-0005',
    title:
      'Color as a classical phase-space label: a whole without amplitudes, and negativity as the quantum part',
    subject: 'symmetry',
    sentence:
      'A color carried as a point of the 3 x 3 qutrit phase space, moved by the 216 affine maps the classical color group induces, is gauge invariant with links, forms frame-free wholes exactly at triality zero, and needs negative weight only for the singlet sign.',
    claim:
      'Carry color as a point of $\\mathbb{Z}_3^2$, the phase space of one qutrit, moved by the 216 affine symplectic maps that the classical color group $\\Sigma(648)$ induces. With links holding those maps, an independent change of frame in every cell commutes exactly with a charge-conserving reversible lattice rule. A set of points signed by charge has a frame-free zero sum exactly when its total charge is a multiple of 3, which reproduces the triality selection rule of color singlets in all 27 mixes of up to six charges. A role point carried round a loop survives exactly as often as the adjoint Wilson loop says. The singlet itself is written by whole positive and negative discrete-Wigner weights (72 and 18 on 54 units), where the symmetric whole needs no negative weight, and the swap phase at $2\\pi/3$ moves such weights by an exact kernel in quarters.',
    headline: {
      value: '27 of 27',
      label:
        'charge mixes where the classical whole matches the quantum singlet rule',
    },
    category: 'explanation',
    status: ['simulated'],
    depth: 'L1 and L2',
    audience:
      'lattice gauge theory, quantum foundations (discrete Wigner functions), anyone building color into a classical rule',
    question:
      'Can color be carried by a deterministic classical rule, and if not all of it, which part needs amplitudes?',
    answer:
      'All of the frame freedom and the triality selection rule can. What cannot is the sign of the singlet and the quark string, which need negative weight.',
    importance:
      'It splits the strong force into a classical part a deterministic base can carry and one non-classical ingredient, and shows the ingredient is negative weight on the same grid.',
    limits: [
      'a candidate addition to the base, not the committed rule, which carries none of it (R-FRC-0003)',
      'the links are a fixed background field in the gauge test. Their dynamics (E-FRC-0110) has not been run with color on them',
      'no rule here binds a whole: flux on the links obeys Gauss exactly and costs nothing yet',
      'pair creation from the vacuum makes color from nothing in 3,550 of 3,888 cases, until a neutral creation is built',
      'carrying non-classical steps exactly needs a unit count that grows four times per step',
    ],
    equations: [
      'a whole: $S = \\sum_i v_i p_i = 0$ with $v_i = \\pm 1$ and $p_i \\in \\mathbb{Z}_3^2$, and under $g(p) = A p + u$, $S \\mapsto A S + \\big(\\textstyle\\sum_i v_i\\big) u$, so $S = 0$ is frame-free exactly when $\\sum_i v_i \\equiv 0 \\pmod 3$',
      'the points a color element fixes: $\\#\\{p : g_U(p) = p\\} = |\\operatorname{Tr} U|^2$, so survival round a loop is the adjoint Wilson loop',
      'a gate moves discrete Wigner weights by $K(x, y) = \\operatorname{Tr}\\big(A(x)\\,U A(y) U^\\dagger\\big)/3^n$',
    ],
    measurements: [
      {
        quantity: 'charge mixes, up to six, where the classical whole is frame-free exactly when the quantum singlet exists',
        measured: '27 of 27',
        reference: 'the SU(3) singlet counts of E-FRC-0101 and the characters of $\\Sigma(648)$ (run)',
        code: 'E-FRC-0118',
      },
      {
        quantity: 'three equal-sign points of $\\mathbb{Z}_3^2$ with zero sum, distinct',
        measured: '72, the 12 lines in 6 orders',
        reference: 'the affine plane of order 3 (run)',
        code: 'E-FRC-0118',
      },
      {
        quantity: 'mismatches under an independent change of frame in every cell, 24 beats',
        measured: '0 with links',
        reference: '27,749 without links, 40,015 with a fixed map per direction (run)',
        code: 'E-FRC-0117',
      },
      {
        quantity: 'survival of a point round a loop against the adjoint Wilson loop',
        measured: 'equal to $10^{-12}$ in both phases',
        reference: 'fixed points $= |\\operatorname{Tr} U|^2$ on all 648 elements (run)',
        code: 'E-FRC-0119',
      },
      {
        quantity: 'negative weight in the singlet, positive in the symmetric whole',
        measured: '72 positive and 18 negative on 54 units, against 27 positive and 0 negative',
        reference: 'a product state, 27 positive and 0 negative (run)',
        code: 'E-FRC-0120',
      },
      {
        quantity: 'units needed after 8 rounds of the $2\\pi/3$ swap phase and a Clifford move',
        measured: '2,304, negative share near 0.29',
        reference: '9 at the start, weight exactly 1 every round (run)',
        code: 'E-FRC-0122',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Explanation. Each row against its control, scaled to the control: the gauge test with links against without, and the negative weight of the symmetric whole against the singlet.',
      measured: 'with links, or the symmetric whole',
      control: 'without links, or the singlet',
      rows: [
        { label: 'frame-change mismatches', measured: 0, control: 27749 },
        { label: 'negative weight units', measured: 0, control: 18 },
      ],
    },
    comparison: {
      standard:
        'color is a quantum SU(3) label, singlets exist only at triality zero, and confinement is read off the fundamental Wilson loop',
      vibe: 'the frame freedom and the triality rule are classical on a 3 x 3 grid, the singlet sign and the fundamental string need negative weight',
      difference:
        'a split of the standard picture into a classical and a non-classical part, not a disagreement with it',
    },
    closest: [
      {
        work: 'Gross 2006, Hudson theorem for finite-dimensional quantum systems',
        established:
          'for odd dimension, the states with nonnegative discrete Wigner function are the stabilizer states',
        difference:
          'the singlet is not one, and this counts its negative weight in whole units on the grid a color rule would carry',
      },
      {
        work: 'Veitch, Ferrie, Gross and Emerson 2012, negative quasi-probability as a resource',
        established: 'negativity is what a Clifford circuit lacks',
        difference: 'applied here to color singlets and the swap phase of a lattice rule',
      },
    ],
    literature: null,
    gate: {
      prior_art_reviewed: { mark: 'fail', reason: NOT_RUN },
      novel: {
        mark: 'unknown',
        reason:
          'the classical form of the triality rule and the count of singlet negativity may be known. The literature pass has not been run',
      },
      derived: {
        mark: 'fail',
        reason:
          'a candidate addition to the base, run on constructed rules, not the committed rule',
      },
      quantitative: { mark: 'pass', reason: 'exact integers and exact kernels' },
      differentiating: {
        mark: 'fail',
        reason: 'it agrees with standard color physics wherever they overlap',
      },
      falsifiable: {
        mark: 'fail',
        reason: 'decided by computation, not by observation',
      },
      auditable: { mark: 'pass', reason: PUBLIC },
      skeptic_reviewed: { mark: 'fail', reason: NO_SKEPTIC },
      independently_reproduced: { mark: 'fail', reason: NOT_REPRODUCED },
      interesting: {
        mark: 'unknown',
        reason: 'not yet asked of anyone in the field',
      },
    },
    failure: [
      'a charge mix whose classical whole is frame-free where no quantum singlet exists, or the reverse',
      'a nonzero mismatch under a change of frame with links',
      'a role survival that departs from the adjoint Wilson loop',
    ],
    novelty: 'uncertain',
    free_parameters: 0,
    fitted: false,
    known_before: false,
    falsified_by: 'a counterexample in any of the exhaustive checks',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: ['R-FRC-0003'],
    experiments: [
      {
        code: 'E-FRC-0117',
        file: 'test/experiment/gauge/vibe-role-tilt.ts',
        depends: ['A1', 'A2', 'A3', 'A4'],
      },
      {
        code: 'E-FRC-0118',
        file: 'test/experiment/gauge/whole-is-a-line.ts',
        depends: [],
      },
      {
        code: 'E-FRC-0119',
        file: 'test/experiment/gauge/role-survives-a-loop.ts',
        depends: [],
      },
      {
        code: 'E-FRC-0120',
        file: 'test/experiment/gauge/fear-is-negativity.ts',
        depends: [],
      },
      {
        code: 'E-FRC-0122',
        file: 'test/experiment/gauge/fear-resolution.ts',
        depends: [],
      },
      {
        code: 'E-FRC-0123',
        file: 'test/experiment/gauge/vibe-weave.ts',
        depends: ['A1', 'A2', 'A3', 'A4'],
      },
    ],
    checks: [
      {
        code: 'E-FRC-0117',
        metric: 'gaugeMismatchWithLinks',
        from: 'metrics',
        expected: 0,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0117',
        metric: 'gaugeMismatchNoLinks',
        from: 'control',
        expected: 27749,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0118',
        metric: 'classicalMatchesTriality',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0118',
        metric: 'quantumMatchesTriality',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0118',
        metric: 'distinctZeroSumTriples',
        from: 'metrics',
        expected: 72,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0119',
        metric: 'survivalIsAdjoint',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0120',
        metric: 'singletFears',
        from: 'metrics',
        expected: 18,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0120',
        metric: 'allSameFears',
        from: 'metrics',
        expected: 0,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0122',
        metric: 'units8',
        from: 'metrics',
        expected: 2304,
        tolerance: 0,
      },
      {
        code: 'E-FRC-0123',
        metric: 'gaussEveryCellEveryBeat',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
    ],
    notes: ['note/experiment/gauge/what-the-base-needs.md'],
    problem: 'OP-02',
    candidate: null,
    paper: 'the testbed paper, as what a base would need for color',
    program:
      'The vibe, role and tilt model: every slot holds a vibe (fear, calm, love), a role (take, hold, free) and a tilt, a whole is three roles on a line of the grid, and fear is the negative weight that the one-third turn at a meeting of different roles creates. Nothing in the committed base has changed.',
    outputs: NO_OUTPUTS,
  },
  {
    code: 'R-HLG-0002',
    title: 'Correlation without signal through a shared ancestor',
    subject: 'holography',
    sentence:
      'Two distant boundary points of a hyperbolic graph are a logarithmic number of steps apart through the interior, so a correlation set by that distance falls as a power law. The exponent is not measured.',
    claim:
      'In a hyperbolic graph, two boundary points joined only through the interior are a number of steps apart that grows like the logarithm of their boundary separation, so a correlation that falls exponentially with interior distance falls as a power of boundary distance. The exponent is not measured.',
    headline: {
      value: '15',
      label:
        'interior steps between points 1,024 apart on the boundary',
    },
    category: 'explanation',
    status: ['simulated', 'unresolved'],
    depth: 'L3 and L2',
    audience: 'holography, causal sets, the Wolfram Physics community',
    question:
      'Can correlation at a distance come from a common cause in the interior, with no signal?',
    answer:
      'The path lengths allow it. Whether the resulting correlation matches any physical system depends on an exponent nobody has measured.',
    importance:
      "It is the program's account of correlation without signal, a common cause rather than a channel, and the first route to a prediction row.",
    limits: [
      'E-HLG-0004 is on {5,3,4}, and its control repeats its own measurement',
      'E-HLG-0033 evaluates a formula for a branching tree. It is not a simulation',
      'no correlation is measured at all, only path lengths',
      'a common cause cannot reach Bell-violating correlations. The account has to meet that and does not yet',
    ],
    equations: [
      'interior steps between boundary points $s$ apart (I8): $d_{\\text{interior}}(s) = 2\\lceil \\log_3 s \\rceil + 1$, against $d_{\\text{boundary}}(s) = s$',
      'if $C \\sim e^{-d_{\\text{interior}}/\\xi}$ and $d_{\\text{interior}} \\approx 2\\log_3 s$, then $C(s) \\sim s^{-\\alpha}$ with $\\alpha = \\dfrac{2}{\\xi \\ln 3}$. Neither $\\xi$ nor $\\alpha$ is measured',
    ],
    measurements: [
      {
        quantity:
          'boundary points unreachable along the boundary, {5,3,4}',
        measured: 'all (fraction 1), interior distance 2',
        reference: 'the boundary alone is disconnected (run)',
        code: 'E-HLG-0004',
      },
      {
        quantity: 'steps through the interior at separation 1,024',
        measured: '15',
        reference:
          '1,024 along the boundary. Break-even at 6 (run, analytic formula)',
        code: 'E-HLG-0033',
      },
      {
        quantity: 'decay exponent $\\alpha$',
        measured: 'not measured',
        reference: 'OP-11',
        code: 'none',
      },
    ],
    figure: {
      form: 'pairs',
      caption:
        'Explanation. Steps between two boundary points 1,024 apart, by the analytic travel-time formula.',
      measured: 'through the interior',
      control: 'along the boundary',
      rows: [
        {
          label: 'steps at separation 1,024',
          measured: 15,
          control: 1024,
        },
      ],
    },
    comparison: {
      standard:
        'correlation without signalling is quantum entanglement, which no classical common cause reproduces at Bell-violating strength',
      vibe: 'a common ancestor in the interior',
      difference:
        'unknown until $\\alpha$ is measured and compared with a physical system',
    },
    closest: [
      {
        work: 'Swingle 2012, Entanglement renormalization and holography',
        established:
          'an interior that organizes boundary correlations, as a tensor network',
        difference: 'here the interior is a growth history',
      },
      {
        work: 'Bell 1964',
        established:
          'a common cause cannot reach the quantum correlations',
        difference:
          'this account has to meet that bound, and does not yet',
      },
    ],
    literature: null,
    gate: {
      prior_art_reviewed: { mark: 'fail', reason: NOT_RUN },
      novel: { mark: 'unknown', reason: NOT_RUN },
      derived: {
        mark: 'fail',
        reason:
          'E-HLG-0004 runs on {5,3,4} and E-HLG-0033 is an analytic formula. Neither runs the committed rule',
      },
      quantitative: {
        mark: 'fail',
        reason:
          '$\\alpha$, which would make it quantitative, is not measured',
      },
      differentiating: {
        mark: 'unknown',
        reason: 'depends on $\\alpha$',
      },
      falsifiable: {
        mark: 'unknown',
        reason: 'depends on $\\alpha$ and the system it applies to',
      },
      auditable: { mark: 'pass', reason: PUBLIC },
      skeptic_reviewed: { mark: 'fail', reason: NO_SKEPTIC },
      independently_reproduced: {
        mark: 'fail',
        reason: NOT_REPRODUCED,
      },
      interesting: {
        mark: 'pass',
        reason: 'if $\\alpha$ differs from a known decay, yes',
      },
    },
    failure: [
      'correlations through a common ancestor that never reach the Bell bound, which rules it out as an account of entanglement',
      'an $\\alpha$ that matches no physical system',
    ],
    novelty: 'uncertain',
    free_parameters: null,
    fitted: false,
    known_before: false,
    falsified_by:
      'an observation, once $\\alpha$ is measured and a system named',
    version: '1.0.0',
    audited: '2026-09-25',
    history: [FIRST],
    depends: [],
    experiments: [
      {
        code: 'E-HLG-0004',
        file: 'test/experiment/holography/bulk-nonlocality.ts',
        depends: ['I5'],
      },
      {
        code: 'E-HLG-0033',
        file: 'test/experiment/holography/bulk-shortcut-reachability.ts',
        depends: ['I8'],
      },
    ],
    checks: [
      {
        code: 'E-HLG-0004',
        metric: 'unreachableFraction',
        from: 'metrics',
        expected: 1,
        tolerance: 0,
      },
      {
        code: 'E-HLG-0004',
        metric: 'meanBulkDistance',
        from: 'metrics',
        expected: 2,
        tolerance: 0,
      },
      {
        code: 'E-HLG-0033',
        metric: 'breakEvenSeparation',
        from: 'metrics',
        expected: 6,
        tolerance: 0,
      },
      {
        code: 'E-HLG-0033',
        metric: 'bulkBeatsAt1024',
        from: 'metrics',
        expected: 15,
        tolerance: 0,
      },
    ],
    notes: [],
    problem: 'OP-11',
    candidate: 'PC-01',
    paper:
      'a prediction paper, if $\\alpha$ is measured and a row passes the gate',
    program:
      'The bulk shortcut: two tones on the skin share a past through the bulk.',
    outputs: NO_OUTPUTS,
  },
]

// Every criterion of a result that is not a pass.
export function unmet({
  result,
  criteria,
}: {
  result: Result
  criteria: Criterion[]
}): Criterion[] {
  return criteria.filter(
    criterion => result.gate[criterion].mark !== 'pass',
  )
}
