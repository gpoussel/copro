// 🎮 CodinGame Puzzle - simple-makefiles
// https://www.codingame.com/training/medium/simple-makefiles

interface Rule {
  target: string
  prereqs: string[]
  actions: string[][]
}

const fileTime: { [file: string]: number } = {}
const nFiles = parseInt(readline())
for (let i = 0; i < nFiles; i++) {
  const [name, time] = readline().trim().split(/\s+/)
  fileTime[name] = Number(time)
}
readline()
const goals = readline().trim().split(/\s+/)
const nLines = parseInt(readline())

const rules: Rule[] = []
const rulesByTarget: { [target: string]: Rule[] } = {}
const prereqsOf: { [target: string]: string[] } = {}
for (let i = 0; i < nLines; i++) {
  let line = readline()
  const hash = line.indexOf("#")
  if (hash >= 0) line = line.substring(0, hash)
  const isAction = line.charAt(0) === "\t"
  line = line.trim()
  if (line === "") continue
  if (isAction) {
    rules[rules.length - 1].actions.push(line.split(/\s+/))
    continue
  }
  const colon = line.indexOf(":")
  const target = line.substring(0, colon).trim()
  const rest = line.substring(colon + 1).trim()
  const prereqs = rest === "" ? [] : rest.split(/\s+/)
  const rule: Rule = { target, prereqs, actions: [] }
  rules.push(rule)
  if (!rulesByTarget[target]) {
    rulesByTarget[target] = []
    prereqsOf[target] = []
  }
  rulesByTarget[target].push(rule)
  for (const p of prereqs) if (prereqsOf[target].indexOf(p) < 0) prereqsOf[target].push(p)
}

// Cycle detection over the whole dependency graph (0 = unseen, 1 = in progress, 2 = done)
const state: { [node: string]: number } = {}
function hasCycle(node: string): boolean {
  if (state[node] === 1) return true
  if (state[node] === 2) return false
  state[node] = 1
  for (const p of prereqsOf[node] || []) if (hasCycle(p)) return true
  state[node] = 2
  return false
}

let cyclic = false
for (const target in prereqsOf) if (hasCycle(target)) cyclic = true

if (cyclic) {
  console.log("[Circular dependencies detected]")
} else {
  const output: string[] = []
  const visited: { [node: string]: boolean } = {}
  let clock = 1000000

  const distinct = (list: string[]): string[] => list.filter((v, i) => list.indexOf(v) === i)

  const build = (target: string): void => {
    if (visited[target]) return
    visited[target] = true
    const prereqs = (prereqsOf[target] || []).slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    for (const p of prereqs) build(p)
    if (!rulesByTarget[target]) return
    const own = fileTime[target]
    const outdated = own === undefined || prereqs.some(p => fileTime[p] !== undefined && own <= fileTime[p])
    if (!outdated) return
    for (const rule of rulesByTarget[target]) {
      for (const action of rule.actions) {
        const tokens: string[] = []
        for (const token of action) {
          if (token === "$@") tokens.push(target)
          else if (token === "$<") tokens.push(rule.prereqs[0])
          else if (token === "$^") tokens.push(...distinct(rule.prereqs))
          else tokens.push(token)
        }
        output.push(tokens.join(" "))
      }
    }
    fileTime[target] = ++clock
  }

  for (const goal of goals) build(goal)
  output.push("[Build complete]")
  console.log(output.join("\n"))
}
