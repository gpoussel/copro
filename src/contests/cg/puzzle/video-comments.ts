// 🎮 CodinGame Puzzle - video-comments
// https://www.codingame.com/

type Comment = {
  line: string
  rank: number
  likes: number
  time: number
  order: number
  replies: Comment[]
}

const rankOf = (priority: string): number => (priority === "Pinned" ? 0 : priority === "Followed" ? 1 : 2)

const parse = (line: string, order: number): Comment => {
  const [, date, likes, priority] = line.trim().split("|")
  const [hh, mm] = date.split(":")
  return {
    line,
    rank: rankOf(priority),
    likes: Number(likes),
    time: Number(hh) * 60 + Number(mm),
    order,
    replies: [],
  }
}

const compare = (a: Comment, b: Comment): number =>
  a.rank - b.rank || b.likes - a.likes || b.time - a.time || a.order - b.order

const n = Number(readline())
const comments: Comment[] = []
let counter = 0
for (let i = 0; i < n; i++) {
  const line = readline()
  if (line.startsWith("    ")) {
    comments[comments.length - 1].replies.push(parse(line, counter++))
  } else {
    comments.push(parse(line, counter++))
  }
}

comments.sort(compare)
const out: string[] = []
for (const c of comments) {
  out.push(c.line)
  c.replies.sort(compare)
  for (const r of c.replies) out.push(r.line)
}
console.log(out.join("\n"))
