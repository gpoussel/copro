;; 🎮 CodinGame Puzzle - 1d-bush-fire
;; https://www.codingame.com/training/easy/1d-bush-fire

(ns Solution (:gen-class))

(defn -main [& _]
  (let [n (Integer/parseInt (.trim (read-line)))]
    (dotimes [_ n]
      (let [strip (.trim (read-line))
            len (count strip)]
        (loop [j 0 drops 0]
          (if (< j len)
            (if (= (.charAt strip j) \f)
              ;; Drop at j covers j, j+1, j+2 — skip past all 3.
              (recur (+ j 3) (inc drops))
              (recur (inc j) drops))
            (println drops))))))
  (flush))
