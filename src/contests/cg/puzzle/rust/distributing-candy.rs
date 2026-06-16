// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let first: Vec<usize> = rl().split_whitespace().map(|x| x.parse().unwrap()).collect();
    let (n, m) = (first[0], first[1]);
    let mut candies: Vec<i64> = rl().split_whitespace().map(|x| x.parse().unwrap()).collect();
    candies.sort();
    let mut best = i64::MAX;
    let mut i = 0;
    while i + m - 1 < n {
        let diff = candies[i + m - 1] - candies[i];
        if diff < best {
            best = diff;
        }
        i += 1;
    }
    println!("{}", best);
}
