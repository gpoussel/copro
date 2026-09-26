// 🎮 CodinGame Puzzle - networking
// https://www.codingame.com/training/medium/networking

const n = parseInt(readline())
const parent = new Map<string, string>()

const find = (x: string): string => {
  let root = x
  while (parent.get(root) !== root) root = parent.get(root)!
  // Path compression
  while (x !== root) {
    const next = parent.get(x)!
    parent.set(x, root)
    x = next
  }
  return root
}

let groups = 0
for (let i = 0; i < n; i++) {
  const people = readline().trim().split(/\s+/)
  for (const p of people) {
    if (!parent.has(p)) {
      parent.set(p, p)
      groups++
    }
  }
  for (let j = 1; j < people.length; j++) {
    const a = find(people[0])
    const b = find(people[j])
    if (a !== b) {
      parent.set(b, a)
      groups--
    }
  }
}
console.log(groups)
