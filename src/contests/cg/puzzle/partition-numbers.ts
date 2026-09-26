// 🎮 CodinGame Puzzle - partition-numbers
// https://www.codingame.com/training/medium/partition-numbers

const MAX = 100
// Classic coin-change count: p[s] = number of partitions of s using parts added so far
const p: number[] = new Array<number>(MAX + 1).fill(0)
p[0] = 1
for (let part = 1; part <= MAX; part++) {
  for (let s = part; s <= MAX; s++) p[s] += p[s - part]
}

const t = parseInt(readline())
for (let i = 0; i < t; i++) console.log(p[parseInt(readline())])
