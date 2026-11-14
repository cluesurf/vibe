// The papers: what is published, what is planned and in which order, and every passage of a
// published paper that says more than the code it cites.
//
// The order is fixed. One paper per community, each a self-contained result family in that
// community's language, and the framework paper last so it can cite the rest. The errata come
// from the 2026-08-31 audit, and are published rather than kept private because a reader who
// finds them first reads every claim differently.

export type Published = {
  title: string
  source: string | null
  doi: string
  form: string
}

export type Planned = {
  order: number
  title: string
  audience: string
  contents: string
  results: string[]
  needs: string
}

export type Erratum = {
  paper: string
  claim: string
  code: string
  label: string
}

export const PUBLISHED: Published[] = [
  {
    title:
      'A Discrete Universe: The Standard Model from the octonions on a hyperbolic 24-cell mesh',
    source: 'text/0012-discrete-universe',
    doi: '10.5281/zenodo.20768426',
    form: 'preprint, Zenodo',
  },
  {
    title:
      'Vibe Theory: A Discrete Hyperbolic Substrate for the Emerging Conscious Universe',
    source: null,
    doi: '10.5281/zenodo.20694262',
    form: 'preprint, Zenodo',
  },
]

export const PLANNED: Planned[] = [
  {
    order: 1,
    title:
      'A reproducible testbed for discrete-spacetime and lattice physics',
    audience: 'computational physics',
    contents:
      'the SU(3) lattice results rebuilt from scratch against published values, each with a control, and deterministic reversible dynamics reproducing the thermal ensemble. Methods, not new physics, and it says so',
    results: ['R-FRC-0001', 'R-FRC-0002', 'R-FRC-0004'],
    needs:
      'a reproducibility appendix (seeds, commands, versions), figures, and a pinned code release with a DOI',
  },
  {
    order: 2,
    title:
      'The hyperbolic substrate: navigation, memory and the boundary',
    audience:
      'network science (hyperbolic random graphs, greedy routing), associative memory',
    contents:
      'routing, search radius and the boundary share on {3,4,3,4}, grounded in the hyperbolic random graph literature',
    results: ['R-MMR-0001', 'R-NVG-0001', 'R-HLG-0001'],
    needs:
      'routing run on {3,4,3,4} (OP-04), finite-size scaling, and a precise statement of what is new against that literature',
  },
  {
    order: 3,
    title: 'A prediction',
    audience: 'the community that could measure it',
    contents: 'one row of the prediction table',
    results: [],
    needs:
      'a row whose result passes the prediction gate. There is none',
  },
  {
    order: 4,
    title: 'The framework',
    audience: 'general physics, as a preprint',
    contents:
      'the whole picture and the full scoreboard, negatives included, citing papers 1 to 3',
    results: ['R-FRC-0003', 'R-FND-0001', 'R-FND-0002'],
    needs: 'papers 1 to 3',
  },
]

// The one-present errata (2026-11-12). Seven older papers call the present the growing edge of the
// mesh, or the interior a fixed and settled past. The author's ruling is that there is one present,
// the current state of the whole model, so each paper gets one erratum here and its text stays as
// published.
const ONE_PRESENT_CODE =
  'the rule carries the whole state of the mesh to the next whole state, every dock at once, and runs back exactly, so the present fixes every earlier state (E-FND-0049). There is one present, the current state of the whole model. The past is not kept in the interior: it is what the present implies when the rule runs back. Growth is something the present does at its boundary. New docks join the present, they are not the present, and the older docks are not the past'

const ONE_PRESENT_LABEL = 'wrong picture of time, corrected by the one-present ruling of 2026-11-12'

