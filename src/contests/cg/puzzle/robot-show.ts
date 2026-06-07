// @ts-nocheck
// 🎮 CodinGame Puzzle - robot-show
// https://www.codingame.com/training/easy/robot-show

/**
 * Key insight: When two bots collide and reverse directions, it's equivalent
 * to them passing through each other (the set of positions is the same).
 * So we can treat each bot independently and choose its direction to maximize
 * the time it spends in the duct before exiting.
 *
 * For a bot at position p in a duct of length L:
 *   - Going Right: exits after (L - p) seconds
 *   - Going Left:  exits after p seconds
 * To maximize total time, pick max(p, L - p) for each bot.
 * Then round the sum to nearest integer (though positions are integers so
 * individual times are already integers).
 *
 * Wait — but the problem says "longest possible time for the bots to run
 * around ... until all bots exit", which is the LAST bot to exit, not the sum.
 *
 * Re-reading: "What is the longest possible time" = the time until ALL bots exit.
 * This is the maximum exit time across all bots, not the sum.
 *
 * For each bot at position p, we can choose direction to maximize ITS exit time:
 *   max(p, L - p)
 * The show ends when the last bot exits, so we want:
 *   max over all bots of max(p, L - p)
 *
 * But wait — the example: L=10, bots at 2 and 6
 *   Bot at 2: max(2, 8) = 8
 *   Bot at 6: max(6, 4) = 6
 *   Answer should be 8 ✓
 *
 * But the example description says "Total bot running time: 8 sec" with both bots
 * running in face-to-face directions (bot at 2 goes Right, bot at 6 goes Left).
 * After collision at position 4 (after 2 sec), they bounce back:
 *   Bot originally at 2 now goes Left, exits at position 0 after 4 more sec = 6 total
 *   Bot originally at 6 now goes Right, exits at position 10 after 4 more sec (at t=6 from collision) = wait...
 *
 * Let me re-verify: bot at 2 going Right and bot at 6 going Left collide at pos 4 at t=2.
 * After bounce: bot at 4 going Left exits at t=2+4=6, bot at 4 going Right exits at t=2+6=8.
 * So last bot exits at t=8. And max(2,8)=8, max(6,4)=6 → max=8. ✓
 *
 * So the answer is: max over all bots of max(pos, L - pos)
 */

const L = parseInt(readline());
const N = parseInt(readline());
const positions = readline().split(' ').map(Number);

let maxTime = 0;
for (const p of positions) {
    const bestTime = Math.max(p, L - p);
    if (bestTime > maxTime) {
        maxTime = bestTime;
    }
}

console.log(Math.round(maxTime) + 0);
