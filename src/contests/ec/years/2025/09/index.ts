import { count } from "console"
import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 9

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [id, sequence] = line.split(":")
    return { id: Number(id), sequence: sequence.split("") }
  })
}

function canBeChild(parent1: string[], parent2: string[], child: string[]): boolean {
  for (let i = 0; i < child.length; ++i) {
    if (child[i] !== parent1[i] && child[i] !== parent2[i]) {
      return false
    }
  }
  return true
}

function countMatchingSymbols(seq1: string[], seq2: string[]): number {
  let count = 0
  for (let i = 0; i < seq1.length; ++i) {
    if (seq1[i] === seq2[i]) {
      count++
    }
  }
  return count
}

function getSimilarityDegree(
  scales: ReturnType<typeof parseInput>,
  parent1: number,
  parent2: number,
  child: number
): number {
  return (
    countMatchingSymbols(scales[parent1].sequence, scales[child].sequence) *
    countMatchingSymbols(scales[parent2].sequence, scales[child].sequence)
  )
}

function part1(inputString: string) {
  const scales = parseInput(inputString)
  if (canBeChild(scales[0].sequence, scales[1].sequence, scales[2].sequence)) {
    return getSimilarityDegree(scales, 0, 1, 2)
  }
  if (canBeChild(scales[0].sequence, scales[2].sequence, scales[1].sequence)) {
    return getSimilarityDegree(scales, 0, 2, 1)
  }
  return getSimilarityDegree(scales, 1, 2, 0)
}

function part2(inputString: string) {
  const scales = parseInput(inputString)
  let sumOfSimilarityDegree = 0
  for (let i = 0; i < scales.length; ++i) {
    const childSequence = scales[i].sequence
    // Try all pairs of parents
    for (let j = 0; j < scales.length; ++j) {
      if (i === j) {
        continue
      }
      for (let k = j + 1; k < scales.length; ++k) {
        if (i === k) {
          continue
        }
        const parent1 = scales[j].sequence
        const parent2 = scales[k].sequence
        if (canBeChild(parent1, parent2, childSequence)) {
          sumOfSimilarityDegree += getSimilarityDegree(scales, j, k, i)
        }
      }
    }
  }
  return sumOfSimilarityDegree
}

function part3(inputString: string) {
  const scales = parseInput(inputString)
  interface Child {
    id: number
    parent1: number
    parent2: number
  }
  const childs: Child[] = []
  for (let i = 0; i < scales.length; ++i) {
    const childSequence = scales[i].sequence
    // Try all pairs of parents
    for (let j = 0; j < scales.length; ++j) {
      if (i === j) {
        continue
      }
      for (let k = j + 1; k < scales.length; ++k) {
        if (i === k) {
          continue
        }
        const parent1 = scales[j].sequence
        const parent2 = scales[k].sequence
        if (canBeChild(parent1, parent2, childSequence)) {
          childs.push({ id: scales[i].id, parent1: scales[j].id, parent2: scales[k].id })
        }
      }
    }
  }

  // Need to find the biggest family (connected components in a graph: child is connected to both parents)
  const graph: Map<number, Set<number>> = new Map()
  for (const scale of scales) {
    graph.set(scale.id, new Set())
  }
  for (const child of childs) {
    graph.get(child.id)!.add(child.parent1)
    graph.get(child.id)!.add(child.parent2)
    graph.get(child.parent1)!.add(child.id)
    graph.get(child.parent2)!.add(child.id)
  }

  const visited: Set<number> = new Set()
  let largestFamilySum = 0
  let largestFamilySize = 0

  function dfs(node: number, members: number[]): number {
    visited.add(node)
    members.push(node)
    let sum = node
    for (const neighbor of graph.get(node)!) {
      if (!visited.has(neighbor)) {
        sum += dfs(neighbor, members)
      }
    }
    return sum
  }

  for (const scale of scales) {
    if (!visited.has(scale.id)) {
      const members: number[] = []
      const familySum = dfs(scale.id, members)
      if (members.length > largestFamilySize) {
        largestFamilySize = members.length
        largestFamilySum = familySum
      }
    }
  }

  return largestFamilySum
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `1:CAAGCGCTAAGTTCGCTGGATGTGTGCCCGCG
2:CTTGAATTGGGCCGTTTACCTGGTTTAACCAT
3:CTAGCGCTGAGCTGGCTGCCTGGTTGACCGCG`,
        expected: 414,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `1:GCAGGCGAGTATGATACCCGGCTAGCCACCCC
2:TCTCGCGAGGATATTACTGGGCCAGACCCCCC
3:GGTGGAACATTCGAAAGTTGCATAGGGTGGTG
4:GCTCGCGAGTATATTACCGAACCAGCCCCTCA
5:GCAGCTTAGTATGACCGCCAAATCGCGACTCA
6:AGTGGAACCTTGGATAGTCTCATATAGCGGCA
7:GGCGTAATAATCGGATGCTGCAGAGGCTGCTG`,
        expected: 1245,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `1:GCAGGCGAGTATGATACCCGGCTAGCCACCCC
2:TCTCGCGAGGATATTACTGGGCCAGACCCCCC
3:GGTGGAACATTCGAAAGTTGCATAGGGTGGTG
4:GCTCGCGAGTATATTACCGAACCAGCCCCTCA
5:GCAGCTTAGTATGACCGCCAAATCGCGACTCA
6:AGTGGAACCTTGGATAGTCTCATATAGCGGCA
7:GGCGTAATAATCGGATGCTGCAGAGGCTGCTG`,
        expected: 12,
      },
      {
        input: `1:GCAGGCGAGTATGATACCCGGCTAGCCACCCC
2:TCTCGCGAGGATATTACTGGGCCAGACCCCCC
3:GGTGGAACATTCGAAAGTTGCATAGGGTGGTG
4:GCTCGCGAGTATATTACCGAACCAGCCCCTCA
5:GCAGCTTAGTATGACCGCCAAATCGCGACTCA
6:AGTGGAACCTTGGATAGTCTCATATAGCGGCA
7:GGCGTAATAATCGGATGCTGCAGAGGCTGCTG
8:GGCGTAAAGTATGGATGCTGGCTAGGCACCCG`,
        expected: 36,
      },
    ],
  },
} as EverybodyCodesContest
