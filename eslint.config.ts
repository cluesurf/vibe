import LINT from '@cluesurf/wash/lint'

// `test/site/` is a self-contained React Router visualization app with its
// own package.json, lockfile, and tsconfig, plus a generated `.react-router/`
// types tree. It has its own toolchain, so the experiment lint should not
// reach into it. A flat-config entry with only `ignores` is a global ignore.
LINT.push({
  ignores: ['test/site/**'],
})

export default LINT
