<?php
// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

function digitSum($n)
{
    $s = 0;
    while ($n > 0) {
        $s += $n % 10;
        $n = intdiv($n, 10);
    }
    return $s;
}

$a = (int) trim(fgets(STDIN));
$b = (int) trim(fgets(STDIN));
while ($a != $b) {
    if ($a < $b) {
        $a += digitSum($a);
    } else {
        $b += digitSum($b);
    }
}
echo $a . "\n";
