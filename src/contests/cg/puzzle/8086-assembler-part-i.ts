// 🎮 CodinGame Puzzle - 8086-assembler-part-i
// https://www.codingame.com/training/hard/8086-assembler-part-i

// Line-by-line assembler: strip the comment (outside quotes), split the
// command and its comma-separated operands, parse each operand as a register
// or an immediate expression (recursive descent over numbers, chars and $),
// then pick the encoding from the MOV / ADD / INT tables. The first error
// aborts the whole listing.
const R16: Record<string, number> = { ax: 0, cx: 1, dx: 2, bx: 3 }
const R8: Record<string, number> = { al: 0, cl: 1, dl: 2, bl: 3, ah: 4, ch: 5, dh: 6, bh: 7 }

class AsmError extends Error {}
const fail = (msg: string): never => {
  throw new AsmError(msg)
}
const BAD_EXPR = "Invalid expression or argument"
const BAD_OPERAND = "Invalid operand"

type Operand = { kind: "reg"; code: number; wide: boolean } | { kind: "imm"; value: number; usesPos: boolean }

// Reads a quoted character starting at s[i] === "'"; returns [code, next index]
const readChar = (s: string, i: number): [number, number] => {
  let j = i + 1
  let c = s[j]
  if (c === undefined || c === "'") fail(BAD_EXPR)
  if (c === "\\") {
    j++
    c = s[j]
    if (c !== "'" && c !== "\\") fail(BAD_EXPR)
  }
  if (s[j + 1] !== "'") fail(BAD_EXPR)
  return [c.charCodeAt(0), j + 2]
}

// Splits the text into the first ';' outside quotes
const stripComment = (s: string): string => {
  for (let i = 0; i < s.length; i++) {
    if (s[i] === ";") return s.slice(0, i)
    if (s[i] === "'") {
      try {
        i = readChar(s, i)[1] - 1
      } catch {
        // malformed char: will be reported while parsing the operand
      }
    }
  }
  return s
}

const splitArgs = (s: string): string[] => {
  const parts: string[] = []
  let cur = ""
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "'") {
      let end = i + 1
      try {
        end = readChar(s, i)[1]
      } catch {
        // keep going char by char
      }
      cur += s.slice(i, end)
      i = end - 1
    } else if (s[i] === ",") {
      parts.push(cur)
      cur = ""
    } else cur += s[i]
  }
  parts.push(cur)
  return parts.map(p => p.trim())
}

const parseNumber = (tok: string): number => {
  const t = tok.toLowerCase()
  if (/^0x[0-9a-f]+$/.test(t)) return parseInt(t.slice(2), 16)
  if (/^[0-9][0-9a-f]*h$/.test(t)) return parseInt(t.slice(0, -1), 16)
  if (/^[01]+b$/.test(t)) return parseInt(t.slice(0, -1), 2)
  if (/^[0-9]+$/.test(t)) return parseInt(t, 10)
  return fail(BAD_EXPR)
}

// Tokenizes then evaluates an immediate expression
const evaluate = (src: string, pos: number): { value: number; usesPos: boolean } => {
  type Tok = { t: "num"; v: number } | { t: "op"; v: string }
  const toks: Tok[] = []
  let usesPos = false
  for (let i = 0; i < src.length; ) {
    const c = src[i]
    if (c === " " || c === "\t") i++
    else if ("+-*/()".includes(c)) {
      toks.push({ t: "op", v: c })
      i++
    } else if (c === "$") {
      toks.push({ t: "num", v: pos })
      usesPos = true
      i++
    } else if (c === "'") {
      const [code, next] = readChar(src, i)
      toks.push({ t: "num", v: code })
      i = next
    } else if (/[0-9]/.test(c)) {
      let j = i
      while (j < src.length && /[0-9a-zA-Z_]/.test(src[j])) j++
      toks.push({ t: "num", v: parseNumber(src.slice(i, j)) })
      i = j
    } else fail(BAD_EXPR)
  }
  let p = 0
  const peek = (): Tok | undefined => toks[p]
  const isOp = (v: string): boolean => {
    const k = peek()
    return k !== undefined && k.t === "op" && k.v === v
  }
  const expr = (): number => {
    let v = term()
    while (isOp("+") || isOp("-")) {
      const op = (toks[p++] as { v: string }).v
      const r = term()
      v = op === "+" ? v + r : v - r
    }
    return v
  }
  const term = (): number => {
    let v = unary()
    while (isOp("*") || isOp("/")) {
      const op = (toks[p++] as { v: string }).v
      const r = unary()
      if (op === "*") v *= r
      else {
        if (r === 0) fail(BAD_EXPR)
        v = Math.floor(v / r)
      }
    }
    return v
  }
  const unary = (): number => {
    if (isOp("-")) {
      p++
      return -unary()
    }
    if (isOp("+")) {
      p++
      return unary()
    }
    return atom()
  }
  const atom = (): number => {
    const k = peek()
    if (k === undefined) return fail(BAD_EXPR)
    p++
    if (k.t === "num") return k.v
    if (k.v === "(") {
      const v = expr()
      if (!isOp(")")) fail(BAD_EXPR)
      p++
      return v
    }
    return fail(BAD_EXPR)
  }
  const value = expr()
  if (p !== toks.length) fail(BAD_EXPR)
  return { value, usesPos }
}

