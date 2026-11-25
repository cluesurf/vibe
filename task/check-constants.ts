// Does any experiment's verdict rest on a constant someone typed?
//
// The methodology's own rule: a constant set by hand that then appears in the conclusion makes a test
// circular. On 2026-08-31, 24 such sites in 20 files printed PASSED (`const bosonShellsTouched = 1`,
// `const decaysWithoutLeptoquarks = false`, `const hasRouting = true`, and so on). This check parses
// every experiment with TypeScript's AST, resolves lexical scopes, and reports every
// `const name = <literal boolean or small integer>` that makes a statically constant truth claim
// reaching a verdict (`verdict({ status })`, `ok`, `solved`, `status`, or a guard returning a verdict).
//
// Legitimate indices, loop bounds, thresholds compared against runtime measurements, and unrelated
// shadowed identifiers are ignored because they do not produce a compile-time-constant verdict claim.
//
// Reports only. There is no --commit, because the fix is a judgement (measure it, or move it out of the
// conjunction into notes as a stated assumption), never a rewrite.
//
//   pnpm check:constants

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

export interface TypedConstHit {
  readonly name: string
  readonly line: number
  readonly text: string
}

interface TypedConst {
  readonly name: string
  readonly line: number
  readonly text: string
  readonly kind: 'boolean' | 'number'
  readonly value: boolean | number
  readonly declNode: ts.VariableDeclaration
}

interface Binding {
  readonly name: string
  readonly declNode: ts.Node
  readonly isConst: boolean
  typed?: TypedConst
  initializer?: ts.Expression
  readonly assignments: ts.Expression[]
}

interface Scope {
  readonly parent?: Scope
  readonly bindings: Map<string, Binding>
}

const PURE_CALLS = new Set([
  'Boolean',
  'Number',
  'Math.abs',
  'Math.sign',
  'Math.floor',
  'Math.ceil',
  'Math.round',
  'Math.trunc',
  'Math.sqrt',
  'Math.min',
  'Math.max',
  'Math.pow',
])

const VERDICT_VAR_NAME = /^(ok|solved|status|passed)$/i

function unwrapExpression(expr: ts.Expression): ts.Expression {
  let cur = expr

  while (true) {
    if (
      ts.isParenthesizedExpression(cur) ||
      ts.isAsExpression(cur) ||
      ts.isSatisfiesExpression(cur) ||
      ts.isNonNullExpression(cur) ||
      ts.isTypeAssertionExpression(cur)
    ) {
      cur = cur.expression
    } else {
      return cur
    }
  }
}

function asTypedLiteral(
  expr: ts.Expression,
): { kind: 'boolean'; value: boolean } | { kind: 'number'; value: number } | null {
  const inner = unwrapExpression(expr)

  if (inner.kind === ts.SyntaxKind.TrueKeyword) {
    return { kind: 'boolean', value: true }
  }

  if (inner.kind === ts.SyntaxKind.FalseKeyword) {
    return { kind: 'boolean', value: false }
  }

  if (ts.isNumericLiteral(inner)) {
    const num = Number(inner.text)

    if (num === 0 || num === 1) {
      return { kind: 'number', value: num }
    }

    return null
  }

  if (
    ts.isPrefixUnaryExpression(inner) &&
    (inner.operator === ts.SyntaxKind.MinusToken ||
      inner.operator === ts.SyntaxKind.PlusToken) &&
    ts.isNumericLiteral(inner.operand)
  ) {
    const sign = inner.operator === ts.SyntaxKind.MinusToken ? -1 : 1
    const num = sign * Number(inner.operand.text)

    if (num === -1 || num === 0 || num === 1) {
      return { kind: 'number', value: num }
    }
  }

  return null
}

function isScopeNode(node: ts.Node): boolean {
  return (
    ts.isSourceFile(node) ||
    ts.isBlock(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node) ||
    ts.isForStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isCatchClause(node) ||
    ts.isCaseBlock(node) ||
    ts.isModuleBlock(node)
  )
}

