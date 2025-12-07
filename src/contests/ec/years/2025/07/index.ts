import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 7

function parseInput(input: string) {
  const [namesBlock, rulesBlock] = utils.input.blocks(input)
  const names = utils.input
    .firstLine(namesBlock)
    .split(",")
    .map(name => name.trim())
  const rules = utils.input.lines(rulesBlock).map(line => {
    const [from, to] = line.split(">").map(part => part.trim())
    return { from, to: to.split(",").map(name => name.trim()) }
  })
  return { names, rules }
}

function isNameValid(name: string, rules: { from: string; to: string[] }[]) {
  let valid = true
  for (const [a, b] of utils.iterate.slidingWindows(name.split(""), 2)) {
    if (!rules.find(rule => rule.from === a)?.to.includes(b)) {
      valid = false
      break
    }
  }
  return valid
}

function part1(inputString: string) {
  const { names, rules } = parseInput(inputString)
  return names.find(name => isNameValid(name, rules))
}

function part2(inputString: string) {
  const { names, rules } = parseInput(inputString)
  return names.map((name, index) => (isNameValid(name, rules) ? index + 1 : 0)).reduce((a, b) => a + b, 0)
}

function part3(inputString: string) {
  const { names, rules } = parseInput(inputString)
  const validNames = new Set<string>()
  for (const name of names) {
    if (!isNameValid(name, rules)) {
      continue
    }
    function record(name: string) {}
    const stack = [name]
    while (stack.length > 0) {
      const currentName = stack.pop()!
      if (currentName.length >= 7) {
        validNames.add(currentName)
      }
      if (currentName.length === 11) {
        continue
      }
      const lastLetter = currentName[currentName.length - 1]
      const nextRules = rules.filter(rule => rule.from === lastLetter)
      for (const rule of nextRules) {
        for (const to of rule.to) {
          stack.push(currentName + to)
        }
      }
    }
  }
  return validNames.size
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `Oronris,Urakris,Oroneth,Uraketh

r > a,i,o
i > p,w
n > e,r
o > n,m
k > f,r
a > k
U > r
e > t
O > r
t > h`,
        expected: "Oroneth",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `Xanverax,Khargyth,Nexzeth,Helther,Braerex,Tirgryph,Kharverax

r > v,e,a,g,y
a > e,v,x,r
e > r,x,v,t
h > a,e,v
g > r,y
y > p,t
i > v,r
K > h
v > e
B > r
t > h
N > e
p > h
H > e
l > t
z > e
X > a
n > v
x > z
T > i`,
        expected: 23,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `Xaryt

X > a,o
a > r,t
r > y,e,a
h > a,e,v
t > h
v > e
y > p,t`,
        expected: 25,
      },
      {
        input: `Khara,Xaryt,Noxer,Kharax

r > v,e,a,g,y
a > e,v,x,r,g
e > r,x,v,t
h > a,e,v
g > r,y
y > p,t
i > v,r
K > h
v > e
B > r
t > h
N > e
p > h
H > e
l > t
z > e
X > a
n > v
x > z
T > i`,
        expected: 1154,
      },
    ],
  },
} as EverybodyCodesContest
