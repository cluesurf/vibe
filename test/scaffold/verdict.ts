// The structured result a test returns, in place of a printed "SOLVED" string.
// Status, the measured numbers, the control comparison, and the one-sentence
// claim are data, so suites and reports read every test the same way.

export type Verdict = {
  status: 'pass' | 'fail' | 'partial' | 'open'
  // one sentence, what was shown.
  claim: string
  // the measured numbers.
  metrics: Record<string, number>
  // the null or comparison numbers. Required for a deep (L3) claim.
  control?: Record<string, number>
  // caveats, the audit flag.
  notes?: string
}

export function verdict(value: Verdict): Verdict {
  return value
}
