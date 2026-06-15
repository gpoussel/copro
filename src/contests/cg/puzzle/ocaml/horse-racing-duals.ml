(* 🎮 CodinGame Puzzle - horse-racing-duals *)
(* https://www.codingame.com/training/easy/horse-racing-duals *)

let () =
  let n = int_of_string (String.trim (read_line ())) in
  let s = Array.make n 0 in
  for i = 0 to n - 1 do
    s.(i) <- int_of_string (String.trim (read_line ()))
  done;
  Array.sort compare s;
  let min_diff = ref max_int in
  for i = 1 to n - 1 do
    let diff = s.(i) - s.(i - 1) in
    if diff < !min_diff then min_diff := diff
  done;
  Printf.printf "%d\n" !min_diff
