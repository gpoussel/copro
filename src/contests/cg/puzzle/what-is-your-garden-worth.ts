// 🎮 CodinGame Puzzle - what-is-your-garden-worth
// https://www.codingame.com/

// CodinGame's readline() corrupts multi-byte emoji that straddle its internal
// buffer boundary (they arrive as U+FFFD). Reading raw stdin bytes and decoding
// the whole stream as UTF-8 ourselves avoids that corruption.
const lines: string[] = require("fs").readFileSync(0).toString("utf8").split("\n")

// Intl.Segmenter is available at runtime (Node/tsx) but absent from the es6
// lib types, so type the constructor locally instead of widening the project lib.
type SegmenterCtor = new (
  locale: string,
  options: { granularity: "grapheme" }
) => { segment(input: string): Iterable<{ segment: string }> }
const Segmenter = (Intl as unknown as { Segmenter: SegmenterCtor }).Segmenter
const segmenter = new Segmenter("en", { granularity: "grapheme" })

const graphemes = (text: string): string[] => {
  const result: string[] = []
  for (const segment of segmenter.segment(text)) {
    result.push(segment.segment.replace(/️/g, ""))
  }
  return result
}

let cursor: number = 0
const next = (): string => lines[cursor++]

const numOfLines: number = parseInt(next(), 10)
const prices: Map<string, number> = new Map<string, number>()
for (let i = 0; i < numOfLines; i++) {
  const line: string = next()
  const eqIndex: number = line.indexOf(" = ")
  const amount: number = parseInt(line.slice(1, eqIndex), 10)
  for (const emoji of graphemes(line.slice(eqIndex + 3))) {
    prices.set(emoji, amount)
  }
}

const gardenHeight: number = parseInt(next(), 10)
let worth: number = 0
for (let i = 0; i < gardenHeight; i++) {
  for (const cell of graphemes(next())) {
    const value: number | undefined = prices.get(cell)
    if (value !== undefined) {
      worth += value
    }
  }
}

console.log("$" + worth.toLocaleString("en-US"))
