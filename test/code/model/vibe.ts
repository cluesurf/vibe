// Conformance for code/model/vibe: the fluent model DSL. The math here is the COMPOSITION law of the
// builder: vibe() is the committed default config, each setter returns a new builder with exactly one
// field changed (immutably, leaving the original untouched), and chained setters accumulate. describe()
// renders the config. Building and running the world is heavy substrate physics (hyperbolic graph
// construction + spectra), not a math identity, so it is left to the experiments and skipped here.

import { suite, check, equal, ok } from '@/test/code/harness'
import { vibe } from '@/code/model/vibe'

suite('model/vibe: the committed default', [
  check('vibe() is the committed model config', () => {
    const c = vibe().config()
    equal(c.mesh, 'hyperbolic')
    equal(c.tone, 'ternary')
    equal(c.fill, 'ternary-symmetric')
    equal(c.rule, 'signed-majority')
    equal(c.schedule, 'asynchronous')
    equal(c.growth, 'net-positive')
    equal(c.size, 1000)
    equal(c.seed, 1)
  }),
])

suite('model/vibe: setters compose immutably', [
  check('a setter changes one field and leaves the original untouched', () => {
    const base = vibe()
    const sized = base.size(1500)
    equal(base.config().size, 1000, 'the original builder is unchanged')
    equal(sized.config().size, 1500, 'the new builder carries the change')
    equal(sized.config().mesh, 'hyperbolic', 'other fields are inherited')
  }),
  check('chained setters accumulate', () => {
    const c = vibe().size(2000).seed(7).mesh('lattice').tone('binary').config()
    equal(c.size, 2000)
    equal(c.seed, 7)
    equal(c.mesh, 'lattice')
    equal(c.tone, 'binary')
    // untouched fields keep the committed defaults.
    equal(c.fill, 'ternary-symmetric')
    equal(c.growth, 'net-positive')
  }),
  check('each setter targets its own field', () => {
    equal(vibe().fill('ternary-directed').config().fill, 'ternary-directed')
    equal(vibe().rule('signed-majority').config().rule, 'signed-majority')
    equal(vibe().schedule('synchronous').config().schedule, 'synchronous')
    equal(vibe().grow('static').config().growth, 'static')
  }),
])

suite('model/vibe: describe renders the config', [
  check('describe mentions the model and the chosen mesh', () => {
    const text = vibe().mesh('coxeter').describe()
    ok(text.includes('vibe model'), 'has the header')
    ok(text.includes('coxeter'), 'reflects the chosen mesh')
  }),
])
