// 🎮 CodinGame Puzzle - number-formatting
// https://www.codingame.com/training/easy/number-formatting

const s: string = readline()

// Positions 0-10 are the integer part (with separators at 3 and 7),
// positions 11-18 are the fractional part (with separator at 15).
const digitsAt = (str: string, indexes: number[]): string =>
  indexes
    .map(i => str[i])
    .filter(c => c !== "x")
    .join("")

const intIndexes: number[] = [0, 1, 2, 4, 5, 6, 8, 9, 10]
const fracIndexes: number[] = [12, 13, 14, 16, 17, 18]

const intStr: string = digitsAt(s, intIndexes)
const fracStr: string = digitsAt(s, fracIndexes)

// Combine into total micro-units (integer * 1e6 + fraction left-aligned to 6 digits).
const intPart: bigint = intStr === "" ? 0n : BigInt(intStr)
const fracPadded: string = (fracStr + "000000").slice(0, 6)
const micros: bigint = intPart * 1000000n + BigInt(fracPadded)

const halfMicros: bigint = micros / 2n

const halfInt: bigint = halfMicros / 1000000n
const halfFrac: number = Number(halfMicros % 1000000n)

// Integer digits, right-aligned in the 9-digit slots.
const intDigits: string = halfInt === 0n ? "" : halfInt.toString()
// Fractional digits, left-aligned, trimmed of trailing zeros (unused -> x).
let fracDigits: string = halfFrac.toString().padStart(6, "0")
fracDigits = fracDigits.replace(/0+$/, "")

// Build output template "xxx,xxx,xxx.xxx.xxx".
const out: string[] = "xxx,xxx,xxx.xxx.xxx".split("")

// Place integer digits right-aligned across intIndexes.
for (let k = 0; k < intDigits.length; k++) {
  out[intIndexes[intIndexes.length - 1 - k]] = intDigits[intDigits.length - 1 - k]
}
// Place fractional digits left-aligned across fracIndexes.
for (let k = 0; k < fracDigits.length; k++) {
  out[fracIndexes[k]] = fracDigits[k]
}

console.log(out.join(""))
