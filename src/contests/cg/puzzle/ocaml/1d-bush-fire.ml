(* 🎮 CodinGame Puzzle - 1d-bush-fire *)
(* https://www.codingame.com/training/easy/1d-bush-fire *)

let () =
  let n = int_of_string (String.trim (read_line ())) in
  for _ = 1 to n do
    let strip = String.trim (read_line ()) in
    let len = String.length strip in
    let drops = ref 0 and j = ref 0 in
    while !j < len do
      if strip.[!j] = 'f' then begin
        (* Drop at j covers j, j+1, j+2 — skip past all 3. *)
        incr drops;
        j := !j + 3
      end
      else incr j
    done;
    Printf.printf "%d\n" !drops
  done
