;; 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
;; https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

;; CodinGame AOT-compiles namespace Solution and runs -main.
(ns Solution (:gen-class))

(defn -main [& _]
  (let [n (Long/parseLong (.trim (read-line)))]
    (loop [k 0]
      (if (< (quot (* k (inc k)) 2) n)
        (recur (inc k))
        (println k))))
  (flush))
