<?php
// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

$n = (int) trim(fgets(STDIN));
$root = [];
$cableUnits = 0;
for ($i = 0; $i < $n; $i++) {
    $number = trim(fgets(STDIN));
    $node = &$root;
    $len = strlen($number);
    for ($j = 0; $j < $len; $j++) {
        $d = $number[$j];
        if (!isset($node[$d])) {
            $node[$d] = [];
            $cableUnits++;
        }
        $node = &$node[$d];
    }
    unset($node);
}
echo $cableUnits . "\n";
