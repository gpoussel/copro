// 🎮 CodinGame Puzzle - kolakoski-sequence
// https://www.codingame.com/training/hard/kolakoski-sequence

const N: number = parseInt(readline(), 10)
const parts: string[] = readline().split(" ")
const A: number = parseInt(parts[0], 10)
const B: number = parseInt(parts[1], 10)

const seq: number[] = []
let k = 0
let cur = A
while (seq.length < N) {
  const runLen: number = k < seq.length ? seq[k] : k === 0 ? A : B
  for (let i = 0; i < runLen && seq.length < N; i++) {
    seq.push(cur)
  }
  k++
  cur = cur === A ? B : A
}
console.log(seq.slice(0, N).join(""))
