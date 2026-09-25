// The shape of the research database, and the rule behind every value in it.
//
// Every enum here is a procedure, not a label: each value carries the one-line test that
// decides it, and the site prints the test beside the value. A value whose test cannot be
// written down does not belong in the vocabulary.
//
// The records live in this directory, beside the experiments that prove them. The clue.surf
// /vibe pages, the `pnpm result` command and any paper fragment are projections of them. Keep
// imports relative (no `@/`) so a projection can load these files from outside the package.

// How strong a result is.
export type Status =
  | 'derived'
  | 'simulated'
  | 'testable'
  | 'tested'
  | 'negative'
  | 'unresolved'

export const STATUS_RULES: { status: Status; rule: string; grade: string }[] = [
  {
    status: 'derived',
    rule: 'follows from the committed rule by exact argument or exhaustive computation',
    grade: 'L1 or L3',
  },
  {
    status: 'simulated',
    rule: 'reproduces known physics or geometry on a stated model, against a published value or a computed control',
    grade: 'L2',
  },
  {
    status: 'testable',
    rule: 'makes a prediction that differs from standard physics and that an existing or planned instrument could check',
    grade: 'a prediction row',
  },
  {
    status: 'tested',
    rule: 'the check was made, and the outcome is printed either way',
    grade: 'a prediction row with data',
  },
  {
    status: 'negative',
    rule: 'the committed rule was measured not to do this',
    grade: 'any grade, stated as negative',
  },
  {
    status: 'unresolved',
    rule: 'named and open, with what would settle it',
    grade: 'open',
  },
]

export const DEPTH_RULES: { depth: string; rule: string }[] = [
  { depth: 'L0', rule: 'circular: the answer reaches the verdict as a typed constant' },
  { depth: 'L1', rule: 'known mathematics, correctly confirmed' },
  { depth: 'L2', rule: 'known physics reproduced on a stated model' },
  {
    depth: 'L3',
    rule: 'one base rule produced the result as a measured consequence, with a computed control that could have failed',
  },
]

// What KIND of claim a result is. The status says how strong, the category says what sort,
// and the two answer different questions. Printed as a badge, inside the hero figure's caption
// too, so a cropped screenshot still says it.
export type Category =
  | 'reproduction'
  | 'explanation'
  | 'retrodiction'
  | 'prediction'
  | 'measurement'

export const CATEGORY_RULES: { category: Category; rule: string; worth: string }[] = [
  {
    category: 'reproduction',
    rule: 'an established result recovered, by a method brought in from outside',
    worth: 'evidence the machinery works. Not evidence that nature uses it',
  },
  {
    category: 'explanation',
    rule: 'a proposed mechanism for a known phenomenon',
    worth: 'possibly interesting. Not prospective evidence',
  },
  {
    category: 'retrodiction',
    rule: 'a known observation derived quantitatively from the committed rule, known while the rule was being built',
    worth: 'stronger than an explanation, weaker than a prediction, because choices were made knowing the answer',
  },
  {
    category: 'prediction',
    rule: 'a value or range committed publicly, and frozen, before the observation that decides it',
    worth: 'the only prospective evidence',
  },
  {
    category: 'measurement',
    rule: 'a measured property of the committed rule itself, compared with nothing in nature',
    worth: 'what the program is, including what it lacks',
  },
]

// The launch gate. Each criterion is a FACT about the result, marked separately. They are
// never summed into a score. A result gets no outreach push until every criterion in
// LAUNCH passes, and a prediction row is refused until every criterion in PREDICTION does.
export type Criterion =
  | 'prior_art_reviewed'
  | 'novel'
  | 'derived'
  | 'quantitative'
  | 'differentiating'
  | 'falsifiable'
  | 'auditable'
  | 'skeptic_reviewed'
  | 'independently_reproduced'
  | 'interesting'

