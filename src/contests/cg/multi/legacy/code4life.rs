use std::io;

macro_rules! parse_input {
    ($x:expr, $t:ident) => ($x.trim().parse::<$t>().unwrap())
}

const MAX_SAMPLES_PER_PLAYER: usize = 1;
const _MAX_MOLECULES: i32 = 10;

#[derive(Debug)]
enum Module {
    Diagnosis,
    Molecules,
    Laboratory,
    Samples
}

fn goto(module: Module) -> String {
    match module {
        Module::Diagnosis => "GOTO DIAGNOSIS",
        Module::Molecules => "GOTO MOLECULES",
        Module::Laboratory => "GOTO LABORATORY",
        Module::Samples => "GOTO SAMPLES",
    }.to_owned()
}

fn connect_to_diagnosis(id: i32) -> String {
    format!("CONNECT {}", id)
}

fn connect_to_molecules(num: u8) -> String {
    format!("CONNECT {}", (num + b'A' as u8) as char)
}

fn connect_to_laboratory(id: i32) -> String {
    format!("CONNECT {}", id)
}

fn connect_to_samples(num: u8) -> String {
    format!("CONNECT {}", num)
}

fn wait() -> String {
    format!("WAIT")
}

#[derive(Debug)]
struct Player {
    target: String,
    score: i32,
    eta: i32,
    storage: [i32; 5],
    expertise: [i32; 5]
}

#[derive(Debug)]
struct Sample {
    id: i32,
    carried_by: i32,
    rank: i32,
    health: i32,
    cost: [i32; 5]
}

fn find_next_sample(samples: &Vec<Sample>) -> &Sample {
    samples.iter().find(|s| s.carried_by == -1).unwrap()
}

/**
 * Bring data on patient samples from the diagnosis machine to the laboratory with enough molecules to produce medicine!
 **/
fn main() {
    let mut input_line = String::new();
    io::stdin().read_line(&mut input_line).unwrap();
    let project_count = parse_input!(input_line, i32);
    for i in 0..project_count as usize {
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let _a = parse_input!(inputs[0], i32);
        let _b = parse_input!(inputs[1], i32);
        let _c = parse_input!(inputs[2], i32);
        let _d = parse_input!(inputs[3], i32);
        let _e = parse_input!(inputs[4], i32);
    }

    let mut still_grabbing_samples = true;
    let mut diagnosed_samples = vec![];

    // game loop
    loop {
        let mut players = vec![];
        for i in 0..2 as usize {
            let mut input_line = String::new();
            io::stdin().read_line(&mut input_line).unwrap();
            let inputs = input_line.split(" ").collect::<Vec<_>>();
            let target = inputs[0].trim().to_string();
            let eta = parse_input!(inputs[1], i32); // ignored
            let score = parse_input!(inputs[2], i32);
            let storage_a = parse_input!(inputs[3], i32);
            let storage_b = parse_input!(inputs[4], i32);
            let storage_c = parse_input!(inputs[5], i32);
            let storage_d = parse_input!(inputs[6], i32);
            let storage_e = parse_input!(inputs[7], i32);
            let expertise_a = parse_input!(inputs[8], i32);
            let expertise_b = parse_input!(inputs[9], i32);
            let expertise_c = parse_input!(inputs[10], i32);
            let expertise_d = parse_input!(inputs[11], i32);
            let expertise_e = parse_input!(inputs[12], i32);

            players.push(Player { 
                target,
                score,
                eta,
                storage: [storage_a, storage_b, storage_c, storage_d, storage_e],
                expertise: [expertise_a, expertise_b, expertise_c, expertise_d, expertise_e]
            });
        }
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let inputs = input_line.split(" ").collect::<Vec<_>>();
        let available_a = parse_input!(inputs[0], i32);
        let available_b = parse_input!(inputs[1], i32);
        let available_c = parse_input!(inputs[2], i32);
        let available_d = parse_input!(inputs[3], i32);
        let available_e = parse_input!(inputs[4], i32);
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let sample_count = parse_input!(input_line, i32);
        let available_molecules = [available_a, available_b, available_c, available_d, available_e];

        let mut samples = vec![];
        for i in 0..sample_count as usize {
            let mut input_line = String::new();
            io::stdin().read_line(&mut input_line).unwrap();
            let inputs = input_line.split(" ").collect::<Vec<_>>();
            let sample_id = parse_input!(inputs[0], i32);
            let carried_by = parse_input!(inputs[1], i32);
            let rank = parse_input!(inputs[2], i32); // ignored
            let _expertise_gain = inputs[3].trim().to_string(); // ignored
            let health = parse_input!(inputs[4], i32);
            let cost_a = parse_input!(inputs[5], i32);
            let cost_b = parse_input!(inputs[6], i32);
            let cost_c = parse_input!(inputs[7], i32);
            let cost_d = parse_input!(inputs[8], i32);
            let cost_e = parse_input!(inputs[9], i32);

            samples.push(Sample {
                id: sample_id,
                carried_by,
                rank,
                health,
                cost: [cost_a, cost_b, cost_c, cost_d, cost_e]
            });
        }

        let my_current_samples = samples.iter().filter(|s| s.carried_by == 0).collect::<Vec<&Sample>>();

        let action = if my_current_samples.len() > 0 && !still_grabbing_samples {
            // I do have all my samples, are they already diagnosed?
            let undiagnosed_samples = samples.iter().filter(|s| s.carried_by == 0 && !diagnosed_samples.contains(&s.id)).collect::<Vec<&Sample>>();
            if undiagnosed_samples.len() > 0 {
                // Need to diagnosed those samples
                if players[0].target == "DIAGNOSIS" && players[0].eta == 0 {
                    diagnosed_samples.push(undiagnosed_samples[0].id);
                    connect_to_diagnosis(undiagnosed_samples[0].id)
                } else {
                    goto(Module::Diagnosis)
                }
            } else {
                let mut missing_molecules = vec![0, 0, 0, 0, 0];
                for my_current_sample in &my_current_samples {
                    for molecule_index in 0..5 {
                        missing_molecules[molecule_index] += my_current_sample.cost[molecule_index]
                            - players[0].storage[molecule_index];
                    }
                }
                let count_missing_molecules: i32 = missing_molecules.iter().sum();
                if count_missing_molecules > 0 {
                    // Some molecules are missing, need to fetch them
                    if players[0].target == "MOLECULES" && players[0].eta == 0 {
                        let index = missing_molecules.iter().position(|&r| r > 0).unwrap();
                        if available_molecules[index] > 0 {
                            connect_to_molecules(index as u8)
                        } else {
                            wait()
                        }
                    } else {
                        goto(Module::Molecules)
                    }
                } else {
                    // We have all molecules: move to laboratory
                    if players[0].target == "LABORATORY" && players[0].eta == 0 {
                        connect_to_laboratory(my_current_samples[0].id)
                    } else {
                        goto(Module::Laboratory)
                    }
                }
            }
        } else {
            // I am not carrying a file: need to get one ASAP
            if players[0].target == "SAMPLES" && players[0].eta == 0 {
                // I am on SAMPLES, I can grab a sample
                still_grabbing_samples = my_current_samples.len() + 1 < MAX_SAMPLES_PER_PLAYER;
                connect_to_samples(2)
            } else {
                // Need to move to diagnosis
                goto(Module::Samples)
            }
        };
        println!("{}", action)
    }
}
