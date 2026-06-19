// The BINARY backend of the TypeScript -> railway compiler. Same counter-machine subset of TypeScript as the
// unary backend (code/compute/ts-to-railway.ts), but lowered to the binary register machine
// (code/compute/binary-machine.ts), whose registers are bit-words and whose arithmetic is ripple-carry, the way
// a real CPU works. Because the binary ISA already has add / copy / set as primitives (each one ripple over a
// word), the lowering is direct, no token-by-token gadgets.

import ts from 'typescript'
import type {
  BinaryOp,
  BinaryProgram,
} from '@/code/compute/binary-machine'

export type CompiledBinary = {
  program: BinaryProgram
  registers: Map<string, number>
  returnRegister: number
  parameters: string[]
}

export function compileToBinary(source: string): CompiledBinary {
  const file = ts.createSourceFile(
    'program.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
  )
  const fn = file.statements.find(ts.isFunctionDeclaration)
  if (!fn || !fn.body) {
    throw new Error(
      'expected a single function declaration with a body',
    )
  }

  const registers = new Map<string, number>()
  const reg = (name: string): number => {
    if (!registers.has(name)) {
      registers.set(name, registers.size)
    }

    return registers.get(name)!
  }

  const parameters = fn.parameters.map(
    p => (p.name as ts.Identifier).text,
  )
  for (const p of parameters) {
    reg(p)
  }

  const jump = (): number => reg('$jump') // a scratch register for unconditional back-jumps (both jz branches)
  const one = (): number => reg('$one') // holds the constant 1, for v++

  const code: BinaryOp[] = []
  const emit = (ins: BinaryOp): number => (
    code.push(ins),
    code.length - 1
  )
  const here = (): number => code.length
  const seq = (i: number): void => {
    // point this instruction at the next one in sequence
    const ins = code[i]!
    if ('next' in ins) {
      ;(ins as { next: number }).next = i + 1
    }
  }

  const setConst = (r: number, value: number): void =>
    seq(emit({ op: 'set', reg: r, value, next: 0 }))
  const copy = (dst: number, src: number): void =>
    seq(emit({ op: 'copy', dst, src, next: 0 }))
  const add = (dst: number, src: number): void =>
    seq(emit({ op: 'add', dst, src, next: 0 }))
  const sub1 = (r: number): void =>
    seq(emit({ op: 'sub1', reg: r, next: 0 }))

  const compileBlock = (block: ts.Block): void => {
    for (const stmt of block.statements) {
      compileStatement(stmt)
    }
  }

  const compileStatement = (stmt: ts.Statement): void => {
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        const r = reg((decl.name as ts.Identifier).text)
        const init = decl.initializer
        setConst(
          r,
          init && ts.isNumericLiteral(init) ? Number(init.text) : 0,
        )
      }

      return
    }

    if (ts.isExpressionStatement(stmt)) {
      compileExpression(stmt.expression)

      return
    }

    if (ts.isWhileStatement(stmt)) {
      const cond = stmt.expression
      if (
        !ts.isBinaryExpression(cond) ||
        cond.operatorToken.kind !==
          ts.SyntaxKind.ExclamationEqualsEqualsToken
      ) {
        throw new Error('only `while (id !== 0)` is supported')
      }

      const g = reg((cond.left as ts.Identifier).text)
      const loop = here()
      const jz = emit({ op: 'jz', reg: g, zero: 0, next: 0 })
      ;(code[jz] as { next: number }).next = jz + 1 // body
      compileBlock(stmt.statement as ts.Block)
      emit({ op: 'jz', reg: jump(), zero: loop, next: loop }) // unconditional back-jump (both branches -> loop)
      ;(code[jz] as { zero: number }).zero = here() // exit

      return
    }

    if (ts.isReturnStatement(stmt)) {
      return
    }

    throw new Error(
      `unsupported statement: ${ts.SyntaxKind[stmt.kind]}`,
    )
  }

  const compileExpression = (expr: ts.Expression): void => {
    if (ts.isPostfixUnaryExpression(expr)) {
      const r = reg((expr.operand as ts.Identifier).text)
      if (expr.operator === ts.SyntaxKind.MinusMinusToken) {
        sub1(r)
      } else if (expr.operator === ts.SyntaxKind.PlusPlusToken) {
        setConst(one(), 1)
        add(r, one())
      } else {
        throw new Error('unsupported unary')
      }

      return
    }

    if (ts.isBinaryExpression(expr)) {
      const dst = reg((expr.left as ts.Identifier).text)
      const op = expr.operatorToken.kind
      if (op === ts.SyntaxKind.PlusEqualsToken) {
        add(dst, reg((expr.right as ts.Identifier).text))

        return
      }

      if (op === ts.SyntaxKind.EqualsToken) {
        if (ts.isNumericLiteral(expr.right)) {
          setConst(dst, Number(expr.right.text))
        } else if (ts.isIdentifier(expr.right)) {
          copy(dst, reg(expr.right.text))
        } else {
          throw new Error(
            'assignment rhs must be a number or identifier',
          )
        }

        return
      }

      throw new Error(
        `unsupported binary operator ${ts.SyntaxKind[op]}`,
      )
    }

    throw new Error(
      `unsupported expression: ${ts.SyntaxKind[expr.kind]}`,
    )
  }

  compileBlock(fn.body)
  emit({ op: 'halt' })

  const ret = fn.body.statements.find(ts.isReturnStatement)
  const returnRegister =
    ret && ret.expression && ts.isIdentifier(ret.expression)
      ? reg(ret.expression.text)
      : 0

  return {
    program: { registers: registers.size, code },
    registers,
    returnRegister,
    parameters,
  }
}
