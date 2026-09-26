use std::io;
pub mod constants {
    pub const MAP_WIDTH: i32 = 17630;
    pub const MAP_HEIGHT: i32 = 9000;
    pub const _MAP_LIMIT: i32 = 800;
    pub const _BASE_ATTRACTION_RADIUS: i32 = 5000;
    pub const _BASE_VIEW_RADIUS: i32 = 6000;
    pub const _BASE_RADIUS: i32 = 300;
    pub const HERO_MOVE_SPEED: i32 = 800;
    pub const HEROES_PER_PLAYER: usize = 3;
    pub const _HERO_VIEW_RADIUS: i32 = 2200;
    pub const HERO_ATTACK_RANGE: i32 = 800;
    pub const HERO_ATTACK_DAMAGE: i32 = 2;
    pub const _MAX_MANA: i32 = -1;
    pub const _STARTING_MANA: i32 = 0;
    pub const _STARTING_BASE_HEALTH: i32 = 3;
    pub const _MOB_MOVE_SPEED: i32 = 400;
    pub const _MOB_SPAWN_MAX_DIRECTION_DELTA: f64 = 5.0 * std::f64::consts::PI / 12.0;
    pub const _MOB_SPAWN_RATE: i32 = 5;
    pub const _MOB_STARTING_MAX_ENERGY: i32 = 10;
    pub const _MOB_GROWTH_MAX_ENERGY: f32 = 0.5;
    pub const SPELL_WIND_COST: usize = 10;
    pub const SPELL_CONTROL_COST: usize = 10;
    pub const SPELL_PROTECT_COST: usize = 10;
    pub const _SPELL_PROTECT_DURATION: i32 = 12;
    pub const _SPELL_WIND_DISTANCE: i32 = 2200;
    pub const _SPELL_WIND_RADIUS: i32 = 1280;
    pub const MAX_TURN_COUNT: i32 = 220;
}
pub mod game {
    mod spider {
        use crate::constants::{
            HEROES_PER_PLAYER, HERO_ATTACK_DAMAGE, HERO_ATTACK_RANGE, HERO_MOVE_SPEED,
            MAX_TURN_COUNT, SPELL_CONTROL_COST, SPELL_PROTECT_COST, SPELL_WIND_COST,
        };
        use crate::model::{Direction, GameState, Monster, Position};
        use crate::tree::{Game, GameAction};
        use std::fmt;
        #[derive(Clone)]
        pub struct SpiderBattle {
            pub game_state: GameState,
            pub current_player_wild_mana: usize,
            pub opponent_player_wild_mana: usize,
        }
        #[derive(Debug, Clone, Copy, Eq, PartialEq, Hash)]
        pub enum HeroAction {
            Wait,
            Move { target: Position },
            Wind { target: Position },
            Shield { entity_id: i32 },
            Control { entity_id: i32, target: Position },
        }
        const REWARD_WIN: i32 = 1000;
        const REWARD_LOSS: i32 = -1000;
        impl HeroAction {
            pub fn get_mana(&self) -> usize {
                match self {
                    HeroAction::Wait => 0,
                    HeroAction::Move { target: _ } => 0,
                    HeroAction::Wind { target: _ } => SPELL_WIND_COST,
                    HeroAction::Shield { entity_id: _ } => SPELL_PROTECT_COST,
                    HeroAction::Control {
                        entity_id: _,
                        target: _,
                    } => SPELL_CONTROL_COST,
                }
            }
            pub fn to_output_string(&self) -> String {
                match self {
                    HeroAction::Wait => format!("WAIT"),
                    HeroAction::Move { target } => {
                        format!("MOVE {x} {y}", x = target.x, y = target.y)
                    }
                    HeroAction::Wind { target } => {
                        format!("SPELL WIND {x} {y}", x = target.x, y = target.y)
                    }
                    HeroAction::Shield { entity_id } => {
                        format!("SPELL SHIELD {id}", id = entity_id)
                    }
                    HeroAction::Control { entity_id, target } => format!(
                        "SPELL CONTROL {id} {x} {y}",
                        id = entity_id,
                        x = target.x,
                        y = target.y
                    ),
                }
            }
        }
        #[derive(Debug, Clone, Copy, Eq, PartialEq, Hash)]
        pub struct HeroActionSet {
            pub actions: [HeroAction; HEROES_PER_PLAYER],
            pub mana: usize,
        }
        impl GameAction for HeroActionSet {}
        impl SpiderBattle {
            pub fn new(
                game_state: &GameState,
                current_player_wild_mana: usize,
                opponent_player_wild_mana: usize,
            ) -> SpiderBattle {
                SpiderBattle {
                    game_state: game_state.clone(),
                    current_player_wild_mana,
                    opponent_player_wild_mana,
                }
            }
            pub fn get_allowed_hero_actions(&self, hero_id: usize) -> Vec<HeroAction> {
                let mut actions = vec![];
                actions.push(HeroAction::Wait);
                let hero = self.game_state.my_heroes[hero_id];
                let hero_current_position = hero.position;
                let sqrt2 = 2_f32.sqrt();
                let possible_directions = vec![
                    Direction::new(1_f32, 0_f32),
                    Direction::new(0_f32, 1_f32),
                    Direction::new(-1_f32, 0_f32),
                    Direction::new(0_f32, -1_f32),
                ];
                for direction in possible_directions {
                    let new_position =
                        hero_current_position.move_towards(direction, HERO_MOVE_SPEED);
                    if new_position.on_board() {
                        actions.push(HeroAction::Move {
                            target: new_position,
                        });
                    }
                }
                actions
            }
            fn reward_game_in_progress(&self) -> f32 {
                let reward = if self.game_state.turn == 1 { 10. } else { 0. };
                reward
            }
        }
        impl Game<HeroActionSet> for SpiderBattle {
            #[doc = " Return a list with all allowed actions given the current game state."]
            fn allowed_actions(&self) -> Vec<HeroActionSet> {
                if self.game_state.turn >= MAX_TURN_COUNT {
                    return vec![];
                }
                let heroes_actions = vec![
                    self.get_allowed_hero_actions(0),
                    self.get_allowed_hero_actions(1),
                    self.get_allowed_hero_actions(2),
                ];
                let mut all_actions = Vec::new();
                for i in 0..heroes_actions[0].len() {
                    let hero1_action = heroes_actions[0][i];
                    let mana1 = hero1_action.get_mana();
                    if mana1 > self.game_state.current_player.mana {
                        continue;
                    }
                    for j in 0..heroes_actions[1].len() {
                        let hero2_action = heroes_actions[1][j];
                        let mana2 = hero2_action.get_mana();
                        if mana1 + mana2 > self.game_state.current_player.mana {
                            continue;
                        }
                        for k in 0..heroes_actions[2].len() {
                            let hero3_action = heroes_actions[2][k];
                            let mana3 = hero3_action.get_mana();
                            if mana1 + mana2 + mana3 > self.game_state.current_player.mana {
                                continue;
                            }
                            all_actions.push(HeroActionSet {
                                mana: mana1 + mana2 + mana3,
                                actions: [hero1_action, hero2_action, hero3_action],
                            })
                        }
                    }
                }
                all_actions
            }
            #[doc = " Change the current game state according to the given action."]
            fn make_move(&mut self, action_set: &HeroActionSet) {
                for i in 0..action_set.actions.len() {
                    let action = action_set.actions[i];
                    match action {
                        HeroAction::Move { target } => {
                            self.game_state.my_heroes[i].position = target
                        }
                        _ => (),
                    }
                }
                self.game_state.monsters = self
                    .game_state
                    .monsters
                    .iter()
                    .map(|monster| {
                        let mut new_monster = monster.clone();
                        let damage = self.game_state.my_heroes.iter().fold(0, |sum, hero| {
                            sum + if monster.position.distance(hero.position)
                                <= HERO_ATTACK_RANGE as f64
                            {
                                HERO_ATTACK_DAMAGE
                            } else {
                                0
                            }
                        });
                        new_monster.health -= damage;
                        new_monster
                    })
                    .collect::<Vec<Monster>>();
                self.game_state.monsters = self
                    .game_state
                    .monsters
                    .iter()
                    .map(|monster| {
                        let mut new_monster = monster.clone();
                        new_monster.position =
                            new_monster.position.move_by(new_monster.vx, new_monster.vy);
                        new_monster
                    })
                    .collect::<Vec<Monster>>();
                self.game_state.monsters = self
                    .game_state
                    .monsters
                    .iter()
                    .filter(|monster| monster.health > 0 && monster.position.on_board())
                    .cloned()
                    .collect::<Vec<Monster>>();
                self.game_state.turn += 1;
            }
            #[doc = " Reward for the player when reaching the current game state."]
            fn reward(&self) -> f32 {
                let current_player_lost = self.game_state.current_player.health == 0;
                let opponent_player_lost = self.game_state.opponent_player.health == 0;
                match (current_player_lost, opponent_player_lost) {
                    (true, true) => {
                        if self.current_player_wild_mana > self.opponent_player_wild_mana {
                            (REWARD_WIN - self.game_state.turn) as f32
                        } else {
                            (REWARD_LOSS + self.game_state.turn) as f32
                        }
                    }
                    (true, false) => (REWARD_LOSS + self.game_state.turn) as f32,
                    (false, true) => (REWARD_WIN - self.game_state.turn) as f32,
                    (false, false) => self.reward_game_in_progress(),
                }
            }
        }
        impl fmt::Display for SpiderBattle {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("TODO")
            }
        }
    }
    pub use spider::SpiderBattle;
}
pub mod model {
    mod state {
        use crate::model::{Hero, Monster, Player, Position};
        #[derive(Clone)]
        pub struct GameState {
            pub turn: i32,
            pub base: Position,
            pub heroes_per_player: i32,
            pub current_player: Player,
            pub opponent_player: Player,
            pub monsters: Vec<Monster>,
            pub heroes: Vec<Hero>,
            pub my_heroes: Vec<Hero>,
            pub opponent_heroes: Vec<Hero>,
        }
        impl GameState {
            pub fn as_game_input(&self) -> String {
                format ! ("{base}\n{heroes_per_player}\n{player1}\n{player2}\n{entity_count}{split_monsters}{monsters}{split_heroes}{heroes}" , base = format ! ("{} {}" , self . base . x , self . base . y) , heroes_per_player = self . heroes_per_player , player1 = format ! ("{} {}" , self . current_player . health , self . current_player . mana) , player2 = format ! ("{} {}" , self . opponent_player . health , self . opponent_player . mana) , entity_count = self . monsters . len () + self . my_heroes . len () + self . opponent_heroes . len () , split_monsters = if self . monsters . len () > 0 { "\n" } else { "" } , monsters = self . monsters . iter () . map (| e | e . as_game_input ()) . collect ::< Vec < String >> () . join ("\n") , split_heroes = if self . heroes . len () > 0 { "\n" } else { "" } , heroes = self . heroes . iter () . map (| e | e . as_game_input (1)) . collect ::< Vec < String >> () . join ("\n") ,)
            }
        }
    }
    pub use state::GameState;
    mod hero {
        use crate::model::position::Position;
        #[derive(Copy, Clone)]
        pub struct Hero {
            pub id: i32,
            pub position: Position,
            pub shield_life: i32,
            pub is_controlled: bool,
        }
        impl Hero {
            pub fn as_game_input(&self, side: i32) -> String {
                format!(
                    "{id} {side} {x} {y} {shield_life} {is_controlled} -1 -1 -1 -1 -1",
                    id = self.id,
                    side = side,
                    x = self.position.x,
                    y = self.position.y,
                    shield_life = self.shield_life,
                    is_controlled = if self.is_controlled { 1 } else { 0 },
                )
            }
        }
    }
    pub use hero::Hero;
    mod monster {
        use crate::model::position::Position;
        #[derive(Copy, Clone)]
        pub struct Monster {
            pub id: i32,
            pub position: Position,
            pub shield_life: i32,
            pub is_controlled: bool,
            pub health: i32,
            pub vx: i32,
            pub vy: i32,
            pub near_base: bool,
            pub threat_for: i32,
        }
        impl Monster {
            pub fn as_game_input(&self) -> String {
                format ! ("{id} 0 {x} {y} {shield_life} {is_controlled} {health} {vx} {vy} {near_base} {threat_for}" , id = self . id , x = self . position . x , y = self . position . y , shield_life = self . shield_life , is_controlled = if self . is_controlled { 1 } else { 0 } , health = self . health , vx = self . vx , vy = self . vy , near_base = if self . near_base { 1 } else { 0 } , threat_for = self . threat_for)
            }
        }
    }
    pub use monster::Monster;
    mod player {
        use std::fmt;
        #[derive(Copy, Clone)]
        pub struct Player {
            pub health: i32,
            pub mana: usize,
        }
        impl fmt::Display for Player {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                write!(f, "(health = {}, mana = {})", self.health, self.mana)
            }
        }
    }
    pub use player::Player;
    mod position {
        use crate::constants::{MAP_HEIGHT, MAP_WIDTH};
        use crate::model::Direction;
        use std::fmt;
        #[derive(Copy, Clone, Debug, PartialEq, Eq, Hash)]
        pub struct Position {
            pub x: i32,
            pub y: i32,
        }
        impl fmt::Display for Position {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                write!(f, "({}, {})", self.x, self.y)
            }
        }
        impl Position {
            pub fn move_towards(&self, direction: Direction, distance: i32) -> Position {
                Position {
                    x: (self.x as f32 + direction.dx * distance as f32).floor() as i32,
                    y: (self.y as f32 + direction.dy * distance as f32).floor() as i32,
                }
            }
            pub fn move_by(&self, dx: i32, dy: i32) -> Position {
                Position {
                    x: self.x + dx,
                    y: self.y + dy,
                }
            }
            pub fn on_board(&self) -> bool {
                self.x >= 0 && self.y >= 0 && self.x <= MAP_WIDTH && self.y <= MAP_HEIGHT
            }
            pub fn distance(&self, other: Position) -> f64 {
                (((self.x - other.x).pow(2) + (self.y - other.y).pow(2)) as f64).sqrt()
            }
        }
    }
    pub use position::Position;
    mod direction {
        pub struct Direction {
            pub dx: f32,
            pub dy: f32,
        }
        impl Direction {
            pub fn new(dx: f32, dy: f32) -> Direction {
                Direction { dx, dy }
            }
        }
    }
    pub use direction::Direction;
}
pub mod tree {
    pub mod game {
        use std::fmt::Debug;
        use std::hash::Hash;
        pub trait GameAction: Debug + Clone + Copy + Eq + Hash {}
        pub trait Game<A: GameAction>: Clone {
            #[doc = " Return a list with all allowed actions given the current game state."]
            fn allowed_actions(&self) -> Vec<A>;
            #[doc = " Change the current game state according to the given action."]
            fn make_move(&mut self, action: &A);
            #[doc = " Reward for the player when reaching the current game state."]
            fn reward(&self) -> f32;
        }
    }
    pub use game::{Game, GameAction};
    pub mod mcts {
        use crate::tree::{Game, GameAction, TreeNode, TreeStatistics};
        use std::collections::HashMap;
        use std::fmt;
        use time::Instant;
        #[derive(Debug)]
        #[doc = " Represents an ensamble of MCTS trees."]
        #[doc = ""]
        #[doc = " For many applications we need to work with ensambles because we use"]
        #[doc = " determinization."]
        pub struct MonteCarloTreeSearch<G: Game<A>, A: GameAction> {
            roots: Vec<TreeNode<A>>,
            games: Vec<G>,
            iterations_per_ms: i32,
        }
        impl<G: Game<A>, A: GameAction> MonteCarloTreeSearch<G, A> {
            #[doc = " Create a new MCTS solver."]
            pub fn new(game: &G, ensemble_size: usize) -> MonteCarloTreeSearch<G, A> {
                let mut roots = Vec::new();
                let mut games = Vec::new();
                for _i in 0..ensemble_size {
                    let game = game.clone();
                    games.push(game);
                    roots.push(TreeNode::new(None));
                }
                eprintln!(
                    "[MCTS] ensemble size = {}, games size = {}, roots size = {}",
                    ensemble_size,
                    games.len(),
                    roots.len()
                );
                MonteCarloTreeSearch {
                    roots: roots,
                    games: games,
                    iterations_per_ms: 1,
                }
            }
            #[doc = " Return basic statistical data about the current MCTS tree."]
            #[doc = ""]
            #[doc = " XXX Note: The current implementation considers the ensemble"]
            #[doc = " to be a tree layer. In other words tree depth and number of"]
            #[doc = " nodes are all one too large."]
            pub fn tree_statistics(&self) -> TreeStatistics {
                let child_stats = self
                    .roots
                    .iter()
                    .map(|c| c.tree_statistics())
                    .collect::<Vec<_>>();
                TreeStatistics::merge(child_stats, Option::None)
            }
            #[doc = " Perform n_samples MCTS iterations."]
            pub fn search(&mut self, n_samples: i32, c: f32) {
                let ensemble_size = self.games.len();
                for e in 0..ensemble_size {
                    let game = &self.games[e];
                    let root = &mut self.roots[e];
                    for _ in 0..n_samples {
                        let mut this_game = game.clone();
                        root.iteration(&mut this_game, c);
                    }
                }
            }
            #[doc = " Perform MCTS iterations for the given time budget (in s)."]
            pub fn search_time(&mut self, budget_milliseconds: i32, c: f32) {
                let mut samples_total: i32 = 0;
                let t0 = Instant::now();
                let mut n_samples = (self.iterations_per_ms * budget_milliseconds)
                    .max(10)
                    .min(100);
                while n_samples >= 5 {
                    self.search(n_samples, c);
                    samples_total += n_samples;
                    let time_spend: i32 = t0.elapsed().whole_milliseconds() as i32;
                    self.iterations_per_ms = if time_spend > 0 {
                        samples_total / time_spend
                    } else {
                        1
                    };
                    let time_left = budget_milliseconds - time_spend;
                    n_samples = (self.iterations_per_ms * time_left).max(0).min(100);
                    eprintln!(
                        "[MCTS] time_spend = {}, time_left = {}, iterations_per_ms = {}",
                        time_spend, time_left, self.iterations_per_ms
                    );
                }
            }
            #[doc = " Return the best action found so far by averaging over the ensamble."]
            pub fn best_action(&self) -> Option<A> {
                let ensemble_size = self.games.len();
                let mut n_values = HashMap::<A, f32>::new();
                let mut q_values = HashMap::<A, f32>::new();
                for e in 0..ensemble_size {
                    let root = &self.roots[e];
                    for child in &root.children {
                        let action = child.action.unwrap();
                        let n = n_values.entry(action).or_insert(0.);
                        let q = q_values.entry(action).or_insert(0.);
                        *n += child.n;
                        *q += child.q;
                    }
                }
                let mut best_action: Option<A> = None;
                let mut best_value: f32 = f32::NEG_INFINITY;
                for (action, n) in &n_values {
                    let q = q_values.get(action).unwrap();
                    let value = q / n;
                    if value > best_value {
                        best_action = Some(*action);
                        best_value = value;
                    }
                }
                best_action
            }
        }
        impl<G: Game<A>, A: GameAction> fmt::Display for MonteCarloTreeSearch<G, A> {
            #[doc = " Output a nicely indented tree"]
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                write!(f, "Ensemble of {} trees:", self.roots.len())?;
                write!(f, "")
            }
        }
    }
    pub use mcts::MonteCarloTreeSearch;
    pub mod node {
        use crate::tree::{Game, GameAction};
        use crate::utils::choose_random;
        use std::cmp::{max, min};
        use std::fmt::Debug;
        use std::{f32, fmt, i32};
        #[doc = " Perform a random playout."]
        #[doc = ""]
        #[doc = " Start with an initial game state and perform random actions from"]
        #[doc = " until a game-state is reached that does not have any `allowed_actions`."]
        pub fn playout<G: Game<A>, A: GameAction>(initial: &G) -> G {
            let mut game = initial.clone();
            let mut potential_moves = game.allowed_actions();
            while potential_moves.len() > 0 {
                let action = choose_random(&potential_moves).clone();
                game.make_move(&action);
                potential_moves = game.allowed_actions();
            }
            game
        }
        #[derive(Debug, Copy, Clone)]
        pub enum NodeState {
            LeafNode,
            FullyExpanded,
            Expandable,
        }
        #[derive(Debug)]
        pub struct TreeNode<A: GameAction> {
            pub action: Option<A>,
            pub children: Vec<TreeNode<A>>,
            pub state: NodeState,
            pub n: f32,
            pub q: f32,
        }
        impl<A> TreeNode<A>
        where
            A: GameAction,
        {
            pub fn new(action: Option<A>) -> TreeNode<A> {
                TreeNode::<A> {
                    action: action,
                    children: Vec::new(),
                    state: NodeState::Expandable,
                    n: 0.,
                    q: 0.,
                }
            }
            pub fn tree_statistics(&self) -> TreeStatistics {
                let child_stats = self
                    .children
                    .iter()
                    .map(|c| c.tree_statistics())
                    .collect::<Vec<_>>();
                TreeStatistics::merge(child_stats, Some(self.state))
            }
            pub fn best_child(&mut self, c: f32) -> Option<&mut TreeNode<A>> {
                let mut best_value: f32 = f32::NEG_INFINITY;
                let mut best_child: Option<&mut TreeNode<A>> = None;
                for child in &mut self.children {
                    let value = child.q / child.n + c * (2. * self.n.ln() / child.n).sqrt();
                    if value > best_value {
                        best_value = value;
                        best_child = Some(child);
                    }
                }
                best_child
            }
            pub fn expand<G: Game<A>>(&mut self, game: &G) -> Option<&mut TreeNode<A>> {
                let allowed_actions = game.allowed_actions();
                if allowed_actions.len() == 0 {
                    self.state = NodeState::LeafNode;
                    return None;
                }
                let mut child_actions: Vec<A> = Vec::new();
                for child in &self.children {
                    child_actions.push(child.action.expect("Child node without action"));
                }
                let mut candidate_actions = Vec::new();
                for action in &allowed_actions {
                    if !child_actions.contains(action) {
                        candidate_actions.push(action);
                    }
                }
                if candidate_actions.len() == 1 {
                    self.state = NodeState::FullyExpanded;
                }
                let action = *choose_random(&candidate_actions).clone();
                self.children.push(TreeNode::new(Some(action)));
                self.children.last_mut()
            }
            pub fn iteration<G: Game<A>>(&mut self, game: &mut G, c: f32) -> f32 {
                let delta = match self.state {
                    NodeState::LeafNode => game.reward(),
                    NodeState::FullyExpanded => {
                        let child = self.best_child(c).unwrap();
                        game.make_move(&child.action.unwrap());
                        child.iteration(game, c)
                    }
                    NodeState::Expandable => {
                        let child = self.expand(game);
                        match child {
                            Some(child) => {
                                game.make_move(&child.action.unwrap());
                                let delta = playout(game).reward();
                                child.n += 1.;
                                child.q += delta;
                                delta
                            }
                            None => game.reward(),
                        }
                    }
                };
                self.n += 1.;
                self.q += delta;
                delta
            }
        }
        impl<A: GameAction> fmt::Display for TreeNode<A> {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                fn fmt_subtree<M: GameAction>(
                    f: &mut fmt::Formatter,
                    node: &TreeNode<M>,
                    indent_level: i32,
                ) -> fmt::Result {
                    for _ in 0..indent_level {
                        f.write_str("    ")?
                    }
                    match node.action {
                        Some(a) => writeln!(f, "{:?} q={} n={}", a, node.q, node.n)?,
                        None => writeln!(f, "Root q={} n={}", node.q, node.n)?,
                    };
                    for child in &node.children {
                        fmt_subtree(f, child, indent_level + 1)?;
                    }
                    write!(f, "")
                }
                fmt_subtree(f, self, 0)
            }
        }
        #[derive(Debug, Copy, Clone)]
        pub struct TreeStatistics {
            nodes: i32,
            leaf_nodes: i32,
            expanded_nodes: i32,
            min_depth: i32,
            max_depth: i32,
        }
        impl TreeStatistics {
            pub fn merge(
                child_stats: Vec<TreeStatistics>,
                node_state: Option<NodeState>,
            ) -> TreeStatistics {
                let leaf_nodes_count = match node_state {
                    Some(NodeState::LeafNode) => 1,
                    _ => 0,
                };
                let expanded_nodes_count = match node_state {
                    Some(NodeState::FullyExpanded) => 1,
                    _ => 0,
                };
                if child_stats.len() == 0 {
                    TreeStatistics {
                        nodes: 1,
                        min_depth: 0,
                        max_depth: 0,
                        leaf_nodes: leaf_nodes_count,
                        expanded_nodes: expanded_nodes_count,
                    }
                } else {
                    TreeStatistics {
                        nodes: child_stats.iter().fold(0, |sum, child| sum + child.nodes),
                        min_depth: 1 + child_stats
                            .iter()
                            .fold(i32::MAX, |depth, child| min(depth, child.min_depth)),
                        max_depth: 1 + child_stats
                            .iter()
                            .fold(0, |depth, child| max(depth, child.max_depth)),
                        leaf_nodes: child_stats
                            .iter()
                            .fold(0, |sum, child| sum + child.leaf_nodes)
                            + leaf_nodes_count,
                        expanded_nodes: child_stats
                            .iter()
                            .fold(0, |sum, child| sum + child.expanded_nodes)
                            + expanded_nodes_count,
                    }
                }
            }
        }
    }
    pub use node::{NodeState, TreeNode, TreeStatistics};
}
pub mod utils {
    use rand::Rng;
    pub fn choose_random<T>(vec: &Vec<T>) -> &T {
        let mut rng = rand::thread_rng();
        let length = vec.len();
        let idx = rng.gen::<usize>() % length as usize;
        &vec[idx]
    }
}
macro_rules! parse_input {
    ($ x : expr , $ t : ident) => {
        $x.trim().parse::<$t>().unwrap()
    };
}
fn read_player() -> model::Player {
    let mut input_line = String::new();
    io::stdin().read_line(&mut input_line).unwrap();
    let inputs = input_line.split(" ").collect::<Vec<_>>();
    return model::Player {
        health: parse_input!(inputs[0], i32),
        mana: parse_input!(inputs[1], usize),
    };
}
const ENSEMBLE_PER_SIZE: usize = 1;
const TIME_PER_MOVE: i32 = 35;
const VERBOSE: bool = true;
pub fn main() {
    let mut input_line = String::new();
    io::stdin().read_line(&mut input_line).unwrap();
    let inputs = input_line.split(" ").collect::<Vec<_>>();
    let base = model::Position {
        x: parse_input!(inputs[0], i32),
        y: parse_input!(inputs[0], i32),
    };
    let mut turn = 0;
    let mut input_line = String::new();
    io::stdin().read_line(&mut input_line).unwrap();
    let heroes_per_player = parse_input!(input_line, i32);
    loop {
        let current_player = read_player();
        let opponent_player = read_player();
        let mut input_line = String::new();
        io::stdin().read_line(&mut input_line).unwrap();
        let entity_count = parse_input!(input_line, i32);
        let mut heroes = Vec::new();
        let mut my_heroes = Vec::new();
        let mut opponent_heroes = Vec::new();
        let mut monsters = Vec::new();
        for _i in 0..entity_count as usize {
            let mut input_line = String::new();
            io::stdin().read_line(&mut input_line).unwrap();
            let inputs = input_line.split(" ").collect::<Vec<_>>();
            let id = parse_input!(inputs[0], i32);
            let kind = parse_input!(inputs[1], i32);
            let x = parse_input!(inputs[2], i32);
            let y = parse_input!(inputs[3], i32);
            let shield_life = parse_input!(inputs[4], i32);
            let is_controlled = parse_input!(inputs[5], i32) == 1;
            let health = parse_input!(inputs[6], i32);
            let vx = parse_input!(inputs[7], i32);
            let vy = parse_input!(inputs[8], i32);
            let near_base = parse_input!(inputs[9], i32) == 1;
            let threat_for = parse_input!(inputs[10], i32);
            if kind == 0 {
                monsters.push(model::Monster {
                    id,
                    position: model::Position { x, y },
                    shield_life,
                    is_controlled,
                    health,
                    vx,
                    vy,
                    near_base,
                    threat_for,
                });
            } else if kind == 1 {
                let hero = model::Hero {
                    id,
                    position: model::Position { x, y },
                    shield_life,
                    is_controlled,
                };
                my_heroes.push(hero);
                heroes.push(hero);
            } else if kind == 2 {
                let hero = model::Hero {
                    id,
                    position: model::Position { x, y },
                    shield_life,
                    is_controlled,
                };
                opponent_heroes.push(hero);
                heroes.push(hero);
            }
        }
        let game_state = model::GameState {
            base,
            heroes_per_player,
            current_player,
            opponent_player,
            turn,
            monsters,
            heroes,
            my_heroes,
            opponent_heroes,
        };
        let spider_battle = game::SpiderBattle::new(&game_state, 0, 0);
        let mut mcts = tree::MonteCarloTreeSearch::new(&spider_battle, ENSEMBLE_PER_SIZE);
        mcts.search_time(TIME_PER_MOVE, 1.0);
        if VERBOSE {
            eprintln!("{:?}", mcts.tree_statistics());
        }
        let action = mcts.best_action();
        match action {
            Some(action) => {
                for hero_action in action.actions {
                    println!("{}", hero_action.to_output_string());
                }
            }
            None => break,
        }
        turn += 1;
    }
}

