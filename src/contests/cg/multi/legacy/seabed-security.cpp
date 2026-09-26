#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>
#include <math.h>
#include <algorithm>
#include <set>
#include <map>



using namespace std;

class Command
{
private:
    const bool _light;
    const string _text;

public:
    Command(bool light, string text) : _light(light), _text(text) {}
    const bool &light() const { return _light; }
    const string &text() const { return _text; }

    virtual string string_representation() const = 0;

    friend ostream &operator<<(ostream &_stream, Command const &command)
    {
        _stream << command.string_representation() << " " << (command._light ? 1 : 0) << " " << command._text;
        return _stream;
    }
};

using namespace std;


class MoveCommand : public Command
{
private:
    const int _x;
    const int _y;

public:
    MoveCommand(int x, int y, bool light, string text) : Command(light, text), _x(x), _y(y) {}

    const int &x() const { return _x; }
    const int &y() const { return _y; }

    string string_representation() const { return "MOVE " + to_string(this->_x) + " " + to_string(this->_y); }
};


using namespace std;


class WaitCommand : public Command
{
private:
public:
    WaitCommand(bool light, string text) : Command(light, text) {}

    string string_representation() const { return "WAIT"; }
};


using namespace std;


class PlayerState
{
private:
    const int _score;
    vector<int> _visited_creatures;

public:
    PlayerState(int score) : _score(score) {}

    const int &score() const { return _score; }
    void add_visited_creature(int id) { this->_visited_creatures.push_back(id); }
};


using namespace std;


class CreaturePosition
{
private:
    const int _id;
    const int _x;
    const int _y;
    const int _vx;
    const int _vy;

public:
    CreaturePosition(int id, int x, int y, int vx, int vy) : _id(id), _x(x), _y(y), _vx(vx), _vy(vy)
    {
    }
    const int &id() const { return _id; }
    const int &x() const { return _x; }
    const int &y() const { return _y; }
    const int &vx() const { return _vx; }
    const int &vy() const { return _vy; }

    friend ostream &operator<<(ostream &_stream, CreaturePosition const &object)
    {
        return _stream << "Creature[id = " << object._id << ", x = " << object._x << ", y = " << object._y << ", vx = " << object._vx << ", vy = " << object._vy << "]" << endl;
    }
};


using namespace std;


enum RadarBlipPosition
{
    TopLeft,
    TopRight,
    BottomRight,
    BottomLeft
};

istream &operator>>(istream &is, RadarBlipPosition &radar_blip_position)
{
    string value;
    if (is >> value)
    {
        if (value == "TL")
        {
            radar_blip_position = TopLeft;
        }
        else if (value == "TR")
        {
            radar_blip_position = TopRight;
        }
        else if (value == "BR")
        {
            radar_blip_position = BottomRight;
        }
        else if (value == "BL")
        {
            radar_blip_position = BottomLeft;
        }
    }
    return is;
}

class RadarBlip
{
private:
    const int _id;
    const RadarBlipPosition _position;

public:
    RadarBlip(int id, RadarBlipPosition position) : _id(id), _position(position)
    {
    }

    const int &id() const { return _id; }
    const RadarBlipPosition &position() const { return _position; }

    friend ostream &operator<<(ostream &_stream, RadarBlip const &radar_blip)
    {
        _stream << "RadarBlip[id = " << radar_blip._id << ", position = " << radar_blip._position << "]";
        return _stream;
    }
};

using namespace std;


class DroneInfo
{
private:
    const int _id;
    const int _x;
    const int _y;
    const int _emergency;
    const int _battery;
    vector<int> scanned_creatures;
    vector<const RadarBlip *> _radar_blips;

public:
    DroneInfo(int id, int x, int y, int emergency, int battery) : _id(id), _x(x), _y(y), _emergency(emergency), _battery(battery)
    {
    }

    const int &id() const { return _id; }
    const int &x() const { return _x; }
    const int &y() const { return _y; }
    const int &emergency() const { return _emergency; }
    const int &battery() const { return _battery; }
    void add_scanned_creature(int id) { scanned_creatures.push_back(id); }
    void add_radar_blip(const RadarBlip *radar_blip) { _radar_blips.push_back(radar_blip); }

    friend ostream &operator<<(ostream &_stream, DroneInfo const &drone_info)
    {
        _stream
            << "Drone["
            << "id = " << drone_info._id
            << ", x = " << drone_info._x
            << ", y = " << drone_info._y
            << ", battery = " << drone_info._battery
            << ", scanned = " << drone_info.scanned_creatures.size()
            << ", radar_blips = " << drone_info._radar_blips.size()
            << "]";
        return _stream;
    }
};

using namespace std;


