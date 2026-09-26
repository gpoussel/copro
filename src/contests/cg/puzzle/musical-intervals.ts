// 🎮 CodinGame Puzzle - musical-intervals
// https://www.codingame.com/training/hard/musical-intervals

// Count letter steps for the interval type and semitones for its size, then
// compare the size to the major/perfect reference of that type. Same-letter
// pairs are a prime when the second pitch is higher, an octave otherwise.
const LETTERS = "CDEFGAB"
const NATURAL = [0, 2, 4, 5, 7, 9, 11]
const TYPES = ["prime", "second", "third", "fourth", "fifth", "sixth", "seventh", "octave"]
const REF = [0, 2, 4, 5, 7, 9, 11, 12]
const PERFECT = [true, false, false, true, true, false, false, true]

const parse = (p: string): [number, number] => [LETTERS.indexOf(p[0]), p[1] === "+" ? 1 : p[1] === "-" ? -1 : 0]

const n = Number(readline())
for (let i = 0; i < n; i++) {
  const [from, to] = readline().split(" ").map(parse)
  const acc = to[1] - from[1]
  let type = (to[0] - from[0] + 7) % 7
  let semis: number
  if (type === 0) {
    if (acc > 0) semis = acc
    else {
      type = 7
      semis = 12 + acc
    }
  } else semis = ((NATURAL[to[0]] - NATURAL[from[0]] + 12) % 12) + acc
  const delta = semis - REF[type]
  const quality = PERFECT[type]
    ? ["diminished", "perfect", "augmented"][delta + 1]
    : ["diminished", "minor", "major", "augmented"][delta + 2]
  console.log(`${quality} ${TYPES[type]}`)
}
