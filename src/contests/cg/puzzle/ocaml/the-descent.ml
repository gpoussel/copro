(* 🎮 CodinGame Puzzle - the-descent *)
(* https://www.codingame.com/training/easy/the-descent *)

(* Game loop: each turn, read 8 mountain heights and fire on the tallest one. *)
let () =
  while true do
    let max_height = ref (-1) and max_index = ref 0 in
    for i = 0 to 7 do
      let h = int_of_string (String.trim (read_line ())) in
      if h > !max_height then begin
        max_height := h;
        max_index := i
      end
    done;
    Printf.printf "%d\n" !max_index;
    flush stdout
  done
