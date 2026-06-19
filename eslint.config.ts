import LINT from '@cluesurf/wash/lint'

// Extend the shared wash config. `curly: all` forces braces on every
// control statement (if / else / for / while), so single-line bodies
// like `if (x) doThing()` are never allowed without `{ }`.
export default [
  ...LINT,
  {
    rules: {
      curly: ['error', 'all'],
    },
  },
]
