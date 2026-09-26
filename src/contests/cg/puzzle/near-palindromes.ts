// 🎮 CodinGame Puzzle - near-palindromes
// https://www.codingame.com/training/medium/near-palindromes

function isPalindrome(s: string, i: number, j: number): boolean {
  while (i < j) if (s[i++] !== s[j--]) return false
  return true
}

// A palindrome is always a near-palindrome (insert any letter in its middle).
// Otherwise, at the first mismatch we may skip one side (removal/addition) or both (replacement).
function isNearPalindrome(s: string): boolean {
  let i = 0
  let j = s.length - 1
  while (i < j && s[i] === s[j]) {
    i++
    j--
  }
  if (i >= j) return true
  return isPalindrome(s, i + 1, j) || isPalindrome(s, i, j - 1) || isPalindrome(s, i + 1, j - 1)
}

const wordCount = parseInt(readline())
let answer = ""
for (let k = 0; k < wordCount; k++) answer += isNearPalindrome(readline().trim()) ? "1" : "0"
console.log(answer)