export const CRITERIA: { criterion: Criterion; question: string }[] = [
  {
    criterion: 'prior_art_reviewed',
    question: 'has the systematic literature pass been run and dated',
  },
  {
    criterion: 'novel',
    question: 'is it not already implied by known theory or literature',
  },
  {
    criterion: 'derived',
    question: 'does it come from the committed assumptions, not fitted or imported',
  },
  {
    criterion: 'quantitative',
    question: 'does it produce a number, a function or a range',
  },
  {
    criterion: 'differentiating',
    question: 'does standard physics give a meaningfully different answer',
  },
  {
    criterion: 'falsifiable',
    question: 'could some possible observation make the program wrong',
  },
  {
    criterion: 'auditable',
    question: 'are the derivation, code and data public, with a rerun command',
  },
  {
    criterion: 'skeptic_reviewed',
    question: 'has a competent skeptic, outside the program, reviewed the derivation',
  },
  {
    criterion: 'independently_reproduced',
    question: 'has someone outside the program rerun it',
  },
  {
    criterion: 'interesting',
    question: 'would someone in the relevant field care about the difference',
  },
]

export const LAUNCH: Criterion[] = [
  'prior_art_reviewed',
  'novel',
  'derived',
  'quantitative',
  'differentiating',
  'falsifiable',
  'auditable',
  'skeptic_reviewed',
  'interesting',
]

export const PREDICTION: Criterion[] = [
  'prior_art_reviewed',
  'novel',
  'derived',
  'quantitative',
  'differentiating',
  'falsifiable',
  'auditable',
]

export type Mark = 'pass' | 'fail' | 'unknown'

export type Gate = Record<Criterion, { mark: Mark; reason: string }>

// The claim graph. A node rests on the nodes in its `depends`, and a node's shown status is
// computed from everything beneath it (see graph.ts).
export type NodeKind =
  | 'assumption'
  | 'definition'
  | 'lemma'
  | 'import'
  | 'simulation'
  | 'result'
  | 'prediction'
  | 'observation'

export const NODE_KINDS: { kind: NodeKind; prefix: string; rule: string }[] = [
  { kind: 'assumption', prefix: 'A', rule: 'a committed choice of the program' },
  { kind: 'definition', prefix: 'D', rule: 'a defined quantity, so a number means one thing' },
  { kind: 'lemma', prefix: 'L', rule: 'a mathematical step, proved or cited' },
  {
    kind: 'import',
    prefix: 'I',
    rule: 'a standard model or method brought in from outside. A result resting only on imports is a reproduction',
  },
  { kind: 'simulation', prefix: 'S', rule: 'one experiment in the suite, by its code' },
  { kind: 'result', prefix: 'R', rule: 'a result, by its code, R-<arena>-<NNNN>' },
  { kind: 'prediction', prefix: 'P', rule: 'a frozen prediction row' },
  { kind: 'observation', prefix: 'O', rule: 'a measurement of nature a prediction is held against' },
]

export type Standing = 'holds' | 'challenged' | 'broken'

export type Node = {
  id: string
  kind: NodeKind
  statement: string
  standing: Standing
  depends: string[]
}

// A challenge: a numbered attempt to break a claim.
export type ChallengeStatus = 'open' | 'broken' | 'corrected' | 'survived'

export const CHALLENGE_RULES: { status: ChallengeStatus; rule: string }[] = [
  { status: 'open', rule: 'offered for breaking, no submission has decided it' },
  { status: 'broken', rule: 'a submission refuted it, and the result is withdrawn or regraded' },
  { status: 'corrected', rule: 'a submission found an error that was fixed, and the result stands in its corrected form' },
  { status: 'survived', rule: 'a submission was made in full and failed' },
]

// The ways a result can be broken, each a structured submission.
export type Route =
  | 'counterexample'
  | 'prior_work'
  | 'reproduction_failure'
  | 'assumption'
  | 'novelty'
  | 'implementation'

export const ROUTES: { route: Route; label: string; rule: string }[] = [
  { route: 'counterexample', label: 'Submit counterexample', rule: 'a case where a stated step or equation fails' },
  { route: 'prior_work', label: 'Submit prior work', rule: 'literature that derives the same thing' },
  {
    route: 'reproduction_failure',
    label: 'Report reproduction failure',
    rule: 'the rerun does not give the recorded numbers',
  },
  {
    route: 'assumption',
    label: 'Challenge assumption',
    rule: 'a named assumption already contains the result, or is not what the code does',
  },
  {
    route: 'novelty',
    label: 'Challenge novelty',
    rule: 'a conventional explanation removes the claimed distinction',
  },
  {
    route: 'implementation',
    label: 'Report implementation mismatch',
    rule: 'the code differs from the stated algorithm',
  },
]

