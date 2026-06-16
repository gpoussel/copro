// 🎮 CodinGame Puzzle - the-helpdesk
// https://www.codingame.com/training/easy/the-helpdesk

const worktime: number = parseInt(readline(), 10)
const nc: number = parseInt(readline(), 10)
const efficiency: number[] = readline()
  .split(" ")
  .map((v: string) => parseFloat(v))
readline()
const visitors: number[] = readline()
  .split(" ")
  .map((v: string) => parseInt(v, 10))

const helped: number[] = new Array<number>(nc).fill(0)
const breaks: number[] = new Array<number>(nc).fill(0)
const freeTime: number[] = new Array<number>(nc).fill(0)
const worked: number[] = new Array<number>(nc).fill(0)

let nextVisitor: number = 0

while (nextVisitor < visitors.length) {
  // Earliest moment at which at least one counter is available.
  let t: number = Infinity
  for (let c: number = 0; c < nc; c++) {
    if (freeTime[c] < t) {
      t = freeTime[c]
    }
  }

  // Counters available at this exact moment, in index order.
  const free: number[] = []
  for (let c: number = 0; c < nc; c++) {
    if (freeTime[c] === t) {
      free.push(c)
    }
  }

  // Counters free now that are NOT due a break will serve visitors. The number
  // of visitors actually served at this moment is bounded by those counters
  // and the visitors remaining. Special rule: a break-due counter must not
  // start a break at the same moment the last (overall) visitor begins service.
  let notDue: number = 0
  for (const c of free) {
    if (worked[c] < worktime) {
      notDue++
    }
  }
  const remaining: number = visitors.length - nextVisitor
  const servedNow: number = Math.min(notDue, remaining)
  const lastVisitorServedNow: boolean = remaining - servedNow === 0

  for (const c of free) {
    if (worked[c] >= worktime) {
      // Break is due. Suppress it (counter just goes home) when it would
      // coincide with the last visitor being served at this same moment.
      if (lastVisitorServedNow) {
        freeTime[c] = Infinity
      } else {
        breaks[c]++
        freeTime[c] = t + 10
        worked[c] = 0
      }
    } else if (nextVisitor < visitors.length) {
      const ht: number = visitors[nextVisitor]
      nextVisitor++
      const duration: number = ht / efficiency[c]
      helped[c]++
      worked[c] += duration
      freeTime[c] = t + duration
    } else {
      // Not due a break and no visitors left: go home.
      freeTime[c] = Infinity
    }
  }
}

console.log(helped.join(" "))
console.log(breaks.join(" "))
