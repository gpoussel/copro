// Troll Farm bot, C++ port of troll-farm-tools/bot.ts + engine.ts (same decisions, ~10x the
// simulations per millisecond). Only the options enabled in bot.ts's DEFAULT_PARAMS are ported.
// Local: g++ -std=c++20 -O2 bot.cpp -o bot ; `./bot planall` evaluates every plan whatever the
// time (deterministic, for cppcheck.ts). CodinGame compiles without -O: "O3,inline" gets -O2 speed
// (plain "O3" or "O2" leaves the STL unoptimized, 3.5x slower).
#pragma GCC optimize("O3,inline")
#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <iostream>
#include <map>
#include <memory>
#include <set>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

// ------------------------------------------------------------------------------------ engine
enum { PLUM, LEMON, APPLE, BANANA, IRON, WOOD };
static const char* ITEMS[] = {"PLUM", "LEMON", "APPLE", "BANANA", "IRON", "WOOD"};
static const int COOLDOWN[] = {8, 8, 9, 6};
static const int WATER_BOOST[] = {5, 5, 7, 2};
static const int FINAL_HEALTH[] = {12, 12, 20, 6};
static const int DELTA_HEALTH[] = {2, 2, 3, 1};
static const int MAX_SIZE = 4, MAX_FRUITS = 3, GAME_TURNS = 300;
enum { GRASS, WATER, ROCK, IRONCELL, SHACK };

static double nowMs() { return chrono::duration<double, milli>(chrono::steady_clock::now().time_since_epoch()).count(); }

struct Tree {
  int type, cell, size, health, fruits, cooldown, growth;
};
struct Troll {
  int id, owner, cell, speed, carry, harvest, chop;
  int inv[6];
  int load() const { return inv[0] + inv[1] + inv[2] + inv[3] + inv[4] + inv[5]; }
};

// map data shared by every game / bot of a match
struct MapInfo {
  int W = 0, H = 0, N = 0;
  vector<uint8_t> grid;
  vector<int16_t> dist;  // all pairs, N * N
  int shack[2] = {0, 0};
  const int16_t* d(int c) const { return &dist[(size_t)c * N]; }
  vector<int> nbrs(int c) const {
    int x = c % W;
    vector<int> r;
    if (c + W < N) r.push_back(c + W);
    if (x + 1 < W) r.push_back(c + 1);
    if (c - W >= 0) r.push_back(c - W);
    if (x > 0) r.push_back(c - 1);
    return r;
  }
  bool nearType(int c, int t) const {
    for (int n : nbrs(c))
      if (grid[n] == t) return true;
    return false;
  }
  // BFS over grass from the sources (sources get 0 whatever their type)
  vector<int16_t> bfs(const vector<int>& src) const {
    vector<int16_t> d(N, -1);
    vector<int> q(N);
    int qt = 0;
    for (int s : src)
      if (d[s] < 0) d[s] = 0, q[qt++] = s;
    for (int qh = 0; qh < qt; qh++) {
      int c = q[qh], x = c % W, nd = d[c] + 1;
      if (c + W < N && d[c + W] < 0 && grid[c + W] == GRASS) d[c + W] = nd, q[qt++] = c + W;
      if (x + 1 < W && d[c + 1] < 0 && grid[c + 1] == GRASS) d[c + 1] = nd, q[qt++] = c + 1;
      if (c - W >= 0 && d[c - W] < 0 && grid[c - W] == GRASS) d[c - W] = nd, q[qt++] = c - W;
      if (x > 0 && d[c - 1] < 0 && grid[c - 1] == GRASS) d[c - 1] = nd, q[qt++] = c - 1;
    }
    return d;
  }
  void build() {
    N = W * H;
    dist.assign((size_t)N * N, -1);
    for (int c = 0; c < N; c++) {
      auto d = bfs({c});
      memcpy(&dist[(size_t)c * N], d.data(), N * sizeof(int16_t));
    }
  }
};

struct Game {
  const MapInfo* m;
  int inv[2][6];
  vector<Tree> trees;
  vector<Troll> trolls;
  int nextId = 0, turn = 0, turnsUntilEnd = 0;
  bool over = false, dead[2] = {false, false};
};

static int score(const Game& g, int p) {
  if (g.dead[p]) return -2;
  const int* v = g.inv[p];
  return v[0] + v[1] + v[2] + v[3] + 4 * v[5];
}
static void tickTree(Tree& t) {
  if (t.cooldown > 0) t.cooldown--;
  if (t.cooldown == 0 && t.health > 0) {
    if (t.size < MAX_SIZE) {
      t.size++;
      t.health += DELTA_HEALTH[t.type];
      t.cooldown = t.growth;
    } else if (t.fruits < MAX_FRUITS) {
      t.fruits++;
      t.cooldown = t.growth;
    }
  }
}
static int growthOf(const MapInfo& m, int type, int cell) { return COOLDOWN[type] - (m.nearType(cell, WATER) ? WATER_BOOST[type] : 0); }
static Tree newTree(const MapInfo& m, int type, int cell) { return {type, cell, 0, FINAL_HEALTH[type] - DELTA_HEALTH[type] * MAX_SIZE, 0, 0, growthOf(m, type, cell)}; }

static int manhattan(int W, int a, int b) { return abs(a % W - b % W) + abs(a / W - b / W); }
// Board.getNextCell: the first of the equally good cells (the referee picks one at random)
static int nextCell(const Game& g, int cur, int target, int speed) {
  const MapInfo& m = *g.m;
  const int16_t* src = m.d(cur);
  if (src[target] >= 0 && src[target] <= speed) return target;
  vector<int16_t> tdv;
  const int16_t* td;
  if (src[target] < 0) {
    int best = 1e9;
    vector<int> closest;
    for (int c = 0; c < m.N; c++) {
      if (src[c] < 0) continue;
      int d = manhattan(m.W, c, target);
      if (d < best) best = d, closest.clear();
      if (d == best) closest.push_back(c);
    }
    tdv = m.bfs(closest);
    td = tdv.data();
  } else
    td = m.d(target);
  int best = 1e9, res = cur;
  for (int c = 0; c < m.N; c++) {
    if (src[c] > speed || src[c] < 0) continue;
    int d = td[c];
    if (d >= 0 && d < best) best = d, res = c;
  }
  return res;
}
static bool canTrain(const Game& g, int p, const int* t) {
  int n = 0;
  for (auto& u : g.trolls) n += u.owner == p;
  int c[5] = {n + t[0] * t[0], n + t[1] * t[1], n + t[2] * t[2], 0, n + t[3] * t[3]};
  for (int i = 0; i < 5; i++)
    if (c[i] > g.inv[p][i]) return false;
  return true;
}

enum { A_MOVE = 1, A_HARVEST, A_PLANT, A_CHOP, A_PICK, A_TRAIN, A_DROP, A_MINE };
struct Act {  // one command of our output
  int kind, id, arg;  // MOVE: cell; PLANT / PICK: item
  int talents[4];
};
struct Task {
  int kind, p, unit, target;  // unit: index in g.trolls
  int talents[4];
};

static int treeAtCell(const Game& g, int c) {
  for (int i = 0; i < (int)g.trees.size(); i++)
    if (g.trees[i].cell == c && g.trees[i].health > 0) return i;
  return -1;
}
static bool nearShack(const Game& g, const Troll& u) {
  int s = g.m->shack[u.owner];
  return u.cell == s || manhattan(g.m->W, u.cell, s) == 1;
}
// parseOutput: validation on the pre-move state (errors are dropped)
static void toTasks(const Game& g, int p, const vector<Act>& acts, vector<Task>& tasks) {
  for (const Act& a : acts) {
    Task t{a.kind, p, -1, -1, {0, 0, 0, 0}};
    if (a.kind == A_TRAIN) {
      memcpy(t.talents, a.talents, sizeof t.talents);
      if (!canTrain(g, p, a.talents)) continue;
      tasks.push_back(t);
      continue;
    }
    int ui = -1;
    for (int i = 0; i < (int)g.trolls.size(); i++)
      if (g.trolls[i].id == a.id) ui = i;
    if (ui < 0 || g.trolls[ui].owner != p) continue;
    const Troll& u = g.trolls[ui];
    t.unit = ui;
    int tr = treeAtCell(g, u.cell), fr = u.carry - u.load();
    bool ok = true;
    switch (a.kind) {
      case A_MOVE: t.target = nextCell(g, u.cell, a.arg, u.speed); break;
      case A_HARVEST: ok = tr >= 0 && g.trees[tr].fruits > 0 && fr > 0 && u.harvest > 0; break;
      case A_PLANT: t.target = a.arg; ok = g.m->grid[u.cell] == GRASS && tr < 0 && u.inv[a.arg] > 0; break;
      case A_CHOP: ok = tr >= 0 && u.chop > 0; break;
      case A_PICK: t.target = a.arg; ok = fr > 0 && g.inv[p][a.arg] > 0 && nearShack(g, u); break;
      case A_DROP: ok = u.load() > 0 && nearShack(g, u); break;
      case A_MINE: ok = g.m->nearType(u.cell, IRONCELL) && fr > 0 && u.chop > 0; break;
    }
    if (ok) tasks.push_back(t);
  }
}

static void applyMoves(Game& g, const vector<Task>& moves) {
  static vector<uint8_t> occ;
  for (int p = 0; p < 2; p++) {
    bool any = false;
    for (auto& t : moves) any |= t.p == p;
    if (!any) continue;
    vector<int> units, targets;
    for (int i = 0; i < (int)g.trolls.size(); i++)
      if (g.trolls[i].owner == p) units.push_back(i), targets.push_back(g.trolls[i].cell);
    for (auto& t : moves)
      if (t.p == p)
        for (int k = 0; k < (int)units.size(); k++)
          if (units[k] == t.unit) targets[k] = t.target;
    occ.assign(g.m->N, 0);
    for (int i = (int)units.size() - 1; i >= 0; i--) {
      occ[g.trolls[units[i]].cell] = 1;
      if (g.trolls[units[i]].cell == targets[i]) units.erase(units.begin() + i), targets.erase(targets.begin() + i);
    }
    bool madeMove = true, resolveBlocking = false;
    while (madeMove) {
      madeMove = false;
      map<int, int> freq;
      for (int c : targets) freq[c]++;
      for (int i = (int)units.size() - 1; i >= 0; i--) {
        int c = targets[i];
        if ((resolveBlocking || freq[c] == 1) && !occ[c]) {
          occ[c] = 1;
          occ[g.trolls[units[i]].cell] = 0;
          g.trolls[units[i]].cell = c;
          units.erase(units.begin() + i), targets.erase(targets.begin() + i);
          madeMove = true;
          resolveBlocking = false;
        }
      }
      if (madeMove) continue;
      for (int start = 0; start < (int)units.size(); start++) {
        vector<int> path = {start};
        bool looped = false;
        for (int i = 0; i < (int)units.size() + 1; i++) {
          int target = targets[path.back()], idx = -1;
          for (int k = 0; k < (int)units.size(); k++)
            if (g.trolls[units[k]].cell == target) {
              idx = k;
              break;
            }
          if (idx < 0) break;
          if (idx == path[0]) {
            looped = true;
            break;
          }
          path.push_back(idx);
        }
        if (looped) {
          sort(path.begin(), path.end());
          for (int i = (int)path.size() - 1; i >= 0; i--) {
            int idx = path[i];
            g.trolls[units[idx]].cell = targets[idx];
            units.erase(units.begin() + idx), targets.erase(targets.begin() + idx);
            madeMove = true;
          }
        }
      }
      if (!madeMove && !resolveBlocking) resolveBlocking = madeMove = true;
    }
  }
}

static vector<vector<const Task*>> groupByCell(const Game& g, const vector<Task>& tasks, int kind) {
  map<int, vector<const Task*>> m;
  for (auto& t : tasks)
    if (t.kind == kind) m[g.trolls[t.unit].cell].push_back(&t);
  vector<vector<const Task*>> r;
  for (auto& e : m) r.push_back(e.second);
  return r;
}

static bool stalled(Game& g) {
  const MapInfo& m = *g.m;
  if (!g.trees.empty()) {
    g.turnsUntilEnd = 0;
    for (auto& u : g.trolls) {
      bool on = false;
      for (auto& t : g.trees) on |= t.cell == u.cell;
      if (!on) continue;
      g.turnsUntilEnd = max(g.turnsUntilEnd, (int)(m.d(m.shack[u.owner])[u.cell] / u.speed) + 6);
    }
    return false;
  }
  if (--g.turnsUntilEnd <= 0) return true;
  bool stuck[2] = {true, true};
  for (auto& u : g.trolls)
    if (u.load() > u.inv[IRON]) stuck[u.owner] = false;
  for (int p = 0; p < 2; p++)
    for (int i = 0; i <= BANANA; i++)
      if (g.inv[p][i] > 0) stuck[p] = false;
  int s0 = score(g, 0), s1 = score(g, 1);
  if (stuck[0] && stuck[1]) return true;
  if (stuck[0] && s0 < s1) return true;
  if (stuck[1] && s1 < s0) return true;
  return false;
}