export type Submission = {
  id: string
  result: string
  route: Route
  submitted: string
  by: string
  summary: string
  status: ChallengeStatus
  resolution: string | null
}

// A check `pnpm result reproduce` makes against an experiment's verdict.
export type Check = {
  code: string
  // `status` checks the verdict status. Anything else names a metric or control key.
  metric: string
  // read the key from the verdict's metrics or its control
  from: 'status' | 'metrics' | 'control'
  expected: number | string
  // absolute tolerance for a number. Zero means exact.
  tolerance: number
}

export type Measurement = {
  quantity: string
  measured: string
  reference: string
  code: string
}

export type Figure =
  | {
      form: 'pulls'
      caption: string
      rows: { label: string; pull: number; source: string }[]
    }
  | {
      form: 'pairs'
      caption: string
      measured: string
      control: string
      rows: { label: string; measured: number; control: number; unit?: string }[]
    }

export type Novelty = 'known' | 'apparently_new' | 'uncertain'

export type Result = {
  // R-<arena>-<NNNN>, the arena code from test/codes.csv and a number counted within that arena,
  // the same shape as an experiment's E-<arena>-<NNNN>. Permanent: a retired result keeps its code.
  code: string
  title: string
  subject: string
  // The one restrained sentence above the fold.
  sentence: string
  // The exact, narrow claim, in standard terms. No program vocabulary.
  claim: string
  headline: { value: string; label: string }
  category: Category
  status: Status[]
  depth: string
  audience: string
  // The one-minute version.
  question: string
  answer: string
  importance: string
  // What it does not show, above the fold.
  limits: string[]
  // The five-minute version.
  equations: string[]
  measurements: Measurement[]
  figure: Figure
  comparison: { standard: string; vibe: string; difference: string }
  closest: { work: string; established: string; difference: string }[]
  // The date of the systematic literature pass, or null when it has not been run.
  literature: string | null
  gate: Gate
  // The specific ways this result could be broken, naming its own steps.
  failure: string[]
  // The capsule label.
  novelty: Novelty
  free_parameters: number | null
  fitted: boolean
  known_before: boolean
  falsified_by: string
  version: string
  audited: string
  history: { version: string; date: string; change: string }[]
  depends: string[]
  experiments: { code: string; file: string; depends: string[] }[]
  checks: Check[]
  notes: string[]
  problem: string | null
  candidate: string | null
  paper: string
  // The same result in the program's own words, printed last.
  program: string
  // Projections that exist for this result, by path, or null.
  outputs: {
    technical_note: string | null
    one_page: string | null
    browser_run: string | null
    video: string | null
  }
}

export type Candidate = {
  id: string
  candidate: string
  stands: string
  needs: string
  problem: string | null
}

export type Prediction = {
  id: string
  version: number
  // The date it was frozen, and the commit it was frozen at. A frozen row is never edited.
  frozen: string
  commit: string
  result: string
  vibe: string
  standard: string
  difference: string
  observation: string
  outcome: 'pending' | 'confirmed' | 'refuted'
}

export type Problem = {
  id: string
  title: string
  question: string
  known: string
  unknown: string
  why: string
  skills: string[]
  scope: string
  starting: string[]
  depends: string[]
  source: string
}

export type Objection = {
  objection: string
  measured: string
  verdict: 'stands' | 'answered' | 'open'
  source: string
}

export const LADDER: { level: number; contribution: string; where: string }[] = [
  { level: 0, contribution: 'send a citation', where: 'Submit prior work, on any result' },
  { level: 1, contribution: 'report an error', where: 'Submit counterexample, on any result' },
  { level: 2, contribution: 'reproduce one result', where: 'pnpm result reproduce <code>' },
  { level: 3, contribution: 'attack an open problem', where: 'the open problems' },
  { level: 4, contribution: 'contribute code or a derivation', where: 'a pull request against the experiment' },
  { level: 5, contribution: 'an independent analysis', where: 'your own code, reported as a reproduction' },
  { level: 6, contribution: 'collaborate on a paper', where: 'the planned papers' },
]
