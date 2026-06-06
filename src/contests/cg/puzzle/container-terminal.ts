// @ts-nocheck
// 🎮 CodinGame Puzzle - container-terminal
// https://www.codingame.com/training/easy/container-terminal

const n = parseInt(readline());
for (let i = 0; i < n; i++) {
    const line = readline();
    // Each stack is represented by its top container letter.
    // A container 'c' can be placed on a stack with top 't' only if t >= c
    // (meaning ship t comes after or at the same time as ship c, so c can be
    // picked up first without disturbing t).
    // Greedy: place 'c' on the stack whose top is the smallest value >= c.
    // This is the classic patience-sort-style greedy with binary search.
    const tops: string[] = [];

    for (const c of line) {
        // Find the stack with the smallest top >= c
        // tops is maintained in sorted order
        let lo = 0, hi = tops.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (tops[mid] >= c) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        if (lo < tops.length) {
            // Place on this stack, update its top
            tops[lo] = c;
            // Re-sort since tops[lo] changed (insertion-sort style: move c to correct position)
            // After replacing tops[lo] with c, the array may not be sorted.
            // Since c <= old tops[lo] and c >= tops[lo-1] (by binary search invariant),
            // we might need to adjust.
            // Actually: tops[lo] was the smallest >= c, so c <= tops[lo].
            // tops[lo-1] < c (by binary search). So after setting tops[lo] = c,
            // we need to find where c fits among tops[lo..] since c <= old tops[lo].
            // But c >= tops[lo-1], so c is >= everything before lo.
            // Among tops[lo..], c <= old tops[lo] <= tops[lo+1] <= ...
            // So tops[lo] = c is still >= tops[lo-1] and <= tops[lo+1]. Array stays sorted!
            // Wait: old tops[lo] was the SMALLEST >= c. After setting tops[lo] = c,
            // tops[lo] = c <= old tops[lo] <= tops[lo+1]. And tops[lo-1] < c.
            // So the array remains sorted. No re-sort needed.
        } else {
            // No stack can accept c; open a new stack
            // Insert c in sorted position
            tops.splice(lo, 0, c);
        }
    }

    console.log(tops.length);
}