function bindPattern(
  name: ts.BindingName,
  scope: Scope,
  isConst: boolean,
): void {
  if (ts.isIdentifier(name)) {
    scope.bindings.set(name.text, {
      name: name.text,
      declNode: name,
      isConst,
      assignments: [],
    })

    return
  }

  for (const elem of name.elements) {
    if (ts.isBindingElement(elem)) {
      bindPattern(elem.name, scope, isConst)
    }
  }
}

function calleeName(expr: ts.Expression): string | null {
  const inner = unwrapExpression(expr)

  if (ts.isIdentifier(inner)) {
    return inner.text
  }

  if (
    ts.isPropertyAccessExpression(inner) &&
    ts.isIdentifier(inner.expression)
  ) {
    return `${inner.expression.text}.${inner.name.text}`
  }

  return null
}

function isVerdictCall(node: ts.Node): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'verdict'
  )
}

function containsDirectVerdictCall(node: ts.Node): boolean {
  if (isVerdictCall(node)) {
    return true
  }

  if (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node)
  ) {
    return false
  }

  let found = false

  ts.forEachChild(node, child => {
    if (!found && containsDirectVerdictCall(child)) {
      found = true
    }
  })

  return found
}

function isAssignmentOperator(kind: ts.SyntaxKind): boolean {
  return (
    kind === ts.SyntaxKind.EqualsToken ||
    kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken ||
    kind === ts.SyntaxKind.BarBarEqualsToken ||
    kind === ts.SyntaxKind.QuestionQuestionEqualsToken
  )
}

function isConstantBinaryOp(kind: ts.SyntaxKind): boolean {
  return (
    kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
    kind === ts.SyntaxKind.ExclamationEqualsEqualsToken ||
    kind === ts.SyntaxKind.EqualsEqualsToken ||
    kind === ts.SyntaxKind.ExclamationEqualsToken ||
    kind === ts.SyntaxKind.LessThanToken ||
    kind === ts.SyntaxKind.LessThanEqualsToken ||
    kind === ts.SyntaxKind.GreaterThanToken ||
    kind === ts.SyntaxKind.GreaterThanEqualsToken ||
    kind === ts.SyntaxKind.PlusToken ||
    kind === ts.SyntaxKind.MinusToken ||
    kind === ts.SyntaxKind.AsteriskToken ||
    kind === ts.SyntaxKind.SlashToken ||
    kind === ts.SyntaxKind.PercentToken ||
    kind === ts.SyntaxKind.AsteriskAsteriskToken ||
    kind === ts.SyntaxKind.AmpersandToken ||
    kind === ts.SyntaxKind.BarToken ||
    kind === ts.SyntaxKind.CaretToken ||
    kind === ts.SyntaxKind.LessThanLessThanToken ||
    kind === ts.SyntaxKind.GreaterThanGreaterThanToken ||
    kind === ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken ||
    kind === ts.SyntaxKind.AmpersandAmpersandToken ||
    kind === ts.SyntaxKind.BarBarToken ||
    kind === ts.SyntaxKind.QuestionQuestionToken
  )
}

