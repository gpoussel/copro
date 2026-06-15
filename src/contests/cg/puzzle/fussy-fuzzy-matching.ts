// 🎮 CodinGame Puzzle - fussy-fuzzy-matching
// https://www.codingame.com/training/easy/fussy-fuzzy-matching

const letterCase: boolean = readline() === "true"
const letterFuzz: number = parseInt(readline(), 10)
const numberFuzz: number = parseInt(readline(), 10)
const otherFuzz: boolean = readline() === "true"
const template: string = readline()
const n: number = parseInt(readline(), 10)

const isDigit = (c: string): boolean => c >= "0" && c <= "9"
const isLetter = (c: string): boolean => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z")

type Token = { kind: "num"; value: number } | { kind: "letter"; ch: string } | { kind: "other"; ch: string }

function tokenize(s: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (isDigit(c)) {
      let j = i
      while (j < s.length && isDigit(s[j])) j++
      tokens.push({ kind: "num", value: parseInt(s.slice(i, j), 10) })
      i = j
    } else if (isLetter(c)) {
      tokens.push({ kind: "letter", ch: c })
      i++
    } else {
      tokens.push({ kind: "other", ch: c })
      i++
    }
  }
  return tokens
}

function matches(candidate: string): boolean {
  const t: Token[] = tokenize(template)
  const c: Token[] = tokenize(candidate)
  if (t.length !== c.length) return false
  for (let k = 0; k < t.length; k++) {
    const a = t[k]
    const b = c[k]
    if (a.kind !== b.kind) return false
    if (a.kind === "num" && b.kind === "num") {
      if (Math.abs(a.value - b.value) > numberFuzz) return false
    } else if (a.kind === "letter" && b.kind === "letter") {
      let ca = a.ch
      let cb = b.ch
      if (!letterCase) {
        ca = ca.toLowerCase()
        cb = cb.toLowerCase()
      } else {
        if (ca <= "Z" !== cb <= "Z") return false
      }
      const dist = Math.abs(ca.charCodeAt(0) - cb.charCodeAt(0))
      if (dist > letterFuzz) return false
    } else if (a.kind === "other" && b.kind === "other") {
      if (otherFuzz && a.ch !== b.ch) return false
    }
  }
  return true
}

const out: string[] = []
for (let i = 0; i < n; i++) {
  out.push(matches(readline()) ? "true" : "false")
}
console.log(out.join("\n"))
