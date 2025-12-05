import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector3 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2021 - Day 19

function parseInput(input: string) {
  return utils.input.blocks(input).map(block => {
    const [header, ...coordinates] = utils.input.lines(block)
    const id = +header.split(" ")[2]
    const coords = coordinates.map(line => {
      const [x, y, z] = line.split(",").map(Number)
      return new Vector3(x, y, z)
    })
    return new Scanner(id, coords)
  })
}

const ORIENTATIONS: Array<(p: Vector3) => Vector3> = [
  p => new Vector3(p.x, p.y, p.z),
  p => new Vector3(p.x, -p.y, -p.z),
  p => new Vector3(p.x, p.z, -p.y),
  p => new Vector3(p.x, -p.z, p.y),

  p => new Vector3(-p.x, -p.y, p.z),
  p => new Vector3(-p.x, p.y, -p.z),
  p => new Vector3(-p.x, p.z, p.y),
  p => new Vector3(-p.x, -p.z, -p.y),

  p => new Vector3(p.y, p.z, p.x),
  p => new Vector3(p.y, -p.z, -p.x),
  p => new Vector3(p.y, p.x, -p.z),
  p => new Vector3(p.y, -p.x, p.z),

  p => new Vector3(-p.y, -p.z, p.x),
  p => new Vector3(-p.y, p.z, -p.x),
  p => new Vector3(-p.y, -p.x, -p.z),
  p => new Vector3(-p.y, p.x, p.z),

  p => new Vector3(p.z, p.x, p.y),
  p => new Vector3(p.z, -p.x, -p.y),
  p => new Vector3(p.z, p.y, -p.x),
  p => new Vector3(p.z, -p.y, p.x),

  p => new Vector3(-p.z, -p.x, p.y),
  p => new Vector3(-p.z, p.x, -p.y),
  p => new Vector3(-p.z, p.y, p.x),
  p => new Vector3(-p.z, -p.y, -p.x),
]

// Compute distances between all beacon pairs as a fingerprint
function computeDistanceFingerprint(beacons: Vector3[]): Set<number> {
  const distances = new Set<number>()
  for (let i = 0; i < beacons.length; i++) {
    for (let j = i + 1; j < beacons.length; j++) {
      const dx = beacons[i].x - beacons[j].x
      const dy = beacons[i].y - beacons[j].y
      const dz = beacons[i].z - beacons[j].z
      distances.add(dx * dx + dy * dy + dz * dz)
    }
  }
  return distances
}

function countCommonDistances(a: Set<number>, b: Set<number>): number {
  let count = 0
  for (const d of a) {
    if (b.has(d)) {
      count++
    }
  }
  return count
}

class Scanner {
  private offset: Vector3 = new Vector3(0, 0, 0)
  public placed: boolean = false
  private beaconsSet: Set<string> = new Set()
  private orientedBeaconsCache: Vector3[][] = []
  public distanceFingerprint: Set<number>

  constructor(
    public num: number,
    private beacons: Vector3[]
  ) {
    // Pre-compute all 24 orientations upfront
    for (let o = 0; o < 24; o++) {
      this.orientedBeaconsCache[o] = beacons.map(b => ORIENTATIONS[o](b))
    }
    // Compute distance fingerprint (rotation-invariant)
    this.distanceFingerprint = computeDistanceFingerprint(beacons)
  }

  getBeacons(): Vector3[] {
    return this.beacons
  }

  getBeaconsSet(): Set<string> {
    return this.beaconsSet
  }

  fixate() {
    if (this.placed) {
      throw new Error("placed already")
    }
    this.placed = true
    for (const b of this.beacons) {
      this.beaconsSet.add(b.str())
    }
  }

  getPosition(): Vector3 {
    return this.offset
  }

  // Quick check if scanners might overlap based on distance fingerprints
  mightOverlap(other: Scanner): boolean {
    // 12 common beacons means at least C(12,2) = 66 common distances
    return countCommonDistances(this.distanceFingerprint, other.distanceFingerprint) >= 66
  }

  overlaps(other: Scanner): boolean {
    const otherBeacons = other.getBeacons()
    const theirs = other.getBeaconsSet()
    const otherPosition = other.getPosition()

    for (let o = 0; o < 24; ++o) {
      const orientedBeacons = this.orientedBeaconsCache[o]

      for (let i = 0; i <= otherBeacons.length - 12; ++i) {
        for (let j = 0; j <= orientedBeacons.length - 12; ++j) {
          const offset = otherBeacons[i].minus(orientedBeacons[j])

          // Count shared beacons
          let sharedCount = 0
          const sharedKeys = new Set<string>()
          for (const mb of orientedBeacons) {
            const key = `${mb.x + offset.x},${mb.y + offset.y},${mb.z + offset.z}`
            if (theirs.has(key)) {
              sharedCount++
              sharedKeys.add(key)
            }
          }

          if (sharedCount < 12) {
            continue
          }

          // Check if non-shared beacons are too close
          let othersAreTooClose = false
          for (const mb of orientedBeacons) {
            const ax = mb.x + offset.x
            const ay = mb.y + offset.y
            const az = mb.z + offset.z
            const key = `${ax},${ay},${az}`
            if (!sharedKeys.has(key)) {
              if (
                Math.abs(ax - otherPosition.x) <= 1000 &&
                Math.abs(ay - otherPosition.y) <= 1000 &&
                Math.abs(az - otherPosition.z) <= 1000
              ) {
                othersAreTooClose = true
                break
              }
            }
          }
          if (othersAreTooClose) {
            continue
          }

          for (const p of otherBeacons) {
            const key = p.str()
            if (!sharedKeys.has(key)) {
              if (
                Math.abs(p.x - offset.x) <= 1000 &&
                Math.abs(p.y - offset.y) <= 1000 &&
                Math.abs(p.z - offset.z) <= 1000
              ) {
                othersAreTooClose = true
                break
              }
            }
          }
          if (othersAreTooClose) {
            continue
          }

          // Found a match - apply transformation and fixate
          this.offset = offset
          this.beacons = orientedBeacons.map(b => b.add(offset))
          this.fixate()
          return true
        }
      }
    }
    return false
  }
}

