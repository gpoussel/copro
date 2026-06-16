# 🎮 CodinGame Puzzle - sum-of-divisors
# https://www.codingame.com/training/medium/sum-of-divisors

# d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
# of divisors is sum over d of d * floor(n/d).
my $n = <STDIN>;
chomp $n;
my $total = 0;
for my $d (1 .. $n) {
    $total += $d * int($n / $d);
}
print "$total\n";
