// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

def br = new BufferedReader(new InputStreamReader(System.in))
int n = br.readLine().trim() as int
def root = [:]
int cable = 0
n.times {
    String number = br.readLine().trim()
    def node = root
    for (int j = 0; j < number.length(); j++) {
        String d = number[j]
        if (!node.containsKey(d)) {
            node[d] = [:]
            cable++
        }
        node = node[d]
    }
}
println cable
