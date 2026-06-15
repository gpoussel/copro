// 🎮 CodinGame Puzzle - markov-text-generation
// https://www.codingame.com/training/easy/markov-text-generation

const text: string = readline()
const depth: number = parseInt(readline(), 10)
const length: number = parseInt(readline(), 10)
const seed: string = readline()

const words: string[] = text.split(" ").filter((w: string): boolean => w.length > 0)

const chain: Map<string, string[]> = new Map<string, string[]>()
for (let i = 0; i + depth < words.length; i++) {
  const key: string = words.slice(i, i + depth).join(" ")
  const next: string = words[i + depth]
  const list: string[] | undefined = chain.get(key)
  if (list === undefined) {
    chain.set(key, [next])
  } else {
    list.push(next)
  }
}

const output: string[] = seed.split(" ").filter((w: string): boolean => w.length > 0)

let randomSeed: number = 0
const pickOptionIndex = (numOfOptions: number): number => {
  randomSeed += 7
  return randomSeed % numOfOptions
}

while (output.length < length) {
  const key: string = output.slice(output.length - depth).join(" ")
  const options: string[] | undefined = chain.get(key)
  if (options === undefined || options.length === 0) {
    break
  }
  const idx: number = pickOptionIndex(options.length)
  output.push(options[idx])
}

console.log(output.join(" "))