static void step(Game& g, const vector<Task>& tasks) {
  vector<Task> moves;
  for (auto& t : tasks)
    if (t.kind == A_MOVE) moves.push_back(t);
  applyMoves(g, moves);
  for (auto& grp : groupByCell(g, tasks, A_HARVEST)) {
    int ti = treeAtCell(g, g.trolls[grp[0]->unit].cell);
    Tree& tr = g.trees[ti];
    for (int i = 1; i <= MAX_FRUITS; i++) {
      if (tr.fruits == 0) break;
      for (auto* t : grp) {
        Troll& u = g.trolls[t->unit];
        if (i > u.harvest || u.load() >= u.carry) continue;
        u.inv[tr.type]++;
        if (tr.fruits > 0) tr.fruits--;
      }
    }
  }
  for (auto& grp : groupByCell(g, tasks, A_PLANT)) {
    bool same = true;
    for (auto* t : grp) same &= t->target == grp[0]->target;
    if (!same) continue;
    for (auto* t : grp) {
      Troll& u = g.trolls[t->unit];
      u.inv[t->target]--;
      if (treeAtCell(g, u.cell) < 0) g.trees.push_back(newTree(*g.m, t->target, u.cell));
    }
  }
  for (auto& grp : groupByCell(g, tasks, A_CHOP)) {
    int ti = treeAtCell(g, g.trolls[grp[0]->unit].cell);
    if (ti < 0) continue;
    Tree& tr = g.trees[ti];
    for (auto* t : grp) tr.health = max(tr.health - g.trolls[t->unit].chop, 0);
    if (tr.health <= 0) {
      int remaining = tr.size;
      for (int i = 0; i < tr.size && remaining > 0; i++)
        for (auto* t : grp) {
          Troll& u = g.trolls[t->unit];
          if (u.carry - u.load() > 0) u.inv[WOOD]++, remaining--;
        }
    }
  }
  for (auto& t : tasks)
    if (t.kind == A_PICK && g.inv[t.p][t.target] > 0) g.inv[t.p][t.target]--, g.trolls[t.unit].inv[t.target]++;
  for (auto& t : tasks)
    if (t.kind == A_TRAIN) {
      if (!canTrain(g, t.p, t.talents)) continue;
      bool occupied = false;
      for (auto& u : g.trolls) occupied |= u.cell == g.m->shack[t.p];
      if (occupied) continue;
      int n = 0;
      for (auto& u : g.trolls) n += u.owner == t.p;
      const int* d = t.talents;
      int c[5] = {n + d[0] * d[0], n + d[1] * d[1], n + d[2] * d[2], 0, n + d[3] * d[3]};
      for (int i = 0; i < 5; i++) g.inv[t.p][i] -= c[i];
      Troll u{g.nextId++, t.p, g.m->shack[t.p], d[0], d[1], d[2], d[3], {0, 0, 0, 0, 0, 0}};
      g.trolls.push_back(u);
    }
  for (auto& t : tasks)
    if (t.kind == A_DROP) {
      Troll& u = g.trolls[t.unit];
      for (int i = 0; i < 6; i++) g.inv[t.p][i] += u.inv[i], u.inv[i] = 0;
    }
  for (auto& t : tasks)
    if (t.kind == A_MINE) {
      Troll& u = g.trolls[t.unit];
      for (int i = 0; i < u.chop && u.load() < u.carry; i++) u.inv[IRON]++;
    }
  for (auto& t : g.trees)
    if (t.health > 0) tickTree(t);
  g.trees.erase(remove_if(g.trees.begin(), g.trees.end(), [](const Tree& t) { return t.health <= 0; }), g.trees.end());
  g.turn++;
  if (g.turn >= GAME_TURNS || stalled(g)) g.over = true;
}

// ------------------------------------------------------------------------------------ plans
typedef vector<int> Design;  // speed carry harvest chop
typedef vector<Design> Plan;
static const vector<Plan> RANKED_PLANS = {
    {{2, 2, 2, 2}, {3, 4, 1, 3}, {3, 4, 1, 3}, {2, 4, 0, 3}}, {{2, 4, 1, 1}, {2, 4, 1, 3}, {2, 4, 1, 3}},
    {{2, 1, 1, 1}, {2, 2, 1, 1}, {3, 4, 0, 2}, {2, 4, 0, 3}}, {{2, 3, 1, 2}, {3, 4, 1, 2}, {2, 4, 1, 3}, {2, 4, 1, 3}},
    {{2, 2, 2, 1}, {3, 4, 2, 3}, {3, 4, 0, 3}, {3, 4, 0, 3}}, {{2, 4, 2, 2}, {3, 4, 2, 3}, {3, 4, 2, 3}, {3, 4, 1, 3}},
    {{3, 4, 1, 2}, {3, 4, 2, 3}, {3, 4, 0, 3}},              {{2, 2, 2, 1}, {3, 4, 2, 3}, {3, 4, 0, 3}},
    {{2, 2, 2, 1}, {2, 4, 1, 2}, {3, 4, 0, 3}},              {{1, 1, 1, 1}, {2, 4, 1, 2}, {3, 4, 1, 3}},
};
static const vector<Design> P_CHEAP = {{2, 2, 0, 2}, {2, 2, 1, 2}, {2, 3, 0, 2}, {1, 2, 1, 1}};
static const vector<Plan> RP_EXTRA = {
    {{2, 2, 2, 0}}, {{2, 2, 2, 0}, {3, 4, 1, 2}, {2, 4, 0, 3}}, {{2, 4, 1, 2}}, {{2, 4, 0, 3}}, {{3, 4, 1, 3}},
    {{2, 4, 1, 2}, {2, 4, 0, 3}}, {{2, 3, 1, 2}, {2, 4, 0, 3}}, {{2, 2, 1, 2}, {2, 4, 0, 3}}, {{2, 2, 2, 0}, {2, 4, 0, 3}},
};
static vector<Design> AUTO_DESIGNS;
static vector<Plan> GEN_PLANS, GEN_PLANS2;  // GEN_PLANS2: refined design lists (the designs the plan search picks most)  // extra initial plans (planPool): a first design then 1-3 bigger ones

struct Params {
  Plan plan = {{1, 2, 1, 1}, {2, 4, 1, 2}};
  bool choosePlan = true;
  double planBudget = 880, planTurnBudget = 34;
  int planTurns = 12;
  bool planAll = false;
  double trollRate = 1;
  int earlySources = 60;
  int simHorizon = 200;
  double turnLimit = 36;
  int forest = 130;
  double forestValue = 40;
  bool jamRelease = true, jamWide = true;
  vector<int> replanSkip = {2, 4, 7};
  bool replan = true;
  double replanMargin = 10;
  int replanEvery = 10;
  bool noFarmExposed = true;
  int maxSources = 2;
  bool raidNoWait = true, chopperNow = true;
  int chopperCarry = 2;
  double patienceFirst = 25;
  double stick = 1.3;
  int trainDeadline = 220;
  double plantGamma = 0.5, sourceValue = 12;
  int farmPerChopper = 3;
  double raidBeta = 0.5, trainBonus = 3, trollValue = 50, unitMax = 12, seedBonus = 1, denyAlpha = 0.5;
  double denyTheirs = 0.5;  // chop value of the opponent's trees: what felling them denies it
  bool rpExtra = false;  // more re-plan candidates (continuations once the ranked plans are used up)
  double threatBonus = 0;  // chop value of our trees an enemy chopper can reach within threatR turns
  int threatR = 6;
  int simRaidAge = 0;  // plan simulations: ripe trees standing longer than this are felled by the (passive) foe
  int oppModel = 0;  // simOpp's foe: 0 our bot with the first ranked plan, 1 a parasite (see oppParams)
  double smallCap = 24;  // value cap of a missing training unit when only 1-2 are missing
  int minCarry = 2;  // a downgraded design keeps at least this carry
  bool dropsFirst = true;  // job assignment: DROP jobs claim their cells before the others
  bool jamQueue = true;  // a loaded troll whose drop cells are taken moves towards one anyway
  int jamHard = 3;  // after this many jammed turns every empty troll near the drop cells makes way
  bool jamOrders = true;  // in a jam, search the order in which trolls pick their steps
  bool holderWait = true;  // skip a job whose cell holds an own troll not assigned yet (order-dependent deadlocks)
  bool escFirst = false;  // jam-release movers pick their steps before the others
  bool keepPatience = false;  // a plan switch does not restart the patience clock (only a training does)
  int planPool = 200;  // generated plans added to the turn-1 plan search (GEN_PLANS)
  int rpPool = 0;  // re-plans also try the continuations of this many generated plans
  bool paramSearch = true;  // after the plan search, try a few strategy settings per map (evalPlans)
  bool paramSearch2 = true;  // a longer list of settings, two passes
  bool srcRaider = true;  // plant the training-fruit sources a design needs even against a raider
  double srcDeny = 0;  // chop value bonus for their fruit trees (not bananas) within 3 of their shack
  int srcDenyUntil = 150;
  int planRerank = 0;  // the best N turn-1 plans are also simulated against a copy of our bot
  bool genV2 = false;  // planPool draws from GEN_PLANS2
  bool gardenFallback = false;  // a gardener whose jobs were all taken gets the usual ones
  double simEarlyW = 0.5;  // sims add this x the score banked simEarlyAt turns in (tempo)
  int simEarlyAt = 100;
  double simTreeValue = 0;  // sims value the tree sizes standing on our side at the horizon (x4 x this)
  bool firstAffordable = false;  // turn-1 plan search keeps the plans whose first design is affordable at once
  bool forestPicks = true;  // the seed-pick limit counts the free forest slots
  double denyAlphaRaided = -1;  // denyAlpha while we have been raided in the last 40 turns (-1: same)
  bool planRobust = false;  // turn-1 plans are also simulated against a copy of our bot (mean of both values)
  bool srcNone = true;  // want a source for any missing fruit that has no reachable tree at all
  double srcNoneValue = 60;
  bool waitToCarry = false;  // our growing trees are worth waiting for only up to the size we can carry
  int forestCarry = 3;  // forest mode: a troll with chop 2 and this carry is a chopper (the others garden)
  int maxWait = 12;
  double patience = 120, patienceRaided = 120, seedValue = 6;
  int producers = 2;
  double wasteLambda = 0.7;
  bool rollouts = false;  // choose this turn's jobs by rollouts (chooseByRollouts)
  int rollAlts = 2, rollHorizon = 200;
  bool rollOpp = true;  // rollouts play against a copy of our bot (a passive foe misleads them)
  double rollMinRate = 0.3, rollMargin = 2;
  bool simOpp = false;
  bool simOppDiff = true;  // with an opponent model: judge on the score difference (else our score)  // simulations play against a copy of our bot (from its current trolls)
  int planVersion = 0;  // bumped whenever `plan` changes (planRef in bot.ts)
};

// per-map constant data of our side
struct Side {
  const MapInfo* m;
  int shack, oppShack;
  vector<int> dropCells, mineCells, farmAll;
  vector<int16_t> dropDist, oppDropDist;
  vector<uint8_t> nearWater;
  Side(const MapInfo* mi, int me) : m(mi) {
    shack = m->shack[me], oppShack = m->shack[1 - me];
    for (int n : m->nbrs(shack))
      if (m->grid[n] == GRASS) dropCells.push_back(n);
    dropDist = m->bfs(dropCells);
    vector<int> od;
    for (int n : m->nbrs(oppShack))
      if (m->grid[n] == GRASS) od.push_back(n);
    oppDropDist = m->bfs(od);
    for (int c = 0; c < m->N; c++)
      if (m->grid[c] == GRASS && m->nearType(c, IRONCELL)) mineCells.push_back(c);
    nearWater.assign(m->N, 0);
    for (int c = 0; c < m->N; c++)
      if (m->nearType(c, WATER)) nearWater[c] = 1;
    for (int c = 0; c < m->N; c++) {
      int d = dropDist[c];
      if (m->grid[c] != GRASS || d < 0) continue;
      int o = oppDropDist[c] < 0 ? 99 : oppDropDist[c];
      if (d <= 2 && o > d + 2) farmAll.push_back(c);
    }
    stable_sort(farmAll.begin(), farmAll.end(), [&](int a, int b) { return dropDist[a] * 2 - nearWater[a] * 2 < dropDist[b] * 2 - nearWater[b] * 2; });
  }
};

// ------------------------------------------------------------------------------------ bot
struct BTroll {
  int id;
  bool mine;
  int cell, speed, carry, harvest, chop;
  const int* inv;
  int load;
};
enum { K_DROP, K_HARVEST, K_CHOP, K_MINE, K_PLANT, K_PICK };
struct Job {
  int u;  // index in mine
  double rate;
  int dest, act, item, tree, kind;  // act: A_* or 0 (wait here)
};

struct Params;
static bool setParam(Params& P, const string& kv);
struct Bot;
struct Sim {
  Game g;
  unique_ptr<Bot> a, b;  // b: opponent model (player 1), null = passive
  int horizon = 150;
  vector<int> ripeSince;
  bool trace = false;
  int startTurn = -1;
  double earlyV = -1;
  Sim(const Game& g0, shared_ptr<Side> side, const Params& p, shared_ptr<Side> oppSide = nullptr, const Params* oppP = nullptr);
  bool run(double deadline, double& value);
};

struct Bot {
  shared_ptr<Side> S;
  const MapInfo* m;
  int N, W;
  Params P;
  bool sim;
  int turnNo = 0;
  vector<Design> designs;
  int planRef = -1;
  double targetSince = 0;
  int lastK = 0, raidSeen = -1000;
  int jamCount = 0;  // consecutive jammed turns
  const Game* curGame = nullptr;  // the state decide() is called on (turnGame), for move-order checks
  int curSeat = 0;
  int sourcesPlanted[4] = {0, 0, 0, 0};
  int profile = 0;  // 0 unknown, 1 raider, 2 eco
  map<int, pair<int, int>> prev;  // troll id -> (kind, dest)
  map<int, int> seedIntent, intentSince;
  map<int, array<int, 3>> still;  // cell, load, since
  // plan search
  unique_ptr<Game> planGame;
  int planIdx = 0;
  vector<Plan> initPlans;
  int varIdx = 0;
  int planPhase = 0;  // planRobust: 0 passive-foe sim, 1 bot-foe sim of the same plan
  double planV0 = 0;
  vector<pair<double, int>> planVals, rrList;  // (value, index in initPlans)
  int rrIdx = 0;
  double rrBest = -1e18;
  unique_ptr<Sim> planSim;
  double planBest = -1e9;
  bool planPending = false;
  string planScores;
  // re-plans
  unique_ptr<Game> lastGame;
  struct RP {
    Game g;
    vector<Plan> cands;
    int idx = 0;
    unique_ptr<Sim> sim;
    vector<double> vals;
  };
  unique_ptr<RP> rp;
  string rpLog;
  int mineCount = 0, rpNext = 0;
  double otherMs = 5;
  vector<int> trainTurns;
  vector<Act> lastActs;
  // rollout decisions: force troll forceId onto the forceRank-th job of its list this turn
  int forceId = -1, forceRank = 0;
  double extraUsed = 0;  // ms already spent this turn (rollouts) before decide()
  bool recordTops = false;
  map<int, vector<array<double, 3>>> tops;  // troll id -> (kind, dest, rate) of its best jobs
  string rollLog;

