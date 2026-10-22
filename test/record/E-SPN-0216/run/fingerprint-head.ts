// E-SPN-0216: the sector tables of code/measure/register-reduced AS COMMITTED BEFORE the boundary option was added
// (commit 5f72dd22), fingerprinted at R 12 and 16 for every little group in PROBE_MOMENTA, written to
// ../tables-head.json (refuses to overwrite). It reads the committed file from tmp/register-reduced-head.ts, made with
// `git -C <worktree> show 5f72dd22:code/measure/register-reduced.ts`; the experiment recomputes the same fingerprints
// with the current file and compares.
import { existsSync, writeFileSync } from 'node:fs'
import { cubicGroup, littleGroup, sector } from '@/tmp/register-reduced-head'
import { PROBE_MOMENTA, sectorFingerprint } from '@/code/measure/reduced-unitarity'
import type { Sector } from '@/code/measure/register-reduced'

const OUT = `${import.meta.dirname}/../tables-head.json`

if (existsSync(OUT)) {
  throw new Error(`refusing to overwrite ${OUT}`)
}

const group = cubicGroup()
const rows: { R: number; K: number[]; members: number[]; reps: number; fingerprint: string }[] = []

for (const R of [12, 16]) {
  for (const K of PROBE_MOMENTA) {
    const members = littleGroup(group, K)
    const s = sector(group, members, R) as unknown as Sector

    rows.push({ R, K: [...K], members, reps: s.count, fingerprint: sectorFingerprint(s) })
    console.log(`R ${R} K ${K.join(',')}: ${members.length} members, ${s.count} reps, ${sectorFingerprint(s)}`)
  }
}

writeFileSync(OUT, JSON.stringify({ commit: '5f72dd22', rows }, null, 1))
console.log('done')
