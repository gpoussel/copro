// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

#include <iostream>
#include <string>
using namespace std;

int main() {
    string line;
    getline(cin, line);
    while (!line.empty() && (line.back() == '\r' || line.back() == ' ' || line.back() == '\n'))
        line.pop_back();
    int balance = 0, best = 0;
    for (size_t i = 0; i < line.size(); i++) {
        if (line[i] == '<') balance++;
        else balance--;
        if (balance < 0) break;
        if (balance == 0) best = (int)i + 1;
    }
    cout << best << endl;
}
