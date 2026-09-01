// for each L3 experiment: does it (transitively, 3 levels) touch a substrate builder or the base rule?
import { readFileSync } from 'node:fs'
const root = process.cwd()
const l3 = readFileSync(process.argv[2]!, 'utf8').trim().split('\n').map(l => l.split(','))
const SUBSTRATE = /code\/(substrate\/|rule\/|tool\/mesh|tone\/will|model\/vibe|dynamics\/genesis)/
const imports = (file: string): string[] => {
  let src = ''
  try { src = readFileSync(file, 'utf8') } catch { return [] }
  return [...src.matchAll(/from '@\/(code\/[^']+)'/g)].map(m => root + '/' + m[1] + '.ts')
}
for (const [code, id] of l3) {
  // the id may be a second experiment() in a sibling file, find the file that declares it
  let file = `${root}/test/experiment/${id}.ts`
  try { readFileSync(file) } catch {
    const dir = id!.split('/')[0]
    const { execSync } = await import('node:child_process')
    file = execSync(`grep -rl "id: '${id}'" test/experiment/${dir}`).toString().trim().split('\n')[0]!
  }
  const seen = new Set<string>()
  const queue = imports(file)
  let depth = 0
  const touched: string[] = []
  while (queue.length && depth < 400) {
    const f = queue.shift()!
    if (seen.has(f)) continue
    seen.add(f); depth++
    const rel = f.slice(root.length + 1)
    if (SUBSTRATE.test(rel)) touched.push(rel.replace('code/', ''))
    queue.push(...imports(f))
  }
  const src = readFileSync(file, 'utf8')
  const substrates = src.match(/substrates: (\[[^\]]*\]|'any')/)?.[1] ?? '?'
  const control = /control:/.test(src) ? 'ctl' : 'NOCTL'
  console.log([code, id, substrates, control, touched.length ? touched.slice(0, 3).join('+') : 'NO-SUBSTRATE'].join('\t'))
}