function solveScannerPlacement(scanners: Scanner[]) {
  scanners[0].fixate()
  const done = [scanners[0].num]
  while (true) {
    let found = false
    for (const source of scanners) {
      if (!source.placed) {
        continue
      }
      for (const s of scanners) {
        if (s.placed) {
          continue
        }
        // Quick fingerprint check before expensive overlap test
        if (!s.mightOverlap(source)) {
          continue
        }
        if (s.overlaps(source)) {
          found = true
          done.push(s.num)
          break
        }
      }
    }
    if (!found) {
      break
    }
  }
  if (scanners.length != done.length) {
    throw new Error("not all scanners are placed")
  }
}

function part1(inputString: string) {
  const scanners = parseInput(inputString)
  solveScannerPlacement(scanners)

  const beacons = new Set<string>()
  for (const s of scanners) {
    for (const p of s.getBeacons()) {
      const key = p.str()
      beacons.add(key)
    }
  }
  return beacons.size
}

function part2(inputString: string) {
  const scanners = parseInput(inputString)
  solveScannerPlacement(scanners)
  let max = -Infinity
  for (const a of scanners) {
    const ap = a.getPosition()
    for (const b of scanners) {
      const bp = b.getPosition()
      const diff = ap.minus(bp)
      const distance = Math.abs(diff.x) + Math.abs(diff.y) + Math.abs(diff.z)
      if (distance > max) {
        max = distance
      }
    }
  }
  return max
}

const EXAMPLE = `
--- scanner 0 ---
404,-588,-901
528,-643,409
-838,591,734
390,-675,-793
-537,-823,-458
-485,-357,347
-345,-311,381
-661,-816,-575
-876,649,763
-618,-824,-621
553,345,-567
474,580,667
-447,-329,318
-584,868,-557
544,-627,-890
564,392,-477
455,729,728
-892,524,684
-689,845,-530
423,-701,434
7,-33,-71
630,319,-379
443,580,662
-789,900,-551
459,-707,401

--- scanner 1 ---
686,422,578
605,423,415
515,917,-361
-336,658,858
95,138,22
-476,619,847
-340,-569,-846
567,-361,727
-460,603,-452
669,-402,600
729,430,532
-500,-761,534
-322,571,750
-466,-666,-811
-429,-592,574
-355,545,-477
703,-491,-529
-328,-685,520
413,935,-424
-391,539,-444
586,-435,557
-364,-763,-893
807,-499,-711
755,-354,-619
553,889,-390

--- scanner 2 ---
649,640,665
682,-795,504
-784,533,-524
-644,584,-595
-588,-843,648
-30,6,44
-674,560,763
500,723,-460
609,671,-379
-555,-800,653
-675,-892,-343
697,-426,-610
578,704,681
493,664,-388
-671,-858,530
-667,343,800
571,-461,-707
-138,-166,112
-889,563,-600
646,-828,498
640,759,510
-630,509,768
-681,-892,-333
673,-379,-804
-742,-814,-386
577,-820,562

--- scanner 3 ---
-589,542,597
605,-692,669
-500,565,-823
-660,373,557
-458,-679,-417
-488,449,543
-626,468,-788
338,-750,-386
528,-832,-391
562,-778,733
-938,-730,414
543,643,-506
-524,371,-870
407,773,750
-104,29,83
378,-903,-323
-778,-728,485
426,699,580
-438,-605,-362
-469,-447,-387
509,732,623
647,635,-688
-868,-804,481
614,-800,639
595,780,-596

--- scanner 4 ---
727,592,562
-293,-554,779
441,611,-461
-714,465,-776
-743,427,-804
-660,-479,-426
832,-632,460
927,-485,-438
408,393,-506
466,436,-512
110,16,151
-258,-428,682
-393,719,612
-211,-452,876
808,-476,-593
-575,615,604
-485,667,467
-680,325,-822
-627,-443,-432
872,-547,-609
833,512,582
807,604,487
839,-516,451
891,-625,532
-652,-548,-490
30,-46,-14`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 79,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 3621,
      },
    ],
  },
} as AdventOfCodeContest
