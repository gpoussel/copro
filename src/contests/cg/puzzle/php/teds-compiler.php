<?php
// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

$line = rtrim(fgets(STDIN), "\r\n");
$balance = 0;
$best = 0;
$len = strlen($line);
for ($i = 0; $i < $len; $i++) {
    if ($line[$i] === '<') {
        $balance++;
    } else {
        $balance--;
    }
    if ($balance < 0) {
        break;
    }
    if ($balance === 0) {
        $best = $i + 1;
    }
}
echo $best . "\n";