const parseOperand = (s: string, pos: number): Operand => {
  const low = s.toLowerCase()
  if (low in R16) return { kind: "reg", code: R16[low], wide: true }
  if (low in R8) return { kind: "reg", code: R8[low], wide: false }
  if (s === "") fail(BAD_EXPR)
  return { kind: "imm", ...evaluate(s, pos) }
}

const fitsI8 = (v: number): boolean => v >= -128 && v <= 255
const fitsI16 = (v: number): boolean => v >= -32768 && v <= 65535
// Value that survives the 8-bit sign extension to 16 bits
const fitsSignedI8 = (v: number): boolean => {
  const w = v & 0xffff
  return w <= 0x7f || w >= 0xff80
}
const le16 = (v: number): number[] => [v & 0xff, (v >> 8) & 0xff]

const assemble = (cmd: string, ops: Operand[]): number[] => {
  if (cmd === "int") {
    const [a] = ops
    if (a.kind !== "imm" || !fitsI8(a.value)) fail(BAD_OPERAND)
    return [0xcd, (a as { value: number }).value & 0xff]
  }
  const [t, s] = ops
  if (t.kind !== "reg") return fail(BAD_OPERAND)
  const w = t.wide ? 1 : 0
  if (s.kind === "reg") {
    if (s.wide !== t.wide) fail(BAD_OPERAND)
    return [(cmd === "mov" ? 0x88 : 0x00) + w, 0xc0 + 8 * s.code + t.code]
  }
  const v = s.value
  if (!(t.wide ? fitsI16 : fitsI8)(v)) fail(BAD_OPERAND)
  if (cmd === "mov") return [0xb0 + 8 * w + t.code, ...(t.wide ? le16(v) : [v & 0xff])]
  if (!t.wide) return t.code === 0 ? [0x04, v & 0xff] : [0x80, 0xc0 + t.code, v & 0xff]
  if (!s.usesPos && fitsSignedI8(v)) return [0x83, 0xc0 + t.code, v & 0xff]
  return t.code === 0 ? [0x05, ...le16(v)] : [0x81, 0xc0 + t.code, ...le16(v)]
}

const hex = (v: number, n: number): string => v.toString(16).toUpperCase().padStart(n, "0")

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline() ?? "")

const out: string[] = []
let pos = 0
try {
  lines.forEach((line, idx) => {
    const source = line.trimEnd()
    try {
      const body = stripComment(line).trim()
      if (body === "") {
        out.push(`     |                   | ${source}`)
        return
      }
      const m = /^(\S+)\s*(.*)$/.exec(body)!
      const cmd = m[1].toLowerCase()
      if (!["mov", "add", "int"].includes(cmd)) fail("Unknown command")
      const args = m[2] === "" ? [] : splitArgs(m[2])
      if (args.length !== (cmd === "int" ? 1 : 2)) fail("Invalid number of arguments")
      const ops = args.map(a => parseOperand(a, pos))
      const bytes = assemble(cmd, ops)
      out.push(
        `${hex(pos, 4)} | ${bytes
          .map(b => hex(b, 2))
          .join(" ")
          .padEnd(17)} | ${source}`
      )
      pos += bytes.length
    } catch (e) {
      if (e instanceof AsmError) throw new AsmError(`Line ${idx + 1}: ${e.message}`)
      throw e
    }
  })
  console.log(out.join("\n"))
} catch (e) {
  if (!(e instanceof AsmError)) throw e
  console.log(e.message)
}
