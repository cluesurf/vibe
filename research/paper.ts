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
    code: 'neither paper says the vacuum of the pair table, the committed knit when they were written, is a global period-three flash, so a lone vibe is a defect on a flashing background (E-FND-0080). The committed turning weave\'s vacuum recurs at beat 24 (E-FND-0118)',
    label: 'an omission, now measured',
  },
]