  unique_ptr<Bot> cloneForSim() const {
    auto c = make_unique<Bot>(S, P, true);
    c->turnNo = turnNo, c->designs = designs, c->planRef = planRef, c->targetSince = targetSince;
    c->lastK = lastK, c->raidSeen = raidSeen, c->profile = profile, c->jamCount = jamCount;
    memcpy(c->sourcesPlanted, sourcesPlanted, sizeof sourcesPlanted);
    c->prev = prev, c->seedIntent = seedIntent, c->intentSince = intentSince, c->still = still;
    c->oppSide = oppSide;
    return c;
  }
  // tries the base decision and alternatives (one troll on its 2nd / 3rd job) by playing each on to
  // the horizon with the usual policy; sets forceId / forceRank to the best one
  void chooseByRollouts(const Game& g, double deadline) {
    forceId = -1;
    auto probe = cloneForSim();
    probe->recordTops = true;
    probe->turnGame(g, 0);
    vector<pair<int, int>> cands = {{-1, 0}};
    for (auto& [id, v] : probe->tops)
      for (int r = 1; r < (int)v.size() && r <= P.rollAlts; r++)
        if (v[r][2] >= P.rollMinRate * v[0][2] && (v[r][0] != v[0][0] || v[r][1] != v[0][1])) cands.push_back({id, r});
    double best = -1e18;
    int bi = 0, done = 0;
    for (int i = 0; i < (int)cands.size(); i++) {
      if (nowMs() > deadline - 2) break;
      if (P.rollOpp && !oppSide) oppSide = make_shared<Side>(m, 1);
      Params o = oppParams(g);
      Sim sim(g, S, P, P.rollOpp ? oppSide : nullptr, &o);
      sim.a = cloneForSim();
      sim.a->forceId = cands[i].first, sim.a->forceRank = cands[i].second;
      sim.horizon = min(300, g.turn + P.rollHorizon);
      // the forced choice only applies on the first simulated turn
      vector<Task> tasks;
      {
        vector<Act> acts = sim.a->turnGame(sim.g, 0);
        sim.a->forceId = -1;
        toTasks(sim.g, 0, acts, tasks);
        if (sim.b) toTasks(sim.g, 1, sim.b->turnGame(sim.g, 1), tasks);
        step(sim.g, tasks);
      }
      double v;
      if (!sim.run(deadline, v)) break;
      done++;
      if (v > best + (i == 0 ? 0 : P.rollMargin)) best = v, bi = i;
    }
    forceId = cands[bi].first, forceRank = cands[bi].second;
    rollLog = to_string(done) + "/" + to_string(cands.size()) + (bi ? " alt" : " base");
  }

  Bot(shared_ptr<Side> side, const Params& p, bool isSim) : S(side), m(side->m), N(side->m->N), W(side->m->W), P(p), sim(isSim) {}

  static int steps(const BTroll& u, int d) { return d < 0 ? 999 : (d + u.speed - 1) / u.speed; }
  struct Pred {
    int size, health, fruits, cooldown;
  };
  static Pred predict(const Tree& tr, int t) {
    Pred r{tr.size, tr.health, tr.fruits, tr.cooldown};
    for (int i = 0; i < t; i++) {
      if (r.cooldown > 0) r.cooldown--;
      if (r.cooldown == 0 && r.health > 0) {
        if (r.size < MAX_SIZE) {
          r.size++;
          r.health += DELTA_HEALTH[tr.type];
          r.cooldown = tr.growth;
        } else if (r.fruits < MAX_FRUITS) {
          r.fruits++;
          r.cooldown = tr.growth;
        } else
          break;
      }
    }
    return r;
  }
  static int turnsToSize(const Tree& tr, int size) {
    if (tr.size >= size) return 0;
    return (tr.cooldown == 0 ? 1 : tr.cooldown) + (size - 1 - tr.size) * tr.growth;
  }
  static pair<int, int> chopTime(const Tree& tr, int arrive, int power) {
    Pred p = predict(tr, arrive);
    int size = p.size, health = p.health, cooldown = p.cooldown;
    for (int k = 1; k <= 30; k++) {
      health -= power;
      if (health <= 0) return {k, size};
      if (cooldown > 0) cooldown--;
      if (cooldown == 0 && size < MAX_SIZE) {
        size++;
        health += DELTA_HEALTH[tr.type];
        cooldown = tr.growth;
      } else if (cooldown == 0)
        cooldown = tr.growth;
    }
    return {99, size};
  }

  shared_ptr<Side> oppSide;
  Params oppParams(const Game& g) {
    // the opponent's trolls so far (beyond its first), then a common Legend continuation
    Params q;
    q.choosePlan = false, q.replan = false;
    vector<pair<int, Design>> pre;
    for (auto& u : g.trolls)
      if (u.owner == 1 && u.id > 1) pre.push_back({u.id, {u.speed, u.carry, u.harvest, u.chop}});
    sort(pre.begin(), pre.end());
    q.plan.clear();
    for (auto& e : pre) q.plan.push_back(e.second);
    if (P.oppModel == 1) {
      // a parasite: few cheap choppers, no forest, fells everything it reaches (our trees first)
      q.forest = 1000, q.denyTheirs = 1.5;
      for (Design d : {Design{2, 3, 1, 2}, Design{2, 3, 0, 3}}) q.plan.push_back(d);
    } else
      for (const Design& d : RANKED_PLANS[0]) q.plan.push_back(d);
    return q;
  }
  unique_ptr<Sim> makeSim(const Game& g, const Params& q, bool withOpp = false) {
    if (!P.simOpp && !withOpp) return make_unique<Sim>(g, S, q);
    if (!oppSide) oppSide = make_shared<Side>(m, 1);
    Params o = oppParams(g);
    return make_unique<Sim>(g, S, q, oppSide, &o);
  }

  void evalPlans(double budgetMs) {
    double t0 = nowMs();
    if (initPlans.empty()) {
      initPlans = RANKED_PLANS;
      const auto& GP = P.genV2 ? GEN_PLANS2 : GEN_PLANS;
      for (int i = 0; i < P.planPool && i < (int)GP.size(); i++) initPlans.push_back(GP[i]);
      if (P.firstAffordable) {
        // train on turn 1 when the stock allows: keep the plans whose first design is affordable now
        const int* st = planGame->inv[0];
        auto ok = [&](const Plan& p) { return !p.empty() && 1 + p[0][0] * p[0][0] <= st[0] && 1 + p[0][1] * p[0][1] <= st[1] && 1 + p[0][2] * p[0][2] <= st[2] && 1 + p[0][3] * p[0][3] <= st[4]; };
        vector<Plan> keep;
        for (auto& p : initPlans)
          if (ok(p)) keep.push_back(p);
        if (!keep.empty()) initPlans = keep;
      }
    }
    const auto& PL = initPlans;
    while (planIdx < (int)PL.size()) {
      if (!planSim) {
        if (nowMs() > t0 + budgetMs - 8) break;
        Params q = P;
        q.plan = PL[planIdx];
        if (planPhase == 1) q.simOppDiff = false;
        planSim = makeSim(*planGame, q, planPhase == 1);
        planSim->horizon = P.simHorizon;
      }
      double v;
      if (!planSim->run(t0 + budgetMs, v)) break;
      if (P.planRobust && planPhase == 0) {
        // then the same plan against a copy of our bot; the plan's value is the mean of both
        planV0 = v, planPhase = 1;
        planSim.reset();
        continue;
      }
      if (planPhase == 1) v = (planV0 + v) / 2, planPhase = 0;
      planVals.push_back({v, planIdx});
      planScores += " " + to_string(planIdx) + ":" + to_string((int)v);
      if (v > planBest) {
        planBest = v;
        P.plan = PL[planIdx];
        P.planVersion++;
      }
      planSim.reset();
      planIdx++;
    }
    // re-rank the best plans by their mean value against a passive foe and against a copy of our bot
    if (planIdx >= (int)PL.size() && P.planRerank > 0 && rrIdx == 0 && rrList.empty()) {
      vector<pair<double, int>> v = planVals;
      sort(v.rbegin(), v.rend());
      for (int i = 0; i < (int)v.size() && i < P.planRerank; i++) rrList.push_back(v[i]);
      rrBest = -1e18;
    }
    while (planIdx >= (int)PL.size() && rrIdx < (int)rrList.size()) {
      if (!planSim) {
        if (nowMs() > t0 + budgetMs - 8) break;
        Params q = P;
        q.plan = PL[rrList[rrIdx].second];
        q.simOppDiff = false;
        planSim = makeSim(*planGame, q, true);
        planSim->horizon = P.simHorizon;
      }
      double v;
      if (!planSim->run(t0 + budgetMs, v)) break;
      double m = (rrList[rrIdx].first + v) / 2;
      planScores += " rr" + to_string(rrList[rrIdx].second) + ":" + to_string((int)v);
      if (m > rrBest) {
        rrBest = m;
        if (P.plan != PL[rrList[rrIdx].second]) P.plan = PL[rrList[rrIdx].second], P.planVersion++;
      }
      planSim.reset();
      rrIdx++;
    }
    // then per-map strategy settings, one at a time on top of the best so far
    static const vector<string> VARIANTS1 = {"forest=100", "forest=160", "forest=1000", "farmPerChopper=5", "maxSources=4", "denyTheirs=1", "earlySources=100"};
    static const vector<string> VARIANTS2 = {"forest=100", "forest=160", "forest=1000", "forest=70", "farmPerChopper=5", "farmPerChopper=2", "maxSources=4",
                                             "maxSources=1", "denyTheirs=1", "earlySources=100", "earlySources=0", "maxWait=6", "maxWait=20", "patience=60",
                                             "patience=200", "forestValue=25", "forestValue=60", "producers=0", "producers=4", "trainDeadline=180",
                                             "trainDeadline=250", "wasteLambda=0.3", "wasteLambda=1.2"};
    const vector<string>& VARIANTS = P.paramSearch2 ? VARIANTS2 : VARIANTS1;
    int nv = P.paramSearch ? VARIANTS.size() * (P.paramSearch2 ? 2 : 1) : 0;
    while (planIdx >= (int)PL.size() && varIdx < nv) {
      if (!planSim) {
        if (nowMs() > t0 + budgetMs - 8) break;
        Params q = P;
        setParam(q, VARIANTS[varIdx % VARIANTS.size()]);
        planSim = makeSim(*planGame, q);
        planSim->horizon = P.simHorizon;
      }
      double v;
      if (!planSim->run(t0 + budgetMs, v)) break;
      planScores += " " + VARIANTS[varIdx % VARIANTS.size()] + ":" + to_string((int)v);
      if (v > planBest) planBest = v, setParam(P, VARIANTS[varIdx % VARIANTS.size()]), P.planVersion++;
      planSim.reset();
      varIdx++;
    }
    planPending = (planIdx < (int)PL.size() || varIdx < nv || (P.planRerank > 0 && rrIdx < (int)rrList.size())) && turnNo < P.planTurns;
    if (!planPending && !sim && getenv("PLANCHOICE")) {
      int bi = -1;
      for (int i = 0; i < (int)PL.size(); i++)
        if (PL[i] == P.plan) bi = i;
      cerr << "CHOICE " << bi << " ";
      for (auto& d : P.plan) cerr << d[0] << d[1] << d[2] << d[3] << " ";
      cerr << planBest << endl;
    }
    planScores += " (" + to_string((int)(nowMs() - t0)) + " ms)";
  }

