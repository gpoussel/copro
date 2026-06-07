// 🎮 CodinGame Puzzle - the-greatest-number
// https://www.codingame.com/training/hard/the-greatest-number

const N: number = parseInt(readline())
const chars: string[] = readline().split(" ")

const hasMinus: boolean = chars.includes("-")
const hasDot: boolean = chars.includes(".")
const digits: number[] = chars
  .filter((c: string) => c !== "-" && c !== ".")
  .map((c: string) => parseInt(c))
  .sort((a: number, b: number) => a - b) // sorted ascending

function buildNumber(negative: boolean, dot: boolean, sortedDigitsAsc: number[]): string {
  if (!negative && !dot) {
    // Positive integer: arrange digits descending
    const desc: number[] = [...sortedDigitsAsc].reverse()
    // Remove leading zeros (only if more than one digit)
    const str: string = desc.join("")
    // Remove trailing zeros that are purely leading (e.g. all zeros)
    const trimmed: string = str.replace(/^0+/, "") || "0"
    return trimmed
  }

  if (!negative && dot) {
    // Positive decimal: maximize value
    // Put largest digits before dot, smallest after dot
    // To maximize: put as many large digits as possible before dot
    // Integer part: all digits in descending order, but trailing zeros after dot need not be there
    // Best strategy: put the dot before the smallest digit (to maximize integer part)
    // e.g. digits = [1,2,4,5,7,8,9,9] -> 9987542.1
    const desc: number[] = [...sortedDigitsAsc].reverse()
    if (desc.every((d: number) => d === 0)) {
      // All zeros with dot - result is just 0
      return "0"
    }
    // Put dot before the last digit (smallest), rest before dot
    const beforeDot: number[] = desc.slice(0, desc.length - 1)
    const afterDot: number[] = desc.slice(desc.length - 1)

    const intPart: string = beforeDot.join("").replace(/^0+/, "") || "0"
    const fracPart: string = afterDot.join("").replace(/0+$/, "")

    if (fracPart === "") {
      return intPart
    }
    return intPart + "." + fracPart
  }

  if (negative && !dot) {
    // Negative integer: minimize absolute value -> arrange digits ascending
    // Remove leading zeros
    const asc: number[] = [...sortedDigitsAsc]
    // Find first non-zero
    const firstNonZeroIdx: number = asc.findIndex((d: number) => d !== 0)
    if (firstNonZeroIdx === -1) {
      return "0"
    }
    // Put non-zero first, then rest
    const reordered: number[] = [
      asc[firstNonZeroIdx],
      ...asc.slice(0, firstNonZeroIdx),
      ...asc.slice(firstNonZeroIdx + 1),
    ]
    return "-" + reordered.join("")
  }

  // negative && dot
  // Minimize absolute value
  // Want: smallest possible number = 0.000...XYZ (put zeros before significant digits after dot)
  // Or use 0 as integer part and put all other digits after dot in ascending order
  // Example: - 4 0 0 5 9 8 . 2 -> -0.024589 (digits: 0,0,2,4,5,8,9 -> integer=0, frac=024589 -> 0.024589)
  // Example: - 0 0 0 0 0 0 0 . -> 0

  const allZeros: boolean = sortedDigitsAsc.every((d: number) => d === 0)
  if (allZeros) {
    return "0"
  }

  // Put 0 as integer part (if we have zeros), then all digits ascending after dot
  // If we have zeros: integer part = 0, frac = all digits ascending (leading zeros ok in frac, trailing zeros removed)
  // If we have no zeros: we need smallest non-zero as integer part, rest ascending after dot

  const hasZero: boolean = sortedDigitsAsc.includes(0)

  if (hasZero) {
    // Integer part is 0 (uses one zero from pool), fraction is remaining digits sorted ascending
    // Remove trailing zeros from fraction
    const remaining: number[] = [...sortedDigitsAsc]
    const zeroIdx: number = remaining.indexOf(0)
    remaining.splice(zeroIdx, 1) // remove one zero used as integer part
    const fracDigits: number[] = remaining
    const fracStr: string = fracDigits.join("").replace(/0+$/, "")
    if (fracStr === "" || fracStr === "0" || fracStr.replace(/0/g, "") === "") {
      // All zeros
      return "0"
    }
    return "-0." + fracStr
  } else {
    // No zero: smallest digit as integer part, rest ascending after dot
    const intDigit: number = sortedDigitsAsc[0]
    const fracDigits: number[] = sortedDigitsAsc.slice(1)
    const fracStr: string = fracDigits.join("").replace(/0+$/, "")
    if (fracStr === "") {
      return "-" + intDigit
    }
    return "-" + intDigit + "." + fracStr
  }
}

console.log(buildNumber(hasMinus, hasDot, digits))
