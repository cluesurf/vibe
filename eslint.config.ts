import LINT from '@cluesurf/wash/lint'

// Extend the shared wash config with a few readability rules.
export default [
  ...LINT,
  {
    rules: {
      // `curly: all` forces braces on every control statement
      // (if / else / for / while), so single-line bodies like
      // `if (x) doThing()` are never allowed without `{ }`.
      curly: ['error', 'all'],

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
  },
]