  void replanStep(double budgetMs, const vector<BTroll>& mine) {
    double t0 = nowMs();
    int k = mine.size();
    if (!rp) {
      if (turnNo > P.trainDeadline - 30) return;
      vector<pair<int, Design>> pre;
      for (auto& u : mine)
        if (u.id > 1) pre.push_back({u.id, {u.speed, u.carry, u.harvest, u.chop}});
      sort(pre.begin(), pre.end());
      Plan prefix;
      for (auto& e : pre) prefix.push_back(e.second);
      set<Plan> seen;
      rp = make_unique<RP>();
      rp->g = *lastGame;
      auto add = [&](const Plan& suffix) {
        if (seen.count(suffix)) return;
        seen.insert(suffix);
        Plan c = prefix;
        c.insert(c.end(), suffix.begin(), suffix.end());
        rp->cands.push_back(c);
      };
      add(Plan(designs.begin() + min((int)designs.size(), k - 1), designs.end()));
      for (int pi = 0; pi < (int)RANKED_PLANS.size(); pi++) {
        const Plan& p = RANKED_PLANS[pi];
        if ((int)p.size() > k - 1 && find(P.replanSkip.begin(), P.replanSkip.end(), pi) == P.replanSkip.end()) add(Plan(p.begin() + (k - 1), p.end()));
      }
      for (auto& d : P_CHEAP) add({d});
      if (P.rpExtra)
        for (auto& p : RP_EXTRA) add(p);
      for (int i = 0; i < P.rpPool && i < (int)GEN_PLANS.size(); i++) add(Plan(GEN_PLANS[i].begin() + 1, GEN_PLANS[i].end()));
      add({});
      rpNext = turnNo + P.replanEvery;
    }
    while (rp->idx < (int)rp->cands.size()) {
      if (!rp->sim) {
        if (nowMs() > t0 + budgetMs - 8) return;
        Params q = P;
        q.plan = rp->cands[rp->idx];
        rp->sim = makeSim(rp->g, q);
        rp->sim->horizon = min(300, rp->g.turn + P.simHorizon);
        rp->sim->trace = getenv("SIMTRACE") && rp->idx == atoi(getenv("SIMIDX") ? getenv("SIMIDX") : "0") && rp->g.turn + 1 == atoi(getenv("SIMTRACE"));
      }
      double v;
      if (!rp->sim->run(t0 + budgetMs, v)) return;
      rp->vals.push_back(v);
      if (getenv("PLANLOG") && rp->idx == 0) cerr << "  sim0 ended t" << rp->sim->g.turn << " over " << rp->sim->g.over << " trees " << rp->sim->g.trees.size() << " score " << score(rp->sim->g, 0) << endl;
      rp->sim.reset();
      rp->idx++;
    }
    int best = 0;
    for (int i = 1; i < (int)rp->vals.size(); i++)
      if (rp->vals[i] > rp->vals[best]) best = i;
    bool sw = best != 0 && rp->vals[best] > rp->vals[0] + P.replanMargin;
    rpLog = "replan t" + to_string(rp->g.turn + 1) + (sw ? " switch" : " keep");
    if (getenv("PLANLOG")) {
      string l = rpLog + " stock";
      for (int i = 0; i < 5; i++) l += " " + to_string(rp->g.inv[0][i]);
      for (int i = 0; i < (int)rp->vals.size(); i++) {
        l += " |";
        for (auto& d : rp->cands[i]) l += " " + to_string(d[0]) + to_string(d[1]) + to_string(d[2]) + to_string(d[3]);
        l += ":" + to_string((int)rp->vals[i]);
      }
      cerr << l << endl;
    }
    if (sw && mineCount == k) P.plan = rp->cands[best], P.planVersion++;
    rp.reset();
  }

  // game state of our turn input (we are player 0)
  Game parse(const vector<string>& lines, int turnsPlayed) {
    Game g;
    g.m = m;
    g.turn = turnsPlayed;
    size_t li = 0;
    for (int p = 0; p < 2; p++) {
      istringstream s(lines[li++]);
      for (int i = 0; i < 6; i++) s >> g.inv[p][i];
    }
    int nt = stoi(lines[li++]);
    for (int k = 0; k < nt; k++) {
      istringstream s(lines[li++]);
      string type;
      int x, y;
      Tree t;
      s >> type >> x >> y >> t.size >> t.health >> t.fruits >> t.cooldown;
      t.type = find(ITEMS, ITEMS + 6, type) - ITEMS;
      t.cell = y * W + x;
      t.growth = growthOf(*m, t.type, t.cell);
      g.trees.push_back(t);
    }
    int nu = stoi(lines[li++]);
    for (int k = 0; k < nu; k++) {
      istringstream s(lines[li++]);
      int v[14];
      for (int i = 0; i < 14; i++) s >> v[i];
      Troll u{v[0], v[1], v[3] * W + v[2], v[4], v[5], v[6], v[7], {v[8], v[9], v[10], v[11], v[12], v[13]}};
      g.trolls.push_back(u);
      g.nextId = max(g.nextId, v[0] + 1);
    }
    return g;
  }

  string turn(const vector<string>& lines) {
    Game g = parse(lines, turnNo);
    lastGame = make_unique<Game>(g);
    if (turnNo == 0 && !sim && P.choosePlan) {
      planGame = make_unique<Game>(g);
      planPending = true;
    }
    if (P.rollouts && !planPending && turnNo > 0) {
      double t0 = nowMs();
      chooseByRollouts(g, t0 + max(3.0, P.turnLimit - 6 - otherMs));
      extraUsed = nowMs() - t0;
    }
    vector<Act> acts = turnGame(g, 0);
    forceId = -1, extraUsed = 0;
    lastActs = acts;
    string out;
    for (auto& a : acts) {
      if (!out.empty()) out += ";";
      switch (a.kind) {
        case A_MOVE: out += "MOVE " + to_string(a.id) + " " + to_string(a.arg % W) + " " + to_string(a.arg / W); break;
        case A_TRAIN: out += "TRAIN " + to_string(a.talents[0]) + " " + to_string(a.talents[1]) + " " + to_string(a.talents[2]) + " " + to_string(a.talents[3]); break;
        case A_DROP: out += "DROP " + to_string(a.id); break;
        case A_HARVEST: out += "HARVEST " + to_string(a.id); break;
        case A_CHOP: out += "CHOP " + to_string(a.id); break;
        case A_MINE: out += "MINE " + to_string(a.id); break;
        case A_PLANT: out += "PLANT " + to_string(a.id) + " " + ITEMS[a.arg]; break;
        case A_PICK: out += "PICK " + to_string(a.id) + " " + ITEMS[a.arg]; break;
      }
    }
    return out.empty() ? "WAIT" : out;
  }

  vector<Act> turnGame(const Game& g, int p) {
    vector<BTroll> trolls;
    trolls.reserve(g.trolls.size());
    for (auto& u : g.trolls) trolls.push_back({u.id, u.owner == p, u.cell, u.speed, u.carry, u.harvest, u.chop, u.inv, u.load()});
    int inv[6];
    memcpy(inv, g.inv[p], sizeof inv);
    curGame = &g, curSeat = p;
    return decide(inv, g.trees, trolls);
  }

  vector<Act> decide(int* inv, const vector<Tree>& trees, const vector<BTroll>& trolls);
};

Sim::Sim(const Game& g0, shared_ptr<Side> side, const Params& p, shared_ptr<Side> oppSide, const Params* oppP) : g(g0) {
  a = make_unique<Bot>(side, p, true);
  a->turnNo = g.turn;
  if (oppSide) {
    b = make_unique<Bot>(oppSide, *oppP, true);
    b->turnNo = g.turn;
  }
}
bool Sim::run(double deadline, double& value) {
  vector<Task> tasks;
  if (startTurn < 0) startTurn = g.turn;
  while (!g.over && g.turn < horizon) {
    if (a->P.simEarlyW > 0 && g.turn == startTurn + a->P.simEarlyAt && earlyV < 0) {
      earlyV = score(g, 0);
      for (auto& u : g.trolls)
        if (u.owner == 0) earlyV += 4 * u.inv[WOOD];
    }
    if (nowMs() > deadline) return false;
    vector<Act> acts = a->turnGame(g, 0);
    if (trace && getenv("SIMACTS") && g.turn >= atoi(getenv("SIMACTS")) && g.turn < atoi(getenv("SIMACTS")) + 40) {
      cerr << "     T" << g.turn + 1;
      for (auto& u : g.trolls)
        if (u.owner == 0) {
          cerr << " | " << u.id << "@" << u.cell % g.m->W << "," << u.cell / g.m->W << " [";
          for (int i = 0; i < 6; i++) cerr << u.inv[i];
          cerr << "]";
          for (auto& x : acts)
            if (x.id == u.id) cerr << " " << "?MHPCKTDN"[x.kind] << (x.kind == A_MOVE ? to_string(x.arg % g.m->W) + "," + to_string(x.arg / g.m->W) : "");
        }
      cerr << endl;
    }
    tasks.clear();
    toTasks(g, 0, acts, tasks);
    if (b) toTasks(g, 1, b->turnGame(g, 1), tasks);
    step(g, tasks);
    if (trace && g.turn % 20 == 0) {
      int n = 0, ld = 0;
      for (auto& u : g.trolls)
        if (u.owner == 0) n++, ld += u.load();
      cerr << "    t" << g.turn << " score " << score(g, 0) << " trolls " << n << " load " << ld << " trees " << g.trees.size() << " st";
      for (int i = 0; i < 6; i++) cerr << " " << g.inv[0][i];
      cerr << endl;
    }
    int age = a->P.simRaidAge;
    if (age > 0 && !b) {
      // a passive foe leaves ripe trees standing forever: a real one fells them
      if (ripeSince.empty()) ripeSince.assign(g.m->N, -1);
      bool cut = false;
      for (auto& t : g.trees) {
        if (t.size < MAX_SIZE) {
          ripeSince[t.cell] = -1;
          continue;
        }
        if (ripeSince[t.cell] < 0) ripeSince[t.cell] = g.turn;
        else if (g.turn - ripeSince[t.cell] > age) t.health = 0, cut = true, ripeSince[t.cell] = -1;
      }
      if (cut) g.trees.erase(remove_if(g.trees.begin(), g.trees.end(), [](const Tree& t) { return t.health <= 0; }), g.trees.end());
    }
  }
  auto val = [&](int p) {
    double v = score(g, p);
    for (auto& u : g.trolls)
      if (u.owner == p) v += 4 * u.inv[WOOD] + u.inv[0] + u.inv[1] + u.inv[2] + u.inv[3];
    double tw = a->P.simTreeValue;
    if (tw > 0 && g.turn < 300) {
      // wood still standing on that side (what the remaining turns can fell)
      const int16_t* d0 = g.m->d(g.m->shack[p]);
      const int16_t* d1 = g.m->d(g.m->shack[1 - p]);
      for (auto& t : g.trees)
        if (d0[t.cell] >= 0 && (d1[t.cell] < 0 || d0[t.cell] < d1[t.cell])) v += 4 * tw * t.size;
    }
    return v;
  };
  value = b && a->P.simOppDiff ? val(0) - val(1) : val(0);
  if (a->P.simEarlyW > 0) value += a->P.simEarlyW * max(0.0, earlyV);  // tempo: what the plan has banked early
  return true;
}

