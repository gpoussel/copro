<?php
// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

list($n, $m) = array_map('intval', explode(' ', trim(fgets(STDIN))));
$candies = array_map('intval', explode(' ', trim(fgets(STDIN))));
sort($candies);
$best = PHP_INT_MAX;
for ($i = 0; $i + $m - 1 < $n; $i++) {
    $diff = $candies[$i + $m - 1] - $candies[$i];
    if ($diff < $best) {
        $best = $diff;
    }
}
echo $best . "\n";
