use std::io;

macro_rules! parse_input {
    ($x:expr, $t:ident) => ($x.trim().parse::<$t>().unwrap())
}

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
fn main() {
    let mut input_line = String::new();
    io::stdin().read_line(&mut input_line).unwrap();
    let num_all_customers = parse_input!(input_line, i32);
    for i in 0..num_all_customers as usize {
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let customer_item = inputs[0].trim().to_string(); // the food the customer is waiting for
        let customer_award = parse_input!(inputs[1], i32); // the number of points awarded for delivering the food
    }
    for i in 0..7 as usize {
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let kitchen_line = input_line.trim_matches('\n').to_string();
    }

    // game loop
    loop {
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let turns_remaining = parse_input!(input_line, i32);
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let player_x = parse_input!(inputs[0], i32);
        let player_y = parse_input!(inputs[1], i32);
        let player_item = inputs[2].trim().to_string();
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let partner_x = parse_input!(inputs[0], i32);
        let partner_y = parse_input!(inputs[1], i32);
        let partner_item = inputs[2].trim().to_string();
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let num_tables_with_items = parse_input!(input_line, i32); // the number of tables in the kitchen that currently hold an item
        for i in 0..num_tables_with_items as usize {
            let mut input_line = String::new();
            io::stdin().read_line(&mut input_line).unwrap();
            let inputs = input_line.split(" ").collect::<Vec<_>>();
            let table_x = parse_input!(inputs[0], i32);
            let table_y = parse_input!(inputs[1], i32);
            let item = inputs[2].trim().to_string();
        }
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let oven_contents = inputs[0].trim().to_string(); // ignore until wood 1 league
        let oven_timer = parse_input!(inputs[1], i32);
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let num_customers = parse_input!(input_line, i32); // the number of customers currently waiting for food
        for i in 0..num_customers as usize {
            let mut input_line = String::new();
            io::stdin().read_line(&mut input_line).unwrap();
            let inputs = input_line.split(" ").collect::<Vec<_>>();
            let customer_item = inputs[0].trim().to_string();
            let customer_award = parse_input!(inputs[1], i32);
        }

        // Write an action using println!("message...");
        // To debug: eprintln!("Debug message...");


        // MOVE x y
        // USE x y
        // WAIT
        println!("WAIT");
    }
}