vector<Act> Bot::decide(int* inv, const vector<Tree>& trees, const vector<BTroll>& trolls) {
  turnNo++;
  double tStart = nowMs(), simMs = 0;
  double turnBudget = P.turnLimit > 0 ? max(3.0, min(P.planTurnBudget, P.turnLimit - otherMs - extraUsed)) : P.planTurnBudget;
  bool planned = planPending;
  if (planPending) {
    double t = nowMs();
    evalPlans(P.planAll ? 1e9 : turnNo == 1 ? P.planBudget : turnBudget);
    simMs += nowMs() - t;
  }
  const Params PP = P;  // this turn's parameters (re-plans below apply next turn)
  const Params& Pr = PP;
  vector<int> treeAt(N, -1);
  for (int i = 0; i < (int)trees.size(); i++) treeAt[trees[i].cell] = i;
  vector<BTroll> mine, opp;
  for (auto& u : trolls) (u.mine ? mine : opp).push_back(u);
  if (rp && mineCount != (int)mine.size()) rp.reset();
  mineCount = mine.size();
  if (!sim && Pr.replan && !planned && turnNo > 1 && (rp || turnNo >= rpNext)) {
    double t = nowMs();
    replanStep(Pr.planAll ? 1e9 : turnBudget, mine);
    simMs += nowMs() - t;
  }
  for (auto it = seedIntent.begin(); it != seedIntent.end();) {
    const BTroll* u = nullptr;
    for (auto& x : mine)
      if (x.id == it->first) u = &x;
    if (!u || u->inv[it->second] == 0 || turnNo - (intentSince.count(it->first) ? intentSince[it->first] : 0) > 8)
      it = seedIntent.erase(it);
    else
      ++it;
  }
  const int left = 301 - turnNo;
  vector<Act> out;
  auto& dropDist = S->dropDist;
  auto& oppDropDist = S->oppDropDist;
  auto& nearWater = S->nearWater;
  auto& dropCells = S->dropCells;
  auto dist = [&](int c) { return m->d(c); };

  // ------------------------------------------------------------ training
  const int k = mine.size();
  int stock[6];
  memcpy(stock, inv, sizeof stock);
  int held[5] = {0, 0, 0, 0, 0};
  if (turnNo < Pr.earlySources && profile != 1)
    for (int f : {1, 0, 2}) {
      if (sourcesPlanted[f] > 0 || stock[f] == 0) continue;
      bool have = false;
      for (auto& t : trees) have |= t.type == f && dropDist[t.cell] >= 0 && dropDist[t.cell] <= 2 && dropDist[t.cell] < oppDropDist[t.cell];
      if (have) continue;
      held[f] = 1;
      stock[f]--;
    }
  const Design* target = nullptr;
  Design targetD, trainNow;
  bool hasTrain = false;
  vector<int> costV;  // this.cost
  bool hasCost = false;
  if (planRef != Pr.planVersion) {
    designs = Pr.plan;
    planRef = Pr.planVersion;
    if (!Pr.keepPatience) targetSince = turnNo;  // else re-plans every 15 turns would stop downgrades for good
  }
  if (lastK != k) lastK = k, targetSince = turnNo;
  auto costOf = [&](const Design& d, int kk) { return vector<int>{kk + d[0] * d[0], kk + d[1] * d[1], kk + d[2] * d[2], 0, kk + d[3] * d[3]}; };
  auto affordable = [&](const vector<int>& c) {
    for (int i = 0; i < 5; i++)
      if (stock[i] < c[i]) return false;
    return true;
  };
  if (k - 1 < (int)designs.size() && turnNo < Pr.trainDeadline && !planPending) {
    Design d = designs[k - 1];
    vector<int> cost = costOf(d, k);
    double patience = k == 1 ? Pr.patienceFirst : turnNo - raidSeen <= 40 ? Pr.patienceRaided : Pr.patience;
    if (turnNo - targetSince > patience && !affordable(cost)) {
      targetSince += patience / 2;
      static const int attr[4] = {0, 1, 2, 4};
      int minV[4] = {1, min(Pr.minCarry, d[1]), 0, min(2, d[3])};
      int bi = -1, bd = 0;
      for (int a = 0; a < 4; a++) {
        int def = cost[attr[a]] - stock[attr[a]];
        if (d[a] > minV[a] && def > bd) bd = def, bi = a;
      }
      Design fit;
      double fv = -1;
      for (int sp = 1; sp <= d[0]; sp++)
        for (int c = 1; c <= d[1]; c++)
          for (int h = 0; h <= d[2]; h++)
            for (int cp = min(2, d[3]); cp <= d[3]; cp++) {
              if (k + sp * sp > stock[0] || k + c * c > stock[1] || k + h * h > stock[2] || k + cp * cp > stock[4]) continue;
              double v = 3 * c + 2.5 * sp + 2 * cp + h;
              if (v > fv) fv = v, fit = {sp, c, h, cp};
            }
      if (fit.empty() && k == 1)
        for (int sp = 1; sp <= max(1, d[0]); sp++)
          for (int c = 2; c <= max(2, d[1]); c++)
            for (int h = 0; h <= d[2]; h++)
              for (int cp = 1; cp <= max(1, d[3]); cp++) {
                if (k + sp * sp > stock[0] || k + c * c > stock[1] || k + h * h > stock[2] || k + cp * cp > stock[4]) continue;
                double v = 3 * c + 2.5 * sp + 2 * cp + h;
                if (v > fv) fv = v, fit = {sp, c, h, cp};
              }
      if (!fit.empty() && fit[1] >= 2) {
        d = fit;
        designs[k - 1] = d;
        cost = costOf(d, k);
      } else if (bi < 0) {
        if (k > 1) designs.resize(k - 1);
      } else {
        d[bi]--;
        designs[k - 1] = d;
        cost = costOf(d, k);
      }
    }
    bool isChopper = d[3] >= 2 && d[1] >= 2;
    bool haveChopper = false;
    for (auto& u : mine) haveChopper |= u.chop >= 2 && u.carry >= 2;
    if (Pr.chopperNow && k - 1 < (int)designs.size() && !haveChopper && (!isChopper || !affordable(cost))) {
      for (auto& x : AUTO_DESIGNS)
        if (x[0] * x[0] + k <= stock[0] && x[1] * x[1] + k <= stock[1] && x[2] * x[2] + k <= stock[2] && x[3] * x[3] + k <= stock[4]) {
          d = x;
          designs[k - 1] = d;
          cost = costOf(d, k);
          break;
        }
    }
    if (k - 1 >= (int)designs.size())
      hasCost = false;
    else if (affordable(cost)) {
      trainNow = d, hasTrain = true;
      for (int i = 0; i < 5; i++) stock[i] -= cost[i];
      if (k < (int)designs.size()) {
        targetD = designs[k];
        target = &targetD;
        costV = costOf(designs[k], k + 1);
        hasCost = true;
      } else
        hasCost = false;
    } else {
      targetD = d;
      target = &targetD;
      costV = cost;
      hasCost = true;
    }
  }
  for (int i = 0; i < 5; i++) stock[i] += held[i];
  int need[5] = {0, 0, 0, 0, 0}, reserve[5] = {0, 0, 0, 0, 0};
  if (target && hasCost)
    for (int i = 0; i < 5; i++) need[i] = max(0, costV[i] - stock[i]), reserve[i] = costV[i];
  int pickable[4];
  for (int i = 0; i < 4; i++) pickable[i] = max(0, stock[i] - reserve[i]);

  // ------------------------------------------------------------ values
  auto ownTree = [&](const Tree& t) { return dropDist[t.cell] >= 0 && (oppDropDist[t.cell] < 0 || dropDist[t.cell] < oppDropDist[t.cell]); };
  for (auto& o : opp)
    if (o.chop > 0 && treeAt[o.cell] >= 0 && ownTree(trees[treeAt[o.cell]])) raidSeen = turnNo;
  const bool raided = turnNo - raidSeen <= 40;
  bool pureCutter = false;
  for (auto& o : opp) pureCutter |= o.harvest == 0 && o.chop >= 2;
  if (pureCutter || raidSeen > 0)
    profile = 1;
  else if (profile == 0 && opp.size() >= 2 && turnNo > 30)
    profile = 2;
  double scoreVal[4] = {1, 1, 1, 1};
  int deficit = need[0] + need[1] + need[2] + need[3] + need[4];
  double trollValue = max(Pr.trollValue, Pr.trollRate * (left - 20));
  double unitVal = deficit > 0 ? min(deficit <= 2 ? Pr.smallCap : deficit <= 4 ? 2 * Pr.unitMax : Pr.unitMax, max(Pr.trainBonus, trollValue / deficit)) : 0;
  for (int i = 0; i < 4; i++)
    if (need[i] > 0) scoreVal[i] += unitVal;
  double fruitVal[4];
  memcpy(fruitVal, scoreVal, sizeof fruitVal);
  auto plantOk = [&](int type, int cell, int extra) {
    int g = COOLDOWN[type] - (nearWater[cell] ? WATER_BOOST[type] : 0);
    int grow = 1 + 3 * g;
    return turnNo + extra + grow + (FINAL_HEALTH[type] + 1) / 2 + 4 < 300;
  };
  int choppers = 0;
  for (auto& u : mine) choppers += u.chop >= 2 && u.carry >= Pr.chopperCarry;
  vector<uint8_t> oppD(N, 255);
  for (auto& o : opp) {
    const int16_t* d = dist(o.cell);
    for (int c = 0; c < N; c++)
      if (d[c] >= 0 && d[c] <= 4 && d[c] < oppD[c]) oppD[c] = d[c];
  }
  auto oppNear = [&](int c, int r) { return oppD[c] <= r; };
  // turns for the nearest enemy chopper with room to reach each cell (threatened own trees)
  vector<uint8_t> oppChopT(N, 255);
  if (Pr.threatBonus > 0)
    for (auto& o : opp) {
      if (o.chop == 0 || o.load >= o.carry) continue;
      const int16_t* d = dist(o.cell);
      for (int c = 0; c < N; c++)
        if (d[c] >= 0) {
          int t = (d[c] + o.speed - 1) / o.speed;
          if (t < oppChopT[c]) oppChopT[c] = t;
        }
    }
  vector<int> farmCells;
  for (int c : S->farmAll)
    if (treeAt[c] < 0) farmCells.push_back(c);
  int farmTrees = 0;
  for (auto& t : trees) farmTrees += dropDist[t.cell] >= 0 && dropDist[t.cell] <= 2 && dropDist[t.cell] < oppDropDist[t.cell];
  bool oppChopper = false, myChopper = false;
  for (auto& o : opp) oppChopper |= o.chop >= 2;
  for (auto& u : mine) myChopper |= u.chop >= 2 && u.carry >= 2;
  const bool exposed = oppChopper && !myChopper;
  int farmTarget = exposed && Pr.noFarmExposed ? 0 : 2 + Pr.farmPerChopper * choppers;
  int farmMissing = farmTarget - farmTrees;
  struct Want {
    int type;
    double value;
    bool source;
    bool none = false;  // no reachable tree of that fruit left
  };
  vector<Want> wanted;
  auto wantedHas = [&](int t) {
    for (auto& w : wanted)
      if (w.type == t) return true;
    return false;
  };
  if (target)
    for (int f : {1, 0, 2}) {
      int have = 0;
      for (auto& t : trees) have += t.type == f && ownTree(t) && dropDist[t.cell] <= 3;
      int nf = need[f];
      int want = nf >= 10 ? 2 : nf >= 4 ? 1 : 0;
      bool none = false;
      if (Pr.srcNone && nf > 0) {
        // no tree of that fruit anywhere we can reach: the training waits for a source, whatever the deficit
        none = true;
        for (auto& t : trees) none &= !(t.type == f && dropDist[t.cell] >= 0);
        if (none) want = max(want, 1);
      }
      if (none && have < want && stock[f] > 0) wanted.push_back({f, Pr.srcNoneValue, true, true});
      else if (have < want && stock[f] > 0 && sourcesPlanted[f] < Pr.maxSources && !exposed && (profile != 1 || Pr.srcRaider)) wanted.push_back({f, Pr.sourceValue, true});
    }
  if (turnNo < Pr.earlySources && !exposed && profile != 1)
    for (int f : {1, 0, 2}) {
      if (wantedHas(f) || sourcesPlanted[f] > 0 || stock[f] == 0) continue;
      bool have = false;
      for (auto& t : trees) have |= t.type == f && ownTree(t) && dropDist[t.cell] <= 2;
      if (have) continue;
      wanted.push_back({f, Pr.sourceValue, true});
    }
  if (!sim && getenv("DBGT") && turnNo == atoi(getenv("DBGT"))) {
    cerr << "  need " << need[0] << "/" << need[1] << "/" << need[2] << "/" << need[3] << "/" << need[4] << " stock " << stock[0] << "/" << stock[1] << "/" << stock[2] << "/" << stock[3] << "/" << stock[4]
         << " target " << (target ? to_string((*target)[0]) + to_string((*target)[1]) + to_string((*target)[2]) + to_string((*target)[3]) : "-") << " exposed " << exposed << " profile " << profile << " planted " << sourcesPlanted[0] << sourcesPlanted[1] << sourcesPlanted[2] << " wanted";
    for (auto& w : wanted) cerr << " " << w.type << (w.source ? "s" : "");
    cerr << endl;
  }
  if (farmMissing > 0)
    for (int f : {(int)BANANA, 0, 1, 2})
      if (need[f] == 0) wanted.push_back({f, 16 * Pr.plantGamma, false});
  int seedsAvail = pickable[0] + pickable[1] + pickable[2] + pickable[3];
  for (int i = 0; i < 4; i++)
    if (farmMissing > seedsAvail) fruitVal[i] += Pr.seedBonus;
  int bananaSeeds = pickable[BANANA];
  for (auto& u : mine) bananaSeeds += u.inv[BANANA];
  int seedGap = plantOk(BANANA, S->shack, 20) ? max(0, (int)farmCells.size() - bananaSeeds) : 0;
  vector<char> producer(trees.size(), 0);
  if (seedGap > 0) {
    fruitVal[BANANA] += Pr.seedValue;
    vector<int> mature;
    for (int i = 0; i < (int)trees.size(); i++) {
      auto& t = trees[i];
      if (t.type == BANANA && t.size == MAX_SIZE && ownTree(t) && dropDist[t.cell] <= 3) mature.push_back(i);
    }
    stable_sort(mature.begin(), mature.end(), [&](int a, int b) { return dropDist[trees[a].cell] < dropDist[trees[b].cell]; });
    int cnt = min(Pr.producers, (seedGap + 1) / 2);
    for (int i = 0; i < (int)mature.size() && i < cnt; i++) producer[mature[i]] = 1;
  }
  auto carriedValue = [&](const BTroll& u) {
    double v = 4 * u.inv[WOOD];
    int intent = seedIntent.count(u.id) ? seedIntent[u.id] : -1;
    for (int i = 0; i < 4; i++) v += (u.inv[i] - (i == intent ? 1 : 0)) * scoreVal[i];
    int ironExtra = max(0, u.inv[IRON] - need[4]);
    v += min(u.inv[IRON], need[4]) * unitVal + max(0, ironExtra) * 0.5;
    return v;
  };

  // ------------------------------------------------------------ jobs
  vector<vector<int>> enemiesAt(N);  // indices in opp
  for (int i = 0; i < (int)opp.size(); i++) enemiesAt[opp[i].cell].push_back(i);
  // forest roles: choppers are the chop-2 carry-3+ trolls, or the chop-2 carry-forestCarry ones when
  // there is no such troll
  int chopperCarry = 3;
  {
    bool big = false;
    for (auto& u : mine) big |= u.chop >= 2 && u.carry >= 3;
    if (!big) chopperCarry = Pr.forestCarry;
  }
  auto isChopperRole = [&](const BTroll& u) { return u.chop >= 2 && u.carry >= chopperCarry; };
  auto isGardener = [&](const BTroll& u) { return u.harvest >= 1 && !isChopperRole(u); };
  bool anyChopperRole = false;
  for (auto& u : mine) anyChopperRole |= isChopperRole(u);
  const bool forestOn = Pr.forest > 0 && turnNo >= Pr.forest && left > 30 && !(exposed && Pr.noFarmExposed) && anyChopperRole;
  vector<int> forestCells;
  if (forestOn)
    for (int c : farmCells)
      if (!oppNear(c, 2) && plantOk(BANANA, c, 3)) forestCells.push_back(c);
  int forestSlots = forestCells.size();
  for (auto& u : mine)
    if (isGardener(u)) forestSlots -= u.inv[BANANA];
  auto bestDrop = [&](int cell) {
    int best = dropCells[0];
    for (int c : dropCells)
      if (dist(cell)[c] >= 0 && dist(cell)[c] < dist(cell)[best]) best = c;
    return best;
  };

  auto gardenerJobs = [&](int ui, vector<Job>& jobs) {
    const BTroll& u = mine[ui];
    double FV = Pr.forestValue;
    const int16_t* dNow = dist(u.cell);
    bool atShack = dropDist[u.cell] == 0 || u.cell == S->shack;
    if (u.inv[BANANA] > 0)
      for (int c : forestCells)
        if (dNow[c] >= 0) jobs.push_back({ui, FV / (steps(u, dNow[c]) + 1), c, A_PLANT, BANANA, -1, K_PLANT});
    int free = u.carry - u.load;
    if (free > 0 && forestSlots > 0) {
      for (int ti = 0; ti < (int)trees.size(); ti++) {
        auto& tr = trees[ti];
        if (tr.type != BANANA || !ownTree(tr)) continue;
        int d = dNow[tr.cell];
        if (d < 0) continue;
        int a = steps(u, d);
        if (predict(tr, a).fruits <= 0) continue;
        jobs.push_back({ui, FV / (a + 3), tr.cell, A_HARVEST, 0, ti, K_HARVEST});
      }
      if (pickable[BANANA] > 0) {
        int T = (atShack ? 0 : steps(u, dropDist[u.cell])) + 3;
        jobs.push_back({ui, (0.7 * FV) / T, atShack ? -1 : bestDrop(u.cell), A_PICK, BANANA, -1, K_PICK});
      }
    }
    int other = u.load - u.inv[BANANA];
    if (other > 0) {
      double v = carriedValue(u) - u.inv[BANANA] * scoreVal[BANANA];
      if (atShack)
        jobs.push_back({ui, v, -1, A_DROP, 0, -1, K_DROP});
      else
        for (int c : dropCells)
          if (dNow[c] >= 0) jobs.push_back({ui, v / (steps(u, dNow[c]) + 1), c, A_DROP, 0, -1, K_DROP});
    }
  };

  bool noGarden = false;  // fallback pass: gardeners get the usual jobs
  auto jobsFor = [&](int ui, vector<Job>& jobs) {
    const BTroll& u = mine[ui];
    if (forestOn && isGardener(u) && !forestCells.empty() && !noGarden) {
      gardenerJobs(ui, jobs);
      // a gardener holding another seed also gets the usual jobs (planting it), else it drops the
      // seed and picks it again forever
      auto si = seedIntent.find(u.id);
      bool otherSeed = si != seedIntent.end() && si->second != BANANA && u.inv[si->second] > 0;
      if (!jobs.empty() && !otherSeed) return;
    }
    int free = u.carry - u.load;
    double cv = carriedValue(u);
    auto home = [&](int c) { return steps(u, dropDist[c]) + 1; };
    const int16_t* dNow = dist(u.cell);
    bool atShack = dropDist[u.cell] == 0 || u.cell == S->shack;
    if (u.load > 0 && cv > 0) {
      if (atShack)
        jobs.push_back({ui, cv, -1, A_DROP, 0, -1, K_DROP});
      else
        for (int c : dropCells) {
          int r = steps(u, dNow[c]) + 1;
          if (r <= left) jobs.push_back({ui, cv / r, c, A_DROP, 0, -1, K_DROP});
        }
    }
    if (free > 0) {
      for (int ti = 0; ti < (int)trees.size(); ti++) {
        const Tree& tr = trees[ti];
        int d = dNow[tr.cell];
        if (d < 0) continue;
        int a = steps(u, d), r = home(tr.cell);
        const vector<int>& enemies = enemiesAt[tr.cell];
        if (u.harvest > 0 && free > 0) {
          int f = predict(tr, a).fruits, g = min(f, free);
          if (g > 0) {
            int ht = (g + u.harvest - 1) / u.harvest, T = a + ht + r;
            if (T <= left) jobs.push_back({ui, (cv + g * fruitVal[tr.type]) / T, tr.cell, A_HARVEST, 0, ti, K_HARVEST});
          }
        }
        if (u.chop > 0) {
          int eChop = 0;
          for (int e : enemies) eChop += opp[e].chop;
          bool own = ownTree(tr), endgame = left < 40;
          int wait = 0;
          bool threatened = Pr.raidNoWait && raided && own && enemies.empty() && tr.size >= 2;
          int ripe = Pr.waitToCarry ? min(MAX_SIZE, max(1, u.carry)) : MAX_SIZE;
          if (own && enemies.empty() && !endgame && tr.size < ripe && !threatened) {
            int tm = turnsToSize(tr, ripe);
            if (tm > Pr.maxWait) continue;
            wait = max(0, tm - a);
          }
          Tree tgt = tr;
          if (!enemies.empty() && a > 0) {
            if (a >= chopTime(tr, 0, eChop).first) continue;
            tgt.health = tr.health - eChop * a;
          }
          auto [kk, size] = chopTime(tgt, a + wait, u.chop + eChop);
          int T = a + wait + kk + r;
          if (T > left) continue;
          int share = size;
          vector<int> ef;
          for (int e : enemies)
            if (opp[e].chop > 0) ef.push_back(opp[e].carry - opp[e].load);
          if (!ef.empty()) {
            int lft = size, got = 0, mf = free;
            auto anyEf = [&]() {
              for (int x : ef)
                if (x > 0) return true;
              return false;
            };
            while (lft > 0 && (mf > 0 || anyEf())) {
              if (mf > 0) got++, mf--, lft--;
              for (int i = 0; i < (int)ef.size() && lft > 0; i++)
                if (ef[i] > 0) ef[i]--, lft--;
            }
            share = got;
          }
          int wood = min(share, free);
          double value = 4 * wood;
          int sizeNow = predict(tr, a).size;
          if (!enemies.empty())
            value += 4 * (raided && Pr.denyAlphaRaided >= 0 ? Pr.denyAlphaRaided : Pr.denyAlpha) * share;
          else if (own && sizeNow == MAX_SIZE && oppChopT[tr.cell] <= Pr.threatR)
            value += 4 * Pr.threatBonus * size;
          else if (!own) {
            if (sizeNow < MAX_SIZE) value += 4 * Pr.raidBeta * (MAX_SIZE - sizeNow);
            value += 4 * Pr.denyTheirs * size;
            // their training fruit sources near their shack: felling one early slows all their trainings
            if (tr.type != BANANA && turnNo < Pr.srcDenyUntil && oppDropDist[tr.cell] >= 0 && oppDropDist[tr.cell] <= 3) value += Pr.srcDeny;
          }
          if (enemies.empty() && (own || dropDist[tr.cell] <= oppDropDist[tr.cell])) value -= Pr.wasteLambda * max(0.0, min(1.0, (left - 25) / 40.0)) * 4 * max(0, size - wood);
          if (value <= 0) continue;
          if (!endgame && own && need[tr.type] > 0 && enemies.empty() && !threatened) continue;
          if (producer[ti] && enemies.empty() && !threatened && left > 30) continue;
          int act = wait > 0 && d == 0 ? 0 : A_CHOP;
          jobs.push_back({ui, (cv + value) / T, tr.cell, act, 0, ti, K_CHOP});
        }
      }
      if (u.chop > 0 && need[4] > 0) {
        int mm = min(free, need[4]);
        for (int c : S->mineCells) {
          if (dNow[c] < 0) continue;
          int T = steps(u, dNow[c]) + (mm + u.chop - 1) / u.chop + home(c);
          if (T <= left) jobs.push_back({ui, (cv + unitVal * mm) / T, c == u.cell ? -1 : c, A_MINE, 0, -1, K_MINE});
        }
      }
    }
    bool intentHas = seedIntent.count(u.id) > 0;
    if ((!wanted.empty() || intentHas) && !farmCells.empty()) {
      int seed = -1;
      bool pick = false;
      if (intentHas)
        seed = seedIntent[u.id];
      else
        for (auto& w : wanted)
          if (u.inv[w.type] > 0) {
            seed = w.type;
            break;
          }
      if (seed < 0 && free > 0)
        for (auto& w : wanted)
          if ((w.source ? stock[w.type] : pickable[w.type]) > 0) {
            seed = w.type;
            pick = true;
            break;
          }
      if (seed >= 0) {
        Want w{seed, 16 * Pr.plantGamma, false};
        for (auto& x : wanted)
          if (x.type == seed) {
            w = x;
            break;
          }
        int toShack = pick ? (atShack ? 1 : steps(u, dropDist[u.cell]) + 1) : 0;
        double bestRate = -1;
        int bestCell = -1;
        for (int c : farmCells) {
          if (oppNear(c, w.none ? 1 : 3)) continue;
          int dd = pick ? dist(c)[bestDrop(c)] : dNow[c];
          int T = toShack + steps(u, dd) + 1;
          if (!plantOk(seed, c, T)) continue;
          int g = COOLDOWN[seed] - (nearWater[c] ? WATER_BOOST[seed] : 0);
          double value = w.value * (w.source ? 8.0 / g : 1) - scoreVal[seed];
          if (value <= 0) continue;
          double rate = value / T;
          if (rate > bestRate) bestRate = rate, bestCell = c;
        }
        if (bestCell >= 0) {
          if (!pick)
            jobs.push_back({ui, bestRate, bestCell, A_PLANT, seed, -1, K_PLANT});
          else if (atShack)
            jobs.push_back({ui, bestRate, -1, A_PICK, seed, -1, K_PICK});
          else
            for (int dc : dropCells)
              if (dNow[dc] >= 0) jobs.push_back({ui, bestRate * (1 - 0.05 * dNow[dc]), dc, A_PICK, seed, -1, K_PICK});
        }
      }
    }
    auto hasKind = [&](int kd) {
      for (auto& j : jobs)
        if (j.kind == kd) return true;
      return false;
    };
    if (intentHas && hasKind(K_PLANT)) {
      jobs.erase(remove_if(jobs.begin(), jobs.end(), [](const Job& j) { return j.kind != K_PLANT; }), jobs.end());
      return;
    }
    if (forestOn && isChopperRole(u) && !intentHas) {
      jobs.erase(remove_if(jobs.begin(), jobs.end(), [](const Job& j) { return j.kind == K_PLANT || j.kind == K_PICK; }), jobs.end());
      return;
    }
    if (intentHas && u.load > 0 && !hasKind(K_DROP)) {
      seedIntent.erase(u.id);
      double full = carriedValue(u) + 0.5;
      if (atShack)
        jobs.push_back({ui, full, -1, A_DROP, 0, -1, K_DROP});
      else
        for (int c : dropCells)
          if (dNow[c] >= 0) jobs.push_back({ui, full / (steps(u, dNow[c]) + 1), c, A_DROP, 0, -1, K_DROP});
    }
  };

  // greedy assignment
  vector<Job> all, js;
  for (int ui = 0; ui < (int)mine.size(); ui++) {
    js.clear();
    jobsFor(ui, js);
    auto pvIt = prev.find(mine[ui].id);
    vector<Job> top;  // best 16, by insertion (stable)
    for (auto& j : js) {
      if (pvIt != prev.end() && pvIt->second.second == j.dest && pvIt->second.first == j.kind) j.rate *= Pr.stick;
      if ((int)top.size() == 16 && j.rate <= top[15].rate) continue;
      int i = top.size() < 16 ? top.size() : 15;
      if ((int)top.size() < 16) top.push_back(j);
      while (i > 0 && top[i - 1].rate < j.rate) {
        if (i < 16) top[i] = top[i - 1];
        i--;
      }
      top[i] = j;
    }
    if (!sim && getenv("DBGT") && turnNo == atoi(getenv("DBGT"))) {
      cerr << "T" << turnNo << " troll " << mine[ui].id << " @" << mine[ui].cell % W << "," << mine[ui].cell / W << " load " << mine[ui].load << " jobs " << js.size() << ":";
      for (int i = 0; i < (int)top.size() && i < 6; i++) cerr << " k" << top[i].kind << "a" << top[i].act << ">" << (top[i].dest < 0 ? -1 : top[i].dest % W) << "," << (top[i].dest < 0 ? -1 : top[i].dest / W) << "=" << top[i].rate;
      cerr << endl;
    }
    if (recordTops) {
      auto& v = tops[mine[ui].id];
      v.clear();
      for (auto& j : top) v.push_back({(double)j.kind, (double)j.dest, j.rate});
    }
    if (mine[ui].id == forceId && forceRank < (int)top.size()) top[forceRank].rate = 1e18;  // rollout candidate
    all.insert(all.end(), top.begin(), top.end());
  }
  stable_sort(all.begin(), all.end(), [](const Job& a, const Job& b) { return a.rate > b.rate; });
  vector<int> assigned(mine.size(), -1);  // index in all
  vector<int> claimedHarvest(trees.size(), 0);
  vector<char> claimedChop(trees.size(), 0);
  int pickedSeeds = 0;
  map<int, int> endCell;
  // two passes: drops that are a troll's best job claim their cells first (a troll mining / planting on a scarce drop cell must
  // not lock the loaded ones out), then everything by rate
  vector<double> bestRate(mine.size(), -1e18);
  for (auto& j : all) bestRate[j.u] = max(bestRate[j.u], j.rate);
  int fallbackFrom = 1 << 30;
  for (int pass = Pr.dropsFirst ? 0 : 1; pass < 3; pass++) {
    if (pass == 2) {
      // gardeners left without a job (theirs all taken) try the usual jobs
      if (!Pr.gardenFallback || !forestOn) break;
      fallbackFrom = all.size();
      noGarden = true;
      for (int ui = 0; ui < (int)mine.size(); ui++)
        if (assigned[ui] < 0 && isGardener(mine[ui])) {
          js.clear();
          jobsFor(ui, js);
          all.insert(all.end(), js.begin(), js.end());
        }
      noGarden = false;
      stable_sort(all.begin() + fallbackFrom, all.end(), [](const Job& a, const Job& b) { return a.rate > b.rate; });
    }
  for (int ji = pass == 2 ? fallbackFrom : 0; ji < (int)all.size(); ji++) {
    const Job& j = all[ji];
    const BTroll& u = mine[j.u];
    if (assigned[j.u] >= 0) continue;
    if (pass == 0 && (j.kind != K_DROP || j.rate < bestRate[j.u])) continue;
    int fin = j.dest < 0 ? u.cell : j.dest;
    auto ec = endCell.find(fin);
    if (ec != endCell.end() && ec->second != u.id) continue;
    if (j.dest >= 0 && j.dest != u.cell) {
      int holder = -1;
      for (int o = 0; o < (int)mine.size(); o++)
        if (o != j.u && mine[o].cell == j.dest) {
          holder = o;
          break;
        }
      if (holder >= 0) {
        int hj = assigned[holder];
        if (Pr.holderWait ? hj < 0 || all[hj].dest < 0 || all[hj].dest == mine[holder].cell : hj >= 0 && (all[hj].dest < 0 || all[hj].dest == mine[holder].cell)) continue;
      }
    }
    if (j.kind == K_HARVEST && j.tree >= 0) {
      int taken = claimedHarvest[j.tree];
      if (taken >= trees[j.tree].fruits + 1) continue;
      claimedHarvest[j.tree] = taken + min(u.carry - u.load, 3);
    }
    if (j.kind == K_CHOP && j.tree >= 0) {
      bool enemyOn = false;
      for (auto& o : opp) enemyOn |= o.cell == trees[j.tree].cell;
      if (claimedChop[j.tree] && !enemyOn) continue;
      claimedChop[j.tree] = 1;
    }
    if (j.kind == K_PICK) {
      // forest gardeners pick bananas for the forest slots too (else they idle at the shack)
      int lim = (int)wanted.size() + max(0, farmMissing - 1) + (Pr.forestPicks && forestOn ? max(0, forestSlots) : 0);
      if (pickedSeeds >= lim) continue;
      pickedSeeds++;
    }
    assigned[j.u] = ji;
    endCell[fin] = u.id;
    prev[u.id] = {j.kind, j.dest};
  }
  }

  // ------------------------------------------------------------ moves
  bool jammed = false;
  for (int ui = 0; ui < (int)mine.size(); ui++) {
    const BTroll& u = mine[ui];
    auto st = still.find(u.id);
    if (st != still.end() && st->second[0] == u.cell && st->second[1] == u.load) {
      int ja = assigned[ui];
      if (u.load > 0 && turnNo - st->second[2] >= 4 && (ja < 0 || (all[ja].dest >= 0 && all[ja].dest != u.cell))) jammed = true;
    } else
      still[u.id] = {u.cell, u.load, turnNo};
  }
  jamCount = jammed ? jamCount + 1 : 0;
  vector<char> isDrop(N, 0), reserved(N, 0);
  for (int c : dropCells) isDrop[c] = 1;
  vector<pair<int, const Job*>> acts;
  vector<pair<int, int>> movers, escapers;  // escapers (jam release) pick their cells first
  auto occupiedByMine = [&](int c) {
    for (auto& o : mine)
      if (o.cell == c) return true;
    return false;
  };
  for (int ui = 0; ui < (int)mine.size(); ui++) {
    const BTroll& u = mine[ui];
    const Job* j0 = assigned[ui] >= 0 ? &all[assigned[ui]] : nullptr;
    bool idleHere = !j0 || (j0->kind != K_DROP && j0->kind != K_PICK && (j0->dest < 0 || j0->dest == u.cell) && j0->act == 0);
    bool inTheWay = isDrop[u.cell] ? !j0 || (j0->kind != K_DROP && j0->kind != K_PICK && (j0->dest < 0 || j0->dest == u.cell))
                                   : Pr.jamWide && u.load == 0 && dropDist[u.cell] <= 2 &&
                                         (idleHere || (j0 && j0->dest >= 0 && dropDist[j0->dest] <= 2 && j0->kind != K_HARVEST && j0->kind != K_CHOP));
    if (jamCount >= Pr.jamHard && dropDist[u.cell] <= 2 && (!j0 || (u.load == 0 && j0->kind != K_DROP && j0->kind != K_PICK)))
      inTheWay = true;  // a long jam: anyone empty near the drop cells makes way, whatever its job
    if (jammed && Pr.jamRelease && inTheWay) {
      int best = -1;
      const int16_t* d = dist(u.cell);
      int away = isDrop[u.cell] ? 1 : 3;
      for (int c = 0; c < N; c++)
        if (m->grid[c] == GRASS && d[c] > 0 && dropDist[c] >= away && !occupiedByMine(c) && (best < 0 || d[c] < d[best])) best = c;
      if (best >= 0) {
        escapers.push_back({ui, best});
        continue;
      }
    }
    if (!j0 && Pr.jamQueue && u.load > 0) {
      // loaded but its drop cells are taken this turn: queue towards the best one rather than block
      const Job* dj = nullptr;
      for (auto& j : all)
        if (j.u == ui && j.kind == K_DROP && j.dest >= 0 && (!dj || j.rate > dj->rate)) dj = &j;
      if (dj && dj->dest != u.cell) {
        movers.push_back({ui, dj->dest});
        continue;
      }
    }
    if (!j0) {
      if (u.cell == S->shack)
        movers.push_back({ui, dropCells.empty() ? u.cell : dropCells[0]});
      else
        reserved[u.cell] = 1;
      continue;
    }
    if (j0->dest < 0 || j0->dest == u.cell) {
      if (u.cell == S->shack && hasTrain && j0->kind != K_DROP && j0->kind != K_PICK)
        movers.push_back({ui, dropCells[0]});
      else {
        acts.push_back({ui, j0});
        reserved[u.cell] = 1;
      }
    } else
      movers.push_back({ui, j0->dest});
  }
  movers.insert(Pr.escFirst ? movers.begin() : movers.end(), escapers.begin(), escapers.end());
  // each mover in turn takes the reachable cell closest to its destination that no earlier one took
  auto pickSteps = [&](const vector<pair<int, int>>& order, vector<char> res) {
    vector<pair<int, int>> steps;
    for (auto& [ui, dest] : order) {
      const BTroll& u = mine[ui];
      const int16_t* d = dist(u.cell);
      const int16_t* td = dist(dest);
      int best = u.cell;
      double bestD = res[u.cell] ? 1e9 : td[u.cell] < 0 ? 1e8 : td[u.cell];
      for (int c = 0; c < N; c++) {
        if (m->grid[c] != GRASS || d[c] < 0 || d[c] > u.speed || res[c]) continue;
        double v = td[c] < 0 ? 1e8 : td[c];
        if (v < bestD || (v == bestD && d[c] < d[best])) bestD = v, best = c;
      }
      res[best] = 1;
      steps.push_back({ui, best});
    }
    return steps;
  };
  vector<pair<int, int>> steps = pickSteps(movers, reserved);
  if (Pr.jamOrders && jammed && curGame && movers.size() >= 2) {
    // a jam: try other processing orders, resolve each with the referee's move rules, keep the one
    // that gets loaded trolls onto drop cells, then moves everyone closest to their destinations
    auto scoreOf = [&](const vector<pair<int, int>>& st) {
      Game g = *curGame;
      vector<Task> mv;
      for (auto& [ui, c] : st) {
        if (c == mine[ui].cell) continue;
        for (int i = 0; i < (int)g.trolls.size(); i++)
          if (g.trolls[i].id == mine[ui].id) {
            Task t{};
            t.kind = A_MOVE, t.p = curSeat, t.unit = i, t.target = c;
            mv.push_back(t);
          }
      }
      applyMoves(g, mv);
      double v = 0;
      for (int k = 0; k < (int)movers.size(); k++) {
        int ui = movers[k].first, dest = movers[k].second;
        int now = -1;
        for (auto& t : g.trolls)
          if (t.id == mine[ui].id) now = t.cell;
        const int16_t* td = dist(dest);
        double gain = (td[mine[ui].cell] < 0 ? 0 : td[mine[ui].cell]) - (td[now] < 0 ? 0 : td[now]);
        v += mine[ui].load > 0 ? 3 * gain + (isDrop[now] ? 20 : 0) : gain;
      }
      return v;
    };
    vector<pair<int, int>> order = movers;
    double bestV = scoreOf(steps);
    int tries = 0;
    sort(order.begin(), order.end());
    do {
      auto st = pickSteps(order, reserved);
      double v = scoreOf(st);
      if (v > bestV + 1e-9) bestV = v, steps = st;
    } while (++tries < 120 && next_permutation(order.begin(), order.end()));
  }
  if (!sim && getenv("DBGT") && turnNo == atoi(getenv("DBGT"))) {
    cerr << "  jammed " << jammed << " jamCount " << jamCount << " movers";
    for (auto& [ui, d] : movers) cerr << " " << mine[ui].id << ">" << d % W << "," << d / W;
    cerr << " steps";
    for (auto& [ui, c] : steps) cerr << " " << mine[ui].id << ">" << c % W << "," << c / W;
    cerr << endl;
  }
  for (auto& [ui, best] : steps)
    if (best != mine[ui].cell) out.push_back({A_MOVE, mine[ui].id, best, {0, 0, 0, 0}});
  for (auto& [ui, j] : acts) {
    if (j->act == 0) continue;
    const BTroll& u = mine[ui];
    out.push_back({j->act, u.id, j->item, {0, 0, 0, 0}});
    if (j->act == A_PLANT) {
      for (auto& w : wanted)
        if (w.source && w.type == j->item) {
          sourcesPlanted[j->item]++;
          break;
        }
    }
    if (j->act == A_PICK) seedIntent[u.id] = j->item, intentSince[u.id] = turnNo;
  }
  if (hasTrain) {
    bool shackFree = true;
    for (int ui = 0; ui < (int)mine.size(); ui++)
      if (mine[ui].cell == S->shack) {
        bool moving = false;
        for (auto& mv : movers) moving |= mv.first == ui;
        if (!moving) shackFree = false;
      }
    if (shackFree) {
      out.push_back({A_TRAIN, -1, 0, {trainNow[0], trainNow[1], trainNow[2], trainNow[3]}});
      trainTurns.push_back(turnNo);
    }
  }
  if (!sim) otherMs = max(otherMs * 0.8, nowMs() - tStart - simMs + 2);
  return out;
}

