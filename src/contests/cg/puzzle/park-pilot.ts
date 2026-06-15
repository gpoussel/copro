// 🎮 CodinGame Puzzle - park-pilot
// https://www.codingame.com/training/easy/park-pilot

const n: number = parseInt(readline(), 10)
const fl: number[] = []
const fr: number[] = []
const br: number[] = []
const bl: number[] = []
for (let i = 0; i < n; i++) {
  const s: string = readline()
  fl.push(+s[0])
  fr.push(+s[1])
  br.push(+s[2])
  bl.push(+s[3])
}

let length: number = 1
for (let cand = 1; cand < n; cand++) {
  let ok: boolean = true
  for (let t = 0; t < n; t++) {
    const j: number = t + cand - 1
    if (j < n && (fl[t] !== bl[j] || fr[t] !== br[j])) {
      ok = false
      break
    }
  }
  if (ok) {
    length = cand
    break
  }
}

const size: number = n + length - 1
const left: number[] = new Array<number>(size).fill(0)
const right: number[] = new Array<number>(size).fill(0)
for (let t = 0; t < n; t++) {
  left[t] = bl[t]
  right[t] = br[t]
}
for (let t = 0; t < n; t++) {
  const j: number = t + length - 1
  left[j] = fl[t]
  right[j] = fr[t]
}

const spots: Array<[number, string]> = []
const scan = (arr: number[], side: string): void => {
  let i: number = 0
  while (i < size) {
    if (arr[i] === 0) {
      let j: number = i
      while (j < size && arr[j] === 0) {
        j++
      }
      for (let f = i + length - 1; f <= j - 1; f++) {
        spots.push([f, side])
      }
      i = j
    } else {
      i++
    }
  }
}
scan(left, "L")
scan(right, "R")
spots.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1))

const out: string[] = [String(length)]
for (const [index, side] of spots) {
  out.push(`${index}${side}`)
}
console.log(out.join("\n"))
