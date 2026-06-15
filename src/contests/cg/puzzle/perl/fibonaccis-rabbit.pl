# 🎮 CodinGame Puzzle - fibonaccis-rabbit
# https://www.codingame.com/training/easy/fibonaccis-rabbit

# FN can exceed 2^63 (but is < 2^64); use bigint for exact arbitrary precision.
use bigint;
my ($f0, $n) = split ' ', <STDIN>;
my ($a, $b) = split ' ', <STDIN>;
my @f = (0) x ($n + 1);
$f[0] = $f0;
for my $i (1 .. $n) {
    my $total = 0;
    for my $k ($a .. $b) {
        $total += $f[$i - $k] if $i - $k >= 0;
    }
    $f[$i] = $total;
}
print "$f[$n]\n";
