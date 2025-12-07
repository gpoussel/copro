import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 19

interface Rule {
  cat?: string
  op?: string
  val?: number
  dest: string
}

interface Workflow {
  rules: Rule[]
}

function parseInput(input: string) {
  const [workflowsPart, partsPart] = utils.input.blocks(input)

  const workflows = new Map<string, Workflow>()
  for (const line of workflowsPart.split("\n")) {
    const [name, rest] = line.split("{")
    const rulesStr = rest.slice(0, -1).split(",")
    const rules: Rule[] = rulesStr.map(r => {
      if (r.includes(":")) {
        const [cond, dest] = r.split(":")
        const cat = cond[0]
        const op = cond[1]
        const val = +cond.slice(2)
        return { cat, op, val, dest }
      }
      return { dest: r }
    })
    workflows.set(name, { rules })
  }

  const parts = partsPart.split("\n").map(line => {
    const obj: Record<string, number> = {}
    const match = line.match(/\{x=(\d+),m=(\d+),a=(\d+),s=(\d+)\}/)!
    obj.x = +match[1]
    obj.m = +match[2]
    obj.a = +match[3]
    obj.s = +match[4]
    return obj
  })

  return { workflows, parts }
}

function evaluate(part: Record<string, number>, workflows: Map<string, Workflow>): boolean {
  let current = "in"
  while (current !== "A" && current !== "R") {
    const wf = workflows.get(current)!
    for (const rule of wf.rules) {
      if (!rule.cat) {
        current = rule.dest
        break
      }
      const val = part[rule.cat]
      const matches = rule.op === "<" ? val < rule.val! : val > rule.val!
      if (matches) {
        current = rule.dest
        break
      }
    }
  }
  return current === "A"
}

function part1(inputString: string) {
  const { workflows, parts } = parseInput(inputString)
  return parts.filter(p => evaluate(p, workflows)).reduce((sum, p) => sum + p.x + p.m + p.a + p.s, 0)
}

interface Range {
  x: [number, number]
  m: [number, number]
  a: [number, number]
  s: [number, number]
}

function countAccepted(workflows: Map<string, Workflow>, name: string, range: Range): number {
  if (name === "R") return 0
  if (name === "A") {
    return (
      (range.x[1] - range.x[0] + 1) *
      (range.m[1] - range.m[0] + 1) *
      (range.a[1] - range.a[0] + 1) *
      (range.s[1] - range.s[0] + 1)
    )
  }

  const wf = workflows.get(name)!
  let total = 0
  let current = { ...range, x: [...range.x], m: [...range.m], a: [...range.a], s: [...range.s] } as Range

  for (const rule of wf.rules) {
    if (!rule.cat) {
      total += countAccepted(workflows, rule.dest, current)
      break
    }

    const cat = rule.cat as keyof Range
    const [lo, hi] = current[cat]

    if (rule.op === "<") {
      if (hi < rule.val!) {
        total += countAccepted(workflows, rule.dest, current)
        break
      } else if (lo < rule.val!) {
        const match = {
          ...current,
          x: [...current.x],
          m: [...current.m],
          a: [...current.a],
          s: [...current.s],
        } as Range
        match[cat] = [lo, rule.val! - 1]
        total += countAccepted(workflows, rule.dest, match)
        current[cat] = [rule.val!, hi]
      }
    } else {
      if (lo > rule.val!) {
        total += countAccepted(workflows, rule.dest, current)
        break
      } else if (hi > rule.val!) {
        const match = {
          ...current,
          x: [...current.x],
          m: [...current.m],
          a: [...current.a],
          s: [...current.s],
        } as Range
        match[cat] = [rule.val! + 1, hi]
        total += countAccepted(workflows, rule.dest, match)
        current[cat] = [lo, rule.val!]
      }
    }
  }

  return total
}

function part2(inputString: string) {
  const { workflows } = parseInput(inputString)
  const initialRange: Range = {
    x: [1, 4000],
    m: [1, 4000],
    a: [1, 4000],
    s: [1, 4000],
  }
  return countAccepted(workflows, "in", initialRange)
}

const EXAMPLE = `
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 19114,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 167409079868000,
      },
    ],
  },
} as AdventOfCodeContest
