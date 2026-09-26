const MASTER_GRID_SIZE = 9;
const GRID_SIZE = 3;

const MAX_DEPTH = 2;
const META_WIN_WEIGHT = 10000;
const META_LOSS_WEIGHT = -META_WIN_WEIGHT;
const SINGLE_WIN_WEIGHT = 50;
const SINGLE_LOSS_WEIGHT = -SINGLE_WIN_WEIGHT;
const PARTIAL_META_ROWS_WEIGHT = 200;
const PARTIAL_ROWS_WEIGHT = 10;

interface Move {
    row: number;
    col: number;
    newState: GameState;
}

enum GameResult {
    O_WINNER, X_WINNER, DRAW, ON_GOING
}

function getSubBoard(board: CellValue[][], metaRowIndex: number, metaColIndex: number) {
    return board
        .slice(GRID_SIZE * metaRowIndex, GRID_SIZE * (metaRowIndex + 1))
        .map(row => row.slice(GRID_SIZE * metaColIndex, GRID_SIZE * (metaColIndex + 1)));
}

function getResult(board: CellValue[][]): GameResult {
    for (let i = 0; i < GRID_SIZE; ++i) {
        const row = board[i];
        const rowComplete = row.every(cell => cell !== " " && cell === row[0]);
        if (rowComplete) {
            return row[0] === "O" ? GameResult.O_WINNER : GameResult.X_WINNER;
        }
    }
    for (let i = 0; i < GRID_SIZE; ++i) {
        const column = board.map(row => row[i]);
        const columnComplete = column.every(cell => cell !== " " && cell === column[0]);
        if (columnComplete) {
            return column[0] === "O" ? GameResult.O_WINNER : GameResult.X_WINNER;
        }
    }

    const diag1 = board.map((row, i) => row[i]);
    const diag1Complete = diag1.every(cell => cell !== " " && cell === diag1[0]);
    if (diag1Complete) {
        return diag1[0] === "O" ? GameResult.O_WINNER : GameResult.X_WINNER;
    }

    const diag2 = board.map((row, i) => row[GRID_SIZE - i - 1]);
    const diag2Complete = diag2.every(cell => cell !== " " && cell === diag2[0]);
    if (diag2Complete) {
        return diag2[0] === "O" ? GameResult.O_WINNER : GameResult.X_WINNER;
    }
    if (board.every(row => row.every(cell => cell !== " "))) {
        return GameResult.DRAW;
    }
    return GameResult.ON_GOING;
}

function countPartialRows(board: CellValue[][], player: Player): GameResult {
    const oppositePlayer = { O: "X", X: "O" };
    const isPartialRow = (row, player) => {
        row.sort();
        return row[0] === " " && row.slice(1).every(cell => cell === player);
    };
    const getPartialScore = row => {
        if (isPartialRow(row, player)) {
            return 1;
        }
        if (isPartialRow(row, oppositePlayer[player])) {
            return -1;
        }
        return 0;
    };
    let partialRows = 0;
    for (let i = 0; i < GRID_SIZE; ++i) {
        const row = board[i];
        partialRows += getPartialScore(row);
    }
    for (let i = 0; i < GRID_SIZE; ++i) {
        const column = board.map(row => row[i]);
        partialRows += getPartialScore(column);
    }

    const diag1 = board.map((row, i) => row[i]);
    partialRows += getPartialScore(diag1);

    const diag2 = board.map((row, i) => row[GRID_SIZE - i - 1]);
    partialRows += getPartialScore(diag2);
    return partialRows;
}

function computeMetaBoard(board: CellValue[][]): CellValue[][] {
    return Array.from({ length: GRID_SIZE }, (_, metaRowIndex) => {
        return Array.from({ length: GRID_SIZE }, (_, metaColIndex) => {
            const subBoard = getSubBoard(board, metaRowIndex, metaColIndex);
            const result = getResult(subBoard);
            if (result === GameResult.ON_GOING) {
                return " ";
            } else if (result === GameResult.DRAW) {
                return "-";
            } else if (result === GameResult.O_WINNER) {
                return "O";
            } else if (result === GameResult.X_WINNER) {
                return "X";
            }
        });
    });
}

interface BoardLocation {
    row: number;
    col: number;
}

class GameState {
    constructor(public readonly board: CellValue[][], public readonly metaBoard: CellValue[][], public readonly nextBoard: BoardLocation) {}

    isDone(): boolean {
        return this.metaBoard.every(row => row.every(cell => cell !== " "));
    }

    play(rowIndex: number, colIndex: number, player: Player): GameState {
        const boardCopy = this.board.map(row => [...row]);
        boardCopy[rowIndex][colIndex] = player;
        const metaBoardCopy = computeMetaBoard(boardCopy);
        const metaRowIndex = rowIndex % GRID_SIZE;
        const metaColIndex = colIndex % GRID_SIZE;
        const nextBoard = metaBoardCopy[metaRowIndex][metaColIndex] === " " ? {
            row: metaRowIndex,
            col: metaColIndex
        } : undefined;
        return new GameState(boardCopy, metaBoardCopy, nextBoard);
    }