// ------------------------------------------------------------------------------------ main
static shared_ptr<MapInfo> mapFromInit(const vector<string>& init) {
  auto M = make_shared<MapInfo>();
  istringstream s(init[0]);
  s >> M->W >> M->H;
  M->grid.assign(M->W * M->H, GRASS);
  for (int y = 0; y < M->H; y++)
    for (int x = 0; x < M->W; x++) {
      char ch = init[1 + y][x];
      int c = y * M->W + x;
      M->grid[c] = ch == '.' ? GRASS : ch == '~' ? WATER : ch == '#' ? ROCK : ch == '+' ? IRONCELL : SHACK;
      if (ch == '0') M->shack[0] = c;
      if (ch == '1') M->shack[1] = c;
    }
  M->build();
  return M;
}
static bool CHEAP_FIRST = true;
static void genPlans(bool V2, vector<Plan>& out) {
  {
    const vector<Design> first = V2 ? vector<Design>{{2, 2, 2, 2}, {2, 3, 1, 2}, {2, 2, 2, 1}, {1, 2, 2, 2}, {2, 1, 1, 2}, {2, 2, 1, 1}, {2, 2, 1, 2},
                                                       {3, 2, 1, 2}, {3, 3, 1, 2}, {2, 2, 1, 3}, {1, 2, 1, 2}, {2, 3, 2, 2}}
                                       : CHEAP_FIRST ? vector<Design>{{2, 2, 2, 2}, {2, 2, 1, 2}, {2, 2, 2, 1}, {2, 3, 1, 2}, {2, 2, 1, 1}, {1, 2, 2, 2}, {2, 1, 1, 2}, {2, 1, 1, 3},
                                                       {3, 2, 1, 2}, {2, 2, 0, 2}, {1, 2, 1, 2}, {2, 3, 2, 1}, {2, 2, 2, 3}, {3, 3, 1, 2},
                                                       {1, 1, 1, 2}, {1, 1, 1, 1}, {2, 1, 1, 1}, {1, 2, 1, 1}, {1, 1, 2, 2}}
                                       : vector<Design>{{2, 2, 2, 2}, {2, 2, 1, 2}, {2, 2, 2, 1}, {2, 3, 1, 2}, {2, 2, 1, 1}, {1, 2, 2, 2}, {2, 1, 1, 2}, {2, 1, 1, 3},
                                                       {3, 2, 1, 2}, {2, 2, 0, 2}, {1, 2, 1, 2}, {2, 3, 2, 1}, {2, 2, 2, 3}, {3, 3, 1, 2}};
    const vector<Design> later = V2 ? vector<Design>{{2, 4, 0, 3}, {2, 4, 1, 3}, {2, 4, 1, 2}, {2, 4, 0, 2}, {3, 4, 0, 3}, {3, 4, 2, 3}, {3, 4, 1, 3},
                                                       {3, 4, 0, 2}, {2, 3, 0, 3}, {2, 4, 2, 3}, {1, 4, 1, 3}, {1, 4, 0, 3}, {3, 3, 0, 3}, {2, 3, 1, 3}}
                                       : vector<Design>{{3, 4, 1, 2}, {2, 4, 1, 2}, {3, 4, 1, 3}, {2, 4, 1, 3}, {3, 4, 0, 3}, {2, 4, 0, 3}, {3, 4, 2, 3},
                                                       {3, 3, 0, 3}, {2, 3, 0, 3}, {3, 3, 1, 3}, {2, 4, 0, 2}, {3, 4, 0, 2}, {2, 3, 1, 2}};
    set<Plan> seen(RANKED_PLANS.begin(), RANKED_PLANS.end());
    uint32_t r = 12345;
    auto rnd = [&](int n) { return (int)((r = r * 1664525u + 1013904223u) >> 8) % n; };
    for (int tries = 0; out.size() < 600 && tries < 100000; tries++) {
      Plan p = {first[rnd(first.size())]};
      int extra = 1 + rnd(3);
      for (int i = 0; i < extra; i++) p.push_back(later[rnd(later.size())]);
      if (seen.insert(p).second) out.push_back(p);
    }
  }
}
static void initDesigns() {
  genPlans(false, GEN_PLANS);
  genPlans(true, GEN_PLANS2);
  for (int sp = 1; sp <= 3; sp++)
    for (int c = 2; c <= 4; c++)
      for (int h = 0; h <= 1; h++)
        for (int cp = 2; cp <= 3; cp++) AUTO_DESIGNS.push_back({sp, c, h, cp});
  stable_sort(AUTO_DESIGNS.begin(), AUTO_DESIGNS.end(), [](const Design& a, const Design& b) { return 3 * a[1] + 2.5 * a[0] + 2 * a[3] + a[2] > 3 * b[1] + 2.5 * b[0] + 2 * b[3] + b[2]; });
}

