// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

use std::collections::HashMap;

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let n: usize = rl().parse().unwrap();
    // Trie as a flat vec of nodes, each a digit -> child-index map.
    let mut nodes: Vec<HashMap<char, usize>> = vec![HashMap::new()];
    let mut cable = 0;
    for _ in 0..n {
        let number = rl();
        let mut cur = 0;
        for c in number.chars() {
            if !nodes[cur].contains_key(&c) {
                let id = nodes.len();
                nodes[cur].insert(c, id);
                nodes.push(HashMap::new());
                cable += 1;
            }
            cur = nodes[cur][&c];
        }
    }
    println!("{}", cable);
}
