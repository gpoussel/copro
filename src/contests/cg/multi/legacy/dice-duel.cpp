#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

int main()
{

    // game loop
    while (1) {
        int dice_count;
        cin >> dice_count; cin.ignore();
        for (int i = 0; i < dice_count; i++) {
            int owner;
            string cell;
            int top;
            int front;
            int bottom;
            int back;
            int left;
            int right;
            cin >> owner >> cell >> top >> front >> bottom >> back >> left >> right; cin.ignore();
        }

        // Write an action using cout. DON'T FORGET THE "<< endl"
        // To debug: cerr << "Debug messages..." << endl;

        cout << "A1 URUL" << endl;
    }
}