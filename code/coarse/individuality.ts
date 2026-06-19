// The individuality-transition measures (multi-level-selves plan, E5). A cluster with a blanket is not yet a
// higher individual. A genuine transition needs heritable variation, group-level selection, division of
// labor, conflict suppression, and a single-cell bottleneck, and it is confirmed by two signatures, the
// fitness variance shifts from within-group to between-group (selection now acts on whole groups), and
// independent replication is lost (an isolated member cannot found a lineage alone). These are the measures.

// The Price-equation style partition of fitness variance into between-group and within-group components.
// A transition to group-level individuality shows the ratio crossing above one, between-group dominating.
export function fitnessVariancePartition(groups: number[][]): {
  between: number
  within: number
  ratio: number
} {
  const all = groups.flat()
  const total = all.length
  if (total === 0) return { between: 0, within: 0, ratio: 0 }
  const grandMean = all.reduce((a, b) => a + b, 0) / total
  let between = 0
  let within = 0
  for (const group of groups) {
    if (group.length === 0) continue
    const groupMean = group.reduce((a, b) => a + b, 0) / group.length
    between +=
      (group.length *
        (groupMean - grandMean) *
        (groupMean - grandMean)) /
      total
    for (const f of group)
      within += ((f - groupMean) * (f - groupMean)) / total
  }
  return { between, within, ratio: between / (within + 1e-9) }
}
