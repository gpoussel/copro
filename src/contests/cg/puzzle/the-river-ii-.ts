// @ts-nocheck
// 🎮 CodinGame Puzzle - the-river-ii-
// https://www.codingame.com/training/easy/the-river-ii-

const r1 = parseInt(readline());

function digitSum(n) {
  let s = 0;
  while (n > 0) {
    s += n % 10;
    n = Math.floor(n / 10);
  }
  return s;
}

// River r1 always contains r1 (its source). It is a meeting point of two or more
// rivers iff some OTHER river also flows through r1 — equivalently, iff r1 has a
// predecessor m with m + digitSum(m) === r1 (river m then reaches r1, and m != r1).
//
// Such a predecessor must satisfy m = r1 - digitSum(m). Since digitSum(m) <= 45 for
// m < 100000, only m in [r1 - 50, r1) can qualify, so a tiny window suffices — no
// need to simulate every river up to r1 (which times out).

let meeting = false;
for (let m = Math.max(1, r1 - 50); m < r1; m++) {
  if (m + digitSum(m) === r1) {
    meeting = true;
    break;
  }
}

console.log(meeting ? "YES" : "NO");
