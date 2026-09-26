#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <climits>
#include <cstdlib>
#include <algorithm>
#include <sstream>
#include <set>
#include <map>

using namespace std;

// --------------------------------------------------------------------------
// niveau4-imp4 — escalade monster troll + sélection WAG renforcée
//
// Améliorations vs imp3 (cf. analyses games/*.md, 5 défaites) :
//   - TRAIN monster mid-game : (1,3,1,3) cc=3 cp=3 et (2,3,1,2) cc=3 cp=2
//     en tête pour myCount>=3 (facteur dominant des défaites observées :
//     adversaires extraient 30-70 wood via troll monstre cc=4).
//   - T3 light monster (1,3,1,2) cc=3 cp=2 si LEMON+IRON suffisant.
//   - T2 polyvalent (2,1,1,1) si iron dispo (vs cp=0 imp3).
//   - Réserve LEMON pour monster TRAIN : throttle PICK LEMON si bank<11.
//   - Placement WAG renforcé : sort water-aware (discount -2 dist), maxD=5
//     uniforme (vs 3 sur arch 1/4 dans imp3).
//   - CHOP opportuniste mid-late : trolls cp>=2 non-chopper peuvent
//     chopper un arbre adverse à turn>180.
//   - Replant cycle élargi (Priorité A2 hors orchardReady).
//   - **Anti-deadlock allié** (corrige bug WAIT-loop game 889090289) :
//     (1) dT BFS de pickNextCell exclut désormais les cellules occupées
//         par des alliés — sans ça, le scoring préfère "rester" car le
//         raccourci optimiste passe par la case d'un allié bloquant.
//     (2) Phase 2b jitter : si un troll voulait bouger mais reste sur
//         place, on le force sur un voisin libre (1 seul par tour pour
//         éviter les permutations en boucle).
//   - **Anti-stuck Priority-C-iron** (corrige bug WAIT-loop game 889105534) :
//     (3) Priority C fer exige désormais `free > 0` (un troll plein ne
//         peut pas miner, autant ne pas le cibler — sinon il IDLE en
//         boucle adjacent au fer avec carry plein).
//     (4) Garde-fou anti-IDLE : quand `bestX == troll.pos` mais qu'aucune
//         ACT n'a été émise et que le troll porte quelque chose, on
//         bascule sur MOVE_TO shack au lieu d'IDLE.
//
// Conservé d'imp3 : 3-phases (intent/résolution/émission), pickNextCell
// shack-safe, affordable via bankAvail, anti-raid + abandoned specs,
// defensive self-chop, chopper sticky avec score>=2.
// --------------------------------------------------------------------------

struct Tree {
    int type;  // 0 PLUM, 1 LEMON, 2 APPLE, 3 BANANA
    int x, y, size, health, fruits, cooldown;
};

struct Troll {
    int id, player, x, y;
    int movementSpeed, carryCapacity, harvestPower, chopPower;
    int carry[6];  // P L A B I W
    int carried() const {
        int s = 0;
        for (int i = 0; i < 6; i++) s += carry[i];
        return s;
    }
};

static int W, H;
static vector<vector<bool>> walkable;
static vector<string> rawGrid;
static int myShackX = -1, myShackY = -1;
static int oppShackX = -1, oppShackY = -1;
static vector<pair<int,int>> ironCells;

struct PlantSpec { int x, y, type; };
static vector<PlantSpec> plantSpecs;

// Map features computed once at init.
static int waterPct = 0;
static int wagCount = 0;
static int wagNearShack = 0;
static int shackDist = 0;
static int corridorPct = 0;
static int ironNearShack = 0;
static int archetype = 0;  // 1..5 (cf analyse-maps.md §8)

static const char* typeName(int t) {
    switch (t) {
        case 0: return "PLUM"; case 1: return "LEMON";
        case 2: return "APPLE"; case 3: return "BANANA";
        default: return "BANANA";
    }
}

static const int DX[4] = {0, 1, 0, -1};
static const int DY[4] = {1, 0, -1, 0};

static inline int mh(int x1, int y1, int x2, int y2) { return abs(x1-x2)+abs(y1-y2); }

static bool isAdjWater(int x, int y) {
    for (int k = 0; k < 4; k++) {
        int nx = x + DX[k], ny = y + DY[k];
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        if (rawGrid[ny][nx] == '~') return true;
    }
    return false;
}

// BFS sur les cases marchables, avec my shack traité comme non-réentrant
// (un troll ne peut pas revenir sur sa propre cabane après l'avoir quittée).
// Pour les BFS depuis le shack lui-même (init des distances), la source est
// posée à dS=0 avant l'expansion, donc l'exclusion ne casse pas le calcul.
static vector<vector<int>> bfsFrom(int sx, int sy) {
    vector<vector<int>> d(W, vector<int>(H, -1));
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) return d;
    queue<pair<int,int>> q;
    d[sx][sy] = 0;
    q.push({sx, sy});
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nx = x + DX[k], ny = y + DY[k];
            if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
            if (!walkable[nx][ny]) continue;
            if (nx == myShackX && ny == myShackY) continue;
            if (d[nx][ny] != -1) continue;
            d[nx][ny] = d[x][y] + 1;
            q.push({nx, ny});
        }
    }
    return d;
}

// Cooperative-A*-style next-cell picker : BFS depuis la position avec speed
// pas max, en évitant les cellules réservées par d'autres trolls alliés ;
// puis BFS depuis la cible pour la distance résiduelle, et on choisit la case
// qui minimise (distance_reste, -distance_parcourue) tout en restant marchable.
//
// IMPORTANT : les trolls ne peuvent pas revenir sur leur shack après l'avoir
// quitté (règle du jeu). On exclut donc systématiquement myShack des BFS
// et des candidats destinations, sauf si le troll y est déjà (spawn). Sans
// cette exclusion, le pathfinding choisit régulièrement le shack comme étape
// intermédiaire (tie-break par ordre d'itération xy) et bloque le troll.
static pair<int,int> pickNextCell(int sx, int sy, int tx, int ty, int speed,
                                  const set<pair<int,int>>& occupied) {
    if (speed < 1) speed = 1;

    auto isMyShack = [](int x, int y) {
        return x == myShackX && y == myShackY;
    };

    vector<vector<int>> dS(W, vector<int>(H, -1));
    queue<pair<int,int>> q;
    dS[sx][sy] = 0;
    q.push({sx, sy});
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        if (dS[x][y] >= speed) continue;
        for (int k = 0; k < 4; k++) {
            int nx = x + DX[k], ny = y + DY[k];
            if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
            if (!walkable[nx][ny]) continue;
            if (isMyShack(nx, ny)) continue;
            if (occupied.count({nx, ny})) continue;
            if (dS[nx][ny] != -1) continue;
            dS[nx][ny] = dS[x][y] + 1;
            q.push({nx, ny});
        }
    }

    vector<vector<int>> dT(W, vector<int>(H, INT_MAX));
    queue<pair<int,int>> q2;
    // Cible = shack ou cible non marchable : on initialise depuis les cases
    //   adjacentes marchables (et non shack). Le troll s'arrête à côté.
    bool seedFromAdj = isMyShack(tx, ty)
        || tx < 0 || tx >= W || ty < 0 || ty >= H || !walkable[tx][ty];
    if (!seedFromAdj) {
        dT[tx][ty] = 0;
        q2.push({tx, ty});
    } else {
        for (int k = 0; k < 4; k++) {
            int ax = tx + DX[k], ay = ty + DY[k];
            if (ax < 0 || ax >= W || ay < 0 || ay >= H) continue;
            if (!walkable[ax][ay]) continue;
            if (isMyShack(ax, ay)) continue;
            if (occupied.count({ax, ay})) continue;
            dT[ax][ay] = 1;
            q2.push({ax, ay});
        }
    }
    // dT BFS occupied-aware (anti-deadlock allié) : sans ce check, dT calcule
    //   un raccourci optimiste traversant un troll allié bloquant, et le
    //   scoring final préfère rester sur place plutôt que détourner. Cf. bug
    //   identifié dans games/889090289.md (WAIT en boucle).
    while (!q2.empty()) {
        auto [x, y] = q2.front(); q2.pop();
        for (int k = 0; k < 4; k++) {
            int nx = x + DX[k], ny = y + DY[k];
            if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
            if (!walkable[nx][ny]) continue;
            if (isMyShack(nx, ny)) continue;
            if (occupied.count({nx, ny})) continue;
            if (dT[nx][ny] != INT_MAX) continue;
            dT[nx][ny] = dT[x][y] + 1;
            q2.push({nx, ny});
        }
    }

    pair<int,int> best = {sx, sy};
    int bestScore = INT_MAX;
    for (int x = 0; x < W; x++) {
        for (int y = 0; y < H; y++) {
            if (dS[x][y] < 0 || dS[x][y] > speed) continue;
            if (isMyShack(x, y) && !isMyShack(sx, sy)) continue;
            int s = (dT[x][y] == INT_MAX) ? 1000000 : dT[x][y];
            int adj = s * 100 - dS[x][y];
            if (adj < bestScore) {
                bestScore = adj;
                best = {x, y};
            }
        }
    }
    return best;
}

