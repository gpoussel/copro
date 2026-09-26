// 🎮 CodinGame Puzzle - candies
// https://www.codingame.com/training/hard/candies

// DFS over compositions of N with parts ≤ K, trying smaller parts first
// yields them directly in lexicographical order.

const [n, k] = readline().split(" ").map(Number)
const lines: string[] = []
const path: number[] = []

const dfs = (left: number): void => {
  if (left === 0) {
    lines.push(path.join(" "))
    return
  }
  for (let take = 1; take <= Math.min(k, left); take++) {
    path.push(take)
    dfs(left - take)
    path.pop()
  }
}
dfs(n)

console.log(lines.join("\n"))