class GameState
{
private:
    const int _turns;
    const PlayerState *_player_state;
    const PlayerState *_opponent_state;
    map<int, DroneInfo *> _drones;
    vector<DroneInfo *> _player_drones;
    vector<DroneInfo *> _opponent_drones;
    vector<CreaturePosition *> _visible_creatures;

public:
    GameState(int turns, PlayerState *player_state, PlayerState *opponent_state) : _turns(turns), _player_state(player_state), _opponent_state(opponent_state) {}

    const int &turns() const { return _turns; }

    void add_player_drone(DroneInfo *drone_info)
    {
        this->_drones[drone_info->id()] = drone_info;
        this->_player_drones.push_back(drone_info);
    }

    void add_opponent_drone(DroneInfo *drone_info)
    {
        this->_drones[drone_info->id()] = drone_info;
        this->_opponent_drones.push_back(drone_info);
    }

    void add_visibile_creature(CreaturePosition *creature_position)
    {
        this->_visible_creatures.push_back(creature_position);
    }

    DroneInfo *get_drone(int id) const
    {
        return this->_drones.at(id);
    }
};
#include <functional>




using namespace std;


enum CreatureType
{
    Ennemy,
    Squid,
    Fish,
    Crab
};

istream &operator>>(istream &is, CreatureType &creature_type)
{
    int value;
    if (is >> value)
    {
        if (value == -1)
        {
            creature_type = Ennemy;
        }
        else if (value == 0)
        {
            creature_type = Squid;
        }
        else if (value == 1)
        {
            creature_type = Fish;
        }
        else if (value == 2)
        {
            creature_type = Crab;
        }
    }
    return is;
}

enum CreatureColor
{
    None,
    Pink,
    Yellow,
    Green,
    Blue
};

istream &operator>>(istream &is, CreatureColor &creature_color)
{
    int value;
    if (is >> value)
    {
        if (value == -1)
        {
            creature_color = None;
        }
        else if (value == 0)
        {
            creature_color = Pink;
        }
        else if (value == 1)
        {
            creature_color = Yellow;
        }
        else if (value == 2)
        {
            creature_color = Green;
        }
        else if (value == 3)
        {
            creature_color = Blue;
        }
    }
    return is;
}

class CreatureItem
{
private:
    int _id;
    CreatureColor _color;
    CreatureType _type;

public:
    CreatureItem(int id, CreatureColor color, CreatureType type) : _id(id), _color(color), _type(type)
    {
    }

    friend ostream &operator<<(ostream &os, const CreatureItem &creature_item)
    {
        os << "CreatureItem[id = " << creature_item._id << ", color = " << creature_item._color << ", type = " << creature_item._type << "]";
        return os;
    }
};


class GameParameters
{
private:
    vector<CreatureItem *> _creature_items;

public:
    GameParameters(vector<CreatureItem *> creature_items) : _creature_items(creature_items)
    {
    }

    friend ostream &operator<<(ostream &os, const GameParameters &game_parameters)
    {
        os << "Game ["
           << "creatures (" << game_parameters._creature_items.size() << "): ";
        for (auto &creature_item : game_parameters._creature_items)
        {
            os << *creature_item;
            if (&creature_item != &game_parameters._creature_items.back())
            {
                os << ", ";
            }
        }
        os << "]";
        return os;
    }
};



using namespace std;


vector<Command *> apply_strategy(GameState *game_state)
{
    cerr << "Turn #" << game_state->turns() << endl;

    return {new WaitCommand(false, "I'm lazy #1"), new WaitCommand(false, "I'm lazy #2")};
}

using namespace std;


int read_int()
{
    int value;
    cin >> value;
    cin.ignore();
    return value;
}

void read_and_foreach(function<void()> handler)
{
    int count = read_int();
    for (int i = 0; i < count; i++)
    {
        handler();
    }
}

template <typename T>
vector<T *> read_vector(function<T *()> factory)
{
    vector<T *> vector;
    read_and_foreach([vector, factory]() mutable
                     { vector.push_back(factory()); });
    return vector;
}

GameParameters *read_game_parameters()
{
    vector<CreatureItem *> creature_items = read_vector<CreatureItem>([]()
                                                                      {
        int creature_id;
        CreatureColor color;
        CreatureType type;
        cin >> creature_id >> color >> type;
        cin.ignore();
        return new CreatureItem(creature_id, color, type); });
    return new GameParameters(creature_items);
}

DroneInfo *read_drone_info()
{
    int drone_id = read_int();
    int drone_x = read_int();
    int drone_y = read_int();
    int emergency = read_int();
    int battery = read_int();
    return new DroneInfo(drone_id, drone_x, drone_y, emergency, battery);
}

