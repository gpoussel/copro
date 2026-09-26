// 🎮 CodinGame Puzzle - the-total-is-right---weird-edition
// https://www.codingame.com/training/hard/the-total-is-right---weird-edition

// S[k] = every positive integer reachable with exactly k copies of a,
// built by combining S[i] and S[k-i] with the four operations (values are
// capped to keep the sets small). Before building S[k], check whether N is
// reachable from some split S[i] op S[k-i] by inverting the operation.
const N = parseInt(readline())
const a = parseInt(readline())
const LIMIT = 1e8

const lists: number[][] = [[], [a]]
const sets: Set<number>[] = [new Set(), new Set([a])]

const reaches = (k: number): boolean => {
  for (let i = 1; i <= k - i; i++) {
    const other = sets[k - i]
    for (const x of lists[i]) {
      if (other.has(N - x) || other.has(x - N) || other.has(N + x) || other.has(N * x)) return true
      if (N % x === 0 && other.has(N / x)) return true
      if (x % N === 0 && other.has(x / N)) return true
    }
  }
  return false
}

let answer = 1
if (N !== a) {
  for (let k = 2; ; k++) {
    if (reaches(k)) {
      answer = k
      break
    }
    const s = new Set<number>()
    for (let i = 1; i <= k - i; i++) {
      for (const x of lists[i]) {
        for (const y of lists[k - i]) {
          if (x + y <= LIMIT) s.add(x + y)
          if (x !== y) s.add(Math.abs(x - y))
          if (x * y <= LIMIT) s.add(x * y)
          if (x % y === 0) s.add(x / y)
          if (y % x === 0) s.add(y / x)
        }
      }
    }
    lists.push([...s])
    sets.push(s)
  }
}
console.log(answer)
