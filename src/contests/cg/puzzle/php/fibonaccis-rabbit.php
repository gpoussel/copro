<?php
// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

list($f0, $n) = array_map('intval', explode(' ', trim(fgets(STDIN))));
list($a, $b) = array_map('intval', explode(' ', trim(fgets(STDIN))));
// FN can exceed 2^63 (but is < 2^64), so use bcmath arbitrary-precision sums.
$f = array_fill(0, $n + 1, "0");
$f[0] = (string) $f0;
for ($i = 1; $i <= $n; $i++) {
    $total = "0";
    for ($k = $a; $k <= $b; $k++) {
        if ($i - $k >= 0) {
            $total = bcadd($total, $f[$i - $k]);
        }
    }
    $f[$i] = $total;
}
echo $f[$n] . "\n";
