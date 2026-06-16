// 🎮 CodinGame Puzzle - blunder-episode-2
// https://www.codingame.com/training/hard/blunder-episode-2

const N: number = parseInt(readline())
const money = new Map<number, number>()
const d1 = new Map<number, number>() // -1 = exit
const d2 = new Map<number, number>()

for (let i = 0; i < N; i++) {
  const parts = readline().split(" ")
  const id = parseInt(parts[0])
  money.set(id, parseInt(parts[1]))
  d1.set(id, parts[2] === "E" ? -1 : parseInt(parts[2]))
  d2.set(id, parts[3] === "E" ? -1 : parseInt(parts[3]))
}

const memo = new Map<number, number>()

const stack: number[] = [0]
const state = new Map<number, number>()

while (stack.length > 0) {
  const node = stack[stack.length - 1]
  if (memo.has(node)) {
    stack.pop()
    continue
  }
  const s = state.get(node) ?? 0
  if (s === 0) {
    state.set(node, 1)
    const a = d1.get(node)!
    const b = d2.get(node)!
    if (a >= 0 && !memo.has(a)) stack.push(a)
    if (b >= 0 && !memo.has(b)) stack.push(b)
  } else {
    stack.pop()
    const a = d1.get(node)!
    const b = d2.get(node)!
    const va = a < 0 ? 0 : memo.get(a)!
    const vb = b < 0 ? 0 : memo.get(b)!
    memo.set(node, money.get(node)! + Math.max(va, vb))
  }
}

console.log(memo.get(0))
