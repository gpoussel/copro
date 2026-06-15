<?php
// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

$n = (int) trim(fgets(STDIN));
$s = [];
for ($i = 0; $i < $n; $i++) {
    $s[] = (int) trim(fgets(STDIN));
}
sort($s);
$minDiff = PHP_INT_MAX;
for ($i = 1; $i < $n; $i++) {
    $diff = $s[$i] - $s[$i - 1];
    if ($diff < $minDiff) {
        $minDiff = $diff;
    }
}
echo $minDiff . "\n";
