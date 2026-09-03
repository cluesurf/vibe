// Exhaustive relation search on the measured patterns: for each conjugate pair, is there
// a cyclic SHIFT s with pB(b) = pA((b+s)%24), or a MIRROR c with pB(b) = pA((c-b)%24)?
const p: Record<number, string> = {
  5:  'llllKlKlllllKKKKKKlKlKKK',
  6:  'llllKlKKlKlllKKlllKllKKl',
  8:  'KKKKKlKKlKKKKllKKllKllKK',
  11: 'KKKKllKKKKKKllKKKKlllKKl',
  9:  'llKKllKKKKlKKKKKKlKKllKl',
  10: 'KKlllllKlKKlKKlKlKKKKlll',
  13: 'KKKlllllllKlKKKllllKKKKK',
  14: 'KKKlllllKlKllllKKlllllKK',
  16: 'KKKKKKKKKKKKlllKKKKKllKK',
  19: 'KKKKKKKKKKKKllKKKKKlllKK',
  21: 'KKKKKKKKKKKKKKKKKKKKKKKK',
  22: 'KKKKKKKKKKKKKKKKKKKKKKKK',
}
const pairs: [number, number][] = [[5, 6], [8, 11], [9, 10], [13, 14], [16, 19], [21, 22]]
for (const [a, b] of pairs) {
  const A = p[a]!, B = p[b]!
  const shifts: number[] = [], mirrors: number[] = []
  for (let s = 0; s < 24; s++) {
    let shiftOk = true, mirrorOk = true
    for (let i = 0; i < 24; i++) {
      if (B[i] !== A[(i + s) % 24]) shiftOk = false
      if (B[i] !== A[((s - i) % 24 + 24) % 24]) mirrorOk = false
    }
    if (shiftOk) shifts.push(s)
    if (mirrorOk) mirrors.push(s)
  }
  // Hamming distance at best alignment
  let bestHam = 24
  for (let s = 0; s < 24; s++) {
    let h = 0
    for (let i = 0; i < 24; i++) if (B[i] !== A[(i + s) % 24]) h++
    bestHam = Math.min(bestHam, h)
  }
  console.log(`(${a},${b}): shifts=[${shifts.join(',')}] mirrors=[${mirrors.join(',')}] bestShiftHamming=${bestHam}`)
}
// run structure: K-run lengths per pattern
for (const d of [5, 6, 8, 11, 9, 10, 13, 14, 16, 19]) {
  const runs = p[d]!.split(/l+/).filter(Boolean).map(r => r.length)
  console.log(`dir ${d} K-runs: [${runs.join(',')}]`)
}
