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
//
// The determinism rule (2026-09-25): nothing in code/, test/ or research/ may
// call Math.random or import the retired seeded generator code/tool/rng, or the
// retired hash generator hashRand. Every spread-out value comes from
// code/tool/weyl. E-MTH-0015 holds the same rule as an experiment, so it is
// enforced whether or not the lint runs. The retired generator's own old
// conformance file is exempt until it is deleted.
const DETERMINISM = {
  files: ['code/**/*.ts', 'test/**/*.ts', 'research/**/*.ts'],
  ignores: ['code/tool/rng.ts', 'test/code/tool/rng.ts'],
  rules: {
    'no-restricted-properties': [
      'error',
      {
        object: 'Math',
        property: 'random',
        message:
          'no random numbers: read a Weyl sequence from @/code/tool/weyl',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/code/tool/rng', '**/tool/rng'],
            message:
              'code/tool/rng is retired: use makeWeyl from @/code/tool/weyl',
          },
        ],
        paths: [
          {
            name: '@/code/dynamics/conserving-sweep',
            importNames: ['hashRand'],
            message:
              'hashRand is retired: use weylCell from @/code/tool/weyl',
          },
        ],
      },
    ],
  },
}

export default [
  ...LINT,
  { ignores: ['test/site/**', '**/*.tsx'] },
  DETERMINISM,
]
