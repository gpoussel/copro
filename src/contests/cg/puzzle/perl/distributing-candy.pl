# 🎮 CodinGame Puzzle - distributing-candy
# https://www.codingame.com/training/easy/distributing-candy

my ($n, $m) = split ' ', <STDIN>;
my @candies = sort { $a <=> $b } split ' ', <STDIN>;
my $best = 9**9**9;
for my $i (0 .. $n - $m) {
    my $diff = $candies[$i + $m - 1] - $candies[$i];
    $best = $diff if $diff < $best;
}
print "$best\n";
