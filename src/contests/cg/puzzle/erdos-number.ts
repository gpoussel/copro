// 🎮 CodinGame Puzzle - erdos-number
// https://www.codingame.com/training/hard/erdos-number

// BFS from Erdős over the co-authorship graph, then walk back from the
// scientist, each time taking the first paper shared with an author one step closer.
const scientist = readline().trim()
const n = parseInt(readline())
const titles: string[] = []
for (let i = 0; i < n; i++) titles.push(readline())
const papers: string[][] = []
for (let i = 0; i < n; i++) papers.push(readline().trim().split(/\s+/))

const ERDOS = `Erd${String.fromCharCode(0x151)}s` // built from a code point: non-ASCII source literals get mangled by the judge
const dist = new Map<string, number>([[ERDOS, 0]])
const queue = [ERDOS]
for (let head = 0; head < queue.length; head++) {
  const a = queue[head]
  for (const authors of papers) {
    if (!authors.includes(a)) continue
    for (const b of authors)
      if (!dist.has(b)) {
        dist.set(b, dist.get(a)! + 1)
        queue.push(b)
      }
  }
}

const e = dist.get(scientist)
if (e === undefined) console.log("infinite")
else {
  const out = [String(e)]
  let cur = scientist
  for (let d = e; d > 0; d--) {
    const i = papers.findIndex(authors => authors.includes(cur) && authors.some(b => dist.get(b) === d - 1))
    out.push(titles[i])
    cur = papers[i].find(b => dist.get(b) === d - 1)!
  }
  console.log(out.join("\n"))
}