export function findTypedConstantsInSource(
  sourceText: string,
  fileName = 'input.ts',
): TypedConstHit[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  )
  const lines = sourceText.split('\n')
  const scopeOf = new Map<ts.Node, Scope>()
  const functionDecls = new Map<Binding, ts.FunctionLikeDeclaration>()

  const getScope = (node: ts.Node): Scope => {
    let cur: ts.Node | undefined = node

    while (cur) {
      const hit = scopeOf.get(cur)

      if (hit) {
        return hit
      }

      cur = cur.parent
    }

    return scopeOf.get(sourceFile)!
  }

  const resolveBinding = (
    name: string,
    start: Scope,
  ): Binding | undefined => {
    let cur: Scope | undefined = start

    while (cur) {
      const hit = cur.bindings.get(name)

      if (hit) {
        return hit
      }

      cur = cur.parent
    }

    return undefined
  }

  // Pass 1: build lexical scope tree and register all declarations
  const buildScopes = (node: ts.Node, current: Scope): void => {
    let scope = current

    if (isScopeNode(node)) {
      scope = { parent: node === sourceFile ? undefined : current, bindings: new Map() }
      scopeOf.set(node, scope)
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      const binding: Binding = {
        name: node.name.text,
        declNode: node,
        isConst: true,
        assignments: [],
      }

      current.bindings.set(node.name.text, binding)
      functionDecls.set(binding, node)
    } else if (ts.isClassDeclaration(node) && node.name) {
      current.bindings.set(node.name.text, {
        name: node.name.text,
        declNode: node,
        isConst: true,
        assignments: [],
      })
    } else if (ts.isEnumDeclaration(node)) {
      current.bindings.set(node.name.text, {
        name: node.name.text,
        declNode: node,
        isConst: true,
        assignments: [],
      })
    } else if (ts.isImportClause(node)) {
      if (node.name) {
        current.bindings.set(node.name.text, {
          name: node.name.text,
          declNode: node.name,
          isConst: true,
          assignments: [],
        })
      }

      if (node.namedBindings) {
        if (ts.isNamespaceImport(node.namedBindings)) {
          current.bindings.set(node.namedBindings.name.text, {
            name: node.namedBindings.name.text,
            declNode: node.namedBindings.name,
            isConst: true,
            assignments: [],
          })
        } else {
          for (const spec of node.namedBindings.elements) {
            current.bindings.set(spec.name.text, {
              name: spec.name.text,
              declNode: spec.name,
              isConst: true,
              assignments: [],
            })
          }
        }
      }
    } else if (ts.isParameter(node)) {
      bindPattern(node.name, scope, false)
    } else if (ts.isCatchClause(node) && node.variableDeclaration) {
      bindPattern(node.variableDeclaration.name, scope, false)
    } else if (ts.isVariableDeclarationList(node)) {
      const isConst = (node.flags & ts.NodeFlags.Const) !== 0

      for (const decl of node.declarations) {
        if (ts.isIdentifier(decl.name)) {
          const binding: Binding = {
            name: decl.name.text,
            declNode: decl,
            isConst,
            initializer: decl.initializer,
            assignments: [],
          }

          if (isConst && decl.initializer) {
            const lit = asTypedLiteral(decl.initializer)

            if (lit) {
              const line =
                sourceFile.getLineAndCharacterOfPosition(
                  decl.getStart(sourceFile),
                ).line + 1

              binding.typed = {
                name: decl.name.text,
                line,
                text: (lines[line - 1] ?? '').trim().slice(0, 100),
                kind: lit.kind,
                value: lit.value,
                declNode: decl,
              }
            } else {
              const initInner = unwrapExpression(decl.initializer)

              if (
                ts.isArrowFunction(initInner) ||
                ts.isFunctionExpression(initInner)
              ) {
                functionDecls.set(binding, initInner)
              }
            }
          }

          scope.bindings.set(decl.name.text, binding)
        } else {
          bindPattern(decl.name, scope, isConst)
        }
      }
    }

    ts.forEachChild(node, child => buildScopes(child, scope))
  }

  const rootScope: Scope = { bindings: new Map() }

  buildScopes(sourceFile, rootScope)

  // Pass 2: record assignments to mutable variables
  const recordAssignments = (node: ts.Node): void => {
    if (
      ts.isBinaryExpression(node) &&
      isAssignmentOperator(node.operatorToken.kind) &&
      ts.isIdentifier(node.left)
    ) {
      const binding = resolveBinding(node.left.text, getScope(node.left))

      if (binding) {
        binding.assignments.push(node.right)
      }
    }

    ts.forEachChild(node, recordAssignments)
  }

  recordAssignments(sourceFile)

  // Static constant evaluation: returns set of contributing TypedConsts iff expression is compile-time constant
  const evalConst = (
    expr: ts.Expression,
    visiting: Set<Binding>,
  ): Set<TypedConst> | null => {
    const inner = unwrapExpression(expr)

    if (
      inner.kind === ts.SyntaxKind.TrueKeyword ||
      inner.kind === ts.SyntaxKind.FalseKeyword ||
      inner.kind === ts.SyntaxKind.NullKeyword ||
      ts.isNumericLiteral(inner) ||
      ts.isBigIntLiteral(inner) ||
      ts.isStringLiteral(inner) ||
      ts.isNoSubstitutionTemplateLiteral(inner)
    ) {
      return new Set()
    }

    if (ts.isIdentifier(inner)) {
      if (
        inner.text === 'undefined' ||
        inner.text === 'NaN' ||
        inner.text === 'Infinity'
      ) {
        return new Set()
      }

      const binding = resolveBinding(inner.text, getScope(inner))

      if (!binding) {
        return null
      }

      if (binding.typed) {
        return new Set([binding.typed])
      }

      if (
        binding.isConst &&
        binding.initializer &&
        !visiting.has(binding)
      ) {
        visiting.add(binding)

        const res = evalConst(binding.initializer, visiting)

        visiting.delete(binding)

        return res
      }

      return null
    }

    if (
      ts.isPrefixUnaryExpression(inner) &&
      (inner.operator === ts.SyntaxKind.ExclamationToken ||
        inner.operator === ts.SyntaxKind.MinusToken ||
        inner.operator === ts.SyntaxKind.PlusToken ||
        inner.operator === ts.SyntaxKind.TildeToken)
    ) {
      return evalConst(inner.operand, visiting)
    }

    if (
      ts.isBinaryExpression(inner) &&
      isConstantBinaryOp(inner.operatorToken.kind)
    ) {
      const left = evalConst(inner.left, visiting)

      if (!left) {
        return null
      }

      const right = evalConst(inner.right, visiting)

      if (!right) {
        return null
      }

      return new Set([...left, ...right])
    }

    if (ts.isConditionalExpression(inner)) {
      const cond = evalConst(inner.condition, visiting)
      const whenTrue = evalConst(inner.whenTrue, visiting)
      const whenFalse = evalConst(inner.whenFalse, visiting)

      if (cond && whenTrue && whenFalse) {
        return new Set([...cond, ...whenTrue, ...whenFalse])
      }

      return null
    }

    if (ts.isCallExpression(inner)) {
      const name = calleeName(inner.expression)

      if (name && PURE_CALLS.has(name)) {
        const deps = new Set<TypedConst>()

        for (const arg of inner.arguments) {
          const argDeps = evalConst(arg, visiting)

          if (!argDeps) {
            return null
          }

          for (const dep of argDeps) {
            deps.add(dep)
          }
        }

        return deps
      }
    }

    return null
  }

  const flagged = new Map<ts.VariableDeclaration, TypedConst>()
  const visitedBindings = new Set<Binding>()

  const mark = (sym: TypedConst): void => {
    flagged.set(sym.declNode, sym)
  }

  const collectFromReturns = (node: ts.Node): void => {
    if (ts.isReturnStatement(node) && node.expression) {
      collectVerdictConstants(node.expression)

      return
    }

    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node)
    ) {
      return
    }

    ts.forEachChild(node, collectFromReturns)
  }

  const collectFromBinding = (binding: Binding): void => {
    if (visitedBindings.has(binding)) {
      return
    }

    visitedBindings.add(binding)

    if (binding.typed) {
      mark(binding.typed)

      return
    }

    if (binding.initializer) {
      collectVerdictConstants(binding.initializer)
    }

    for (const rhs of binding.assignments) {
      collectVerdictConstants(rhs)
    }
  }

  const collectVerdictConstants = (expr: ts.Expression): void => {
    const inner = unwrapExpression(expr)
    const constDeps = evalConst(inner, new Set())

    if (constDeps && constDeps.size > 0) {
      for (const sym of constDeps) {
        mark(sym)
      }

      return
    }

    if (
      ts.isPrefixUnaryExpression(inner) &&
      inner.operator === ts.SyntaxKind.ExclamationToken
    ) {
      collectVerdictConstants(inner.operand)

      return
    }

    if (ts.isBinaryExpression(inner)) {
      const op = inner.operatorToken.kind

      if (
        op === ts.SyntaxKind.AmpersandAmpersandToken ||
        op === ts.SyntaxKind.BarBarToken ||
        op === ts.SyntaxKind.QuestionQuestionToken
      ) {
        collectVerdictConstants(inner.left)
        collectVerdictConstants(inner.right)

        return
      }

      if (
        op === ts.SyntaxKind.EqualsEqualsEqualsToken ||
        op === ts.SyntaxKind.ExclamationEqualsEqualsToken ||
        op === ts.SyntaxKind.EqualsEqualsToken ||
        op === ts.SyntaxKind.ExclamationEqualsToken
      ) {
        const leftLit = asTypedLiteral(inner.left)
        const rightLit = asTypedLiteral(inner.right)

        if (leftLit?.kind === 'boolean') {
          collectVerdictConstants(inner.right)
        } else if (rightLit?.kind === 'boolean') {
          collectVerdictConstants(inner.left)
        }
      }

      return
    }

    if (ts.isConditionalExpression(inner)) {
      collectVerdictConstants(inner.condition)
      collectVerdictConstants(inner.whenTrue)
      collectVerdictConstants(inner.whenFalse)

      return
    }

    if (ts.isIdentifier(inner)) {
      const binding = resolveBinding(inner.text, getScope(inner))

      if (binding) {
        collectFromBinding(binding)
      }

      return
    }

    if (ts.isPropertyAccessExpression(inner)) {
      const obj = unwrapExpression(inner.expression)

      if (ts.isIdentifier(obj)) {
        const binding = resolveBinding(obj.text, getScope(obj))

        if (binding?.isConst && binding.initializer) {
          const init = unwrapExpression(binding.initializer)

          if (ts.isObjectLiteralExpression(init)) {
            for (const prop of init.properties) {
              if (
                ts.isPropertyAssignment(prop) &&
                ts.isIdentifier(prop.name) &&
                prop.name.text === inner.name.text
              ) {
                collectVerdictConstants(prop.initializer)
              } else if (
                ts.isShorthandPropertyAssignment(prop) &&
                prop.name.text === inner.name.text
              ) {
                const propBinding = resolveBinding(
                  prop.name.text,
                  getScope(prop.name),
                )

                if (propBinding) {
                  collectFromBinding(propBinding)
                }
              }
            }
          }
        }
      }

      return
    }

    if (ts.isObjectLiteralExpression(inner)) {
      for (const prop of inner.properties) {
        if (ts.isPropertyAssignment(prop)) {
          collectVerdictConstants(prop.initializer)
        } else if (ts.isShorthandPropertyAssignment(prop)) {
          const binding = resolveBinding(
            prop.name.text,
            getScope(prop.name),
          )

          if (binding) {
            collectFromBinding(binding)
          }
        } else if (ts.isSpreadAssignment(prop)) {
          collectVerdictConstants(prop.expression)
        }
      }

      return
    }

    if (ts.isArrayLiteralExpression(inner)) {
      for (const elem of inner.elements) {
        if (ts.isSpreadElement(elem)) {
          collectVerdictConstants(elem.expression)
        } else {
          collectVerdictConstants(elem)
        }
      }

      return
    }

    if (ts.isCallExpression(inner)) {
      const fnExpr = unwrapExpression(inner.expression)

      if (
        ts.isPropertyAccessExpression(fnExpr) &&
        (fnExpr.name.text === 'every' || fnExpr.name.text === 'some')
      ) {
        const recv = unwrapExpression(fnExpr.expression)

        if (ts.isCallExpression(recv)) {
          const recvName = calleeName(recv.expression)

          if (
            (recvName === 'Object.values' ||
              recvName === 'Object.entries') &&
            recv.arguments[0]
          ) {
            collectVerdictConstants(recv.arguments[0])
          }
        } else if (ts.isArrayLiteralExpression(recv)) {
          collectVerdictConstants(recv)
        } else if (ts.isIdentifier(recv)) {
          const recvBinding = resolveBinding(recv.text, getScope(recv))

          if (
            recvBinding?.isConst &&
            recvBinding.initializer &&
            (ts.isArrayLiteralExpression(
              unwrapExpression(recvBinding.initializer),
            ) ||
              ts.isObjectLiteralExpression(
                unwrapExpression(recvBinding.initializer),
              ))
          ) {
            collectVerdictConstants(recvBinding.initializer)
          }
        }

        const cb = inner.arguments[0]
          ? unwrapExpression(inner.arguments[0])
          : undefined

        if (cb && (ts.isArrowFunction(cb) || ts.isFunctionExpression(cb))) {
          if (ts.isBlock(cb.body)) {
            collectFromReturns(cb.body)
          } else {
            collectVerdictConstants(cb.body)
          }
        }

        return
      }

      if (ts.isIdentifier(fnExpr)) {
        if (fnExpr.text === 'Boolean' && inner.arguments[0]) {
          collectVerdictConstants(inner.arguments[0])

          return
        }

        const fnBinding = resolveBinding(fnExpr.text, getScope(fnExpr))

        if (fnBinding) {
          const decl = functionDecls.get(fnBinding)

          if (decl?.body && !visitedBindings.has(fnBinding)) {
            visitedBindings.add(fnBinding)

            if (ts.isBlock(decl.body)) {
              collectFromReturns(decl.body)
            } else {
              collectVerdictConstants(decl.body)
            }
          }
        }
      }
    }
  }

  const checkVerdictObject = (obj: ts.ObjectLiteralExpression): void => {
    for (const prop of obj.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === 'status'
      ) {
        collectVerdictConstants(prop.initializer)
      } else if (
        ts.isShorthandPropertyAssignment(prop) &&
        prop.name.text === 'status'
      ) {
        const binding = resolveBinding('status', getScope(prop.name))

        if (binding) {
          collectFromBinding(binding)
        }
      }
    }
  }

  // Pass 3: walk all verdict roots
  const walkRoots = (node: ts.Node): void => {
    if (isVerdictCall(node) && node.arguments[0]) {
      const arg = unwrapExpression(node.arguments[0])

      if (ts.isObjectLiteralExpression(arg)) {
        checkVerdictObject(arg)
      } else if (ts.isIdentifier(arg)) {
        const binding = resolveBinding(arg.text, getScope(arg))

        if (binding?.isConst && binding.initializer) {
          const init = unwrapExpression(binding.initializer)

          if (ts.isObjectLiteralExpression(init)) {
            checkVerdictObject(init)
          }
        }
      }
    } else if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      VERDICT_VAR_NAME.test(node.name.text)
    ) {
      const binding = resolveBinding(node.name.text, getScope(node))

      if (binding) {
        collectFromBinding(binding)
      }
    } else if (ts.isIfStatement(node)) {
      if (
        containsDirectVerdictCall(node.thenStatement) ||
        (node.elseStatement &&
          containsDirectVerdictCall(node.elseStatement))
      ) {
        collectVerdictConstants(node.expression)
      }
    }

    ts.forEachChild(node, walkRoots)
  }

  walkRoots(sourceFile)

  return [...flagged.values()]
    .sort((a, b) => a.line - b.line)
    .map(({ name, line, text }) => ({ name, line, text }))
}

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)

    if (statSync(path).isDirectory()) {
      walk(path, found)
    } else if (name.endsWith('.ts') && !name.startsWith('all.')) {
      found.push(path)
    }
  }

  return found
}

function main(): void {
  const root = process.cwd()
  const files = walk(join(root, 'test', 'experiment'))

  let sites = 0

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const hits = findTypedConstantsInSource(source, file)

    for (const hit of hits) {
      sites++
      console.log(
        `  typed     ${relative(root, file)}:${hit.line}  ${hit.text}`,
      )
    }
  }

  console.log(
    `\ncheck:constants  ${sites} typed constant${sites === 1 ? '' : 's'} reaching a verdict`,
  )

  if (sites > 0) {
    process.exit(1)
  }
}

const isEntry =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntry) {
  main()
}
