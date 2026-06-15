(* 🎮 CodinGame Puzzle - max-area *)
(* https://www.codingame.com/training/easy/max-area *)

let () =
  let _ = read_line () in
  let a =
    Array.of_list
      (List.map int_of_string
         (String.split_on_char ' ' (String.trim (read_line ()))))
  in
  let left = ref 0 and right = ref (Array.length a - 1) and best = ref 0 in
  while !left < !right do
    let h = min a.(!left) a.(!right) in
    let area = h * (!right - !left) in
    if area > !best then best := area;
    if a.(!left) < a.(!right) then incr left else decr right
  done;
  Printf.printf "%d\n" !best
