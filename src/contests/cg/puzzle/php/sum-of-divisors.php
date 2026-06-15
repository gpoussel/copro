<?php
// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

// d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
// of divisors is sum over d of d * floor(n/d).
$n = (int) trim(fgets(STDIN));
$total = 0;
for ($d = 1; $d <= $n; $d++) {
    $total += $d * intdiv($n, $d);
}
echo $total . "\n";
