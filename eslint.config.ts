import LINT from '@cluesurf/wash/lint'

// `test/site/` is a self-contained React Router visualization app with its
// own package.json, lockfile, and tsconfig, plus a generated `.react-router/`
// types tree. It has its own toolchain, so the experiment lint should not
// reach into it. A flat-config entry with only `ignores` is a global ignore.
//
// `**/*.tsx` is ignored too: the main tsconfig is `.ts`-only (no jsx), so the
// lone React view under `code/render/react/` is not in the type-checked
// program. Type-aware eslint would fail to parse it ("not found by the project
// service"); the site app's own toolchain owns those files.
//
// Spread rather than `LINT.push(...)`: ESLint loads this config through jiti,
// whose ESM interop can hand `LINT` back wrapped, so mutating it in place is
// unreliable. Building a fresh array from the spread is stable.
export default [...LINT, { ignores: ['test/site/**', '**/*.tsx'] }]
