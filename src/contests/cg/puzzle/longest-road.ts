// @ts-nocheck
// 🎮 CodinGame Puzzle - longest-road
// https://www.codingame.com/training/medium/longest-road

const n = parseInt(readline());
const grid = [];
for (let i = 0; i < n; i++) {
    grid.push(readline());
}

// Collect all players from the grid
const players = new Set();
for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
        const ch = grid[r][c];
        if (ch !== '#') {
            players.add(ch.toUpperCase());
        }
    }
}

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/**
 * For a given player, find their longest road using DFS.
 * Roads are lowercase letters (e.g. 'a' for player 'A').
 * Settlements are uppercase letters (e.g. 'A').
 * Roads count toward length; settlements act as connectors (no length contribution).
 * We want the longest simple path through road cells (no cell visited twice).
 */
function longestRoadForPlayer(player) {
    const road = player.toLowerCase();
    const settlement = player.toUpperCase();

    // Collect all road cells as starting points
    const roadCells = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === road) {
                roadCells.push([r, c]);
            }
        }
    }

    if (roadCells.length === 0) return 0;

    let maxLen = 0;

    // visited tracks cells currently in the DFS path
    const visited = Array.from({ length: n }, () => new Array(n).fill(false));

    /**
     * DFS: at cell (r, c), current road length is `len`.
     * We can traverse through settlements without counting them,
     * but we still mark them visited to avoid loops.
     */
    function dfs(r, c, len) {
        if (len > maxLen) maxLen = len;

        for (const [dr, dc] of DIRS) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            if (visited[nr][nc]) continue;

            const cell = grid[nr][nc];
            if (cell === road) {
                visited[nr][nc] = true;
                dfs(nr, nc, len + 1);
                visited[nr][nc] = false;
            } else if (cell === settlement) {
                // Settlement connects roads but doesn't add to length
                visited[nr][nc] = true;
                dfs(nr, nc, len);
                visited[nr][nc] = false;
            }
            // '#' or other players' cells are not traversable
        }
    }

    // Start DFS from each road cell
    for (const [r, c] of roadCells) {
        visited[r][c] = true;
        dfs(r, c, 1);
        visited[r][c] = false;
    }

    return maxLen;
}

let bestPlayer = null;
let bestLen = 0;

for (const player of players) {
    const len = longestRoadForPlayer(player);
    if (len > bestLen) {
        bestLen = len;
        bestPlayer = player;
    }
}

if (bestLen >= 5) {
    console.log(bestPlayer + ' ' + bestLen);
} else {
    console.log('0');
}
