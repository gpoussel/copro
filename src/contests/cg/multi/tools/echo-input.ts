// Diagnostic bot: echoes the first input lines to stderr, then times out.
// Play it once (play_arena_games with stderr_tail) when a bot times out on
// turn 1 with no stderr: the real input format often differs from the
// statement (e.g. Yavalath sends the opponent move as "x y" on one line).
for (let i = 0; i < 40; i++) console.error(`L${i}=${JSON.stringify(readline())}`)
