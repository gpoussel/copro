// 🎮 CodinGame Puzzle - code-your-own-automaton2000-step-1
// https://www.codingame.com/training/hard/code-your-own-automaton2000-step-1

// Markov chain of word successors (with __START__/__END__ markers). On each
// trigger, greedily follow the heaviest successor (ties: code-point order).

const START = "__START__"
const END = "__END__"
const BOT = "Automaton2000"
const tree = new Map<string, Map<string, number>>()

const learn = (from: string, to: string): void => {
  let next = tree.get(from)
  if (!next) tree.set(from, (next = new Map()))
  next.set(to, (next.get(to) ?? 0) + 1)
}

const speak = (): string => {
  const words: string[] = []
  let cur = START
  while (words.length < 30) {
    const next = tree.get(cur)
    if (!next) break
    let best = ""
    let bestCount = -1
    for (const [w, c] of next) {
      if (c > bestCount || (c === bestCount && w < best)) {
        best = w
        bestCount = c
      }
    }
    if (best === END) break
    words.push(best)
    cur = best
  }
  return words.join(" ")
}

const n = parseInt(readline())
const out: string[] = []
for (let i = 0; i < n; i++) {
  // drop the "(hh:mm:ss) Name:" prefix
  const message = readline().replace(/^\([^)]*\)[^:]*:/, "")
  const words = message.split(" ").filter(w => w !== "" && w !== BOT)
  if (words.length) {
    let prev = START
    for (const w of words) {
      learn(prev, w)
      prev = w
    }
    learn(prev, END)
  }
  if (message.includes(BOT)) out.push(speak())
}
console.log(out.join("\n"))
