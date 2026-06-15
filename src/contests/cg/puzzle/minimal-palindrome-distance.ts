// 🎮 CodinGame Puzzle - minimal-palindrome-distance
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const s: string = readline()

const isPalindrome = (start: number): boolean => {
  let i: number = start
  let j: number = n - 1
  while (i < j) {
    if (s[i] !== s[j]) {
      return false
    }
    i++
    j--
  }
  return true
}

let answer: number = 0
for (let start: number = 0; start < n; start++) {
  if (isPalindrome(start)) {
    answer = start
    break
  }
}

console.log(answer)