    getMoves(player: Player): Move[] {
        const moves = [];
        for (let i = 0; i < MASTER_GRID_SIZE; ++i) {
            const metaBoardRow = Math.floor(i / GRID_SIZE);
            if (typeof this.nextBoard !== "undefined" && this.nextBoard.row !== metaBoardRow) {
                continue;
            }
            for (let j = 0; j < MASTER_GRID_SIZE; ++j) {
                const metaBoardCol = Math.floor(j / GRID_SIZE);
                if (typeof this.nextBoard !== "undefined" && this.nextBoard.col !== metaBoardCol) {
                    continue;
                }
                if (this.board[i][j] === " " && this.metaBoard[metaBoardRow][metaBoardCol] === " ") {
                    // Empty cell, that's a new child state
                    moves.push({
                        row: i,
                        col: j,
                        newState: this.play(i, j, player)
                    });
                }
            }
        }
        moves.sort(_ => Math.random() < .5 ? 1 : -1);
        return moves;
    }

    evaluate(player: Player): number {
        const metaResult = getResult(this.metaBoard);
        if (metaResult === GameResult.DRAW) {
            return 0;
        }
        if (metaResult === GameResult.O_WINNER) {
            return player === "O" ? META_WIN_WEIGHT : META_LOSS_WEIGHT;
        }
        if (metaResult === GameResult.X_WINNER) {
            return player === "X" ? META_WIN_WEIGHT : META_LOSS_WEIGHT;
        }
        const metaScore = this.metaBoard
            .map(metaRow => metaRow
                .map(metaCell => {
                    if (metaCell === player) {
                        return SINGLE_WIN_WEIGHT;
                    } else if ((metaCell === "X" && player === "O") || (metaCell === "O" && player === "X")) {
                        return SINGLE_LOSS_WEIGHT;
                    } else {
                        return 0
                    }
                })
                .reduce((a, b) => a + b, 0))
            .reduce((a, b) => a + b, 0);
        const partialMetaRowsScore = countPartialRows(this.metaBoard, player) * PARTIAL_META_ROWS_WEIGHT;

        const partialRowScore = Array.from({ length: GRID_SIZE }, (_, metaRowIndex) => {
            return Array.from({ length: GRID_SIZE }, (_, metaColIndex) => {
                const subBoard = getSubBoard(this.board, metaRowIndex, metaColIndex);
                return countPartialRows(subBoard, player) * PARTIAL_ROWS_WEIGHT;
            }).reduce((a, b) => a + b, 0);
        }).reduce((a, b) => a + b, 0);

        return metaScore + partialMetaRowsScore + partialRowScore;
    }
}

interface Cell {
    x: number;
    y: number;
}

type Player = "X" | "O";
type CellValue = "X" | "O" | " " | "-";

function minimax(state: GameState, depth: number, player: Player, alpha: number, beta: number): number {
    if (state.isDone() || depth >= MAX_DEPTH) {
        return state.evaluate("O");
    }
    if (player === "O") {
        // Maximizing player
        let value = -Infinity;
        for (const move of state.getMoves("O")) {
            const moveScore = minimax(move.newState, depth + 1, "X", alpha, beta);
            if (moveScore > value) {
                value = moveScore;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) {
                break;
            }
        }
        return value - depth;
    } else {
        // Minimizing player
        let value = +Infinity;
        for (const move of state.getMoves("X")) {
            const moveScore = minimax(move.newState, depth + 1, "O", alpha, beta);
            if (moveScore < value) {
                value = moveScore;
            }
            beta = Math.min(beta, value);
            if (beta <= alpha) {
                break;
            }
        }
        return value - depth;
    }
}

const emptyMasterGrid: CellValue[][] = Array.from({ length: MASTER_GRID_SIZE }, _ => Array.from({ length: MASTER_GRID_SIZE }, _ => " "));
const emptyMetaGrid: CellValue[][] = Array.from({ length: GRID_SIZE }, _ => Array.from({ length: GRID_SIZE }, _ => " "));
let currentState = new GameState(emptyMasterGrid, emptyMetaGrid, undefined);

while (true) {
    const [opponentRow, opponentCol]: number[] = readline().split(' ').map(a => parseInt(a));
    const validActionCount: number = parseInt(readline());
    const validActions = Array.from({ length: validActionCount }, _ => readline().split(' ').map(a => parseInt(a)));

    if (opponentRow !== -1 && opponentCol !== -1) {
        // Opponent has played
        currentState = currentState.play(opponentRow, opponentCol, "X");
    }

    let bestMove = undefined;
    let bestScore = undefined;
    const moves = currentState.getMoves("O");
    let alpha = -Infinity;
    let beta = +Infinity;
    for (const move of moves) {
        const score = minimax(move.newState, 0, "X", alpha, beta);
        beta = Math.min(beta, score);
        if (!bestScore || score > bestScore) {
            console.error({ row: move.row, col: move.col, score });
            bestScore = score;
            bestMove = move;
        }
    }

    currentState = currentState.play(bestMove.row, bestMove.col, "O");

    console.log(`${bestMove.row} ${bestMove.col}`);
}
