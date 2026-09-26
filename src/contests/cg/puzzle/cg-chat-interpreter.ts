// 🎮 CodinGame Puzzle - cg-chat-interpreter
// https://www.codingame.com/training/hard/cg-chat-interpreter

// Each line is tokenized into words (lowercase, punctuation stripped) and
// *nick* references. A leading reference sets the context immediately; the
// first command keyword of the line is executed; for an assignment, the first
// position after the keyword where a constant parses is used. Constants follow
// a small recursive grammar (primary followed by postfix operators).
const [numGood, numBad] = readline().split(" ").map(Number)
const goodLine = readline()
const badLine = readline()
const nouns = new Map<string, bigint>()
if (numGood > 0) for (const w of goodLine.trim().toLowerCase().split(/\s+/)) nouns.set(w, 1n)
if (numBad > 0) for (const w of badLine.trim().toLowerCase().split(/\s+/)) nouns.set(w, -1n)
const numLines = Number(readline())

type Token = { word: string; nick: string | null }
const stacks = new Map<string, bigint[]>()
const context = new Map<string, string>()
const stackOf = (nick: string): bigint[] => {
  let s = stacks.get(nick)
  if (!s) stacks.set(nick, (s = []))
  return s
}
const top = (nick: string | undefined): bigint => {
  if (nick === undefined) return 0n
  const s = stackOf(nick)
  return s.length ? s[s.length - 1] : 0n
}

const tokenize = (text: string): Token[] => {
  const tokens: Token[] = []
  for (const raw of text.split(/\s+/)) {
    if (!raw) continue
    const m = raw.match(/\*([^*]+)\*/)
    if (m) tokens.push({ word: "", nick: m[1].toLowerCase() })
    else {
      const word = raw.toLowerCase().replace(/[^a-z0-9]/g, "")
      if (word) tokens.push({ word, nick: null })
    }
  }
  return tokens
}

let output = ""
for (let li = 0; li < numLines; li++) {
  const line = readline()
  const m = line.match(/^\s*<([^>]*)>\s*(.*)$/)
  if (!m) continue
  const speaker = m[1].toLowerCase()
  const tokens = tokenize(m[2])
  let start = 0
  if (tokens.length && tokens[0].nick !== null) {
    context.set(speaker, tokens[0].nick)
    start = 1
  }
  const consumed = new Set<number>()

  // Parse a constant starting at token i: returns value and next index
  const parseConstant = (i: number): [bigint, number] | null => {
    const prim = parsePrimary(i)
    if (!prim) return null
    let [v, j] = prim
    for (;;) {
      const w = j < tokens.length ? tokens[j].word : ""
      if (w === "squared") {
        v = v * v
        j++
      } else if (w === "and" || w === "by" || (w === "but" && tokens[j + 1]?.word === "not")) {
        const inner = parseConstant(j + (w === "but" ? 2 : 1))
        const closer = w === "and" ? "too" : w === "by" ? "multiplied" : "though"
        if (!inner || inner[1] >= tokens.length || tokens[inner[1]].word !== closer) break
        v = w === "and" ? v + inner[0] : w === "by" ? v * inner[0] : v - inner[0]
        j = inner[1] + 1
      } else break
    }
    return [v, j]
  }
  const parsePrimary = (i: number): [bigint, number] | null => {
    if (i >= tokens.length) return null
    const t = tokens[i]
    if (t.nick !== null) {
      consumed.add(i)
      return [top(t.nick), i + 1]
    }
    if (t.word === "me") return [top(speaker), i + 1]
    if (t.word === "you" || t.word === "u") return [top(context.get(speaker)), i + 1]
    if (t.word === "a" || t.word === "an") {
      let mult = 1n
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].nick !== null) return null
        const n = nouns.get(tokens[j].word)
        if (n !== undefined) return [n * mult, j + 1]
        mult *= 2n
      }
    }
    return null
  }

  const ctx = context.get(speaker)
  let cmd = -1
  for (let i = start; i < tokens.length && cmd < 0; i++)
    if (/^(youre|your|ur|listen|forget|flip|tell|telling)$/.test(tokens[i].word)) cmd = i
  if (ctx !== undefined && cmd >= 0) {
    const s = stackOf(ctx)
    const w = tokens[cmd].word
    if (w === "listen") {
      if (s.length) s.push(s[s.length - 1])
    } else if (w === "forget") s.pop()
    else if (w === "flip") {
      if (s.length >= 2) {
        const a = s.pop()!
        const b = s.pop()!
        s.push(a, b)
      }
    } else if (w === "tell" || w === "telling") {
      for (let i = cmd; i < tokens.length; i++)
        if (tokens[i].word === "tell" || tokens[i].word === "telling") {
          const v = s.pop()
          if (v !== undefined) output += v.toString()
        }
    } else {
      for (let i = cmd + 1; i < tokens.length; i++) {
        consumed.clear()
        const c = parseConstant(i)
        if (c) {
          s.push(c[0])
          break
        }
      }
    }
  }
  // Remaining nick references set the speaker's context
  for (let i = start; i < tokens.length; i++) {
    const nick = tokens[i].nick
    if (nick !== null && !consumed.has(i)) context.set(speaker, nick)
  }
}
console.log(output)
