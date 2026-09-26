#pragma GCC optimize("O3")
#pragma GCC optimize("unroll-loops")
#include <algorithm>
#include <array>
#include <bitset>
#include <cassert>
#include <chrono>
#include <ciso646>
#include <cmath>
#include <complex>
#include <cstdio>
#include <cstring>
#include <functional>
#include <iomanip>
#include <iostream>
#include <map>
#include <numeric>
#include <queue>
#include <random>
#include <set>
#include <stack>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>

using namespace std;

template <typename A, typename B> ostream& operator<<(ostream& os, const pair<A, B>& p) { return os << '(' << p.first << ", " << p.second << ')'; }
template <typename T_container, typename T = typename enable_if<!is_same<T_container, string>::value, typename T_container::value_type>::type>
ostream& operator<<(ostream& os, const T_container& v)
{
    os << '{';
    string sep;
    for (const T& x : v)
        os << sep << x, sep = ", ";
    return os << '}';
}
void dbg_out() { cerr << endl; }
template <typename Head, typename... Tail> void dbg_out(Head H, Tail... T)
{
    cerr << ' ' << H;
    dbg_out(T...);
}
#ifdef LOCAL
#define dbg(...) cerr << "(" << #__VA_ARGS__ << "):", dbg_out(__VA_ARGS__)
#else
#define dbg(...)
#endif

#define ar array
#define ll long long
#define ld long double
#define all(a) (a).begin(), (a).end()
#define rep(i, n) for (int i = 0; i < (int)n; i++)
#define per(i, n) for (int i = n - 1; i >= 0; i--)
#define Rep(i, sta, n) for (int i = sta; i < (int)n; i++)
#define rep1(i, n) for (int i = 1; i <= (int)n; i++)
#define per1(i, n) for (int i = n; i >= 1; i--)
#define Rep1(i, sta, n) for (int i = sta; i <= n; i++)
#define rint(i)                                                                                                                                      \
    ll i;                                                                                                                                            \
    cin >> i;
#define rvint(v, sz)                                                                                                                                 \
    vector<ll> v;                                                                                                                                    \
    for (size_t _ = 0; _ < (size_t)(sz); ++_) {                                                                                                      \
        ll _value;                                                                                                                                   \
        cin >> _value;                                                                                                                               \
        v.push_back(_value);                                                                                                                         \
    }
#define rstr(i)                                                                                                                                      \
    string i;                                                                                                                                        \
    cin >> i;
#define rvstr(v, sz)                                                                                                                                 \
    vector<string> v;                                                                                                                                \
    for (size_t _ = 0; _ < (size_t)(sz); ++_) {                                                                                                      \
        string _value;                                                                                                                               \
        cin >> _value;                                                                                                                               \
        v.push_back(_value);                                                                                                                         \
    }
#define rchar(i)                                                                                                                                     \
    char i;                                                                                                                                          \
    cin >> i;
#define bool_str(b) ((b) ? "YES" : "NO")
#define MAX_N 1000000000001
#define MOD 998244353
#define INF 1e9
#define EPS 1e-9

int main()
{
    ios_base::sync_with_stdio(0);
    cin.tie(0);
    cout.tie(0);
    
    while (true) {
        rstr(game_phase);
        rint(applications_count);
        for (int i = 0; i < applications_count; ++i) {
            rstr(object_type);
            rint(id);
            rint(training_needed); // number of TRAINING skills needed to release this application
            rint(coding_needed); // number of CODING skills needed to release this application
            rint(daily_routine_needed); // number of DAILY_ROUTINE skills needed to release this application
            rint(task_prioritization_needed); // number of TASK_PRIORITIZATION skills needed to release this application
            rint(architecture_study_needed); // number of ARCHITECTURE_STUDY skills needed to release this application
            rint(continuous_delivery_needed); // number of CONTINUOUS_DELIVERY skills needed to release this application
            rint(code_review_needed); // number of CODE_REVIEW skills needed to release this application
            rint(refactoring_needed); // number of REFACTORING skills needed to release this application
        }

        for (int i = 0; i < 2; ++i) {
            rint(player_location); // id of the zone in which the player is located
            rint(player_score);
            rint(player_permanent_daily_routine_cards); // number of DAILY_ROUTINE the player has played. It allows them to take cards from the adjacent zones
            rint(player_permanent_architecture_study_cards); // number of ARCHITECTURE_STUDY the player has played. It allows them to draw more cards
        }

        rint(card_locations_count);
        for (int i = 0; i < card_locations_count; ++i) {
            rstr(cards_location); // the location of the card list. It can be HAND, DRAW, DISCARD or OPPONENT_CARDS (AUTOMATED and OPPONENT_AUTOMATED will appear in later leagues)
            rint(training_cards_count);
            rint(coding_cards_count);
            rint(daily_routine_cards_count);
            rint(task_prioritization_cards_count);
            rint(architecture_study_cards_count);
            rint(continuous_delivery_cards_count);
            rint(code_review_cards_count);
            rint(refactoring_cards_count);
            rint(bonus_cards_count);
            rint(technical_debt_cards_count);
        }

        rint(possible_moves_count);
        rvstr(possible_moves, possible_moves_count);

        cout << "RANDOM" << endl;
    }
}