static int turns = 0;
GameState *read_game_state()
{
    turns++;
    int player_score = read_int();
    auto player_state = new PlayerState(player_score);

    int opponent_score = read_int();
    auto opponent_state = new PlayerState(opponent_score);

    GameState *game_state = new GameState(turns, player_state, opponent_state);

    read_and_foreach([player_state]()
                     {
        int creature_id = read_int();
        player_state->add_visited_creature(creature_id); });

    read_and_foreach([opponent_state]()
                     {
        int creature_id = read_int();
        opponent_state->add_visited_creature(creature_id); });

    read_and_foreach([game_state]() mutable
                     {
        auto drone_info = read_drone_info();
        game_state->add_player_drone(drone_info); });

    read_and_foreach([game_state]() mutable
                     {
        auto drone_info = read_drone_info();
        game_state->add_opponent_drone(drone_info); });

    read_and_foreach([game_state]()
                     {
        int drone_id = read_int();
        int creature_id = read_int();
        game_state->get_drone(drone_id)->add_scanned_creature(creature_id); });

    read_and_foreach([game_state]()
                     {
        int creature_id = read_int();
        int creature_x = read_int();
        int creature_y = read_int();
        int creature_vx = read_int();
        int creature_vy = read_int();
        game_state->add_visibile_creature(new CreaturePosition(creature_id, creature_x, creature_y, creature_vx, creature_vy)); });

    read_and_foreach([game_state]()
                     {
        int drone_id = read_int();
        int creature_id = read_int();
        RadarBlipPosition radar;
        cin >> radar;
        cin.ignore();
        game_state->get_drone(drone_id)->add_radar_blip(new RadarBlip(creature_id, radar)); });

    return game_state;
}



using namespace std;

class Move
{
public:
    int _x;
    int _y;

    Move(int x, int y)
    {
        this->_x = x;
        this->_y = y;
    }

    friend ostream &operator<<(ostream &_stream, Move const &object)
    {
        return _stream << "Move[x = " << object._x << ", y = " << object._y << "]" << endl;
    }
};

class RadarDetection
{
public:
    int _drone_id;
    int _creature_id;
    RadarBlipPosition _radar;

    RadarDetection(int drone_id, int creature_id, RadarBlipPosition radar)
    {
        this->_drone_id = drone_id;
        this->_creature_id = creature_id;
        this->_radar = radar;
    }
};

double distance(const CreaturePosition *creature, const int x, const int y)
{
    return sqrt(pow(creature->x() + creature->vx() - x, 2) + pow(creature->y() + creature->vy() - y, 2));
}

Move position_loop(int loop_counter, int bot_id)
{
    int loop_index = loop_counter % 5;
    int x = ((loop_counter % 2) == (bot_id % 2)) ? 9000 : 1000;
    if (loop_index == 0)
    {
        return Move(x, 9500);
    }
    else if (loop_index == 1)
    {
        return Move(x, 7500);
    }
    else if (loop_index == 2)
    {
        return Move(x, 5500);
    }
    else if (loop_index == 3)
    {
        return Move(x, 3500);
    }
    else if (loop_index == 4)
    {
        return Move(x, 1500);
    }
    return Move(0, 0);
}

Move compute_move_towards(int x, int y, int target_x, int target_y)
{
    int dx = target_x - x;
    int dy = target_y - y;
    double length = sqrt(pow(dx, 2) + pow(dy, 2));

    double ux = dx / length;
    double uy = dy / length;

    return Move((int)floor(x + ux * 600), (int)floor(y + uy * 600));
}

bool is_light_useful(vector<CreaturePosition *> creatures, set<int> visited_creatures, int x, int y, int target_x, int target_y)
{
    Move final_position = compute_move_towards(x, y, target_x, target_y);
    int close_creatures_count = 0;
    int very_close_creatures_count = 0;
    for (size_t j = 0; j < creatures.size(); ++j)
    {
        const auto creature = creatures.at(j);
        if (visited_creatures.find(creature->id()) != visited_creatures.end())
        {
            continue;
        }
        const auto distance_to_creature = distance(creature, final_position._x, final_position._y);
        if (distance_to_creature <= 800)
        {
            very_close_creatures_count++;
        }
        if (distance_to_creature <= 2000)
        {
            close_creatures_count++;
        }
    }
    cerr << "total = " << creatures.size() << ", close_creatures_count = " << close_creatures_count << ", very_close_creatures_count = " << very_close_creatures_count << endl;
    if (close_creatures_count > very_close_creatures_count)
    {
        return true;
    }
    if (creatures.size() > 0)
    {
        return true;
    }
    return rand() > .75;
}

int main()
{
    GameParameters *game_parameters = read_game_parameters();
    cerr << *game_parameters << endl;

    map<int, int> moving_directions;
    moving_directions[0] = 0;
    moving_directions[1] = 1;
    map<int, int> loop_counters;
    loop_counters[0] = 0;
    loop_counters[1] = 0;

    while (1)
    {
        GameState *game_state = read_game_state();
        auto output_positions = apply_strategy(game_state);

        for (auto &output_position : output_positions)
        {
            cout << *output_position << endl;
        }

        continue;






    }
}
