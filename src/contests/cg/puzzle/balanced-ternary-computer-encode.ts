// 🎮 CodinGame Puzzle - balanced-ternary-computer-encode
// https://www.codingame.com/training/easy/balanced-ternary-computer-encode

function toBalancedTernary(n: number): string {
  if (n === 0) return "0"

  const digits: string[] = []
  let num = n

  while (num !== 0) {
    let remainder = num % 3
    num = Math.trunc(num / 3)

    if (remainder === 2) {
      // 2 in balanced ternary is -1 (T), carry 1
      remainder = -1
      num += 1
    } else if (remainder === -2) {
      // -2 in balanced ternary is +1, carry -1
      remainder = 1
      num -= 1
    }

    if (remainder === -1) {
      digits.push("T")
    } else {
      digits.push(String(remainder))
    }
  }

  return digits.reverse().join("")
}

const N = parseInt(readline())
console.log(toBalancedTernary(N))
