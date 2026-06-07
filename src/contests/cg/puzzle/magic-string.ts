// @ts-nocheck
// 🎮 CodinGame Puzzle - magic-string
// https://www.codingame.com/training/easy/magic-string

const n = parseInt(readline());
const names: string[] = [];
for (let i = 0; i < n; i++) {
  names.push(readline());
}

names.sort();

// We need a string S such that exactly n/2 names are <= S and n/2 names are > S.
// After sorting, the split must be between names[n/2-1] and names[n/2].
// So: names[n/2-1] <= S < names[n/2]
// We want the shortest such S, and lexicographically smallest on tie.

const lo = names[n / 2 - 1]; // S must be >= lo
const hi = names[n / 2];     // S must be < hi

// Find the shortest string S with lo <= S < hi.
// Strategy: try increasing lengths L from 1 upward.
// For a given length L, find the lexicographically smallest string of length L
// that satisfies lo <= S < hi.
//
// The smallest S of length L >= lo truncated/padded would be:
//   - If len(lo) <= L: lo followed by 'A's... but we just need >= lo
//   - The smallest string of length L that is >= lo and < hi
//
// For length L:
//   lower bound: if lo.length <= L, then lo + "A"*(L-lo.length) is fine as lower,
//                but actually the min >= lo of length L is lo[0..L-1] if lo.length >= L (with care)
//
// Let's just try: for each length L starting at 1,
// find the lex-smallest S of that length where lo <= S < hi.
// If found, output and done.

function compare(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Find the lex-smallest string of exactly length L in [lo, hi)
// Returns null if none exists.
function findShortest(L: number): string | null {
  // The lex smallest string of length L >= lo:
  // If lo.length > L: lo[:L] might be > or = lo (truncated). Actually lo > lo[:L] always if lo has more chars.
  //   Wait: "JESS" < "JESSICA" so lo[:L] < lo when L < lo.length. So strings of length L < lo.length
  //   that start with lo[:L] are all < lo, and strings > lo[:L] might be >= lo.
  //   Actually any string of length L < lo.length is either < lo (if str <= lo[:L])
  //   or could be > lo if str > lo[:L].
  //   Specifically: str (length L) >= lo iff str > lo[:L], because:
  //     if str > lo[:L], then str > lo[:L] which means str > lo (since lo starts with lo[:L] + more)
  //     Wait no: "JESSI" > "JESS" (compare char by char, up to min length, "JESSI"[:4]=="JESS"==lo, but "JESSI" has length 5 > 4)
  //     Actually string comparison: "JESSI" vs "JESSICA": J=J,E=E,S=S,S=S,I vs I => equal so far, then "JESSI" ends but "JESSICA" continues => "JESSI" < "JESSICA".
  //     Hmm let me re-examine: for L < lo.length: a string S of length L satisfies S >= lo iff S > lo[0..L-1]
  //     Because if S == lo[0..L-1], then S < lo (lo is longer). If S > lo[0..L-1], then S > lo.

  // For L >= lo.length: smallest string of length L >= lo is lo + "A"*(L-lo.length) ... no wait
  //   actually lo itself (padded with nothing) compared to lo+"A"s: lo < lo+"A" so lo+"A"*(L-lo.length) >= lo. Yes.
  //   But we just need any string of length L >= lo. The smallest of length L >= lo is:
  //     lo[0..L-1] (first L chars of lo) if L <= lo.length... no that's < lo.
  //   Let me think differently.

  // Smallest string of length L in [lo, hi):
  // - Generate candidate = smallest string of length L that is >= lo
  // - Check if candidate < hi
  // - If yes, return candidate. If no, return null.

  let candidate: string;

  if (L >= lo.length) {
    // smallest of length L >= lo: just lo + 'A'*(L-lo.length)?
    // lo + 'A'*(L-lo.length) >= lo because it extends lo with more chars.
    // But is there something smaller of length L that's still >= lo?
    // lo[:lo.length] padded = lo + 'A'*(L-lo.length).
    // For any shorter prefix: lo[:k] + X... if X < lo[k], that's < lo. So no.
    // Actually wait: lo + 'A'*(L-lo.length) — is this the smallest?
    // Any string of length L >= lo must have its first lo.length chars >= lo (as a string).
    // If first lo.length chars == lo, then the remaining chars can be anything, smallest = 'A'.
    // If first lo.length chars > lo (strictly), then remaining can be 'A', but that's bigger.
    // So smallest = lo + 'A'*(L-lo.length).
    candidate = lo + 'A'.repeat(L - lo.length);
  } else {
    // L < lo.length
    // Smallest of length L >= lo: we need S > lo[0..L-1] (see above)
    // So smallest is: lo[0..L-2] + nextChar(lo[L-1])
    // But nextChar might overflow past 'Z', in which case we need to backtrack further.
    let prefix = lo.substring(0, L);
    // increment prefix by 1 in lex order (treating as base-26 A-Z)
    let arr = prefix.split('');
    let carry = true;
    for (let i = arr.length - 1; i >= 0 && carry; i--) {
      if (arr[i] < 'Z') {
        arr[i] = String.fromCharCode(arr[i].charCodeAt(0) + 1);
        carry = false;
      } else {
        arr[i] = 'A';
      }
    }
    if (carry) {
      // overflow: no string of length L can be > lo[:L] in [A-Z]^L
      return null;
    }
    candidate = arr.join('');
  }

  // Check candidate < hi
  if (candidate < hi) {
    return candidate;
  }
  return null;
}

let answer: string | null = null;
for (let L = 1; L <= 31 && answer === null; L++) {
  answer = findShortest(L);
}

console.log(answer);
