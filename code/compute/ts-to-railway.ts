// A small TypeScript -> railway-machine COMPILER. It parses a function written in a counter-machine subset of
// TypeScript (with the real TypeScript parser) and lowers it to the Minsky register-machine IR that the railway
// runs (code/compute/railway.ts, the model the uniform CA realizes). So a high-level `fib(n)` becomes literal
// machine code, inc / dec-jump instructions, that a single locomotive executes on the tiling.
//
// Supported subset (everything is a natural-number register):
//   function name(p1, p2, ...) { ... return v }   parameters and the return become registers
//   let v = <number>                               declare a register, initialized by repeated inc
//   v++  /  v--                                    increment / decrement (decrement stops at zero)
//   v = <number>                                   clear then set to a constant
//   v = w            (w an identifier)             copy, source preserved
//   v += w           (w an identifier)             add, source preserved
//   while (v !== 0) { ... }                        loop while a register is non-zero (non-destructive test)
//
// Addition and copy are lowered to the classic counter-machine moves using one scratch register, which is left
// at zero between statements. The non-destructive `while` uses the dec-then-restore idiom, so the guard register
// is not consumed by the test (the body may decrement it).

import ts from 'typescript'
import type {
  RailInstruction,
  RailProgram,
} from '@/code/compute/railway'

export type CompiledRailway = {
  program: RailProgram
  // the source-name -> register-index map, so a caller can read a named result out of runRailway's output
  registers: Map<string, number>
  returnRegister: number
  parameters: string[]
  // opIndex[i] = the high-level source operation that instruction i implements (for operation-paced animation)
  opIndex: number[]
}

export function compileToRailway(
  source: string,
  options: { capacity?: number } = {},
): CompiledRailway {
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
  } // parameters are registers 0..k-1

  const scratch = (): number => reg('$scratch')

  const code: RailInstruction[] = []
  // opIndex[i] = the high-level source operation (statement / macro) that instruction i implements. A consumer
  // can group the unary instruction stream back into operations, so an animation can pace by operations (one
  // per loop body statement) instead of by raw inc / dec steps.
  const opIndex: number[] = []

  let opCounter = 0

  const emit = (ins: RailInstruction): number => (
    code.push(ins),
    opIndex.push(opCounter),
    code.length - 1
  )

  const here = (): number => code.length

  // dst += 1 ; fall through to the next instruction
  const inc = (r: number): void => {
    const i = emit({ op: 'inc', reg: r, next: 0 })

    ;(code[i] as { next: number }).next = i + 1
  }

  // dst -= 1 if possible, else stay; either branch falls through (a non-jumping decrement)
  const decOrStay = (r: number): void => {
    const i = emit({ op: 'dec', reg: r, next: 0, zero: 0 })

    ;(code[i] as { next: number; zero: number }).next = i + 1
    ;(code[i] as { next: number; zero: number }).zero = i + 1
  }

  // zero out a register: dec it in a tight loop until it is empty
  const clear = (r: number): void => {
    const loop = here()
    const dec = emit({ op: 'dec', reg: r, next: 0, zero: 0 })

    ;(code[dec] as { next: number; zero: number }).next = loop // decremented one, loop back
    ;(code[dec] as { next: number; zero: number }).zero = loop + 1 // empty, fall through
  }

  // move EVERYTHING out of `src` into each register in `dests` (src ends at zero). The loop body's LAST inc
  // jumps back to the loop head (an inc's `next` is the unconditional jump), so no scratch no-op is needed.
  const drain = (src: number, dests: number[]): void => {
    const loop = here()
    const dec = emit({ op: 'dec', reg: src, next: 0, zero: 0 })

    ;(code[dec] as { next: number; zero: number }).next = dec + 1 // body

    for (let k = 0; k < dests.length; k++) {
      const i = emit({ op: 'inc', reg: dests[k]!, next: 0 })

      ;(code[i] as { next: number }).next =
        k === dests.length - 1 ? loop : i + 1
    }

    ;(code[dec] as { next: number; zero: number }).zero = here() // empty, fall through past the body
  }

  // dst += src, preserving src (drain src into dst and scratch, then drain scratch back into src)
  const add = (dst: number, src: number): void => {
    drain(src, [dst, scratch()])
    drain(scratch(), [src])
  }

  // dst := src (clear dst, then add src back in)
  const copy = (dst: number, src: number): void => {
    clear(dst)
    add(dst, src)
  }

  const compileBlock = (block: ts.Block): void => {
    for (const stmt of block.statements) {
      compileStatement(stmt)
    }
  }

  const compileStatement = (stmt: ts.Statement): void => {
    opCounter++ // each statement is one high-level operation; nested while-body statements bump again

    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        const name = (decl.name as ts.Identifier).text
        const r = reg(name)
        clear(r)

        if (decl.initializer && ts.isNumericLiteral(decl.initializer)) {
          const n = Number(decl.initializer.text)

          for (let k = 0; k < n; k++) {
            inc(r)
          }
        }
      }

      return
    }

    if (ts.isExpressionStatement(stmt)) {
      compileExpression(stmt.expression)

      return
    }

    if (ts.isWhileStatement(stmt)) {
      // guard must be `id !== 0`
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
      const dec = emit({ op: 'dec', reg: g, next: 0, zero: 0 }) // test by decrement
      const restore = emit({ op: 'inc', reg: g, next: 0 }) // restore (non-destructive test)

      ;(code[restore] as { next: number }).next = restore + 1
      ;(code[dec] as { next: number; zero: number }).next = restore
      compileBlock(stmt.statement as ts.Block)
      // jump back to the loop head via a scratch dec/zero (scratch is 0, so both go to loop)
      const back = emit({
        op: 'dec',
        reg: scratch(),
        next: loop,
        zero: loop,
      })

      const end = here()

      ;(
        code[dec] as {
          op: 'dec'
          reg: number
          next: number
          zero: number
        }
      ).zero = end
      void back

      return
    }

    if (ts.isReturnStatement(stmt)) {
      return
    } // the return register is recorded separately

    throw new Error(
      `unsupported statement: ${ts.SyntaxKind[stmt.kind]}`,
    )
  }

  const compileExpression = (expr: ts.Expression): void => {
    if (ts.isPostfixUnaryExpression(expr)) {
      const r = reg((expr.operand as ts.Identifier).text)

      if (expr.operator === ts.SyntaxKind.PlusPlusToken) {
        inc(r)
      } else if (expr.operator === ts.SyntaxKind.MinusMinusToken) {
        decOrStay(r)
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
          clear(dst)
          const n = Number(expr.right.text)

          for (let k = 0; k < n; k++) {
            inc(dst)
          }
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

  // the return register
  const ret = fn.body.statements.find(ts.isReturnStatement)
  const returnRegister =
    ret && ret.expression && ts.isIdentifier(ret.expression)
      ? reg(ret.expression.text)
      : 0

  const program: RailProgram = {
    registers: registers.size,
    capacity: options.capacity ?? 4096,
    code,
  }

  return { program, registers, returnRegister, parameters, opIndex }
}
