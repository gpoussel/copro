// 🎮 CodinGame Puzzle - video-comments
// https://www.codingame.com/training/easy/video-comments

interface Comment {
  raw: string
  prio: number // 0 Pinned, 1 Followed, 2 none
  likes: number
  time: number // minutes since midnight
  idx: number // input order, for stable tie-breaking
  replies: Comment[]
}

const n = parseInt(readline(), 10)

function parse(line: string): { time: number; likes: number; prio: number } {
  const parts = line.split("|")
  const [h, m] = parts[1].split(":").map(x => parseInt(x, 10))
  const likes = parseInt(parts[2], 10)
  const prio = parts[3] === "Pinned" ? 0 : parts[3] === "Followed" ? 1 : 2
  return { time: h * 60 + m, likes, prio }
}

const top: Comment[] = []
for (let i = 0; i < n; i++) {
  const line = readline()
  if (line.startsWith("    ")) {
    const p = parse(line.slice(4))
    top[top.length - 1].replies.push({
      raw: line,
      prio: p.prio,
      likes: p.likes,
      time: p.time,
      idx: i,
      replies: [],
    })
  } else {
    const p = parse(line)
    top.push({ raw: line, prio: p.prio, likes: p.likes, time: p.time, idx: i, replies: [] })
  }
}

function cmp(a: Comment, b: Comment): number {
  if (a.prio !== b.prio) return a.prio - b.prio
  if (a.likes !== b.likes) return b.likes - a.likes // most likes first
  if (a.time !== b.time) return b.time - a.time // newer first
  return a.idx - b.idx // input order
}

top.sort(cmp)
const out: string[] = []
for (const c of top) {
  out.push(c.raw)
  c.replies.sort(cmp)
  for (const r of c.replies) out.push(r.raw)
}
console.log(out.join("\n"))
