// The perturbation-audit gate. A result earns an audited pass only if it is durable and its
// control is live. Durable means it holds nominally and survives an IRRELEVANT perturbation of
// the substrate (a change that should not matter), so it is not a fragile artifact. A live
// control means the claim FAILS under the RELEVANT perturbation (removing the substrate
// ingredient it is supposed to depend on), so it is traced to a genuine cause and is not
// circular. A result that holds under every perturbation, including removing its own cause, has
// no live control and is flagged as circular.

export function auditResult(input: {
  nominal: boolean
  underIrrelevantPerturbation: boolean
  controlFails: boolean
}): { durable: boolean; liveControl: boolean; audited: boolean } {
  const durable = input.nominal && input.underIrrelevantPerturbation
  const liveControl = input.controlFails

  return { durable, liveControl, audited: durable && liveControl }
}
