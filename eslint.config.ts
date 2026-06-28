import LINT from '@cluesurf/wash/lint'

// `test/site/` is a self-contained React Router visualization app with its
// own package.json, lockfile, and tsconfig, plus a generated `.react-router/`
// types tree. It has its own toolchain, so the experiment lint should not
// reach into it. A flat-config entry with only `ignores` is a global ignore.
LINT.push({
  ignores: ['test/site/**'],
})

// Extend the shared wash config with a few readability rules. We push
// onto `LINT` and export the binding directly (rather than a computed
// array), so the exported type stays wash's own nameable config type.
// A new array literal or `.concat(...)` would force TS to inline the
// typescript-eslint config type, which is not nameable here (TS2742).
LINT.push({
  rules: {
    // `curly: all` forces braces on every control statement
    // (if / else / for / while), so single-line bodies like
    // `if (x) doThing()` are never allowed without `{ }`.
    curly: ['error', 'all'],

    // Honor the leading-underscore convention for intentionally-unused
    // bindings: a callback that must keep a fixed positional arity (e.g.
    // a `(left, center, right)` rule kernel that only reads `center`)
    // names the unused slots `_left` / `_right`, and a caught error it
    // does not inspect is `_`. These are deliberate, not dead code.
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    // Prefer the array shorthand everywhere: `T[]` over `Array<T>`
    // and `readonly T[]` over `ReadonlyArray<T>`. Nested types get
    // parens, e.g. `readonly (readonly number[])[]`.
    '@typescript-eslint/array-type': ['error', { default: 'array' }],

    // Blank line between class members (methods / fields), except
    // after a single-line member, so tight one-liners can group.
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],

    // Breathing room at the natural seams of a block. Each entry
    // requires a blank line at that boundary (auto-fixable).
    'padding-line-between-statements': [
      'error',
      // separate the import block from the body
      { blankLine: 'always', prev: 'import', next: '*' },
      { blankLine: 'any', prev: 'import', next: 'import' },
      // keep same-kind declarations grouped, but put a blank line
      // between a `const` group and a `let` group (and vice versa)
      { blankLine: 'always', prev: 'const', next: 'let' },
      { blankLine: 'always', prev: 'let', next: 'const' },
      // a declaration that follows ordinary (expression) statements
      // starts a new group, so give it a blank line before it
      {
        blankLine: 'always',
        prev: 'expression',
        next: ['const', 'let'],
      },
      // a multi-line declaration (e.g. a function-bodied const)
      // gets a blank line after it
      {
        blankLine: 'always',
        prev: ['multiline-const', 'multiline-let'],
        next: '*',
      },
      // breathing room BEFORE and AFTER a block-like statement
      // (if / for / while / switch / try)
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      // around function and class declarations
      { blankLine: 'always', prev: '*', next: ['function', 'class'] },
      { blankLine: 'always', prev: ['function', 'class'], next: '*' },
      // before every `return`
      { blankLine: 'always', prev: '*', next: 'return' },
    ],
  },
})

export default LINT
