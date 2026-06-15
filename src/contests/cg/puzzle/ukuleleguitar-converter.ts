// 🎮 CodinGame Puzzle - ukuleleguitar-converter
// https://www.codingame.com/

const guitarOpen: number[] = [4 + 4 * 12, 11 + 3 * 12, 7 + 3 * 12, 2 + 3 * 12, 9 + 2 * 12, 4 + 2 * 12]
const guitarFrets: number = 21
const ukuleleOpen: number[] = [9 + 4 * 12, 4 + 4 * 12, 0 + 4 * 12, 7 + 4 * 12]
const ukuleleFrets: number = 15

const mode: string = readline()
const n: number = parseInt(readline(), 10)

for (let i = 0; i < n; i++) {
  const inputs: string[] = readline().split(" ")
  const str: number = parseInt(inputs[0], 10)
  const fret: number = parseInt(inputs[1], 10)

  const fromOpen: number[] = mode === "guitar" ? guitarOpen : ukuleleOpen
  const toOpen: number[] = mode === "guitar" ? ukuleleOpen : guitarOpen
  const toFrets: number = mode === "guitar" ? ukuleleFrets : guitarFrets

  const pitch: number = fromOpen[str] + fret

  const results: string[] = []
  for (let s = 0; s < toOpen.length; s++) {
    const f: number = pitch - toOpen[s]
    if (f >= 0 && f <= toFrets) {
      results.push(s + "/" + f)
    }
  }

  console.log(results.length > 0 ? results.join(" ") : "no match")
}