int main() {
    cin >> W >> H; cin.ignore();
    walkable.assign(W, vector<bool>(H, false));
    rawGrid.assign(H, "");

    int waterCells = 0, totalGrass = 0;

    for (int y = 0; y < H; y++) {
        string row;
        getline(cin, row);
        rawGrid[y] = row;
        for (int x = 0; x < W; x++) {
            char c = row[x];
            switch (c) {
                case '.': walkable[x][y] = true; totalGrass++; break;
                case '0': myShackX = x; myShackY = y; walkable[x][y] = true; totalGrass++; break;
                case '1': oppShackX = x; oppShackY = y; walkable[x][y] = true; totalGrass++; break;
                case '+': ironCells.push_back({x, y}); break;
                case '~': waterCells++; break;
            }
        }
    }

    // --- Feature extraction (cf. docs/analyse-maps.md) ---
    int totalCells = W * H;
    waterPct = (waterCells * 100) / max(1, totalCells);

    vector<pair<int,int>> wagCells;
    for (int x = 0; x < W; x++) {
        for (int y = 0; y < H; y++) {
            if (!walkable[x][y]) continue;
            if (x == myShackX && y == myShackY) continue;
            if (x == oppShackX && y == oppShackY) continue;
            if (isAdjWater(x, y)) wagCells.push_back({x, y});
        }
    }
    wagCount = wagCells.size();

    auto myDist = bfsFrom(myShackX, myShackY);
    vector<vector<int>> oppDist;
    if (oppShackX >= 0) oppDist = bfsFrom(oppShackX, oppShackY);

    for (auto& [x, y] : wagCells) {
        if (myDist[x][y] >= 0 && myDist[x][y] <= 5) wagNearShack++;
    }

    shackDist = (oppShackX >= 0 && myDist[oppShackX][oppShackY] >= 0)
                ? myDist[oppShackX][oppShackY] : 12;

    for (auto& [ix, iy] : ironCells) {
        int bestAdj = INT_MAX;
        for (int k = 0; k < 4; k++) {
            int nx = ix + DX[k], ny = iy + DY[k];
            if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
            if (!walkable[nx][ny]) continue;
            if (myDist[nx][ny] >= 0 && myDist[nx][ny] < bestAdj) bestAdj = myDist[nx][ny];
        }
        if (bestAdj <= 6) ironNearShack++;
    }

    // Corridor ratio (deg<=2). Proxy pour topologie contrainte / choke points.
    int corridorCells = 0;
    for (int x = 0; x < W; x++) {
        for (int y = 0; y < H; y++) {
            if (!walkable[x][y]) continue;
            int deg = 0;
            for (int k = 0; k < 4; k++) {
                int nx = x + DX[k], ny = y + DY[k];
                if (nx >= 0 && nx < W && ny >= 0 && ny < H && walkable[nx][ny]) deg++;
            }
            if (deg <= 2) corridorCells++;
        }
    }
    corridorPct = (corridorCells * 100) / max(1, totalGrass);

    // --- Archetype classification (cf. docs/analyse-maps.md §8) ---
    //   1 LABYRINTH    water>22, corridor>30  (choke élevé, WAG abondant)
    //   2 OPEN_DESERT  water<12, dist court    (peu d'eau, espace ouvert)
    //   3 LARGE_MAP    water 12-22, dist >9    (eau modérée, ouverte)
    //   4 COASTAL      water 18-25 (mid-high), choke moyen
    //   5 LARGE_DESERT water<15, dist >9       (peu d'eau, shacks éloignés)
    if (waterPct < 12) {
        archetype = (shackDist > 9) ? 5 : 2;
    } else if (waterPct >= 22 && corridorPct > 25) {
        archetype = 1;
    } else if (waterPct >= 18) {
        archetype = 4;
    } else {
        archetype = (shackDist > 9) ? 3 : 4;
    }

    // --- Plant spec generation ---
    // Rules per archetype (type, wantsWater) — premier ordre = plus prioritaire.
    // Voir strategie-par-map.md pour la justification de chaque mix.
    //
    //   1 LABYRINTH    : LEMON/PLUM WAG (corridors -> verger compact, eau
    //                    abondante mais APPLE trop lent à OS-killer si raid)
    //   2 OPEN_DESERT  : 1 PLUM funder + 5 BANANA (zéro WAG -> mass-banana)
    //   3 LARGE_MAP    : LEMON+PLUM WAG + 1 APPLE WAG + 3 BANANA (LEMON
    //                    prioritaire car carburant monster cc=3)
    //   4 COASTAL      : APPLE+LEMON+PLUM WAG concentré + APPLE WAG + 2 BANANA
    //                    (seul archétype où APPLE en 1er — WAG abondant)
    //   5 LARGE_DESERT : LEMON+APPLE WAG + 4 BANANA (peu de WAG mais
    //                    LEMON prioritaire pour fuel monster)
    struct SpecRule { int type; bool wantsWater; };
    vector<SpecRule> rules;
    switch (archetype) {
        case 1:
            rules = {{1, true}, {0, true}, {1, true}, {0, true}, {3, false}, {3, false}};
            break;
        case 2:
            rules = {{0, false}, {3, false}, {3, false}, {3, false}, {3, false}, {3, false}};
            break;
        case 3:
            rules = {{1, true}, {0, true}, {2, true}, {3, false}, {3, false}, {3, false}};
            break;
        case 4:
            rules = {{2, true}, {1, true}, {0, true}, {2, true}, {3, false}, {3, false}};
            break;
        case 5:
            rules = {{1, true}, {2, true}, {3, false}, {3, false}, {3, false}, {3, false}};
            break;
        default:
            rules = {{1, true}, {2, true}, {0, true}, {3, false}, {3, false}, {3, false}};
            break;
    }

    // Candidate cells : dist 1..maxD du shack, exclus si plus proches du shack
    //   adverse que de moi (zone à eux), exclus shack lui-même.
    // maxD=5 uniforme (vs 3 sur arch 1/4 dans imp3) : on capture les WAG
    //   distants. Le scoring water-aware compense le surcoût de distance.
    int maxD = 5;

    struct PCand { int x, y, d, oppD; bool water; };
    vector<PCand> cand;
    for (int x = 0; x < W; x++) {
        for (int y = 0; y < H; y++) {
            if (!walkable[x][y]) continue;
            if (x == myShackX && y == myShackY) continue;
            if (x == oppShackX && y == oppShackY) continue;
            int d = myDist[x][y];
            if (d < 1 || d > maxD) continue;
            int od = oppDist.empty() ? 0 : oppDist[x][y];
            if (od < 0) od = 0;
            if (od > 0 && od < d) continue;  // case côté adverse, on snub
            cand.push_back({x, y, d, od, isAdjWater(x, y)});
        }
    }
    // Scoring : dist effective avec discount water = -2 (WAG vaut jusqu'à
    //   dist+2 non-WAG). Justifié par les cooldowns : APPLE 9->2 (x4.5),
    //   LEMON/PLUM 8->3 (x2.7) -> WAG produit 2-4x plus de fruits malgré
    //   l'aller-retour plus long. Tie-break : dist brute < puis -oppD
    //   (anti-raid passif) puis water-adj.
    sort(cand.begin(), cand.end(), [](const PCand& a, const PCand& b) {
        int sa = a.d - (a.water ? 2 : 0);
        int sb = b.d - (b.water ? 2 : 0);
        if (sa != sb) return sa < sb;
        if (a.d != b.d) return a.d < b.d;
        if (a.oppD != b.oppD) return a.oppD > b.oppD;
        return a.water > b.water;
    });

    // Pour chaque règle, on cherche le premier candidat libre matchant l'eau
    //   si requise (sinon n'importe quel candidat libre). On respecte la
    //   priorité des règles : la première règle de la liste reçoit le meilleur
    //   candidat disponible.
    set<int> takenIdx;
    for (auto& rule : rules) {
        int chosenIdx = -1;
        if (rule.wantsWater) {
            for (int i = 0; i < (int)cand.size(); i++) {
                if (takenIdx.count(i)) continue;
                if (!cand[i].water) continue;
                chosenIdx = i; break;
            }
        }
        if (chosenIdx == -1) {
            for (int i = 0; i < (int)cand.size(); i++) {
                if (takenIdx.count(i)) continue;
                if (rule.wantsWater) continue;  // déjà essayé en pass 1
                chosenIdx = i; break;
            }
        }
        if (chosenIdx == -1) {
            // Fallback : n'importe quel candidat libre.
            for (int i = 0; i < (int)cand.size(); i++) {
                if (takenIdx.count(i)) continue;
                chosenIdx = i; break;
            }
        }
        if (chosenIdx == -1) break;
        takenIdx.insert(chosenIdx);
        plantSpecs.push_back({cand[chosenIdx].x, cand[chosenIdx].y, rule.type});
    }

    // Tri final des plantSpecs par valeur de type (APPLE > LEMON > PLUM > BANANA)
    //   pour qu'orchard setup vise d'abord les types stratégiques.
    sort(plantSpecs.begin(), plantSpecs.end(), [](const PlantSpec& a, const PlantSpec& b) {
        auto rank = [](int t) { return t == 2 ? 0 : t == 1 ? 1 : t == 0 ? 2 : 3; };
        return rank(a.type) < rank(b.type);
    });

    cerr << "Arch=" << archetype << " water=" << waterPct << "% wag=" << wagCount
         << " wagNear=" << wagNearShack << " dist=" << shackDist
         << " iron=" << ironCells.size() << " ironNear=" << ironNearShack
         << " corr=" << corridorPct << "%" << endl;
    cerr << "Shack(" << myShackX << "," << myShackY << ") opp(" << oppShackX
         << "," << oppShackY << ") specs=" << plantSpecs.size();
    for (auto& ps : plantSpecs) {
        cerr << " " << typeName(ps.type) << "(" << ps.x << "," << ps.y << ")";
    }
    cerr << endl;

    struct Intent {
        int trollIdx;
        enum Kind { ACT, MOVE_TO, IDLE } kind = IDLE;
        string action;
        int targetX = -1, targetY = -1;
    };

    // État persistant inter-tours pour anti-raid et chopper offensif.
    map<pair<int,int>, int> raidCount;
    set<pair<int,int>> abandonedSpecs;
    map<pair<int,int>, pair<int,int>> prevTreeOnSpec;
    set<pair<int,int>> prevOppTrolls;
    int chopperId = -1;

    int turn = 0;
    while (true) {
        turn++;

        int myInv[6], oppInv[6];
        for (int i = 0; i < 6; i++) cin >> myInv[i]; cin.ignore();
        for (int i = 0; i < 6; i++) cin >> oppInv[i]; cin.ignore();

        int treesCount; cin >> treesCount; cin.ignore();
        vector<Tree> trees(treesCount);
        for (int i = 0; i < treesCount; i++) {
            string type;
            cin >> type >> trees[i].x >> trees[i].y
                >> trees[i].size >> trees[i].health
                >> trees[i].fruits >> trees[i].cooldown;
            cin.ignore();
            trees[i].type = (type == "PLUM") ? 0 : (type == "LEMON") ? 1
                          : (type == "APPLE") ? 2 : 3;
        }

        int trollsCount; cin >> trollsCount; cin.ignore();
        vector<Troll> trolls(trollsCount);
        int myCount = 0;
        vector<int> myIdx, oppIdx;
        for (int i = 0; i < trollsCount; i++) {
            cin >> trolls[i].id >> trolls[i].player
                >> trolls[i].x >> trolls[i].y
                >> trolls[i].movementSpeed >> trolls[i].carryCapacity
                >> trolls[i].harvestPower >> trolls[i].chopPower;
            for (int j = 0; j < 6; j++) cin >> trolls[i].carry[j];
            cin.ignore();
            if (trolls[i].player == 0) { myCount++; myIdx.push_back(i); }
            else oppIdx.push_back(i);
        }

        int targetN = myCount;

        // ----- Chopper offensif : désignation sticky ---------------------
        // Conditions : myCount >= 3, turn >= 40 (orchard up), opp shack connu.
        // Pris : troll avec chopPower max (cp=3 idéal), tie-break par distance
        // au shack adverse (le plus proche). Reste assigné tant qu'il vit et
        // garde son chopPower.
        bool chopperValid = false;
        if (chopperId >= 0) {
            for (int idx : myIdx) {
                if (trolls[idx].id == chopperId) {
                    if (trolls[idx].chopPower > 0) chopperValid = true;
                    break;
                }
            }
        }
        if (!chopperValid) chopperId = -1;
        if (chopperId < 0 && myCount >= 3 && turn >= 40 && oppShackX >= 0) {
            // Seuil d'efficacité (cp * cc) :
            //   - cc=1 cp=1 (score 1) : 0.57 pts/tour, PIRE qu'un farmer. Veto.
            //   - cc=2 cp=1 (score 2) : 1.14 pts/tour, OK (1 wood = 4 pts en 7 tours).
            //   - cc=1 cp=2 (score 2) : 0.67 pts/tour, OK (banane 3 swings).
            //   - cc=2 cp=2 (score 4) : 1.33 pts/tour, bon.
            //   - cc=2 cp=3 (score 6) : 2 pts/tour, très bon.
            //   Réf. opp idéal cc=4 cp=2 = 4 pts/tour. Pas atteignable, mais
            //   on essaie de s'en approcher.
            int bestScore = 0, bestD = INT_MAX;
            for (int idx : myIdx) {
                Troll& tt = trolls[idx];
                if (tt.chopPower <= 0) continue;
                int score = tt.chopPower * tt.carryCapacity;
                if (score < 2) continue;
                int d = mh(tt.x, tt.y, oppShackX, oppShackY);
                if (score > bestScore ||
                    (score == bestScore && d < bestD)) {
                    bestScore = score; bestD = d; chopperId = tt.id;
                }
            }
            if (chopperId >= 0) {
                cerr << "Chopper assigned: troll " << chopperId
                     << " score=" << bestScore << endl;
            }
        }

        // ----- Raid detection (compare prev turn vs now) -----------------
        {
            set<pair<int,int>> curTreeCells;
            for (auto& tr : trees) curTreeCells.insert({tr.x, tr.y});
            for (auto& [cell, sh] : prevTreeOnSpec) {
                if (curTreeCells.count(cell)) continue;
                bool oppWasClose = false;
                for (auto& op : prevOppTrolls) {
                    if (mh(op.first, op.second, cell.first, cell.second) <= 2) {
                        oppWasClose = true; break;
                    }
                }
                if (oppWasClose) {
                    raidCount[cell]++;
                    if (raidCount[cell] >= 2) abandonedSpecs.insert(cell);
                    cerr << "RAID at (" << cell.first << "," << cell.second
                         << ") count=" << raidCount[cell]
                         << (abandonedSpecs.count(cell) ? " ABANDONED" : "") << endl;
                }
            }
        }
        prevTreeOnSpec.clear();
        for (auto& tr : trees) {
            for (auto& ps : plantSpecs) {
                if (tr.x == ps.x && tr.y == ps.y) {
                    prevTreeOnSpec[{ps.x, ps.y}] = {tr.size, tr.health};
                }
            }
        }
        prevOppTrolls.clear();
        for (int idx : oppIdx) prevOppTrolls.insert({trolls[idx].x, trolls[idx].y});

        auto isAbandoned = [&](int x, int y) {
            return abandonedSpecs.count({x, y}) > 0;
        };

        // Spec cell state : occupiedPC (un arbre y est planté), claimedPC
        // (un troll s'y rend / vient d'y planter ce tour).
        set<pair<int,int>> occupiedPC;
        for (auto& tr : trees) {
            for (auto& ps : plantSpecs) {
                if (tr.x == ps.x && tr.y == ps.y) occupiedPC.insert({ps.x, ps.y});
            }
        }

        // orchardReady : on a au moins 1 arbre "premium" planté sur une spec.
        // Premium = non-banana s'il en existe dans les specs, sinon banana.
        bool hasPremiumSpec = false;
        for (auto& ps : plantSpecs) {
            if (ps.type != 3) { hasPremiumSpec = true; break; }
        }
        bool orchardReady = false;
        for (auto& tr : trees) {
            for (auto& ps : plantSpecs) {
                if (tr.x != ps.x || tr.y != ps.y) continue;
                if (tr.type != ps.type) continue;
                if (hasPremiumSpec) {
                    if (tr.type != 3) { orchardReady = true; break; }
                } else {
                    orchardReady = true; break;
                }
            }
            if (orchardReady) break;
        }

        // ----- Threat map : arbres approchés par chopper adverse ---------
        set<pair<int,int>> threatenedTreeCells;
        for (auto& tr : trees) {
            bool onSpec = false;
            for (auto& ps : plantSpecs) {
                if (tr.x == ps.x && tr.y == ps.y) { onSpec = true; break; }
            }
            if (!onSpec) continue;
            for (int oi : oppIdx) {
                Troll& ot = trolls[oi];
                if (ot.chopPower <= 0) continue;
                if (mh(ot.x, ot.y, tr.x, tr.y) <= 3) {
                    threatenedTreeCells.insert({tr.x, tr.y}); break;
                }
            }
        }

        vector<bool> treeClaimed(trees.size(), false);
        for (int idx : myIdx) {
            for (int i = 0; i < (int)trees.size(); i++) {
                if (trees[i].x == trolls[idx].x && trees[i].y == trolls[idx].y) {
                    treeClaimed[i] = true;
                }
            }
        }
        set<pair<int,int>> claimedPC;

        int bankAvail[6];
        for (int i = 0; i < 6; i++) bankAvail[i] = myInv[i];

        // Capacité-disponibilité par type d'arbre pour le throttling PICK.
        int openByType[4] = {0, 0, 0, 0};
        for (auto& ps : plantSpecs) {
            if (isAbandoned(ps.x, ps.y)) continue;
            if (occupiedPC.count({ps.x, ps.y})) continue;
            openByType[ps.type]++;
        }
        int carrying[4] = {0, 0, 0, 0};
        for (int idx : myIdx) {
            for (int type = 0; type < 4; type++) {
                if (trolls[idx].carry[type] > 0) carrying[type]++;
            }
        }
        int pickedNow[4] = {0, 0, 0, 0};

        // Compteur d'arbres déjà plantés par type, sur nos spec cells. Sert
        //   à autoriser systématiquement la PREMIÈRE plantation d'un type
        //   (sinon on bootstrap jamais l'orchard si stock initial=2), mais
        //   à réserver 2 graines pour le prochain TRAIN dès qu'un arbre
        //   existe déjà (car cet arbre va refill).
        int plantedOf[4] = {0, 0, 0, 0};
        for (auto& tr : trees) {
            for (auto& ps : plantSpecs) {
                if (tr.x == ps.x && tr.y == ps.y && tr.type == ps.type) {
                    plantedOf[tr.type]++;
                }
            }
        }

        bool endGame = turn > 200;
        bool lateGame = turn > 240;

        // Réserve LEMON pour monster TRAIN (cf. PICK section §3 / A2 §A2).
        //   Constant pour tous les trolls du tour : dépend uniquement de myCount.
        int lemonMonsterReserve = 0;
        if (myCount >= 2 && myCount < 5) {
            lemonMonsterReserve = myCount + 9;  // 11 pour N=2, 12 pour N=3
        }

        // Helper : la spec ps est-elle "pickable" (banque dispo + réserves) ?
        //   Inclus dans A2 pour éviter de diriger un troll vide vers une spec
        //   dont le PICK sera throttlé (sinon il IDLE sur la cellule).
        auto specPickable = [&](int specType) {
            if (bankAvail[specType] <= 0) return false;
            // Réserve TRAIN générique : 2 graines si déjà 1 arbre du type.
            if (specType < 3 && plantedOf[specType] >= 1
                && myCount < 5
                && bankAvail[specType] - 1 < 2) return false;
            // Réserve LEMON monster (renforcée).
            if (specType == 1 && plantedOf[1] >= 1
                && lemonMonsterReserve > 0
                && bankAvail[1] - 1 < lemonMonsterReserve) return false;
            return true;
        };

        vector<Intent> intents;
        intents.reserve(myIdx.size());

        for (int idx : myIdx) {
            Troll& t = trolls[idx];
            Intent in;
            in.trollIdx = idx;

            int carried = t.carried();
            int free = t.carryCapacity - carried;
            bool nearShack = mh(t.x, t.y, myShackX, myShackY) <= 1;
            bool onShackCell = (t.x == myShackX && t.y == myShackY);

            int onTreeIdx = -1;
            for (int i = 0; i < (int)trees.size(); i++) {
                if (trees[i].x == t.x && trees[i].y == t.y) { onTreeIdx = i; break; }
            }
            bool adjIron = false;
            for (auto& [ix, iy] : ironCells)
                if (mh(t.x, t.y, ix, iy) == 1) { adjIron = true; break; }

            // ==========================================================
            // Branche chopper : court-circuite tout le flow normal.
            //   - Si sur arbre adverse (pas une de nos specs) -> CHOP.
            //   - Si carry plein -> retour shack pour DROP.
            //   - Sinon -> cherche l'arbre adverse exploitable le plus proche.
            //     Priorité bananiers (6 HP, 2 swings avec cp=3 = 4 wood = 16 pts).
            //   - Si aucune cible -> scout vers shack adverse.
            // ==========================================================
            if (t.id == chopperId) {
                if (onTreeIdx >= 0 && t.chopPower > 0 && free > 0) {
                    Tree& tr = trees[onTreeIdx];
                    bool isOurs = false;
                    for (auto& ps : plantSpecs) {
                        if (ps.x == tr.x && ps.y == tr.y) { isOurs = true; break; }
                    }
                    int dToOpp = mh(tr.x, tr.y, oppShackX, oppShackY);
                    // Élargissement de la zone autorisée en endGame (turn>200) :
                    //   on peut chopper même les arbres "neutres" (dist > 5).
                    int range = endGame ? 99 : 6;
                    if (!isOurs && dToOpp <= range && tr.size >= 2) {
                        in.kind = Intent::ACT;
                        in.action = "CHOP " + to_string(t.id);
                        intents.push_back(in); continue;
                    }
                }
                if (!onShackCell && carried > 0 && nearShack) {
                    in.kind = Intent::ACT;
                    in.action = "DROP " + to_string(t.id);
                    intents.push_back(in); continue;
                }
                if (free == 0) {
                    in.kind = Intent::MOVE_TO;
                    in.targetX = myShackX; in.targetY = myShackY;
                    intents.push_back(in); continue;
                }
                auto distC = bfsFrom(t.x, t.y);
                int spC = max(1, t.movementSpeed);
                int bestScore = INT_MAX, bestX = -1, bestY = -1, claimI = -1;
                for (int i = 0; i < (int)trees.size(); i++) {
                    if (treeClaimed[i]) continue;
                    Tree& tr = trees[i];
                    bool isOurs = false;
                    for (auto& ps : plantSpecs) {
                        if (ps.x == tr.x && ps.y == tr.y) { isOurs = true; break; }
                    }
                    if (isOurs) continue;
                    int dToOpp = mh(tr.x, tr.y, oppShackX, oppShackY);
                    if (!endGame && dToOpp > 6) continue;
                    if (tr.size < 2) continue;
                    int d = distC[tr.x][tr.y];
                    if (d < 0) continue;
                    int walk = (d + spC - 1) / spC;
                    // Bonus : bananiers > autres (kill rapide cp=3 = 2 swings).
                    //   Plums/Lemons = 4 swings, apples = 7 swings (à éviter).
                    int score = walk * 4;
                    if (tr.type == 3) score -= 6;        // bananier prio
                    else if (tr.type == 2) score += 20;  // pommier coûteux à abattre
                    else score -= 1;                     // plum/lemon ok
                    if (score < bestScore) {
                        bestScore = score; bestX = tr.x; bestY = tr.y; claimI = i;
                    }
                }
                if (bestX != -1) {
                    if (claimI >= 0) treeClaimed[claimI] = true;
                    if (bestX == t.x && bestY == t.y) {
                        in.kind = Intent::IDLE;
                    } else {
                        in.kind = Intent::MOVE_TO;
                        in.targetX = bestX; in.targetY = bestY;
                    }
                    intents.push_back(in); continue;
                }
                in.kind = Intent::MOVE_TO;
                in.targetX = oppShackX; in.targetY = oppShackY;
                intents.push_back(in); continue;
            }

            // ==========================================================
            // Branche farmer (non-chopper).
            // ==========================================================

            // Spec cell sur laquelle se trouve le troll, si libre et pas
            //   abandonnée.
            int onSpecIdx = -1;
            for (int i = 0; i < (int)plantSpecs.size(); i++) {
                auto& ps = plantSpecs[i];
                if (t.x != ps.x || t.y != ps.y) continue;
                if (isAbandoned(ps.x, ps.y)) continue;
                if (occupiedPC.count({ps.x, ps.y})) continue;
                if (claimedPC.count({ps.x, ps.y})) continue;
                onSpecIdx = i; break;
            }

            // 1. PLANT sur la case courante si on a la bonne graine.
            //    Skip en endGame pour économiser la graine (l'arbre n'a pas
            //    le temps de produire avant la fin).
            if (!endGame && onSpecIdx >= 0 && onTreeIdx < 0) {
                int seedType = plantSpecs[onSpecIdx].type;
                if (t.carry[seedType] > 0) {
                    in.kind = Intent::ACT;
                    in.action = "PLANT " + to_string(t.id) + " " + typeName(seedType);
                    claimedPC.insert({t.x, t.y});
                    intents.push_back(in); continue;
                }
            }

            // 2. wantsPlant : on porte une graine et il existe une spec libre
            //    matching → on va y planter plutôt que DROP.
            bool wantsPlant = false;
            if (!endGame) {
                for (int type = 0; type < 4 && !wantsPlant; type++) {
                    if (t.carry[type] == 0) continue;
                    for (auto& ps : plantSpecs) {
                        if (ps.type != type) continue;
                        if (isAbandoned(ps.x, ps.y)) continue;
                        if (occupiedPC.count({ps.x, ps.y})) continue;
                        if (claimedPC.count({ps.x, ps.y})) continue;
                        wantsPlant = true; break;
                    }
                }
            }

            // 3. PICK : si près du shack, vide, et une spec libre demande
            //    une graine qu'on a en banque (pas en endGame).
            //    Réserves via specPickable() : 2 graines mini par type +
            //    réserve LEMON renforcée pour monster TRAIN (imp4).
            int pickType = -1;
            if (!endGame) {
                for (auto& ps : plantSpecs) {
                    if (isAbandoned(ps.x, ps.y)) continue;
                    if (occupiedPC.count({ps.x, ps.y})) continue;
                    if (!specPickable(ps.type)) continue;
                    int demand = openByType[ps.type] - carrying[ps.type] - pickedNow[ps.type];
                    if (demand <= 0) continue;
                    pickType = ps.type;
                    break;
                }
            }
            if (!onShackCell && nearShack && carried == 0 && pickType >= 0) {
                in.kind = Intent::ACT;
                in.action = "PICK " + to_string(t.id) + " " + typeName(pickType);
                bankAvail[pickType]--;
                pickedNow[pickType]++;
                intents.push_back(in); continue;
            }

            // 4. DROP : on porte des trucs, on est près du shack, et pas
            //    de plant en attente.
            if (!onShackCell && carried > 0 && nearShack && !wantsPlant) {
                in.kind = Intent::ACT;
                in.action = "DROP " + to_string(t.id);
                intents.push_back(in); continue;
            }

            // 5. Carry plein -> direction shack (sauf si on a un plant à finir).
            if (free == 0 && !wantsPlant) {
                in.kind = Intent::MOVE_TO;
                in.targetX = myShackX; in.targetY = myShackY;
                intents.push_back(in); continue;
            }

            // 6. Sur un arbre : harvest / chop selon contexte.
            if (onTreeIdx >= 0 && free > 0) {
                Tree& tr = trees[onTreeIdx];
                bool harvestable = tr.fruits > 0 && t.harvestPower > 0;
                bool choppable = t.chopPower > 0;

                // 6a. Defensive self-chop : notre arbre est attaqué (health <
                //   max), opp chopper sur/adjacent → on prend la moitié du bois.
                bool defensiveChop = false;
                if (choppable && free > 0) {
                    bool myTreeHere = false;
                    for (auto& ps : plantSpecs) {
                        if (ps.x == tr.x && ps.y == tr.y) { myTreeHere = true; break; }
                    }
                    if (myTreeHere && !harvestable) {
                        int maxH[4] = {12, 12, 20, 6};
                        bool damaged = tr.size >= 2 && tr.health < maxH[tr.type];
                        bool oppOnOrAdj = false;
                        for (int oi : oppIdx) {
                            Troll& ot = trolls[oi];
                            if (ot.chopPower <= 0) continue;
                            if (mh(ot.x, ot.y, tr.x, tr.y) <= 1) { oppOnOrAdj = true; break; }
                        }
                        if (damaged && oppOnOrAdj) defensiveChop = true;
                    }
                }

                // 6b. End-game CHOP : turn>200, on coupe les arbres adultes
                //   sans fruits (priorité bananiers car 6 HP = 2 swings cp=3).
                //   1 wood = 4 pts vs 1 fruit = 1 pt, ratio x4.
                bool endGameChop = endGame && choppable
                    && tr.size >= 2 && !harvestable
                    && (tr.type == 3 || lateGame);

                // 6c. Strong chop : chopper puissant (cp>=3), arbre adulte
                //   sans fruits, cooldown long → vaut le coût.
                bool strongChop = choppable
                    && free >= tr.size
                    && t.chopPower >= 3
                    && tr.size >= 3
                    && !harvestable
                    && tr.cooldown >= 5;

                // 6d. Opportunistic chop mid-late (imp4) : turn>=180, troll
                //   non-chopper avec cp>=2 sur arbre adverse (pas une de nos
                //   specs), arbre adulte sans fruits, type bananier (6 HP =
                //   3 swings cp=2) ou plum/lemon (12 HP = 6 swings, OK si
                //   cooldown>=5). Pommier exclu (20 HP = trop coûteux).
                //   Justification : entre turn 180 et 200, le chopperId
                //   désigné peut être loin ; un autre troll qui passe sur
                //   un arbre adverse mature doit pouvoir l'exploiter.
                bool oppTreeOnMySpec = false;
                for (auto& ps : plantSpecs) {
                    if (ps.x == tr.x && ps.y == tr.y) { oppTreeOnMySpec = true; break; }
                }
                bool opportunisticChop = choppable
                    && t.id != chopperId
                    && turn >= 180
                    && t.chopPower >= 2
                    && tr.size >= 2
                    && !harvestable
                    && !oppTreeOnMySpec
                    && (tr.type == 3 || (tr.type <= 1 && tr.cooldown >= 5));

                if (defensiveChop) {
                    in.kind = Intent::ACT;
                    in.action = "CHOP " + to_string(t.id);
                    intents.push_back(in); continue;
                }
                if (harvestable && !endGame) {
                    in.kind = Intent::ACT;
                    in.action = "HARVEST " + to_string(t.id);
                    intents.push_back(in); continue;
                }
                if (endGameChop) {
                    in.kind = Intent::ACT;
                    in.action = "CHOP " + to_string(t.id);
                    intents.push_back(in); continue;
                }
                if (harvestable) {
                    in.kind = Intent::ACT;
                    in.action = "HARVEST " + to_string(t.id);
                    intents.push_back(in); continue;
                }
                if (strongChop) {
                    in.kind = Intent::ACT;
                    in.action = "CHOP " + to_string(t.id);
                    intents.push_back(in); continue;
                }
                if (opportunisticChop) {
                    in.kind = Intent::ACT;
                    in.action = "CHOP " + to_string(t.id);
                    intents.push_back(in); continue;
                }
                // Si l'arbre va produire bientôt (cd<=2) et on peut récolter,
                //   on reste sur place plutôt que de quitter.
                if (tr.size == 4 && tr.cooldown <= 2 && t.harvestPower > 0) {
                    in.kind = Intent::IDLE;
                    intents.push_back(in); continue;
                }
            }

            // 7. MINE : adj iron + cp > 0 + besoin de fer + capacité libre.
            //    Seuil iron buffer : assez pour le prochain TRAIN cp=3
            //    (coût N + 9). Buffer haut (12-14) pour anticiper.
            int targetIron = max(12, myCount + 9);
            bool needIron = myInv[4] < targetIron && myCount < 5;
            if (adjIron && t.chopPower > 0 && needIron && free > 0) {
                in.kind = Intent::ACT;
                in.action = "MINE " + to_string(t.id);
                intents.push_back(in); continue;
            }

            // 8. Sélection de cible (BFS depuis le troll).
            auto dist = bfsFrom(t.x, t.y);
            int sp = max(1, t.movementSpeed);

            int bestScore = INT_MAX;
            int bestX = -1, bestY = -1;
            int claimTreeIdx = -1;
            pair<int,int> claimPCCell = {-1, -1};

            // Priorité A : livrer la graine au plant spec matching le plus proche.
            if (!endGame) {
                for (int seedType = 0; seedType < 4; seedType++) {
                    if (t.carry[seedType] == 0) continue;
                    for (auto& ps : plantSpecs) {
                        if (ps.type != seedType) continue;
                        if (isAbandoned(ps.x, ps.y)) continue;
                        if (occupiedPC.count({ps.x, ps.y})) continue;
                        if (claimedPC.count({ps.x, ps.y})) continue;
                        int d = dist[ps.x][ps.y];
                        if (d < 0) continue;
                        int walk = (d + sp - 1) / sp;
                        int score = walk - 10;
                        if (score < bestScore) {
                            bestScore = score; bestX = ps.x; bestY = ps.y;
                            claimTreeIdx = -1; claimPCCell = {ps.x, ps.y};
                        }
                    }
                }
            }

            // Priorité A2 : setup d'orchard OU replant continu (imp4).
            //   On vise la spec libre la plus prioritaire (APPLE > LEMON >
            //   PLUM > BANANA) si la banque peut la fournir. Le troll passe
            //   par le shack pour PICK la bonne graine.
            //
            //   imp3 gatait sur !orchardReady (uniquement setup initial).
            //   imp4 étend au replant : tant qu'il y a une spec libre +
            //   specPickable, on dirige un troll empty vers elle. Score walk-5
            //   (bonus modeste) pour battre les "wait on empty tree" sans
            //   écraser les chops/iron urgents.
            //
            //   specPickable inclut les réserves TRAIN — évite le deadlock
            //   où on dirige le troll vers une spec LEMON qu'on ne peut pas
            //   PICK à cause de la réserve monster.
            //   Gate endGame (turn>200) conservé pour ne pas gaspiller graines.
            if (!endGame && carried == 0) {
                for (auto& ps : plantSpecs) {
                    if (isAbandoned(ps.x, ps.y)) continue;
                    if (occupiedPC.count({ps.x, ps.y})) continue;
                    if (claimedPC.count({ps.x, ps.y})) continue;
                    if (!specPickable(ps.type)) continue;
                    // Replant après orchardReady : on évite de gaspiller un
                    //   tour si un arbre fruité existe (Priorité B prendra)
                    //   sauf pour replant LEMON/APPLE (premium) qui prime.
                    if (orchardReady && ps.type == 3) continue;
                    int d = dist[ps.x][ps.y];
                    if (d < 0) continue;
                    int walk = (d + sp - 1) / sp;
                    int score = walk - 5;
                    if (score < bestScore) {
                        bestScore = score; bestX = ps.x; bestY = ps.y;
                        claimTreeIdx = -1; claimPCCell = {-1, -1};
                    }
                    break;
                }
            }

            // Priorité B : arbres (fruits / chop / wait).
            for (int i = 0; i < (int)trees.size(); i++) {
                if (treeClaimed[i]) continue;
                Tree& tr = trees[i];
                int d = dist[tr.x][tr.y];
                if (d < 0) continue;
                int walk = (d + sp - 1) / sp;

                // B1 : récolter un arbre avec fruits.
                if (tr.fruits > 0 && t.harvestPower > 0) {
                    int score = walk;
                    // Bonus si le type aide à financer TRAIN.
                    if (tr.type < 3 && myInv[tr.type] < targetN + 1) {
                        score -= 3;
                    }
                    // Léger malus banana si stock déjà large.
                    if (tr.type == 3 && myInv[3] > 5 + targetN) {
                        score += 1;
                    }
                    // Opp sur l'arbre = race condition, on veut être là ou
                    //   exploiter la mécanique de duplication du dernier fruit.
                    bool oppOnTree = false;
                    for (auto& ot : trolls) {
                        if (ot.player == 1 && ot.x == tr.x && ot.y == tr.y) {
                            oppOnTree = true; break;
                        }
                    }
                    if (oppOnTree) {
                        score -= 5;
                        for (auto& ps : plantSpecs) {
                            if (ps.x == tr.x && ps.y == tr.y) { score -= 5; break; }
                        }
                    }
                    if (threatenedTreeCells.count({tr.x, tr.y})) {
                        score -= 6;  // race-harvest avant que l'opp chope
                    }
                    if (score < bestScore) {
                        bestScore = score; bestX = tr.x; bestY = tr.y;
                        claimTreeIdx = i; claimPCCell = {-1, -1};
                    }
                }

                // B2 : chop end-game ou strong chopper.
                //   - endGame (turn>200) : tout arbre adulte (size>=2) tuable
                //     en 4 swings ou moins, hors pommiers (trop tanky).
                //   - mid-game : chop fort pour bûcheron cp>=3 sur arbre 3+.
                bool chopWorth = t.chopPower > 0
                                 && t.carryCapacity >= tr.size
                                 && tr.size >= 2;
                if (chopWorth) {
                    int chopsToKill = (tr.health + t.chopPower - 1) / t.chopPower;
                    if (endGame && tr.type != 2 && chopsToKill <= 4) {
                        int score = walk + chopsToKill - tr.size * 3;
                        if (tr.type == 3) score -= 2;
                        if (score < bestScore) {
                            bestScore = score; bestX = tr.x; bestY = tr.y;
                            claimTreeIdx = i; claimPCCell = {-1, -1};
                        }
                    } else if (turn > 180 && t.chopPower >= 3 && tr.size >= 3 && tr.fruits == 0) {
                        int score = walk + chopsToKill - tr.size;
                        if (score < bestScore) {
                            bestScore = score; bestX = tr.x; bestY = tr.y;
                            claimTreeIdx = i; claimPCCell = {-1, -1};
                        }
                    }
                }

                // B3 : arbre vide -> attendre prod si pertinent (mid-game).
                if (!endGame && tr.fruits == 0 && t.harvestPower > 0) {
                    int score = max(walk, tr.cooldown) + 5;
                    if (threatenedTreeCells.count({tr.x, tr.y})) score -= 4;
                    if (score < bestScore) {
                        bestScore = score; bestX = tr.x; bestY = tr.y;
                        claimTreeIdx = i; claimPCCell = {-1, -1};
                    }
                }
            }

            // Priorité C : iron (si chop>0 et besoin).
            //   Le fer est le bottleneck pour les specs cp=2 (coût N+4) et
            //   cp=3 (coût N+9). Sans assez de fer, on reste cp=1 cc=1 ad
            //   vitam = chopper inefficace = défaite. Scoring agressif :
            //   plus le bank fer est éloigné du target, plus le score
            //   devient négatif (i.e. mining devient prioritaire absolu).
            // `free > 0` requis : un troll plein ne peut pas miner (le MINE
            //   de Section 8 a la même garde). Sans ce check, la priorité fer
            //   sélectionnait la case courante comme cible quand le troll
            //   était adjacent au fer ET plein, ce qui causait Intent::IDLE
            //   en boucle infinie (cf. games/889105534.md).
            if (t.chopPower > 0 && needIron && free > 0) {
                int target = max(12, myCount + 9);
                int gap = target - myInv[4];
                for (auto& [ix, iy] : ironCells) {
                    int bestAdj = INT_MAX, ax = -1, ay = -1;
                    for (int k = 0; k < 4; k++) {
                        int nx = ix + DX[k], ny = iy + DY[k];
                        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
                        if (!walkable[nx][ny]) continue;
                        int d = dist[nx][ny];
                        if (d >= 0 && d < bestAdj) { bestAdj = d; ax = nx; ay = ny; }
                    }
                    if (ax == -1) continue;
                    int walk = (bestAdj + sp - 1) / sp;
                    int score = walk;
                    // Chaque fer manquant = -1 point de score (linéaire).
                    if (gap > 0) score -= gap;
                    // Bonus catégoriques sur les seuils critiques.
                    if (myInv[4] < 6) score -= 5;
                    if (myInv[4] < 3) score -= 10;
                    if (myInv[4] < 1) score -= 15;
                    if (score < bestScore) {
                        bestScore = score; bestX = ax; bestY = ay;
                        claimTreeIdx = -1; claimPCCell = {-1, -1};
                    }
                }
            }

            // Priorité D : idle -> retour vers shack pour PICK prochain tour.
            //   Utilise specPickable (imp4) pour ne pas diriger un troll
            //   vers le shack quand toutes les specs libres sont throttlées
            //   (réserves TRAIN ou LEMON monster).
            if (bestX == -1 && carried == 0 && !endGame) {
                for (auto& ps : plantSpecs) {
                    if (isAbandoned(ps.x, ps.y)) continue;
                    if (occupiedPC.count({ps.x, ps.y})) continue;
                    if (claimedPC.count({ps.x, ps.y})) continue;
                    if (!specPickable(ps.type)) continue;
                    bestX = myShackX; bestY = myShackY;
                    claimTreeIdx = -1; claimPCCell = {-1, -1};
                    break;
                }
            }

            if (bestX != -1) {
                if (claimTreeIdx >= 0) treeClaimed[claimTreeIdx] = true;
                if (claimPCCell.first != -1) claimedPC.insert(claimPCCell);
                if (bestX == t.x && bestY == t.y) {
                    // Garde-fou anti-IDLE : si on est "sur la cible" mais
                    //   qu'aucune ACT n'a été émise dans les sections 1-8,
                    //   c'est qu'aucune action utile n'est faisable ici
                    //   (ex: spec occupée, fer mais carry plein, etc.).
                    //   Plutôt qu'IDLE en boucle, basculer sur retour shack
                    //   si on porte quelque chose (DROP libère cc), sinon
                    //   IDLE est légitime. Cf. games/889105534.md.
                    if (carried > 0) {
                        in.kind = Intent::MOVE_TO;
                        in.targetX = myShackX; in.targetY = myShackY;
                    } else {
                        in.kind = Intent::IDLE;
                    }
                } else {
                    in.kind = Intent::MOVE_TO;
                    in.targetX = bestX; in.targetY = bestY;
                }
                intents.push_back(in); continue;
            }

            if (carried > 0) {
                in.kind = Intent::MOVE_TO;
                in.targetX = myShackX; in.targetY = myShackY;
                intents.push_back(in); continue;
            }
            if (onShackCell) {
                // Anti-squat shack : on dégage vers le centre pour libérer
                //   la case TRAIN.
                in.kind = Intent::MOVE_TO;
                in.targetX = W / 2; in.targetY = H / 2;
                intents.push_back(in); continue;
            }
            in.kind = Intent::IDLE;
            intents.push_back(in);
        }

        // ----- Phase 2 : résolution collisions inter-trolls alliés -------
        set<pair<int,int>> occupiedNext;
        for (auto& in : intents) {
            Troll& t = trolls[in.trollIdx];
            occupiedNext.insert({t.x, t.y});
        }
        for (auto& in : intents) {
            if (in.kind != Intent::MOVE_TO) continue;
            Troll& t = trolls[in.trollIdx];
            occupiedNext.erase({t.x, t.y});
            auto next = pickNextCell(t.x, t.y, in.targetX, in.targetY,
                                     t.movementSpeed, occupiedNext);
            in.targetX = next.first;
            in.targetY = next.second;
            occupiedNext.insert(next);
        }

        // ----- Phase 2b : anti-deadlock jitter ---------------------------
        // Fix 1 (dT occupied-aware) suffit dans 90% des cas. Filet de
        //   sécurité : si un troll voulait bouger mais pickNextCell l'a
        //   gardé sur place (cible inatteignable / encerclé par alliés),
        //   on le force sur n'importe quel voisin libre. Asymétrique :
        //   un SEUL troll bloqué par tour est secoué (sinon les deux
        //   permutent et retombent dans le même deadlock 2 tours plus tard).
        bool jittered = false;
        for (auto& in : intents) {
            if (jittered) break;
            if (in.kind != Intent::MOVE_TO) continue;
            Troll& t = trolls[in.trollIdx];
            if (in.targetX != t.x || in.targetY != t.y) continue;  // pas bloqué
            for (int k = 0; k < 4; k++) {
                int nx = t.x + DX[k], ny = t.y + DY[k];
                if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
                if (!walkable[nx][ny]) continue;
                if (nx == myShackX && ny == myShackY) continue;
                if (occupiedNext.count({nx, ny})) continue;
                occupiedNext.erase({t.x, t.y});
                occupiedNext.insert({nx, ny});
                in.targetX = nx; in.targetY = ny;
                jittered = true;
                cerr << "JITTER troll " << t.id << " (" << t.x << "," << t.y
                     << ") -> (" << nx << "," << ny << ")" << endl;
                break;
            }
        }

        // ----- Phase 3 : émission --------------------------------------
        vector<string> commands;
        for (auto& in : intents) {
            Troll& t = trolls[in.trollIdx];
            if (in.kind == Intent::ACT) {
                commands.push_back(in.action);
            } else if (in.kind == Intent::MOVE_TO) {
                if (in.targetX == t.x && in.targetY == t.y) continue;
                commands.push_back("MOVE " + to_string(t.id) + " "
                    + to_string(in.targetX) + " " + to_string(in.targetY));
            }
        }

        // ----- TRAIN ---------------------------------------------------
        // Doctrine TRAIN (cf. analyse-strategies.md taxonomie classes) :
        //   Train 2 (N=1) : Sprinter — speed-2 farmer (multiplicateur temps).
        //   Train 3 (N=2) : Transporteur — cc-heavy, cp=1 si fer dispo
        //                   (bootstrap mining).
        //   Train 4 (N=3) : Bûcheron lourd — cp=3 si fer stocké (>=N+9=12)
        //                   sinon cp=1 ou farmer.
        //   Train 5 (N=4) : opportuniste — second chopper ou farmer.
        // Gate général : orchardReady OU turn > 25 (laisse le seed pour
        //   planter, sauf si l'orchard ne démarre pas).
        // Affordability check via bankAvail (et non myInv) : les PICK émis
        //   ce tour-ci sont traités par le moteur AVANT le TRAIN (ordre des
        //   actions §sujet.md), donc le stock effectif au moment du TRAIN
        //   est myInv - sum(PICK ce tour). bankAvail le reflète déjà.
        auto affordable = [&](int s, int c, int h, int cp) {
            int N = myCount;
            return bankAvail[0] >= N + s*s
                && bankAvail[1] >= N + c*c
                && bankAvail[2] >= N + h*h
                && bankAvail[4] >= N + cp*cp;
        };
        int remaining = 300 - turn;
        struct Spec { int s, c, h, cp; int minRemaining; };
        vector<Spec> specs;

        if (myCount == 1) {
            // Train 2 : Sprinter idéalement polyvalent (cp=1 si iron).
            // (2,1,1,1) à N=1 = 5P 2L 2A 2I (besoin MINE >=2 IRON d'abord).
            //   Justification : un T2 cp=1 peut MINE, ouvre l'option chop
            //   défensif, et garde la mobilité speed=2. Vu en jeu adverse
            //   (game 889089094 kosimiki, 889090430 mattdeal) à coût identique.
            if (myInv[4] >= 2) {
                specs.push_back({2, 1, 1, 1, 40});  // sprinter polyvalent
                specs.push_back({1, 2, 1, 1, 50});  // cc=2 polyvalent
            }
            specs.push_back({2, 2, 1, 0, 50});  // sprinter cc=2 (existant)
            specs.push_back({2, 1, 2, 0, 50});  // sprinter hp=2
            specs.push_back({2, 1, 1, 0, 60});  // sprinter pur
            specs.push_back({1, 2, 2, 0, 60});
            specs.push_back({1, 2, 1, 0, 80});
            specs.push_back({1, 1, 2, 0, 80});
            specs.push_back({1, 1, 1, 0, 100});
        } else if (myCount == 2) {
            // Train 3 : Light monster (1,3,1,2) si LEMON+IRON suffisant,
            //   sinon chopper cc=2 cp=2, sinon farmer cc=2.
            // (1,3,1,2) à N=2 = 3P 11L 3A 6I. Coût LEMON très élevé donc
            //   uniquement si bank >=11 (sinon affordable l'écartera).
            //   Bénéfice : cc=3 capture 3/4 wood par banane (cc=2 ne capture
            //   que 2/4), 1.6x meilleur ROI wood que cc=2 cp=2.
            if (myInv[4] >= 6 && myInv[1] >= 11) {
                specs.push_back({1, 3, 1, 2, 40});  // LIGHT MONSTER cc=3 cp=2
            }
            if (myInv[4] >= 6) {
                specs.push_back({1, 2, 1, 2, 50});  // chopper cc=2 cp=2
                specs.push_back({1, 1, 1, 2, 60});  // chopper cp=2 cc=1
            }
            specs.push_back({1, 2, 2, 1, 50});  // chopper cc=2 hp=2
            specs.push_back({1, 2, 1, 1, 60});  // chopper cc=2
            specs.push_back({1, 2, 2, 0, 50});  // farmer cc=2 (préféré à cp=1 faible)
            specs.push_back({2, 2, 1, 0, 60});
            specs.push_back({2, 1, 1, 1, 70});  // chopper speed
            specs.push_back({1, 2, 1, 0, 80});
            specs.push_back({1, 1, 1, 1, 90});  // chopper basic en dernier recours
            specs.push_back({1, 1, 1, 0, 100});
        } else {
            // Train 4+ : Monster heavy en tête.
            // (1,3,1,3) à N=3 = 4P 12L 4A 12I = MONSTER ULTIME (cc=3 cp=3) :
            //   banane OS-killed en 2 swings, 3 wood capturés, 1.5 pts/tour
            //   effectifs (12 pts / 8 tours cycle vers shack adverse).
            // (2,3,1,2) = MONSTER MV (mv=2 cc=3 cp=2) : 3 swings/kill mais
            //   vitesse 2 -> peut chopper plusieurs cibles par cycle. Coût
            //   7P 12L 4A 7I = moins d'iron, plus de plum.
            // Vu en jeu adverse cc=4 cp=2 ravage en 30 tours toute la prod
            //   (game 889093779 = défaite -191 pts pour cause unique chopper).
            if (myInv[1] >= myCount + 9 && myInv[4] >= myCount + 9) {
                specs.push_back({1, 3, 1, 3, 30});  // HEAVY MONSTER cc=3 cp=3
            }
            if (myInv[1] >= myCount + 9 && myInv[4] >= myCount + 4) {
                specs.push_back({2, 3, 1, 2, 40});  // MONSTER MV cc=3 cp=2
            }
            if (myInv[4] >= myCount + 9) {
                specs.push_back({1, 2, 1, 3, 50});  // heavy chopper cc=2 cp=3 (existant)
                specs.push_back({1, 1, 1, 3, 70});
            }
            if (myInv[1] >= myCount + 9 && myInv[4] >= myCount + 4) {
                specs.push_back({1, 3, 1, 2, 60});  // light monster fallback
            }
            specs.push_back({1, 2, 1, 2, 60});  // cp=2 cc=2 (existant)
            specs.push_back({1, 1, 1, 2, 80});
            specs.push_back({1, 2, 1, 1, 70});
            specs.push_back({2, 1, 1, 1, 80});
            specs.push_back({1, 1, 1, 1, 100});
            specs.push_back({1, 2, 2, 0, 70});
            specs.push_back({2, 2, 1, 0, 80});
            specs.push_back({1, 2, 1, 0, 90});
            specs.push_back({1, 1, 1, 0, 120});
        }

        bool canTrain = orchardReady || turn > 25;
        if (canTrain && myCount < 5) {
            for (auto& sp : specs) {
                if (remaining < sp.minRemaining) continue;
                if (!affordable(sp.s, sp.c, sp.h, sp.cp)) continue;
                ostringstream oss;
                oss << "TRAIN " << sp.s << " " << sp.c << " " << sp.h << " " << sp.cp;
                commands.push_back(oss.str());
                break;
            }
        }

        if (commands.empty()) {
            cout << "WAIT" << endl;
        } else {
            for (size_t i = 0; i < commands.size(); i++) {
                if (i) cout << ";";
                cout << commands[i];
            }
            cout << endl;
        }
    }
}
