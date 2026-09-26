// 🎮 CodinGame Puzzle - simple-pascal-pl0-compiler
// https://www.codingame.com/training/hard/simple-pascal-pl0-compiler

// Recursive-descent compiler following Wirth's PL/0 code generator: every
// block starts with a jmp patched to its int, procedures are compiled first,
// and identifiers are resolved through a stack of scopes (level difference
// + address). Errors are thrown with the line of the last consumed token
// (or of the offending identifier) and printed instead of the code.

const lineCount = parseInt(readline())
const sourceLines: string[] = []
for (let i = 0; i < lineCount; i++) sourceLines.push(readline() ?? "")

interface Token {
  text: string // keywords lower-cased, identifiers kept as-is
  kind: "ident" | "number" | "keyword" | "symbol"
  line: number
}

const KEYWORDS = ["const", "var", "procedure", "call", "begin", "end", "if", "then", "while", "do", "odd"]
const tokens: Token[] = []
sourceLines.forEach((src, idx) => {
  const re = /\s*([A-Za-z][A-Za-z0-9]*|\d+|:=|<=|>=|[=#<>+\-*/(),;.?!]|\S)/y
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    const text = m[1]
    if (/^[A-Za-z]/.test(text)) {
      const lower = text.toLowerCase()
      if (KEYWORDS.includes(lower)) tokens.push({ text: lower, kind: "keyword", line: idx + 1 })
      else tokens.push({ text, kind: "ident", line: idx + 1 })
    } else if (/^\d/.test(text)) tokens.push({ text, kind: "number", line: idx + 1 })
    else tokens.push({ text, kind: "symbol", line: idx + 1 })
    if (re.lastIndex >= src.length) break
  }
})

class CompileError {
  line: number
  msg: string
  constructor(line: number, msg: string) {
    this.line = line
    this.msg = msg
  }
}

interface SymEntry {
  kind: "const" | "var" | "procedure"
  level: number
  value: number // constant value, variable address or procedure entry
}

const code: string[] = []
const emit = (op: string, l: number, a: number) => code.push(`${op} ${l}, ${a}`)
const scopes: Map<string, SymEntry>[] = []
let pos = 0
let lastLine = 1

const peek = (): Token | undefined => tokens[pos]
const is = (text: string) => peek()?.text === text && peek()?.kind !== "ident"
function next(): Token {
  const t = tokens[pos++]
  lastLine = t.line
  return t
}
const fail = (msg: string, line = lastLine): never => {
  throw new CompileError(line, msg)
}

function lookup(name: string): SymEntry | undefined {
  for (let i = scopes.length - 1; i >= 0; i--) {
    const s = scopes[i].get(name)
    if (s) return s
  }
  return undefined
}

function declare(tok: Token, sym: SymEntry): void {
  const scope = scopes[scopes.length - 1]
  if (scope.has(tok.text)) fail(`${sym.kind} already defined`, tok.line)
  scope.set(tok.text, sym)
}

function factor(level: number): void {
  const t = peek()
  if (t?.kind === "ident") {
    next()
    const sym = lookup(t.text)
    if (!sym) fail("Unknown var", t.line)
    else if (sym.kind === "const") emit("lit", 0, sym.value)
    else if (sym.kind === "var") emit("lod", level - sym.level, sym.value)
    else fail("Invalid expr", t.line)
  } else if (t?.kind === "number") {
    next()
    emit("lit", 0, parseInt(t.text))
  } else if (is("(")) {
    next()
    expr(level)
    if (!is(")")) fail("Invalid expr")
    next()
  } else fail("Invalid expr")
}

function term(level: number): void {
  factor(level)
  while (is("*") || is("/")) {
    const op = next().text
    factor(level)
    emit("opr", 0, op === "*" ? 4 : 5)
  }
}

function expr(level: number): void {
  let negate = false
  if (is("+") || is("-")) negate = next().text === "-"
  term(level)
  if (negate) emit("opr", 0, 1)
  while (is("+") || is("-")) {
    const op = next().text
    term(level)
    emit("opr", 0, op === "+" ? 2 : 3)
  }
}

const RELATIONS: Record<string, number> = { "=": 7, "#": 8, "<": 9, ">=": 10, ">": 11, "<=": 12 }

function condition(level: number): void {
  if (is("odd")) {
    next()
    expr(level)
    emit("opr", 0, 6)
    return
  }
  expr(level)
  const t = peek()
  if (!t || t.kind !== "symbol" || !(t.text in RELATIONS)) return fail("Invalid expr")
  next()
  expr(level)
  emit("opr", 0, RELATIONS[t.text])
}

function statement(level: number): void {
  const t = peek()
  if (!t) return
  if (t.kind === "ident") {
    next()
    const sym = lookup(t.text)
    if (!sym) fail("Unknown var", t.line)
    else if (sym.kind !== "var") fail("Invalid statement", t.line)
    else {
      if (!is(":=")) fail("Invalid statement")
      next()
      expr(level)
      emit("sto", level - sym.level, sym.value)
    }
  } else if (is("call")) {
    next()
    const id = peek()
    if (id?.kind !== "ident") return fail("Invalid statement")
    next()
    const sym = lookup(id.text)
    if (!sym) fail("Unknown var", id.line)
    else if (sym.kind !== "procedure") fail("Invalid statement", id.line)
    else emit("cal", level - sym.level, sym.value)
  } else if (is("?")) {
    next()
    const id = peek()
    if (id?.kind !== "ident") return fail("Invalid statement")
    next()
    const sym = lookup(id.text)
    if (!sym) fail("Unknown var", id.line)
    else if (sym.kind !== "var") fail("Invalid statement", id.line)
    else {
      emit("opr", 0, 14)
      emit("sto", level - sym.level, sym.value)
    }
  } else if (is("!")) {
    next()
    expr(level)
    emit("opr", 0, 13)
  } else if (is("begin")) {
    next()
    statement(level)
    while (is(";")) {
      next()
      statement(level)
    }
    if (!is("end")) fail(peek()?.kind === "ident" || peek()?.kind === "keyword" ? "; missing" : "Invalid statement")
    next()
  } else if (is("if")) {
    next()
    condition(level)
    if (!is("then")) fail("then missing")
    next()
    const jpc = code.length
    emit("jpc", 0, 0)
    statement(level)
    code[jpc] = `jpc 0, ${code.length}`
  } else if (is("while")) {
    next()
    const start = code.length
    condition(level)
    if (!is("do")) fail("do missing")
    next()
    const jpc = code.length
    emit("jpc", 0, 0)
    statement(level)
    emit("jmp", 0, start)
    code[jpc] = `jpc 0, ${code.length}`
  }
}

function block(level: number): void {
  scopes.push(new Map())
  const jmp = code.length
  emit("jmp", 0, 0)
  let vars = 0
  if (is("const")) {
    do {
      next()
      const id = peek()
      if (id?.kind !== "ident") fail("Invalid statement")
      next()
      if (!is("=")) fail("Invalid statement")
      next()
      const num = peek()
      if (num?.kind !== "number") fail("Invalid expr")
      next()
      declare(id!, { kind: "const", level, value: parseInt(num!.text) })
    } while (is(","))
    if (!is(";")) fail("; missing")
    next()
  }
  if (is("var")) {
    do {
      next()
      const id = peek()
      if (id?.kind !== "ident") fail("Invalid statement")
      next()
      declare(id!, { kind: "var", level, value: 3 + vars++ })
    } while (is(","))
    if (!is(";")) fail("; missing")
    next()
  }
  while (is("procedure")) {
    next()
    const id = peek()
    if (id?.kind !== "ident") fail("Invalid statement")
    next()
    declare(id!, { kind: "procedure", level, value: code.length })
    if (!is(";")) fail("; missing")
    next()
    block(level + 1)
    if (!is(";")) fail("; missing")
    next()
  }
  code[jmp] = `jmp 0, ${code.length}`
  emit("int", 0, 3 + vars)
  statement(level)
  emit("opr", 0, 0)
  scopes.pop()
}

try {
  block(0)
  if (!is(".")) fail("Invalid statement")
  console.log(code.join("\n"))
} catch (e) {
  if (!(e instanceof CompileError)) throw e
  console.log(`Line ${e.line}: ${e.msg}`)
}
