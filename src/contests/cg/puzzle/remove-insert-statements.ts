// 🎮 CodinGame Puzzle - remove-insert-statements
// https://www.codingame.com/training/easy/remove-insert-statements

const n: number = parseInt(readline(), 10)
const lines: string[] = []
for (let i = 0; i < n; i++) {
  lines.push(readline())
}
const text: string = lines.join("\n")

// We scan the text character by character, building the output while dropping
// INSERT statements that live outside a function body (BEGIN ... END).
//
// State we track:
// - depth: BEGIN/END nesting level. INSERT is removed only when depth === 0.
// - whether the current line is "at statement start" so an INSERT keyword only
//   counts when it begins a statement (after start-of-line/whitespace or after a
//   previous ';'). Column names like `insert_date_string_format` never start a
//   statement, so they are left untouched.
//
// When an out-of-body INSERT statement is found we skip every character up to and
// including the terminating ';' (strings and comments inside are respected).

const len: number = text.length
let out: string = ""
let depth: number = 0
let atStatementStart: boolean = true

const isWord = (s: string, pos: number, word: string): boolean => {
  const end: number = pos + word.length
  if (s.slice(pos, end).toUpperCase() !== word) {
    return false
  }
  const before: string = pos > 0 ? s[pos - 1] : ""
  const after: string = end < s.length ? s[end] : ""
  const boundary = (c: string): boolean => c === "" || !/[A-Za-z0-9_]/.test(c)
  return boundary(before) && boundary(after)
}

// Is `pos` at the start of a line (only whitespace since the last newline)?
const atLineStart = (pos: number): boolean => {
  let j: number = pos - 1
  while (j >= 0 && text[j] !== "\n") {
    if (text[j] !== " " && text[j] !== "\t") {
      return false
    }
    j--
  }
  return true
}

// Skip from an INSERT keyword to the terminating ';' (inclusive), honoring
// single-quoted strings and -- comments. Returns the index just after the ';'.
const skipInsert = (start: number): number => {
  let j: number = start
  while (j < len) {
    const c: string = text[j]
    if (c === "'") {
      j++
      while (j < len) {
        if (text[j] === "'") {
          if (text[j + 1] === "'") {
            j += 2
            continue
          }
          j++
          break
        }
        j++
      }
      continue
    }
    if (c === "-" && text[j + 1] === "-") {
      while (j < len && text[j] !== "\n") {
        j++
      }
      continue
    }
    if (c === ";") {
      return j + 1
    }
    j++
  }
  return j
}

let i: number = 0
while (i < len) {
  const c: string = text[i]

  // Comments: copy verbatim to end of line.
  if (c === "-" && text[i + 1] === "-") {
    while (i < len && text[i] !== "\n") {
      out += text[i]
      i++
    }
    atStatementStart = false
    continue
  }

  // Single-quoted string literal: copy verbatim.
  if (c === "'") {
    out += c
    i++
    while (i < len) {
      out += text[i]
      if (text[i] === "'") {
        if (text[i + 1] === "'") {
          out += text[i + 1]
          i += 2
          continue
        }
        i++
        break
      }
      i++
    }
    atStatementStart = false
    continue
  }

  // BEGIN / END keywords (always at the start of a line).
  if (atLineStart(i) && isWord(text, i, "BEGIN")) {
    depth++
    out += text.slice(i, i + 5)
    i += 5
    atStatementStart = false
    continue
  }
  if (atLineStart(i) && isWord(text, i, "END")) {
    if (depth > 0) {
      depth--
    }
    out += text.slice(i, i + 3)
    i += 3
    atStatementStart = false
    continue
  }

  // INSERT keyword at a statement start and outside any function body.
  if (atStatementStart && depth === 0 && isWord(text, i, "INSERT")) {
    i = skipInsert(i)
    // The terminating ';' starts a new statement.
    atStatementStart = true
    continue
  }

  if (c === ";") {
    atStatementStart = true
    out += c
    i++
    continue
  }

  if (c === "\n") {
    atStatementStart = true
    out += c
    i++
    continue
  }

  if (c === " " || c === "\t") {
    out += c
    i++
    continue
  }

  // Any other token: no longer at statement start.
  atStatementStart = false
  out += c
  i++
}

// Emit lines, dropping any line that is now empty (whitespace-only) as a result
// of removing an INSERT span.
const outLines: string[] = out.split("\n")
const kept: string[] = outLines.filter((l: string): boolean => l.trim() !== "")
console.log(kept.join("\n"))
