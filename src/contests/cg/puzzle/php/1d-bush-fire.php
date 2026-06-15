<?php
// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

$n = (int) trim(fgets(STDIN));
for ($t = 0; $t < $n; $t++) {
    $strip = rtrim(fgets(STDIN), "\r\n");
    $drops = 0;
    $j = 0;
    $len = strlen($strip);
    while ($j < $len) {
        if ($strip[$j] === 'f') {
            // Drop at j covers j, j+1, j+2 — skip past all 3.
            $drops++;
            $j += 3;
        } else {
            $j++;
        }
    }
    echo $drops . "\n";
}
