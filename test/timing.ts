import { allExperiments } from '@/test/scaffold/suite'
import '@/test/experiment/all'
const ctx = { seed: 1 }
for (const e of allExperiments()) {
  const t = Date.now()
  let status = 'ok'
  try { e.run(ctx) } catch (err) { status = 'ERROR ' + (err as Error).message }
  const ms = Date.now() - t
  if (ms > 800 || status !== 'ok') console.log(`${String(ms).padStart(7)}ms  ${e.id}  ${status}`)
}
console.log('done')
