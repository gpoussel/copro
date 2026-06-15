<?php
// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

fgets(STDIN);
$a = array_map('intval', explode(' ', trim(fgets(STDIN))));
$left = 0;
$right = count($a) - 1;
$best = 0;
while ($left < $right) {
    $height = min($a[$left], $a[$right]);
    $area = $height * ($right - $left);
    if ($area > $best) {
        $best = $area;
    }
    if ($a[$left] < $a[$right]) {
        $left++;
    } else {
        $right--;
    }
}
echo $best . "\n";
