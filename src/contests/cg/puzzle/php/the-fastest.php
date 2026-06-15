<?php
// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

// Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
$n = (int) trim(fgets(STDIN));
$best = "";
for ($i = 0; $i < $n; $i++) {
    $t = trim(fgets(STDIN));
    if ($best === "" || $t < $best) {
        $best = $t;
    }
}
echo $best . "\n";
