// 🎮 CodinGame Puzzle - markov-text-generation
// https://www.codingame.com/training/easy/markov-text-generation

const text: string = readline()
const depth: number = parseInt(readline(), 10)
const length: number = parseInt(readline(), 10)
const seed: string = readline()

const words: string[] = text.split(" ").filter(w => w.length > 0)
const chain: Map<string, string[]> = new Map()
for (let i = 0; i + depth < words.length; i++) {
  const key = words.slice(i, i + depth).join(" ")
  const next = words[i + depth]
  if (!chain.has(key)) chain.set(key, [])
  chain.get(key)!.push(next)
}

const output: string[] = seed.split(" ").filter(w => w.length > 0)
let randomSeed = 0
function pick(num: number): number {
  randomSeed += 7
  return randomSeed % num
}

while (output.length < length) {
  const key = output.slice(output.length - depth).join(" ")
  const options = chain.get(key)
  if (!options || options.length === 0) break
  const idx = pick(options.length)
  output.push(options[idx])
}

console.log(output.join(" "))
