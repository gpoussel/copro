<?php
// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

list($a, $b) = array_map('intval', explode(' ', trim(fgets(STDIN))));
$x = $a;
$y = $b;
while ($y != 0) {
    $q = intdiv($x, $y);
    $r = $x % $y;
    echo "$x=$y*$q+$r\n";
    $x = $y;
    $y = $r;
}
echo "GCD($a,$b)=$x\n";
