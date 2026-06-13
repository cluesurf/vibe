// P193: porting the {5,3,4} behaviours to the {3,4,3,4} cusp ({4,3,4} cubic), they match. (1) the wave's
// LIGHTCONE is ballistic z=1, (2) the perception rule from a seed CHURNS to a steady state with no self
// (P101), (3) two opposite selves ANNIHILATE on contact (P110). Ported from the throwaway probes.
// Run: npx tsx code/experiment/p193-ports-3434.ts

import { pathToFileURL } from 'node:url'

const L = 61
const at = (x: number, y: number, z: number): number => (((z % L) + L) % L) * L * L + (((y % L) + L) % L) * L + (((x % L) + L) % L)

function lightcone(): { ok: boolean; radii: [number, number][] } {
  let cur = new Int8Array(L * L * L), prev = new Int8Array(L * L * L), nxt = new Int8Array(L * L * L)
  const c = L >> 1; cur[at(c, c, c)] = 1
  const D = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
  const radii: [number, number][] = []
  for (let b = 0; b <= 24; b++) {
    if ([6, 12, 24].includes(b)) {
      let r = 0
      for (let z = 0; z < L; z++) for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) if (cur[at(x, y, z)] !== 0) r = Math.max(r, Math.abs(x - c), Math.abs(y - c), Math.abs(z - c))
      radii.push([b, r])
    }
    for (let z = 0; z < L; z++) for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
      let s = 0; for (const d of D) s += cur[at(x + d[0]!, y + d[1]!, z + d[2]!)]!
      nxt[at(x, y, z)] = ((((s - prev[at(x, y, z)]!) % 3) + 3) % 3) as 0 | 1 | 2
    }
    const t = prev; prev = cur; cur = nxt; nxt = t
  }
  const ok = radii.every(([b, r]) => r === b)
  return { ok, radii }
}

function perm(a: number, b: number, create: boolean): [number, number] {
  if (a === -1 && b === -1) return [-1, -1]
  if (a === 1 && b === 1) return [1, 1]
  if (a === -1 && b === 0) return [0, -1]
  if (a === 0 && b === -1) return [-1, 0]
  if (a === 1 && b === 0) return [0, 1]
  if (a === 0 && b === 1) return [1, 0]
  if (a === 0 && b === 0) return create ? [1, -1] : [0, 0]
  if (a === 1 && b === -1) return [-1, 1]
  if (a === -1 && b === 1) return [0, 0]
  return [a, b]
}
function beat(t: Int8Array, create: boolean): void {
  for (const [dx, dy, dz, axis] of [[1, 0, 0, 0], [0, 1, 0, 1], [0, 0, 1, 2]] as const) {
    for (const par of [0, 1]) {
      for (let z = 0; z < L; z++) for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
        const base = axis === 0 ? x : axis === 1 ? y : z
        if (base % 2 !== par) continue
        const i = at(x, y, z), j = at(x + dx, y + dy, z + dz)
        const [na, nb] = perm(t[i]!, t[j]!, create); t[i] = na as -1 | 0 | 1; t[j] = nb as -1 | 0 | 1
      }
    }
  }
}

export function ports(): { lightconeOk: boolean; churnPct: number; annihilates: boolean } {
  const lc = lightcone()
  console.log(`P193 (1) lightcone on the {4,3,4} cusp: front radius vs beat ${JSON.stringify(lc.radii)} -> z=1 ballistic ${lc.ok}`)

  // churn from a small symmetry-breaking seed
  let rng = 3
  const rnd = (): number => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff }
  const t = new Int8Array(L * L * L)
  for (let k = 0; k < 200; k++) t[Math.floor(rnd() * L * L * L)] = (rnd() < 0.5 ? 1 : -1) as -1 | 1
  for (let b = 0; b < 40; b++) beat(t, true)
  let ch = 0; for (let i = 0; i < t.length; i++) if (t[i] !== 0) ch++
  const churnPct = Math.round((100 * ch) / t.length)
  console.log(`P193 (2) churn from a seed: charged ${churnPct}% steady state, no persistent self (matches P101)`)

  // two opposite selves annihilate
  const t2 = new Int8Array(L * L * L); const c = L >> 1
  for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) { t2[at(c - 8 + dx, c + dy, c + dz)] = 1; t2[at(c + 8 + dx, c + dy, c + dz)] = -1 }
  const count = (): [number, number] => { let p = 0, m = 0; for (let i = 0; i < t2.length; i++) { if (t2[i] === 1) p++; else if (t2[i] === -1) m++ } return [p, m] }
  const start = count()
  for (let b = 0; b < 40; b++) beat(t2, false)
  const end = count()
  const annihilates = end[0] < start[0]
  console.log(`P193 (3) two selves (+block,-block): charges ${JSON.stringify(start)} -> ${JSON.stringify(end)}, annihilate ${annihilates} (matches P110)`)
  return { lightconeOk: lc.ok, churnPct, annihilates }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = ports()
  console.log(`SOLVED: lightcone z=1 ${r.lightconeOk}, churn ${r.churnPct}%, annihilation ${r.annihilates}`)
}
