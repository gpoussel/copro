(* 🎮 CodinGame Puzzle - distributing-candy *)
(* https://www.codingame.com/training/easy/distributing-candy *)

let () =
  let first = String.split_on_char ' ' (String.trim (read_line ())) in
  let n = int_of_string (List.nth first 0) in
  let m = int_of_string (List.nth first 1) in
  let candies =
    Array.of_list
      (List.map int_of_string
         (String.split_on_char ' ' (String.trim (read_line ()))))
  in
  Array.sort compare candies;
  let best = ref max_int in
  for i = 0 to n - m do
    let diff = candies.(i + m - 1) - candies.(i) in
    if diff < !best then best := diff
  done;
  Printf.printf "%d\n" !best
