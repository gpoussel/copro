// 🎮 CodinGame Puzzle - team-building
// https://www.codingame.com/training/medium/team-building

const n = parseInt(readline())
const k = parseInt(readline())
const m = parseInt(readline())
const initials: string[] = []
for (let i = 0; i < m; i++) initials.push(readline().trim()[0])

const used: boolean[] = new Array(m).fill(false)
const teams: string[] = []
const results: string[] = []

// Teams are built in increasing order of their lowest-index player, so each
// partition of distinct players is generated exactly once
function buildTeam(lastStart: number) {
  if (teams.length === n) {
    results.push(teams.slice().sort().join(","))
    return
  }
  for (let start = lastStart + 1; start < m; start++) {
    if (used[start]) continue
    used[start] = true
    pickMembers(start, start, [initials[start]])
    used[start] = false
  }
}

function pickMembers(start: number, last: number, members: string[]) {
  if (members.length === k) {
    teams.push(members.slice().sort().join(""))
    buildTeam(start)
    teams.pop()
    return
  }
  for (let i = last + 1; i < m; i++) {
    if (used[i]) continue
    used[i] = true
    members.push(initials[i])
    pickMembers(start, i, members)
    members.pop()
    used[i] = false
  }
}

buildTeam(-1)
results.sort()
console.log(results.join("\n"))