const ONE_PRESENT_CLAIMS: [string, string][] = [
  [
    '0005',
    'the deep interior, the distant past, is fixed and never edited. The present and the growing edge of the mesh are the same thing',
  ],
  [
    '0007',
    'the past, the deep interior of the crystal, is fixed and finished. The present is the growing edge',
  ],
  [
    '0010',
    'the past is the settled interior, fixed and done. The present is the growing edge where new docks are born at peace',
  ],
  [
    '0011',
    'the past is small and few, the seed. The future is large and open, the growing edge',
  ],
  [
    '0012',
    'the past is the settled interior, fixed and done, the future is open at the wake, and the present is the growing edge',
  ],
  [
    '0013',
    'the divergence equals the newly born cells at the edge and is zero in the settled bulk',
  ],
  [
    '0014',
    'the growth is un-erasable, the wake is why the clock runs forward, and the growing edge, the wake, is the arrow',
  ],
]

export const ERRATA: Erratum[] = [
  {
    paper: '0012',
    claim:
      'the Born rule and the Tsirelson bound, saturated by the exchange dynamics. Derived',
    code: 'E-QTM-0011 applies the exchange unitary to $|01\\rangle$ in a four-dimensional Hilbert space, with no mesh, knit or vibe. E-QTM-0012 puts $|a|^2$ in by fine-graining',
    label: 'reproduced, L1',
  },
  {
    paper: '0012',
    claim: 'spin-statistics holds on the same footing',
    code: 'E-SPN-0014 computes $2(1 - \\langle v | v \\rangle^2)$ for a unit vector with itself, zero for every vector, and the exchange signs were typed constants',
    label:
      'L1, with the exchange sign an input. The dynamical result is open (OP-08)',
  },
  {
    paper: '0012',
    claim: 'holography: the area law on the mesh. Derived',
    code: 'E-HLG-0001 is a free-fermion chain with no mesh. E-HLG-0003 has no horizon. The Ryu-Takayanagi experiments measure graph geodesics against boundary arcs',
    label: 'reproduced, L2',
  },
  {
    paper: '0012',
    claim:
      'the Dirac dispersion and a finite light cone, and every walk result',
    code: 'thirteen experiments run a hand-written coined Dirac walk, not the committed knit (E-FND-0080)',
    label:
      'reproduced, L2, with prior art: Strauch 2006, Kurzynski 2008, Regensburger 2011, Kitagawa 2010, Asboth and Obuse 2013',
  },
  {
    paper: '0012',
    claim: 'three large dimensions. Derived',
    code: "E-CSM-0012 integrates central-force orbits in $d = 2$ to $5$: Bertrand's theorem, with no substrate",
    label: 'reproduced, L1',
  },
  {
    paper: '0012',
    claim:
      'the mass hierarchy: the geometric spacing beats a power law',
    code: 'E-FRC-0031 compares two hand-written ansatzes, with the shell spacing the one measured number, inside a ± three decade window',
    label: 'a consistency check, not a derivation',
  },
  {
    paper: '0012',
    claim: 'the proton lifetime, a genuine falsifiable prediction',
    code: 'E-FRC-0043 is one-loop running of measured couplings. The no-leptoquark control was a typed constant, and the particle content is assumed',
    label: 'reproduced, L2. A prediction only of the assumed content',
  },
  {
    paper: '0012',
    claim: 'the mesh is a universal computer',
    code: 'routing, gates and memory were typed as true. What the files measure is the pair-table bijection and the Toffoli NAND',
    label: 'reproduced, and the verdict is fixed',
  },
  {
    paper: '0014',
    claim: 'a tone is a value held at a site',
    code: "neither paper says the vacuum of the pair table, the committed knit when they were written, is a global period-three flash, so a lone vibe is a defect on a flashing background (E-FND-0080). The committed turning weave's vacuum recurs at beat 24 (E-FND-0118)",
    label: 'an omission, now measured',
  },
  ...ONE_PRESENT_CLAIMS.map(([paper, claim]) => ({
    paper,
    claim,
    code: ONE_PRESENT_CODE,
    label: ONE_PRESENT_LABEL,
  })),
]
