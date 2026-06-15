# 🎮 CodinGame Puzzle - 1d-bush-fire
# https://www.codingame.com/training/easy/1d-bush-fire

my $n = <STDIN>;
chomp $n;
for (1 .. $n) {
    my $strip = <STDIN>;
    $strip =~ s/\s+$//;
    my $drops = 0;
    my $j = 0;
    my $len = length $strip;
    while ($j < $len) {
        if (substr($strip, $j, 1) eq 'f') {
            # Drop at j covers j, j+1, j+2 — skip past all 3.
            $drops++;
            $j += 3;
        } else {
            $j++;
        }
    }
    print "$drops\n";
}
