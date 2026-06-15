// 🎮 CodinGame Puzzle - button-mash
// https://www.codingame.com/training/easy/button-mash

const n: number = parseInt(readline(), 10)

const memo: Map<number, number> = new Map()

function cost(v: number): number {
  if (v <= 0) return 0
  if (v === 1) return 1
  const cached: number | undefined = memo.get(v)
  if (cached !== undefined) return cached
  let result: number
  if (v % 2 === 0) {
    result = 1 + cost(v / 2)
  } else {
    // odd: reach (v-1)/2 then double then +1, or (v+1)/2 then double then -1
    const down: number = 2 + cost((v - 1) / 2)
    const up: number = 2 + cost((v + 1) / 2)
    result = Math.min(down, up)
  }
  memo.set(v, result)
  return result
}

console.log(cost(n))