// ---------------------------------------------------------------- local test modes (not used on CodinGame)
static bool setParam(Params& P, const string& kv) {
  auto e = kv.find('=');
  if (e == string::npos) return false;
  string k = kv.substr(0, e);
  if (k == "plan") {  // plan=2202/2212: fixed designs (speed carry harvest chop), no plan search
    P.plan.clear();
    stringstream ss(kv.substr(e + 1));
    string d;
    while (getline(ss, d, '/'))
      if (d.size() == 4) P.plan.push_back({d[0] - '0', d[1] - '0', d[2] - '0', d[3] - '0'});
    P.choosePlan = false, P.replan = false;
    return true;
  }
  double v = stod(kv.substr(e + 1));
  if (k == "planAll") P.planAll = v;
  else if (k == "planBudget") P.planBudget = v;
  else if (k == "planTurnBudget") P.planTurnBudget = v;
  else if (k == "turnLimit") P.turnLimit = v;
  else if (k == "simHorizon") P.simHorizon = v;
  else if (k == "replanEvery") P.replanEvery = v;
  else if (k == "replanMargin") P.replanMargin = v;
  else if (k == "trollRate") P.trollRate = v;
  else if (k == "forest") P.forest = v;
  else if (k == "forestValue") P.forestValue = v;
  else if (k == "trainDeadline") P.trainDeadline = v;
  else if (k == "earlySources") P.earlySources = v;
  else if (k == "simOpp") P.simOpp = v;
  else if (k == "simOppDiff") P.simOppDiff = v;
  else if (k == "replan") P.replan = v;
  else if (k == "rollouts") P.rollouts = v;
  else if (k == "rollAlts") P.rollAlts = v;
  else if (k == "rollHorizon") P.rollHorizon = v;
  else if (k == "rollMinRate") P.rollMinRate = v;
  else if (k == "rollMargin") P.rollMargin = v;
  else if (k == "rollOpp") P.rollOpp = v;
  else if (k == "denyTheirs") P.denyTheirs = v;
  else if (k == "rpExtra") P.rpExtra = v;
  else if (k == "threatBonus") P.threatBonus = v;
  else if (k == "threatR") P.threatR = v;
  else if (k == "simRaidAge") P.simRaidAge = v;
  else if (k == "oppModel") P.oppModel = v;
  else if (k == "smallCap") P.smallCap = v;
  else if (k == "minCarry") P.minCarry = v;
  else if (k == "forestCarry") P.forestCarry = v;
  else if (k == "waitToCarry") P.waitToCarry = v;
  else if (k == "dropsFirst") P.dropsFirst = v;
  else if (k == "jamQueue") P.jamQueue = v;
  else if (k == "jamHard") P.jamHard = v;
  else if (k == "jamOrders") P.jamOrders = v;
  else if (k == "holderWait") P.holderWait = v;
  else if (k == "escFirst") P.escFirst = v;
  else if (k == "keepPatience") P.keepPatience = v;
  else if (k == "planPool") P.planPool = v;
  else if (k == "rpPool") P.rpPool = v;
  else if (k == "paramSearch") P.paramSearch = v;
  else if (k == "paramSearch2") P.paramSearch2 = v;
  else if (k == "producers") P.producers = v;
  else if (k == "srcRaider") P.srcRaider = v;
  else if (k == "srcDeny") P.srcDeny = v;
  else if (k == "srcDenyUntil") P.srcDenyUntil = v;
  else if (k == "srcNone") P.srcNone = v;
  else if (k == "planRobust") P.planRobust = v;
  else if (k == "denyAlphaRaided") P.denyAlphaRaided = v;
  else if (k == "forestPicks") P.forestPicks = v;
  else if (k == "firstAffordable") P.firstAffordable = v;
  else if (k == "simTreeValue") P.simTreeValue = v;
  else if (k == "simEarlyW") P.simEarlyW = v;
  else if (k == "simEarlyAt") P.simEarlyAt = v;
  else if (k == "gardenFallback") P.gardenFallback = v;
  else if (k == "genV2") P.genV2 = v;
  else if (k == "planRerank") P.planRerank = v;
  else if (k == "srcNoneValue") P.srcNoneValue = v;
  else if (k == "stick") P.stick = v;
  else if (k == "patienceFirst") P.patienceFirst = v;
  else if (k == "trollValue") P.trollValue = v;
  else if (k == "producers") P.producers = v;
  else if (k == "farmPerChopper") P.farmPerChopper = v;
  else if (k == "plantGamma") P.plantGamma = v;
  else if (k == "sourceValue") P.sourceValue = v;
  else if (k == "seedValue") P.seedValue = v;
  else if (k == "trainBonus") P.trainBonus = v;
  else if (k == "chopperCarry") P.chopperCarry = v;
  else if (k == "seedBonus") P.seedBonus = v;
  else if (k == "noFarmExposed") P.noFarmExposed = v;
  else if (k == "maxSources") P.maxSources = v;
  else if (k == "chopperNow") P.chopperNow = v;
  else if (k == "raidNoWait") P.raidNoWait = v;
  else if (k == "patience") P.patience = v;
  else if (k == "patienceRaided") P.patienceRaided = v;
  else if (k == "wasteLambda") P.wasteLambda = v;
  else if (k == "maxWait") P.maxWait = v;
  else if (k == "unitMax") P.unitMax = v;
  else if (k == "raidBeta") P.raidBeta = v;
  else if (k == "denyAlpha") P.denyAlpha = v;
  else return false;
  return true;
}
static Params paramsOf(const string& spec) {
  Params P;
  stringstream ss(spec);
  string kv;
  while (getline(ss, kv, ','))
    if (!kv.empty() && !setParam(P, kv)) cerr << "unknown param " << kv << endl;
  return P;
}
static vector<string> readLines(const string& file) {
  ifstream f(file);
  vector<string> r;
  string l;
  while (getline(f, l)) r.push_back(l);
  return r;
}
// the referee's game from a seat-0 input dump (init + turn 0)
static Game gameFromDump(const vector<string>& lines, shared_ptr<MapInfo>& M) {
  int H;
  {
    istringstream s(lines[0]);
    int W;
    s >> W >> H;
  }
  vector<string> init(lines.begin(), lines.begin() + 1 + H), rest(lines.begin() + 1 + H, lines.end());
  M = mapFromInit(init);
  auto side = make_shared<Side>(M.get(), 0);
  Bot tmp(side, Params(), true);
  return tmp.parse(rest, 0);
}
static vector<string> initFor(const MapInfo& m, int p) {
  vector<string> r = {to_string(m.W) + " " + to_string(m.H)};
  for (int y = 0; y < m.H; y++) {
    string row;
    for (int x = 0; x < m.W; x++) {
      int c = y * m.W + x, t = m.grid[c];
      row += t == GRASS ? '.' : t == WATER ? '~' : t == IRONCELL ? '+' : t == ROCK ? '#' : c == m.shack[p] ? '0' : '1';
    }
    r.push_back(row);
  }
  return r;
}
static vector<string> inputFor(const Game& g, int p) {
  const MapInfo& m = *g.m;
  vector<string> r;
  for (int q : {p, 1 - p}) {
    string l;
    for (int i = 0; i < 6; i++) l += (i ? " " : "") + to_string(g.inv[q][i]);
    r.push_back(l);
  }
  r.push_back(to_string(g.trees.size()));
  for (auto& t : g.trees)
    r.push_back(string(ITEMS[t.type]) + " " + to_string(t.cell % m.W) + " " + to_string(t.cell / m.W) + " " + to_string(t.size) + " " + to_string(t.health) + " " + to_string(t.fruits) + " " + to_string(t.cooldown));
  r.push_back(to_string(g.trolls.size()));
  for (auto& u : g.trolls) {
    string l = to_string(u.id) + " " + (u.owner == p ? "0" : "1") + " " + to_string(u.cell % m.W) + " " + to_string(u.cell / m.W) + " " + to_string(u.speed) + " " + to_string(u.carry) + " " + to_string(u.harvest) + " " + to_string(u.chop);
    for (int i = 0; i < 6; i++) l += " " + to_string(u.inv[i]);
    r.push_back(l);
  }
  return r;
}
// one game between two bots fed like on CodinGame; returns the scores (seat 0, seat 1)
static pair<int, int> playGame(const string& file, const Params& A, const Params& B, bool solo) {
  shared_ptr<MapInfo> M;
  Game g = gameFromDump(readLines(file), M);
  vector<unique_ptr<Bot>> bots;
  vector<shared_ptr<MapInfo>> maps;
  for (int p = 0; p < 2; p++) {
    auto mp = mapFromInit(initFor(*M, p));
    maps.push_back(mp);
    bots.push_back(make_unique<Bot>(make_shared<Side>(mp.get(), 0), p == 0 ? A : B, false));
  }
  vector<Task> tasks;
  while (!g.over) {
    tasks.clear();
    for (int p = 0; p < (solo ? 1 : 2); p++) {
      string o = bots[p]->turn(inputFor(g, p));
      if (p == 0 && getenv("GTRACE")) {
        cerr << "t" << g.turn + 1 << " score " << score(g, 0) << " st";
        for (int i = 0; i < 6; i++) cerr << " " << g.inv[0][i];
        for (auto& u : g.trolls)
          if (u.owner == 0) {
            cerr << " | " << u.id << "@" << u.cell % g.m->W << "," << u.cell / g.m->W << "[";
            for (int i = 0; i < 6; i++) cerr << u.inv[i];
            cerr << "]";
          }
        cerr << " || " << o << endl;
      }
      toTasks(g, p, bots[p]->lastActs, tasks);
    }
    step(g, tasks);
  }
  return {score(g, 0), score(g, 1)};
}

