use std::io;
macro_rules ! parse_input { ( $ x : expr , $ t : ident ) => { $ x . trim ( ) . parse ::<$ t > ( ) . unwrap ( ) } ; }
fn main() {
    let mut input_line = String::new();
    io::stdin().read_line(&mut input_line).unwrap();
    let number_of_cells = parse_input!(input_line, i32);
    for i in 0..number_of_cells as usize {
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let index = parse_input!(inputs[0], i32);
        let richness = parse_input!(inputs[1], i32);
        let neigh_0 = parse_input!(inputs[2], i32);
        let neigh_1 = parse_input!(inputs[3], i32);
        let neigh_2 = parse_input!(inputs[4], i32);
        let neigh_3 = parse_input!(inputs[5], i32);
        let neigh_4 = parse_input!(inputs[6], i32);
        let neigh_5 = parse_input!(inputs[7], i32);
    }
    loop {
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let day = parse_input!(input_line, i32);
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let nutrients = parse_input!(input_line, i32);
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let sun = parse_input!(inputs[0], i32);
        let score = parse_input!(inputs[1], i32);
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let opp_sun = parse_input!(inputs[0], i32);
        let opp_score = parse_input!(inputs[1], i32);
        let opp_is_waiting = parse_input!(inputs[2], i32);
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let number_of_trees = parse_input!(input_line, i32);
        for i in 0..number_of_trees as usize {
            let mut input_line = String::new();
            io::stdin().read_line(&mut input_line).unwrap();
            let inputs = input_line.split(" ").collect::<Vec<_>>();
            let cell_index = parse_input!(inputs[0], i32);
            let size = parse_input!(inputs[1], i32);
            let is_mine = parse_input!(inputs[2], i32);
            let is_dormant = parse_input!(inputs[3], i32);
        }
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let number_of_possible_actions = parse_input!(input_line, i32);
        let mut got_action = false;
        for i in 0..number_of_possible_actions as usize {
            let mut input_line = String::new();
            io::stdin().read_line(&mut input_line).unwrap();
            let possible_action = input_line.trim_matches('\n').to_string();
            eprintln!("Possible action: {}", possible_action);
            if !got_action && possible_action != "WAIT" {
                println!("{}", possible_action);
                got_action = true;
            }
        }
        if !got_action {
            println!("WAIT");
        }
    }
}

