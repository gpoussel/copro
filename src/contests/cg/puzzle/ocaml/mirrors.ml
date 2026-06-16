(* 🎮 CodinGame Puzzle - mirrors *)
(* https://www.codingame.com/training/easy/mirrors *)

let () =
  let _ = read_line () in
  let parts = String.split_on_char ' ' (String.trim (read_line ())) in
  let r = Array.of_list (List.map float_of_string parts) in
  let reflected = ref 0.0 in
  for i = Array.length r - 1 downto 0 do
    let ri = r.(i) in
    let denom = 1.0 -. ri *. !reflected in
    reflected :=
      ri +. (if denom = 0.0 then 0.0
             else ((1.0 -. ri) *. (1.0 -. ri) *. !reflected) /. denom)
  done;
  Printf.printf "%.4f\n" !reflected