int main(int argc, char** argv) {
  ios::sync_with_stdio(false);
  if (getenv("CHEAPFIRST")) CHEAP_FIRST = true;
  initDesigns();
  string mode = argc > 1 ? argv[1] : "";
  if (mode == "bench" || mode == "arena") {
    // bench "<params>" files...   |   arena "<params A>" "<params B>" files...  (params: k=v,k=v)
    bool arena = mode == "arena";
    Params A = paramsOf(argv[2]), B = arena ? paramsOf(argv[3]) : Params();
    double sa = 0, sb = 0;
    int w = 0, l = 0, d = 0, n = 0;
    for (int i = arena ? 4 : 3; i < argc; i++) {
      if (!arena) {
        auto r = playGame(argv[i], A, B, true);
        sa += r.first, n++;
        if (getenv("V")) cerr << argv[i] << " " << r.first << endl;
        continue;
      }
      for (int swap = 0; swap < 2; swap++) {
        auto r = swap ? playGame(argv[i], B, A, false) : playGame(argv[i], A, B, false);
        int x = swap ? r.second : r.first, y = swap ? r.first : r.second;
        sa += x, sb += y, n++;
        (x > y ? w : x < y ? l : d)++;
        if (getenv("V")) cerr << argv[i] << (swap ? "s" : "") << " " << x << "-" << y << endl;
      }
    }
    if (arena)
      printf("A %dW %dD %dL  avg %.1f vs %.1f\n", w, d, l, sa / n, sb / n);
    else
      printf("avg %.1f over %d\n", sa / n, n);
    return 0;
  }
  Params P;
  for (int i = 1; i < argc; i++)
    if (string(argv[i]) == "planall") P.planAll = true;
  string line;
  vector<string> init;
  getline(cin, line);
  init.push_back(line);
  int H;
  {
    istringstream s(line);
    int W;
    s >> W >> H;
  }
  for (int y = 0; y < H; y++) getline(cin, line), init.push_back(line);
  auto M = mapFromInit(init);
  auto side = make_shared<Side>(M.get(), 0);
  Bot bot(side, P, false);
  int turnNo = 0;
  double maxMs = 0;
  string lastPlans;
  while (true) {
    vector<string> lines;
    for (int i = 0; i < 2; i++) {
      if (!getline(cin, line)) return 0;
      lines.push_back(line);
    }
    getline(cin, line);
    lines.push_back(line);
    int nt = stoi(line);
    for (int i = 0; i < nt; i++) getline(cin, line), lines.push_back(line);
    getline(cin, line);
    lines.push_back(line);
    int nu = stoi(line);
    for (int i = 0; i < nu; i++) getline(cin, line), lines.push_back(line);
    double t0 = nowMs();
    string o = bot.turn(lines);
    double dt = nowMs() - t0;
    if (++turnNo > 1) maxMs = max(maxMs, dt);
    if (bot.planScores != lastPlans) cerr << "plans t" << turnNo << bot.planScores << endl, lastPlans = bot.planScores;
    if (dt > 45) cerr << "t" << turnNo << " slow " << dt << " ms" << endl;
    if (turnNo % 50 == 0) cerr << "t" << turnNo << " max " << maxMs << " ms " << bot.rpLog << " roll " << bot.rollLog << endl;
    cout << o << endl;
  }
}
