<?php
// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

fgets(STDIN);
$r = array_map('floatval', explode(' ', trim(fgets(STDIN))));
$reflected = 0.0;
for ($i = count($r) - 1; $i >= 0; $i--) {
    $ri = $r[$i];
    $denom = 1 - $ri * $reflected;
    $reflected = $ri + ($denom == 0 ? 0 : ((1 - $ri) * (1 - $ri) * $reflected) / $denom);
}
echo sprintf("%.4f", $reflected) . "\n";
